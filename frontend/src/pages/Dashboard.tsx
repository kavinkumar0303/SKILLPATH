import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  Target,
  Award,
  BookOpen,
  Calendar,
  Clock,
  ArrowRight,
  Flame,
  CheckCircle2,
  Info,
  Sparkles,
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import client from '../api/client';

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [readiness, setReadiness] = useState<any>(null);
  const [revision, setRevision] = useState<any>(null);
  const [progress, setProgress] = useState<any>(null);
  const [streaks, setStreaks] = useState<any>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [readinessRes, revisionRes, progressRes, streaksRes] = await Promise.all([
        client.get('/readiness'),
        client.get('/revision/due'),
        client.get('/progress'),
        client.get('/streaks'),
      ]);
      setReadiness(readinessRes.data);
      setRevision(revisionRes.data);
      setProgress(progressRes.data);
      setStreaks(streaksRes.data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingSkeleton rows={5} />;
  if (error) return <ErrorState onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      
      {/* 1. Hero Banner with Fraunces Headline & Lime Highlighted Word */}
      <div className="relative">
        <HeroBanner
          titlePrefix="Your personalized learning path for"
          highlightedWord="Arjun Kumar"
          titleSuffix=""
          subtitle="Target Role: Full Stack Developer. Coordinated learning agents tracking competency gaps and curriculum sequences."
          badge="Active Learning Workspace"
          metric={{
            value: `${readiness?.readiness_score || 72}%`,
            label: "Career Readiness",
          }}
          action={{
            label: "View learning path",
            onClick: () => navigate('/learning-path'),
          }}
        />

        {/* Readiness Breakdown Info Tooltip */}
        <div className="absolute top-6 right-6 z-20 hidden sm:block">
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-[#A9BDB1] hover:text-white transition-colors"
            title="Readiness score methodology"
          >
            <Info size={16} />
          </button>

          {showTooltip && (
            <div className="absolute right-0 top-10 w-72 p-4 bg-white text-[#10231C] rounded-2xl shadow-lift border border-[#E8E4D2] text-xs space-y-2.5 z-30 font-sans">
              <div className="font-heading text-sm font-semibold text-[#10231C]">
                Readiness score matrix
              </div>
              <div className="space-y-1.5 text-[12px] text-[#4B5E55]">
                <div className="flex justify-between">
                  <span>Role Match (40%):</span>
                  <span className="font-semibold text-[#10231C]">{readiness?.breakdown?.role_match?.score}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Assessment Mastery (30%):</span>
                  <span className="font-semibold text-[#10231C]">{readiness?.breakdown?.assessment_mastery?.score}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Curriculum Completed (20%):</span>
                  <span className="font-semibold text-[#10231C]">{readiness?.breakdown?.curriculum_progress?.score}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Consistency Cadence (10%):</span>
                  <span className="font-semibold text-[#10231C]">{readiness?.breakdown?.consistency_index?.score}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Key Metrics Row (Soft Pastel Accents) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="card-modern p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#4B5E55] mb-2">
            <span className="text-xs font-semibold">Role Compatibility</span>
            <div className="w-8 h-8 rounded-full bg-pastel-sky flex items-center justify-center text-[#10231C]">
              <Target size={16} />
            </div>
          </div>
          <div>
            <div className="font-heading text-3xl font-semibold text-[#10231C]">
              {readiness?.breakdown?.role_match?.score || 49}%
            </div>
            <div className="text-xs text-[#0F766E] font-medium mt-1">
              Full Stack Developer baseline
            </div>
          </div>
        </div>

        <div className="card-modern p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#4B5E55] mb-2">
            <span className="text-xs font-semibold">Roadmap Completion</span>
            <div className="w-8 h-8 rounded-full bg-mint flex items-center justify-center text-[#0B3B2E]">
              <BookOpen size={16} />
            </div>
          </div>
          <div>
            <div className="font-heading text-3xl font-semibold text-[#10231C]">
              {progress?.completion_percentage || 28}%
            </div>
            <div className="text-xs text-[#4B5E55] mt-1">
              {progress?.completed_items || 4} of {progress?.total_items || 16} modules completed
            </div>
          </div>
        </div>

        <div className="card-modern p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#4B5E55] mb-2">
            <span className="text-xs font-semibold">Learning Cadence</span>
            <div className="w-8 h-8 rounded-full bg-pastel-yellow flex items-center justify-center text-[#B7791F]">
              <Flame size={16} />
            </div>
          </div>
          <div>
            <div className="font-heading text-3xl font-semibold text-[#10231C]">
              {streaks?.current_streak_days || 7} Days
            </div>
            <div className="text-xs text-[#B7791F] font-medium mt-1">
              Longest record: {streaks?.longest_streak_days || 14} days
            </div>
          </div>
        </div>

        <div className="card-modern p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#4B5E55] mb-2">
            <span className="text-xs font-semibold">Study Velocity</span>
            <div className="w-8 h-8 rounded-full bg-pastel-lavender flex items-center justify-center text-[#10231C]">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <div className="font-heading text-3xl font-semibold text-[#10231C]">
              {streaks?.completion_velocity || "3.4 / wk"}
            </div>
            <div className="text-xs text-[#4B5E55] mt-1">
              Pacing strictly on schedule
            </div>
          </div>
        </div>

      </div>

      {/* 3. Spaced-Repetition: Revision Due Today (Feature H) */}
      <div className="card-modern p-6 md:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pastel-orange flex items-center justify-center text-[#10231C]">
              <Clock size={20} />
            </div>
            <div>
              <h2 className="font-heading text-xl font-semibold text-[#10231C]">
                Spaced-repetition review due <span className="highlight-word">today</span>
              </h2>
              <p className="text-xs text-[#4B5E55] mt-0.5">
                Flagged concepts resurface at 1, 3, and 7 day intervals to solidify memory retention
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto text-xs font-semibold text-[#0B3B2E] bg-[#E4F4E8] px-3 py-1 rounded-full border border-[#1F8A4C]/20">
            {revision?.items?.length || 0} Review Cards Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {revision?.items?.map((item: any) => (
            <div key={item.id} className="p-4 rounded-2xl border border-[#E8E4D2] bg-[#FAF7E8]/60 space-y-2 hover:border-[#0B3B2E] transition-colors">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 bg-white text-[#0B3B2E] border border-[#E8E4D2] rounded-full text-[11px] font-semibold">
                  {item.skill_name}
                </span>
                <span className="text-[11px] text-[#4B5E55]">
                  {item.interval_days}-Day Interval
                </span>
              </div>
              <h4 className="font-medium text-[14px] text-[#10231C] leading-snug">
                {item.question}
              </h4>
              <p className="text-xs text-[#4B5E55] leading-relaxed">
                {item.explanation}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navigate('/assessments')}
                  className="text-xs font-semibold text-[#0B3B2E] hover:underline inline-flex items-center gap-1"
                >
                  <span>Practice this concept</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Two-Column Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Milestones & Corporate Discipline (Feature N) */}
        <div className="lg:col-span-7 card-modern p-6 md:p-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold text-[#10231C]">
              Discipline milestones
            </h2>
            <Award size={18} className="text-[#4B5E55]" />
          </div>

          <div className="space-y-3">
            {streaks?.milestones?.map((m: any) => (
              <div key={m.id} className="p-3.5 bg-[#FAF7E8]/70 border border-[#E8E4D2] rounded-2xl flex items-start gap-3">
                <div className={`mt-0.5 p-1 rounded-full ${m.achieved ? 'bg-[#E4F4E8] text-[#1F8A4C]' : 'bg-gray-200 text-gray-500'}`}>
                  <CheckCircle2 size={16} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-xs text-[#10231C]">{m.title}</span>
                    <span className="text-[11px] text-[#4B5E55]">{m.date || `${m.progress}% Completed`}</span>
                  </div>
                  <p className="text-xs text-[#4B5E55] mt-0.5">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Launch Shortcuts */}
        <div className="lg:col-span-5 card-modern p-6 md:p-7 space-y-4">
          <h2 className="font-heading text-xl font-semibold text-[#10231C]">
            Recommended actions
          </h2>
          <div className="space-y-2.5">
            <button
              onClick={() => navigate('/assessments')}
              className="w-full p-3.5 text-left rounded-2xl border border-[#E8E4D2] hover:bg-[#FAF7E8] transition-colors flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-semibold text-[#10231C] group-hover:text-[#0B3B2E]">Take Technical Assessment</div>
                <div className="text-[11px] text-[#4B5E55]">Test skills in JavaScript, React, Node.js</div>
              </div>
              <ArrowRight size={15} className="text-[#4B5E55] group-hover:text-[#0B3B2E] transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => navigate('/simulator')}
              className="w-full p-3.5 text-left rounded-2xl border border-[#E8E4D2] hover:bg-[#FAF7E8] transition-colors flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-semibold text-[#10231C] group-hover:text-[#0B3B2E]">Run Role Simulator</div>
                <div className="text-[11px] text-[#4B5E55]">Preview Data Scientist or DevOps compatibility</div>
              </div>
              <ArrowRight size={15} className="text-[#4B5E55] group-hover:text-[#0B3B2E] transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => navigate('/ai-mentor')}
              className="w-full p-3.5 text-left rounded-2xl border border-[#E8E4D2] hover:bg-[#FAF7E8] transition-colors flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-semibold text-[#10231C] group-hover:text-[#0B3B2E]">Chat with AI Mentor</div>
                <div className="text-[11px] text-[#4B5E55]">Ask questions and refine curriculum</div>
              </div>
              <ArrowRight size={15} className="text-[#4B5E55] group-hover:text-[#0B3B2E] transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => navigate('/skill-passport')}
              className="w-full p-3.5 text-left rounded-2xl border border-[#E8E4D2] hover:bg-[#FAF7E8] transition-colors flex items-center justify-between group"
            >
              <div>
                <div className="text-xs font-semibold text-[#10231C] group-hover:text-[#0B3B2E]">Export Skill Passport</div>
                <div className="text-[11px] text-[#4B5E55]">Shareable verified credentials & QR code</div>
              </div>
              <ArrowRight size={15} className="text-[#4B5E55] group-hover:text-[#0B3B2E] transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
