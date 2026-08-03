import AutoHeight from '../AutoHeight'
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
    /** Where the bubble sits. 'below' suits a narrow column, beside suits a wide one. */
    bubblePlacement?: 'left' | 'right' | 'below'
    size?: 'sm' | 'md' | 'lg'
}

function Eve({ mood = 'neutral', message, bubblePlacement = 'right', size = 'md' }: EveProps) {
    return (
        <div className={`eve eve-${size} eve-bubble-${bubblePlacement}`}>
            <img
                className="eve-image"
                src={EVE_POSES[mood]}
                alt={`Eve, the assistant, looking ${mood}`}
            />
            {message && (
                // The bubble itself stays mounted so it can grow and shrink
                // between one line and five instead of snapping — it was
                // measured jumping 21px in a single frame. Only the text inside
                // is keyed, so a new line fades in while the box resizes
                // around it.
                <div className="eve-bubble">
                    <AutoHeight>
                        <p className="eve-bubble-text" key={message}>{message}</p>
                    </AutoHeight>
                </div>
            )}
        </div>
    )
}

export default Eve
