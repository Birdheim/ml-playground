import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../services/api'
import Eve, { type EveMood } from '../../components/Eve'
import ModelDiagram from '../../components/ModelDiagram'
import StyledButton from '../../components/Button'
import type {
    DatasetPreviewResponse,
    ExperimentDetail,
    Hyperparameters,
    ModelInfo,
    ModelParam,
    TrainResponse,
} from '../../types/api'
import './Experiment.css'

/**
 * One experiment, walked through a step at a time.
 *
 * The ordering is the whole point. A newcomer sees the data, commits to a
 * guess, and gets a result *before* being shown a single setting. Asking
 * someone to choose between a Support Vector Machine and a Decision Tree
 * before they have any reason to care is how the previous version lost them.
 */

type Stage = 'intro' | 'guess' | 'result' | 'tinker'

/** The backend holds back 20% for testing; sklearn rounds that up. */
function testSetSize(nSamples: number): number {
    return Math.ceil(nSamples * 0.2)
}

function defaultParams(model: ModelInfo): Hyperparameters {
    return Object.fromEntries(model.params.map((p) => [p.name, p.default]))
}

/** "passenger" -> "passengers", good enough for the words we actually use. */
function plural(word: string): string {
    return word.endsWith('s') ? word : `${word}s`
}

function Experiment() {
    const { name = '' } = useParams()

    const [experiment, setExperiment] = useState<ExperimentDetail | null>(null)
    const [preview, setPreview] = useState<DatasetPreviewResponse | null>(null)
    const [models, setModels] = useState<ModelInfo[]>([])
    const [modelName, setModelName] = useState('')
    const [params, setParams] = useState<Hyperparameters>({})
    const [guess, setGuess] = useState<number | null>(null)
    const [result, setResult] = useState<TrainResponse | null>(null)
    const [stage, setStage] = useState<Stage>('intro')
    const [isTraining, setIsTraining] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const selectedModel = models.find((m) => m.name === modelName)

    useEffect(() => {
        let cancelled = false

        api.getExperiment(name)
            .then(async (detail) => {
                const [previewResponse, modelResponse] = await Promise.all([
                    api.previewDataset(detail.dataset, 5),
                    api.listModels(),
                ])
                if (cancelled) return

                setExperiment(detail)
                setPreview(previewResponse)
                setModels(modelResponse.models)

                // Start on the model that tends to behave sensibly without tuning.
                const first =
                    modelResponse.models.find((m) => m.name === 'decision_tree') ??
                    modelResponse.models[0]
                if (first) {
                    setModelName(first.name)
                    setParams(defaultParams(first))
                }
            })
            .catch((e) => {
                if (!cancelled) setError(e instanceof Error ? e.message : 'Could not load this experiment')
            })

        return () => {
            cancelled = true
        }
    }, [name])

    const nTest = preview ? testSetSize(preview.n_samples) : 0
    const nTrain = preview ? preview.n_samples - nTest : 0
    const rowLabel = experiment?.row_label ?? 'example'

    async function runTraining(nextStage: Stage) {
        setIsTraining(true)
        setError(null)

        try {
            const response = await api.train({
                model_name: modelName,
                dataset_name: experiment!.dataset,
                hyperparameters: params,
            })
            setResult(response)
            setStage(nextStage)
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Training failed')
        } finally {
            setIsTraining(false)
        }
    }

    function handleModelChange(next: string) {
        setModelName(next)
        const model = models.find((m) => m.name === next)
        if (model) setParams(defaultParams(model))
    }

    function label(column: string): string {
        return experiment?.column_labels[column] ?? column
    }

    function displayValue(column: string, value: number | string): string {
        const labels = experiment?.value_labels[column]
        return labels?.[String(value)] ?? String(value)
    }

    // ----- What Eve says, per stage -----

    function eveState(): { mood: EveMood; message: string } {
        if (error) return { mood: 'hiding', message: error }
        if (!experiment || !preview) return { mood: 'neutral', message: 'One moment…' }

        if (isTraining) {
            return { mood: 'neutral', message: `Studying ${nTrain} ${plural(rowLabel)}… give me a second.` }
        }

        if (stage === 'intro') {
            return {
                mood: 'neutral',
                message: `Here are five of the ${preview.n_samples} ${plural(rowLabel)}. This is everything I get to see — no names, no story, just these numbers.`,
            }
        }

        if (stage === 'guess') {
            return {
                mood: 'neutral',
                message: `I will study ${nTrain} ${plural(rowLabel)}, then be tested on ${nTest} I have never seen. How many do you think I will get right?`,
            }
        }

        if (result) {
            const { n_correct, n_test } = result
            const share = n_correct / n_test
            const mood: EveMood = share >= 0.85 ? 'happy' : share < 0.6 ? 'hiding' : 'neutral'

            if (guess === null) {
                return { mood, message: `I got ${n_correct} of ${n_test} right.` }
            }

            const gap = n_correct - guess
            if (Math.abs(gap) <= 2) {
                return { mood, message: `You said ${guess}, I got ${n_correct}. You read me almost exactly.` }
            }
            if (gap > 0) {
                return { mood, message: `You said ${guess} — I managed ${n_correct}. Better than you gave me credit for.` }
            }
            return { mood, message: `You said ${guess}, but I only got ${n_correct}. Harder than it looks, isn't it?` }
        }

        return { mood: 'neutral', message: '' }
    }

    const eve = eveState()

    if (error && !experiment) {
        return (
            <div className="experiment">
                <aside className="experiment-eve">
                    <Eve mood="hiding" message={error} bubblePlacement="below" size="lg" />
                </aside>
                <main className="experiment-main">
                    <Link to="/playground" className="back-link">← Back to the questions</Link>
                </main>
            </div>
        )
    }

    if (!experiment || !preview) {
        return (
            <div className="experiment">
                <aside className="experiment-eve">
                    <Eve mood="neutral" message="One moment…" bubblePlacement="below" size="lg" />
                </aside>
                <main className="experiment-main" />
            </div>
        )
    }

    const columns = Object.keys(preview.samples[0] ?? {}).filter((c) => c !== 'target')

    return (
        <div className="experiment">
            <aside className="experiment-eve">
                <Eve mood={eve.mood} message={eve.message} bubblePlacement="below" size="lg" />
            </aside>

            <main className="experiment-main">
                <Link to="/playground" className="back-link">← Back to the questions</Link>
                <h1 className="experiment-question">{experiment.question}</h1>

                {/* ---- Stage 1: look at the data ---- */}
                {stage === 'intro' && (
                    <section className="stage">
                        <p className="stage-lead">{experiment.teaser}</p>

                        <div className="sample-scroll">
                            <table className="sample-table">
                                <thead>
                                    <tr>
                                        {columns.map((c) => <th key={c}>{label(c)}</th>)}
                                        <th className="answer-column">
                                            {experiment.class_names ? 'What happened' : 'Answer'}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {preview.samples.map((row, i) => (
                                        <tr key={i}>
                                            {columns.map((c) => (
                                                <td key={c}>{displayValue(c, row[c])}</td>
                                            ))}
                                            <td className="answer-column">
                                                {experiment.class_names?.[Number(row.target)] ?? row.target}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <p className="stage-note">
                            The last column is the answer. For {nTrain} of them I will show it to the
                            computer; for the other {nTest} I will keep it hidden and see if it can
                            work the answer out on its own.
                        </p>

                        <StyledButton onClick={() => { setGuess(Math.round(nTest * 0.7)); setStage('guess') }}>
                            I've had a look →
                        </StyledButton>
                    </section>
                )}

                {/* ---- Stage 2: commit to a guess ---- */}
                {stage === 'guess' && (
                    <section className="stage">
                        <p className="stage-lead">
                            Before we run it — what's your hunch? Committing to a number makes the
                            answer stick a lot better than just watching.
                        </p>

                        <div className="guess-box">
                            <p className="guess-value">
                                <strong>{guess}</strong>
                                <span className="guess-of"> of {nTest}</span>
                            </p>
                            <input
                                className="guess-slider"
                                type="range"
                                min={0}
                                max={nTest}
                                value={guess ?? 0}
                                onChange={(e) => setGuess(Number(e.target.value))}
                                aria-label={`How many of ${nTest} will it get right`}
                            />
                            <div className="guess-scale">
                                <span>none of them</span>
                                <span>every one</span>
                            </div>
                        </div>

                        <StyledButton onClick={() => runTraining('result')} disabled={isTraining}>
                            {isTraining ? 'Training…' : 'Lock it in and run →'}
                        </StyledButton>
                    </section>
                )}

                {/* ---- Stage 3 & 4: the result, then the controls ---- */}
                {(stage === 'result' || stage === 'tinker') && result && (
                    <section className="stage">
                        <div className="scoreline">
                            <p className="score">
                                <strong>{result.n_correct}</strong>
                                <span className="score-of"> of {result.n_test}</span>
                            </p>
                            <p className="score-caption">
                                correct, on {plural(rowLabel)} it had never seen
                                {guess !== null && <span className="score-guess">you guessed {guess}</span>}
                            </p>
                        </div>

                        {result.mistakes.length > 0 && (
                            <>
                                <h2 className="mistakes-title">
                                    {result.n_mistakes === 1
                                        ? `The one ${rowLabel} it got wrong`
                                        : `Where it went wrong${
                                              result.n_mistakes > result.mistakes.length
                                                  ? ` — ${result.mistakes.length} of ${result.n_mistakes}`
                                                  : ''
                                          }`}
                                </h2>
                                <div className="sample-scroll">
                                    <table className="sample-table">
                                        <thead>
                                            <tr>
                                                <th>It guessed</th>
                                                <th>Really was</th>
                                                {Object.keys(result.mistakes[0].features).map((f) => (
                                                    <th key={f}>{label(f)}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.mistakes.map((mistake, i) => (
                                                <tr key={i}>
                                                    <td className="guessed">{mistake.predicted}</td>
                                                    <td className="actual">{mistake.actual}</td>
                                                    {Object.entries(mistake.features).map(([c, v]) => (
                                                        <td key={c}>{displayValue(c, v)}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}

                        {stage === 'result' && (
                            <StyledButton onClick={() => setStage('tinker')}>
                                Let me try to beat that →
                            </StyledButton>
                        )}
                    </section>
                )}

                {/* ---- Stage 4 only: the controls, finally ---- */}
                {stage === 'tinker' && (
                    <section className="stage">
                        <h2 className="stage-title">Change how it thinks</h2>

                        <div className="model-cards">
                            {models.map((model) => (
                                <button
                                    key={model.name}
                                    type="button"
                                    className={`model-card ${model.name === modelName ? 'is-selected' : ''}`}
                                    onClick={() => handleModelChange(model.name)}
                                >
                                    <ModelDiagram model={model.name} />
                                    <span className="model-card-label">{model.label}</span>
                                </button>
                            ))}
                        </div>

                        {selectedModel && (
                            <>
                                <p className="model-blurb">{selectedModel.blurb}</p>
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

                        {error && <p className="stage-error">{error}</p>}

                        <StyledButton onClick={() => runTraining('tinker')} disabled={isTraining}>
                            {isTraining ? 'Training…' : 'Run it again →'}
                        </StyledButton>
                    </section>
                )}
            </main>
        </div>
    )
}

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
                        <option key={option} value={option}>{option}</option>
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

export default Experiment
