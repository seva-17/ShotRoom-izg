import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Camera, RefreshCw, Settings, Smartphone, Monitor, Zap, ZapOff } from 'lucide-react';
import type { PhotoTemplate, CapturedPhoto, CameraSettings } from '@/types';
import { toast } from 'sonner';

interface CameraBoothProps {
  template: PhotoTemplate;
  onCaptureComplete: (photos: CapturedPhoto[]) => void;
  onBack: () => void;
}

export default function CameraBooth({ template, onCaptureComplete, onBack }: CameraBoothProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [settings, setSettings] = useState<CameraSettings>({
    facingMode: 'user',
    countdown: 3,
    multiShotCount: template.slots,
    flashEnabled: true,
  });
  
  const [countdown, setCountdown] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [showFlash, setShowFlash] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Initialize camera
  const initCamera = useCallback(async () => {
    try {
      setCameraError(null);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: settings.facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
        };
      }
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError('Unable to access camera. Please check permissions.');
      toast.error('Camera access denied');
    }
  }, [settings.facingMode]);

  // Initialize camera on mount
  useEffect(() => {
    initCamera();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [initCamera]);

  // Play shutter sound
  const playShutterSound = () => {
    const audio = new Audio('/sounds/shutter.mp3');
    audio.volume = 0.5;
    audio.play().catch(() => {});
  };

  // Capture single photo
  const capturePhoto = useCallback((): CapturedPhoto | null => {
    if (!videoRef.current || !canvasRef.current) return null;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    return {
      id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dataUrl,
      timestamp: Date.now(),
    };
  }, []);

  // Flash effect
  const triggerFlash = () => {
    if (settings.flashEnabled) {
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 150);
    }
  };

  // Start capture sequence
  const startCapture = async () => {
    if (isCapturing) return;
    
    setIsCapturing(true);
    setCapturedPhotos([]);
    
    const photos: CapturedPhoto[] = [];
    
    for (let i = 0; i < settings.multiShotCount; i++) {
      // Countdown
      for (let j = settings.countdown; j > 0; j--) {
        setCountdown(j);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      setCountdown(0);
      
      // Capture
      triggerFlash();
      playShutterSound();
      
      const photo = capturePhoto();
      if (photo) {
        photos.push(photo);
        setCapturedPhotos([...photos]);
      }
      
      // Small delay between shots
      if (i < settings.multiShotCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    setIsCapturing(false);
    onCaptureComplete(photos);
  };

  // Toggle camera facing mode
  const toggleCamera = () => {
    setSettings(prev => ({
      ...prev,
      facingMode: prev.facingMode === 'user' ? 'environment' : 'user',
    }));
  };

  // Retake photos
  const handleRetake = () => {
    setCapturedPhotos([]);
    setIsCapturing(false);
    setCountdown(0);
  };

  return (
    <div className="min-h-screen py-4 px-4">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-4">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="lg"
            onClick={onBack}
            className="rounded-full hover:bg-white/50 dark:hover:bg-gray-800/50"
            disabled={isCapturing}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Photo Booth
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {template.name} • {template.slots} photos
            </p>
          </div>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setShowSettings(!showSettings)}
            className="rounded-full hover:bg-white/50 dark:hover:bg-gray-800/50"
            disabled={isCapturing}
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Camera Area */}
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          {/* 3D Booth Frame */}
          <div 
            className="relative rounded-3xl overflow-hidden shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 50%, #FF69B4 100%)',
              padding: '12px',
            }}
          >
            {/* Inner Frame */}
            <div className="relative rounded-2xl overflow-hidden bg-black">
              {/* Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full aspect-[4/3] object-cover"
              />
              
              {/* Hidden Canvas for Capture */}
              <canvas ref={canvasRef} className="hidden" />
              
              {/* Flash Overlay */}
              {showFlash && (
                <div className="absolute inset-0 bg-white animate-pulse z-20" />
              )}
              
              {/* Countdown Overlay */}
              {countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                  <div className="text-8xl font-bold text-white animate-bounce">
                    {countdown}
                  </div>
                </div>
              )}
              
              {/* Camera Not Ready */}
              {!isCameraReady && !cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                  <div className="text-center">
                    <RefreshCw className="w-12 h-12 text-pink-400 animate-spin mx-auto mb-4" />
                    <p className="text-white">Starting camera...</p>
                  </div>
                </div>
              )}
              
              {/* Camera Error */}
              {cameraError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
                  <div className="text-center px-4">
                    <Camera className="w-12 h-12 text-red-400 mx-auto mb-4" />
                    <p className="text-white mb-4">{cameraError}</p>
                    <Button onClick={initCamera} variant="outline">
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Photo Counter */}
              {isCapturing && (
                <div className="absolute top-4 right-4 z-20">
                  <Badge className="bg-pink-500 text-white text-lg px-4 py-2">
                    {capturedPhotos.length + 1} / {settings.multiShotCount}
                  </Badge>
                </div>
              )}
              
              {/* Frame Overlay Preview */}
              <div className="absolute inset-0 pointer-events-none z-10 opacity-30">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-white/50 text-center">
                    <p className="text-sm">Frame: {template.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Settings Panel */}
          {showSettings && !isCapturing && (
            <Card className="absolute top-20 right-4 p-4 z-40 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm">
              <h3 className="font-bold mb-3 text-gray-800 dark:text-gray-200">Settings</h3>
              
              <div className="space-y-4">
                {/* Countdown */}
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Countdown</label>
                  <div className="flex gap-2 mt-1">
                    {[3, 5, 10].map((sec) => (
                      <button
                        key={sec}
                        onClick={() => setSettings(prev => ({ ...prev, countdown: sec }))}
                        className={`px-3 py-1 rounded-full text-sm ${
                          settings.countdown === sec
                            ? 'bg-pink-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {sec}s
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Multi-shot */}
                <div>
                  <label className="text-sm text-gray-600 dark:text-gray-400">Photos</label>
                  <div className="flex gap-2 mt-1">
                    {[2, 3, 4].map((count) => (
                      <button
                        key={count}
                        onClick={() => setSettings(prev => ({ ...prev, multiShotCount: count }))}
                        className={`px-3 py-1 rounded-full text-sm ${
                          settings.multiShotCount === count
                            ? 'bg-pink-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Flash */}
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Flash</label>
                  <button
                    onClick={() => setSettings(prev => ({ ...prev, flashEnabled: !prev.flashEnabled }))}
                    className={`p-2 rounded-full ${settings.flashEnabled ? 'bg-yellow-400' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    {settings.flashEnabled ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Controls */}
        <div className="mt-6 flex items-center justify-center gap-4">
          {/* Camera Toggle */}
          <Button
            variant="outline"
            size="lg"
            onClick={toggleCamera}
            disabled={isCapturing || !isCameraReady}
            className="rounded-full w-14 h-14 p-0 border-2 border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/20"
          >
            {settings.facingMode === 'user' ? (
              <Smartphone className="w-6 h-6 text-pink-500" />
            ) : (
              <Monitor className="w-6 h-6 text-pink-500" />
            )}
          </Button>

          {/* Capture Button */}
          <Button
            size="lg"
            onClick={startCapture}
            disabled={isCapturing || !isCameraReady}
            className={`
              rounded-full w-20 h-20 p-0
              ${isCapturing 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-xl hover:shadow-2xl'
              }
              transition-all duration-300 hover:scale-105
            `}
          >
            <Camera className="w-8 h-8 text-white" />
          </Button>

          {/* Retake Button */}
          <Button
            variant="outline"
            size="lg"
            onClick={handleRetake}
            disabled={isCapturing || capturedPhotos.length === 0}
            className="rounded-full w-14 h-14 p-0 border-2 border-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/20"
          >
            <RefreshCw className="w-6 h-6 text-pink-500" />
          </Button>
        </div>

        {/* Instructions */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {isCapturing 
              ? 'Stay still and smile! 📸' 
              : 'Tap the capture button to start'
            }
          </p>
        </div>

        {/* Captured Thumbnails */}
        {capturedPhotos.length > 0 && !isCapturing && (
          <div className="mt-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 text-center">
              Captured Photos
            </p>
            <div className="flex justify-center gap-2">
              {capturedPhotos.map((photo, index) => (
                <div 
                  key={photo.id}
                  className="w-16 h-16 rounded-lg overflow-hidden border-2 border-pink-300 shadow-md"
                >
                  <img 
                    src={photo.dataUrl} 
                    alt={`Captured ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
