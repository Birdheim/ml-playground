import { useEffect, useMemo, useRef } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import type { DecisionSurfaceResponse } from '../../types/api'
import './DecisionSurface.css'

/**
 * What the model decided, drawn across two of the columns.
 *
 * This is the only place on the site where the *method* is visible rather than
 * just its score. K-Nearest Neighbours carves the plane into islands; a tree
 * cuts it into rectangles; logistic regression can only manage one straight
 * line. Those are the differences the whole playground is about, and no number
 * shows them.
 *
 * Two rendering notes, both load-bearing:
 *
 * - The regions go on a canvas, not into a few thousand SVG rects. The backend
 *   returns a small grid of class ids, it is blitted at native size, and CSS
 *   scales it up.
 * - Scaling is *not* smoothed. A tree's boundary genuinely is a hard-edged
 *   staircase, and interpolating it away would erase the one thing that makes
 *   a tree recognisable.
 */

/**
 * Categorical slots 1-3 of the validated palette, in fixed order — never
 * cycled, and never more than three, which is why the datasets here top out at
 * three classes. Both columns are selected for their own surface rather than
 * being an automatic flip of each other. Verified with the palette validator
 * against this site's own card backgrounds, all pairs: worst CVD ΔE 9.2 light /
 * 9.4 dark, worst normal-vision ΔE 24.0 light / 20.9 dark.
 */
const CLASS_COLORS: Record<'light' | 'dark', string[]> = {
    light: ['#2a78d6', '#eb6834', '#1baf7a'],
    dark: ['#3987e5', '#d95926', '#199e70'],
}

/** How strongly the regions tint the card behind them. The data goes on top,
    so the wash has to stay well back of the points. */
const REGION_ALPHA = { light: 0.28, dark: 0.36 }

/**
 * A column with few distinct values — ticket class, or sex as 0/1 — stacks every
 * point into a handful of lines, hiding how many there are. Past this many
 * distinct values it is a real measurement and gets left alone.
 */
const DISCRETE_MAX_DISTINCT = 12

/** How far a jittered point may stray, as a share of the axis. Enough to show
    density, small enough that nothing crosses a boundary it belongs behind. */
const JITTER = 0.012

function hexToRgb(hex: string): [number, number, number] {
    const n = parseInt(hex.slice(1), 16)
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/**
 * A fixed pseudo-random offset in -1..1 for point `i`.
 *
 * Deterministic on purpose: with Math.random the points would twitch on every
 * re-render, which reads as the data changing when only the model has.
 */
function jitterOffset(i: number, axis: number): number {
    const n = Math.sin((i + 1) * (axis === 0 ? 12.9898 : 78.233)) * 43758.5453
    return (n - Math.floor(n)) * 2 - 1
}

interface DecisionSurfaceProps {
    surface: DecisionSurfaceResponse
    /** Turns a raw column name into the friendly one, when the experiment has one. */
    labelFor: (column: string) => string
    onAxisChange: (axis: 'x' | 'y', column: string) => void
    /** Dims the plot while a new one is being fetched, rather than blanking it. */
    isLoading?: boolean
}

function DecisionSurface({ surface, labelFor, onAxisChange, isLoading }: DecisionSurfaceProps) {
    const { theme } = useTheme()
    const canvasRef = useRef<HTMLCanvasElement>(null)

    const palette = CLASS_COLORS[theme]

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const context = canvas.getContext('2d')
        if (!context) return

        const { resolution, grid } = surface
        const rgb = palette.map(hexToRgb)
        const alpha = Math.round(REGION_ALPHA[theme] * 255)

        const image = context.createImageData(resolution, resolution)
        for (let row = 0; row < resolution; row++) {
            for (let col = 0; col < resolution; col++) {
                // row 0 is y_max, which is also the canvas's top row, so the
                // grid maps straight across with no flip
                const [r, g, b] = rgb[grid[row][col] % rgb.length]
                const offset = (row * resolution + col) * 4
                image.data[offset] = r
                image.data[offset + 1] = g
                image.data[offset + 2] = b
                image.data[offset + 3] = alpha
            }
        }
        context.putImageData(image, 0, 0)
    }, [surface, palette, theme])

    // Decided from the data rather than assumed: the same dataset can have one
    // discrete column beside one continuous one.
    const shape = useMemo(() => {
        const distinct = (pick: (p: { x: number; y: number }) => number) =>
            new Set(surface.points.map(pick)).size
        const nx = distinct((p) => p.x)
        const ny = distinct((p) => p.y)
        return {
            jitterX: nx <= DISCRETE_MAX_DISTINCT ? JITTER : 0,
            jitterY: ny <= DISCRETE_MAX_DISTINCT ? JITTER : 0,
            // A column stored as 0/1 is a yes/no wearing a number. Printing
            // "-0.1 … 1.1" under it says nothing true about sex or survival, so
            // the ends are left off and the column name carries it alone.
            showXValues: nx > 2,
        }
    }, [surface.points])

    const xSpan = surface.x_max - surface.x_min || 1
    const ySpan = surface.y_max - surface.y_min || 1

    return (
        <figure className={`surface ${isLoading ? 'is-loading' : ''}`}>
            {/* identity is never colour alone: every class is named here */}
            <ul className="surface-legend">
                {surface.class_names.map((className, i) => (
                    <li key={className} className="surface-legend-item">
                        <span
                            className="surface-swatch"
                            style={{ backgroundColor: palette[i % palette.length] }}
                        />
                        {className}
                    </li>
                ))}
            </ul>

            <div className="surface-plot">
                <canvas
                    ref={canvasRef}
                    className="surface-regions"
                    width={surface.resolution}
                    height={surface.resolution}
                    role="img"
                    aria-label={`What the model predicts across ${labelFor(surface.x_column)} and ${labelFor(surface.y_column)}`}
                />

                {surface.points.map((point, i) => {
                    const x = (point.x - surface.x_min) / xSpan + jitterOffset(i, 0) * shape.jitterX
                    const y = (point.y - surface.y_min) / ySpan + jitterOffset(i, 1) * shape.jitterY
                    return (
                        <span
                            key={i}
                            className="surface-point"
                            style={{
                                left: `${x * 100}%`,
                                // CSS grows downwards, the axis upwards
                                bottom: `${y * 100}%`,
                                backgroundColor: palette[point.c % palette.length],
                            }}
                        />
                    )
                })}
            </div>

            {shape.showXValues && (
                <div className="surface-axis-values">
                    <span>{format(surface.x_min)}</span>
                    <span>{format(surface.x_max)}</span>
                </div>
            )}

            <div className="surface-axes">
                <label className="surface-axis">
                    <span className="surface-axis-name">Across</span>
                    <select
                        className="param-select"
                        value={surface.x_column}
                        onChange={(e) => onAxisChange('x', e.target.value)}
                    >
                        {surface.columns.map((column) => (
                            <option key={column} value={column} disabled={column === surface.y_column}>
                                {labelFor(column)}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="surface-axis">
                    <span className="surface-axis-name">Up</span>
                    <select
                        className="param-select"
                        value={surface.y_column}
                        onChange={(e) => onAxisChange('y', e.target.value)}
                    >
                        {surface.columns.map((column) => (
                            <option key={column} value={column} disabled={column === surface.x_column}>
                                {labelFor(column)}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <figcaption className="surface-caption">
                The colours are the computer's answer for every point on the plane; the
                dots are the real data. A dot sitting on the wrong colour is one it would
                get wrong.
                {' '}
                <strong>
                    Judged on these two columns alone it gets {surface.n_correct} of{' '}
                    {surface.n_test}
                </strong>
                {' '}— lower than the score above, because here it only gets to see two
                things about each one instead of all of them.
                {surface.n_clipped > 0 && (
                    <>
                        {' '}A few extreme {surface.n_clipped === 1 ? 'value sits' : 'values sit'} far
                        outside this view and {surface.n_clipped === 1 ? 'is' : 'are'} drawn against
                        the edge, so the rest is not squashed into a corner.
                    </>
                )}
            </figcaption>
        </figure>
    )
}

/** Axis ends: whole numbers where the data is whole, one decimal otherwise. */
function format(value: number): string {
    return Math.abs(value) >= 10 ? value.toFixed(0) : value.toFixed(1)
}

export default DecisionSurface
