import './Grid.scss';
import ProgressiveImage from "react-progressive-image";
import shuffle from 'lodash/shuffle';

function Grid() {
    //hard-coded
    const firstJPGRun = 62;
    const firstPNGRun = 13;
    const secondJPGRun = 25;
    const numImgs = firstJPGRun + firstPNGRun + secondJPGRun;

    //list of vertical-orientation image indexes (i took "5" out last time, can replace back if uneven)
    const vImgs = [7,8,9,12,15,25,28,31,36,40,42,46,48,52,53,54,59,62,63,66,67,68,70,71,72,74,77,83,85,86,89,98,99];
    const vImgsSet = new Set(vImgs)

    //list of all image nums with vertical images first
    let imgNums = vImgs;
    for(let j = 0; j < numImgs; j+=1){
        if (!vImgsSet.has(j)) {
            imgNums.push(j)
        }
    }

    // three-column display for desktop
    let imgs = [[],[],[]]
    let extension;
    for (let i=0; i < numImgs; i+=1){
        if ((imgNums[i] >= firstJPGRun) && (imgNums[i] < firstJPGRun + firstPNGRun)) {
            extension = 'png';
        }
        else {
            extension = 'jpg';
        }
        imgs[i%3].push(
            <div className="pod" key={i}> 
                <ProgressiveImage
                    src={`https://ethansitephotos.s3.amazonaws.com/${imgNums[i]}.${extension}`} 
                    placeholder={process.env.PUBLIC_URL + `/placeholders/${imgNums[i]}.${extension}`}>
                    {(src, loading) => (
                        <img style={{ filter: loading ? "blur(5px)" : "blur(0)" }} src={src} alt="projects" />
                    )}
                </ProgressiveImage>
            </div>
        )
    }

    // shuffle the image order in each column
    const shuffledImgs = imgs.map(x => shuffle(x))
    return (
        <div className="grid">
            <div className="column">
                {shuffledImgs[0]}
            </div>
            <div className="column">
                {shuffledImgs[1]}
            </div>
            <div className="column">
                {shuffledImgs[2]}
            </div>
        </div>
    );
}

export default Grid;
