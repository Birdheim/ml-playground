import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import Eve, { type EveMood } from '../../components/Eve'
import type { ExperimentSummary } from '../../types/api'
import './Playground.css'

/**
 * The gallery of questions.
 *
 * Cards are questions rather than dataset or algorithm names, because
 * "Regression" tells a newcomer nothing while "How much is this house worth?"
 * tells them everything. Experiments that aren't built yet stay visible but
 * locked, so it's clear more is coming instead of looking like this is all
 * there is.
 */

function Playground() {
    const navigate = useNavigate()
    const [experiments, setExperiments] = useState<ExperimentSummary[]>([])
    const [error, setError] = useState<string | null>(null)
    const [locked, setLocked] = useState<ExperimentSummary | null>(null)

    useEffect(() => {
        api.listExperiments()
            .then((response) => setExperiments(response.experiments))
            .catch(() => setError('I cannot reach the server. Is the backend running on port 8000?'))
    }, [])

    let mood: EveMood = 'neutral'
    let message = 'Pick something you are curious about and we will find out together whether a computer can work it out.'

    if (error) {
        mood = 'hiding'
        message = error
    } else if (locked) {
        mood = 'hiding'
        message = locked.eve_says ?? 'I have not learned that one yet.'
    }

    return (
        <div className="gallery">
            <aside className="gallery-eve">
                <Eve mood={mood} message={message} bubblePlacement="below" size="lg" />
            </aside>

            <div className="gallery-main">
                <h1 className="gallery-title">What would you like to find out?</h1>

                <div className="question-cards">
                    {experiments.map((experiment) => (
                        <button
                            key={experiment.name}
                            type="button"
                            className={`question-card ${experiment.available ? '' : 'is-locked'}`}
                            onClick={() =>
                                experiment.available
                                    ? navigate(`/playground/${experiment.name}`)
                                    : setLocked(experiment)
                            }
                            aria-disabled={!experiment.available}
                        >
                            <span className="question-card-title">{experiment.question}</span>
                            <span className="question-card-teaser">{experiment.teaser}</span>
                            <span className="question-card-cue">
                                {experiment.available ? 'Try it →' : 'Not ready yet'}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default Playground
