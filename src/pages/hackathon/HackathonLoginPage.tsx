import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  Activity,
  Brain,
  Check,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Network,
  Rocket,
  ShieldAlert,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useHackathonStore } from '../../store/hackathonStore';

export const HackathonLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginHackathon } = useHackathonStore();

  const [email, setEmail] = useState('hackathon@medresilience.ai');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCopyCredentials = () => {
    navigator.clipboard.writeText('hackathon@medresilience.ai / demo123');
    setEmail('hackathon@medresilience.ai');
    setPassword('demo123');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 450));
    loginHackathon(email);
    setLoading(false);
    navigate('/hackathon/dashboard');
  };

  const handleInstantDemoLaunch = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 350));
    loginHackathon('hackathon@medresilience.ai');
    setLoading(false);
    navigate('/hackathon/dashboard');
  };

  // Motion values for smooth 3D tilting
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [8, -8]), { damping: 25, stiffness: 200 });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-8, 8]), { damping: 25, stiffness: 200 });

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

  // Light particle dots
  const [glitters] = useState(() =>
    Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: `${Math.random() * 6 + 3}px`,
      delay: `${Math.random() * 4}s`,
      duration: `${Math.random() * 3 + 2.5}s`,
      color: ['rgba(14,165,233,0.3)', 'rgba(20,184,166,0.3)', 'rgba(99,102,241,0.3)', 'rgba(56,189,248,0.3)'][
        Math.floor(Math.random() * 4)
      ],
    }))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50/40 to-indigo-50/30 flex items-center justify-center p-4 md:p-8 relative overflow-hidden font-sans">
      {/* Light Starfield Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {glitters.map((glitter) => (
          <div
            key={glitter.id}
            className="glitter-particle absolute rounded-full"
            style={{
              left: glitter.left,
              top: glitter.top,
              width: glitter.size,
              height: glitter.size,
              backgroundColor: glitter.color,
              animationDelay: glitter.delay,
              animationDuration: glitter.duration,
              boxShadow: `0 0 10px ${glitter.color}`,
            }}
          />
        ))}
      </div>

      {/* Soft Ambient Glow Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/5 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s' }} />
        <div className="absolute bottom-1/4 right-1/5 w-[30rem] h-[30rem] bg-indigo-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute top-1/2 right-1/3 w-80 h-80 bg-teal-200/40 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '7s' }} />
      </div>

      <div className="w-full max-w-6xl grid md:grid-cols-12 gap-8 relative z-10 items-center">
        {/* Left Side Presentation Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="md:col-span-6 flex flex-col justify-center p-2 md:p-6"
        >
          {/* Brand Header */}
          <div className="flex items-center gap-3.5 mb-6">
            <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-sky-600 via-primary-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/25 ring-4 ring-white">
              <Activity size={26} className="text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-display font-black tracking-tight text-slate-900">MedResilience AI</h1>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase bg-sky-100 text-sky-800 rounded-full border border-sky-200">
                  White Theme
                </span>
              </div>
              <p className="text-[11px] text-sky-700 font-bold uppercase tracking-wider mt-0.5">
                HEALTH RESILIENCE COMMAND CENTER
              </p>
            </div>
          </div>

          {/* Main Headline */}
          <h2 className="text-3xl md:text-4xl font-display font-black text-slate-900 leading-tight mb-4">
            Predict shortages before they become <span className="text-gradient">emergencies.</span>
          </h2>

          <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8 font-medium">
            MedResilience AI provides real-time visibility into beds, medicines, medical personnel and demand — using AI to identify risks and recommend proactive resource redistribution.
          </p>

          {/* 4 Key Feature Points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: Activity,
                title: 'Real-Time Health Intelligence',
                desc: 'Monitor healthcare resources across hospitals and PHCs.',
                color: 'bg-sky-50 text-sky-700 border-sky-200',
              },
              {
                icon: TrendingUp,
                title: 'AI Demand Forecasting',
                desc: 'Predict future bed, medicine and patient demand.',
                color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
              },
              {
                icon: ShieldAlert,
                title: 'Early Warning System',
                desc: 'Detect potential shortages before they become critical.',
                color: 'bg-amber-50 text-amber-700 border-amber-200',
              },
              {
                icon: Network,
                title: 'AI Resource Redistribution',
                desc: 'Recommend cross-district resource movement.',
                color: 'bg-teal-50 text-teal-700 border-teal-200',
              },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div
                key={title}
                className="p-4 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/90 shadow-sm hover:shadow-md transition-all hover:border-sky-300 group"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl border ${color} shrink-0 group-hover:scale-110 transition-transform`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-sky-700 transition-colors">{title}</h3>
                    <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Side Glassmorphism White Login Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          className="md:col-span-6 rounded-3xl p-6 md:p-8 relative flex flex-col justify-between preserve-3d border border-slate-200/90 shadow-2xl backdrop-blur-xl bg-white/95 text-slate-900"
        >
          <div className="relative z-10 preserve-3d">
            {/* Card Header */}
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="px-2.5 py-1 text-[10px] font-bold text-sky-800 bg-sky-100 rounded-full uppercase tracking-wider mb-2 inline-block">
                  Predict. Prepare. Protect.
                </span>
                <h3 className="text-2xl font-display font-extrabold text-slate-900 tracking-tight">
                  Hackathon Demo Access
                </h3>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  Sign in to the MedResilience AI command center
                </p>
              </div>
              <div className="p-2.5 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-2xl text-white shadow-md shadow-sky-500/20">
                <Brain size={20} className="animate-pulse" />
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleStandardLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 focus:bg-white transition-all text-slate-900"
                    placeholder="hackathon@medresilience.ai"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 focus:bg-white transition-all text-slate-900"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 via-primary-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Enter Hackathon Command Center</span>
                )}
              </button>
            </form>

            {/* Quick Demo Access */}
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="relative text-center mb-3">
                <span className="bg-white px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick Demo Access
                </span>
              </div>

              <button
                type="button"
                onClick={handleInstantDemoLaunch}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-sky-600 hover:from-emerald-400 hover:to-sky-500 text-white font-extrabold text-sm shadow-xl shadow-teal-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 group"
              >
                <Rocket size={18} className="text-yellow-300 group-hover:rotate-12 transition-transform" />
                <span className="tracking-wide">🚀 Launch Hackathon Demo</span>
              </button>

              {/* Demo Account Credentials Note */}
              <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                <div>
                  <span className="font-extrabold text-slate-800 uppercase text-[10px] tracking-wider block">
                    Demo Account
                  </span>
                  <div className="font-mono text-[11px] text-slate-700 mt-0.5">
                    Email: <span className="font-bold text-sky-700">hackathon@medresilience.ai</span> | Pass:{' '}
                    <span className="font-bold text-sky-700">demo123</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="p-2 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-sky-600 hover:border-sky-300 transition-all shrink-0 flex items-center gap-1 text-[11px] font-semibold"
                >
                  {copied ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
