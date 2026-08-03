import './ResultDots.css'

/**
 * The result as a picture: one dot per example the computer was tested on.
 *
 * A score of "103 of 143" is a fact you read; a block of dots with the wrong
 * ones in red is a result you *see* — you can tell at a glance whether the
 * model was nearly right or barely trying, without doing any arithmetic.
 *
 * The dots are in test order and come straight from the backend, so every red
 * one is a real row the model got wrong rather than a decorative approximation.
 */

interface ResultDotsProps {
    /** One entry per test example, true where the computer was right. */
    outcomes: boolean[]
    /** What one row is — "passenger", "flower" — for the caption. */
    rowLabel: string
}

/* Long enough to read as a sweep, short enough not to make anyone wait. */
const REVEAL_MS = 700

function ResultDots({ outcomes, rowLabel }: ResultDotsProps) {
    const nWrong = outcomes.filter((correct) => !correct).length

    return (
        <figure className="result-dots">
            <div
                className="result-dots-grid"
                role="img"
                aria-label={`${outcomes.length - nWrong} of ${outcomes.length} correct, shown as one dot per ${rowLabel}`}
            >
                {outcomes.map((correct, i) => (
                    <span
                        key={i}
                        className={`result-dot ${correct ? 'is-correct' : 'is-wrong'}`}
                        // spread the reveal across the whole block however many
                        // dots there are, so 30 flowers and 143 passengers take
                        // the same time to land
                        style={{ animationDelay: `${(i / outcomes.length) * REVEAL_MS}ms` }}
                    />
                ))}
            </div>

            <figcaption className="result-dots-caption">
                Each dot is one {rowLabel} it was tested on.{' '}
                <span className="result-dots-key is-wrong">The red ones</span> are the{' '}
                {nWrong} it got wrong.
            </figcaption>
        </figure>
    )
}

export default ResultDots
