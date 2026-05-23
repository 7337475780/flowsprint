import type { User } from '../../../api/authApi.js';

interface AssigneeSelectProps {
  value: string;
  onChange: (value: string) => void;
  members: User[];
  disabled?: boolean;
}

export default function AssigneeSelect({ value, onChange, members, disabled }: AssigneeSelectProps) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 text-sm rounded-lg border bg-background outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
    >
      <option value="">Unassigned</option>
      {members.map((m) => (
        <option key={m._id} value={m._id}>
          {m.name} ({m.email})
        </option>
      ))}
    </select>
  );
}
