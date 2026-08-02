import './ModelDiagram.css'

/**
 * A small picture of how each model makes up its mind.
 *
 * These are diagrams, not decoration: the drawing is meant to carry the
 * explanation so the card doesn't need a paragraph of text next to it. They
 * inherit colour from the surrounding card via currentColor, so they work in
 * either theme and in the selected state without extra rules.
 */

interface ModelDiagramProps {
    model: string
}

function KnnDiagram() {
    return (
        <svg viewBox="0 0 80 60" className="model-diagram" aria-hidden="true">
            {/* the neighbourhood being consulted */}
            <circle cx="40" cy="30" r="19" className="diagram-ring" />
            {/* neighbours inside it */}
            <circle cx="30" cy="22" r="3.5" className="diagram-dot-a" />
            <circle cx="50" cy="24" r="3.5" className="diagram-dot-a" />
            <circle cx="33" cy="41" r="3.5" className="diagram-dot-b" />
            {/* the point being classified */}
            <circle cx="40" cy="31" r="5" className="diagram-subject" />
            {/* the rest of the data, out of range */}
            <circle cx="10" cy="12" r="3.5" className="diagram-dot-b" />
            <circle cx="70" cy="48" r="3.5" className="diagram-dot-a" />
            <circle cx="13" cy="50" r="3.5" className="diagram-dot-b" />
            <circle cx="68" cy="9" r="3.5" className="diagram-dot-a" />
        </svg>
    )
}

function DecisionTreeDiagram() {
    return (
        <svg viewBox="0 0 80 60" className="model-diagram" aria-hidden="true">
            <line x1="40" y1="14" x2="22" y2="32" className="diagram-branch" />
            <line x1="40" y1="14" x2="58" y2="32" className="diagram-branch" />
            <line x1="22" y1="32" x2="12" y2="49" className="diagram-branch" />
            <line x1="22" y1="32" x2="32" y2="49" className="diagram-branch" />
            <line x1="58" y1="32" x2="48" y2="49" className="diagram-branch" />
            <line x1="58" y1="32" x2="68" y2="49" className="diagram-branch" />
            <circle cx="40" cy="12" r="5" className="diagram-subject" />
            <circle cx="22" cy="32" r="4" className="diagram-node" />
            <circle cx="58" cy="32" r="4" className="diagram-node" />
            <circle cx="12" cy="50" r="3.5" className="diagram-dot-a" />
            <circle cx="32" cy="50" r="3.5" className="diagram-dot-b" />
            <circle cx="48" cy="50" r="3.5" className="diagram-dot-a" />
            <circle cx="68" cy="50" r="3.5" className="diagram-dot-b" />
        </svg>
    )
}

function LogisticRegressionDiagram() {
    return (
        <svg viewBox="0 0 80 60" className="model-diagram" aria-hidden="true">
            {/* one straight dividing line, no gap around it */}
            <line x1="8" y1="52" x2="72" y2="8" className="diagram-boundary" />
            <circle cx="20" cy="16" r="3.5" className="diagram-dot-a" />
            <circle cx="33" cy="12" r="3.5" className="diagram-dot-a" />
            <circle cx="45" cy="17" r="3.5" className="diagram-dot-a" />
            <circle cx="30" cy="27" r="3.5" className="diagram-dot-a" />
            <circle cx="36" cy="46" r="3.5" className="diagram-dot-b" />
            <circle cx="50" cy="42" r="3.5" className="diagram-dot-b" />
            <circle cx="62" cy="46" r="3.5" className="diagram-dot-b" />
            <circle cx="52" cy="31" r="3.5" className="diagram-dot-b" />
        </svg>
    )
}

function SvmDiagram() {
    return (
        <svg viewBox="0 0 80 60" className="model-diagram" aria-hidden="true">
            {/* the same split, but drawn with the widest gap it can find */}
            <line x1="4" y1="46" x2="68" y2="2" className="diagram-margin" />
            <line x1="12" y1="58" x2="76" y2="14" className="diagram-margin" />
            <line x1="8" y1="52" x2="72" y2="8" className="diagram-boundary" />
            <circle cx="18" cy="14" r="3.5" className="diagram-dot-a" />
            <circle cx="32" cy="10" r="3.5" className="diagram-dot-a" />
            <circle cx="44" cy="14" r="3.5" className="diagram-dot-a" />
            <circle cx="26" cy="24" r="3.5" className="diagram-dot-a" />
            <circle cx="38" cy="48" r="3.5" className="diagram-dot-b" />
            <circle cx="52" cy="44" r="3.5" className="diagram-dot-b" />
            <circle cx="64" cy="48" r="3.5" className="diagram-dot-b" />
            <circle cx="56" cy="34" r="3.5" className="diagram-dot-b" />
        </svg>
    )
}

const DIAGRAMS: Record<string, () => React.ReactElement> = {
    knn: KnnDiagram,
    decision_tree: DecisionTreeDiagram,
    logistic_regression: LogisticRegressionDiagram,
    svm: SvmDiagram,
}

function ModelDiagram({ model }: ModelDiagramProps) {
    // A model added to the backend catalogue before anyone draws it for still
    // renders a card, just without a picture.
    const Diagram = DIAGRAMS[model]
    return Diagram ? <Diagram /> : null
}

export default ModelDiagram
