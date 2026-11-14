import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import ExplainDrawer from '../components/ExplainDrawer';
import { useToast } from '../components/Toast';
import client from '../api/client';

export default function CareerMatch() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [matchData, setMatchData] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState('role_fullstack');
  const [explainDrawerItemId, setExplainDrawerItemId] = useState<number | null>(null);
  const { addToast } = useToast();

  const loadData = async (roleId?: string) => {
    setLoading(true);
    setError(false);
    try {
      const [rolesRes, matchRes] = await Promise.all([
        client.get('/roles'),
        client.get('/match'),
      ]);
      setRoles(rolesRes.data);
      setMatchData(matchRes.data);
      if (!roleId && matchRes.data.role_id) {
        setSelectedRole(matchRes.data.role_id);
      }
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

  const handleRoleChange = async (newRole: string) => {
    setSelectedRole(newRole);
    try {
      const res = await client.post('/career/select', { role_id: newRole });
      addToast({
        type: 'success',
        title: 'Career Target Updated',
        message: `LearningPathAgent re-sequencing roadmap for ${res.data.role?.name}`,
      });
      loadData(newRole);
    } catch {
      addToast({
        type: 'error',
        title: 'Selection Error',
        message: 'Could not change active role.',
      });
    }
  };

  if (loading) return <LoadingSkeleton rows={5} />;
  if (error) return <ErrorState onRetry={() => loadData()} />;

  const matchPct = matchData?.match_percentage || 0;
  const donutData = [
    { name: 'Matched', value: matchPct, color: '#0B3B2E' },
    { name: 'Missing', value: 100 - matchPct, color: '#E8E4D2' },
  ];

  return (
    <div className="space-y-8">
      <HeroBanner
        titlePrefix="Target career taxonomy &"
        highlightedWord="compatibility"
        titleSuffix="audit"
        subtitle="CareerMatching Agent multi-factor alignment against enterprise role requirements."
        badge="Role Compatibility"
        metric={{
          value: `${matchPct}%`,
          label: "Compatibility Match",
        }}
      />

      {/* Role Selector Card */}
      <div className="card-modern flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#4B5E55] mb-1">
            Active target career objective
          </label>
          <p className="text-xs text-[#10231C]">
            Changing target role automatically triggers multi-agent re-sequencing of your adaptive curriculum.
          </p>
        </div>

        <select
          value={selectedRole}
          onChange={(e) => handleRoleChange(e.target.value)}
          className="h-11 px-4 rounded-xl border border-[#E8E4D2] bg-white text-sm font-semibold text-[#10231C] outline-none focus:border-[#0B3B2E]"
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Main Grid: Donut + Role Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Donut Chart */}
        <div className="lg:col-span-5 card-modern flex flex-col items-center justify-center text-center">
          <h2 className="font-heading text-xl font-semibold text-[#10231C] mb-2">
            Target alignment ratio
          </h2>
          <div className="relative w-48 h-48 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  startAngle={90}
                  endAngle={-270}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-heading text-3xl font-semibold text-[#0B3B2E]">
                {matchPct}%
              </span>
              <span className="text-[11px] font-semibold text-[#4B5E55] tracking-wide">
                Compatibility
              </span>
            </div>
          </div>
          <p className="text-xs text-[#4B5E55] max-w-xs mt-2">
            {matchData?.matched_skills?.length || 0} required skills verified, {matchData?.missing_skills?.length || 0} targeted gaps remaining.
          </p>
        </div>

        {/* Right: Role Overview & Strategy */}
        <div className="lg:col-span-7 card-modern space-y-4">
          <div>
            <div className="section-pill mb-2">
              <span className="w-2 h-2 rounded-full bg-[#C6F36B]" />
              <span>Role Specification</span>
            </div>
            <h3 className="font-heading text-2xl font-semibold text-[#10231C]">
              {matchData?.role_name}
            </h3>
            <p className="text-sm text-[#4B5E55] leading-relaxed mt-2">
              {matchData?.role_description}
            </p>
          </div>

          <div className="p-4 bg-[#FAF7E8] rounded-2xl border border-[#E8E4D2] flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-[#10231C]">Audited weight total</div>
              <div className="text-[11px] text-[#4B5E55]">Based on enterprise requirement weights</div>
            </div>
            <div className="text-base font-bold text-[#0B3B2E]">
              {matchData?.achieved_weight} / {matchData?.total_weight} pts
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <span className="text-xs text-[#4B5E55]">Understand how this compatibility was computed</span>
            <button
              onClick={() => setExplainDrawerItemId(1)}
              className="text-xs font-semibold text-[#0B3B2E] hover:underline inline-flex items-center gap-1.5"
            >
              <HelpCircle className="w-4 h-4 text-[#0B3B2E]" />
              <span>Explain this score (Explainable AI)</span>
            </button>
          </div>
        </div>

      </div>

      {/* Matched vs Missing Skills Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Matched Skills */}
        <div className="card-modern border-[#B8DDF0]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#E4F4E8] flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-[#0B3B2E]" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-[#10231C]">
                Matched technologies ({matchData?.matched_skills?.length || 0})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {matchData?.matched_skills?.map((s: any) => (
              <div key={s.skill_id} className="p-3.5 bg-[#FAF7E8] border border-[#E8E4D2] rounded-2xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-[#10231C]">{s.name}</div>
                  <div className="text-[11px] text-[#4B5E55]">Role weight: {s.weight}/5</div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#0B3B2E] bg-[#C6F36B] px-3 py-1 rounded-full">{s.user_level}%</span>
                  <div className="text-[11px] text-[#4B5E55] capitalize mt-0.5">{s.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Skills with Priority Badges */}
        <div className="card-modern border-[#F4B6C2]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#F4B6C2]/30 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-[#B91C1C]" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-[#10231C]">
                Targeted missing skills ({matchData?.missing_skills?.length || 0})
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            {matchData?.missing_skills?.map((s: any) => (
              <div key={s.skill_id} className="p-3.5 bg-[#FAF7E8] border border-[#E8E4D2] rounded-2xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-sm text-[#10231C]">{s.name}</div>
                  <div className="text-[11px] text-[#4B5E55]">Role weight: {s.weight}/5</div>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  s.priority === 'High' ? 'bg-[#F4B6C2] text-[#10231C]' : 'bg-[#F5C451] text-[#10231C]'
                }`}>
                  {s.priority} Priority Gap
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <ExplainDrawer
        itemId={explainDrawerItemId}
        onClose={() => setExplainDrawerItemId(null)}
      />

    </div>
  );
}
