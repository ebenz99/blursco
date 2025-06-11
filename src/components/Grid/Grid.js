import './Grid.scss';
import shuffle from 'lodash/shuffle';
import { useState, useEffect, useRef } from 'react';

// Simple progressive image component
function SimpleProgressiveImage({ fullSrc, placeholderSrc, alt }) {
    const [currentSrc, setCurrentSrc] = useState(placeholderSrc);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const img = new Image();
        img.onload = () => {
            setCurrentSrc(fullSrc);
            setIsLoading(false);
        };
        img.src = fullSrc;
    }, [fullSrc]);

    return (
        <img
            src={currentSrc}
            alt={alt}
            style={{
                filter: isLoading ? "blur(5px)" : "blur(0)",
                transition: "filter 0.3s ease",
                width: '100%',
                height: 'auto'
            }}
        />
    );
}

function Grid() {
    const [manifest, setManifest] = useState(null);
    const [visibleImages, setVisibleImages] = useState([]);
    const [loadedCount, setLoadedCount] = useState(0);
    const observerRef = useRef(null);
    const BATCH_SIZE = 6;

    // Load manifest on component mount
    useEffect(() => {
        // Load manifest from public folder or API
        // For now, fetch from a static file or use placeholder
        fetch(process.env.PUBLIC_URL + '/manifest.json')
            .then(response => response.json())
            .then(data => setManifest(data))
            .catch(error => {
                console.log('No manifest found, using placeholder data');
                // Fallback placeholder - you should replace this with your actual data
                const placeholderManifest = {
                    images: Array.from({ length: 290 }, (_, i) => ({
                        processed_filename: `${i}.jpg`,
                        index: i
                    }))
                };
                setManifest(placeholderManifest);
            });
    }, []);

    // Create shuffled grid layout when manifest loads
    useEffect(() => {
        if (!manifest) return;

        const images = shuffle(manifest.images);
        
        // Distribute images across columns for desktop
        const columns = [[], [], []];
        images.forEach((img, index) => {
            columns[index % 3].push(img);
        });

        // Create flat array for lazy loading order based on visual position
        const flatLayout = [];
        const maxColumnLength = Math.max(...columns.map(col => col.length));
        
        // Interleave images from columns to match visual order (top to bottom)
        for (let row = 0; row < maxColumnLength; row++) {
            for (let col = 0; col < 3; col++) {
                if (columns[col][row]) {
                    flatLayout.push({
                        ...columns[col][row],
                        column: col,
                        row: row
                    });
                }
            }
        }

        setVisibleImages(flatLayout);
        setLoadedCount(BATCH_SIZE); // Load first batch
    }, [manifest]);

    // Progressive loading without scroll detection - just load more images every few seconds
    useEffect(() => {
        if (loadedCount >= visibleImages.length) return;
        
        const timer = setTimeout(() => {
            setLoadedCount(prev => Math.min(prev + BATCH_SIZE, visibleImages.length));
        }, 1000); // Load next batch every second
        
        return () => clearTimeout(timer);
    }, [loadedCount, visibleImages.length]);

    if (!manifest || visibleImages.length === 0) {
        return <div className="grid loading">Loading images...</div>;
    }

    // Group images by column for desktop layout
    const columnImages = [[], [], []];
    visibleImages.forEach((img) => {
        columnImages[img.column].push(img);
    });

    const renderImage = (img, index) => {
        const shouldLoadFullImage = index < loadedCount;
        
        return (
            <div className="pod" key={img.index}>
                {shouldLoadFullImage ? (
                    <SimpleProgressiveImage
                        fullSrc={`https://ethansitephotos.s3.amazonaws.com/site_photos/${img.processed_filename}`}
                        placeholderSrc={process.env.PUBLIC_URL + `/placeholders/${img.processed_filename}`}
                        alt="gallery"
                    />
                ) : (
                    <img
                        src={process.env.PUBLIC_URL + `/placeholders/${img.processed_filename}`}
                        alt="gallery"
                        style={{
                            filter: "blur(5px)",
                            width: '100%',
                            height: 'auto'
                        }}
                    />
                )}
            </div>
        );
    };

    return (
        <div className="grid">
            <div className="column">
                {columnImages[0].map((img, index) => {
                    const globalIndex = visibleImages.findIndex(v => v.index === img.index);
                    return renderImage(img, globalIndex);
                })}
            </div>
            <div className="column">
                {columnImages[1].map((img, index) => {
                    const globalIndex = visibleImages.findIndex(v => v.index === img.index);
                    return renderImage(img, globalIndex);
                })}
            </div>
            <div className="column">
                {columnImages[2].map((img, index) => {
                    const globalIndex = visibleImages.findIndex(v => v.index === img.index);
                    return renderImage(img, globalIndex);
                })}
            </div>
        </div>
    );
}

export default Grid;
