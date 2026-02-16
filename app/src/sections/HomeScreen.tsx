import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Camera, Heart, Star } from 'lucide-react';

interface HomeScreenProps {
  onStart: () => void;
}

export default function HomeScreen({ onStart }: HomeScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Floating animation for decorative elements
    const floatElements = document.querySelectorAll('.float-element');
    floatElements.forEach((el, i) => {
      const element = el as HTMLElement;
      element.style.animationDelay = `${i * 0.5}s`;
    });
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating Hearts */}
        <div className="float-element absolute top-20 left-[10%] text-pink-300 animate-bounce">
          <Heart className="w-8 h-8 fill-pink-300" />
        </div>
        <div className="float-element absolute top-40 right-[15%] text-purple-300 animate-bounce" style={{ animationDelay: '1s' }}>
          <Heart className="w-6 h-6 fill-purple-300" />
        </div>
        <div className="float-element absolute bottom-32 left-[20%] text-rose-300 animate-bounce" style={{ animationDelay: '1.5s' }}>
          <Heart className="w-10 h-10 fill-rose-300" />
        </div>
        
        {/* Floating Stars */}
        <div className="float-element absolute top-32 left-[25%] text-yellow-300 animate-pulse">
          <Star className="w-6 h-6 fill-yellow-300" />
        </div>
        <div className="float-element absolute top-60 right-[10%] text-amber-300 animate-pulse" style={{ animationDelay: '0.7s' }}>
          <Star className="w-8 h-8 fill-amber-300" />
        </div>
        <div className="float-element absolute bottom-40 right-[25%] text-orange-300 animate-pulse" style={{ animationDelay: '1.2s' }}>
          <Star className="w-5 h-5 fill-orange-300" />
        </div>
        
        {/* Sparkles */}
        <div className="float-element absolute top-16 right-[30%] text-pink-400 animate-spin" style={{ animationDuration: '3s' }}>
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="float-element absolute bottom-24 left-[35%] text-purple-400 animate-spin" style={{ animationDuration: '4s' }}>
          <Sparkles className="w-6 h-6" />
        </div>
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-pink-300/30 to-purple-300/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-br from-blue-300/30 to-purple-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-rose-300/20 to-pink-300/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center">
        {/* 3D Photobooth Machine */}
        <div className="relative mb-8">
          {/* Booth Outer Shell */}
          <div className="relative w-72 h-96 sm:w-80 sm:h-[420px] md:w-96 md:h-[480px]">
            {/* 3D Booth Body */}
            <div 
              className="absolute inset-0 rounded-3xl transform perspective-1000"
              style={{
                background: 'linear-gradient(135deg, #FFB6C1 0%, #FFC0CB 25%, #FFB6C1 50%, #FF69B4 100%)',
                boxShadow: `
                  inset -10px -10px 20px rgba(0,0,0,0.1),
                  inset 10px 10px 20px rgba(255,255,255,0.4),
                  0 25px 50px -12px rgba(255,105,180,0.5),
                  0 0 0 4px rgba(255,255,255,0.3)
                `,
                transform: 'rotateY(-5deg) rotateX(5deg)',
              }}
            >
              {/* Booth Header */}
              <div className="absolute top-0 left-0 right-0 h-16 rounded-t-3xl bg-gradient-to-r from-pink-400 via-rose-400 to-pink-400 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-white" />
                  <span className="text-white font-bold text-lg tracking-wider">PHOTO BOOTH</span>
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              </div>
              
              {/* Screen Area */}
              <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[85%] aspect-[4/3] bg-gray-900 rounded-2xl overflow-hidden border-4 border-pink-300 shadow-inner">
                {/* Screen Content */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-rose-900 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-white/80 mx-auto mb-4 animate-pulse" />
                    <p className="text-white/60 text-sm">Ready to capture</p>
                  </div>
                </div>
                
                {/* Screen Reflection */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
              </div>
              
              {/* Booth Controls */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-400 to-pink-500 shadow-lg flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-rose-300 shadow-inner" />
                </div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 shadow-lg flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-purple-300 shadow-inner" />
                </div>
              </div>
              
              {/* Decorative Strip */}
              <div className="absolute bottom-24 left-0 right-0 h-2 bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300" />
            </div>
            
            {/* 3D Side Panel */}
            <div 
              className="absolute top-8 -right-4 w-8 h-80 bg-gradient-to-r from-pink-400 to-rose-500 rounded-r-2xl"
              style={{
                transform: 'skewY(-10deg)',
                boxShadow: '-5px 5px 15px rgba(0,0,0,0.2)',
              }}
            />
            
            {/* 3D Top Panel */}
            <div 
              className="absolute -top-4 left-8 right-8 h-8 bg-gradient-to-b from-pink-300 to-pink-400 rounded-t-2xl"
              style={{
                transform: 'skewX(-10deg)',
                boxShadow: '0 -5px 15px rgba(0,0,0,0.1)',
              }}
            />
          </div>
          
          {/* Curtains */}
          <div className="absolute -left-8 top-16 w-16 h-64 bg-gradient-to-r from-rose-400/80 to-pink-400/80 rounded-full blur-sm" />
          <div className="absolute -right-8 top-16 w-16 h-64 bg-gradient-to-l from-rose-400/80 to-pink-400/80 rounded-full blur-sm" />
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-4 bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500 bg-clip-text text-transparent">
          Cute Photobooth
        </h1>
        
        <p className="text-lg text-gray-600 dark:text-gray-300 text-center mb-8 max-w-md px-4">
          Capture precious moments with adorable frames, filters, and stickers! ✨
        </p>

        {/* Start Button */}
        <Button
          onClick={onStart}
          size="lg"
          className="relative group px-8 py-6 text-lg font-bold rounded-full bg-gradient-to-r from-pink-500 via-rose-500 to-purple-500 hover:from-pink-600 hover:via-rose-600 hover:to-purple-600 text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
        >
          <span className="relative z-10 flex items-center gap-2">
            <Camera className="w-6 h-6" />
            Start Capture
            <Sparkles className="w-5 h-5" />
          </span>
          
          {/* Button Glow Effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-400 via-rose-400 to-purple-400 opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-300" />
        </Button>

        {/* Features */}
        <div className="flex flex-wrap justify-center gap-4 mt-12">
          {[
            { icon: Camera, text: 'Multi-shot' },
            { icon: Sparkles, text: 'Cute Filters' },
            { icon: Heart, text: '100+ Stickers' },
            { icon: Star, text: 'Fun Frames' },
          ].map((feature, i) => (
            <div 
              key={i}
              className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-full shadow-sm"
            >
              <feature.icon className="w-4 h-4 text-pink-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
