import React, { useState, useEffect, useRef, useCallback } from 'react';
import Camera from './components/Camera';
import CollageCanvas from './components/CollageCanvas';
import './App.css';

const collageWidth = 600;
const collageHeight = 1800;

function App() {
  const webcamRef = useRef(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const maxPhotos = 4;
  const photoTimerDuration = 3;
  const [timer, setTimer] = useState(0);
  const [isSequenceActive, setIsSequenceActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [awaitingFirstClick, setAwaitingFirstClick] = useState(true);

   const today = new Date();
   const defaultDateText = `${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getDate().toString().padStart(2, '0')}/${today.getFullYear()}`;


  const [customizationOptions, setCustomizationOptions] = useState({
      backgroundColor: '#ffe0f0',
      text: defaultDateText,
      textColor: '#5a3e5a',
      fontSize: 40,
      fontFamily: 'Arial',
      textShadowColor: 'rgba(255,255,255,0.7)',
      textShadowBlur: 3,
      textShadowOffsetX: 1,
      textShadowOffsetY: 1,
      textVerticalOffset: -40, // <-- Set default offset to -40
  });

    const [showFullscreenModal, setShowFullscreenModal] = useState(false);
    const [finishedStripUrl, setFinishedStripUrl] = useState(null);


    const handlePhotoCaptured = useCallback((imageSrc) => {
    console.log("handlePhotoCaptured called with image data.");
    if (imageSrc) {
        if (capturedImages.length < maxPhotos) {
          setCapturedImages((prevImages) => [...prevImages, imageSrc]);

          const nextPhotoCount = capturedImages.length + 1;

          if (nextPhotoCount < maxPhotos) {
             setTimer(photoTimerDuration);
          } else if (nextPhotoCount === maxPhotos) {
              setIsSequenceActive(false);
              setTimer(0);
              setIsPaused(false);
          }
        }
    } else {
        console.error("handlePhotoCaptured received null image data, capture failed.");
        setIsSequenceActive(false);
        setIsPaused(false);
        setTimer(0);
    }
  }, [capturedImages.length, maxPhotos, setCapturedImages, setTimer, setIsSequenceActive, setIsPaused]);


    const triggerCapture = useCallback((callback) => {
        if (webcamRef.current) {
             console.log("triggerCapture: Getting screenshot.");
            const imageSrc = webcamRef.current.getScreenshot();
            callback(imageSrc);
        } else {
             console.error("triggerCapture: Webcam ref is null.");
             callback(null);
        }
    }, [webcamRef]);


  useEffect(() => {
      let interval = null;

      if (timer > 0 && !isPaused) {
          interval = setInterval(() => {
              setTimer((prevTimer) => prevTimer - 1);
          }, 1000);
      } else if (timer === 0 && interval) {
          clearInterval(interval);
      }

       if (timer === 0 && isSequenceActive && !isPaused && capturedImages.length < maxPhotos) {
            console.log(`Timer reached 0. Conditions met for capture ${capturedImages.length + 1}/${maxPhotos}.`);

            const captureDelay = setTimeout(() => {
                 console.log(`Triggering capture via delay timeout.`);
                 triggerCapture(handlePhotoCaptured);
            }, 1000);

             return () => clearTimeout(captureDelay);
       }

      return () => {
          if (interval) {
              clearInterval(interval);
          }
      };
  }, [timer, isSequenceActive, isPaused, capturedImages.length, maxPhotos, triggerCapture, handlePhotoCaptured]);


   const handleStartClick = useCallback(() => {
       console.log("HandleStartClick clicked.");
       if (awaitingFirstClick) {
           setAwaitingFirstClick(false);
           setIsSequenceActive(true);
           setTimer(photoTimerDuration);
       }
   }, [awaitingFirstClick, setAwaitingFirstClick, setIsSequenceActive, setTimer]);


   const togglePause = () => {
       console.log("Toggle Pause clicked. isPaused:", isPaused);
        if (isPaused) {
            setIsPaused(false);
            setIsSequenceActive(true);

            if (timer === 0 && capturedImages.length > 0 && capturedImages.length < maxPhotos) {
                 setTimer(photoTimerDuration);
            }
        } else {
            setIsPaused(true);
            setIsSequenceActive(false);
        }
   };


  const handleRetake = () => {
      console.log("Retake clicked.");
      setCapturedImages([]);
      setTimer(0);
      setIsSequenceActive(false);
      setIsPaused(false);
      setAwaitingFirstClick(true);
      setFinishedStripUrl(null);
  };


    const handleCollageRendered = useCallback((dataUrl) => {
        console.log("Collage rendered. Data URL length:", dataUrl ? dataUrl.length : 'null');
        setFinishedStripUrl(dataUrl);
    }, [setFinishedStripUrl]);


    const openModal = useCallback(() => {
        console.log("Opening modal. finishedStripUrl:", finishedStripUrl);
        if (finishedStripUrl) {
            setShowFullscreenModal(true);
        }
    }, [finishedStripUrl]);

    const closeModal = useCallback(() => {
         console.log("Closing modal.");
        setShowFullscreenModal(false);
    }, [setShowFullscreenModal]);


  const updateCustomization = (option, value) => {
      console.log(`Updating customization: ${option} = ${value}`);
      setCustomizationOptions({
          ...customizationOptions,
          [option]: value,
      });
  };


    const showCamera = capturedImages.length < maxPhotos;


  return (
    <div className="App">
      <header className="App-header">
        <h1>✨ Cute Photobooth ✨</h1>
      </header>

      {showCamera && (
           <Camera
               ref={webcamRef}
               onCapture={handlePhotoCaptured}
               photoCount={capturedImages.length}
               maxPhotos={maxPhotos}
               timer={timer}
               isSequenceActive={isSequenceActive}
               isPaused={isPaused}
               awaitingFirstClick={awaitingFirstClick}
               handleStartClick={handleStartClick}
           />
      )}

        {!awaitingFirstClick && capturedImages.length > 0 && capturedImages.length < maxPhotos && (isSequenceActive || isPaused) && (
             <button className="pause-resume-button" onClick={togglePause}>
                 {isPaused ? '▶️ Resume' : '⏸️ Pause'}
             </button>
        )}


       {capturedImages.length > 0 && (
           <div className="captured-previews">
                <h4>Captured Photos:</h4>
                {capturedImages.map((imgSrc, index) => (
                    <div key={index} className="preview-item">
                        {imgSrc ? (
                            <img src={imgSrc} alt={`Captured ${index + 1}`} />
                        ) : (
                             <div className="preview-placeholder">Photo {index + 1}</div>
                        )}
                    </div>
                ))}
           </div>
       )}

      {/* Customization Controls */}
       <div className="customization-controls">
           <h4>Customize Your Strip!</h4>
            <div className="control-group">
                <label htmlFor="bgColor">Background Color:</label>
                <input
                   id="bgColor"
                   type="color"
                   value={customizationOptions.backgroundColor}
                   onChange={e => updateCustomization('backgroundColor', e.target.value)}
                />
             </div>
             <div className="control-group">
                <label htmlFor="stripText">Text:</label>
                <input
                   id="stripText"
                   type="text"
                   value={customizationOptions.text}
                   onChange={e => updateCustomization('text', e.target.value)}
                   placeholder="Add text to your strip"
                />
            </div>
             <div className="control-group">
                 <label htmlFor="textColor">Text Color:</label>
                 <input
                    id="textColor"
                    type="color"
                    value={customizationOptions.textColor}
                    onChange={e => updateCustomization('textColor', e.target.value)}
                 />
             </div>
              {/* --- REMOVED Control for Text Vertical Offset --- */}
              {/* <div className="control-group">
                 <label htmlFor="textVerticalOffset">Text Vertical Adjust:</label>
                 <input
                    id="textVerticalOffset"
                    type="number"
                    value={customizationOptions.textVerticalOffset}
                    onChange={e => updateCustomization('textVerticalOffset', parseInt(e.target.value))}
                    step="1"
                 />
             </div> */}
             {/* Add more controls here (e.g., font size, font family) */}
       </div>

      <CollageCanvas
        capturedImages={capturedImages}
        customizationOptions={customizationOptions}
        collageWidth={collageWidth}
        collageHeight={collageHeight}
        maxPhotos={maxPhotos}
        onCollageRendered={handleCollageRendered}
      />

        {finishedStripUrl && (
            <div className="finished-strip-actions">
                 <button className="view-strip-button" onClick={openModal}>
                    View Strip!
                 </button>
                 <button className="download-button" onClick={() => {
                     const link = document.createElement('a');
                     link.href = finishedStripUrl;
                     link.download = 'my-cute-photobooth-strip.jpg';
                     document.body.appendChild(link);
                     link.click();
                     document.body.removeChild(link);
                 }}>
                    Download Strip!
                 </button>
            </div>
        )}


      {capturedImages.length > 0 && (
          <button className="retake-button" onClick={handleRetake}>Start Over / Retake</button>
      )}

        {showFullscreenModal && finishedStripUrl && (
            <div className="modal-overlay" onClick={closeModal}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <img src={finishedStripUrl} alt="Finished Photo Strip" className="modal-image" />
                    <button className="modal-close-button" onClick={closeModal}>
                        &times;
                    </button>
                </div>
            </div>
        )}

    </div>
  );
}

export default App;