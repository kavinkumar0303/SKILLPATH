import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import { useToast } from '../components/Toast';
import client from '../api/client';

export default function Assessments() {
  const [selectedSkill, setSelectedSkill] = useState('skill_javascript');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const skillsList = [
    { id: 'skill_javascript', name: 'JavaScript Core' },
    { id: 'skill_react', name: 'React.js' },
    { id: 'skill_nodejs', name: 'Node.js Runtime' },
    { id: 'skill_python', name: 'Python' },
    { id: 'skill_sql', name: 'SQL & Relational Databases' },
    { id: 'skill_html', name: 'HTML5 & Semantics' },
    { id: 'skill_css', name: 'CSS3 & Modern Layouts' },
    { id: 'skill_git', name: 'Git & Version Control' },
  ];

  const fetchQuestions = async (skillId: string) => {
    setLoading(true);
    setResult(null);
    setCurrentIdx(0);
    try {
      const res = await client.get(`/assessment/${skillId}`);
      setQuestions(res.data.questions || []);
      setSelectedAnswers(new Array(res.data.questions?.length || 8).fill(-1));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(selectedSkill);
  }, [selectedSkill]);

  const handleSelectOption = (optionIdx: number) => {
    const updated = [...selectedAnswers];
    updated[currentIdx] = optionIdx;
    setSelectedAnswers(updated);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await client.post('/assessment/submit', {
        skill_id: selectedSkill,
        answers: selectedAnswers,
      });
      setResult(res.data);
      const pct = res.data.grade?.percentage || 0;
      if (pct < 60) {
        addToast({
          type: 'info',
          title: 'Remediation Triggered',
          message: `Score ${pct}% < 60%. Injected revision items & slowed pace.`,
        });
      } else if (pct >= 85) {
        addToast({
          type: 'success',
          title: 'Skill Mastered!',
          message: `Score ${pct}% ≥ 85%! Accelerated to next curriculum phase.`,
        });
      } else {
        addToast({
          type: 'success',
          title: 'Assessment Complete',
          message: `Graded: ${pct}%. Standard timeline maintained.`,
        });
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Submission Error',
        message: 'Could not grade assessment.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="space-y-8">
      <HeroBanner
        titlePrefix="Technical skill assessment &"
        highlightedWord="diagnostics"
        titleSuffix="suite"
        subtitle="Assessment Agent evaluates competency retention and automatically triggers remedial roadmap adaptations."
        badge="Skill Verification"
        metric={{
          value: result ? `${result.grade?.percentage}%` : `${questions.length} MCQs`,
          label: result ? "Latest Grade" : "Test Battery",
        }}
      />

      {/* Skill Selector Tab Bar */}
      <div className="card-modern p-3 flex items-center gap-2 overflow-x-auto">
        {skillsList.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSkill(s.id)}
            className={`h-10 px-5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedSkill === s.id
                ? 'bg-[#0B3B2E] text-[#C6F36B]'
                : 'bg-[#FAF7E8] text-[#4B5E55] hover:bg-[#E8E4D2]'
            }`}
          >
            {s.name}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : result ? (
        /* Results View */
        <div className="card-modern space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#E8E4D2]">
            <div>
              <div className="section-pill mb-2">
                <span className="w-2 h-2 rounded-full bg-[#C6F36B]" />
                <span>Diagnostic Evaluation Report</span>
              </div>
              <h2 className="font-heading text-2xl font-semibold text-[#10231C]">
                {skillsList.find((s) => s.id === selectedSkill)?.name} Result
              </h2>
            </div>

            <div className="text-right">
              <div className={`font-heading text-4xl font-semibold ${
                result.grade?.percentage >= 85 ? 'text-[#0B3B2E]' : result.grade?.percentage >= 60 ? 'text-[#F59E5B]' : 'text-[#B91C1C]'
              }`}>
                {result.grade?.score} / {result.grade?.total} ({result.grade?.percentage}%)
              </div>
              <div className="text-xs font-medium text-[#4B5E55] mt-1">
                {result.grade?.passed ? 'Passed Standard Threshold' : 'Remediation Threshold (<60%)'}
              </div>
            </div>
          </div>

          {/* Adaptive Notice Card */}
          <div className={`p-5 rounded-2xl border ${
            result.adaptation?.needs_revision
              ? 'bg-[#FAF7E8] border-[#F5C451] text-[#10231C]'
              : result.adaptation?.mastered
              ? 'bg-[#E4F4E8] border-[#0B3B2E]/20 text-[#0B3B2E]'
              : 'bg-[#FAF7E8] border-[#E8E4D2] text-[#10231C]'
          }`}>
            <div className="font-bold text-xs uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#0B3B2E]" />
              <span>{result.adaptation?.action}</span>
            </div>
            <p className="text-sm leading-relaxed text-[#4B5E55]">
              {result.adaptation?.summary}
            </p>
          </div>

          {/* Weak Topics Analysis */}
          {result.adaptation?.weak_topics?.length > 0 && (
            <div>
              <h3 className="font-heading text-lg font-semibold text-[#10231C] mb-3">
                Identified weak concepts & rationale
              </h3>
              <div className="space-y-2.5">
                {result.adaptation.weak_topics.map((t: string, i: number) => (
                  <div key={i} className="p-3.5 bg-[#FAF7E8] border border-[#F4B6C2] rounded-2xl text-xs text-[#10231C] flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-[#B91C1C] flex-shrink-0 mt-0.5" />
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-[#E8E4D2]">
            <button
              onClick={() => fetchQuestions(selectedSkill)}
              className="btn-outline h-11"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retake diagnostic</span>
            </button>
            <a
              href="/learning-path"
              className="btn-forest h-11"
            >
              <span>View updated roadmap</span>
              <ArrowRight className="w-4 h-4 text-[#C6F36B]" />
            </a>
          </div>
        </div>
      ) : currentQ ? (
        /* Quiz Interface */
        <div className="card-modern space-y-6">
          
          <div className="flex items-center justify-between text-xs text-[#4B5E55] pb-3 border-b border-[#E8E4D2]">
            <span className="font-semibold text-[#10231C]">
              Question {currentIdx + 1} of {questions.length}
            </span>
            <span className="capitalize font-medium">
              Difficulty: {currentQ.difficulty}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-[#E8E4D2]/60 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0B3B2E] transition-all"
              style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <h3 className="font-heading text-2xl font-semibold text-[#10231C] leading-snug">
            {currentQ.question}
          </h3>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options?.map((opt: string, optIdx: number) => {
              const isSelected = selectedAnswers[currentIdx] === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full p-4 rounded-2xl border text-left text-sm font-medium transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#E4F4E8] border-[#0B3B2E] text-[#0B3B2E] shadow-sm'
                      : 'border-[#E8E4D2] bg-white hover:bg-[#FAF7E8] text-[#10231C]'
                  }`}
                >
                  <span>{opt}</span>
                  <span className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                    isSelected ? 'border-[#0B3B2E] bg-[#0B3B2E]' : 'border-[#E8E4D2]'
                  }`}>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-[#C6F36B]" />}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Nav Buttons */}
          <div className="flex justify-between items-center pt-4 border-t border-[#E8E4D2]">
            <button
              onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
              disabled={currentIdx === 0}
              className="btn-outline h-11 disabled:opacity-40"
            >
              Previous
            </button>

            {currentIdx < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx((prev) => prev + 1)}
                className="btn-forest h-11"
              >
                <span>Next question</span>
                <ArrowRight className="w-4 h-4 text-[#C6F36B]" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="btn-forest h-11"
              >
                <span>{submitting ? 'Grading test...' : 'Submit assessment'}</span>
                <Sparkles className="w-4 h-4 text-[#C6F36B]" />
              </button>
            )}
          </div>

        </div>
      ) : (
        <ErrorState message="No questions available for this module." />
      )}
    </div>
  );
}
