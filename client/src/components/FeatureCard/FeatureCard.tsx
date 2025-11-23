import './FeatureCard.css'

interface FeatureCardProps {
    text: string
}

function FeatureCard({ text }: FeatureCardProps) {
    return (
        <div className='feature-card'>
            <p>{text}</p>
        </div>
    )
}

export default FeatureCard