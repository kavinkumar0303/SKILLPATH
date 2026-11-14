import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../components/Toast';
import client from '../api/client';

export default function Simulator() {
  const navigate = useNavigate();
  const [roles, setRoles] = useState<any[]>([]);
  const [simRole, setSimRole] = useState('role_data_scientist');
  const [simData, setSimData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [switching, setSwitching] = useState(false);
  const { addToast } = useToast();

  const runSimulation = async (roleId: string) => {
    setLoading(true);
    try {
      const [rolesRes, simRes] = await Promise.all([
        client.get('/roles'),
        client.post('/simulate', { role_id: roleId }),
      ]);
      setRoles(rolesRes.data);
      setSimData(simRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation(simRole);
  }, []);

  const handleRoleSelect = (roleId: string) => {
    setSimRole(roleId);
    runSimulation(roleId);
  };

  const handleCommitSwitch = async () => {
    setSwitching(true);
    try {
      await client.post('/career/select', { role_id: simRole });
      addToast({
        type: 'success',
        title: 'Career Goal Committed',
        message: `Goal changed to ${simData?.simulated_role?.name}. All agents synchronized.`,
      });
      navigate('/learning-path');
    } catch {
      addToast({
        type: 'error',
        title: 'Commit Error',
        message: 'Could not switch active career goal.',
      });
    } finally {
      setSwitching(false);
    }
  };

  if (loading && !simData) return <LoadingSkeleton rows={5} />;

  const currentMatch = simData?.current_match?.match_percentage || 0;
  const simMatch = simData?.simulated_match?.match_percentage || 0;

  return (
    <div className="space-y-8">
      <HeroBanner
        titlePrefix="What-if career pathway &"
        highlightedWord="simulation"
        titleSuffix="sandbox"
        subtitle="Simulate alternative career trajectories and gap requirements in a sandbox without mutating live records."
        badge="Simulation Engine"
        metric={{
          value: `${simMatch}%`,
          label: "Simulated Match",
        }}
        action={{
          label: switching ? "Committing..." : `Commit to ${simData?.simulated_role?.name}`,
          onClick: handleCommitSwitch,
        }}
      />

      {/* Role Picker Card */}
      <div className="card-modern flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#4B5E55] mb-1">
            Select prospective simulation role
          </label>
          <p className="text-xs text-[#10231C]">
            Current Goal: <strong className="text-[#0B3B2E]">{simData?.current_role?.name}</strong> ({currentMatch}% match)
          </p>
        </div>

        <select
          value={simRole}
          onChange={(e) => handleRoleSelect(e.target.value)}
          className="h-11 px-4 rounded-xl border border-[#E8E4D2] bg-white text-sm font-semibold text-[#10231C] outline-none focus:border-[#0B3B2E]"
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left: Current Active Goal */}
        <div className="card-modern space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E4D2]">
            <div>
              <div className="text-xs text-[#4B5E55] font-semibold">Current Goal</div>
              <h3 className="font-heading text-xl font-semibold text-[#10231C]">
                {simData?.current_role?.name}
              </h3>
            </div>
            <div className="font-heading text-3xl font-semibold text-[#0B3B2E]">
              {currentMatch}%
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#10231C]">Matched requirements:</div>
            <div className="flex flex-wrap gap-2">
              {simData?.current_match?.matched_skills?.map((s: any) => (
                <span key={s.skill_id} className="px-3 py-1 rounded-full bg-[#E4F4E8] text-[#0B3B2E] text-xs font-medium">
                  {s.name} ({s.user_level}%)
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-[#10231C]">Gaps to complete:</div>
            <div className="flex flex-wrap gap-2">
              {simData?.current_match?.missing_skills?.map((s: any) => (
                <span key={s.skill_id} className="px-3 py-1 rounded-full bg-[#F4B6C2]/40 text-[#10231C] text-xs font-medium">
                  {s.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Simulated Preview Goal */}
        <div className="card-modern border-2 border-[#0B3B2E] space-y-4 relative">
          <div className="absolute -top-3 right-6 px-3 py-0.5 rounded-full bg-[#0B3B2E] text-[#C6F36B] text-xs font-semibold">
            Simulated Sandbox
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-[#E8E4D2]">
            <div>
              <div className="text-xs text-[#0B3B2E] font-semibold">Prospective Goal</div>
              <h3 className="font-heading text-xl font-semibold text-[#10231C]">
                {simData?.simulated_role?.name}
              </h3>
            </div>
            <div className={`font-heading text-3xl font-semibold ${simMatch >= currentMatch ? 'text-[#0B3B2E]' : 'text-[#F59E5B]'}`}>
              {simMatch}%
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#10231C]">Matched requirements:</div>
            <div className="flex flex-wrap gap-2">
              {simData?.simulated_match?.matched_skills?.map((s: any) => (
                <span key={s.skill_id} className="px-3 py-1 rounded-full bg-[#E4F4E8] text-[#0B3B2E] text-xs font-medium">
                  {s.name} ({s.user_level}%)
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <div className="text-xs font-semibold text-[#10231C]">New prerequisite deficits:</div>
            <div className="flex flex-wrap gap-2">
              {simData?.simulated_match?.missing_skills?.map((s: any) => (
                <span key={s.skill_id} className="px-3 py-1 rounded-full bg-[#F5C451]/30 text-[#10231C] text-xs font-medium">
                  {s.name} ({s.priority})
                </span>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Projection Summary Card */}
      <div className="card-modern bg-[#FAF7E8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h4 className="font-heading text-lg font-semibold text-[#10231C]">
            Projected learning timeline for {simData?.simulated_role?.name}
          </h4>
          <p className="text-xs text-[#4B5E55]">
            Estimated commitment: <strong className="text-[#10231C]">{simData?.estimated_hours} hours</strong> (~{simData?.estimated_weeks} weeks at 8 hrs/wk, or {simData?.estimated_weeks_accelerated} weeks at 12 hrs/wk).
          </p>
        </div>

        <button
          onClick={handleCommitSwitch}
          disabled={switching}
          className="btn-forest h-11 self-start sm:self-auto"
        >
          <span>Switch to this role</span>
          <ArrowRight className="w-4 h-4 text-[#C6F36B]" />
        </button>
      </div>

    </div>
  );
}
