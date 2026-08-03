import MovingBox from '../../assets/MovingBox.png'
import './WeAreUnpacking.css'

function WeAreUnpacking() {
    return(
        <>
            <div className='wrapper page-enter'>
                <span className='illustration'>
                    <img className='box' src={MovingBox} alt="" />
                    <div>Eve is still unpacking all the latest features</div>
                    <div>Come back soon!</div>
                </span>

            </div>
        </>
    )
}

export default WeAreUnpacking