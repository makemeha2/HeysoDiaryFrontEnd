import { CloudSun } from 'lucide-react';
import { mockWeather } from '../../lib/mockData';

export default function WeatherWidget() {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <CloudSun className="h-4 w-4 text-primary" />
        {mockWeather.label} {mockWeather.temperature}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{mockWeather.detail}</p>
    </div>
  );
}
