import './Skeleton.css'

/**
 * A placeholder in the shape of the thing that is coming.
 *
 * The point is not decoration, it is that the page is the right size before the
 * data arrives. Rendering nothing while a fetch is in flight and then dropping
 * a full experiment in makes the footer leap several hundred pixels; a skeleton
 * of roughly the right height means the layout barely moves when the real
 * content replaces it.
 */

interface SkeletonProps {
    /** CSS width, e.g. "100%" or "12rem". */
    width?: string
    /** CSS height. Defaults to one line of text. */
    height?: string
    /** Pills for text, blocks for panels and images. */
    shape?: 'text' | 'block'
    className?: string
}

function Skeleton({ width = '100%', height, shape = 'text', className = '' }: SkeletonProps) {
    return (
        <span
            className={`skeleton skeleton-${shape} ${className}`}
            style={{ width, height }}
            aria-hidden="true"
        />
    )
}

/** Several lines of fake text, the last one short like a real paragraph. */
export function SkeletonText({ lines = 3 }: { lines?: number }) {
    return (
        <span className="skeleton-lines">
            {Array.from({ length: lines }, (_, i) => (
                <Skeleton key={i} width={i === lines - 1 ? '60%' : '100%'} />
            ))}
        </span>
    )
}

export default Skeleton
