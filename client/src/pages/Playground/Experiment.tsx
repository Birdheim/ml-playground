import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../../services/api'
import { type EveMood } from '../../components/Eve'
import { useEveSays } from './PlaygroundLayout'
import DecisionSurface from '../../components/DecisionSurface'
import ModelDiagram from '../../components/ModelDiagram'
import ResultDots from '../../components/ResultDots'
import Skeleton, { SkeletonText } from '../../components/Skeleton'
import StyledButton from '../../components/Button'
import type {
    DatasetPreviewResponse,
    DecisionSurfaceResponse,
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
 * Two things carry the whole page:
 *
 * 1. **Order.** A newcomer sees the data, commits to a guess, and gets a
 *    result *before* being shown a single setting. Asking someone to choose
 *    between a Support Vector Machine and a Decision Tree before they have any
 *    reason to care is how the previous version lost them.
 *
 * 2. **Nothing is thrown away.** Every attempt stays in `runs`, the data stays
 *    reachable, and the score is compared to the attempt before it. A stage
 *    that erases the previous one leaves four unrelated screens; keeping them
 *    makes it one story, which is the point of the button that says "beat that".
 */

type Stage = 'intro' | 'guess' | 'result' | 'tinker'

interface Run {
    /**
     * Captured at run time rather than read from the picker, so the history
     * still says "Decision Tree" after the user has moved on to something else.
     */
    modelLabel: string
    result: TrainResponse
}

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

/**
 * How long to sit on a settings change before redrawing the picture.
 *
 * Dragging a slider fires continuously; without this every intermediate value
 * would become a request. Short enough that letting go feels immediate.
 */
const SURFACE_DEBOUNCE_MS = 250

function Experiment() {
    const { name = '' } = useParams()

    const [experiment, setExperiment] = useState<ExperimentDetail | null>(null)
    const [preview, setPreview] = useState<DatasetPreviewResponse | null>(null)
    const [models, setModels] = useState<ModelInfo[]>([])
    const [modelName, setModelName] = useState('')
    const [params, setParams] = useState<Hyperparameters>({})
    const [guess, setGuess] = useState<number | null>(null)
    const [runs, setRuns] = useState<Run[]>([])
    const [stage, setStage] = useState<Stage>('intro')
    const [isTraining, setIsTraining] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const [surface, setSurface] = useState<DecisionSurfaceResponse | null>(null)
    const [isDrawing, setIsDrawing] = useState(false)
    // Undefined until the backend has picked for us; kept across model changes
    // so switching from a tree to KNN redraws the same two columns and the
    // comparison is honest.
    const [axes, setAxes] = useState<{ x?: string; y?: string }>({})

    const scoreRef = useRef<HTMLDivElement>(null)

    const selectedModel = models.find((m) => m.name === modelName)
    const latest = runs.length > 0 ? runs[runs.length - 1] : null
    const previous = runs.length > 1 ? runs[runs.length - 2] : null

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

    // On a re-run the score sits far above the settings that were just clicked.
    // Without this the number changes off-screen and it looks like the button
    // did nothing at all.
    useEffect(() => {
        if (runs.length > 1) {
            scoreRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
    }, [runs.length])

    // The picture follows the settings live rather than waiting for "Run it
    // again" — swapping a tree for KNN and watching the boundary go from
    // rectangles to islands is the fastest way to see that the models differ,
    // and making someone press a button first breaks the connection.
    useEffect(() => {
        if (stage !== 'tinker' || !experiment || !modelName) return

        let cancelled = false
        setIsDrawing(true)

        const timer = setTimeout(() => {
            api.decisionSurface({
                model_name: modelName,
                dataset_name: experiment.dataset,
                hyperparameters: params,
                x_column: axes.x,
                y_column: axes.y,
            })
                .then((response) => {
                    if (cancelled) return
                    setSurface(response)
                    // Same reference when nothing moved, so adopting the
                    // backend's automatic choice doesn't re-trigger this effect
                    setAxes((current) =>
                        current.x === response.x_column && current.y === response.y_column
                            ? current
                            : { x: response.x_column, y: response.y_column }
                    )
                })
                // A failed drawing is not worth interrupting the page for: the
                // score is the result, this is the illustration beside it.
                .catch(() => { if (!cancelled) setSurface(null) })
                .finally(() => { if (!cancelled) setIsDrawing(false) })
        }, SURFACE_DEBOUNCE_MS)

        return () => {
            cancelled = true
            clearTimeout(timer)
        }
    }, [stage, experiment, modelName, params, axes.x, axes.y])

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
            setRuns((current) => [
                ...current,
                { modelLabel: selectedModel?.label ?? modelName, result: response },
            ])
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

    function handleAxisChange(axis: 'x' | 'y', column: string) {
        setAxes((current) => ({ ...current, [axis]: column }))
    }

    function label(column: string): string {
        return experiment?.column_labels[column] ?? column
    }

    function displayValue(column: string, value: number | string): string {
        const labels = experiment?.value_labels[column]
        return labels?.[String(value)] ?? String(value)
    }

    // ----- What Eve says, per stage -----
    //
    // Eve is the guide, never the thing being trained. She says "it" about the
    // computer, because the moment the user can choose between four models,
    // an Eve who says "I will study the passengers" is claiming to be all four
    // of them at once — and the whole lesson is that they are different.

    function eveState(): { mood: EveMood; message: string } {
        if (error) return { mood: 'hiding', message: error }
        if (!experiment || !preview) return { mood: 'neutral', message: 'One moment…' }

        if (isTraining) {
            return {
                mood: 'neutral',
                message: `It's studying ${nTrain} ${plural(rowLabel)}… give me a second.`,
            }
        }

        if (stage === 'intro') {
            return {
                mood: 'neutral',
                message: `Here are five of the ${preview.n_samples} ${plural(rowLabel)}. This is everything the computer gets to see — no names, no story, just these numbers.`,
            }
        }

        if (stage === 'guess') {
            return {
                mood: 'neutral',
                message: `It will study ${nTrain} ${plural(rowLabel)}, then face ${nTest} it has never seen. How many do you think it will get right?`,
            }
        }

        if (latest) {
            const { n_correct, n_test } = latest.result

            // First result: the comparison that means something is their guess.
            if (!previous) {
                const share = n_correct / n_test
                const mood: EveMood = share >= 0.85 ? 'happy' : share < 0.6 ? 'hiding' : 'neutral'

                if (guess === null) {
                    return { mood, message: `It got ${n_correct} of ${n_test} right.` }
                }

                const gap = n_correct - guess
                if (Math.abs(gap) <= 2) {
                    return { mood, message: `You said ${guess}, it got ${n_correct}. You read it almost exactly.` }
                }
                if (gap > 0) {
                    return { mood, message: `You said ${guess} — it managed ${n_correct}. Better than you gave it credit for.` }
                }
                return { mood, message: `You said ${guess}, but it only got ${n_correct}. Harder than it looks, isn't it?` }
            }

            // After that they are experimenting rather than guessing, so the
            // comparison that means something is the attempt before this one.
            const change = n_correct - previous.result.n_correct

            if (change > 0) {
                return {
                    mood: 'happy',
                    message: `${latest.modelLabel} got ${n_correct} — ${change} more than last time. That change paid off.`,
                }
            }
            if (change < 0) {
                return {
                    mood: 'hiding',
                    message: `${latest.modelLabel} got ${n_correct}, ${-change} fewer than last time. Not every change is an improvement.`,
                }
            }
            return {
                mood: 'neutral',
                message: `Still ${n_correct}. That made no difference at all — which is worth knowing too.`,
            }
        }

        return { mood: 'neutral', message: '' }
    }

    const eve = eveState()

    // Eve lives in the layout now, so every branch below just tells her what to
    // say. She stays on screen and in place while this page loads and changes.
    useEveSays(eve.mood, eve.message)

    if (error && !experiment) {
        return (
            <main className="experiment-main">
                <Link to="/playground" className="back-link">← Back to the questions</Link>
            </main>
        )
    }

    // An empty <main> here used to let the footer sit just under the navbar and
    // then leap down the page when the experiment arrived. The skeleton is
    // shaped like the intro stage — a question, a table, a button — so the
    // layout is already close to right before anything loads.
    if (!experiment || !preview) {
        return (
            <main className="experiment-main">
                <Link to="/playground" className="back-link">← Back to the questions</Link>
                <Skeleton width="60%" height="2.25rem" className="experiment-title-skeleton" />
                <section className="stage">
                    <SkeletonText lines={2} />
                    <Skeleton shape="block" height="12rem" className="stage-skeleton-table" />
                    <Skeleton shape="block" width="10rem" height="2.75rem" />
                </section>
            </main>
        )
    }

    const columns = Object.keys(preview.samples[0] ?? {}).filter((c) => c !== 'target')

    /** The five rows, shown in full at the intro and on demand after that. */
    const sampleTable = (
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
    )

    return (
        <main className="experiment-main">
            <Link to="/playground" className="back-link">← Back to the questions</Link>
            <h1 className="experiment-question">{experiment.question}</h1>

            {/* ---- Stage 1: look at the data ---- */}
            {stage === 'intro' && (
                <section className="stage">
                    <p className="stage-lead">{experiment.teaser}</p>

                    {sampleTable}

                    <p className="stage-note">
                        The last column is the answer. For {nTrain} of them the computer gets
                        to see it; for the other {nTest} it stays hidden, and we find out
                        whether the computer can work it out on its own.
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

                    {/* the data is what the guess is about, so it stays one
                        click away rather than being replaced by the slider */}
                    <details className="recall">
                        <summary className="recall-summary">Show me the data again</summary>
                        {sampleTable}
                    </details>

                    <StyledButton onClick={() => runTraining('result')} disabled={isTraining}>
                        {isTraining ? 'Training…' : 'Lock it in and run →'}
                    </StyledButton>
                </section>
            )}

            {/* ---- Stage 3 & 4: the result, then the controls ---- */}
            {(stage === 'result' || stage === 'tinker') && latest && (
                <section className="stage">
                    <div className="scoreline" ref={scoreRef}>
                        <p className="score">
                            <strong>{latest.result.n_correct}</strong>
                            <span className="score-of"> of {latest.result.n_test}</span>
                        </p>
                        <p className="score-caption">
                            correct, on {plural(rowLabel)} it had never seen
                            {previous ? (
                                <span className="score-guess">
                                    {latest.modelLabel}, last time {previous.result.n_correct}
                                </span>
                            ) : (
                                guess !== null && <span className="score-guess">you guessed {guess}</span>
                            )}
                        </p>
                    </div>

                    <ResultDots outcomes={latest.result.outcomes} rowLabel={rowLabel} />

                    {/* "beat that" only means something if "that" is still on
                        screen, so every attempt stays listed */}
                    {runs.length > 1 && (
                        <table className="run-history">
                            <caption className="run-history-caption">Every attempt so far</caption>
                            <tbody>
                                {runs.map((run, i) => (
                                    <tr key={i} className={i === runs.length - 1 ? 'is-latest' : ''}>
                                        <td className="run-history-n">{i + 1}</td>
                                        <td className="run-history-model">{run.modelLabel}</td>
                                        <td className="run-history-score">
                                            {run.result.n_correct} of {run.result.n_test}
                                        </td>
                                        <td className="run-history-delta">
                                            {i === 0
                                                ? ''
                                                : formatDelta(run.result.n_correct - runs[i - 1].result.n_correct)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {latest.result.mistakes.length > 0 && (
                        <>
                            <h2 className="mistakes-title">
                                {latest.result.n_mistakes === 1
                                    ? `The one ${rowLabel} it got wrong`
                                    : `Where it went wrong${
                                          latest.result.n_mistakes > latest.result.mistakes.length
                                              ? ` — ${latest.result.mistakes.length} of ${latest.result.n_mistakes}`
                                              : ''
                                      }`}
                            </h2>
                            <div className="sample-scroll">
                                <table className="sample-table">
                                    <thead>
                                        <tr>
                                            <th>It guessed</th>
                                            <th>Really was</th>
                                            {Object.keys(latest.result.mistakes[0].features).map((f) => (
                                                <th key={f}>{label(f)}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {latest.result.mistakes.map((mistake, i) => (
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

                    {selectedModel && <p className="model-blurb">{selectedModel.blurb}</p>}

                    {/* sits between the model cards and the settings, so both
                        of the things that change it are next to what changed */}
                    {surface ? (
                        <DecisionSurface
                            surface={surface}
                            labelFor={label}
                            onAxisChange={handleAxisChange}
                            isLoading={isDrawing}
                        />
                    ) : (
                        // Shaped part for part against the real component —
                        // legend, plot, axis pickers, caption — because a
                        // placeholder that is merely present but the wrong
                        // height still shoves the settings down when the
                        // picture lands. Measured at 688px against its 700.
                        <div className="surface-placeholder">
                            <Skeleton width="12rem" className="surface-placeholder-legend" />
                            <Skeleton shape="block" className="surface-placeholder-plot" />
                            <Skeleton shape="block" className="surface-placeholder-axes" />
                            <div className="surface-placeholder-caption">
                                <SkeletonText lines={5} />
                            </div>
                        </div>
                    )}

                    {selectedModel && (
                        <>
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
    )
}

/** "+4" / "−7" / "no change", for the history column. */
function formatDelta(change: number): string {
    if (change > 0) return `+${change}`
    if (change < 0) return `−${-change}`
    return 'no change'
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
