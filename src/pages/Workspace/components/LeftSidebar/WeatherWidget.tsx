import { mockWeather } from '@workspace/lib/mockData';

const WeatherWidget = () => {
  const temperature = Number.parseInt(mockWeather.temperature, 10);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-surface px-3 py-2.5">
      <span className="text-2xl leading-none" role="img" aria-label={mockWeather.label}>
        ☀️
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="text-sm font-semibold text-foreground">{Number.isNaN(temperature) ? mockWeather.temperature : `${temperature}°C`}</span>
          <span className="truncate text-xs text-muted-foreground">{mockWeather.label}</span>
        </div>
        <div className="mt-0.5 text-[10px] text-muted-foreground">서울 · {mockWeather.detail}</div>
      </div>
    </div>
  );
};

export default WeatherWidget;
