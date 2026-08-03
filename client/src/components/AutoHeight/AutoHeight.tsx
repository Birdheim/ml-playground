import { motion, useReducedMotion } from 'framer-motion'
import { useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

/**
 * Grows and shrinks to fit whatever is inside it, instead of snapping.
 *
 * Swapping a stage on an experiment moved the footer 205px in a single frame,
 * and Eve's bubble jumped 21px the moment she changed her mind. Both read as
 * the page glitching rather than responding.
 *
 * This animates the real `height` property rather than using framer's `layout`
 * prop. `layout` animates size with a transform, which squashes the text inside
 * while it runs — fine for a box, wrong for a paragraph. Measuring the content
 * and animating to that number costs a ResizeObserver and keeps the text
 * undistorted the whole way.
 *
 * Two things it deliberately does not do:
 *
 * - It never hides anything. If the measurement or the animation fails, the
 *   height falls back to `auto` and the content is simply the size it should be.
 * - It does not switch `overflow` back and forth around the animation. That
 *   needed the completion callback to fire, and a callback that does not fire —
 *   in a backgrounded tab, say — leaves the box clipped for good. It clips
 *   permanently instead, which is safe here: the last stage's own bottom margin
 *   sits inside the clip (overflow makes this a block formatting context, so
 *   that margin no longer collapses out) and leaves far more room than the
 *   card shadows need.
 */

interface AutoHeightProps {
    children: ReactNode
    className?: string
}

/* Long enough to read as movement, short enough not to delay the content. */
const DURATION_S = 0.3

function AutoHeight({ children, className }: AutoHeightProps) {
    const inner = useRef<HTMLDivElement>(null)
    const reduceMotion = useReducedMotion()
    const [height, setHeight] = useState<number | 'auto'>('auto')

    useLayoutEffect(() => {
        const el = inner.current
        if (!el) return

        const measure = () => setHeight(el.getBoundingClientRect().height)
        measure()

        const observer = new ResizeObserver(measure)
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    return (
        <motion.div
            className={className}
            // initial={false}: adopt the first measurement outright rather than
            // animating up from zero when the page opens
            initial={false}
            animate={{ height }}
            transition={{ duration: reduceMotion ? 0 : DURATION_S, ease: 'easeOut' }}
            style={{ overflow: 'hidden' }}
        >
            {/*
              flow-root, so the measurement includes the last child's bottom
              margin. A plain <div> lets that margin collapse straight through
              it: the content measured 500px while the box was really 524px,
              and animating to 500 would have sliced 24px — and the card shadow
              with it — off the bottom.
            */}
            <div ref={inner} style={{ display: 'flow-root' }}>{children}</div>
        </motion.div>
    )
}

export default AutoHeight
