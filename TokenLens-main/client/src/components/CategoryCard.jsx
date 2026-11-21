// src/components/CategoryCard.jsx
import { Tags, Bug, Code2, Wand2, BookOpen, MessagesSquare, Cpu } from 'lucide-react';

// Maps each known category to an icon; falls back to a generic tag icon.
const CATEGORY_ICONS = {
  'Code Generation': Code2,
  Debugging: Bug,
  Refactoring: Wand2,
  Documentation: BookOpen,
  'Code Explanation': MessagesSquare,
  'General Programming': Cpu,
};

export default function CategoryCard({ category }) {
  const Icon = CATEGORY_ICONS[category] || Tags;

  return (
    <div className="glass-panel p-5 flex flex-col justify-between animate-fadeUp">
      <span className="text-xs font-medium text-slate-400 mb-3">Prompt Category</span>
      <div className="flex items-center gap-3">
        <div className="grid place-items-center w-10 h-10 rounded-xl bg-accent/15 text-accent-light shrink-0">
          <Icon size={18} />
        </div>
        <span className="font-display font-medium text-base text-slate-100 leading-tight">
          {category}
        </span>
      </div>
    </div>
  );
}
