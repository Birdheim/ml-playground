import { useEffect, useState } from 'react'
import { api } from '../../services/api'
import Eve, { type EveMood } from '../../components/Eve'
import StyledButton from '../../components/Button'
import type {
    DatasetPreviewResponse,
    Hyperparameters,
    ModelInfo,
    ModelParam,
    TrainResponse,
} from '../../types/api'
import './Playground.css'

/** Nicer than showing the raw filename of a builtin dataset. */
function prettyName(name: string): string {
    return name.replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())
}

/** Builds the starting settings for a model straight from its description. */
function defaultParams(model: ModelInfo): Hyperparameters {
    return Object.fromEntries(model.params.map((p) => [p.name, p.default]))
}

/**
 * Decides what Eve says and which pose she wears.
 *
 * She reacts to what actually happened rather than narrating a script, so the
 * poses mean something: cheering is earned, hiding is honest.
 */
function eveReaction(
    status: Status,
    error: string | null,
    preview: DatasetPreviewResponse | null,
    result: TrainResponse | null,
    dataset: string,
): { mood: EveMood; message: string } {
    if (status === 'loading') {
        return { mood: 'neutral', message: 'One moment, I am fetching what I know how to do…' }
    }

    if (status === 'error') {
        return { mood: 'hiding', message: error ?? 'Something went wrong on my end.' }
    }

    if (status === 'training') {
        return { mood: 'neutral', message: 'Learning from the examples… give me a second.' }
    }

    if (result) {
        const { n_correct, n_test } = result
        const share = n_correct / n_test

        if (share === 1) {
            return {
                mood: 'happy',
                message: `Every single one! I got all ${n_test} right. That is suspiciously good — try making the task harder.`,
            }
        }
        if (share >= 0.9) {
            return {
                mood: 'happy',
                message: `I got ${n_correct} of the ${n_test} right, on examples I had never seen before.`,
            }
        }
        if (share >= 0.7) {
            return {
                mood: 'neutral',
                message: `${n_correct} out of ${n_test}. Not bad — have a look at the ones I got wrong below.`,
            }
        }
        return {
            mood: 'hiding',
            message: `I only managed ${n_correct} of ${n_test}. Try giving me different settings and see if I do better.`,
        }
    }

    if (preview) {
        return {
            mood: 'neutral',
            message: `${prettyName(dataset)}: ${preview.n_samples} examples, ${preview.n_features} measurements each, ${preview.n_classes} groups to tell apart. Pick a model and press Train.`,
        }
    }

    return { mood: 'neutral', message: 'Pick some data and a model, then press Train and we will see how I do.' }
}

/** A warning Eve gives before training, when a setting is likely to go badly. */
function settingWarning(modelName: string, params: Hyperparameters): string | null {
    if (modelName === 'knn' && Number(params.n_neighbors) === 1) {
        return 'Asking only one neighbour means a single odd example can decide the answer.'
    }
    if (modelName === 'decision_tree' && Number(params.max_depth) === 1) {
        return 'One question is rarely enough to tell more than two groups apart.'
    }
    return null
}

type Status = 'loading' | 'ready' | 'training' | 'error'

function ParamControl({
    param,
    value,
    onChange,
}: {
    param: ModelParam
    value: number | string
    onChange: (value: number | string) => void
}) {
    return (
        <div className="param">
            <label className="param-label" htmlFor={`param-${param.name}`}>
                {param.label}
                {param.type !== 'choice' && <span className="param-value">{value}</span>}
            </label>

            {param.type === 'choice' ? (
                <select
                    id={`param-${param.name}`}
                    className="param-select"
                    value={String(value)}
                    onChange={(e) => onChange(e.target.value)}
                >
                    {param.options.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </select>
            ) : (
                <input
                    id={`param-${param.name}`}
                    className="param-slider"
                    type="range"
                    min={param.min}
                    max={param.max}
                    step={param.type === 'int' ? 1 : 0.01}
                    value={Number(value)}
                    onChange={(e) => onChange(Number(e.target.value))}
                />
            )}

            <p className="param-help">{param.help}</p>
        </div>
    )
}

function Playground() {
    const [datasets, setDatasets] = useState<string[]>([])
    const [models, setModels] = useState<ModelInfo[]>([])
    const [datasetName, setDatasetName] = useState('')
    const [modelName, setModelName] = useState('')
    const [params, setParams] = useState<Hyperparameters>({})
    const [preview, setPreview] = useState<DatasetPreviewResponse | null>(null)
    const [result, setResult] = useState<TrainResponse | null>(null)
    const [status, setStatus] = useState<Status>('loading')
    const [error, setError] = useState<string | null>(null)

    const selectedModel = models.find((m) => m.name === modelName)

    // Load what the backend offers, and start on the first of each.
    useEffect(() => {
        Promise.all([api.listDatasets(), api.listModels()])
            .then(([datasetResponse, modelResponse]) => {
                setDatasets(datasetResponse.datasets)
                setModels(modelResponse.models)
                setDatasetName(datasetResponse.datasets[0] ?? '')

                const firstModel = modelResponse.models[0]
                if (firstModel) {
                    setModelName(firstModel.name)
                    setParams(defaultParams(firstModel))
                }
                setStatus('ready')
            })
            .catch(() => {
                setError('I cannot reach the server. Is the backend running on port 8000?')
                setStatus('error')
            })
    }, [])

    // Fetch a summary of whichever dataset is selected.
    useEffect(() => {
        if (!datasetName) return

        api.previewDataset(datasetName, 5)
            .then(setPreview)
            .catch(() => setPreview(null))
    }, [datasetName])

    // Changing either the data or the model makes the old score meaningless,
    // so it gets cleared rather than left sitting there next to new settings.
    function handleDatasetChange(name: string) {
        setDatasetName(name)
        setResult(null)
    }

    function handleModelChange(name: string) {
        setModelName(name)
        setResult(null)

        const model = models.find((m) => m.name === name)
        if (model) setParams(defaultParams(model))
    }

    async function handleTrain() {
        setStatus('training')
        setError(null)

        try {
            const response = await api.train({
                model_name: modelName,
                dataset_name: datasetName,
                hyperparameters: params,
            })
            setResult(response)
            setStatus('ready')
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Training failed')
            setStatus('error')
        }
    }

    const eve = eveReaction(status, error, preview, result, datasetName)
    const warning = selectedModel ? settingWarning(modelName, params) : null

    return (
        <div className="playground">
            <header className="playground-intro">
                <Eve mood={eve.mood} message={eve.message} size="lg" />
            </header>

            <div className="playground-grid">
                <section className="panel">
                    <h2 className="panel-title">1. Choose your data</h2>

                    <label className="field-label" htmlFor="dataset">Dataset</label>
                    <select
                        id="dataset"
                        className="param-select"
                        value={datasetName}
                        onChange={(e) => handleDatasetChange(e.target.value)}
                    >
                        {datasets.map((name) => (
                            <option key={name} value={name}>{prettyName(name)}</option>
                        ))}
                    </select>

                    {preview && (
                        <dl className="dataset-facts">
                            <div><dt>Examples</dt><dd>{preview.n_samples}</dd></div>
                            <div><dt>Measurements</dt><dd>{preview.n_features}</dd></div>
                            <div><dt>Groups</dt><dd>{preview.n_classes}</dd></div>
                        </dl>
                    )}

                    <h2 className="panel-title">2. Choose how it learns</h2>

                    <div className="model-cards">
                        {models.map((model) => (
                            <button
                                key={model.name}
                                type="button"
                                className={`model-card ${model.name === modelName ? 'is-selected' : ''}`}
                                onClick={() => handleModelChange(model.name)}
                            >
                                <span className="model-card-label">{model.label}</span>
                                <span className="model-card-blurb">{model.blurb}</span>
                            </button>
                        ))}
                    </div>

                    {selectedModel && (
                        <>
                            <h2 className="panel-title">3. Adjust the settings</h2>
                            {selectedModel.params.map((param) => (
                                <ParamControl
                                    key={param.name}
                                    param={param}
                                    value={params[param.name] ?? param.default}
                                    onChange={(value) =>
                                        setParams((current) => ({ ...current, [param.name]: value }))
                                    }
                                />
                            ))}
                        </>
                    )}

                    {warning && <p className="warning">{warning}</p>}

                    <StyledButton
                        onClick={handleTrain}
                        disabled={status === 'training' || status === 'loading' || !modelName}
                        className="train-button"
                    >
                        {status === 'training' ? 'Training…' : 'Train →'}
                    </StyledButton>
                </section>

                <section className="panel">
                    <h2 className="panel-title">Results</h2>

                    {!result && status !== 'error' && (
                        <p className="results-empty">
                            Nothing trained yet. The model will be tested on examples it was never
                            shown, which is how we find out whether it actually learned anything.
                        </p>
                    )}

                    {status === 'error' && error && <p className="results-error">{error}</p>}

                    {result && (
                        <div className="results">
                            <p className="score">
                                <strong>{result.n_correct}</strong>
                                <span className="score-of"> of {result.n_test}</span>
                            </p>
                            <p className="score-caption">
                                correct, on examples it had never seen before
                                <br />
                                <span className="score-sub">
                                    (it practised on {result.n_train} others)
                                </span>
                            </p>

                            {result.mistakes.length > 0 && (
                                <>
                                    <h3 className="mistakes-title">
                                        {result.n_mistakes === 1
                                            ? 'The one it got wrong'
                                            : `What it got wrong${
                                                  result.n_mistakes > result.mistakes.length
                                                      ? ` (${result.mistakes.length} of ${result.n_mistakes})`
                                                      : ''
                                              }`}
                                    </h3>
                                    <div className="mistakes-scroll">
                                        <table className="mistakes">
                                            <thead>
                                                <tr>
                                                    <th>It guessed</th>
                                                    <th>Really was</th>
                                                    {Object.keys(result.mistakes[0].features).map((f) => (
                                                        <th key={f}>{f}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {result.mistakes.map((mistake, i) => (
                                                    <tr key={i}>
                                                        <td className="guessed">{mistake.predicted}</td>
                                                        <td className="actual">{mistake.actual}</td>
                                                        {Object.values(mistake.features).map((value, j) => (
                                                            <td key={j}>{value}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}

export default Playground
