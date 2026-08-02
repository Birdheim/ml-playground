import eveNeutral from '../../assets/eve.svg'
import eveCheer from '../../assets/eve_cheer.svg'
import eveHiding from '../../assets/eve_hiding.svg'
import './Eve.css'

export type EveMood = 'neutral' | 'happy' | 'hiding'

const EVE_POSES: Record<EveMood, string> = {
    neutral: eveNeutral,
    happy: eveCheer,
    hiding: eveHiding,
}

interface EveProps {
    /** Which pose to show. Should reflect what actually happened, not just decoration. */
    mood?: EveMood
    /** What Eve says. Leave empty for no speech bubble. */
    message?: string
    /** Which side the speech bubble sits on. */
    bubbleSide?: 'left' | 'right'
    size?: 'sm' | 'md' | 'lg'
}

function Eve({ mood = 'neutral', message, bubbleSide = 'right', size = 'md' }: EveProps) {
    return (
        <div className={`eve eve-${size} eve-bubble-${bubbleSide}`}>
            <img
                className="eve-image"
                src={EVE_POSES[mood]}
                alt={`Eve, the assistant, looking ${mood}`}
            />
            {message && (
                // keyed on the message so the bubble replays its animation when
                // Eve changes what she is saying
                <p className="eve-bubble" key={message}>
                    {message}
                </p>
            )}
        </div>
    )
}

export default Eve
