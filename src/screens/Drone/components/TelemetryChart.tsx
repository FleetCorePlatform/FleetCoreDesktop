import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LiveTelemetryData } from '@/screens/Drone/types';

interface TelemetryChartProps {
    title: string;
    data: { timestamp: number; data: LiveTelemetryData }[];
    getValue: (data: LiveTelemetryData) => number;
    unit?: string;
    color?: string;
    domain?: [number | 'auto', number | 'auto'];
    height?: number;
    fractionDigits?: number;
}

export function TelemetryChart({
       title,
       data,
       getValue,
       unit = '',
       color = '#10b981',
       domain = ['auto', 'auto'],
       height = 220,
       fractionDigits = 1,
   }: TelemetryChartProps) {
    const chartData = data.map(point => ({
        timestamp: point.timestamp,
        value: getValue(point.data)
    }));

    return (
        <div className="p-4">
            <p className="text-[10px] font-bold text-[hsl(var(--text-muted))] uppercase tracking-widest mb-4">
                {title}
            </p>
            <div className="relative">
                <ResponsiveContainer width="100%" height={height}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border-primary))" />
                        <XAxis
                            dataKey="timestamp"
                            tickFormatter={(ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            tick={{ fontSize: 10, fill: 'hsl(var(--text-muted))' }}
                        />
                        <YAxis
                            domain={domain}
                            tick={{ fontSize: 10, fill: 'hsl(var(--text-muted))' }}
                            tickFormatter={(v) => `${Number(v).toFixed(fractionDigits)}${unit}`}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--bg-tertiary))', border: '1px solid hsl(var(--border-primary))', borderRadius: 6, fontSize: 11 }}
                            labelFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                            formatter={(value) => [`${Number(value).toFixed(fractionDigits)}${unit}`, title]}
                        />
                        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
                    </LineChart>
                </ResponsiveContainer>

                {data.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <span className="text-xs text-[hsl(var(--text-muted))]">No telemetry available to display</span>
                    </div>
                )}
            </div>
        </div>
    );
}