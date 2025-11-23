import { useState } from "react";
import { useNavigate } from "react-router-dom";
import eve from '../../../../assets/eve.svg'
import eveCheer from '../../../../assets/eve_cheer.svg'
import FeatureCard from "../../../../components/FeatureCard";
import './HeroSection.css'
import AutoSizeText from "../../../../components/AutoSizeText";
import StyledButton from "../../../../components/Button";

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
            <div className="hero-wrapper">
                <div className="hero-container">
                    <div className="hero-content">
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
                    </div>
                    <div className="hero-image">
                        <img
                            src={robotImage}
                            alt="ML Robot named Eve"
                            className="robot-image"
                            onMouseEnter={() => setRobotImage(eveCheer)}
                            onMouseLeave={() => setRobotImage(eve)}
                        />
                    </div>
                </div>

                <div className="features-container">
                    {featureText.map((text, index) => (
                        <FeatureCard key={index} text={text} />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default HeroSection