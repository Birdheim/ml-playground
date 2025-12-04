import { useState } from "react";
import { useNavigate } from "react-router-dom";
import eve from '../../../../assets/eve.svg'
import eveCheer from '../../../../assets/eve_cheer.svg'
import FeatureCard from "../../../../components/FeatureCard";
import './HeroSection.css'
import AutoSizeText from "../../../../components/AutoSizeText";
import StyledButton from "../../../../components/Button";
import { motion } from 'framer-motion'

function HeroSection() {
    const navigate = useNavigate()
    const [robotImage, setRobotImage] = useState(eve);

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
                        <p className="hero-subtitle">Welcome to the</p>
                        <AutoSizeText boldText="Machine Learning" regularText="Playground" />
                        {/* TODO: Make button component */}
                        <StyledButton
                            variant="hero"
                            onMouseEnter={() => setRobotImage(eveCheer)}
                            onMouseLeave={() => setRobotImage(eve)}
                            onClick={() => navigate('/playground')}
                        >
                            Go to Playground →
                        </StyledButton>
                    </motion.div>
                    <motion.div className="hero-image"
                        variants={{
                            hidden: { opacity: 0 }, show: {
                                opacity: 1,
                                scale: 1.1,
                                transition: {
                                    duration: 0.5
                                }
                            }
                        }}
                    >
                        <img
                            src={robotImage}
                            alt="ML Robot named Eve"
                            className="robot-image"
                            onMouseEnter={() => setRobotImage(eveCheer)}
                            onMouseLeave={() => setRobotImage(eve)}
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