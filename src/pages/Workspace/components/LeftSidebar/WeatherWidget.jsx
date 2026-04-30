import { CloudSun } from 'lucide-react';

import { WEATHER_MOCK } from '../../lib/mockData.js';

const WeatherWidget = () => (
  <section className="rounded-2xl border border-sand/60 bg-white/65 p-4">
    <div className="flex items-center gap-3">
      <CloudSun className="h-5 w-5 text-amber" />
      <div>
        <p className="text-sm font-semibold text-clay">{WEATHER_MOCK.condition} · {WEATHER_MOCK.temperature}</p>
        <p className="mt-1 text-xs text-clay/60">{WEATHER_MOCK.note}</p>
      </div>
    </div>
  </section>
);

export default WeatherWidget;

