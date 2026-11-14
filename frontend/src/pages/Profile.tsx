import React, { useEffect, useState } from 'react';
import {
  User,
  Plus,
  Trash2,
  FileText,
  Sparkles,
  Save,
  Award,
} from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [parsingResume, setParsingResume] = useState(false);
  const [newSkillId, setNewSkillId] = useState('skill_javascript');
  const [newSkillLevel, setNewSkillLevel] = useState(50);
  const { addToast } = useToast();
  const { updateUser } = useAuth();

  const loadProfile = async () => {
    setLoading(true);
    try {
      const profRes = await client.get('/profile');
      setProfile(profRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedFields = {
        name: profile.name,
        email: profile.email,
        bio: profile.bio,
      };
      await client.put('/profile', updatedFields);
      updateUser(updatedFields);
      addToast({
        type: 'success',
        title: 'Profile Updated',
        message: 'Personal details and credentials saved successfully.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Update Error',
        message: 'Failed to save profile changes.',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    const skillNames: Record<string, { name: string; cat: string }> = {
      skill_javascript: { name: 'JavaScript', cat: 'Frontend' },
      skill_react: { name: 'React', cat: 'Frontend' },
      skill_nodejs: { name: 'Node.js', cat: 'Backend' },
      skill_typescript: { name: 'TypeScript', cat: 'Frontend' },
      skill_docker: { name: 'Docker', cat: 'DevOps' },
      skill_git: { name: 'Git', cat: 'DevOps' },
      skill_python: { name: 'Python', cat: 'Backend' },
      skill_sql: { name: 'SQL', cat: 'Database' },
      skill_css: { name: 'CSS', cat: 'Frontend' },
      skill_html: { name: 'HTML', cat: 'Frontend' },
    };
    const meta = skillNames[newSkillId] || { name: newSkillId.replace('skill_', '').toUpperCase(), cat: 'General' };

    // Optimistically update local state immediately
    const currentSkills = Array.isArray(profile?.skills) ? [...profile.skills] : [];
    const idx = currentSkills.findIndex((s: any) => s.skill_id === newSkillId);
    if (idx >= 0) {
      currentSkills[idx] = { ...currentSkills[idx], level: Number(newSkillLevel) };
    } else {
      currentSkills.push({
        skill_id: newSkillId,
        name: meta.name,
        category: meta.cat,
        level: Number(newSkillLevel),
      });
    }
    const updatedProfile = { ...profile, skills: currentSkills };
    setProfile(updatedProfile);

    try {
      await client.post('/profile/skills', {
        skill_id: newSkillId,
        level: Number(newSkillLevel),
      });
      addToast({
        type: 'success',
        title: 'Skill Added',
        message: `Registered ${meta.name} with proficiency ${newSkillLevel}%.`,
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Could not register skill.',
      });
    }
  };

  const handleDeleteSkill = async (skillId: string) => {
    // Optimistically remove from local state immediately
    const currentSkills = Array.isArray(profile?.skills) ? profile.skills.filter((s: any) => s.skill_id !== skillId) : [];
    setProfile({ ...profile, skills: currentSkills });

    try {
      await client.delete(`/profile/skills/${skillId}`);
      addToast({
        type: 'info',
        title: 'Skill Removed',
        message: 'Skill removed from active profile.',
      });
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Could not delete skill.',
      });
    }
  };

  const handleResumeExtract = async () => {
    if (!resumeText.trim()) return;
    setParsingResume(true);
    try {
      const res = await client.post('/profile/resume', { text: resumeText });
      addToast({
        type: 'success',
        title: 'Resume Analyzed',
        message: `Extracted ${res.data.extracted_skills?.length || 0} skills and updated career gap analysis.`,
      });
      setResumeText('');
      loadProfile();
    } catch {
      addToast({
        type: 'error',
        title: 'Extraction Error',
        message: 'Failed to process resume text.',
      });
    } finally {
      setParsingResume(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-8">
      <HeroBanner
        titlePrefix="Personal profile and"
        highlightedWord="skills"
        titleSuffix="inventory"
        subtitle="Manage verified capabilities, target goals, and automated resume gap extraction."
        badge="Learner Profile & Credentials"
        metric={{
          value: profile?.skills?.length || 0,
          label: "Registered Skills",
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Personal Information & Resume Extraction */}
        <div className="lg:col-span-6 space-y-8">
          
          {/* User Details Form */}
          <div className="card-modern">
            <h2 className="font-heading text-xl font-semibold text-[#10231C] mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[#0B3B2E]" />
              <span>Personal details</span>
            </h2>

            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4B5E55] mb-1.5">Full name</label>
                <input
                  type="text"
                  value={profile?.name || ''}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full h-11 px-3.5 text-sm rounded-xl border border-[#E8E4D2] bg-[#FAF7E8]/40 outline-none focus:border-[#0B3B2E] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4B5E55] mb-1.5">Email address</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full h-11 px-3.5 text-sm rounded-xl border border-[#E8E4D2] bg-[#FAF7E8]/40 outline-none focus:border-[#0B3B2E] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4B5E55] mb-1.5">Professional bio & academic context</label>
                <textarea
                  rows={3}
                  value={profile?.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full p-3.5 text-sm rounded-xl border border-[#E8E4D2] bg-[#FAF7E8]/40 outline-none focus:border-[#0B3B2E] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn-forest disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving changes...' : 'Save details'}</span>
              </button>
            </form>
          </div>

          {/* Resume Gap Analyzer */}
          <div className="card-modern">
            <h2 className="font-heading text-xl font-semibold text-[#10231C] mb-1.5 flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#0B3B2E]" />
              <span>Resume skill extractor</span>
            </h2>
            <p className="text-xs text-[#4B5E55] mb-4 leading-relaxed">
              Paste your raw resume text or coursework transcript below. The Profile Agent automatically extracts verified technologies and aligns them with your target career.
            </p>

            <div className="space-y-4">
              <textarea
                rows={5}
                placeholder="Paste resume text here (e.g. 'Experienced with Python, SQL, REST APIs, Git, and basic frontend development')..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="w-full p-3.5 text-sm rounded-xl border border-[#E8E4D2] bg-[#FAF7E8]/40 outline-none focus:border-[#0B3B2E] transition-colors"
              />

              <div className="flex flex-wrap justify-between items-center gap-3">
                <button
                  type="button"
                  onClick={() => setResumeText("Arjun Kumar\nB.Tech Computer Science\nSkills: Python (Flask, Django), PostgreSQL, SQLite, HTML5, CSS3, Git version control, REST APIs. Academic projects include database query optimizer and data processing pipeline.")}
                  className="text-xs text-[#0B3B2E] font-medium underline hover:text-[#072A21]"
                >
                  Insert sample resume
                </button>

                <button
                  onClick={handleResumeExtract}
                  disabled={parsingResume || !resumeText.trim()}
                  className="btn-forest disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-[#C6F36B]" />
                  <span>{parsingResume ? 'Extracting skills...' : 'Extract & analyze gaps'}</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Skills Repertory Table & Add Skill */}
        <div className="lg:col-span-6 space-y-8">
          
          <div className="card-modern">
            <h2 className="font-heading text-xl font-semibold text-[#10231C] mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-[#0B3B2E]" />
              <span>Registered skills ({profile?.skills?.length || 0})</span>
            </h2>

            {/* Add Skill Bar */}
            <form onSubmit={handleAddSkill} className="p-4 bg-[#FAF7E8] border border-[#E8E4D2] rounded-2xl mb-6 space-y-3">
              <div className="font-semibold text-xs text-[#10231C]">Add or update skill proficiency</div>
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                <div className="sm:col-span-6">
                  <select
                    value={newSkillId}
                    onChange={(e) => setNewSkillId(e.target.value)}
                    className="w-full h-10 px-3 text-xs rounded-xl border border-[#E8E4D2] bg-white outline-none focus:border-[#0B3B2E]"
                  >
                    <option value="skill_javascript">JavaScript (Frontend)</option>
                    <option value="skill_react">React (Frontend)</option>
                    <option value="skill_nodejs">Node.js (Backend)</option>
                    <option value="skill_typescript">TypeScript (Frontend)</option>
                    <option value="skill_docker">Docker (DevOps)</option>
                    <option value="skill_git">Git (DevOps)</option>
                    <option value="skill_python">Python (Backend)</option>
                    <option value="skill_sql">SQL (Database)</option>
                    <option value="skill_css">CSS (Frontend)</option>
                  </select>
                </div>
                <div className="sm:col-span-4 flex items-center gap-2">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={newSkillLevel}
                    onChange={(e) => setNewSkillLevel(Number(e.target.value))}
                    className="w-full accent-[#0B3B2E]"
                  >
                  </input>
                  <span className="text-xs font-bold text-[#10231C] w-10 text-right">{newSkillLevel}%</span>
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    className="w-full h-10 bg-[#0B3B2E] hover:bg-[#072A21] text-white rounded-xl text-xs font-semibold inline-flex items-center justify-center transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>

            {/* Skills Table */}
            <div className="divide-y divide-[#E8E4D2]">
              {profile?.skills?.map((sk: any) => (
                <div key={sk.skill_id} className="py-3.5 flex items-center justify-between gap-4 text-xs">
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-[#10231C]">{sk.name}</div>
                    <div className="text-[11px] text-[#4B5E55]">{sk.category}</div>
                  </div>

                  <div className="w-36 flex items-center gap-2">
                    <div className="w-full h-2.5 bg-[#E8E4D2]/60 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          sk.level >= 70 ? 'bg-[#0B3B2E]' : sk.level >= 50 ? 'bg-[#F59E5B]' : 'bg-[#F5C451]'
                        }`}
                        style={{ width: `${sk.level}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-[#10231C] w-10 text-right">
                      {sk.level}%
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteSkill(sk.skill_id)}
                    className="p-1.5 text-[#4B5E55] hover:text-[#B91C1C] transition-colors rounded-lg hover:bg-[#FAF7E8]"
                    title="Remove Skill"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
