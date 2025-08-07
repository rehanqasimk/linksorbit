'use client';

interface MetricsCardProps {
  label: string;
  value: string | number;
}

function MetricCard({ label, value }: MetricsCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="text-sm text-gray-400">{label}</div>
      <div className="text-xl font-semibold mt-1">{value}</div>
    </div>
  );
}

export default function MetricsCards() {
  return (
    <div className="grid grid-cols-4 gap-6">
      <MetricCard label="Clicks" value="0" />
      <MetricCard label="Conversion" value="0" />
      <MetricCard label="CR %" value="0" />
      <MetricCard label="Sale (US$)" value="$0" />
      <MetricCard label="Cpc (US$)" value="$0" />
      <MetricCard label="Commission (US$)" value="$0.00" />
    </div>
  );
}
