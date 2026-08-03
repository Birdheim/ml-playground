import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import ModelDiagram from '../../../../components/ModelDiagram'
import { api } from '../../../../services/api'
import type { ModelInfo } from '../../../../types/api'
import './HowItWorksSection.css'

/**
 * What actually happens if you click through, in the order it happens.
 *
 * This replaced a section headed "Interactive Visualizations" which promised
 * real-time algorithms and the mathematics behind them, over a stock contour
 * image, and closed with "perfect for both beginners and experienced
 * practitioners" — on a site built for people who have never studied any of
 * this. Every line here describes something the playground genuinely does.
 */

const STEPS = [
    {
        title: 'Look at the data',
        body: 'Five real rows, and that is everything the computer gets to see. No names, no story, just numbers.',
    },
    {
        title: 'Guess before it runs',
        body: 'Out of the ones it has never seen, how many will it get right? Committing to a number makes the answer stick far better than watching.',
    },
    {
        title: 'See where it went wrong',
        body: 'Not a percentage. The actual rows it got wrong, and a picture of how it made its mind up.',
    },
]

function HowItWorksSection() {
    // Fetched rather than listed here, so a model added to the backend
    // catalogue turns up on this page too. The section simply leaves the strip
    // out if the backend is not answering — the steps above are the point.
    const [models, setModels] = useState<ModelInfo[]>([])

    useEffect(() => {
        let cancelled = false
        api.listModels()
            .then((response) => { if (!cancelled) setModels(response.models) })
            .catch(() => { /* no strip, no problem */ })
        return () => { cancelled = true }
    }, [])

    return (
        <section className="how">
            <motion.div
                className="how-container"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0, transition: { duration: 0.5 } }}
                viewport={{ once: true, amount: 0.3 }}
            >
                <h2 className="how-title">How it works</h2>

                <ol className="how-steps">
                    {STEPS.map((step, i) => (
                        <li key={step.title} className="how-step">
                            <span className="how-step-number">{i + 1}</span>
                            <h3 className="how-step-title">{step.title}</h3>
                            <p className="how-step-body">{step.body}</p>
                        </li>
                    ))}
                </ol>

                {models.length > 0 && (
                    <div className="how-methods">
                        <p className="how-methods-lead">
                            There is more than one way for a computer to work something out.
                            You can switch between them and watch both the answer and the
                            reasoning change.
                        </p>
                        <ul className="how-method-list">
                            {models.map((model) => (
                                <li key={model.name} className="how-method">
                                    <ModelDiagram model={model.name} />
                                    <span className="how-method-label">{model.label}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </motion.div>
        </section>
    )
}

export default HowItWorksSection
