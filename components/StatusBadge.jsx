import { STATUS_CONFIG } from '@/lib/constants';

export default function StatusBadge({ status }) {
  const { color, label } = STATUS_CONFIG[status] || { color: 'secondary', label: status };
  return <span className={`badge bg-${color} bg-opacity-75`}>{label}</span>;
}
