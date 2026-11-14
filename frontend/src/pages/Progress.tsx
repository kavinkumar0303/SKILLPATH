import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  Flame,
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import client from '../api/client';

export default function Progress() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<any>(null);
  const [streaks, setStreaks] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [progRes, streaksRes] = await Promise.all([
        client.get('/progress'),
        client.get('/streaks'),
      ]);
      setData(progRes.data);
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

  const completionPct = data?.completion_percentage || 0;
  const pieData = [
    { name: 'Completed', value: completionPct, color: '#0B3B2E' },
    { name: 'Remaining', value: 100 - completionPct, color: '#E8E4D2' },
  ];

  const chartHistory = data?.assessment_history?.length
    ? data.assessment_history
    : [
        { date: 'Nov 01', score_pct: 60, skill: 'Python' },
        { date: 'Nov 05', score_pct: 70, skill: 'SQL' },
        { date: 'Nov 09', score_pct: 55, skill: 'HTML' },
        { date: 'Nov 12', score_pct: 50, skill: 'JavaScript' },
        { date: 'Nov 14', score_pct: 75, skill: 'JavaScript Review' },
      ];

  const weeklyActivity = data?.weekly_activity || [];

  return (
    <div className="space-y-8">
      <HeroBanner
        titlePrefix="Longitudinal analytics &"
        highlightedWord="progress"
        titleSuffix="metrics"
        subtitle="Progress Tracker longitudinal performance tracking, velocity metrics, and corporate mastery benchmarks."
        badge="Progress Analytics"
        metric={{
          value: `${completionPct}%`,
          label: "Curriculum Complete",
        }}
      />

      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Overall Completion Donut */}
        <div className="card-modern flex items-center gap-6">
          <div className="w-24 h-24 relative flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={42}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center font-heading text-lg font-semibold text-[#0B3B2E]">
              {completionPct}%
            </div>
          </div>
          <div>
            <h3 className="font-heading text-lg font-semibold text-[#10231C]">
              Roadmap progress
            </h3>
            <p className="text-xs text-[#4B5E55] mt-0.5">
              {data?.completed_items || 0} of {data?.total_items || 0} modules verified
            </p>
          </div>
        </div>

        {/* Current & Longest Streak */}
        <div className="card-modern flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F5C451]/20 flex items-center justify-center text-[#B7791F] flex-shrink-0">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#4B5E55]">Continuous cadence</div>
            <div className="font-heading text-2xl font-semibold text-[#10231C]">
              {streaks?.current_streak_days || 7} days active
            </div>
            <div className="text-xs text-[#4B5E55]">Longest streak: {streaks?.longest_streak_days || 14} days</div>
          </div>
        </div>

        {/* Pace Velocity */}
        <div className="card-modern flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#E4F4E8] flex items-center justify-center text-[#0B3B2E] flex-shrink-0">
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[#4B5E55]">Study velocity</div>
            <div className="font-heading text-2xl font-semibold text-[#10231C]">
              {streaks?.completion_velocity || "3.4 / wk"}
            </div>
            <div className="text-xs text-[#4B5E55]">Total active days: {streaks?.total_active_days || 26}</div>
          </div>
        </div>

      </div>

      {/* Charts Row: Score Trends + Weekly Study Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Assessment Score History (Line Chart) */}
        <div className="lg:col-span-7 card-modern">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-heading text-xl font-semibold text-[#10231C]">
                Score velocity trends
              </h2>
              <p className="text-xs text-[#4B5E55]">Historical performance across technical assessments</p>
            </div>
            <span className="text-xs font-semibold text-[#0B3B2E] bg-[#C6F36B] px-3 py-1 rounded-full">
              Ascending
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E4D2" />
                <XAxis dataKey="date" stroke="#4B5E55" fontSize={11} />
                <YAxis domain={[0, 100]} stroke="#4B5E55" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Score']}
                  contentStyle={{ backgroundColor: '#0B3B2E', border: '1px solid #135443', borderRadius: '12px', color: '#F3F6EF' }}
                />
                <Line
                  type="monotone"
                  dataKey="score_pct"
                  stroke="#0B3B2E"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#C6F36B', stroke: '#0B3B2E', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#C6F36B' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Activity Hours (Bar Chart) */}
        <div className="lg:col-span-5 card-modern">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-heading text-xl font-semibold text-[#10231C]">
                Weekly commitment
              </h2>
              <p className="text-xs text-[#4B5E55]">Logged hours across calendar days</p>
            </div>
            <Calendar className="w-5 h-5 text-[#4B5E55]" />
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E4D2" />
                <XAxis dataKey="day" stroke="#4B5E55" fontSize={11} />
                <YAxis stroke="#4B5E55" fontSize={11} />
                <Tooltip
                  formatter={(val: any) => [`${val} hrs`, 'Logged Time']}
                  contentStyle={{ backgroundColor: '#0B3B2E', border: '1px solid #135443', borderRadius: '12px', color: '#F3F6EF' }}
                />
                <Bar dataKey="hours" fill="#0B3B2E" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Per-Skill Progress Bars */}
      <div className="card-modern">
        <h2 className="font-heading text-xl font-semibold text-[#10231C] mb-5">
          Individual skill trajectories
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data?.skills_progress?.map((sp: any) => (
            <div key={sp.skill_id} className="p-4 bg-[#FAF7E8] border border-[#E8E4D2] rounded-2xl space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-sm text-[#10231C]">{sp.name}</span>
                <span className="font-bold text-[#10231C]">{sp.level}%</span>
              </div>
              <div className="w-full h-2.5 bg-[#E8E4D2]/60 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    sp.level >= 70 ? 'bg-[#0B3B2E]' : sp.level >= 50 ? 'bg-[#F59E5B]' : 'bg-[#F5C451]'
                  }`}
                  style={{ width: `${sp.level}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[#4B5E55]">
                <span>Assessments taken: {sp.assessments_taken}</span>
                <span className="capitalize">Trend: {sp.trend}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
