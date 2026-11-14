import React, { useEffect, useState } from 'react';
import {
  Download,
  Search,
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../components/Toast';
import client from '../api/client';

export default function CohortAnalytics() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'at_risk'>('all');
  const [search, setSearch] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    client.get('/cohort')
      .then((res) => setData(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    window.open('http://localhost:8000/api/cohort/export', '_blank');
    addToast({
      type: 'success',
      title: 'CSV Export Initiated',
      message: 'Downloading complete cohort skill gap records.',
    });
  };

  if (loading) return <LoadingSkeleton rows={5} />;

  const learners = data?.learners || [];
  const filteredLearners = learners.filter((l: any) => {
    const matchesFilter = filter === 'all' || l.status === 'At Risk' || l.readiness_score < 45;
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
                          l.email.toLowerCase().includes(search.toLowerCase()) ||
                          l.career_goal.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <HeroBanner
        titlePrefix="Institutional cohort benchmarks &"
        highlightedWord="analytics"
        titleSuffix="audit"
        subtitle="Auditing 40 enrolled student profiles across technology stacks, career benchmarks, and systemic skill deficits."
        badge="Enterprise Admin Console"
        metric={{
          value: `${data?.average_readiness || 58}%`,
          label: "Cohort Avg Readiness",
        }}
        action={{
          label: "Export Audit CSV",
          onClick: handleExportCSV,
        }}
      />

      {/* Cohort Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-modern space-y-1">
          <div className="text-xs font-semibold text-[#4B5E55]">Enrolled cohort</div>
          <div className="font-heading text-3xl font-semibold text-[#10231C]">
            {data?.total_learners || 40}
          </div>
          <div className="text-xs text-[#4B5E55]">Engineering Class of 2026</div>
        </div>

        <div className="card-modern space-y-1">
          <div className="text-xs font-semibold text-[#4B5E55]">Average readiness</div>
          <div className="font-heading text-3xl font-semibold text-[#0B3B2E]">
            {data?.average_readiness || 58}%
          </div>
          <div className="text-xs text-[#0B3B2E] font-medium">+4.2% since initial diagnostic</div>
        </div>

        <div className="card-modern space-y-1 border-[#F4B6C2]">
          <div className="text-xs font-semibold text-[#4B5E55]">At-risk learners</div>
          <div className="font-heading text-3xl font-semibold text-[#B91C1C]">
            {data?.at_risk_count || 6}
          </div>
          <div className="text-xs text-[#B91C1C] font-medium">Readiness &lt; 45% or flagged</div>
        </div>

        <div className="card-modern space-y-1">
          <div className="text-xs font-semibold text-[#4B5E55]">On-track ratio</div>
          <div className="font-heading text-3xl font-semibold text-[#0B3B2E]">
            {data?.on_track_count || 34}
          </div>
          <div className="text-xs text-[#4B5E55]">Meeting velocity milestones</div>
        </div>
      </div>

      {/* Top Missing Skills Across Cohort Bar Chart */}
      <div className="card-modern space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-heading text-xl font-semibold text-[#10231C]">
              Systemic institutional skill deficits
            </h2>
            <p className="text-xs text-[#4B5E55]">Frequency of missing skills across all 40 enrolled candidates</p>
          </div>
          <button
            onClick={handleExportCSV}
            className="btn-outline h-9 text-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>

        <div className="space-y-3.5">
          {data?.top_missing_skills?.map((item: any) => (
            <div key={item.skill} className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-sm text-[#10231C]">{item.skill}</span>
                <span className="text-[#4B5E55]">
                  {item.missing_learners} / {data.total_learners} learners missing ({item.percentage}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-[#E8E4D2]/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F4B6C2] rounded-full"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Learners Roster Table with Filter & Search */}
      <div className="card-modern space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-semibold text-[#10231C]">
            Candidate roster & performance ({filteredLearners.length})
          </h2>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-[#4B5E55] absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-10 pl-9 pr-3 text-xs rounded-full border border-[#E8E4D2] outline-none focus:border-[#0B3B2E] bg-white"
              />
            </div>

            <div className="flex gap-1 bg-[#FAF7E8] p-1 rounded-full border border-[#E8E4D2]">
              <button
                onClick={() => setFilter('all')}
                className={`h-8 px-3 text-xs font-semibold rounded-full transition-colors ${
                  filter === 'all' ? 'bg-[#0B3B2E] text-[#C6F36B]' : 'text-[#4B5E55]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter('at_risk')}
                className={`h-8 px-3 text-xs font-semibold rounded-full transition-colors ${
                  filter === 'at_risk' ? 'bg-[#B91C1C] text-white' : 'text-[#4B5E55]'
                }`}
              >
                At Risk
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7E8] text-[#4B5E55] font-semibold border-y border-[#E8E4D2]">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Career Target</th>
                <th className="py-3 px-4">Readiness Index</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Skills Ingested</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E4D2]">
              {filteredLearners.slice(0, 15).map((l: any) => (
                <tr key={l.id} className="hover:bg-[#FAF7E8]/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-sm text-[#10231C]">{l.name}</div>
                    <div className="text-xs text-[#4B5E55]">{l.email}</div>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-[#10231C]">
                    {l.career_goal}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-heading font-bold text-base text-[#0B3B2E]">
                      {l.readiness_score}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                      l.status === 'At Risk'
                        ? 'bg-[#F4B6C2]/40 text-[#B91C1C]'
                        : 'bg-[#E4F4E8] text-[#0B3B2E]'
                    }`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex gap-1.5 flex-wrap">
                      {l.skills_preview?.map((sp: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-0.5 bg-[#FAF7E8] border border-[#E8E4D2] rounded-full text-[11px] text-[#4B5E55]">
                          {sp}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
