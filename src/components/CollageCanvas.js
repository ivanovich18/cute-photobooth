import React, { useRef, useEffect } from 'react'; // Removed useState for finalImageUrl

// Padding and text area constants (adjust for visual spacing on 600x1800 canvas)
const padding = 20; // Uniform padding/spacing around elements
const bottomTextAreaHeight = 100; // Height of the text area at the bottom

// Added onCollageRendered prop
function CollageCanvas({ capturedImages, customizationOptions, collageWidth, collageHeight, maxPhotos, onCollageRendered }) {
  const canvasRef = useRef(null);
  // Removed local state for finalImageUrl

  // --- Effect to draw the collage when images or options change ---
  useEffect(() => {
     // Do not attempt to draw if no photos are captured or if onCollageRendered is not provided
     if (!capturedImages || capturedImages.length === 0 || !onCollageRendered) {
         // Clear the canvas if it had previous drawing but now no photos
         const canvas = canvasRef.current;
         if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, collageWidth, collageHeight);
         }
         // Do not call onCollageRendered(null) here, App.js manages the final image state
         return; // Stop drawing if no images or callback missing
     }

     // Define the main drawing function inside useEffect
     const drawCollage = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, collageWidth, collageHeight);

        // 1. Draw the overall background color (outer white border)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, collageWidth, collageHeight);

        // Calculate dimensions for the inner content area
        const innerContentX = padding;
        const innerContentY = padding;
        const innerContentWidth = collageWidth - 2 * padding;
        const innerContentHeight = collageHeight - 2 * padding;

        // Draw the inner background color (customizable background)
         ctx.fillStyle = customizationOptions.backgroundColor || '#ffe0f0';
         ctx.fillRect(innerContentX, innerContentY, innerContentWidth, innerContentHeight);

        // Calculate drawing dimensions for each photo slot
        const photoDrawWidth = innerContentWidth - 2 * padding;
        const totalDrawableHeight = innerContentHeight - padding - bottomTextAreaHeight;
        const photoDrawHeight = (totalDrawableHeight - (maxPhotos - 1) * padding) / maxPhotos;

        // 2. Load images before drawing
        const imageLoadPromises = capturedImages.map(imgSrc => {
            return new Promise((resolve, reject) => {
                if (!imgSrc) {
                    console.warn("Attempted to load null image source.");
                    resolve(null);
                    return;
                }
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = (e) => {
                     console.error("Error loading image:", e);
                     resolve(null);
                };
                img.src = imgSrc;
            });
        });

        // Wait for all images to attempt loading
        Promise.all(imageLoadPromises)
            .then(loadedImages => {
                 const imagesToDraw = [...loadedImages];
                  while(imagesToDraw.length < capturedImages.length) {
                      imagesToDraw.push(null);
                  }

                // 3. Draw the loaded images onto the canvas
                imagesToDraw.forEach((img, index) => {
                    const imageDrawX = innerContentX + padding;
                    const imageDrawY = innerContentY + padding + index * (photoDrawHeight + padding);

                     if (img) {
                        const imgAspectRatio = img.width / img.height;
                        const drawAspectRatio = photoDrawWidth / photoDrawHeight;

                        let sourceX = 0, sourceY = 0, sourceWidth = img.width, sourceHeight = img.height;
                        let destX = imageDrawX, destY = imageDrawY, destWidth = photoDrawWidth, destHeight = photoDrawHeight;

                        if (imgAspectRatio > drawAspectRatio) {
                            sourceWidth = img.height * drawAspectRatio;
                            sourceX = (img.width - sourceWidth) / 2;
                        } else if (imgAspectRatio < drawAspectRatio) {
                             sourceHeight = img.width / drawAspectRatio;
                            sourceY = (img.height - sourceHeight) / 2;
                        }

                        ctx.drawImage(
                            img,
                            sourceX, sourceY, sourceWidth, sourceHeight,
                            destX, destY, destWidth, destHeight
                        );
                     } else {
                         ctx.fillStyle = '#eeeeee';
                         ctx.fillRect(imageDrawX, imageDrawY, photoDrawWidth, photoDrawHeight);
                         ctx.fillStyle = '#999999';
                         ctx.textAlign = 'center';
                         ctx.textBaseline = 'middle';
                         ctx.font = '20px Arial';
                         ctx.fillText(`Photo ${index + 1}`, imageDrawX + photoDrawWidth / 2, imageDrawY + photoDrawHeight / 2);
                     }
                });

                // 4. Draw Text Area
                 const textAreaX = innerContentX + padding;
                 const textAreaY = innerContentY + padding + maxPhotos * (photoDrawHeight + padding) + padding;
                 const textAreaWidth = photoDrawWidth;
                 const textAreaHeight = bottomTextAreaHeight;

                // --- Draw Text or leave area blank ---
                if (customizationOptions.text && customizationOptions.text.trim() !== '') {
                    const textFont = `${customizationOptions.fontSize || 40}px 'Lilita One', cursive, Arial`;
                    ctx.font = textFont;
                    ctx.fillStyle = customizationOptions.textColor || '#000000';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle'; // Vertically center text relative to the baseline

                    // Calculate text position: center of text area + vertical offset
                    const textX = textAreaX + textAreaWidth / 2;
                    const textY = textAreaY + textAreaHeight / 2 + (customizationOptions.textVerticalOffset || 0); // Apply offset

                    ctx.shadowColor = customizationOptions.textShadowColor || 'rgba(0,0,0,0.5)';
                    ctx.shadowBlur = customizationOptions.textShadowBlur || 5;
                    ctx.shadowOffsetX = customizationOptions.textShadowOffsetX || 2;
                    ctx.shadowOffsetY = customizationOptions.textShadowOffsetY || 2;

                    ctx.fillText(customizationOptions.text, textX, textY);

                    ctx.shadowColor = 'transparent';
                    ctx.shadowBlur = 0;
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                } else {
                    // If text is empty or whitespace, just leave the area blank
                }


                // 5. Generate the final image URL and pass it up to App.js
                const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
                onCollageRendered(dataUrl); // <-- Call the prop callback

            })
            .catch(error => {
                console.error("Error during collage drawing:", error);
                 // Indicate error by passing null or an error object up
                 onCollageRendered(null); // Pass null if drawing fails
            });
      };

      const handler = setTimeout(drawCollage, 100);
      return () => clearTimeout(handler);

  }, [capturedImages, customizationOptions, collageWidth, collageHeight, maxPhotos, onCollageRendered]); // Add onCollageRendered to deps


  // --- Download Function (Removed from here) ---
  // Download logic is now handled in App.js using the finishedStripUrl state


  return (
    <div className="collage-section">
      {/* Only show the collage section if photos have been captured */}
      {capturedImages && capturedImages.length > 0 && (
          <>
              <h3>Your Strip!</h3>
               {/* Container for the canvas - Add onClick to open modal */}
              <div className="canvas-container">
                  {/* The Canvas element where the collage is drawn */}
                  <canvas
                      ref={canvasRef} // Assign the ref to the canvas element
                      width={collageWidth} // Set the actual drawing width of the canvas
                      height={collageHeight} // Set the actual drawing height of the canvas
                      // Style to fit within its container while maintaining aspect ratio
                      style={{ width: '100%', height: 'auto', display: 'block', margin: '0 auto' }}
                  ></canvas>
              </div>

              {/* Download button is now in App.js */}
               {/* View Strip button is also in App.js */}

          </>
      )}

       {(!capturedImages || capturedImages.length === 0) && <p className="no-photos-msg">Take your first photo to start the sequence!</p>}

    </div>
  );
}

export default CollageCanvas;