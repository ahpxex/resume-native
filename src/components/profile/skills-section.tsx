import { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface Props {
  items: string[];
  onChange: (items: string[]) => void;
}

export function SkillsSection({ items, onChange }: Props) {
  const [input, setInput] = useState('');

  function addSkill() {
    const skills = input.split(',').map((s) => s.trim()).filter((s) => s && !items.includes(s));
    if (skills.length > 0) {
      onChange([...items, ...skills]);
      setInput('');
    }
  }

  function removeSkill(skill: string) {
    onChange(items.filter((s) => s !== skill));
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-zinc-900">Skills</h3>
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            placeholder="Add skills (comma-separated)..."
          />
        </div>
        <Button variant="secondary" onClick={addSkill}>Add</Button>
      </div>
      {items.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items.map((skill) => (
            <span key={skill} className="inline-flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-sm text-primary-700">
              {skill}
              <button onClick={() => removeSkill(skill)} className="rounded-full p-0.5 hover:bg-primary-100">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
