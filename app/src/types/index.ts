export type AppStep = 'home' | 'template' | 'camera' | 'capture' | 'edit' | 'preview' | 'download';

export interface FrameArea {
  x: number;
  y: number;
  width: number;
  height: number;
  radius?: number;
}

export interface PhotoTemplate {
  id: string;
  name: string;
  layout: 'strip-3' | 'strip-4' | 'polaroid-2' | 'polaroid-4' | 'grid-2x2' | 'grid-3x1' | 'scrapbook' | 'film-strip';
  slots: number;
  frameImage?: string;
  previewImage: string;
  category: 'korean' | 'polaroid' | 'scrapbook' | 'film' | 'grid';
  frameAreas?: FrameArea[];
  canvasWidth?: number;
  canvasHeight?: number;
}

export interface CapturedPhoto {
  id: string;
  dataUrl: string;
  timestamp: number;
}

export interface Sticker {
  id: string;
  src: string;
  category: 'cute' | 'scrapbook' | 'film' | 'vintage' | 'doodles' | 'sparkles';
  name: string;
}

export interface PlacedSticker {
  id: string;
  stickerId: string;
  src: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export interface FilterSettings {
  fisheye: boolean;
  blur: number;
  vintage: boolean;
  vhs: boolean;
  pixelate: number;
  mirror: boolean;
  blackAndWhite: boolean;
  beauty: number;
  brightness: number;
  contrast: number;
  saturation: number;
}

export interface PhotoSession {
  template: PhotoTemplate;
  photos: CapturedPhoto[];
  placedStickers: PlacedSticker[];
  filterSettings: FilterSettings;
  backgroundColor: string;
  timestamp: number;
}

export interface CameraSettings {
  facingMode: 'user' | 'environment';
  countdown: number;
  multiShotCount: number;
  flashEnabled: boolean;
}
