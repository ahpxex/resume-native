import type { Scenario } from '../../types';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

interface Props {
  value: Scenario;
  onChange: (scenario: Scenario) => void;
}

type ScenarioEditableField =
  | 'name'
  | 'targetRole'
  | 'targetCompany'
  | 'jobDescription'
  | 'customInstructions';

export function ScenarioForm({ value, onChange }: Props) {
  function update(field: ScenarioEditableField, val: string) {
    onChange({ ...value, [field]: val, updatedAt: Date.now() });
  }

  return (
    <div className="space-y-4">
      <Input
        label="Scenario Name"
        value={value.name}
        onChange={(e) => update('name', e.target.value)}
        placeholder="Senior Frontend at Google"
      />
      <Input
        label="Target Role"
        value={value.targetRole}
        onChange={(e) => update('targetRole', e.target.value)}
        placeholder="Senior Frontend Engineer"
      />
      <Input
        label="Target Company"
        value={value.targetCompany || ''}
        onChange={(e) => update('targetCompany', e.target.value)}
        placeholder="Google"
      />
      <Textarea
        label="Job Description"
        value={value.jobDescription || ''}
        onChange={(e) => update('jobDescription', e.target.value)}
        placeholder="Paste the full job description here..."
        rows={8}
      />
      <Textarea
        label="Custom Instructions"
        value={value.customInstructions || ''}
        onChange={(e) => update('customInstructions', e.target.value)}
        placeholder="e.g., Emphasize leadership experience, focus on React/TypeScript skills..."
        rows={3}
      />
    </div>
  );
}
