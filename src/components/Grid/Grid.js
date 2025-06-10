import './Grid.scss';
import ProgressiveImage from "react-progressive-image";
import shuffle from 'lodash/shuffle';
import { useState, useEffect, useRef } from 'react';

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
                    images: Array.from({ length: 262 }, (_, i) => ({
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

    // Intersection Observer for lazy loading
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const imageIndex = parseInt(entry.target.dataset.imageIndex);
                        if (imageIndex >= loadedCount - 3 && loadedCount < visibleImages.length) {
                            setLoadedCount(prev => Math.min(prev + BATCH_SIZE, visibleImages.length));
                        }
                    }
                });
            },
            { rootMargin: '100px' }
        );

        observerRef.current = observer;
        return () => observer.disconnect();
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
        const shouldLoad = index < loadedCount;
        
        return (
            <div 
                className="pod" 
                key={img.index}
                data-image-index={index}
                ref={(el) => {
                    if (el && observerRef.current && index === loadedCount - 3) {
                        observerRef.current.observe(el);
                    }
                }}
            >
                {shouldLoad ? (
                    <ProgressiveImage
                        src={`https://ethansitephotos.s3.amazonaws.com/site_photos/${img.processed_filename}`}
                        placeholder={process.env.PUBLIC_URL + `/placeholders/${img.processed_filename}`}
                    >
                        {(src, loading) => (
                            <img 
                                style={{ filter: loading ? "blur(5px)" : "blur(0)" }} 
                                src={src} 
                                alt="gallery" 
                            />
                        )}
                    </ProgressiveImage>
                ) : (
                    <div className="placeholder-loading">Loading...</div>
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
