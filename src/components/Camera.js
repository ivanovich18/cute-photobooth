import React, { useState, useCallback, useEffect, forwardRef } from 'react';
import Webcam from 'react-webcam';

const videoConstraints = {
  width: { ideal: 1280 },
  height: { ideal: 960 },
  aspectRatio: 4 / 3,
  facingMode: 'user',
};

// Use forwardRef to receive the ref created in App.js
const Camera = forwardRef(({ onCapture, photoCount, maxPhotos, timer, isSequenceActive, isPaused, awaitingFirstClick, handleStartClick }, ref) => { // <-- Added new props
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [showCountdown, setShowCountdown] = useState(false); // State to control countdown overlay visibility

    // Effect to control countdown overlay visibility
    // Shows the countdown when timer > 0 and not paused
    // Briefly shows "GO!" when timer hits 0
    useEffect(() => {
        if (timer > 0 && !isPaused) {
            setShowCountdown(true);
        } else {
             // Keep showing "GO!" for a brief moment after timer hits 0
             const timeout = setTimeout(() => setShowCountdown(false), 500);
             return () => clearTimeout(timeout);
        }
    }, [timer, isPaused]);


  // --- Modified handleUserMedia to add a delay ---
  // This function is called by react-webcam when the camera stream is ready
  const handleUserMedia = useCallback((stream) => {
    console.log('Camera stream ready:', stream);
    // Introduce a small delay *after* stream is ready before setting isCameraReady to true
    // This helps ensure react-webcam's internal ref is likely ready for getScreenshot
    const readyDelay = setTimeout(() => {
        setIsCameraReady(true);
        console.log('isCameraReady set to true after delay.');
    }, 300); // <-- Adjust delay time (e.g., 200ms, 300ms, 500ms) if needed

    return () => clearTimeout(readyDelay); // Cleanup timeout if component unmounts
  }, []); // Callback dependencies are empty as it only uses stream param and stable setters


    // Internal capture function (called by App's timer effect via triggerCapture)
    // This function triggers the actual screenshot
    const internalCapture = useCallback(() => {
         console.log("Attempting capture. ref.current is:", ref.current);

         // --- Safety check: Ensure ref.current is not null before capturing ---
         if (!ref.current) {
             console.error("Ref is null when trying to capture.");
             // We can't capture if the ref is null, so we stop the attempt
             return;
         }

        // Get the screenshot using the ref
        const imageSrc = ref.current.getScreenshot();
        // Call the onCapture prop function provided by App.js (handlePhotoCaptured)
        // onCapture in App.js will handle adding the image and managing the sequence/timer
        onCapture(imageSrc);

    }, [ref, onCapture]); // Include ref and onCapture in dependencies


    // --- Logic to trigger automatic capture when timer ends ---
    // This effect watches the timer and triggers the next capture automatically
    // It's triggered by App.js when timer becomes 0 and conditions are met
    // This effect now primarily handles the *automatic* calls after the first shot's timer
    useEffect(() => {
        // Trigger automatic capture if timer hits 0, sequence is active, not paused,
        // AND more photos are needed (photoCount < maxPhotos), AND camera state is ready,
        // AND we are NOT awaiting the first click (because the first click starts the initial timer)
        if (timer === 0 && isSequenceActive && !isPaused && photoCount < maxPhotos && isCameraReady && !awaitingFirstClick) {
             console.log(`Timer reached 0. Auto-capturing photo ${photoCount + 1}/${maxPhotos}`);
            // Wait a brief moment (e.g., 700ms) after timer shows 0 before triggering the next capture
            const autoCaptureDelay = setTimeout(() => {
                 internalCapture(); // Trigger the next capture internally
            }, 700); // <-- Increased delay

            // Clean up the timeout if dependencies change before it fires (e.g., paused, retake)
            return () => clearTimeout(autoCaptureDelay);
        }
        // This effect should NOT run when timer > 0, only when it becomes 0 and conditions are met
    }, [timer, isSequenceActive, isPaused, photoCount, maxPhotos, isCameraReady, awaitingFirstClick, internalCapture]); // Add all relevant dependencies


  // Determine if the main clickable button should be shown
  // Button is shown ONLY when awaiting the first click OR when paused
  const showMainCaptureButton = awaitingFirstClick || isPaused;

  // Determine the text displayed on the main clickable button
  const shownButtonText = isPaused
      ? 'Click to Resume' // Text when paused
      : 'Click to Start'; // Text when awaiting the first click

    // Determine if the shown main button is disabled
    // Disabled if camera is NOT ready, or timer is currently counting down
   const isShownButtonDisabled = !isCameraReady || (timer > 0 && !isPaused);


    // Determine status message displayed below the button area during the sequence
    // This message shows when the main button is hidden (i.e., during the automatic capture sequence or when paused/waiting)
   const statusMessage = isPaused
       ? `Sequence Paused. ${photoCount}/${maxPhotos} taken.` // Show photos taken when paused
       : timer > 0
           ? `Get Ready: ${timer}` // Show countdown during active timer
           : (isSequenceActive && photoCount > 0 && photoCount < maxPhotos)
               ? `Taking Photo ${photoCount + 1}/${maxPhotos}...` // Indicate next auto-capture (briefly after timer=0)
               : ''; // Empty string if none of the above conditions are met


  return (
        <div className="camera-section">
            <div className="camera-display">
                {/* The Webcam component provided by react-webcam */}
                {/* Assign the forwarded ref to the Webcam component */}
                <Webcam
                    audio={false} // Disable audio
                    ref={ref} // <-- Pass the forwarded ref here
                    screenshotFormat="image/jpeg" // Capture format (JPEG for smaller size, adjustable quality)
                    videoConstraints={videoConstraints} // Apply resolution and aspect ratio constraints
                    onUserMedia={handleUserMedia} // Callback when camera stream is successfully obtained
                    onUserMediaError={(error) => console.error("Camera Error:", error)} // Callback for camera errors
                    mirrored={true} // Mirror the video feed (common for front cameras)
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} // Style to make video cover its container
                />
                {/* Overlays (Loading, Timer, Photo Count) */}
                {!isCameraReady && <div className="camera-loading">Loading camera...</div>} {/* Show loading until isCameraReady is true */}

                {/* Timer Countdown Overlay: Show when timer is active/just finished and not paused */}
                {(timer > 0 || (timer === 0 && showCountdown)) && !isPaused && (
                     <div className={`timer-overlay ${timer === 0 ? 'ready' : ''}`}>
                        {timer === 0 ? 'GO!' : timer} {/* Display timer or "GO!" */}
                     </div>
                 )}

                {/* Photo Count Overlay: Show when camera is ready, photos taken, not during countdown, and not paused */}
                {isCameraReady && photoCount > 0 && photoCount < maxPhotos && !showCountdown && !isPaused && (
                    <div className="photo-count-overlay">
                       {photoCount} / {maxPhotos} {/* Display current photo count */}
                    </div>
                )}
            </div>

            {/* Show the main clickable button only when needed (First photo click OR when paused) */}
            {/* Button is rendered if showMainCaptureButton is true, haven't hit max photos, and camera is ready */}
            {showMainCaptureButton && photoCount < maxPhotos && isCameraReady && (
                 <button
                    className="capture-button"
                    // --- MODIFIED ONCLICK HANDLER ---
                    // If awaiting the first click, call handleStartClick (which starts timer)
                    // If paused, call internalCapture (which resumes by capturing the next photo)
                    onClick={awaitingFirstClick ? handleStartClick : (isPaused ? internalCapture : undefined)}
                    // --- DISABLED PROP ---
                    // Disabled state now primarily controls the greyed-out look during the timer
                    // It's also disabled if camera is NOT ready
                    disabled={isShownButtonDisabled}
                 >
                     {shownButtonText} {/* Text displayed on the button */}
                 </button>
             )}

             {/* Display status message below button during the sequence or when paused */}
             {/* Only show status message if camera is ready, haven't hit max photos, and (sequence is active OR paused) AND main button is NOT shown */}
             {isCameraReady && photoCount < maxPhotos && (isSequenceActive || isPaused) && !showMainCaptureButton && (
                  <p className="capture-status-msg">
                     {statusMessage} {/* Text of the status message */}
                  </p>
             )}

             {/* Message displayed when all photos are taken */}
             {photoCount === maxPhotos && <p className="max-photos-msg">You've taken {maxPhotos} photos! Customize your strip below.</p>}


        </div>
    );
});

export default Camera;