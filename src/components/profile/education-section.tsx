import { Plus, Trash2 } from 'lucide-react';
import type { Education } from '../../types';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { generateId } from '../../lib/utils';

interface Props {
  items: Education[];
  onChange: (items: Education[]) => void;
}

export function EducationSection({ items, onChange }: Props) {
  function add() {
    onChange([...items, { id: generateId(), institution: '', degree: '', field: '', startDate: '', description: '' }]);
  }

  function update(id: string, field: keyof Education, value: string) {
    onChange(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)));
  }

  function remove(id: string) {
    onChange(items.filter((item) => item.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="annotation text-text-muted">education</span>
        <Button variant="secondary" size="sm" onClick={add}>
          <Plus className="h-3.5 w-3.5" />
          Add
        </Button>
      </div>
      {items.length === 0 && (
        <p className="text-[10px] font-mono text-text-dim py-6 text-center tracking-wide">
          No education added yet.
        </p>
      )}
      {items.map((item) => (
        <Card key={item.id}>
          <CardContent className="space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <Input label="Institution" value={item.institution} onChange={(e) => update(item.id, 'institution', e.target.value)} placeholder="Stanford University" />
                <Input label="Degree" value={item.degree} onChange={(e) => update(item.id, 'degree', e.target.value)} placeholder="Bachelor of Science" />
                <Input label="Field of Study" value={item.field} onChange={(e) => update(item.id, 'field', e.target.value)} placeholder="Computer Science" />
                <div className="grid grid-cols-2 gap-2">
                  <Input label="Start Date" value={item.startDate} onChange={(e) => update(item.id, 'startDate', e.target.value)} placeholder="2016-09" />
                  <Input label="End Date" value={item.endDate || ''} onChange={(e) => update(item.id, 'endDate', e.target.value)} placeholder="2020-06" />
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => remove(item.id)} className="mt-5">
                <Trash2 className="h-3.5 w-3.5 text-danger" />
              </Button>
            </div>
            <Textarea
              label="Description"
              value={item.description}
              onChange={(e) => update(item.id, 'description', e.target.value)}
              placeholder="Relevant coursework, honors, activities..."
              rows={2}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
