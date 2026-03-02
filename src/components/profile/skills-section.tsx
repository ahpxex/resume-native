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
      <span className="annotation text-text-muted">skills</span>
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
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 text-accent font-mono text-[10px] rounded px-2.5 py-1"
            >
              {skill}
              <button
                onClick={() => removeSkill(skill)}
                className="rounded p-0.5 hover:bg-accent/20 transition-colors"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
