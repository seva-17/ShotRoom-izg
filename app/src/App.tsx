import { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import HomeScreen from '@/sections/HomeScreen';
import TemplateSelection from '@/sections/TemplateSelection';
import CameraBooth from '@/sections/CameraBooth';
import PhotoEditor from '@/sections/PhotoEditor';
import PreviewDownload from '@/sections/PreviewDownload';
import type { AppStep, PhotoTemplate, CapturedPhoto, PlacedSticker, FilterSettings, PhotoSession } from '@/types';
import { defaultTemplates } from '@/data/templates';
import { defaultStickers } from '@/data/stickers';
import './App.css';

const defaultFilterSettings: FilterSettings = {
  fisheye: false,
  blur: 0,
  vintage: false,
  vhs: false,
  pixelate: 0,
  mirror: false,
  blackAndWhite: false,
  beauty: 0,
  brightness: 100,
  contrast: 100,
  saturation: 100,
};

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('home');
  const [selectedTemplate, setSelectedTemplate] = useState<PhotoTemplate | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<CapturedPhoto[]>([]);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>([]);
  const [filterSettings, setFilterSettings] = useState<FilterSettings>(defaultFilterSettings);
  const [backgroundColor, setBackgroundColor] = useState<string>('#FFE4EC');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showAnimation, setShowAnimation] = useState<'meteor' | 'sakura' | null>(null);

  // Load session from localStorage on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('photobooth-session');
    if (savedSession) {
      try {
        const session: PhotoSession = JSON.parse(savedSession);
        if (session.photos.length > 0) {
          toast.info('Previous session found!', {
            action: {
              label: 'Restore',
              onClick: () => restoreSession(session),
            },
          });
        }
      } catch (e) {
        console.error('Failed to parse saved session:', e);
      }
    }

    const savedTheme = localStorage.getItem('photobooth-theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Save session to localStorage
  useEffect(() => {
    if (selectedTemplate && capturedPhotos.length > 0) {
      const session: PhotoSession = {
        template: selectedTemplate,
        photos: capturedPhotos,
        placedStickers,
        filterSettings,
        backgroundColor,
        timestamp: Date.now(),
      };
      localStorage.setItem('photobooth-session', JSON.stringify(session));
    }
  }, [selectedTemplate, capturedPhotos, placedStickers, filterSettings, backgroundColor]);

  const restoreSession = (session: PhotoSession) => {
    setSelectedTemplate(session.template);
    setCapturedPhotos(session.photos);
    setPlacedStickers(session.placedStickers);
    setFilterSettings(session.filterSettings);
    setBackgroundColor(session.backgroundColor);
    setCurrentStep('edit');
    toast.success('Session restored!');
  };

  const toggleTheme = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('photobooth-theme', newDarkMode ? 'dark' : 'light');
    
    // Trigger animation
    setShowAnimation(newDarkMode ? 'meteor' : 'sakura');
    setTimeout(() => setShowAnimation(null), 3000);
  };

  const handleStart = () => {
    setCurrentStep('template');
  };

  const handleTemplateSelect = (template: PhotoTemplate) => {
    setSelectedTemplate(template);
    setCapturedPhotos([]);
    setPlacedStickers([]);
    setFilterSettings(defaultFilterSettings);
    setCurrentStep('camera');
  };

  const handleCaptureComplete = (photos: CapturedPhoto[]) => {
    setCapturedPhotos(photos);
    setCurrentStep('edit');
    toast.success(`${photos.length} photos captured!`);
  };

  const handleEditComplete = (stickers: PlacedSticker[], filters: FilterSettings, bgColor: string) => {
    setPlacedStickers(stickers);
    setFilterSettings(filters);
    setBackgroundColor(bgColor);
    setCurrentStep('preview');
  };

  const handleDownloadComplete = () => {
    toast.success('Photo strip downloaded!');
    setCurrentStep('home');
    setCapturedPhotos([]);
    setPlacedStickers([]);
    setSelectedTemplate(null);
    localStorage.removeItem('photobooth-session');
  };

  const handleRetake = () => {
    setCapturedPhotos([]);
    setPlacedStickers([]);
    setCurrentStep('camera');
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'template':
        setCurrentStep('home');
        break;
      case 'camera':
        setCurrentStep('template');
        break;
      case 'edit':
        setCurrentStep('camera');
        break;
      case 'preview':
        setCurrentStep('edit');
        break;
      case 'download':
        setCurrentStep('preview');
        break;
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50'}`}>
      <Toaster position="top-center" richColors />
      
      {/* Theme Animation Overlay */}
      {showAnimation === 'meteor' && <MeteorShower />}
      {showAnimation === 'sakura' && <SakuraFalling />}
      
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-3 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      >
        {isDarkMode ? (
          <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Main Content */}
      <main className="relative min-h-screen">
        {currentStep === 'home' && <HomeScreen onStart={handleStart} />}
        
        {currentStep === 'template' && (
          <TemplateSelection
            templates={defaultTemplates}
            onSelect={handleTemplateSelect}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 'camera' && selectedTemplate && (
          <CameraBooth
            template={selectedTemplate}
            onCaptureComplete={handleCaptureComplete}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 'edit' && selectedTemplate && (
          <PhotoEditor
            template={selectedTemplate}
            photos={capturedPhotos}
            stickers={defaultStickers}
            initialPlacedStickers={placedStickers}
            initialFilterSettings={filterSettings}
            initialBackgroundColor={backgroundColor}
            onComplete={handleEditComplete}
            onRetake={handleRetake}
            onBack={handleBack}
          />
        )}
        
        {currentStep === 'preview' && selectedTemplate && (
          <PreviewDownload
            template={selectedTemplate}
            photos={capturedPhotos}
            placedStickers={placedStickers}
            filterSettings={filterSettings}
            backgroundColor={backgroundColor}
            onDownloadComplete={handleDownloadComplete}
            onEdit={() => setCurrentStep('edit')}
            onBack={handleBack}
          />
        )}
      </main>
    </div>
  );
}

// Meteor Shower Animation Component
function MeteorShower() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="meteor"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 50}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${0.5 + Math.random() * 1}s`,
          }}
        />
      ))}
    </div>
  );
}

// Sakura Falling Animation Component
function SakuraFalling() {
  const petals = [...Array(30)].map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 3}s`,
    duration: `${3 + Math.random() * 4}s`,
    size: `${10 + Math.random() * 15}px`,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="sakura-petal"
          style={{
            left: petal.left,
            width: petal.size,
            height: petal.size,
            animationDelay: petal.delay,
            animationDuration: petal.duration,
          }}
        />
      ))}
    </div>
  );
}

export default App;
