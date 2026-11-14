import { supabase, isSupabaseConfigured } from './supabase';
import { MOCK_USER, MOCK_RESUME, MOCK_ROADMAP, MOCK_ROLES } from '../api/mockData';

export interface ProfileRecord {
  id: string | number;
  name: string;
  email: string;
  bio?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  github?: string;
  avatar?: string;
  education_level?: string;
  branch?: string;
  target_role?: string;
  education?: any[];
  projects?: any[];
}

export const supabaseService = {
  // 1. Profile operations
  async getProfile(userId: string | number): Promise<ProfileRecord | null> {
    if (!isSupabaseConfigured) {
      const local = localStorage.getItem('sb-user');
      return local ? JSON.parse(local) : MOCK_USER;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Supabase getProfile error:', error);
      }
      return data || null;
    } catch (err) {
      console.warn('Supabase fetch exception:', err);
      return null;
    }
  },

  async upsertProfile(profile: Partial<ProfileRecord> & { id: string | number }): Promise<ProfileRecord | null> {
    if (!isSupabaseConfigured) {
      const current = localStorage.getItem('sb-user');
      const updated = { ...(current ? JSON.parse(current) : MOCK_USER), ...profile };
      localStorage.setItem('sb-user', JSON.stringify(updated));
      return updated;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert(profile)
        .select()
        .single();

      if (error) {
        console.error('Supabase upsertProfile error:', error);
      }
      return data;
    } catch (err) {
      console.error('Supabase upsertProfile exception:', err);
      return null;
    }
  },

  // 2. User Skills
  async getUserSkills(userId: string | number) {
    if (!isSupabaseConfigured) {
      return [
        { skill_id: 'skill_python', name: 'Python', level: 85, category: 'Backend' },
        { skill_id: 'skill_sql', name: 'SQL', level: 80, category: 'Database' },
        { skill_id: 'skill_javascript', name: 'JavaScript', level: 75, category: 'Frontend' },
        { skill_id: 'skill_react', name: 'React', level: 70, category: 'Frontend' },
        { skill_id: 'skill_html', name: 'HTML', level: 85, category: 'Frontend' },
      ];
    }

    const { data, error } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', userId);

    if (error) console.warn('Supabase getUserSkills error:', error);
    return data || [];
  },

  async setUserSkill(userId: string | number, skillId: string, level: number) {
    if (!isSupabaseConfigured) return { success: true };

    const { data, error } = await supabase
      .from('user_skills')
      .upsert({ user_id: userId, skill_id: skillId, level });

    if (error) console.error('Supabase setUserSkill error:', error);
    return data;
  },

  // 3. Resume
  async getResume(userId: string | number, roleId = 'role_fullstack', template = 'modern') {
    if (!isSupabaseConfigured) {
      const localResume = localStorage.getItem(`sb-resume-${roleId}`);
      return localResume ? JSON.parse(localResume) : { ...MOCK_RESUME, template };
    }

    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .eq('role_id', roleId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Supabase getResume error:', error);
    }
    return data?.resume_data || { ...MOCK_RESUME, template };
  },

  async saveResume(userId: string | number, roleId: string, resumeData: any, template = 'modern') {
    if (!isSupabaseConfigured) {
      localStorage.setItem(`sb-resume-${roleId}`, JSON.stringify(resumeData));
      return { success: true };
    }

    const { data, error } = await supabase
      .from('resumes')
      .upsert({
        user_id: userId,
        role_id: roleId,
        template,
        resume_data: resumeData,
        updated_at: new Date().toISOString(),
      });

    if (error) console.error('Supabase saveResume error:', error);
    return data;
  },

  // 4. Roadmap
  async getRoadmap(userId: string | number) {
    if (!isSupabaseConfigured) return MOCK_ROADMAP;

    const { data, error } = await supabase
      .from('roadmaps')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.warn('Supabase getRoadmap error:', error);
    }
    return data?.roadmap_data || MOCK_ROADMAP;
  },

  // 5. Roles
  async getRoles() {
    if (!isSupabaseConfigured) return MOCK_ROLES;

    const { data, error } = await supabase
      .from('roles')
      .select('*');

    if (error || !data || data.length === 0) {
      return MOCK_ROLES;
    }
    return data;
  }
};
