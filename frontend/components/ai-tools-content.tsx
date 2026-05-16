'use client';

import { useState } from 'react';
import { MessageSquare, Sparkles, Wand2, Brain, Palette, Zap, Volume2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

interface AITool {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  usage: string;
}

const aiTools: AITool[] = [
  {
    id: 'name-gen',
    name: 'Name Generator',
    description: 'Generate creative names for games, characters, and items',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'bg-blue-500/20 text-blue-300',
    usage: 'Used 1,244 times this month',
  },
  {
    id: 'desc-writer',
    name: 'Description Writer',
    description: 'Write compelling game and feature descriptions',
    icon: <BookOpen className="w-5 h-5" />,
    color: 'bg-purple-500/20 text-purple-300',
    usage: 'Used 892 times this month',
  },
  {
    id: 'color-palette',
    name: 'Color Palette Generator',
    description: 'Generate cohesive color palettes for your games',
    icon: <Palette className="w-5 h-5" />,
    color: 'bg-pink-500/20 text-pink-300',
    usage: 'Used 567 times this month',
  },
  {
    id: 'dialogue-gen',
    name: 'Dialogue Generator',
    description: 'Create natural dialogue for NPCs and cutscenes',
    icon: <MessageSquare className="w-5 h-5" />,
    color: 'bg-green-500/20 text-green-300',
    usage: 'Used 1,823 times this month',
  },
  {
    id: 'audio-gen',
    name: 'Sound Effect Generator',
    description: 'Generate sound effects and ambient audio',
    icon: <Volume2 className="w-5 h-5" />,
    color: 'bg-yellow-500/20 text-yellow-300',
    usage: 'Used 456 times this month',
  },
  {
    id: 'idea-gen',
    name: 'Game Mechanic Ideas',
    description: 'Brainstorm innovative game mechanics',
    icon: <Brain className="w-5 h-5" />,
    color: 'bg-cyan-500/20 text-cyan-300',
    usage: 'Used 734 times this month',
  },
  {
    id: 'script-helper',
    name: 'Script Helper',
    description: 'Generate Lua scripts and code snippets',
    icon: <Wand2 className="w-5 h-5" />,
    color: 'bg-orange-500/20 text-orange-300',
    usage: 'Used 2,104 times this month',
  },
  {
    id: 'level-design',
    name: 'Level Design Assistant',
    description: 'Get suggestions for level layouts and progression',
    icon: <Zap className="w-5 h-5" />,
    color: 'bg-red-500/20 text-red-300',
    usage: 'Used 612 times this month',
  },
];

export function AIToolsContent() {
  const [selectedTool, setSelectedTool] = useState<AITool | null>(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleGenerate = () => {
    if (!input || !selectedTool) return;

    const outputs: Record<string, string> = {
      'name-gen': `Generated names: "${input} Quest", "${input} Chronicles", "${input} Legend"`,
      'desc-writer': `An immersive experience where ${input}. Perfect for modern gamers seeking adventure and challenge.`,
      'color-palette': `Primary: #7C3AED, Secondary: #EC4899, Accent: #06B6D4. Great for ${input} themed games.`,
      'dialogue-gen': `NPC: "Well, well, well... ${input}. I've been expecting you." / "This ${input} situation is getting interesting."`,
      'audio-gen': 'Generated 3 audio clips: ambient-loop-001.wav, ui-click-002.wav, explosion-003.wav',
      'idea-gen': `Mechanic: Dynamic ${input} system where player choices directly affect game world progression and NPC relationships.`,
      'script-helper': `local function ${input}()\n  print("Hello World")\n  return true\nend`,
      'level-design': `3-act structure: Tutorial (${input} basics), Challenge (escalating difficulty), Boss Battle (combined mechanics).`,
    };

    setOutput(outputs[selectedTool.id] || 'Output generated');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Tools</h1>
        <p className="text-sm text-muted-foreground mt-1">Accelerate your game development with AI-powered utilities</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Available Tools</h2>
          <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-2">
            {aiTools.map(tool => (
              <Card
                key={tool.id}
                onClick={() => setSelectedTool(tool)}
                className={`p-4 cursor-pointer transition-all border ${
                  selectedTool?.id === tool.id
                    ? 'bg-accent border-accent text-foreground'
                    : 'bg-secondary border-secondary-foreground/20 hover:border-accent/50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${tool.color}`}>
                    {tool.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-foreground">{tool.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                    <p className="text-xs text-muted-foreground/70 mt-2">{tool.usage}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {selectedTool && (
          <div className="space-y-4 bg-secondary border border-secondary-foreground/20 rounded-lg p-6">
            <div>
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selectedTool.color}`}>
                  {selectedTool.icon}
                </div>
                {selectedTool.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-2">{selectedTool.description}</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">Input</label>
                <Textarea
                  placeholder={`Enter text for ${selectedTool.name.toLowerCase()}...`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="bg-background border-background min-h-24 resize-none"
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!input}
                className="w-full bg-accent hover:bg-accent/90"
              >
                Generate
              </Button>

              {output && (
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Output</label>
                  <div className="bg-background border border-secondary-foreground/20 rounded-lg p-4 text-sm text-foreground min-h-24 max-h-32 overflow-y-auto">
                    {output}
                  </div>
                  <div className="flex gap-2 mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(output);
                      }}
                      className="flex-1"
                    >
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-secondary-foreground/20 pt-4">
              <p className="text-xs text-muted-foreground">
                💡 Pro Tip: Combine multiple tools for best results. Save frequently used outputs as templates.
              </p>
            </div>
          </div>
        )}
      </div>

      {!selectedTool && (
        <Card className="bg-secondary border-secondary-foreground/20 p-12 text-center">
          <p className="text-muted-foreground">Select an AI tool to get started</p>
        </Card>
      )}
    </div>
  );
}
