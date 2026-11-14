import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  CheckCircle2,
  Printer,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ErrorState from '../components/ErrorState';
import Logo from '../components/Logo';
import { useToast } from '../components/Toast';
import client from '../api/client';

export default function SkillPassport() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [passport, setPassport] = useState<any>(null);
  const { addToast } = useToast();

  const passportId = id || '1';

  useEffect(() => {
    setLoading(true);
    client.get(`/passport/${passportId}`)
      .then((res) => setPassport(res.data))
      .catch((err) => {
        console.error(err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, [passportId]);

  const handlePrint = () => {
    window.print();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    addToast({
      type: 'success',
      title: 'Link Copied',
      message: 'Shareable Skill Passport URL copied to clipboard.',
    });
  };

  if (loading) return <LoadingSkeleton rows={5} />;
  if (error) return <ErrorState message="Could not load verifiable skill passport." />;

  return (
    <div className="space-y-8">
      
      {/* Hide on print */}
      <div className="no-print">
        <HeroBanner
          titlePrefix="Enterprise verified skill"
          highlightedWord="passport"
          titleSuffix="credentials"
          subtitle="Cryptographically verified learning credentials, competency scores, and completed capstones."
          badge="Portable Credentials"
          metric={{
            value: `${passport?.readiness_score || 72}/100`,
            label: "Readiness Index",
          }}
          action={{
            label: "Download PDF",
            onClick: handlePrint,
          }}
        />
      </div>

      {/* Main Printable Passport Document Card */}
      <div className="card-modern p-8 md:p-12 max-w-4xl mx-auto space-y-8 border-2 border-[#E8E4D2]">
        
        {/* Certificate Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-[#0B3B2E] gap-4">
          <div>
            <Logo size="lg" variant="dark" tagline={true} />
            <div className="text-xs text-[#4B5E55] mt-2">
              Passport ID: <strong className="text-[#10231C]">{passport?.passport_id}</strong>
            </div>
          </div>

          <div className="text-left sm:text-right space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#E4F4E8] text-[#0B3B2E] text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-[#0B3B2E]" />
              <span>{passport?.verification_status}</span>
            </span>
            <div className="text-xs text-[#4B5E55]">
              Issued: {passport?.issue_date}
            </div>
          </div>
        </div>

        {/* Learner Summary */}
        <div className="space-y-2">
          <div className="section-pill mb-2">
            <span className="w-2 h-2 rounded-full bg-[#C6F36B]" />
            <span>Verified Candidate Profile</span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-semibold text-[#10231C]">
            {passport?.learner_name}
          </h1>
          <p className="text-sm text-[#4B5E55] leading-relaxed max-w-2xl">
            {passport?.bio}
          </p>
          <div className="inline-block mt-3 px-4 py-1.5 rounded-full bg-[#0B3B2E] text-[#C6F36B] text-xs font-semibold">
            Target Industry Competency: {passport?.target_role}
          </div>
        </div>

        {/* Verified Skills Grid */}
        <div className="space-y-4">
          <h3 className="font-heading text-xl font-semibold text-[#10231C] border-b border-[#E8E4D2] pb-2.5">
            Verified competencies & diagnostics
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {passport?.skills?.map((s: any) => (
              <div key={s.skill_id} className="p-4 bg-[#FAF7E8] rounded-2xl border border-[#E8E4D2] space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-sm text-[#10231C]">{s.name}</span>
                  <span className="text-[#0B3B2E] font-bold text-sm">{s.level}%</span>
                </div>
                <div className="text-xs text-[#4B5E55]">{s.category}</div>
                <div className="flex items-center gap-1.5 text-xs text-[#0B3B2E] pt-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified via assessments</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Certifications Issued */}
        <div className="space-y-4">
          <h3 className="font-heading text-xl font-semibold text-[#10231C] border-b border-[#E8E4D2] pb-2.5">
            Formal credentials awarded
          </h3>

          <div className="space-y-3">
            {passport?.certifications?.map((c: any) => (
              <div key={c.id} className="p-4 bg-[#E4F4E8]/60 border border-[#0B3B2E]/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-semibold text-[#10231C] text-sm">{c.title}</h4>
                  <div className="text-[#4B5E55] text-xs mt-0.5">{c.issuer} · {c.credential_id}</div>
                </div>
                <div className="text-left sm:text-right">
                  <div className="font-bold text-[#0B3B2E] text-sm">{c.score}</div>
                  <div className="text-xs text-[#4B5E55]">{c.issued_date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Footer with SVG QR Code */}
        <div className="pt-6 border-t-2 border-[#E8E4D2] flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* SVG Synthetic QR Code */}
            <div className="p-2 border border-[#E8E4D2] rounded-xl bg-white shadow-sm flex-shrink-0">
              <svg width="70" height="70" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="#FAF7E8" />
                <rect x="5" y="5" width="30" height="30" fill="#0B3B2E" />
                <rect x="10" y="10" width="20" height="20" fill="#FAF7E8" />
                <rect x="15" y="15" width="10" height="10" fill="#0B3B2E" />

                <rect x="65" y="5" width="30" height="30" fill="#0B3B2E" />
                <rect x="70" y="10" width="20" height="20" fill="#FAF7E8" />
                <rect x="75" y="15" width="10" height="10" fill="#0B3B2E" />

                <rect x="5" y="65" width="30" height="30" fill="#0B3B2E" />
                <rect x="10" y="70" width="20" height="20" fill="#FAF7E8" />
                <rect x="15" y="75" width="10" height="10" fill="#0B3B2E" />

                <rect x="45" y="15" width="10" height="10" fill="#0B3B2E" />
                <rect x="45" y="45" width="10" height="10" fill="#0B3B2E" />
                <rect x="65" y="45" width="10" height="10" fill="#0B3B2E" />
                <rect x="25" y="45" width="10" height="10" fill="#0B3B2E" />
                <rect x="75" y="75" width="15" height="15" fill="#0B3B2E" />
                <rect x="45" y="75" width="10" height="10" fill="#0B3B2E" />
              </svg>
            </div>

            <div className="space-y-1">
              <div className="text-xs font-bold text-[#10231C]">Public verification audit</div>
              <div className="text-[11px] text-[#4B5E55] break-all max-w-sm">
                Hash: {passport?.verification_hash}
              </div>
              <div className="text-[11px] text-[#4B5E55]">
                Scan QR or visit {passport?.share_url}
              </div>
            </div>
          </div>

          <div className="no-print flex items-center gap-3">
            <button
              onClick={handleCopyLink}
              className="btn-outline h-11"
            >
              <Share2 className="w-4 h-4" />
              <span>Share link</span>
            </button>
            <button
              onClick={handlePrint}
              className="btn-forest h-11"
            >
              <Printer className="w-4 h-4 text-[#C6F36B]" />
              <span>Print / Download PDF</span>
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
