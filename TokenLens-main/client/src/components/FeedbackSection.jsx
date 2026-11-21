// src/components/FeedbackSection.jsx
// Generic, reusable section for rendering a titled list of feedback
// cards. Strengths, Issues, and Suggestions all reuse this component
// with different colors/icons/copy to avoid duplicated markup.

const VARIANTS = {
  good: {
    border: 'border-good/25',
    bg: 'bg-good/10',
    text: 'text-good',
    marker: '✓',
  },
  bad: {
    border: 'border-bad/25',
    bg: 'bg-bad/10',
    text: 'text-bad',
    marker: '!',
  },
  info: {
    border: 'border-info/25',
    bg: 'bg-info/10',
    text: 'text-info',
    marker: '→',
  },
};

export default function FeedbackSection({ title, icon: Icon, items, variant, emptyLabel }) {
  const v = VARIANTS[variant];

  return (
    <section className="animate-fadeUp">
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon size={16} className={v.text} />}
        <h3 className="text-sm font-semibold text-slate-200">{title}</h3>
        <span className="text-xs text-slate-600 font-mono">({items.length})</span>
      </div>

      {items.length === 0 ? (
        <p className="text-xs text-slate-600 italic">{emptyLabel}</p>
      ) : (
        <ul className="grid sm:grid-cols-2 gap-2.5">
          {items.map((item, i) => (
            <li
              key={i}
              className={`flex items-start gap-2.5 rounded-xl border ${v.border} ${v.bg} px-4 py-3 text-sm text-slate-200 leading-snug`}
            >
              <span className={`shrink-0 font-bold ${v.text}`}>{v.marker}</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
