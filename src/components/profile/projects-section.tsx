import { Plus, Trash2 } from 'lucide-react';
import type { Project } from '../../types';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { generateId } from '../../lib/utils';

interface Props {
  items: Project[];
  onChange: (items: Project[]) => void;
}

export function ProjectsSection({ items, onChange }: Props) {
  function add() {
    onChange([...items, { id: generateId(), name: '', description: '', technologies: [] }]);
  }

  function update(id: string, updates: Partial<Project>) {
    onChange(items.map((item) => (item.id === id ? { ...item, ...updates } : item)));
  }

  function remove(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900">Projects</h3>
        <Button variant="secondary" size="sm" onClick={add}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
      {items.length === 0 && (
        <p className="text-sm text-zinc-400 py-4 text-center">No projects added yet.</p>
      )}
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <Input label="Project Name" value={item.name} onChange={(e) => update(item.id, { name: e.target.value })} placeholder="My Awesome Project" />
                <Input label="URL" value={item.url || ''} onChange={(e) => update(item.id, { url: e.target.value })} placeholder="https://github.com/..." />
              </div>
              <Button variant="ghost" size="sm" onClick={() => remove(item.id)} className="mt-6">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
            <Textarea
              label="Description"
              value={item.description}
              onChange={(e) => update(item.id, { description: e.target.value })}
              placeholder="Describe the project, its purpose, and your role..."
              rows={2}
            />
            <Input
              label="Technologies (comma-separated)"
              value={item.technologies.join(', ')}
              onChange={(e) => update(item.id, { technologies: e.target.value.split(',').map((t) => t.trim()).filter(Boolean) })}
              placeholder="React, TypeScript, Node.js"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
