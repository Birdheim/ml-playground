import { createContext, useContext, useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Eve, { type EveMood } from '../../components/Eve'
import AutoHeight from '../../components/AutoHeight'
import './PlaygroundLayout.css'

/**
 * Eve, and whatever she is currently standing next to.
 *
 * She used to be rendered separately by the gallery and by each experiment,
 * which meant every navigation tore her <img> down and built a new one — she
 * visibly blinked out and back in, in the same spot, as if the page had
 * reloaded. She is meant to be the one continuous thing on the site.
 *
 * So she lives here, in a layout the child routes render inside. React Router
 * keeps a layout mounted while its children change, so now only her words
 * change and she never moves.
 */

interface EveState {
    mood: EveMood
    message: string
}

/** Setter only: pages tell Eve what to say, they never read her state back. */
const EveContext = createContext<((state: EveState) => void) | null>(null)

/**
 * Give Eve something to say. Pass a stable message — this is called from an
 * effect, so a new string on every render would loop.
 */
export function useEveSays(mood: EveMood, message: string) {
    const setEve = useContext(EveContext)

    if (!setEve) {
        throw new Error('useEveSays must be used inside PlaygroundLayout')
    }

    useEffect(() => {
        setEve({ mood, message })
    }, [setEve, mood, message])
}

function PlaygroundLayout() {
    const location = useLocation()
    const [eve, setEve] = useState<EveState>({ mood: 'neutral', message: '' })

    return (
        <EveContext.Provider value={setEve}>
            <div className="playground-layout page-container">
                <aside className="playground-eve">
                    <Eve mood={eve.mood} message={eve.message} bubblePlacement="below" size="lg" />
                </aside>

                {/*
                  AutoHeight sits outside the keyed element on purpose. Keyed
                  content is torn down and rebuilt on every navigation, so an
                  AutoHeight inside it would be rebuilt too and have no previous
                  height to animate from — which is why opening a question still
                  snapped while the stages inside it had already been smoothed.
                  Out here it survives the route change and animates across it.
                */}
                <AutoHeight>
                    <div className="playground-content page-enter" key={location.pathname}>
                        <Outlet />
                    </div>
                </AutoHeight>
            </div>
        </EveContext.Provider>
    )
}

export default PlaygroundLayout
