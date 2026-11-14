import React, { useEffect, useState } from 'react';
import { X, Sparkles, CheckCircle2, Database, ShieldCheck, HelpCircle } from 'lucide-react';
import client from '../api/client';

interface ExplainDrawerProps {
  itemId: number | null;
  onClose: () => void;
}

export default function ExplainDrawer({ itemId, onClose }: ExplainDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!itemId) return;
    setLoading(true);
    client.get(`/explain/${itemId}`)
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error('Failed to load explanation', err);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [itemId]);

  if (!itemId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-[#072A21]/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-y-0 right-0 max-w-md w-full bg-[#FAF7E8] shadow-2xl flex flex-col z-10 border-l border-[#E8E4D2]">
        
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-[#135443] flex items-center justify-between bg-[#0B3B2E] text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C6F36B] text-[#10231C] flex items-center justify-center font-bold">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-heading text-xl font-semibold text-white leading-none">
                AI Recommendation Rationale
              </h3>
              <p className="text-[12px] text-[#A9BDB1] mt-1 font-sans">
                Audit trail and agent decision reasoning
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#A9BDB1] hover:text-white transition-colors p-1 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-6 bg-[#E8E4D2] rounded w-3/4" />
              <div className="h-24 bg-white rounded-2xl" />
              <div className="h-32 bg-white rounded-2xl" />
            </div>
          ) : data ? (
            <>
              {/* Agent Attribution */}
              <div className="card-modern p-4 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#4B5E55]">
                  Deciding Agent
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-3 py-1 bg-[#E4F4E8] text-[#0B3B2E] border border-[#0B3B2E]/20 rounded-full text-xs font-bold">
                    {data.agent_name}
                  </span>
                  {data.collaborators?.map((c: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-0.5 bg-white text-[#4B5E55] border border-[#E8E4D2] rounded-full text-xs">
                      + {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Confidence Meter */}
              <div className="card-modern p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-[#10231C] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#1F8A4C]" />
                    Model Confidence
                  </span>
                  <span className="text-xs font-bold text-[#1F8A4C]">
                    {Math.round(data.confidence_score * 100)}% ({data.confidence_label})
                  </span>
                </div>
                <div className="w-full h-2.5 bg-[#E8E4D2] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#1F8A4C] rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(data.confidence_score * 100)}%` }}
                  />
                </div>
              </div>

              {/* Core Reasoning */}
              <div className="card-modern p-5 space-y-2">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#4B5E55] flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-[#4B5E55]" />
                  Educational Logic & Pedagogical Rule
                </div>
                <p className="text-[14px] text-[#10231C] leading-relaxed">
                  {data.reasoning}
                </p>
              </div>

              {/* Profile Data Evaluated */}
              <div className="card-modern p-5 space-y-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-[#4B5E55] flex items-center gap-1.5">
                  <Database className="w-4 h-4 text-[#4B5E55]" />
                  Profile Data & Prerequisites Analyzed
                </div>
                <ul className="space-y-2">
                  {data.data_used?.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-[#4B5E55] bg-[#FAF7E8] p-2.5 rounded-xl border border-[#E8E4D2]">
                      <CheckCircle2 className="w-4 h-4 text-[#1F8A4C] flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="text-center text-sm text-[#4B5E55] py-12">
              No rationale data available for this module.
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-[#E8E4D2] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="btn-outline h-9 px-4 text-xs font-semibold"
          >
            Close Rationale
          </button>
        </div>
      </div>
    </div>
  );
}
