import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  ArrowLeft, Check, RefreshCw, Undo, Redo,
  Sun, Contrast, Sparkles, Zap, FlipHorizontal,
  Grid3X3, Aperture, Film, RotateCcw, Move, Trash2, Upload
} from 'lucide-react';
import type { PhotoTemplate, CapturedPhoto, Sticker, PlacedSticker, FilterSettings } from '@/types';
import { stickerCategories } from '@/data/stickers';
import { toast } from 'sonner';

interface PhotoEditorProps {
  template: PhotoTemplate;
  photos: CapturedPhoto[];
  stickers: Sticker[];
  initialPlacedStickers: PlacedSticker[];
  initialFilterSettings: FilterSettings;
  initialBackgroundColor: string;
  onComplete: (stickers: PlacedSticker[], filters: FilterSettings, bgColor: string) => void;
  onRetake: () => void;
  onBack: () => void;
}

export default function PhotoEditor({ 
  template, 
  photos, 
  stickers, 
  initialPlacedStickers,
  initialFilterSettings,
  initialBackgroundColor,
  onComplete, 
  onRetake, 
  onBack 
}: PhotoEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [placedStickers, setPlacedStickers] = useState<PlacedSticker[]>(initialPlacedStickers);
  const [filterSettings, setFilterSettings] = useState<FilterSettings>(initialFilterSettings);
  const [backgroundColor, setBackgroundColor] = useState(initialBackgroundColor);
  const [selectedStickerCategory, setSelectedStickerCategory] = useState<string>('cute');
  const [selectedPlacedSticker, setSelectedPlacedSticker] = useState<string | null>(null);
  const [history, setHistory] = useState<PlacedSticker[][]>([initialPlacedStickers]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDraggingOnCanvas, setIsDraggingOnCanvas] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [customStickers, setCustomStickers] = useState<Sticker[]>([]);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // Combine default and custom stickers
  const allStickers = [...stickers, ...customStickers];

  // Canvas dimensions based on template
  const canvasWidth = 800;
  const canvasHeight = template.layout.includes('strip') ? 1200 : 
                       template.layout.includes('polaroid') ? 1000 : 800;

  // Initialize canvas with photos
  useEffect(() => {
    renderCanvas();
  }, [photos, placedStickers, filterSettings, backgroundColor, template]);

  // Render canvas with all layers
  const renderCanvas = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsProcessing(true);

    // Clear canvas
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate photo positions based on template layout
    const photoPositions = calculatePhotoPositions(template, canvas.width, canvas.height);

    // Draw photos
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const pos = photoPositions[i];
      
      if (photo && pos) {
        await drawPhotoWithFilters(ctx, photo.dataUrl, pos, filterSettings);
      }
    }

    // Draw placed stickers
    for (const sticker of placedStickers) {
      await drawSticker(ctx, sticker);
    }

    // Draw template frame overlay (always on top)
    await drawTemplateFrame(ctx, template, canvas.width, canvas.height);

    setIsProcessing(false);
  };

  // Calculate photo positions based on template layout
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

  // Draw photo with filters applied
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
        
        // Create clipping path for rounded corners
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
        
        // Apply filters using composite operations
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

  // Draw sticker on canvas - more responsive
  const drawSticker = (ctx: CanvasRenderingContext2D, sticker: PlacedSticker): Promise<void> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.save();
        ctx.translate(sticker.x, sticker.y);
        ctx.rotate((sticker.rotation * Math.PI) / 180);
        ctx.scale(sticker.scale, sticker.scale);
        
        // Responsive sticker size based on canvas
        const baseSize = 60;
        const size = baseSize * (sticker.scale || 1);
        ctx.drawImage(img, -size / 2, -size / 2, size, size);
        
        // Selection indicator with better visibility
        if (selectedPlacedSticker === sticker.id) {
          // Outer glow
          ctx.shadowColor = '#FF69B4';
          ctx.shadowBlur = 15;
          ctx.strokeStyle = '#FF69B4';
          ctx.lineWidth = 3;
          ctx.setLineDash([8, 4]);
          ctx.strokeRect(-size / 2 - 8, -size / 2 - 8, size + 16, size + 16);
          ctx.shadowBlur = 0;
          
          // Corner handles for resize
          ctx.fillStyle = '#FF69B4';
          const handleSize = 8;
          // Top-left
          ctx.fillRect(-size / 2 - 8 - handleSize/2, -size / 2 - 8 - handleSize/2, handleSize, handleSize);
          // Top-right
          ctx.fillRect(size / 2 + 8 - handleSize/2, -size / 2 - 8 - handleSize/2, handleSize, handleSize);
          // Bottom-left
          ctx.fillRect(-size / 2 - 8 - handleSize/2, size / 2 + 8 - handleSize/2, handleSize, handleSize);
          // Bottom-right
          ctx.fillRect(size / 2 + 8 - handleSize/2, size / 2 + 8 - handleSize/2, handleSize, handleSize);
        }
        
        ctx.restore();
        resolve();
      };
      img.onerror = () => resolve();
      img.src = sticker.src;
    });
  };

  // Draw template frame overlay using the selected template's image
  const drawTemplateFrame = (
    ctx: CanvasRenderingContext2D, 
    template: PhotoTemplate, 
    width: number, 
    height: number
  ): Promise<void> => {
    return new Promise((resolve) => {
      if (!template.previewImage) {
        // Fallback to default frame if no template image
        drawDefaultFrame(ctx, width, height);
        resolve();
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.save();
        // Draw template image as overlay
        ctx.globalAlpha = 0.95;
        ctx.drawImage(img, 0, 0, width, height);
        ctx.restore();
        resolve();
      };
      img.onerror = () => {
        // Fallback to default frame on error
        drawDefaultFrame(ctx, width, height);
        resolve();
      };
      img.src = template.previewImage;
    });
  };

  // Default frame overlay
  const drawDefaultFrame = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    
    // Add decorative border
    ctx.strokeStyle = '#FF69B4';
    ctx.lineWidth = 8;
    ctx.setLineDash([20, 10]);
    ctx.strokeRect(10, 10, width - 20, height - 20);
    
    // Add corner decorations
    const cornerSize = 40;
    ctx.fillStyle = '#FFB6C1';
    
    // Top-left corner
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(cornerSize, 0);
    ctx.lineTo(0, cornerSize);
    ctx.closePath();
    ctx.fill();
    
    // Top-right corner
    ctx.beginPath();
    ctx.moveTo(width, 0);
    ctx.lineTo(width - cornerSize, 0);
    ctx.lineTo(width, cornerSize);
    ctx.closePath();
    ctx.fill();
    
    // Bottom-left corner
    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(cornerSize, height);
    ctx.lineTo(0, height - cornerSize);
    ctx.closePath();
    ctx.fill();
    
    // Bottom-right corner
    ctx.beginPath();
    ctx.moveTo(width, height);
    ctx.lineTo(width - cornerSize, height);
    ctx.lineTo(width, height - cornerSize);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
  };

  // Handle sticker click to place immediately
  const handleStickerClick = (sticker: Sticker) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const x = canvas.width / 2;
    const y = canvas.height / 2;

    const newPlacedSticker: PlacedSticker = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      stickerId: sticker.id,
      src: sticker.src,
      x,
      y,
      scale: 1,
      rotation: 0,
    };

    const newStickers = [...placedStickers, newPlacedSticker];
    setPlacedStickers(newStickers);
    addToHistory(newStickers);
    setSelectedPlacedSticker(newPlacedSticker.id);
    toast.success('Sticker added! Drag to move');
  };

  // Handle canvas mouse down for moving stickers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Check if clicking on a sticker - more responsive hit area
    const clickedSticker = placedStickers.find(s => {
      const dx = x - s.x;
      const dy = y - s.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < 60 * (s.scale || 1); // Increased hit area
    });
    
    if (clickedSticker) {
      setSelectedPlacedSticker(clickedSticker.id);
      setIsDraggingOnCanvas(true);
      setDragOffset({ x: x - clickedSticker.x, y: y - clickedSticker.y });
    } else {
      setSelectedPlacedSticker(null);
    }
  };

  // Handle canvas mouse move for dragging stickers
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingOnCanvas || !selectedPlacedSticker || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const newStickers = placedStickers.map(s => {
      if (s.id === selectedPlacedSticker) {
        return { ...s, x: x - dragOffset.x, y: y - dragOffset.y };
      }
      return s;
    });
    
    setPlacedStickers(newStickers);
  };

  // Handle canvas mouse up
  const handleCanvasMouseUp = () => {
    if (isDraggingOnCanvas) {
      addToHistory(placedStickers);
    }
    setIsDraggingOnCanvas(false);
  };

  // Handle touch events for mobile
  const handleCanvasTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    
    const clickedSticker = placedStickers.find(s => {
      const dx = x - s.x;
      const dy = y - s.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < 60 * (s.scale || 1);
    });
    
    if (clickedSticker) {
      setSelectedPlacedSticker(clickedSticker.id);
      setIsDraggingOnCanvas(true);
      setDragOffset({ x: x - clickedSticker.x, y: y - clickedSticker.y });
    } else {
      setSelectedPlacedSticker(null);
    }
  };

  const handleCanvasTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDraggingOnCanvas || !selectedPlacedSticker || !canvasRef.current) return;
    
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;
    
    const newStickers = placedStickers.map(s => {
      if (s.id === selectedPlacedSticker) {
        return { ...s, x: x - dragOffset.x, y: y - dragOffset.y };
      }
      return s;
    });
    
    setPlacedStickers(newStickers);
  };

  const handleCanvasTouchEnd = () => {
    if (isDraggingOnCanvas) {
      addToHistory(placedStickers);
    }
    setIsDraggingOnCanvas(false);
  };

  // Add to history for undo/redo
  const addToHistory = (newStickers: PlacedSticker[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newStickers]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setPlacedStickers([...history[historyIndex - 1]]);
    }
  };

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setPlacedStickers([...history[historyIndex + 1]]);
    }
  };

  // Delete selected sticker
  const handleDeleteSticker = () => {
    if (selectedPlacedSticker) {
      const newStickers = placedStickers.filter(s => s.id !== selectedPlacedSticker);
      setPlacedStickers(newStickers);
      addToHistory(newStickers);
      setSelectedPlacedSticker(null);
    }
  };

  // Update sticker transform
  const updateStickerTransform = (id: string, updates: Partial<PlacedSticker>) => {
    const newStickers = placedStickers.map(s => 
      s.id === id ? { ...s, ...updates } : s
    );
    setPlacedStickers(newStickers);
  };

  // Handle filter preset click with toggle behavior
  const handleFilterClick = (presetName: string, presetSettings: Record<string, unknown>) => {
    if (activeFilter === presetName) {
      // Same filter clicked - remove it (reset to normal)
      setActiveFilter(null);
      setFilterSettings({
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
      });
    } else {
      // Different filter clicked - replace previous filter
      setActiveFilter(presetName);
      setFilterSettings(prev => ({
        ...prev,
        ...presetSettings,
      }));
    }
  };

  // Add custom sticker from file
  const handleStickerFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newSticker: Sticker = {
          id: `custom-${Date.now()}`,
          src: event.target?.result as string,
          category: 'cute',
          name: file.name,
        };
        setCustomStickers([...customStickers, newSticker]);
        toast.success('Custom sticker added!');
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle complete
  const handleComplete = () => {
    onComplete(placedStickers, filterSettings, backgroundColor);
    toast.success('Editing complete!');
  };

  // Enhanced filter presets
  const filterPresets = [
    { name: 'Normal', icon: Sun, settings: { blackAndWhite: false, vintage: false, vhs: false, mirror: false, brightness: 100, contrast: 100, saturation: 100, blur: 0 } },
    { name: 'B&W', icon: Contrast, settings: { blackAndWhite: true, vintage: false, vhs: false, brightness: 100, contrast: 110 } },
    { name: 'Vintage', icon: Film, settings: { vintage: true, brightness: 115, contrast: 85, saturation: 80 } },
    { name: 'VHS', icon: Zap, settings: { vhs: true, brightness: 105, contrast: 95, saturation: 120 } },
    { name: 'Mirror', icon: FlipHorizontal, settings: { mirror: true } },
    { name: 'Pixel', icon: Grid3X3, settings: { pixelate: 8 } },
    { name: 'Fisheye', icon: Aperture, settings: { fisheye: true } },
    { name: 'Beauty', icon: Sparkles, settings: { beauty: 60, brightness: 108, contrast: 95, blur: 1 } },
    { name: 'Warm', icon: Sun, settings: { vintage: true, brightness: 110, contrast: 100, saturation: 110 } },
    { name: 'Cool', icon: Zap, settings: { brightness: 105, contrast: 105, saturation: 90 } },
    { name: 'Dramatic', icon: Contrast, settings: { contrast: 130, brightness: 90 } },
    { name: 'Soft', icon: Sparkles, settings: { blur: 2, brightness: 105, contrast: 90 } },
  ];

  // Extended background colors
  const bgColors = [
    // Pinks
    '#FFE4EC', '#FFF0F5', '#FFB6C1', '#FFC0CB', '#FF69B4', '#FF1493', '#DB7093',
    // Purples
    '#F0E6FF', '#E6E6FA', '#DDA0DD', '#DA70D6', '#BA55D3', '#9370DB', '#8A2BE2',
    // Blues
    '#E6F3FF', '#B0E0E6', '#87CEEB', '#87CEFA', '#00BFFF', '#1E90FF', '#4169E1',
    // Greens
    '#E6FFE6', '#98FB98', '#90EE90', '#00FA9A', '#00FF7F', '#3CB371', '#2E8B57',
    // Yellows/Oranges
    '#FFF5E6', '#FFFACD', '#FFE4B5', '#FFD700', '#FFA500', '#FF8C00', '#FF7F50',
    // Reds
    '#FFE6E6', '#FFC0CB', '#FFB6C1', '#FF69B4', '#FF1493', '#DC143C', '#B22222',
    // Neutrals
    '#FFFFFF', '#F5F5DC', '#FAEBD7', '#FFE4C4', '#D2B48C', '#BC8F8F', '#8B4513',
    // Dark
    '#2C2C2C', '#1A1A1A', '#0D0D0D', '#000000',
  ];

  return (
    <div className="min-h-screen py-4 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-4">
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
              Edit Photos
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Template: {template.name}
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="lg"
              onClick={handleUndo}
              disabled={historyIndex === 0}
              className="rounded-full w-10 h-10 p-0"
            >
              <Undo className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={handleRedo}
              disabled={historyIndex === history.length - 1}
              className="rounded-full w-10 h-10 p-0"
            >
              <Redo className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas Area */}
        <div className="lg:col-span-2">
          <Card className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <div ref={canvasContainerRef} className="relative flex justify-center">
              <canvas
                ref={canvasRef}
                width={canvasWidth}
                height={canvasHeight}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                onMouseLeave={handleCanvasMouseUp}
                onTouchStart={handleCanvasTouchStart}
                onTouchMove={handleCanvasTouchMove}
                onTouchEnd={handleCanvasTouchEnd}
                className={`max-w-full h-auto border rounded-lg shadow-inner ${
                  isDraggingOnCanvas ? 'cursor-grabbing' : 'cursor-crosshair'
                }`}
                style={{ maxHeight: '60vh' }}
              />
              
              {isProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500" />
                </div>
              )}
            </div>
            
            {/* Selected Sticker Controls */}
            {selectedPlacedSticker && (
              <div className="mt-4 p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium flex items-center gap-2">
                    <Move className="w-4 h-4" />
                    Sticker Controls
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteSticker}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">Scale</label>
                    <Slider
                      value={[placedStickers.find(s => s.id === selectedPlacedSticker)?.scale || 1]}
                      onValueChange={([value]) => 
                        updateStickerTransform(selectedPlacedSticker, { scale: value })
                      }
                      min={0.3}
                      max={5}
                      step={0.1}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-600 dark:text-gray-400">Rotation</label>
                    <Slider
                      value={[placedStickers.find(s => s.id === selectedPlacedSticker)?.rotation || 0]}
                      onValueChange={([value]) => 
                        updateStickerTransform(selectedPlacedSticker, { rotation: value })
                      }
                      min={-180}
                      max={180}
                      step={5}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Drag sticker to move • Use sliders to resize/rotate
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Controls Panel */}
        <div className="space-y-4">
          <Tabs defaultValue="filters" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="stickers">Stickers</TabsTrigger>
              <TabsTrigger value="background">BG</TabsTrigger>
            </TabsList>
            
            {/* Filters Tab */}
            <TabsContent value="filters" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Filter Presets</h3>
                <div className="grid grid-cols-4 gap-2">
                  {filterPresets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => handleFilterClick(preset.name, preset.settings)}
                      className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                        activeFilter === preset.name
                          ? 'bg-pink-500 text-white'
                          : 'hover:bg-pink-50 dark:hover:bg-pink-900/20'
                      }`}
                    >
                      <preset.icon className={`w-6 h-6 mb-1 ${activeFilter === preset.name ? 'text-white' : 'text-pink-500'}`} />
                      <span className="text-xs">{preset.name}</span>
                    </button>
                  ))}
                </div>
              </Card>
              
              <Card className="p-4 space-y-4">
                <h3 className="font-semibold">Adjustments</h3>
                
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 flex justify-between">
                    <span>Brightness</span>
                    <span>{filterSettings.brightness}%</span>
                  </label>
                  <Slider
                    value={[filterSettings.brightness]}
                    onValueChange={([value]) => setFilterSettings(prev => ({ ...prev, brightness: value }))}
                    min={50}
                    max={150}
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 flex justify-between">
                    <span>Contrast</span>
                    <span>{filterSettings.contrast}%</span>
                  </label>
                  <Slider
                    value={[filterSettings.contrast]}
                    onValueChange={([value]) => setFilterSettings(prev => ({ ...prev, contrast: value }))}
                    min={50}
                    max={150}
                  />
                </div>
                
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 flex justify-between">
                    <span>Blur</span>
                    <span>{filterSettings.blur}px</span>
                  </label>
                  <Slider
                    value={[filterSettings.blur]}
                    onValueChange={([value]) => setFilterSettings(prev => ({ ...prev, blur: value }))}
                    min={0}
                    max={10}
                  />
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setActiveFilter(null);
                    setFilterSettings({
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
                    });
                  }}
                  className="w-full"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Filters
                </Button>
              </Card>
            </TabsContent>
            
            {/* Stickers Tab */}
            <TabsContent value="stickers" className="space-y-4">
              <Card className="p-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {stickerCategories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedStickerCategory(cat.id)}
                      className={`px-3 py-1 rounded-full text-xs ${
                        selectedStickerCategory === cat.id
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {cat.icon} {cat.name}
                    </button>
                  ))}
                </div>
                
                {/* Add Custom Sticker Button */}
                <div className="mb-3">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleStickerFileSelect}
                    accept="image/*"
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Add Custom Sticker
                  </Button>
                </div>
                
                <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto">
                  {allStickers
                    .filter(s => s.category === selectedStickerCategory)
                    .map((sticker) => (
                      <div
                        key={sticker.id}
                        onClick={() => handleStickerClick(sticker)}
                        className="aspect-square bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-center cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors overflow-hidden sticker-grid-item"
                      >
                        <img 
                          src={sticker.src} 
                          alt={sticker.name}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="%23FF69B4" stroke-width="2"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3Cpath d="M12 8v8M8 12h8"/%3E%3C/svg%3E';
                          }}
                        />
                      </div>
                    ))}
                </div>
                
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Click stickers to add • Touch & drag to move
                </p>
              </Card>
            </TabsContent>
            
            {/* Background Tab */}
            <TabsContent value="background" className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Background Color</h3>
                <div className="grid grid-cols-7 gap-2 max-h-64 overflow-y-auto">
                  {bgColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setBackgroundColor(color)}
                      className={`aspect-square rounded-lg border-2 transition-all bg-color-btn ${
                        backgroundColor === color ? 'border-pink-500 scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Action Buttons */}
          <div className="space-y-2">
            <Button
              onClick={handleComplete}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white"
            >
              <Check className="w-4 h-4 mr-2" />
              Preview & Download
            </Button>
            
            <Button
              variant="outline"
              onClick={onRetake}
              className="w-full"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retake Photos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
