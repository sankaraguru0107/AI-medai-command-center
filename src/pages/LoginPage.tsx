import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Activity,
  Brain,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Rocket,
  ShieldCheck,
  Sparkles,
  Wand2
} from 'lucide-react';
import { useAppStore, generateDemoUser, UserRole } from '../store/appStore';

const DEMO_ROLES: { role: UserRole; label: string; desc: string; color: string }[] = [
  { role: 'admin', label: 'Admin', desc: 'Full access', color: 'from-primary-500/80 to-primary-700/80' },
  { role: 'doctor', label: 'Doctor', desc: 'Clinical Hub', color: 'from-teal-500/80 to-teal-700/80' },
  { role: 'nurse', label: 'Nurse', desc: 'Operations', color: 'from-violet-500/80 to-violet-700/80' },
  { role: 'operations', label: 'Operations', desc: 'Billing/Ops', color: 'from-amber-500/80 to-amber-700/80' },
  { role: 'patient', label: 'Patient', desc: 'Portal', color: 'from-rose-500/80 to-rose-700/80' },
];

export const LoginPage: React.FC = () => {
  return <Navigate to="/hackathon/login" replace />;
  const { setUser } = useAppStore();
  const [selectedRole, setSelectedRole] = useState<UserRole>('doctor');
  const [email, setEmail] = useState('doctor@medai.health');
  const [password, setPassword] = useState('demo1234');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const roleEmails: Record<UserRole, string> = {
    admin: 'admin@medai.health',
    doctor: 'doctor@medai.health',
    patient: 'patient@medai.health',
    nurse: 'nurse@medai.health',
    operations: 'ops@medai.health'
  };

  const handleDemoSelect = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(roleEmails[role]);
    setPassword('demo1234');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // Simulate auth handshake
    setUser(generateDemoUser(selectedRole));
    setLoading(false);
  };

  // Motion values for smooth 3D tilting
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for rotation
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), { damping: 25, stiffness: 200 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), { damping: 25, stiffness: 200 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    x.set(mouseX / width);
    y.set(mouseY / height);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  // Generate glitter sparkles
  const [glitters] = useState(() =>
    Array.from({ length: 45 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 6 + 2}px`,
      delay: `${Math.random() * 4}s`,
      duration: `${Math.random() * 3 + 2.5}s`,
      color: ['rgba(255,255,255,0.85)', 'rgba(56,189,248,0.85)', 'rgba(45,212,191,0.85)', 'rgba(167,139,250,0.85)', 'rgba(244,63,94,0.85)'][
        Math.floor(Math.random() * 5)
      ]
    }))
  );

  return (
    <div className="min-h-screen bg-mesh flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glittering background stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {glitters.map((glitter) => (
          <div
            key={glitter.id}
            className="glitter-particle absolute"
            style={{
              left: glitter.left,
              top: glitter.top,
              width: glitter.size,
              height: glitter.size,
              backgroundColor: glitter.color,
              animationDelay: glitter.delay,
              animationDuration: glitter.duration,
              boxShadow: `0 0 10px ${glitter.color}, 0 0 20px ${glitter.color}`,
            }}
          />
        ))}
      </div>

      {/* Floating 3D ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
      </div>

      <div className="w-full max-w-4xl grid md:grid-cols-12 gap-6 relative z-10 perspective-1000">
        {/* Left column: MedAI Intro Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-5 flex flex-col justify-center p-6 md:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-teal flex items-center justify-center shadow-glow-blue">
              <Activity size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-slate-900 leading-none">MedAI</h1>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">Command Center</p>
            </div>
          </div>

          <h2 className="text-3xl font-display font-extrabold text-slate-900 leading-tight mb-4">
            Next-Gen AI<br />
            <span className="text-gradient">Clinical Interface</span>
          </h2>

          <p className="text-slate-500 text-sm leading-relaxed mb-6">
            Experience HIPAA-compliant, real-time command systems integrating clinical operations, scribes, and diagnostics.
          </p>

          <div className="space-y-3 mb-6">
            {[
              { icon: Brain, text: 'Real-time AI Copilot systems' },
              { icon: ShieldCheck, text: 'HIPAA-compliant Supabase vault' },
              { icon: Sparkles, text: 'Glitter 3D responsive UI design' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary-50 flex items-center justify-center">
                  <Icon size={14} className="text-primary-500" />
                </div>
                <span className="text-xs font-medium text-slate-600">{text}</span>
              </div>
            ))}
          </div>

          <Link
            to="/hackathon/login"
            className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-500 via-primary-600 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white shadow-lg shadow-sky-500/20 transition-all hover:scale-[1.02] flex items-center gap-3"
          >
            <div className="p-2 rounded-xl bg-white/20">
              <Rocket size={18} className="text-yellow-300 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-extrabold flex items-center gap-1.5">
                <span>MedResilience AI Hackathon Demo</span>
                <span className="px-1.5 py-0.2 text-[9px] bg-white text-sky-700 rounded-full font-black uppercase">NEW</span>
              </div>
              <p className="text-[10px] text-white/80 font-medium">Predict shortages before they become emergencies →</p>
            </div>
          </Link>
        </motion.div>

        {/* Right column: 3D Login Card container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          className="md:col-span-7 glitter-card rounded-3xl p-8 relative flex flex-col justify-between preserve-3d border border-white/20 transition-shadow hover:shadow-2xl"
        >
          {/* Card inner glitter highlights */}
          <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none opacity-40 z-0">
            <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
          </div>

          <div className="relative z-10 preserve-3d">
            {/* Top row */}
            <div className="flex justify-between items-start mb-6 translate-z-20">
              <div>
                <h3 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">Access Hub</h3>
                <p className="text-xs text-slate-500 font-medium">Verify credentials or choose demo role</p>
              </div>
              <div className="p-2 bg-white/40 backdrop-blur-sm rounded-xl border border-white/50">
                <Wand2 size={16} className="text-primary-600 animate-pulse" />
              </div>
            </div>

            {/* Login form */}
            <form onSubmit={handleLogin} className="space-y-4 translate-z-40">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Workspace Email</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/70 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all shadow-sm"
                    placeholder="name@hospital.org"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">Security Password</label>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-white/70 border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:bg-white transition-all shadow-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary-500/20 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enter Command Center</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Demo Access */}
          <div className="mt-8 pt-5 border-t border-slate-200/50 translate-z-20 relative z-10">
            <p className="text-xs font-bold text-slate-500 text-center mb-3">Quick Demo Authentication</p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {DEMO_ROLES.map(({ role, label, desc, color }) => (
                <button
                  key={role}
                  onClick={() => {
                    handleDemoSelect(role);
                    setUser(generateDemoUser(role));
                  }}
                  className={`p-2 rounded-xl bg-gradient-to-br ${color} text-white transition-all hover:scale-105 active:scale-95 shadow-sm flex flex-col items-center justify-center text-center`}
                >
                  <span className="text-[11px] font-bold tracking-tight block">{label}</span>
                  <span className="text-[9px] opacity-80 block truncate w-full mt-0.5">{desc}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
