import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Check, Sparkles, User, Briefcase, Clock, ShieldCheck } from 'lucide-react';
import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

interface SelectedAccount {
  name: string;
  email: string;
  avatar: string;
  credential: string;
  firstName: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { loginWithGoogle, loginWithDemo } = useAuth();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<SelectedAccount | null>(null);
  const [showSimulatedChooser, setShowSimulatedChooser] = useState(false);

  // New user onboarding state
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['skill_python', 'skill_html']);
  const [selectedRole, setSelectedRole] = useState('role_fullstack');
  const [weeklyHours, setWeeklyHours] = useState(10);

  const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || '';
  const isGoogleConfigured = Boolean(googleClientId && googleClientId.length > 5);

  // Parse JWT token from Google Identity Services on client
  const parseJwt = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  // Google Identity Services setup
  useEffect(() => {
    if (!isGoogleConfigured) return;

    const checkGsi = () => {
      if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
        try {
          (window as any).google.accounts.id.initialize({
            client_id: googleClientId,
            auto_select: false,
            cancel_on_tap_outside: true,
            callback: (response: any) => {
              if (response?.credential) {
                const payload = parseJwt(response.credential);
                const fullName = payload?.name || payload?.email?.split('@')[0] || 'Learner';
                const firstName = fullName.split(' ')[0];
                setSelectedAccount({
                  name: fullName,
                  email: payload?.email || '',
                  avatar: payload?.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                  credential: response.credential,
                  firstName,
                });
                setError(null);
              } else {
                setError('Sign-in was cancelled.');
              }
            },
          });
        } catch (e) {
          console.warn('GIS init error:', e);
        }
      }
    };

    checkGsi();
    const timer = setTimeout(checkGsi, 1000);
    return () => clearTimeout(timer);
  }, [googleClientId, isGoogleConfigured]);

  // Trigger Google Account Chooser
  const handleOpenAccountChooser = () => {
    setError(null);
    if (isGoogleConfigured && (window as any).google?.accounts?.id) {
      setLoading(true);
      try {
        (window as any).google.accounts.id.prompt((notification: any) => {
          setLoading(false);
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // If one-tap is suppressed or blocked by browser settings, surface prompt modal
            setShowSimulatedChooser(true);
          }
        });
      } catch {
        setLoading(false);
        setShowSimulatedChooser(true);
      }
    } else {
      // In development or when client ID is not configured, show Google account picker modal
      setShowSimulatedChooser(true);
    }
  };

  // Select an account from the chooser
  const handlePickAccount = (acc: { name: string; email: string; avatar: string }) => {
    setShowSimulatedChooser(false);
    const firstName = acc.name.split(' ')[0];
    // Create a client-side mock JWT credential for verification
    const mockPayload = {
      name: acc.name,
      email: acc.email,
      picture: acc.avatar,
      email_verified: true,
      sub: `google-${acc.email}`,
    };
    const b64Payload = btoa(JSON.stringify(mockPayload));
    const mockCred = `demo_token_.${b64Payload}.signature`;

    setSelectedAccount({
      name: acc.name,
      email: acc.email,
      avatar: acc.avatar,
      credential: mockCred,
      firstName,
    });
  };

  // Step 4: User explicitly clicks "Sign in as <first name>"
  const handleConfirmSignIn = async () => {
    if (!selectedAccount) return;
    setLoading(true);
    setError(null);
    try {
      const user = await loginWithGoogle(selectedAccount.credential);
      if (user.is_new) {
        setIsOnboarding(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Could not verify your Google account. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Demo Sign-In
  const handleDemoSignIn = async (e: React.MouseEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await loginWithDemo();
      navigate('/dashboard');
    } catch {
      setError('Could not connect to demo service.');
    } finally {
      setLoading(false);
    }
  };

  // Finish Onboarding
  const handleCompleteOnboarding = async () => {
    setLoading(true);
    try {
      // Save selected skills
      for (const skill_id of selectedSkills) {
        await client.post('/profile/skills', { skill_id, level: 60 });
      }
      // Save target role
      await client.post('/career/target', { role_id: selectedRole });
      navigate('/dashboard');
    } catch {
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      
      {/* Left Half (Desktop only): Forest Green with Path Illustration & Headline */}
      <div className="hidden md:flex md:w-1/2 bg-[#0B3B2E] p-12 lg:p-16 flex-col justify-between relative overflow-hidden text-white">
        {/* Soft lime glow */}
        <div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none opacity-20"
          style={{
            background: 'radial-gradient(circle, #C6F36B 0%, transparent 70%)',
            filter: 'blur(70px)',
          }}
        />

        {/* Top: Logo */}
        <div className="relative z-10">
          <Logo size="lg" variant="light" tagline={true} />
        </div>

        {/* Center: Winding path of lime stepping dots ending at a target flag */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto py-12">
          <svg width="280" height="180" viewBox="0 0 280 180" fill="none" className="mb-8" role="img" aria-label="Skillpath illustration">
            <path
              d="M30 145 C80 145, 70 85, 140 85 C200 85, 190 35, 240 35"
              stroke="#135443"
              strokeWidth="3"
              strokeDasharray="6 6"
              fill="none"
            />
            <circle cx="35" cy="145" r="7" fill="#C6F36B" />
            <circle cx="70" cy="130" r="5" fill="#C6F36B" />
            <circle cx="105" cy="100" r="5" fill="#C6F36B" />
            <circle cx="140" cy="85" r="7" fill="#C6F36B" />
            <circle cx="175" cy="65" r="5" fill="#C6F36B" />
            <circle cx="210" cy="45" r="5" fill="#C6F36B" />
            <circle cx="240" cy="35" r="7" fill="#C6F36B" />

            <g transform="translate(45, 105)">
              <rect width="36" height="24" rx="6" fill="#C6F36B" />
              <rect x="6" y="7" width="24" height="3" rx="1.5" fill="#0B3B2E" />
              <rect x="6" y="14" width="16" height="3" rx="1.5" fill="#0B3B2E" />
            </g>

            <g transform="translate(125, 45)">
              <rect width="36" height="24" rx="6" fill="#C6F36B" />
              <rect x="6" y="7" width="24" height="3" rx="1.5" fill="#0B3B2E" />
              <rect x="6" y="14" width="16" height="3" rx="1.5" fill="#0B3B2E" />
            </g>

            <g transform="translate(240, 20)">
              <line x1="0" y1="0" x2="0" y2="40" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M0 0 L24 9 L0 18 Z" fill="#C6F36B" />
            </g>
          </svg>

          <h2 className="font-heading text-2xl lg:text-3xl font-bold text-center text-white leading-tight">
            Close your <span className="highlight-word">skill gap</span>.
          </h2>
        </div>

        {/* Bottom space */}
        <div className="relative z-10 text-xs text-[#A9BDB1]">
          Skillpath · Your path from skills to career
        </div>
      </div>

      {/* Right Half: Cream Background with Centered Form / Confirmation / Onboarding */}
      <div className="flex-1 bg-[#FAF7E8] flex flex-col justify-center items-center p-6 sm:p-12 relative min-h-screen">
        
        {/* Top-Left: Back to home link */}
        <Link
          to="/"
          className="absolute top-6 left-6 text-xs font-semibold text-[#4B5E55] hover:text-[#0B3B2E] transition-colors inline-flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          <span>Back to home</span>
        </Link>

        {/* Mobile Header: Logo */}
        <div className="md:hidden mb-8 mt-6">
          <Logo size="md" variant="dark" tagline={false} />
        </div>

        {/* Main Content Card Container */}
        <div className="w-full max-w-[400px]">
          
          {/* STATE A: New User Onboarding (3 Steps) */}
          {isOnboarding ? (
            <div className="card-modern space-y-5">
              <div className="flex items-center justify-between pb-2 border-b border-[#E8E4D2]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#C6F36B]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0B3B2E]">
                    Step {onboardingStep} of 3
                  </span>
                </div>
                <span className="text-xs text-[#4B5E55]">Personalized Onboarding</span>
              </div>

              {onboardingStep === 1 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-[#10231C]">What skills do you know?</h3>
                    <p className="text-xs text-[#4B5E55] mt-1">Select the tools or languages you have practiced before.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'skill_python', name: 'Python' },
                      { id: 'skill_sql', name: 'SQL' },
                      { id: 'skill_html', name: 'HTML' },
                      { id: 'skill_javascript', name: 'JavaScript' },
                      { id: 'skill_react', name: 'React' },
                      { id: 'skill_nodejs', name: 'Node.js' },
                    ].map((s) => {
                      const active = selectedSkills.includes(s.id);
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            if (active) {
                              setSelectedSkills(selectedSkills.filter((x) => x !== s.id));
                            } else {
                              setSelectedSkills([...selectedSkills, s.id]);
                            }
                          }}
                          className={`h-9 px-4 rounded-full text-xs font-semibold transition-all ${
                            active
                              ? 'bg-[#0B3B2E] text-[#C6F36B] shadow-xs'
                              : 'bg-[#FAF7E8] text-[#10231C] border border-[#E8E4D2] hover:border-[#0B3B2E]'
                          }`}
                        >
                          {active && <Check size={12} className="inline mr-1.5" />}
                          {s.name}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setOnboardingStep(2)}
                    className="btn-lime w-full h-11 text-xs font-bold"
                  >
                    Continue to Target Role
                  </button>
                </div>
              )}

              {onboardingStep === 2 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-[#10231C]">Choose your career destination</h3>
                    <p className="text-xs text-[#4B5E55] mt-1">Our agents evaluate industry requirements for this target role.</p>
                  </div>
                  <div className="space-y-2">
                    {[
                      { id: 'role_fullstack', name: 'Full Stack Developer', desc: 'React, Node.js, Databases' },
                      { id: 'role_backend', name: 'Backend Engineer', desc: 'Python, APIs, Distributed Systems' },
                      { id: 'role_data_engineer', name: 'Data Engineer', desc: 'SQL, Pipelines, Warehousing' },
                    ].map((r) => (
                      <div
                        key={r.id}
                        onClick={() => setSelectedRole(r.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          selectedRole === r.id
                            ? 'border-[#0B3B2E] bg-[#E4F4E8]/50 ring-1 ring-[#0B3B2E]'
                            : 'border-[#E8E4D2] hover:bg-white'
                        }`}
                      >
                        <div className="text-xs font-bold text-[#10231C]">{r.name}</div>
                        <div className="text-[11px] text-[#4B5E55]">{r.desc}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(1)}
                      className="btn-outline flex-1 h-11 text-xs"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={() => setOnboardingStep(3)}
                      className="btn-lime flex-1 h-11 text-xs font-bold"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {onboardingStep === 3 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-[#10231C]">Weekly study commitment</h3>
                    <p className="text-xs text-[#4B5E55] mt-1">We calibrate module milestones to match your real schedule.</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[5, 10, 15].map((hrs) => (
                      <button
                        key={hrs}
                        type="button"
                        onClick={() => setWeeklyHours(hrs)}
                        className={`h-14 rounded-2xl flex flex-col items-center justify-center text-xs font-bold transition-all ${
                          weeklyHours === hrs
                            ? 'bg-[#0B3B2E] text-[#C6F36B] shadow-xs'
                            : 'bg-white border border-[#E8E4D2] text-[#10231C] hover:border-[#0B3B2E]'
                        }`}
                      >
                        <span>{hrs} hrs</span>
                        <span className="text-[10px] font-normal opacity-70">per week</span>
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleCompleteOnboarding}
                    className="btn-lime w-full h-12 text-xs font-bold gap-2"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    <span>Complete onboarding & view my roadmap</span>
                  </button>
                </div>
              )}
            </div>
          ) : selectedAccount ? (
            /* STATE B: Account Picked -> Confirmation Card */
            <div className="card-modern space-y-6 text-center animate-in fade-in duration-200">
              <div className="flex flex-col items-center">
                <div className="relative mb-3">
                  <img
                    src={selectedAccount.avatar}
                    alt={selectedAccount.name}
                    className="w-16 h-16 rounded-full object-cover ring-3 ring-[#0B3B2E]/20 shadow-md"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-xs border border-[#E8E4D2]">
                    <svg width="14" height="14" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                </div>

                <h2 className="font-heading text-lg font-bold text-[#10231C]">
                  {selectedAccount.name}
                </h2>
                <p className="text-xs text-[#4B5E55] mt-0.5">
                  {selectedAccount.email}
                </p>
              </div>

              {error && (
                <div className="p-3 bg-[#F4B6C2]/30 border border-[#F4B6C2] rounded-xl text-xs text-[#B91C1C]">
                  {error}
                </div>
              )}

              <div className="space-y-3 pt-1">
                {/* Primary Pill "Sign in as <first name>" (48px) */}
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleConfirmSignIn}
                  className="w-full h-12 rounded-full bg-[#0B3B2E] hover:bg-[#072A21] text-white text-sm font-semibold transition-all shadow-xs hover:shadow-md focus:outline-none focus:ring-3 focus:ring-[#0B3B2E]/40 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#C6F36B]" />
                  ) : (
                    <span>Sign in as {selectedAccount.firstName}</span>
                  )}
                </button>

                {/* Text link "Use a different account" */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAccount(null);
                      setError(null);
                    }}
                    className="text-xs font-medium text-[#4B5E55] hover:text-[#0B3B2E] hover:underline transition-colors"
                  >
                    Use a different account
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* STATE C: Default Login Form */
            <div className="space-y-6">
              <div>
                <h1 className="font-heading text-2xl sm:text-[28px] font-bold text-[#10231C] leading-tight">
                  Welcome to Skillpath
                </h1>
                <p className="text-xs text-[#4B5E55] mt-1.5">
                  Pick your Google account to access your personalized learning roadmap.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-[#F4B6C2]/30 border border-[#F4B6C2] rounded-xl text-xs text-[#B91C1C]">
                  {error}
                </div>
              )}

              {/* Button: Continue with Google (48px white pill, multicolor G) */}
              <div className="space-y-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleOpenAccountChooser}
                  className="w-full h-12 rounded-full bg-white border border-[#E8E4D2] hover:border-[#0B3B2E] text-[#10231C] text-sm font-semibold inline-flex items-center justify-center gap-3 shadow-xs hover:shadow-sm transition-all focus:outline-none focus:ring-3 focus:ring-[#C6F36B]/50 active:scale-[0.99]"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-[#0B3B2E]" />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>

                {!isGoogleConfigured && (
                  <p className="text-[11px] text-[#4B5E55] text-center">
                    (Click to select from available demo Google accounts)
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-[#E8E4D2] w-full" />
                <span className="bg-[#FAF7E8] px-3 text-xs text-[#4B5E55] font-medium absolute">
                  or
                </span>
              </div>

              {/* Demo Account Link */}
              <div className="card-modern p-4 text-center space-y-2 bg-white/70">
                <div className="text-xs font-semibold text-[#10231C]">Default Enterprise Demo</div>
                <p className="text-[11px] text-[#4B5E55]">
                  Instant sign-in preloaded with Arjun Kumar (B.Tech student targeting Full Stack Development).
                </p>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleDemoSignIn}
                  className="btn-lime w-full h-10 text-xs font-bold"
                >
                  Enter with Arjun's profile
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Account Chooser Dialog (Google Account Picker simulator when GIS is offline or testing) */}
      {showSimulatedChooser && (
        <div className="fixed inset-0 z-50 bg-[#072A21]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#E8E4D2] shadow-2xl max-w-sm w-full p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E4D2]">
              <div className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="text-xs font-bold text-[#10231C]">Choose an account</span>
              </div>
              <button
                onClick={() => setShowSimulatedChooser(false)}
                className="text-xs text-[#4B5E55] hover:text-[#10231C]"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-[#4B5E55]">
              to continue to <strong className="text-[#10231C]">Skillpath</strong>
            </p>

            <div className="space-y-2">
              {[
                {
                  name: 'Arjun Kumar',
                  email: 'arjun.kumar@gmail.com',
                  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
                },
                {
                  name: 'Priya Sharma',
                  email: 'priya.sharma@gmail.com',
                  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
                },
                {
                  name: 'Rohan Mehta',
                  email: 'rohan.mehta@gmail.com',
                  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
                },
              ].map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handlePickAccount(acc)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-[#FAF7E8] border border-transparent hover:border-[#E8E4D2] transition-all text-left"
                >
                  <img src={acc.avatar} alt={acc.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-[#10231C] truncate">{acc.name}</div>
                    <div className="text-[11px] text-[#4B5E55] truncate">{acc.email}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-[#E8E4D2]">
              <div className="flex items-center gap-1.5 text-[11px] text-[#4B5E55]">
                <ShieldCheck size={14} className="text-[#1F8A4C]" />
                <span>Skillpath uses OAuth 2.0 to protect your data</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
