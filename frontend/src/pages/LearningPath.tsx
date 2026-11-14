import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ExternalLink,
  HelpCircle,
  Sliders,
  Calendar,
  Layers,
  RotateCcw,
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import ExplainDrawer from '../components/ExplainDrawer';
import { useToast } from '../components/Toast';
import client from '../api/client';

export default function LearningPath() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [timeEstimate, setTimeEstimate] = useState<any>(null);
  const [diff, setDiff] = useState<any>(null);
  const [hoursPerWeek, setHoursPerWeek] = useState(8);
  const [explainDrawerItemId, setExplainDrawerItemId] = useState<number | null>(null);
  const { addToast } = useToast();

  const loadData = async (hours = hoursPerWeek) => {
    setLoading(true);
    setError(false);
    try {
      const [roadRes, timeRes, diffRes] = await Promise.all([
        client.get('/roadmap'),
        client.get(`/time-estimate?hours_per_week=${hours}`),
        client.get('/roadmap/diff'),
      ]);
      setRoadmap(roadRes.data);
      setTimeEstimate(timeRes.data);
      setDiff(diffRes.data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSliderChange = async (newHours: number) => {
    setHoursPerWeek(newHours);
    try {
      const res = await client.get(`/time-estimate?hours_per_week=${newHours}`);
      setTimeEstimate(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteItem = async (itemId: number) => {
    try {
      await client.post('/roadmap/complete', { item_id: itemId });
      addToast({
        type: 'success',
        title: 'Module Completed',
        message: 'Marked curriculum node completed. Readiness score updated.',
      });
      loadData(hoursPerWeek);
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Could not update module status.',
      });
    }
  };

  if (loading) return <LoadingSkeleton rows={5} />;
  if (error) return <ErrorState onRetry={() => loadData()} />;

  return (
    <div className="space-y-8">
      <HeroBanner
        titlePrefix="Personalized curriculum &"
        highlightedWord="roadmap"
        titleSuffix="sequence"
        subtitle="LearningPath Agent topologically ordered modules based on prerequisite dependencies and career urgency."
        badge="Curriculum Synthesis"
        metric={{
          value: `${roadmap?.completion_percentage || 0}%`,
          label: "Roadmap Complete",
        }}
      />

      {/* Feature B: Time-to-Ready Estimator Interactive Widget */}
      <div className="card-modern">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E4F4E8] flex items-center justify-center text-[#0B3B2E]">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-semibold text-[#10231C]">
                Time-to-ready estimator
              </h2>
              <p className="text-xs text-[#4B5E55] mt-0.5">
                Adjust weekly study availability to model completion velocity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#FAF7E8] px-4 py-2.5 rounded-full border border-[#E8E4D2]">
            <Calendar className="w-4 h-4 text-[#0B3B2E]" />
            <div className="text-xs">
              <span className="text-[#4B5E55]">Projected completion: </span>
              <strong className="text-[#10231C] font-semibold">{timeEstimate?.target_date}</strong>
            </div>
          </div>
        </div>

        {/* Hours slider */}
        <div className="space-y-3 pt-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-[#10231C] flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#0B3B2E]" />
              Weekly Commitment: <span className="text-[#0B3B2E] font-bold text-sm ml-1">{hoursPerWeek} hrs/week</span>
            </span>
            <span className="text-[#4B5E55] font-medium">
              Estimated: <strong className="text-[#10231C]">{timeEstimate?.estimated_weeks} weeks</strong> ({timeEstimate?.remaining_hours} hours total)
            </span>
          </div>

          <input
            type="range"
            min="2"
            max="30"
            step="1"
            value={hoursPerWeek}
            onChange={(e) => handleSliderChange(Number(e.target.value))}
            className="w-full accent-[#0B3B2E]"
          />

          <div className="flex justify-between text-xs text-[#4B5E55]">
            <span>2 hrs/wk (Relaxed)</span>
            <span>8 hrs/wk (Standard)</span>
            <span>15 hrs/wk (Accelerated)</span>
            <span>30 hrs/wk (Immersive)</span>
          </div>
        </div>
      </div>

      {/* Before vs After Adaptation Diff Panel */}
      {diff && (
        <div className="rounded-[20px] bg-[#0B3B2E] text-[#F3F6EF] p-6 border border-[#135443] shadow-lift">
          <div className="flex items-center justify-between pb-3 border-b border-[#135443] text-xs">
            <span className="font-semibold text-[#C6F36B] flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Agent Adaptation Diff: {diff.action}
            </span>
            <span className="text-xs text-[#A9BDB1]">
              {diff.timestamp?.slice(11, 16)} UTC
            </span>
          </div>

          <div className="pt-3 text-xs space-y-3">
            <p className="text-[#F3F6EF]/80 text-xs">{diff.summary}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="p-3 bg-[#072A21] border border-[#135443] rounded-xl">
                <span className="text-[#C6F36B] font-bold block mb-1.5">+ Injected/Added:</span>
                {diff.items_added?.length ? (
                  diff.items_added.map((item: string, i: number) => (
                    <div key={i} className="text-[#F3F6EF] truncate">• {item}</div>
                  ))
                ) : (
                  <span className="text-[#A9BDB1]">None</span>
                )}
              </div>

              <div className="p-3 bg-[#072A21] border border-[#135443] rounded-xl">
                <span className="text-[#F5C451] font-bold block mb-1.5">↔ Reordered/Deferred:</span>
                {diff.items_reordered?.length ? (
                  diff.items_reordered.map((item: string, i: number) => (
                    <div key={i} className="text-[#F3F6EF] truncate">• {item}</div>
                  ))
                ) : (
                  <span className="text-[#A9BDB1]">None</span>
                )}
              </div>

              <div className="p-3 bg-[#072A21] border border-[#135443] rounded-xl">
                <span className="text-[#F4B6C2] font-bold block mb-1.5">- Completed/Removed:</span>
                {diff.items_removed?.length ? (
                  diff.items_removed.map((item: string, i: number) => (
                    <div key={i} className="text-[#F3F6EF] truncate">• {item}</div>
                  ))
                ) : (
                  <span className="text-[#A9BDB1]">None</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Phased Roadmap Modules */}
      <div className="space-y-6">
        {roadmap?.phases?.map((phase: any) => (
          <div key={phase.phase} className="card-modern p-0 overflow-hidden">
            
            <div className="px-6 py-4 bg-[#FAF7E8] border-b border-[#E8E4D2] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-[#0B3B2E]" />
                <h3 className="font-heading text-lg font-semibold text-[#10231C]">
                  {phase.title}
                </h3>
              </div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white text-[#4B5E55] border border-[#E8E4D2]">
                {phase.items?.length || 0} Modules
              </span>
            </div>

            <div className="p-6 divide-y divide-[#E8E4D2]">
              {phase.items?.map((item: any) => {
                const isCompleted = item.status === 'completed';
                return (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E4F4E8] text-[#0B3B2E]">
                          {item.skill_name}
                        </span>
                        <span className="text-xs text-[#4B5E55] font-medium">
                          {item.provider}
                        </span>
                        <span className="text-[#E8E4D2]">•</span>
                        <span className="text-xs text-[#4B5E55] capitalize">
                          {item.difficulty}
                        </span>
                        <span className="text-[#E8E4D2]">•</span>
                        <span className="text-xs text-[#4B5E55]">
                          {item.duration_hours} hrs
                        </span>
                        {item.is_revision && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#F5C451]/30 text-[#B7791F] border border-[#F5C451]/60">
                            Remedial Revision
                          </span>
                        )}
                      </div>

                      <h4 className={`text-base font-semibold ${isCompleted ? 'line-through text-[#A9BDB1]' : 'text-[#10231C]'}`}>
                        {item.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <button
                        onClick={() => setExplainDrawerItemId(item.id)}
                        className="btn-outline h-9 text-xs"
                        title="Explain recommendation decision"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>Why this?</span>
                      </button>

                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-outline h-9 text-xs"
                      >
                        <span>Resource</span>
                        <ExternalLink className="w-3.5 h-3.5 text-[#4B5E55]" />
                      </a>

                      {isCompleted ? (
                        <span className="h-9 px-4 rounded-full bg-[#E4F4E8] text-[#0B3B2E] text-xs font-semibold inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Done</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCompleteItem(item.id)}
                          className="btn-forest h-9 text-xs"
                        >
                          Mark Complete
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        ))}
      </div>

      <ExplainDrawer
        itemId={explainDrawerItemId}
        onClose={() => setExplainDrawerItemId(null)}
      />

    </div>
  );
}
