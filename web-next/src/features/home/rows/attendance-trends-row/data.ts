// Attendance & Micro-Trends Row data

// Helper: label formatter for Heatmap axes (days 1..7, hours 0..23)
export const formatHeatmapLabel = (label: number | string): string => {
  const days = [null, "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  if (typeof label === "number") {
    if (label >= 1 && label <= 7) return days[label];
    if (label >= 0 && label <= 23) return `${label}:00`;
  }
  return String(label);
};

// Generate weekday (Mon-Fri) vs hour (08..18) attendance intensity
// x = hour (8..18), y = day (1..5 => Mon..Fri), value = number of in-office check-ins
const weekdays = [1, 2, 3, 4, 5];
const workHours = Array.from({ length: 11 }, (_, i) => 8 + i); // 8..18

// Synthetic but plausible pattern: midday peaks, Fridays slightly lower
export const attendanceHeatmapData = weekdays.flatMap((day) =>
  workHours.map((hour) => {
    // Base by hour: peak around 11-15
    const hourPeak = Math.max(0, 15 - Math.abs(13 - hour) * 3);
    // Day adjustment: Fri a bit lower, Mon/Tue mid, Wed/Thu higher
    const dayAdj = day === 5 ? -3 : day === 3 || day === 4 ? 3 : 0;
    // Small wave to avoid flat lines
    const wave = ((day * 7 + hour * 11) % 6) - 3;

    const value = Math.max(0, 28 + hourPeak + dayAdj + wave);
    return { x: hour, y: day, value };
  })
);

// Micro-trends: in-office rate (%) for the last 14 days
export const microTrends = [
  { name: "D-13", value: 64 },
  { name: "D-12", value: 61 },
  { name: "D-11", value: 67 },
  { name: "D-10", value: 70 },
  { name: "D-9", value: 68 },
  { name: "D-8", value: 72 },
  { name: "D-7", value: 75 },
  { name: "D-6", value: 71 },
  { name: "D-5", value: 69 },
  { name: "D-4", value: 73 },
  { name: "D-3", value: 74 },
  { name: "D-2", value: 76 },
  { name: "D-1", value: 78 },
  { name: "Today", value: 77 },
];
