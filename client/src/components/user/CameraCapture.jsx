import React, { useRef, useEffect, useState, useCallback } from 'react';
import Button from '../common/Button.jsx';

/**
 * Opens the device front camera via getUserMedia and lets the user capture
 * a still photo (returned as a Blob) for punch verification.
 */
export default function CameraCapture({ onCapture, onCancel }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [capturedUrl, setCapturedUrl] = useState(null);

  useEffect(() => {
    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        setError('Camera access denied or unavailable. Please allow camera permission.');
      }
    }
    startCamera();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    canvas.toBlob(
      (blob) => {
        setCapturedUrl(URL.createObjectURL(blob));
        onCapture(blob);
      },
      'image/jpeg',
      0.9
    );

    streamRef.current?.getTracks().forEach((track) => track.stop());
  }, [onCapture]);

  const handleRetake = useCallback(() => {
    setCapturedUrl(null);
    onCapture(null);
    // restart camera
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => setError('Could not restart camera'));
  }, [onCapture]);

  if (error) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-600">{error}</p>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg bg-black">
        {capturedUrl ? (
          <img src={capturedUrl} alt="Captured punch verification" className="w-full" />
        ) : (
          <video ref={videoRef} autoPlay playsInline muted className="w-full" />
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex gap-2">
        {!capturedUrl ? (
          <>
            <Button onClick={handleCapture} className="flex-1">
              Capture Photo
            </Button>
            <Button variant="secondary" onClick={onCancel}>
              Cancel
            </Button>
          </>
        ) : (
          <Button variant="secondary" onClick={handleRetake} className="flex-1">
            Retake
          </Button>
        )}
      </div>
    </div>
  );
}
