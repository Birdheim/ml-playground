import './FeatureCard.css'
import { motion } from 'framer-motion'

interface FeatureCardProps {
    text: string
}

function FeatureCard({ text }: FeatureCardProps) {
    return (
        <motion.div className='feature-card'
            variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
        >
            <p>{text}</p>
        </motion.div>
    )
}

export default FeatureCard