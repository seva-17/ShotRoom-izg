import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  ArrowLeft, Download, Share2, Heart, Sparkles, 
  Check, Copy, Twitter, Facebook, Link2
} from 'lucide-react';
import type { PhotoTemplate, CapturedPhoto, PlacedSticker, FilterSettings } from '@/types';
import { toast } from 'sonner';

interface PreviewDownloadProps {
  template: PhotoTemplate;
  photos: CapturedPhoto[];
  placedStickers: PlacedSticker[];
  filterSettings: FilterSettings;
  backgroundColor: string;
  onDownloadComplete: () => void;
  onEdit: () => void;
  onBack: () => void;
}

export default function PreviewDownload({
  template,
  photos,
  placedStickers,
  filterSettings,
  backgroundColor,
  onDownloadComplete,
  onEdit,
  onBack,
}: PreviewDownloadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  // Canvas dimensions
  const canvasWidth = 800;
  const canvasHeight = template.layout.includes('strip') ? 1200 : 
                       template.layout.includes('polaroid') ? 1000 : 800;

  // Generate final canvas on mount
  useEffect(() => {
    generateFinalCanvas();
  }, []);

  // Generate final canvas with all layers
  const generateFinalCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsGenerating(true);

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate photo positions
    const photoPositions = calculatePhotoPositions(template, canvas.width, canvas.height);

    // Draw photos with filters
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const pos = photoPositions[i];
      
      if (photo && pos) {
        await drawPhotoWithFilters(ctx, photo.dataUrl, pos, filterSettings);
      }
    }

    // Draw stickers
    for (const sticker of placedStickers) {
      await drawSticker(ctx, sticker);
    }

    // Draw frame overlay
    await drawFrameOverlay(ctx, template, canvas.width, canvas.height);

    // Generate download URL
    const dataUrl = canvas.toDataURL('image/png', 1.0);
    setDownloadUrl(dataUrl);
    setIsGenerating(false);
  };

  // Calculate photo positions
  const calculatePhotoPositions = (template: PhotoTemplate, width: number, height: number) => {
    const positions: { x: number; y: number; width: number; height: number }[] = [];
    const padding = 40;
    
    switch (template.layout) {
      case 'strip-3':
        const strip3Height = (height - padding * 4) / 3;
        for (let i = 0; i < 3; i++) {
          positions.push({
            x: padding,
            y: padding + i * (strip3Height + padding),
            width: width - padding * 2,
            height: strip3Height,
          });
        }
        break;
        
      case 'strip-4':
        const strip4Height = (height - padding * 5) / 4;
        for (let i = 0; i < 4; i++) {
          positions.push({
            x: padding,
            y: padding + i * (strip4Height + padding),
            width: width - padding * 2,
            height: strip4Height,
          });
        }
        break;
        
      case 'polaroid-2':
        const polaroid2Width = (width - padding * 3) / 2;
        const polaroid2Height = polaroid2Width * 1.2;
        for (let i = 0; i < 2; i++) {
          positions.push({
            x: padding + i * (polaroid2Width + padding),
            y: padding,
            width: polaroid2Width,
            height: polaroid2Height,
          });
        }
        break;
        
      case 'polaroid-4':
        const polaroid4Width = (width - padding * 3) / 2;
        const polaroid4Height = polaroid4Width * 1.2;
        for (let i = 0; i < 4; i++) {
          const row = Math.floor(i / 2);
          const col = i % 2;
          positions.push({
            x: padding + col * (polaroid4Width + padding),
            y: padding + row * (polaroid4Height + padding),
            width: polaroid4Width,
            height: polaroid4Height,
          });
        }
        break;
        
      case 'grid-2x2':
        const grid2Width = (width - padding * 3) / 2;
        const grid2Height = (height - padding * 3) / 2;
        for (let i = 0; i < 4; i++) {
          const row = Math.floor(i / 2);
          const col = i % 2;
          positions.push({
            x: padding + col * (grid2Width + padding),
            y: padding + row * (grid2Height + padding),
            width: grid2Width,
            height: grid2Height,
          });
        }
        break;
        
      case 'grid-3x1':
        const grid3Width = (width - padding * 4) / 3;
        const grid3Height = height - padding * 2;
        for (let i = 0; i < 3; i++) {
          positions.push({
            x: padding + i * (grid3Width + padding),
            y: padding,
            width: grid3Width,
            height: grid3Height,
          });
        }
        break;
        
      default:
        const defaultHeight = (height - padding * 5) / 4;
        for (let i = 0; i < 4; i++) {
          positions.push({
            x: padding,
            y: padding + i * (defaultHeight + padding),
            width: width - padding * 2,
            height: defaultHeight,
          });
        }
    }
    
    return positions;
  };

  // Draw photo with filters
  const drawPhotoWithFilters = (
    ctx: CanvasRenderingContext2D, 
    dataUrl: string, 
    pos: { x: number; y: number; width: number; height: number },
    filters: FilterSettings
  ): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        ctx.save();
        
        // Create clipping path
        ctx.beginPath();
        ctx.roundRect(pos.x, pos.y, pos.width, pos.height, 8);
        ctx.clip();
        
        // Apply mirror effect
        if (filters.mirror) {
          ctx.translate(pos.x + pos.width, pos.y);
          ctx.scale(-1, 1);
          ctx.drawImage(img, 0, 0, pos.width, pos.height);
        } else {
          ctx.drawImage(img, pos.x, pos.y, pos.width, pos.height);
        }
        
        // Apply B&W
        if (filters.blackAndWhite) {
          ctx.globalCompositeOperation = 'saturation';
          ctx.fillStyle = 'black';
          ctx.fillRect(pos.x, pos.y, pos.width, pos.height);
        }
        
        // Brightness/Contrast
        if (filters.brightness !== 100 || filters.contrast !== 100) {
          const imageData = ctx.getImageData(pos.x, pos.y, pos.width, pos.height);
          const data = imageData.data;
          
          for (let i = 0; i < data.length; i += 4) {
            const brightness = (filters.brightness - 100) * 2.55;
            data[i] += brightness;
            data[i + 1] += brightness;
            data[i + 2] += brightness;
            
            const contrast = (filters.contrast - 100) / 100;
            const factor = (1 + contrast) / (1 - contrast);
            data[i] = factor * (data[i] - 128) + 128;
            data[i + 1] = factor * (data[i + 1] - 128) + 128;
            data[i + 2] = factor * (data[i + 2] - 128) + 128;
          }
          
          ctx.putImageData(imageData, pos.x, pos.y);
        }
        
        // Vintage effect
        if (filters.vintage) {
          ctx.globalCompositeOperation = 'overlay';
          ctx.fillStyle = 'rgba(255, 200, 150, 0.3)';
          ctx.fillRect(pos.x, pos.y, pos.width, pos.height);
        }
        
        // VHS effect
        if (filters.vhs) {
          ctx.globalCompositeOperation = 'screen';
          ctx.fillStyle = 'rgba(255, 0, 100, 0.1)';
          ctx.fillRect(pos.x + 2, pos.y, pos.width, pos.height);
          ctx.fillStyle = 'rgba(0, 255, 100, 0.1)';
          ctx.fillRect(pos.x - 2, pos.y, pos.width, pos.height);
        }
        
        // Blur effect
        if (filters.blur > 0) {
          ctx.filter = `blur(${filters.blur}px)`;
          ctx.globalCompositeOperation = 'source-over';
          ctx.drawImage(canvasRef.current!, pos.x, pos.y, pos.width, pos.height, pos.x, pos.y, pos.width, pos.height);
          ctx.filter = 'none';
        }
        
        ctx.restore();
        resolve();
      };
      img.src = dataUrl;
    });
  };

  // Draw sticker
  const drawSticker = (ctx: CanvasRenderingContext2D, sticker: PlacedSticker): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.save();
        ctx.translate(sticker.x, sticker.y);
        ctx.rotate((sticker.rotation * Math.PI) / 180);
        ctx.scale(sticker.scale, sticker.scale);
        
        const size = 80;
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
        
        ctx.restore();
        resolve();
      };
      img.onerror = () => resolve();
      img.src = sticker.src;
    });
  };

  // Draw frame overlay
  const drawFrameOverlay = (
    ctx: CanvasRenderingContext2D, 
    template: PhotoTemplate, 
    width: number, 
    height: number
  ): Promise<void> => {
    return new Promise((resolve) => {
      ctx.save();
      
      // Decorative border
      ctx.strokeStyle = '#FF69B4';
      ctx.lineWidth = 8;
      ctx.setLineDash([20, 10]);
      ctx.strokeRect(10, 10, width - 20, height - 20);
      
      // Corner decorations
      const cornerSize = 40;
      ctx.fillStyle = '#FFB6C1';
      
      // Top-left
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(cornerSize, 0);
      ctx.lineTo(0, cornerSize);
      ctx.closePath();
      ctx.fill();
      
      // Top-right
      ctx.beginPath();
      ctx.moveTo(width, 0);
      ctx.lineTo(width - cornerSize, 0);
      ctx.lineTo(width, cornerSize);
      ctx.closePath();
      ctx.fill();
      
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(0, height);
      ctx.lineTo(cornerSize, height);
      ctx.lineTo(0, height - cornerSize);
      ctx.closePath();
      ctx.fill();
      
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(width, height);
      ctx.lineTo(width - cornerSize, height);
      ctx.lineTo(width, height - cornerSize);
      ctx.closePath();
      ctx.fill();
      
      // Template name
      ctx.fillStyle = '#FF69B4';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`✨ ${template.name} ✨`, width / 2, height - 20);
      
      ctx.restore();
      resolve();
    });
  };

  // Handle download
  const handleDownload = () => {
    if (!downloadUrl) return;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `photobooth-${template.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Photo strip downloaded!');
    onDownloadComplete();
  };

  // Handle share
  const handleShare = async (platform: string) => {
    if (!downloadUrl) return;

    switch (platform) {
      case 'copy':
        try {
          const response = await fetch(downloadUrl);
          const blob = await response.blob();
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          toast.success('Image copied to clipboard!');
        } catch (err) {
          toast.error('Failed to copy image');
        }
        break;
        
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=Check out my cute photo strip! ✨&url=${encodeURIComponent(window.location.href)}`, '_blank');
        break;
        
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
        break;
        
      default:
        if (navigator.share) {
          try {
            const response = await fetch(downloadUrl);
            const blob = await response.blob();
            const file = new File([blob], 'photobooth.png', { type: 'image/png' });
            
            await navigator.share({
              title: 'My Cute Photo Strip',
              text: 'Check out my photo strip! ✨',
              files: [file],
            });
          } catch (err) {
            console.error('Share failed:', err);
          }
        } else {
          toast.error('Sharing not supported on this device');
        }
    }
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
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
              Preview
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your photo strip is ready!
            </p>
          </div>
          
          <div className="w-24" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview Canvas */}
          <div>
            <Card className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <div className="relative flex justify-center">
                <canvas
                  ref={canvasRef}
                  width={canvasWidth}
                  height={canvasHeight}
                  className="max-w-full h-auto border rounded-lg shadow-lg"
                  style={{ maxHeight: '70vh' }}
                />
                
                {isGenerating && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4" />
                      <p className="text-white font-medium">Generating...</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Like Button */}
              <div className="mt-4 flex justify-center">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all ${
                    isLiked 
                      ? 'bg-pink-100 text-pink-600' 
                      : 'bg-gray-100 text-gray-600 hover:bg-pink-50'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-pink-500 text-pink-500' : ''}`} />
                  <span>{isLiked ? 'Liked!' : 'Like'}</span>
                </button>
              </div>
            </Card>
          </div>

          {/* Actions Panel */}
          <div className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-pink-500" />
                Your Photo Strip
              </h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Template</span>
                  <span className="font-medium">{template.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Photos</span>
                  <span className="font-medium">{photos.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Stickers</span>
                  <span className="font-medium">{placedStickers.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Resolution</span>
                  <span className="font-medium">{canvasWidth} x {canvasHeight}</span>
                </div>
              </div>
              
              {/* Download Button */}
              <Button
                onClick={handleDownload}
                disabled={isGenerating || !downloadUrl}
                className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white mb-3"
              >
                <Download className="w-5 h-5 mr-2" />
                Download Photo Strip
              </Button>
              
              {/* Edit Button */}
              <Button
                variant="outline"
                onClick={onEdit}
                disabled={isGenerating}
                className="w-full mb-3"
              >
                Edit Again
              </Button>
              
              {/* Share Button */}
              <Button
                variant="ghost"
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="w-full"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </Button>
            </Card>

            {/* Share Menu */}
            {showShareMenu && (
              <Card className="p-4 animate-in slide-in-from-top-2">
                <h4 className="text-sm font-medium mb-3">Share to</h4>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleShare('copy')}
                    className="flex flex-col items-center p-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                  >
                    <Copy className="w-6 h-6 mb-1 text-pink-500" />
                    <span className="text-xs">Copy</span>
                  </button>
                  <button
                    onClick={() => handleShare('twitter')}
                    className="flex flex-col items-center p-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                  >
                    <Twitter className="w-6 h-6 mb-1 text-blue-400" />
                    <span className="text-xs">Twitter</span>
                  </button>
                  <button
                    onClick={() => handleShare('facebook')}
                    className="flex flex-col items-center p-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                  >
                    <Facebook className="w-6 h-6 mb-1 text-blue-600" />
                    <span className="text-xs">Facebook</span>
                  </button>
                  <button
                    onClick={() => handleShare('native')}
                    className="flex flex-col items-center p-2 rounded-lg hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
                  >
                    <Link2 className="w-6 h-6 mb-1 text-green-500" />
                    <span className="text-xs">More</span>
                  </button>
                </div>
              </Card>
            )}

            {/* Tips */}
            <Card className="p-4 bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                Tips
              </h4>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Save your photo strip to your device</li>
                <li>• Share with friends on social media</li>
                <li>• Print at home or at a photo shop</li>
                <li>• Come back anytime to create more!</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
