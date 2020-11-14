import './Grid.scss';
import ProgressiveImage from "react-progressive-image";
import shuffle from 'lodash/shuffle';

function Grid() {
    const numJPGs = 62;
    const numPNGs = 13;
    const numImgs = numJPGs + numPNGs;
    // const numImgs = 5;
    let imgs = []
    let extension = 'jpg'
    for (let i=0; i < numImgs; i+=1){
        if (i >= numJPGs) {
            extension = 'png'
        }
        imgs.push(
            <div className="pod">
                <ProgressiveImage 
                    src={process.env.PUBLIC_URL + `/photos/${i}.${extension}`} 
                    placeholder={process.env.PUBLIC_URL + `/placeholders/${i}.${extension}`}>
                    {(src, loading) => (
                        <img style={{ filter: loading ? "blur(5px)" : "blur(0)" }} src={src} alt="projects" />
                    )}
                </ProgressiveImage>
            </div>
        )
    }
    let shuffledImgs = shuffle(imgs);
    let third = Math.floor(shuffledImgs.length/3);
    return (
        <div className="grid">
            <div className="column">
                {shuffledImgs.slice(0,third)}
            </div>
            <div className="column">
                {shuffledImgs.slice(third,third*2)}
            </div>
            <div className="column">
                {shuffledImgs.slice(third*2,shuffledImgs.length)}
            </div>
        </div>

    );
}

{/* <ProgressiveImage 
src={'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png'} 
placeholder={process.env.PUBLIC_URL + '/imgs/lizard.jpeg'}>
{(src, loading) => (
    <img style={{ filter: loading ? "blur(5px)" : "blur(0)" }} src={src} alt="projects" />
)}
</ProgressiveImage> */}

export default Grid;
