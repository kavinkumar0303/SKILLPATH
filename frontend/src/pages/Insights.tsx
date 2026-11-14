import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Briefcase,
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import client from '../api/client';

const FALLBACK_SKILLS = [
  { skill_id: 'skill_python', name: 'Python', category: 'Backend', demand_index: 96, salary_band_inr: { min: 500000, max: 2800000 }, growth_trend: 'up', job_openings_estimate: 48000 },
  { skill_id: 'skill_javascript', name: 'JavaScript', category: 'Frontend', demand_index: 95, salary_band_inr: { min: 500000, max: 2200000 }, growth_trend: 'up', job_openings_estimate: 42000 },
  { skill_id: 'skill_react', name: 'React', category: 'Frontend', demand_index: 92, salary_band_inr: { min: 600000, max: 2800000 }, growth_trend: 'up', job_openings_estimate: 35000 },
  { skill_id: 'skill_sql', name: 'SQL', category: 'Database', demand_index: 90, salary_band_inr: { min: 400000, max: 2000000 }, growth_trend: 'stable', job_openings_estimate: 38000 },
  { skill_id: 'skill_docker', name: 'Docker', category: 'DevOps', demand_index: 85, salary_band_inr: { min: 700000, max: 2800000 }, growth_trend: 'up', job_openings_estimate: 22000 },
  { skill_id: 'skill_aws', name: 'AWS', category: 'Cloud', demand_index: 90, salary_band_inr: { min: 800000, max: 3500000 }, growth_trend: 'up', job_openings_estimate: 28000 },
];

const FALLBACK_ROLES = [
  { role_id: 'role_fullstack', name: 'Full Stack Developer', demand_index: 94, demand_tier: 'High', salary_band_inr: { min: 600000, max: 3000000 }, growth_trend: 'up', growth_rate_pct: 14.5, job_openings_estimate: 45000 },
  { role_id: 'role_data_scientist', name: 'Data Scientist', demand_index: 90, demand_tier: 'High', salary_band_inr: { min: 800000, max: 3500000 }, growth_trend: 'up', growth_rate_pct: 14.5, job_openings_estimate: 28000 },
  { role_id: 'role_frontend', name: 'Frontend Developer', demand_index: 85, demand_tier: 'High', salary_band_inr: { min: 500000, max: 2500000 }, growth_trend: 'stable', growth_rate_pct: 8.2, job_openings_estimate: 32000 },
  { role_id: 'role_backend', name: 'Backend Developer', demand_index: 88, demand_tier: 'High', salary_band_inr: { min: 600000, max: 2800000 }, growth_trend: 'up', growth_rate_pct: 14.5, job_openings_estimate: 35000 },
];

export default function Insights() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'skills' | 'roles'>('skills');

  useEffect(() => {
    client.get('/insights')
      .then((res) => {
        if (res?.data) {
          setData(res.data);
        }
      })
      .catch((err) => console.error('Insights fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton rows={5} />;

  // Safely extract skills whether received as array, dictionary, or fallback
  const rawSkills = data?.skills;
  const parsedSkills: any[] = Array.isArray(rawSkills)
    ? rawSkills
    : rawSkills && typeof rawSkills === 'object'
    ? Object.entries(rawSkills).map(([k, v]: [string, any]) => ({
        skill_id: k,
        name: v.name || k.replace('skill_', '').replace('_', ' ').toUpperCase(),
        demand_index: v.demand_index || 70,
        salary_band_inr: v.salary_band_inr || { min: 400000, max: 1200000 },
        growth_trend: v.growth_trend || 'stable',
        job_openings_estimate: v.job_openings_estimate || 10000,
      }))
    : [];

  const skillsList: any[] = parsedSkills.length > 0 ? parsedSkills : FALLBACK_SKILLS;

  // Safely extract roles whether received as array, dictionary, or fallback
  const rawRoles = data?.roles;
  const parsedRoles: any[] = Array.isArray(rawRoles)
    ? rawRoles
    : rawRoles && typeof rawRoles === 'object'
    ? Object.entries(rawRoles).map(([k, v]: [string, any]) => ({
        role_id: k,
        name: v.name || k.replace('role_', '').replace('_', ' ').toUpperCase(),
        demand_index: v.demand_index || 80,
        demand_tier: (v.demand_index || 80) >= 80 ? 'High' : 'Moderate',
        salary_band_inr: v.salary_band_inr || { min: 500000, max: 2000000 },
        growth_trend: v.growth_trend || 'up',
        growth_rate_pct: v.growth_rate_pct || 14,
        job_openings_estimate: v.job_openings_estimate || 25000,
      }))
    : [];

  const rolesList: any[] = parsedRoles.length > 0 ? parsedRoles : FALLBACK_ROLES;

  return (
    <div className="space-y-8">
      <HeroBanner
        titlePrefix="Market intelligence &"
        highlightedWord="compensation"
        titleSuffix="insights"
        subtitle="Empirical data covering hiring demand indices, typical remuneration ranges (INR), and industry trajectories."
        badge="Market Analytics"
        metric={{
          value: "Live Data",
          label: "Data Source",
        }}
      />

      {/* Disclaimers & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-modern p-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('skills')}
            className={`h-10 px-5 rounded-full text-xs font-semibold transition-colors ${
              activeTab === 'skills'
                ? 'bg-[#0B3B2E] text-[#C6F36B]'
                : 'bg-[#FAF7E8] text-[#4B5E55] hover:bg-[#E8E4D2]'
            }`}
          >
            Skill Demand Index ({skillsList.length})
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`h-10 px-5 rounded-full text-xs font-semibold transition-colors ${
              activeTab === 'roles'
                ? 'bg-[#0B3B2E] text-[#C6F36B]'
                : 'bg-[#FAF7E8] text-[#4B5E55] hover:bg-[#E8E4D2]'
            }`}
          >
            Role Compensation Bands ({rolesList.length})
          </button>
        </div>

        <span className="text-xs px-3 py-1 rounded-full bg-[#FAF7E8] text-[#4B5E55] border border-[#E8E4D2]">
          Enterprise benchmarking metrics
        </span>
      </div>

      {/* Skills Tab View */}
      {activeTab === 'skills' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.isArray(skillsList) && skillsList.map((s: any) => (
            <div key={s.skill_id} className="card-modern space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="font-heading text-lg font-semibold text-[#10231C]">{s.name}</span>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  s.growth_trend === 'up'
                    ? 'bg-[#E4F4E8] text-[#0B3B2E]'
                    : s.growth_trend === 'down'
                    ? 'bg-[#F4B6C2]/40 text-[#B91C1C]'
                    : 'bg-[#FAF7E8] text-[#4B5E55]'
                }`}>
                  {s.growth_trend === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
                  {s.growth_trend === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
                  {s.growth_trend === 'stable' && <Minus className="w-3.5 h-3.5" />}
                  <span className="capitalize">{s.growth_trend}</span>
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-[#4B5E55]">Market demand index:</span>
                  <span className="font-bold text-[#10231C]">{s.demand_index}/100</span>
                </div>
                <div className="w-full h-2 bg-[#E8E4D2]/60 rounded-full overflow-hidden">
                  <div className="h-full bg-[#0B3B2E]" style={{ width: `${s.demand_index}%` }} />
                </div>
              </div>

              <div className="pt-2 border-t border-[#E8E4D2] flex items-center justify-between text-xs">
                <span className="text-[#4B5E55] flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-[#0B3B2E]" />
                  Estimated Openings:
                </span>
                <span className="font-bold text-[#10231C]">
                  {s.job_openings_estimate?.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Roles Tab View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.isArray(rolesList) && rolesList.map((r: any) => (
            <div key={r.role_id} className="card-modern space-y-3.5">
              <div className="flex items-center justify-between">
                <h3 className="font-heading text-xl font-semibold text-[#10231C]">{r.name}</h3>
                <span className="text-xs font-semibold text-[#0B3B2E] bg-[#C6F36B] px-3 py-1 rounded-full">
                  {r.demand_tier} Demand
                </span>
              </div>

              <div className="p-4 bg-[#FAF7E8] rounded-2xl border border-[#E8E4D2] space-y-1">
                <div className="text-xs text-[#4B5E55]">Typical salary spectrum (INR)</div>
                <div className="font-heading text-xl font-semibold text-[#0B3B2E]">
                  ₹{r.salary_band_inr?.min?.toLocaleString()} – ₹{r.salary_band_inr?.max?.toLocaleString()} / yr
                </div>
              </div>

              <div className="flex justify-between text-xs text-[#4B5E55] pt-1">
                <span>Annual market growth:</span>
                <span className="font-bold text-[#0B3B2E]">+{r.growth_rate_pct}% YoY</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
