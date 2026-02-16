import type { PhotoTemplate } from '@/types';

export const defaultTemplates: PhotoTemplate[] = [
  // Korean Photobooth Strips
  {
    id: 'korean-strip-3',
    name: 'K-Strip 3',
    layout: 'strip-3',
    slots: 3,
    previewImage: '/templates/korean-strip-4.png',
    category: 'korean',
  },
  {
    id: 'korean-strip-4',
    name: 'K-Strip 4',
    layout: 'strip-4',
    slots: 4,
    previewImage: '/templates/korean-strip-4.png',
    category: 'korean',
  },
  {
    id: 'korean-strip-pink',
    name: 'Pink Dream',
    layout: 'strip-4',
    slots: 4,
    previewImage: '/templates/korean-strip-4.png',
    category: 'korean',
  },
  {
    id: 'korean-strip-purple',
    name: 'Purple Haze',
    layout: 'strip-4',
    slots: 4,
    previewImage: '/templates/korean-strip-4.png',
    category: 'korean',
  },
  
  // Polaroid Collages
  {
    id: 'polaroid-2',
    name: 'Polaroid Duo',
    layout: 'polaroid-2',
    slots: 2,
    previewImage: '/templates/polaroid-4.png',
    category: 'polaroid',
  },
  {
    id: 'polaroid-4',
    name: 'Polaroid Quad',
    layout: 'polaroid-4',
    slots: 4,
    previewImage: '/templates/polaroid-4.png',
    category: 'polaroid',
  },
  {
    id: 'always-forever',
    name: 'Always Forever',
    layout: 'polaroid-4',
    slots: 4,
    previewImage: '/templates/always-forever.png',
    category: 'polaroid',
  },
  
  // Scrapbook Frames
  {
    id: 'scrapbook-cute',
    name: 'Cute Scrapbook',
    layout: 'scrapbook',
    slots: 4,
    previewImage: '/templates/scrapbook-cute.png',
    category: 'scrapbook',
  },
  {
    id: 'toy-story',
    name: 'Toy Story',
    layout: 'scrapbook',
    slots: 2,
    previewImage: '/templates/toy-story.png',
    category: 'scrapbook',
  },
  
  // Film Strips
  {
    id: 'film-strip-35mm',
    name: '35mm Film',
    layout: 'film-strip',
    slots: 4,
    previewImage: '/templates/film-35mm.png',
    category: 'film',
  },
  {
    id: 'film-strip-cinema',
    name: 'Cinema Strip',
    layout: 'film-strip',
    slots: 3,
    previewImage: '/templates/film-35mm.png',
    category: 'film',
  },
  
  // Grid Layouts
  {
    id: 'grid-2x2',
    name: '2x2 Grid',
    layout: 'grid-2x2',
    slots: 4,
    previewImage: '/templates/polaroid-4.png',
    category: 'grid',
  },
  {
    id: 'grid-3x1',
    name: '3x1 Wide',
    layout: 'grid-3x1',
    slots: 3,
    previewImage: '/templates/navy-wedding.png',
    category: 'grid',
  },
  {
    id: 'woozi-grid',
    name: 'Woozi Grid',
    layout: 'grid-2x2',
    slots: 6,
    previewImage: '/templates/woozi-grid.png',
    category: 'grid',
  },
  {
    id: 'navy-wedding',
    name: 'Navy Wedding',
    layout: 'strip-3',
    slots: 3,
    previewImage: '/templates/navy-wedding.png',
    category: 'grid',
  },
];

export const getTemplateById = (id: string): PhotoTemplate | undefined => {
  return defaultTemplates.find(template => template.id === id);
};

export const getTemplatesByCategory = (category: PhotoTemplate['category']): PhotoTemplate[] => {
  return defaultTemplates.filter(template => template.category === category);
};
