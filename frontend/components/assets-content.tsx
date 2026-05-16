'use client';

import { useState } from 'react';
import { Search, Upload, Download, Trash2, Grid3x3, List, Filter, Music, Image, Box } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Asset {
  id: string;
  name: string;
  type: 'model' | 'texture' | 'sound' | 'ui';
  size: string;
  date: string;
  tags: string[];
}

const mockAssets: Asset[] = [
  { id: '1', name: 'PlayerCharacter.glb', type: 'model', size: '2.4MB', date: '2024-05-10', tags: ['character', 'rigged'] },
  { id: '2', name: 'MetalTexture.png', type: 'texture', size: '512KB', date: '2024-05-08', tags: ['material', 'pbr'] },
  { id: '3', name: 'UIButton.glb', type: 'model', size: '128KB', date: '2024-05-07', tags: ['ui', 'interactive'] },
  { id: '4', name: 'Background.mp3', type: 'sound', size: '3.2MB', date: '2024-05-05', tags: ['music', 'ambient'] },
  { id: '5', name: 'GrassTexture.png', type: 'texture', size: '1.1MB', date: '2024-05-01', tags: ['terrain', 'pbr'] },
  { id: '6', name: 'SwordModel.glb', type: 'model', size: '892KB', date: '2024-04-28', tags: ['weapon', 'prop'] },
  { id: '7', name: 'ButtonClick.wav', type: 'sound', size: '156KB', date: '2024-04-25', tags: ['sfx', 'ui'] },
  { id: '8', name: 'TreeTexture.png', type: 'texture', size: '2.8MB', date: '2024-04-20', tags: ['nature', 'pbr'] },
];

export function AssetsContent() {
  const [searchTerm, setSearchTerm] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const filteredAssets = mockAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = !activeFilter || asset.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'model': return <Box className="w-4 h-4" />;
      case 'texture': return <Image className="w-4 h-4" />;
      case 'sound': return <Music className="w-4 h-4" />;
      default: return null;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'model': return 'bg-blue-500/20 text-blue-300';
      case 'texture': return 'bg-purple-500/20 text-purple-300';
      case 'sound': return 'bg-green-500/20 text-green-300';
      case 'ui': return 'bg-orange-500/20 text-orange-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Assets Library</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your 3D models, textures, and audio files</p>
        </div>
        <Button className="gap-2 bg-accent hover:bg-accent/90">
          <Upload className="w-4 h-4" />
          Upload Asset
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search assets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-secondary border-secondary-foreground/20"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'grid' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setView('grid')}
            className={view === 'grid' ? 'bg-accent hover:bg-accent/90' : ''}
          >
            <Grid3x3 className="w-4 h-4" />
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setView('list')}
            className={view === 'list' ? 'bg-accent hover:bg-accent/90' : ''}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeFilter === null ? 'default' : 'outline'}
          onClick={() => setActiveFilter(null)}
          size="sm"
          className={activeFilter === null ? 'bg-accent hover:bg-accent/90' : ''}
        >
          All Assets
        </Button>
        {['model', 'texture', 'sound', 'ui'].map(type => (
          <Button
            key={type}
            variant={activeFilter === type ? 'default' : 'outline'}
            onClick={() => setActiveFilter(type)}
            size="sm"
            className={activeFilter === type ? 'bg-accent hover:bg-accent/90' : ''}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}s
          </Button>
        ))}
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAssets.map(asset => (
            <Card key={asset.id} className="bg-secondary border-secondary-foreground/20 hover:border-accent/50 transition-colors p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center">
                  {getTypeIcon(asset.type)}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="w-8 h-8">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-8 h-8 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <h3 className="font-medium text-foreground truncate">{asset.name}</h3>
              <p className="text-xs text-muted-foreground">{asset.size}</p>
              <p className="text-xs text-muted-foreground mb-3">{asset.date}</p>
              <div className="flex flex-wrap gap-1">
                {asset.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className={`text-xs ${getTypeBadgeColor(asset.type)}`}>
                    {tag}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAssets.map(asset => (
            <Card key={asset.id} className="bg-secondary border-secondary-foreground/20 hover:border-accent/50 transition-colors p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center flex-shrink-0">
                    {getTypeIcon(asset.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground truncate">{asset.name}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">{asset.size}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">{asset.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="flex gap-1">
                    {asset.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className={`text-xs ${getTypeBadgeColor(asset.type)}`}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="w-8 h-8">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {filteredAssets.length === 0 && (
        <Card className="bg-secondary border-secondary-foreground/20 p-12 text-center">
          <p className="text-muted-foreground">No assets found. Try adjusting your filters.</p>
        </Card>
      )}
    </div>
  );
}
