import { Plus, Trash2 } from 'lucide-react';
import type { WorkExperience } from '../../types';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { generateId } from '../../lib/utils';

interface Props {
  items: WorkExperience[];
  onChange: (items: WorkExperience[]) => void;
}

export function ExperienceSection({ items, onChange }: Props) {
  function add() {
    onChange([...items, { id: generateId(), company: '', position: '', startDate: '', description: '' }]);
  }

  function update(id: string, field: keyof WorkExperience, value: string) {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  function remove(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900">Work Experience</h3>
        <Button variant="secondary" size="sm" onClick={add}>
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>
      {items.length === 0 && (
        <p className="text-sm text-zinc-400 py-4 text-center">No work experience added yet.</p>
      )}
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <Input label="Company" value={item.company} onChange={(e) => update(item.id, 'company', e.target.value)} placeholder="Google" />
                <Input label="Position" value={item.position} onChange={(e) => update(item.id, 'position', e.target.value)} placeholder="Senior Frontend Engineer" />
                <Input label="Location" value={item.location || ''} onChange={(e) => update(item.id, 'location', e.target.value)} placeholder="Mountain View, CA" />
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Start Date" value={item.startDate} onChange={(e) => update(item.id, 'startDate', e.target.value)} placeholder="2020-01" />
                  <Input label="End Date" value={item.endDate || ''} onChange={(e) => update(item.id, 'endDate', e.target.value)} placeholder="Present" />
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => remove(item.id)} className="mt-6">
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
            <Textarea
              label="Description"
              value={item.description}
              onChange={(e) => update(item.id, 'description', e.target.value)}
              placeholder="Describe your role, responsibilities, and achievements..."
              rows={3}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
