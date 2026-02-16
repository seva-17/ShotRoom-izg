import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Check, Sparkles, Plus, Upload } from 'lucide-react';
import type { PhotoTemplate } from '@/types';
import { stickerCategories } from '@/data/stickers';
import { toast } from 'sonner';

interface TemplateSelectionProps {
  templates: PhotoTemplate[];
  onSelect: (template: PhotoTemplate) => void;
  onBack: () => void;
}

const categoryColors: Record<string, string> = {
  korean: 'bg-pink-100 text-pink-700 border-pink-200',
  polaroid: 'bg-amber-100 text-amber-700 border-amber-200',
  scrapbook: 'bg-rose-100 text-rose-700 border-rose-200',
  film: 'bg-slate-100 text-slate-700 border-slate-200',
  grid: 'bg-purple-100 text-purple-700 border-purple-200',
};

const categoryIcons: Record<string, string> = {
  korean: '🇰🇷',
  polaroid: '📸',
  scrapbook: '📖',
  film: '🎬',
  grid: '⊞',
};

export default function TemplateSelection({ templates, onSelect, onBack }: TemplateSelectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);
  const [customTemplates, setCustomTemplates] = useState<PhotoTemplate[]>([]);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateSlots, setNewTemplateSlots] = useState(4);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const allTemplates = [...templates, ...customTemplates];

  const filteredTemplates = selectedCategory === 'all' 
    ? allTemplates 
    : allTemplates.filter(t => t.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'All', icon: '✨' },
    ...stickerCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
    })),
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCustomTemplate = () => {
    if (!previewImage || !newTemplateName) {
      toast.error('Please select an image and enter template name');
      return;
    }
    
    const newTemplate: PhotoTemplate = {
      id: `custom-${Date.now()}`,
      name: newTemplateName,
      layout: 'grid-2x2',
      slots: newTemplateSlots,
      previewImage: previewImage,
      category: 'scrapbook',
    };
    
    setCustomTemplates([...customTemplates, newTemplate]);
    setNewTemplateName('');
    setNewTemplateSlots(4);
    setPreviewImage(null);
    setDialogOpen(false);
    toast.success('Custom template added!');
  };

  return (
    <div className="min-h-screen py-8 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
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
          
          <h2 className="text-2xl sm:text-3xl font-bold text-center bg-gradient-to-r from-pink-500 via-purple-500 to-rose-500 bg-clip-text text-transparent">
            Choose a Template
          </h2>
          
          <div className="w-24" /> {/* Spacer for centering */}
        </div>
        
        <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
          Select your favorite frame style for your photo strip! ✨
        </p>
      </div>

      {/* Category Filter */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-wrap justify-center gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`
                px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
                flex items-center gap-2
                ${selectedCategory === category.id
                  ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-105'
                  : 'bg-white/70 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 shadow-sm'
                }
              `}
            >
              <span>{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Add Template Button */}
      <div className="max-w-6xl mx-auto mb-6 flex justify-center">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Custom Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add Custom Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Template Name</label>
                <Input
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Enter template name"
                />
              </div>
              
              {/* File Upload */}
              <div>
                <label className="text-sm font-medium">Template Image</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept="image/*"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full mt-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose from Gallery
                </Button>
              </div>
              
              {previewImage && (
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium">Number of Photos</label>
                <div className="flex gap-2 mt-1">
                  {[2, 3, 4, 6].map((num) => (
                    <button
                      key={num}
                      onClick={() => setNewTemplateSlots(num)}
                      className={`px-4 py-2 rounded-lg ${
                        newTemplateSlots === num
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 dark:bg-gray-700'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
              
              <Button onClick={handleAddCustomTemplate} className="w-full">
                Add Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredTemplates.map((template, index) => (
            <Card
              key={template.id}
              onClick={() => onSelect(template)}
              onMouseEnter={() => setHoveredTemplate(template.id)}
              onMouseLeave={() => setHoveredTemplate(null)}
              className={`
                relative cursor-pointer overflow-hidden transition-all duration-300 template-card
                ${hoveredTemplate === template.id ? 'scale-105 shadow-2xl' : 'shadow-lg'}
                ${hoveredTemplate === template.id ? 'ring-4 ring-pink-400 ring-offset-2' : ''}
              `}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Template Preview */}
              <div className="aspect-[3/4] relative bg-gradient-to-br from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 overflow-hidden">
                {/* Template Thumbnail Image */}
                {template.previewImage ? (
                  <img
                    src={template.previewImage}
                    alt={template.name}
                    className="w-full h-full object-cover template-thumbnail"
                    onError={(e) => {
                      // Fallback to placeholder if image fails to load
                      (e.target as HTMLImageElement).style.display = 'none';
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'absolute inset-4 border-2 border-dashed border-pink-300 dark:border-pink-600 rounded-lg flex flex-col items-center justify-center';
                        fallback.innerHTML = `
                          <div class="text-4xl mb-2">${categoryIcons[template.category] || '📷'}</div>
                          <div class="text-xs text-center text-gray-500 dark:text-gray-400">${template.layout}</div>
                          <div class="text-lg font-bold text-pink-500 mt-1">${template.slots} pics</div>
                        `;
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <div className="absolute inset-4 border-2 border-dashed border-pink-300 dark:border-pink-600 rounded-lg flex flex-col items-center justify-center">
                    <div className="text-4xl mb-2">{categoryIcons[template.category] || '📷'}</div>
                    <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                      {template.layout}
                    </div>
                    <div className="text-lg font-bold text-pink-500 mt-1">
                      {template.slots} pics
                    </div>
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className={`
                  absolute inset-0 bg-gradient-to-t from-pink-500/90 to-purple-500/90
                  flex items-center justify-center transition-opacity duration-300
                  ${hoveredTemplate === template.id ? 'opacity-100' : 'opacity-0'}
                `}>
                  <div className="text-white text-center">
                    <Check className="w-12 h-12 mx-auto mb-2" />
                    <span className="font-bold">Select</span>
                  </div>
                </div>
              </div>
              
              {/* Template Info */}
              <div className="p-3 bg-white dark:bg-gray-800">
                <h3 className="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">
                  {template.name}
                </h3>
                <Badge 
                  variant="outline" 
                  className={`mt-1 text-xs ${categoryColors[template.category]}`}
                >
                  {template.category}
                </Badge>
              </div>
              
              {/* Selected Indicator */}
              {hoveredTemplate === template.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-pink-500" />
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Info */}
      <div className="max-w-6xl mx-auto mt-12 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {filteredTemplates.length} templates available • Click &quot;Add Custom Template&quot; to add your own! 🎉
        </p>
      </div>
    </div>
  );
}
