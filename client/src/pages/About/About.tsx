import { Link } from 'react-router-dom'
import Eve from '../../components/Eve'
import './About.css'

/**
 * Who made this and why.
 *
 * Written from the README rather than invented, and kept to one screen. This
 * is the page a classmate or a stranger clicks first, and until now it was the
 * same "still unpacking" box as /learn — which made two of the three menu
 * items dead ends.
 *
 * Deliberately in the first person and about the motivation rather than the
 * stack: the audience is people with no ML background, and "FastAPI and React"
 * tells them nothing about whether this is for them.
 */

function About() {
    return (
        <div className="about page-enter page-container">
            <header className="about-header rise-in">
                <Eve mood="happy" size="md" />
                <div>
                    <h1 className="about-title">About the Playground</h1>
                    <p className="about-lead">
                        A place to find out what machine learning actually does, by watching a
                        computer try — and fail — at questions you can judge for yourself.
                    </p>
                </div>
            </header>

            <section className="about-section rise-in">
                <h2>Why it exists</h2>
                <p>
                    I spent a long time learning the theory behind machine learning before I
                    ever ran any of it. The maths made sense on paper and still felt like
                    nothing I could point at. So I built this to try it properly — real data,
                    real models, and a result I could argue with.
                </p>
                <p>
                    Then I tried explaining it to my family, and none of the words I had been
                    using survived contact. That is the version you are looking at. There is no
                    maths on this site and nothing to install. You pick a question, guess how
                    well a computer will do, and then watch it try.
                </p>
            </section>

            <section className="about-section rise-in">
                <h2>What it can do today</h2>
                <p>
                    Four questions, each one a real dataset: who survived the Titanic, which
                    species a flower is, which vineyard made a wine, and whether a tumour is
                    harmless. All four are <strong>classification</strong> — sorting things
                    into groups.
                </p>
                <p>
                    You can switch between four different methods and watch the answer change,
                    and see each one draw its own dividing line through the data, which is the
                    clearest way I know to show that they genuinely think differently.
                </p>
                <p>
                    Predicting numbers rather than groups, and neural networks, are not built
                    yet. They are listed in the playground so you can see what is coming.
                </p>
            </section>

            <section className="about-section rise-in">
                <h2>Who made it</h2>
                <p>
                    Herman Bergheim. It is built with FastAPI on the back and React on the
                    front, and the code is public if you want to look at how any of it works.
                </p>
                <ul className="about-links">
                    <li>
                        <a href="https://github.com/Birdheim/ml-playground" target="_blank" rel="noreferrer">
                            The source code on GitHub
                        </a>
                    </li>
                    <li>
                        <a href="mailto:herman.bergheim@gmail.com">herman.bergheim@gmail.com</a>
                    </li>
                </ul>
            </section>

            <p className="about-cta rise-in">
                <Link to="/playground">Go and try it →</Link>
            </p>
        </div>
    )
}

export default About
