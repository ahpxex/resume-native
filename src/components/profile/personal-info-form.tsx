import type { PersonalInfo } from '../../types';
import { Input } from '../ui/input';

interface Props {
  value: PersonalInfo;
  onChange: (info: PersonalInfo) => void;
}

export function PersonalInfoForm({ value, onChange }: Props) {
  function update(field: keyof PersonalInfo, val: string) {
    onChange({ ...value, [field]: val });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input label="Full Name" value={value.fullName} onChange={(e) => update('fullName', e.target.value)} placeholder="John Doe" />
      <Input label="Email" type="email" value={value.email} onChange={(e) => update('email', e.target.value)} placeholder="john@example.com" />
      <Input label="Phone" value={value.phone || ''} onChange={(e) => update('phone', e.target.value)} placeholder="+1 555-0123" />
      <Input label="Location" value={value.location || ''} onChange={(e) => update('location', e.target.value)} placeholder="San Francisco, CA" />
      <Input label="Website" value={value.website || ''} onChange={(e) => update('website', e.target.value)} placeholder="https://johndoe.com" />
      <Input label="LinkedIn" value={value.linkedin || ''} onChange={(e) => update('linkedin', e.target.value)} placeholder="https://linkedin.com/in/johndoe" />
      <Input label="GitHub" value={value.github || ''} onChange={(e) => update('github', e.target.value)} placeholder="https://github.com/johndoe" />
    </div>
  );
}
