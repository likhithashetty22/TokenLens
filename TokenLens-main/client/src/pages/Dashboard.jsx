// src/pages/Dashboard.jsx
// Main (and only) page of TokenLens: prompt input on top, results
// grid below once an analysis completes.
import { useState } from 'react';
import { CheckCircle2, XCircle, Lightbulb } from 'lucide-react';

import ApiKeyInput from '../components/ApiKeyInput.jsx';
import PromptInput from '../components/PromptInput.jsx';
import AnalyzeButton from '../components/AnalyzeButton.jsx';
import LoadingAnimation from '../components/LoadingAnimation.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import ScoreCard from '../components/ScoreCard.jsx';
import CategoryCard from '../components/CategoryCard.jsx';
import TokensCard from '../components/TokensCard.jsx';
import EfficiencyCard from '../components/EfficiencyCard.jsx';
import FeedbackSection from '../components/FeedbackSection.jsx';
import { usePromptAnalysis } from '../hooks/usePromptAnalysis.js';

export default function Dashboard() {
  const [apiKey, setApiKey] = useState('');
  const [prompt, setPrompt] = useState('');
  const { result, loading, error, runAnalysis } = usePromptAnalysis();

  const canAnalyze = apiKey.trim().length > 0 && prompt.trim().length > 0 && !loading;

  const handleAnalyze = () => {
    if (!canAnalyze) return;
    runAnalysis({ apiKey, prompt });
  };

  return (
    <div className="space-y-8">
      {/* --- Input section --- */}
      <div className="glass-panel p-6 space-y-5">
        <div className="grid md:grid-cols-2 gap-5">
          <ApiKeyInput value={apiKey} onChange={setApiKey} disabled={loading} />
        </div>
        <PromptInput value={prompt} onChange={setPrompt} disabled={loading} />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <p className="text-xs text-slate-500">
            TokenLens evaluates your prompt. It never answers it.
          </p>
          <AnalyzeButton onClick={handleAnalyze} loading={loading} disabled={!canAnalyze} />
        </div>
      </div>

      <ErrorBanner error={error} />

      {/* --- Results section --- */}
      {loading && <LoadingAnimation />}

      {!loading && result && (
        <div className="space-y-8 animate-fadeUp">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ScoreCard score={result.score} />
            <CategoryCard category={result.category} />
            <TokensCard
              tokens={result.estimated_prompt_tokens}
              responseLength={result.estimated_response_length}
            />
            <EfficiencyCard efficiency={result.prompt_efficiency} />
          </div>

          <div className="glass-panel p-6 space-y-7">
            <FeedbackSection
              title="Strengths"
              icon={CheckCircle2}
              items={result.strengths}
              variant="good"
              emptyLabel="No particular strengths identified."
            />
            <FeedbackSection
              title="Issues"
              icon={XCircle}
              items={result.issues}
              variant="bad"
              emptyLabel="No issues found — nice work."
            />
            <FeedbackSection
              title="Suggestions"
              icon={Lightbulb}
              items={result.suggestions}
              variant="info"
              emptyLabel="No further suggestions."
            />
          </div>
        </div>
      )}
    </div>
  );
}
