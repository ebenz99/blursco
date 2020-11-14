import './Grid.scss';
import ProgressiveImage from "react-progressive-image";

function Grid() {
    const myimg = "./imgs/lizard.jpeg"
    return (
        <div className="grid">
            <div className="column">
                <div className="pod">
                    <ProgressiveImage 
                        src={'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png'} 
                        placeholder={process.env.PUBLIC_URL + '/imgs/lizard.jpeg'}>
                        {(src, loading) => (
                            <img style={{ filter: loading ? "blur(5px)" : "blur(0)" }} src={src} alt="projects" />
                        )}
                    </ProgressiveImage>
                </div>
            </div>
        </div>

    );
}

{/* <ProgressiveImage src="/imgs/lizard.jpeg" placeholder="/imgs/lizardcopysmall.jpeg">
{src => <img src={src} alt="an image" />}
</ProgressiveImage> */}

export default Grid;
