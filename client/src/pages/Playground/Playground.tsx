import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../services/api'
import { type EveMood } from '../../components/Eve'
import { useEveSays } from './PlaygroundLayout'
import Skeleton, { SkeletonText } from '../../components/Skeleton'
import type { ExperimentSummary } from '../../types/api'
import './Playground.css'

/**
 * How many placeholder cards to show while the catalogue loads. Matching the
 * real count keeps the page the right height from the first paint, so nothing
 * below it moves when the questions arrive.
 */
const PLACEHOLDER_CARDS = 6

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

    useEveSays(mood, message)

    return (
        <div className="gallery-main">
            <h1 className="gallery-title">What would you like to find out?</h1>

            <div className="question-cards">
                {experiments.length === 0 && !error &&
                    Array.from({ length: PLACEHOLDER_CARDS }, (_, i) => (
                        <div key={i} className="question-card is-placeholder">
                            <Skeleton width="80%" height="1.4rem" />
                            <SkeletonText lines={3} />
                        </div>
                    ))}

                {/* rise-in rather than a scroll reveal: these are the point of
                    the page, so they animate on top of being visible instead of
                    depending on an animation to become visible at all */}
                {experiments.map((experiment) => (
                    <button
                        key={experiment.name}
                        type="button"
                        className={`question-card rise-in ${experiment.available ? '' : 'is-locked'}`}
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
    )
}

export default Playground
