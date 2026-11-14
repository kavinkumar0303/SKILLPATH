import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Download,
  Copy,
  RotateCw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  Sliders,
  History,
  Check,
  Briefcase,
  FileDown,
  Layers,
  ArrowUp,
  ArrowDown,
  ExternalLink,
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../components/Toast';
import client from '../api/client';

export default function Resume() {
  const { addToast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const [savingVersion, setSavingVersion] = useState(false);
  const [exportingDocx, setExportingDocx] = useState(false);
  
  const [resumeData, setResumeData] = useState<any>(null);
  const [template, setTemplate] = useState<'modern' | 'classic' | 'compact'>('modern');
  const [selectedRole, setSelectedRole] = useState('role_fullstack');
  const [zoom, setZoom] = useState<'fit' | '100%'>('fit');
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit');
  const [showChangesModal, setShowChangesModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionNameInput, setVersionNameInput] = useState('');
  const [versions, setVersions] = useState<any[]>([]);

  // Roles available
  const availableRoles = [
    { id: 'role_fullstack', name: 'Full Stack Developer' },
    { id: 'role_backend', name: 'Backend Engineer' },
    { id: 'role_frontend', name: 'Frontend Developer' },
    { id: 'role_data_scientist', name: 'Data Scientist' },
    { id: 'role_devops', name: 'DevOps / Cloud Engineer' },
  ];

  // Load resume and version history on mount
  useEffect(() => {
    fetchResume();
    fetchVersions();
  }, [selectedRole]);

  const fetchResume = (force = false) => {
    const url = force ? '/resume/generate' : `/resume?role_id=${selectedRole}&template=${template}`;
    const method = force ? client.post(url, { role_id: selectedRole, template }) : client.get(url);
    
    method
      .then((res) => {
        setResumeData(res.data);
        if (res.data?.template) setTemplate(res.data.template);
      })
      .catch((err) => {
        console.error('Failed to load resume:', err);
        addToast({ type: 'error', title: 'Error', message: 'Could not load resume from profile data.' });
      })
      .finally(() => {
        setLoading(false);
        setRegenerating(false);
      });
  };

  const fetchVersions = () => {
    client.get('/resume/versions')
      .then((res) => setVersions(res.data || []))
      .catch(() => {});
  };

  const handleRegenerate = () => {
    setRegenerating(true);
    fetchResume(true);
    addToast({ type: 'success', title: 'Resume Agent', message: 'Resume updated by the Resume agent.' });
  };

  const handleSectionToggle = (sectionId: string) => {
    if (!resumeData) return;
    const updatedSections = resumeData.sections.map((s: any) =>
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    );
    const updated = { ...resumeData, sections: updatedSections };
    setResumeData(updated);
    saveResumeEdits(updated);
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    if (!resumeData) return;
    const newSections = [...resumeData.sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newSections.length) return;
    
    const temp = newSections[index];
    newSections[index] = newSections[targetIndex];
    newSections[targetIndex] = temp;
    
    const updated = { ...resumeData, sections: newSections };
    setResumeData(updated);
    saveResumeEdits(updated);
  };

  const handleFieldChange = (field: string, value: any) => {
    const updated = { ...resumeData, [field]: value };
    setResumeData(updated);
  };

  const handleHeaderChange = (field: string, value: string) => {
    const updated = {
      ...resumeData,
      header: { ...resumeData.header, [field]: value },
    };
    setResumeData(updated);
  };

  const saveResumeEdits = (dataToSave = resumeData) => {
    client.put('/resume', { resume_data: dataToSave })
      .catch((err) => console.error('Failed to auto-save edits:', err));
  };

  const handleSaveVersion = async () => {
    setSavingVersion(true);
    try {
      await client.post('/resume/versions', {
        version_name: versionNameInput || undefined,
        template,
      });
      addToast({ type: 'success', title: 'Saved', message: 'Version snapshot saved.' });
      setShowVersionModal(false);
      setVersionNameInput('');
      fetchVersions();
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to save version.' });
    } finally {
      setSavingVersion(false);
    }
  };

  const handleRestoreVersion = async (versionId: number) => {
    setLoading(true);
    try {
      const res = await client.post(`/resume/versions/${versionId}/restore`);
      setResumeData(res.data.resume_data);
      addToast({ type: 'success', title: 'Restored', message: 'Version restored.' });
    } catch {
      addToast({ type: 'error', title: 'Error', message: 'Failed to restore version.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    window.print();
  };

  const handleDownloadDocx = async () => {
    setExportingDocx(true);
    try {
      const res = await client.post(
        '/resume/export',
        { format: 'docx', template },
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('link');
      const a = document.createElement('a');
      a.href = url;
      const firstName = resumeData?.header?.name?.split(' ')[0] || 'Learner';
      a.setAttribute('download', `${firstName}_Resume.docx`);
      document.body.appendChild(a);
      a.click();
      a.remove();
      addToast({ type: 'success', title: 'Export Complete', message: 'DOCX resume downloaded.' });
    } catch {
      addToast({ type: 'error', title: 'Export Error', message: 'Failed to export DOCX.' });
    } finally {
      setExportingDocx(false);
    }
  };

  const handleCopyPlainText = async () => {
    try {
      const res = await client.post('/resume/export', { format: 'txt' });
      await navigator.clipboard.writeText(res.data);
      addToast({ type: 'success', title: 'Copied', message: 'Plain text resume copied to clipboard!' });
    } catch {
      addToast({ type: 'error', title: 'Copy Error', message: 'Failed to copy text.' });
    }
  };

  if (loading) return <LoadingSkeleton rows={6} />;

  const isSectionEnabled = (id: string) => {
    const s = resumeData?.sections?.find((x: any) => x.id === id);
    return s ? s.enabled : true;
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Page Banner */}
      <HeroBanner
        titlePrefix="Build your"
        highlightedWord="resume"
        titleSuffix=""
        subtitle="Created from your profile, skills and assessments"
        badge="Resume Intelligence"
        metric={{
          value: `${resumeData?.ats_match?.score || 75}%`,
          label: "ATS Match Score",
        }}
        action={{
          label: "Download PDF",
          onClick: handleDownloadPdf,
        }}
      />

      {/* Data Change Alert Banner */}
      {resumeData?.data_changed && (
        <div className="card-modern p-4 bg-[#C6F36B]/20 border-[#C6F36B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#0B3B2E] text-[#C6F36B] flex items-center justify-center shrink-0">
              <Sparkles size={16} />
            </div>
            <div>
              <span className="text-xs font-bold text-[#10231C]">Your data changed. Update your resume.</span>
              <p className="text-[11px] text-[#4B5E55]">New skills or assessment completions were detected in your profile.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowChangesModal(true)}
              className="text-xs font-semibold text-[#0B3B2E] hover:underline px-2 py-1"
            >
              See changes
            </button>
            <button
              onClick={handleRegenerate}
              className="btn-lime h-9 px-4 text-xs font-bold gap-1.5"
            >
              <RotateCw size={13} className={regenerating ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      )}

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex gap-2 p-1.5 bg-white border border-[#E8E4D2] rounded-full">
        <button
          onClick={() => setMobileTab('edit')}
          className={`flex-1 h-9 rounded-full text-xs font-bold transition-all ${
            mobileTab === 'edit' ? 'bg-[#0B3B2E] text-white' : 'text-[#4B5E55]'
          }`}
        >
          Edit Resume
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 h-9 rounded-full text-xs font-bold transition-all ${
            mobileTab === 'preview' ? 'bg-[#0B3B2E] text-white' : 'text-[#4B5E55]'
          }`}
        >
          Live A4 Preview
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* =========================================================================
            LEFT COLUMN: EDITOR (40%)
        ========================================================================= */}
        <div className={`lg:col-span-5 space-y-6 ${mobileTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          
          {/* Card 1: Top Controls (Role, Template, Regenerate, Versions) */}
          <div className="card-modern space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E4D2]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B3B2E] flex items-center gap-1.5">
                <Sliders size={14} /> Resume Controls
              </span>
              <button
                type="button"
                onClick={() => setShowVersionModal(true)}
                className="text-xs font-semibold text-[#0B3B2E] hover:underline flex items-center gap-1"
              >
                <History size={13} /> Save Version
              </button>
            </div>

            {/* Target Role Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-[#10231C] mb-1">
                Target Career Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-white border border-[#E8E4D2] text-xs font-semibold text-[#10231C] outline-none focus:border-[#0B3B2E]"
              >
                {availableRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Template Selector (3 Cards: Modern, Classic, Compact) */}
            <div>
              <label className="block text-xs font-semibold text-[#10231C] mb-1.5">
                ATS Template
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'modern', name: 'Modern', desc: 'Forest & lime accent line' },
                  { id: 'classic', name: 'Classic', desc: 'Serif rules, high contrast' },
                  { id: 'compact', name: 'Compact', desc: 'Dense single page fit' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTemplate(t.id as any);
                      handleFieldChange('template', t.id);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      template === t.id
                        ? 'border-[#0B3B2E] bg-[#E4F4E8]/60 ring-1 ring-[#0B3B2E]'
                        : 'border-[#E8E4D2] bg-white hover:border-[#0B3B2E]/50'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#10231C]">{t.name}</div>
                    <div className="text-[10px] text-[#4B5E55] mt-0.5 leading-tight">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Version Snapshot Dropdown */}
            {versions.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-[#10231C] mb-1">
                  Restore Saved Version ({versions.length}/5)
                </label>
                <select
                  onChange={(e) => {
                    if (e.target.value) handleRestoreVersion(Number(e.target.value));
                  }}
                  defaultValue=""
                  className="w-full h-10 px-3 rounded-xl bg-white border border-[#E8E4D2] text-xs text-[#4B5E55] outline-none"
                >
                  <option value="" disabled>Select a version to restore...</option>
                  {versions.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.version_name} · ATS {v.ats_score}%
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Regenerate Button */}
            <button
              type="button"
              disabled={regenerating}
              onClick={handleRegenerate}
              className="btn-outline w-full h-10 text-xs font-semibold gap-2 bg-white"
            >
              <RotateCw size={14} className={regenerating ? 'animate-spin' : ''} />
              <span>Regenerate from my data</span>
            </button>
          </div>

          {/* Card 2: Completeness Meter */}
          <div className="card-modern space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#10231C]">Resume Completeness</span>
              <span className="text-xs font-bold text-[#0B3B2E]">{resumeData?.completeness || 80}%</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-2 bg-[#E8E4D2] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#1F8A4C] transition-all duration-500"
                style={{ width: `${resumeData?.completeness || 80}%` }}
              />
            </div>

            {/* Missing items checklist */}
            {resumeData?.missing_checklist && resumeData.missing_checklist.length > 0 ? (
              <div className="space-y-2 pt-1 border-t border-[#E8E4D2]">
                <span className="text-[11px] font-semibold text-[#4B5E55]">To increase completeness:</span>
                {resumeData.missing_checklist.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs text-[#4B5E55] gap-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <AlertCircle size={13} className="text-[#B7791F] shrink-0" />
                      <span className="truncate">{item.item}</span>
                    </div>
                    <a
                      href={item.link}
                      className="text-[#0B3B2E] font-semibold hover:underline shrink-0 text-[11px]"
                    >
                      Update Profile
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-[#1F8A4C] pt-1">
                <CheckCircle2 size={14} />
                <span>All profile data points verified and complete!</span>
              </div>
            )}
          </div>

          {/* Card 3: ATS Match Analysis */}
          <div className="card-modern space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#0B3B2E]">ATS Keyword Match</div>
                <div className="text-[11px] text-[#4B5E55] mt-0.5">
                  Target: {resumeData?.target_role_name}
                </div>
              </div>
              <div className="text-right">
                <div className="font-heading text-2xl font-bold text-[#0B3B2E]">
                  {resumeData?.ats_match?.score || 70}%
                </div>
                <div className="text-[10px] text-[#4B5E55]">
                  {resumeData?.ats_match?.matched_count}/{resumeData?.ats_match?.total_count} Skills Found
                </div>
              </div>
            </div>

            {/* Matched Keywords */}
            <div>
              <span className="text-[11px] font-semibold text-[#10231C]">Matched in your resume:</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {resumeData?.ats_match?.matched_keywords?.map((k: any, i: number) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E4F4E8] text-[#0B3B2E] text-[11px] font-semibold"
                  >
                    <Check size={11} /> {k.name}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Keywords with Reason */}
            {resumeData?.ats_match?.missing_keywords && resumeData.ats_match.missing_keywords.length > 0 && (
              <div className="pt-2 border-t border-[#E8E4D2] space-y-2">
                <span className="text-[11px] font-semibold text-[#B91C1C]">Missing from your resume:</span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {resumeData.ats_match.missing_keywords.map((m: any, i: number) => (
                    <div key={i} className="p-2 rounded-xl bg-[#FAF7E8] border border-[#E8E4D2] text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#10231C]">{m.name}</span>
                        <span className="text-[10px] uppercase font-bold text-[#B7791F]">{m.priority} Priority</span>
                      </div>
                      <div className="text-[11px] text-[#4B5E55] mt-0.5">{m.reason}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Card 4: Section Customizer & Text Fields */}
          <div className="card-modern space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E4D2]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0B3B2E]">
                Section Layout & Content
              </span>
              <span className="text-[11px] text-[#4B5E55]">Toggle & Reorder</span>
            </div>

            {/* Header Contacts Edit */}
            <div className="space-y-3 p-3 bg-[#FAF7E8] rounded-2xl border border-[#E8E4D2]">
              <span className="text-xs font-bold text-[#10231C]">Contact Header (from Profile)</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-[#4B5E55]">Phone</label>
                  <input
                    type="text"
                    value={resumeData?.header?.phone || ''}
                    onChange={(e) => handleHeaderChange('phone', e.target.value)}
                    onBlur={() => saveResumeEdits()}
                    className="w-full h-8 px-2 rounded-lg bg-white border border-[#E8E4D2] text-xs outline-none"
                    placeholder="+91 98765 43210"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#4B5E55]">Location</label>
                  <input
                    type="text"
                    value={resumeData?.header?.location || ''}
                    onChange={(e) => handleHeaderChange('location', e.target.value)}
                    onBlur={() => saveResumeEdits()}
                    className="w-full h-8 px-2 rounded-lg bg-white border border-[#E8E4D2] text-xs outline-none"
                    placeholder="Bangalore, India"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#4B5E55]">LinkedIn</label>
                  <input
                    type="text"
                    value={resumeData?.header?.linkedin || ''}
                    onChange={(e) => handleHeaderChange('linkedin', e.target.value)}
                    onBlur={() => saveResumeEdits()}
                    className="w-full h-8 px-2 rounded-lg bg-white border border-[#E8E4D2] text-xs outline-none"
                    placeholder="linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#4B5E55]">GitHub</label>
                  <input
                    type="text"
                    value={resumeData?.header?.github || ''}
                    onChange={(e) => handleHeaderChange('github', e.target.value)}
                    onBlur={() => saveResumeEdits()}
                    className="w-full h-8 px-2 rounded-lg bg-white border border-[#E8E4D2] text-xs outline-none"
                    placeholder="github.com/..."
                  />
                </div>
              </div>
            </div>

            {/* Summary Text Edit */}
            {isSectionEnabled('summary') && (
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#10231C]">
                  Professional Summary
                </label>
                <textarea
                  rows={3}
                  value={resumeData?.summary || ''}
                  onChange={(e) => handleFieldChange('summary', e.target.value)}
                  onBlur={() => saveResumeEdits()}
                  className="w-full p-2.5 rounded-xl bg-white border border-[#E8E4D2] text-xs text-[#10231C] outline-none focus:border-[#0B3B2E] resize-none leading-relaxed"
                />
              </div>
            )}

            {/* Section Visibility Switches & Order */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-[#10231C]">Sections Displayed</span>
              {resumeData?.sections?.map((sec: any, idx: number) => (
                <div
                  key={sec.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#E8E4D2] text-xs"
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSectionToggle(sec.id)}
                      className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                        sec.enabled ? 'bg-[#0B3B2E] text-white' : 'border border-[#E8E4D2]'
                      }`}
                    >
                      {sec.enabled && <Check size={12} />}
                    </button>
                    <span className={`font-medium ${sec.enabled ? 'text-[#10231C]' : 'text-[#4B5E55] line-through'}`}>
                      {sec.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveSection(idx, 'up')}
                      className="p-1 text-[#4B5E55] hover:text-[#10231C] disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === resumeData.sections.length - 1}
                      onClick={() => handleMoveSection(idx, 'down')}
                      className="p-1 text-[#4B5E55] hover:text-[#10231C] disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* =========================================================================
            RIGHT COLUMN: LIVE A4 PREVIEW (60%)
        ========================================================================= */}
        <div className={`lg:col-span-7 space-y-4 ${mobileTab === 'edit' ? 'hidden lg:block' : 'block'}`}>
          
          {/* Top Bar for Live Preview: Zoom & Export Actions */}
          <div className="flex items-center justify-between flex-wrap gap-3 bg-white p-3 rounded-2xl border border-[#E8E4D2]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#10231C] flex items-center gap-1.5">
                <Eye size={15} className="text-[#0B3B2E]" /> A4 Live Preview
              </span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#FAF7E8] text-[#4B5E55] border border-[#E8E4D2]">
                1 Page Standard
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Zoom Switch */}
              <div className="flex bg-[#FAF7E8] p-1 rounded-full border border-[#E8E4D2] text-[11px]">
                <button
                  type="button"
                  onClick={() => setZoom('fit')}
                  className={`px-2.5 py-0.5 rounded-full font-semibold transition-all ${
                    zoom === 'fit' ? 'bg-white text-[#10231C] shadow-xs' : 'text-[#4B5E55]'
                  }`}
                >
                  Fit
                </button>
                <button
                  type="button"
                  onClick={() => setZoom('100%')}
                  className={`px-2.5 py-0.5 rounded-full font-semibold transition-all ${
                    zoom === '100%' ? 'bg-white text-[#10231C] shadow-xs' : 'text-[#4B5E55]'
                  }`}
                >
                  100%
                </button>
              </div>

              {/* Download DOCX */}
              <button
                type="button"
                disabled={exportingDocx}
                onClick={handleDownloadDocx}
                className="btn-outline h-8 px-3 text-[11px] font-semibold gap-1.5"
                title="Download ATS-compatible Microsoft Word file"
              >
                <FileDown size={13} />
                <span>DOCX</span>
              </button>

              {/* Copy Plain Text */}
              <button
                type="button"
                onClick={handleCopyPlainText}
                className="btn-outline h-8 px-3 text-[11px] font-semibold gap-1.5"
                title="Copy clean text for job applications"
              >
                <Copy size={13} />
                <span>Plain text</span>
              </button>
            </div>
          </div>

          {/* Scaled A4 Container */}
          <div className="overflow-x-auto pb-4 flex justify-center bg-[#FAF7E8]/50 p-4 rounded-3xl border border-[#E8E4D2]/80">
            <div
              id="resume-print-area"
              ref={printRef}
              className={`bg-white text-[#10231C] shadow-2xl rounded-sm transition-all duration-200 select-text ${
                zoom === 'fit' ? 'w-full max-w-[650px] min-h-[850px] p-8' : 'w-[210mm] min-h-[297mm] p-[18mm]'
              }`}
              style={{
                fontFamily: template === 'classic' ? 'Georgia, serif' : 'Plus Jakarta Sans, sans-serif',
              }}
            >
              {/* Header */}
              <div className="text-center pb-4 border-b border-[#E8E4D2] space-y-1">
                <h1
                  className="font-heading font-bold text-2xl tracking-tight text-[#0B3B2E]"
                  style={{
                    fontFamily: template === 'classic' ? 'Georgia, serif' : 'Bricolage Grotesque, sans-serif',
                  }}
                >
                  {resumeData?.header?.name || 'Arjun Kumar'}
                </h1>
                
                {/* Contact Subtitle */}
                <div className="text-[12px] text-[#4B5E55] flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
                  {resumeData?.header?.email && <span>{resumeData.header.email}</span>}
                  {resumeData?.header?.phone && <span>• {resumeData.header.phone}</span>}
                  {resumeData?.header?.location && <span>• {resumeData.header.location}</span>}
                  {resumeData?.header?.linkedin && <span>• {resumeData.header.linkedin}</span>}
                  {resumeData?.header?.github && <span>• {resumeData.header.github}</span>}
                </div>
              </div>

              {/* Sections rendered in configured order */}
              <div className="space-y-4 pt-3.5">
                {resumeData?.sections?.map((sec: any) => {
                  if (!sec.enabled) return null;

                  // Section Header renderer
                  const renderSectionTitle = (title: string) => (
                    <div className="mb-2">
                      <div
                        className={`text-xs font-bold tracking-wider uppercase ${
                          template === 'modern' ? 'text-[#0B3B2E]' : 'text-[#10231C]'
                        }`}
                        style={{
                          fontFamily: template === 'classic' ? 'Georgia, serif' : 'Bricolage Grotesque, sans-serif',
                        }}
                      >
                        {title}
                      </div>
                      {template === 'modern' && (
                        <div className="w-8 h-[2px] bg-[#C6F36B] mt-0.5 rounded-full" />
                      )}
                      {template === 'classic' && (
                        <div className="w-full h-[1px] bg-[#10231C]/30 mt-0.5" />
                      )}
                    </div>
                  );

                  // 1. Summary
                  if (sec.id === 'summary' && resumeData?.summary) {
                    return (
                      <div key={sec.id}>
                        {renderSectionTitle('Professional Summary')}
                        <p className="text-[13px] leading-relaxed text-[#10231C]">
                          {resumeData.summary}
                        </p>
                      </div>
                    );
                  }

                  // 2. Education
                  if (sec.id === 'education' && resumeData?.education?.length > 0) {
                    return (
                      <div key={sec.id}>
                        {renderSectionTitle('Education')}
                        <div className="space-y-2">
                          {resumeData.education.map((ed: any, i: number) => (
                            <div key={i} className="text-[13px]">
                              <div className="flex items-center justify-between font-bold text-[#10231C]">
                                <span>{ed.degree}</span>
                                <span className="text-[12px] font-normal text-[#4B5E55]">{ed.period}</span>
                              </div>
                              <div className="flex items-center justify-between text-[#4B5E55] text-[12px]">
                                <span>{ed.institution}</span>
                                <span className="font-semibold text-[#0B3B2E]">{ed.score}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // 3. Technical Competencies
                  if (sec.id === 'skills' && resumeData?.skills?.length > 0) {
                    return (
                      <div key={sec.id}>
                        {renderSectionTitle('Technical Competencies')}
                        <div className="space-y-1.5 text-[13px]">
                          {resumeData.skills.map((cat: any, i: number) => (
                            <div key={i} className="flex flex-wrap items-baseline gap-1.5">
                              <span className="font-bold text-[#10231C] min-w-[130px] text-[12px]">
                                {cat.category}:
                              </span>
                              <span className="text-[#4B5E55]">
                                {cat.skills.map((s: any, idx: number) => (
                                  <React.Fragment key={idx}>
                                    <span className={s.verified ? 'font-medium text-[#10231C]' : ''}>
                                      {s.name}
                                    </span>
                                    {idx < cat.skills.length - 1 ? ', ' : ''}
                                  </React.Fragment>
                                ))}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // 4. Projects
                  if (sec.id === 'projects' && resumeData?.projects?.length > 0) {
                    return (
                      <div key={sec.id}>
                        {renderSectionTitle('Selected Projects')}
                        <div className="space-y-3">
                          {resumeData.projects.map((proj: any, i: number) => (
                            <div key={i} className="text-[13px] space-y-0.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#10231C]">{proj.title}</span>
                                <span className="text-[12px] text-[#4B5E55]">{proj.period}</span>
                              </div>
                              <div className="text-[11px] font-medium text-[#0B3B2E]">
                                Technologies: {proj.skills?.join(', ')}
                              </div>
                              <p className="text-[12px] text-[#4B5E55] leading-relaxed">
                                • {proj.description}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // 5. Certifications & Assessments
                  if (sec.id === 'certifications' && resumeData?.certifications?.length > 0) {
                    return (
                      <div key={sec.id}>
                        {renderSectionTitle('Certifications & Verified Assessments')}
                        <div className="space-y-1 text-[13px]">
                          {resumeData.certifications.map((c: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-[12px]">
                              <span className="font-medium text-[#10231C]">• {c.title}</span>
                              <span className="text-[#4B5E55]">{c.score}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // 6. Learning Achievements
                  if (sec.id === 'achievements' && resumeData?.achievements?.length > 0) {
                    return (
                      <div key={sec.id}>
                        {renderSectionTitle('Milestone Achievements')}
                        <div className="space-y-1 text-[12px]">
                          {resumeData.achievements.map((ach: any, i: number) => (
                            <div key={i} className="flex items-center justify-between text-[#4B5E55]">
                              <span>• {ach.title}</span>
                              <span className="font-semibold text-[#0B3B2E]">{ach.metric}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  // 7. Currently Learning
                  if (sec.id === 'currently_learning' && resumeData?.currently_learning?.length > 0) {
                    return (
                      <div key={sec.id}>
                        {renderSectionTitle('Currently Learning')}
                        <p className="text-[12px] text-[#4B5E55]">
                          Actively completing curriculum roadmaps in: <strong className="text-[#10231C]">{resumeData.currently_learning.join(', ')}</strong>
                        </p>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Changes Modal */}
      {showChangesModal && (
        <div className="fixed inset-0 z-50 bg-[#072A21]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8E4D2] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E4D2]">
              <span className="font-heading text-base font-bold text-[#10231C]">Profile Changes Detected</span>
              <button onClick={() => setShowChangesModal(false)} className="text-xs text-[#4B5E55]">Close</button>
            </div>
            <p className="text-xs text-[#4B5E55]">
              The following modifications took place since this resume was compiled:
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {resumeData?.changed_items?.map((item: string, i: number) => (
                <div key={i} className="p-2.5 rounded-xl bg-[#FAF7E8] text-xs text-[#10231C] flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#1F8A4C] shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setShowChangesModal(false)}
                className="btn-outline h-9 px-4 text-xs"
              >
                Keep current
              </button>
              <button
                onClick={() => {
                  setShowChangesModal(false);
                  handleRegenerate();
                }}
                className="btn-lime h-9 px-4 text-xs font-bold"
              >
                Apply Updates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Version Modal */}
      {showVersionModal && (
        <div className="fixed inset-0 z-50 bg-[#072A21]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8E4D2] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#E8E4D2]">
              <span className="font-heading text-base font-bold text-[#10231C]">Save Resume Snapshot</span>
              <button onClick={() => setShowVersionModal(false)} className="text-xs text-[#4B5E55]">Close</button>
            </div>
            <p className="text-xs text-[#4B5E55]">
              Store this tailored snapshot. You can keep up to 5 versions and restore any version with one click.
            </p>
            <div>
              <label className="block text-xs font-semibold text-[#10231C] mb-1">Version Label</label>
              <input
                type="text"
                placeholder="e.g. Full Stack (Q4 2026)"
                value={versionNameInput}
                onChange={(e) => setVersionNameInput(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-white border border-[#E8E4D2] text-xs outline-none focus:border-[#0B3B2E]"
              />
            </div>
            <div className="pt-2 flex justify-end gap-2">
              <button onClick={() => setShowVersionModal(false)} className="btn-outline h-9 px-4 text-xs">
                Cancel
              </button>
              <button
                onClick={handleSaveVersion}
                disabled={savingVersion}
                className="btn-lime h-9 px-4 text-xs font-bold"
              >
                {savingVersion ? 'Saving...' : 'Save Snapshot'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
