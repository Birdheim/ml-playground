import './VisualizationSection.css'
import LossLandscape from '../../../../assets/loss_landscape.jpg'
import { motion } from 'framer-motion'

function VisualizationSection() {
  return (
    <section className="visualization">
      <motion.div
        className="visualization-container"
        initial={{
          opacity: 0
        }}
        whileInView={{
          opacity: 1,
          scale: 1.05,
          transition: {
            duration: 1
          }
        }}
        viewport={{
          once: true,
          amount: 0.4,
        }}
      >
        <div className="visualization-image">
          <div className="contour-placeholder">
            <img src={LossLandscape} alt="Loss Landscape illustration" className="contour-svg" />
          </div>
        </div>
        <div className="visualization-text">
          <h2>Interactive Visualizations</h2>
          <p>
            Explore machine learning concepts through interactive visualizations.
            See how different algorithms work in real-time and understand the
            mathematics behind them with intuitive visual representations.
          </p>
          <p>
            Experiment with parameters and immediately observe how they affect
            model behavior. Perfect for both beginners and experienced practitioners.
          </p>
        </div>
      </motion.div>
    </section>
  )
}

export default VisualizationSection