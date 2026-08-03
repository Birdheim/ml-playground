import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Eve, { type EveMood } from "../../../../components/Eve";
import FeatureCard from "../../../../components/FeatureCard";
import './HeroSection.css'
import AutoSizeText from "../../../../components/AutoSizeText";
import StyledButton from "../../../../components/Button";
import { motion } from 'framer-motion'

function HeroSection() {
    const navigate = useNavigate()
    const [mood, setMood] = useState<EveMood>('neutral');

    const featureText = [
        "Heard about Machine Learning, but still not quite sure what it's all about?",
        "Want a quick and easy way of understanding key concepts?",
        "Curious to try ML without needing any math or coding background?"
    ]

    return (
        <section className="hero">
            <motion.div
                className="hero-wrapper"
                variants={{
                    hidden: { opacity: 0 }, show: {
                        opacity: 1,
                        transition: {
                            delay: 0.2,
                            staggerChildren: 0.2,
                        }
                    }
                }}
                initial="hidden"
                animate="show"
            >
                <motion.div className="hero-container"
                    variants={{
                        hidden: { opacity: 0 }, show: {
                            opacity: 1,
                            transition: {
                                delay: 0.2,
                                staggerChildren: 0.2,
                            }
                        }
                    }}
                >
                    <motion.div className="hero-content"
                        variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}>
                        <div className="hero-header-text">
                            <p className="hero-subtitle">Welcome to the</p>
                            <AutoSizeText boldText="Machine Learning" regularText="Playground" />
                        </div>
                        <StyledButton
                            variant="hero"
                            onMouseEnter={() => setMood('happy')}
                            onMouseLeave={() => setMood('neutral')}
                            onClick={() => navigate('/playground')}
                        >
                            Go to Playground →
                        </StyledButton>
                    </motion.div>
                    {/* the same Eve component the playground uses, so she
                        arrives already introduced rather than turning out to
                        have a voice only after you click through */}
                    <motion.div className="hero-image"
                        onMouseEnter={() => setMood('happy')}
                        onMouseLeave={() => setMood('neutral')}
                        variants={{
                            hidden: { opacity: 0 }, show: {
                                opacity: 1,
                                transition: {
                                    duration: 0.5
                                }
                            }
                        }}
                    >
                        <Eve
                            mood={mood}
                            size="lg"
                            bubblePlacement="below"
                            message="Hi, I'm Eve. Pick something you're curious about and we'll find out together whether a computer can work it out — you get to guess first."
                        />
                    </motion.div>
                </motion.div>

                <motion.div className="features-container"
                    variants={{
                        hidden: { opacity: 0 }, show: {
                            opacity: 1,
                            transition: {
                                delay: 0.2,
                                staggerChildren: 0.2,
                            }
                        }
                    }}
                >
                    {featureText.map((text, index) => (
                        <FeatureCard key={index} text={text} />
                    ))}
                </motion.div>
            </motion.div>
        </section>
    )
}

export default HeroSection