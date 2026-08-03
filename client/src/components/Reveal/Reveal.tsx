import { motion, useReducedMotion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * One entrance animation, used everywhere so the whole site moves the same way.
 *
 * The landing page had a single reveal wrapped around a whole section, so an
 * entire block — heading, three steps, four diagrams — arrived in one lump.
 * That is what "too much is shown on scroll" was: not too much animation, too
 * much *at once*. Wrapping the individual items instead and passing `index`
 * lets them arrive in sequence, which reads as deliberate rather than as the
 * page catching up with you.
 *
 * Deliberately small: twelve pixels of travel and 0.4s. A reveal you notice is
 * a reveal that is too big.
 */

interface RevealProps {
    children: ReactNode
    /** Position within a group. Each step adds a small delay. */
    index?: number
    className?: string
    /**
     * Which element to render. Needed because a list item still has to be an
     * <li> — wrapping one in a <div> would put invalid markup inside the <ol>.
     */
    as?: 'div' | 'li' | 'section'
    /**
     * When to play.
     *
     * `'mount'` for anything that is on screen when the page opens, and for the
     * app's own pages. `'view'` waits for the element to be scrolled to, which
     * suits a long landing page but is the wrong default for real content: it
     * starts at zero opacity and only becomes visible once a scroll observer
     * fires, so anything that stops that observer firing leaves the page
     * looking empty. Content you have to scroll to see is worth that risk;
     * the questions on the playground are not.
     */
    trigger?: 'mount' | 'view'
}

/** Enough to read as a sequence, short enough that the last item is not a wait. */
const STAGGER_S = 0.07

const HIDDEN = { opacity: 0, y: 12 }
const SHOWN = { opacity: 1, y: 0 }

function Reveal({ children, index = 0, className, as = 'div', trigger = 'mount' }: RevealProps) {
    const reduceMotion = useReducedMotion()
    const Tag = as
    const Motion = motion[as]

    // Someone who has asked for less movement still gets the content, just
    // without it sliding in. Same element either way, so layout is identical.
    if (reduceMotion) {
        return <Tag className={className}>{children}</Tag>
    }

    const timing = { duration: 0.4, ease: 'easeOut', delay: index * STAGGER_S } as const

    if (trigger === 'view') {
        return (
            <Motion
                className={className}
                initial={HIDDEN}
                whileInView={SHOWN}
                transition={timing}
                // once: the page should settle down, not re-animate every time
                // you scroll back up past something you have already read
                viewport={{ once: true, amount: 0.3 }}
            >
                {children}
            </Motion>
        )
    }

    return (
        <Motion className={className} initial={HIDDEN} animate={SHOWN} transition={timing}>
            {children}
        </Motion>
    )
}

export default Reveal
