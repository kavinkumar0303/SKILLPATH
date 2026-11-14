import React, { useEffect, useState } from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import {
  ShieldCheck,
  AlertTriangle,
  Network,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import ExplainDrawer from '../components/ExplainDrawer';
import client from '../api/client';

export default function SkillAnalysis() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [explainDrawerItemId, setExplainDrawerItemId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [analysisRes] = await Promise.all([
        client.get('/analysis'),
        client.get('/skill-graph'),
      ]);
      setAnalysis(analysisRes.data);
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

  const radarData = analysis?.radar_data || [];
  const barData = (analysis?.skills || []).map((s: any) => ({
    name: s.name,
    proficiency: s.proficiency,
  }));

  return (
    <div className="space-y-8">
      <HeroBanner
        titlePrefix="Multi-axis proficiency &"
        highlightedWord="competency"
        titleSuffix="graph"
        subtitle="SkillAnalyzer Agent topological evaluation, prerequisite dependencies, and targeted capability gaps."
        badge="Skill Diagnostics"
        metric={{
          value: analysis?.strengths?.length || 0,
          label: "Verified Strengths",
        }}
      />

      {/* 1. Radar & Bar Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Radar Chart */}
        <div className="lg:col-span-6 card-modern">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-semibold text-[#10231C]">
              Competency radar
            </h2>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF7E8] text-[#4B5E55] border border-[#E8E4D2]">
              0 - 100 Scale
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E8E4D2" />
                <PolarAngleAxis dataKey="skill" tick={{ fill: '#4B5E55', fontSize: 11, fontFamily: 'Plus Jakarta Sans' }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#E8E4D2" />
                <Radar
                  name="Proficiency"
                  dataKey="value"
                  stroke="#0B3B2E"
                  fill="#0B3B2E"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="lg:col-span-6 card-modern">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading text-xl font-semibold text-[#10231C]">
              Proficiency benchmark
            </h2>
            <BarChart3 className="w-5 h-5 text-[#4B5E55]" />
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} stroke="#A9BDB1" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#4B5E55" fontSize={11} width={80} />
                <Tooltip
                  formatter={(val: any) => [`${val}%`, 'Proficiency']}
                  contentStyle={{ backgroundColor: '#0B3B2E', border: '1px solid #135443', borderRadius: '12px', color: '#F3F6EF' }}
                />
                <Bar dataKey="proficiency" radius={[0, 8, 8, 0]}>
                  {barData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.proficiency >= 70 ? '#0B3B2E' : entry.proficiency >= 50 ? '#F59E5B' : '#F5C451'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 2. Strengths & Weaknesses Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Strengths */}
        <div className="card-modern border-[#B8DDF0]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#E4F4E8] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-[#0B3B2E]" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-[#10231C]">
              Technical strengths (Proficiency ≥ 70%)
            </h3>
          </div>
          <div className="space-y-3">
            {analysis?.strengths_detail?.length ? (
              analysis.strengths_detail.map((s: any) => (
                <div key={s.skill_id} className="p-3.5 bg-[#FAF7E8] rounded-2xl border border-[#E8E4D2] flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-[#10231C]">{s.name}</div>
                    <div className="text-xs text-[#4B5E55]">{s.category}</div>
                  </div>
                  <span className="text-xs font-semibold text-[#0B3B2E] bg-[#C6F36B] px-3 py-1 rounded-full">
                    Mastered
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-[#4B5E55]">No skills currently above the 70% threshold.</div>
            )}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="card-modern border-[#F5C451]/60">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-[#F5C451]/20 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-[#B7791F]" />
            </div>
            <h3 className="font-heading text-lg font-semibold text-[#10231C]">
              Identified development gaps (Proficiency &lt; 50%)
            </h3>
          </div>
          <div className="space-y-3">
            {analysis?.weaknesses_detail?.length ? (
              analysis.weaknesses_detail.map((w: any) => (
                <div key={w.skill_id} className="p-3.5 bg-[#FAF7E8] rounded-2xl border border-[#E8E4D2] flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm text-[#10231C]">{w.name}</div>
                    <div className="text-xs text-[#4B5E55]">{w.category}</div>
                  </div>
                  <span className="text-xs font-semibold text-[#B7791F] bg-[#F5C451]/20 px-3 py-1 rounded-full border border-[#F5C451]/40">
                    High Priority Gap
                  </span>
                </div>
              ))
            ) : (
              <div className="text-xs text-[#4B5E55]">No critical weaknesses detected.</div>
            )}
          </div>
        </div>

      </div>

      {/* 3. Interactive Skill Graph */}
      <div className="card-modern">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-[#0B3B2E]" />
              <h2 className="font-heading text-xl font-semibold text-[#10231C]">
                Topological skill graph
              </h2>
            </div>
            <p className="text-xs text-[#4B5E55] mt-1">
              Select any node to inspect prerequisite chains and agent explanations.
            </p>
          </div>

          {/* Graph Legend */}
          <div className="flex items-center gap-3 text-xs flex-wrap font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#0B3B2E]" /> Mastered (≥70%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#F59E5B]" /> In Progress (1-69%)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#F4B6C2]" /> Missing Required
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#C6F36B] border border-[#0B3B2E]" /> Target Career
            </span>
          </div>
        </div>

        {/* SVG Node Graph Canvas */}
        <div className="relative bg-[#072A21] rounded-2xl p-6 border border-[#135443] overflow-x-auto min-h-[360px] flex items-center justify-center">
          <svg viewBox="0 0 880 340" className="w-full max-w-4xl h-auto">
            <defs>
              <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#4B5E55" />
              </marker>
            </defs>

            {/* Prerequisite Edges */}
            <line x1="80" y1="170" x2="220" y2="100" stroke="#135443" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1="80" y1="170" x2="220" y2="240" stroke="#135443" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1="220" y1="100" x2="380" y2="170" stroke="#135443" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1="220" y1="240" x2="380" y2="170" stroke="#135443" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1="380" y1="170" x2="540" y2="110" stroke="#135443" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1="380" y1="170" x2="540" y2="230" stroke="#135443" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1="540" y1="110" x2="720" y2="170" stroke="#135443" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1="540" y1="230" x2="720" y2="170" stroke="#135443" strokeWidth="2" markerEnd="url(#arrow)" />
            <line x1="220" y1="300" x2="540" y2="230" stroke="#135443" strokeWidth="1.5" strokeDasharray="3 3" />

            {/* Nodes */}
            {[
              { id: 'skill_html', label: 'HTML', x: 80, y: 170, status: 'in_progress', lvl: 55 },
              { id: 'skill_css', label: 'CSS', x: 220, y: 100, status: 'missing', lvl: 0 },
              { id: 'skill_sql', label: 'SQL', x: 220, y: 300, status: 'in_progress', lvl: 60 },
              { id: 'skill_javascript', label: 'JavaScript', x: 380, y: 170, status: 'missing', lvl: 0 },
              { id: 'skill_react', label: 'React.js', x: 540, y: 110, status: 'missing', lvl: 0 },
              { id: 'skill_nodejs', label: 'Node.js', x: 540, y: 230, status: 'missing', lvl: 0 },
              { id: 'skill_python', label: 'Python', x: 220, y: 240, status: 'mastered', lvl: 70 },
              { id: 'role_fullstack', label: 'Full Stack Dev', x: 720, y: 170, status: 'target', lvl: 49 },
            ].map((node) => {
              const color = node.status === 'mastered' ? '#C6F36B' : node.status === 'in_progress' ? '#F59E5B' : node.status === 'target' ? '#C6F36B' : '#F4B6C2';
              const isSelected = selectedNode?.id === node.id;
              return (
                <g
                  key={node.id}
                  className="cursor-pointer transition-transform hover:scale-110"
                  onClick={() => setSelectedNode(node)}
                >
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isSelected ? 26 : 22}
                    fill="#0B3B2E"
                    stroke={color}
                    strokeWidth={isSelected ? 4 : 2}
                  />
                  <text
                    x={node.x}
                    y={node.y + 4}
                    textAnchor="middle"
                    fill="#F3F6EF"
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="Plus Jakarta Sans"
                  >
                    {node.label.length > 8 ? node.label.slice(0, 6) + '..' : node.label}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + 36}
                    textAnchor="middle"
                    fill="#A9BDB1"
                    fontSize="10"
                    fontWeight="500"
                    fontFamily="Plus Jakarta Sans"
                  >
                    {node.status === 'target' ? 'Goal' : `${node.lvl}%`}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Selected Node Details Drawer/Banner */}
        {selectedNode && (
          <div className="mt-5 p-5 bg-[#FAF7E8] border border-[#E8E4D2] rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-heading text-base font-semibold text-[#10231C]">
                  Node selected: {selectedNode.label}
                </h4>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white border border-[#E8E4D2] text-[#10231C]">
                  Proficiency: {selectedNode.lvl}%
                </span>
              </div>
              <p className="text-xs text-[#4B5E55] mt-1">
                Status: {selectedNode.status.replace('_', ' ')} · Role dependency: Critical path
              </p>
            </div>

            <button
              onClick={() => setExplainDrawerItemId(1)}
              className="btn-forest"
            >
              <span>Explain recommendation</span>
              <ExternalLink className="w-4 h-4 text-[#C6F36B]" />
            </button>
          </div>
        )}
      </div>

      <ExplainDrawer
        itemId={explainDrawerItemId}
        onClose={() => setExplainDrawerItemId(null)}
      />

    </div>
  );
}
