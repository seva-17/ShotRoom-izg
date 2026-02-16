import type { PhotoTemplate, FrameArea } from '@/types';

// Helper function to generate frame areas based on layout
const generateFrameAreas = (layout: string, slots: number): FrameArea[] => {
  const areas: FrameArea[] = [];
  const padding = 40;
  const canvasWidth = 800;
  const canvasHeight = layout.includes('strip') ? 1200 : 
                       layout.includes('polaroid') ? 1000 : 
                       layout === 'grid-3x1' ? 400 :
                       layout === 'film-strip' ? 1200 : 800;

  switch (layout) {
    case 'strip-3':
      const strip3Height = (canvasHeight - padding * 4) / 3;
      for (let i = 0; i < 3; i++) {
        areas.push({
          x: padding,
          y: padding + i * (strip3Height + padding),
          width: canvasWidth - padding * 2,
          height: strip3Height,
          radius: 8,
        });
      }
      break;

    case 'strip-4':
      const strip4Height = (canvasHeight - padding * 5) / 4;
      for (let i = 0; i < 4; i++) {
        areas.push({
          x: padding,
          y: padding + i * (strip4Height + padding),
          width: canvasWidth - padding * 2,
          height: strip4Height,
          radius: 8,
        });
      }
      break;

    case 'polaroid-2':
      const polaroid2Width = (canvasWidth - padding * 3) / 2;
      const polaroid2Height = polaroid2Width * 1.2;
      for (let i = 0; i < 2; i++) {
        areas.push({
          x: padding + i * (polaroid2Width + padding),
          y: padding,
          width: polaroid2Width,
          height: polaroid2Height,
          radius: 4,
        });
      }
      break;

    case 'polaroid-4':
      const polaroid4Width = (canvasWidth - padding * 3) / 2;
      const polaroid4Height = polaroid4Width * 1.2;
      for (let i = 0; i < 4; i++) {
        const row = Math.floor(i / 2);
        const col = i % 2;
        areas.push({
          x: padding + col * (polaroid4Width + padding),
          y: padding + row * (polaroid4Height + padding),
          width: polaroid4Width,
          height: polaroid4Height,
          radius: 4,
        });
      }
      break;

    case 'grid-2x2':
      const grid2Width = (canvasWidth - padding * 3) / 2;
      const gridHeight = (canvasHeight - padding * 3) / 2;
      
      if (slots === 4) {
        // Standard 2x2 grid
        for (let i = 0; i < 4; i++) {
          const row = Math.floor(i / 2);
          const col = i % 2;
          areas.push({
            x: padding + col * (grid2Width + padding),
            y: padding + row * (gridHeight + padding),
            width: grid2Width,
            height: gridHeight,
            radius: 8,
          });
        }
      } else if (slots === 6) {
        // 3x2 grid for 6 photos
        const widthFor3 = (canvasWidth - padding * 4) / 3;
        const heightFor3 = (canvasHeight - padding * 4) / 2;
        for (let i = 0; i < 6; i++) {
          const row = Math.floor(i / 3);
          const col = i % 3;
          areas.push({
            x: padding + col * (widthFor3 + padding),
            y: padding + row * (heightFor3 + padding),
            width: widthFor3,
            height: heightFor3,
            radius: 8,
          });
        }
      }
      break;

    case 'grid-3x1':
      const grid3Width = (canvasWidth - padding * 4) / 3;
      const grid3Height = canvasHeight - padding * 2;
      for (let i = 0; i < 3; i++) {
        areas.push({
          x: padding + i * (grid3Width + padding),
          y: padding,
          width: grid3Width,
          height: grid3Height,
          radius: 8,
        });
      }
      break;

    case 'scrapbook':
      // Scrapbook layout with irregular placement
      areas.push({ x: 50, y: 50, width: 300, height: 250, radius: 5 });
      areas.push({ x: 450, y: 80, width: 280, height: 220, radius: 5 });
      areas.push({ x: 100, y: 350, width: 280, height: 300, radius: 5 });
      areas.push({ x: 500, y: 380, width: 250, height: 280, radius: 5 });
      break;

    case 'film-strip':
      const filmHeight = (canvasHeight - padding * 5) / 4;
      for (let i = 0; i < 4; i++) {
        areas.push({
          x: padding + 60,
          y: padding + i * (filmHeight + padding),
          width: canvasWidth - padding * 2 - 120,
          height: filmHeight,
          radius: 2,
        });
      }
      break;

    default:
      const defaultHeight = (canvasHeight - padding * 5) / 4;
      for (let i = 0; i < 4; i++) {
        areas.push({
          x: padding,
          y: padding + i * (defaultHeight + padding),
          width: canvasWidth - padding * 2,
          height: defaultHeight,
          radius: 8,
        });
      }
  }

  return areas;
};

export const defaultTemplates: PhotoTemplate[] = [
  // Korean Photobooth Strips
  {
    id: 'korean-strip-3',
    name: 'K-Strip 3',
    layout: 'strip-3',
    slots: 3,
    previewImage: '/templates/korean-strip-4.png',
    category: 'korean',
    canvasWidth: 800,
    canvasHeight: 1200,
    frameAreas: generateFrameAreas('strip-3', 3),
  },
  {
    id: 'korean-strip-4',
    name: 'K-Strip 4',
    layout: 'strip-4',
    slots: 4,
    previewImage: '/templates/korean-strip-4.png',
    category: 'korean',
    canvasWidth: 800,
    canvasHeight: 1200,
    frameAreas: generateFrameAreas('strip-4', 4),
  },
  {
    id: 'korean-strip-pink',
    name: 'Pink Dream',
    layout: 'strip-4',
    slots: 4,
    previewImage: '/templates/korean-strip-4.png',
    category: 'korean',
    canvasWidth: 800,
    canvasHeight: 1200,
    frameAreas: generateFrameAreas('strip-4', 4),
  },
  {
    id: 'korean-strip-purple',
    name: 'Purple Haze',
    layout: 'strip-4',
    slots: 4,
    previewImage: '/templates/korean-strip-4.png',
    category: 'korean',
    canvasWidth: 800,
    canvasHeight: 1200,
    frameAreas: generateFrameAreas('strip-4', 4),
  },
  
  // Polaroid Collages
  {
    id: 'polaroid-2',
    name: 'Polaroid Duo',
    layout: 'polaroid-2',
    slots: 2,
    previewImage: '/templates/polaroid-4.png',
    category: 'polaroid',
    canvasWidth: 800,
    canvasHeight: 1000,
    frameAreas: generateFrameAreas('polaroid-2', 2),
  },
  {
    id: 'polaroid-4',
    name: 'Polaroid Quad',
    layout: 'polaroid-4',
    slots: 4,
    previewImage: '/templates/polaroid-4.png',
    category: 'polaroid',
    canvasWidth: 800,
    canvasHeight: 1000,
    frameAreas: generateFrameAreas('polaroid-4', 4),
  },
  {
    id: 'always-forever',
    name: 'Always Forever',
    layout: 'polaroid-4',
    slots: 4,
    previewImage: '/templates/always-forever.png',
    category: 'polaroid',
    canvasWidth: 800,
    canvasHeight: 1000,
    frameAreas: generateFrameAreas('polaroid-4', 4),
  },
  
  // Scrapbook Frames
  {
    id: 'scrapbook-cute',
    name: 'Cute Scrapbook',
    layout: 'scrapbook',
    slots: 4,
    previewImage: '/templates/scrapbook-cute.png',
    category: 'scrapbook',
    canvasWidth: 800,
    canvasHeight: 800,
    frameAreas: generateFrameAreas('scrapbook', 4),
  },
  {
    id: 'toy-story',
    name: 'Toy Story',
    layout: 'scrapbook',
    slots: 2,
    previewImage: '/templates/toy-story.png',
    category: 'scrapbook',
    canvasWidth: 800,
    canvasHeight: 800,
    frameAreas: generateFrameAreas('scrapbook', 2),
  },
  
  // Film Strips
  {
    id: 'film-strip-35mm',
    name: '35mm Film',
    layout: 'film-strip',
    slots: 4,
    previewImage: '/templates/film-35mm.png',
    category: 'film',
    canvasWidth: 800,
    canvasHeight: 1200,
    frameAreas: generateFrameAreas('film-strip', 4),
  },
  {
    id: 'film-strip-cinema',
    name: 'Cinema Strip',
    layout: 'film-strip',
    slots: 3,
    previewImage: '/templates/film-35mm.png',
    category: 'film',
    canvasWidth: 800,
    canvasHeight: 1200,
    frameAreas: generateFrameAreas('film-strip', 3),
  },
  
  // Grid Layouts
  {
    id: 'grid-2x2',
    name: '2x2 Grid',
    layout: 'grid-2x2',
    slots: 4,
    previewImage: '/templates/polaroid-4.png',
    category: 'grid',
    canvasWidth: 800,
    canvasHeight: 800,
    frameAreas: generateFrameAreas('grid-2x2', 4),
  },
  {
    id: 'grid-3x1',
    name: '3x1 Wide',
    layout: 'grid-3x1',
    slots: 3,
    previewImage: '/templates/navy-wedding.png',
    category: 'grid',
    canvasWidth: 800,
    canvasHeight: 400,
    frameAreas: generateFrameAreas('grid-3x1', 3),
  },
  {
    id: 'woozi-grid',
    name: 'Woozi Grid',
    layout: 'grid-2x2',
    slots: 6,
    previewImage: '/templates/woozi-grid.png',
    category: 'grid',
    canvasWidth: 800,
    canvasHeight: 1100,
    frameAreas: generateFrameAreas('grid-2x2', 6),
  },
  {
    id: 'navy-wedding',
    name: 'Navy Wedding',
    layout: 'strip-3',
    slots: 3,
    previewImage: '/templates/navy-wedding.png',
    category: 'grid',
    canvasWidth: 800,
    canvasHeight: 1200,
    frameAreas: generateFrameAreas('strip-3', 3),
  },
];

export const getTemplateById = (id: string): PhotoTemplate | undefined => {
  return defaultTemplates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: PhotoTemplate['category']): PhotoTemplate[] => {
  return defaultTemplates.filter(template => template.category === category);
};
