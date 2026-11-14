import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Move,
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../components/Toast';
import client from '../api/client';

export default function WeeklyPlanner() {
  const [planner, setPlanner] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState<any[]>([]);
  const { addToast } = useToast();

  useEffect(() => {
    client.get('/planner')
      .then((res) => {
        setPlanner(res.data);
        setSchedule(res.data.schedule || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleToggleDone = (id: number) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
    addToast({
      type: 'success',
      title: 'Schedule Updated',
      message: 'Study slot status synchronized.',
    });
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) return;

    const updated = [...schedule];
    const [movedItem] = updated.splice(sourceIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    // Swap day names to represent re-scheduling
    const reordered = updated.map((item, idx) => ({
      ...item,
      day: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][idx],
    }));

    setSchedule(reordered);
    addToast({
      type: 'info',
      title: 'Schedule Reordered',
      message: 'Learning session shifted to new study slot.',
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-8">
      <HeroBanner
        titlePrefix="Personalized weekly study"
        highlightedWord="schedule"
        titleSuffix="planner"
        subtitle="Orchestrator schedule synthesis fitting your verified weekly commitment availability."
        badge="Weekly Cadence"
        metric={{
          value: `${planner?.allocated_hours_total || 8} hrs`,
          label: "Allocated This Week",
        }}
      />

      <div className="card-modern space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E4D2]">
          <div>
            <h2 className="font-heading text-xl font-semibold text-[#10231C]">
              7-Day balanced schedule (Drag to reschedule)
            </h2>
            <p className="text-xs text-[#4B5E55] mt-0.5">
              Reorder slots by dragging cards between days. Check off items to record streak velocity.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#E4F4E8] text-[#0B3B2E]">
            Target: {planner?.weekly_hours_target || 8} hrs/wk
          </span>
        </div>

        {/* Days List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3.5 pt-2">
          {schedule.map((item, idx) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, idx)}
              className={`p-4 rounded-2xl border flex flex-col justify-between transition-all cursor-grab active:cursor-grabbing hover:shadow-sm ${
                item.completed
                  ? 'bg-[#E4F4E8]/60 border-[#0B3B2E]/20'
                  : 'bg-[#FAF7E8] border-[#E8E4D2]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-base font-semibold text-[#10231C]">
                    {item.day.slice(0, 3)}
                  </span>
                  <Move className="w-3.5 h-3.5 text-[#4B5E55]" />
                </div>

                <div className="text-xs text-[#4B5E55]">
                  {item.time_slot}
                </div>

                <div className="text-xs font-semibold text-[#10231C] line-clamp-2 leading-snug">
                  {item.task}
                </div>

                <div className="text-[11px] text-[#0B3B2E] font-medium">
                  {item.skill_name} · {item.provider}
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-[#E8E4D2] flex items-center justify-between">
                <span className="text-xs font-bold text-[#4B5E55]">
                  {item.allocated_hours}h
                </span>

                <button
                  onClick={() => handleToggleDone(item.id)}
                  className={`p-1.5 rounded-full transition-colors ${
                    item.completed ? 'text-[#0B3B2E] bg-[#C6F36B]' : 'text-[#4B5E55] hover:text-[#10231C] hover:bg-white'
                  }`}
                  title={item.completed ? 'Mark pending' : 'Mark completed'}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
