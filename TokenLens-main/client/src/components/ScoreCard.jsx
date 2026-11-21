// src/components/ScoreCard.jsx
// Displays the prompt score (0-100) as a color-coded radial gauge.
// Green 90-100, Yellow 70-89, Red below 70.
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';

function scoreColor(score) {
  if (score >= 90) return '#34d399'; // good
  if (score >= 70) return '#fbbf24'; // warn
  return '#f87171'; // bad
}

function scoreLabel(score) {
  if (score >= 90) return 'Excellent';
  if (score >= 70) return 'Needs polish';
  return 'Weak prompt';
}

export default function ScoreCard({ score }) {
  const color = scoreColor(score);
  const data = [{ name: 'score', value: score, fill: color }];

  return (
    <div className="glass-panel p-5 flex flex-col items-center animate-fadeUp">
      <span className="text-xs font-medium text-slate-400 self-start mb-1">Prompt Score</span>
      <div className="relative w-[140px] h-[140px]">
        <RadialBarChart
          width={140}
          height={140}
          cx="50%"
          cy="50%"
          innerRadius="72%"
          outerRadius="100%"
          barSize={10}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
          <RadialBar background={{ fill: 'rgba(255,255,255,0.06)' }} dataKey="value" cornerRadius={10} />
        </RadialBarChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-display font-semibold" style={{ color }}>
            {score}
          </span>
          <span className="text-[10px] text-slate-500">/ 100</span>
        </div>
      </div>
      <span className="mt-2 text-xs font-medium" style={{ color }}>
        {scoreLabel(score)}
      </span>
    </div>
  );
}
