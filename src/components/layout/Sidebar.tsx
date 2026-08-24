import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity, AlertTriangle, BarChart3, Bed, Brain, ChevronDown,
  ChevronRight, ClipboardList, CreditCard, Database, FileText,
  Heart, Home, Lock, MessageCircle, Microscope, Monitor, Pill,
  Settings, Shield, Stethoscope, TestTube, Users, Wifi, X, Zap, LogOut,
  Baby, Droplets, FlaskConical, Layers, TreePine
} from 'lucide-react';
import { useAppStore, UserRole } from '../../store/appStore';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  children?: NavItem[];
  badge?: string;
  badgeType?: 'danger' | 'warning' | 'info';
}

const getNavItems = (role: UserRole): NavItem[] => {
  const allItems: NavItem[] = [
    { id: 'overview', label: 'Command Overview', icon: Home },
    { id: 'medical-profile', label: 'Medical Profile', icon: FileText, badge: 'Passport', badgeType: 'info' },
    { id: 'patients', label: 'Patient Registry', icon: Users },
    {
      id: 'rcm',
      label: 'Patient Access & RCM',
      icon: CreditCard,
      children: [
        { id: 'prior-auth', label: 'Prior Authorization', icon: ClipboardList },
        { id: 'benefits-verify', label: 'Benefits Verification', icon: Shield },
        { id: 'claims', label: 'Claims Integrity', icon: FileText },
      ],
    },
    {
      id: 'clinical-ai',
      label: 'Clinical AI Copilots',
      icon: Stethoscope,
      children: [
        { id: 'documentation', label: 'Documentation AI', icon: FileText },
        { id: 'ambient-scribing', label: 'Ambient Scribing', icon: Wifi },
      ],
    },
    {
      id: 'care-ops',
      label: 'Care Operations',
      icon: Activity,
      children: [
        { id: 'nurse-call', label: 'Nurse Call System', icon: MessageCircle, badge: '3', badgeType: 'danger' },
        { id: 'virtual-care', label: 'Virtual Care Monitor', icon: Monitor },
        { id: 'bed-management', label: 'Bed Management', icon: Bed },
        { id: 'utilization', label: 'Utilization Mgmt', icon: BarChart3 },
      ],
    },
    {
      id: 'interop',
      label: 'Interoperability',
      icon: Database,
      children: [
        { id: 'fhir-engine', label: 'FHIR/HL7 Engine', icon: Layers },
        { id: 'data-quality', label: 'Data Quality', icon: BarChart3 },
      ],
    },
    {
      id: 'medication',
      label: 'Medication & Safety',
      icon: Pill,
      badge: '2',
      badgeType: 'danger',
      children: [
        { id: 'clinical-decision', label: 'Clinical Decision', icon: Brain },
        { id: 'med-alerts', label: 'Medication Alerts', icon: AlertTriangle, badge: '2', badgeType: 'danger' },
        { id: 'opioid-monitor', label: 'Opioid Monitoring', icon: Activity },
      ],
    },
    {
      id: 'cybersecurity',
      label: 'Cybersecurity AI',
      icon: Lock,
      children: [
        { id: 'soc-dashboard', label: 'SOC Dashboard', icon: Shield },
        { id: 'threat-detection', label: 'Threat Detection', icon: AlertTriangle },
      ],
    },
    {
      id: 'patient-engagement',
      label: 'Patient Engagement',
      icon: Heart,
      children: [
        { id: 'post-discharge', label: 'Post-Discharge AI', icon: MessageCircle },
        { id: 'patient-chatbot', label: 'Patient Chatbot', icon: MessageCircle },
      ],
    },
    {
      id: 'specialty',
      label: 'Specialty Monitoring',
      icon: Microscope,
      children: [
        { id: 'icu-sedation', label: 'ICU Sedation', icon: Brain },
        { id: 'chronic-care', label: 'Chronic Care RPM', icon: Activity },
        { id: 'maternal', label: 'Maternal High-Risk', icon: Baby },
        { id: 'dialysis', label: 'Dialysis Monitor', icon: Droplets },
        { id: 'chemo-toxicity', label: 'Chemo Toxicity', icon: FlaskConical },
        { id: 'transfusion', label: 'Transfusion Monitor', icon: TestTube },
        { id: 'transplant', label: 'Transplant Monitor', icon: TreePine },
      ],
    },
    {
      id: 'diagnostics',
      label: 'Diagnostics & Imaging',
      icon: Microscope,
      children: [
        { id: 'radiology-alerts', label: 'Radiology Alerts', icon: AlertTriangle },
        { id: 'incidental-findings', label: 'Incidental Findings', icon: FileText },
        { id: 'contrast-protocol', label: 'Contrast Protocol', icon: Shield },
      ],
    },
    {
      id: 'advanced-ai',
      label: 'Advanced Intelligence',
      icon: Brain,
      children: [
        { id: 'rare-disease', label: 'Rare Disease AI', icon: Zap },
        { id: 'clinical-trials', label: 'Clinical Trials AI', icon: TestTube },
      ],
    },
    {
      id: 'it-support',
      label: 'IT & Support AI',
      icon: Settings,
      children: [
        { id: 'it-helpdesk', label: 'IT Helpdesk AI', icon: Settings },
        { id: 'app-support', label: 'App Support Bots', icon: MessageCircle },
      ],
    },
  ];

  // Filter by role
  const roleFilters: Record<UserRole, string[]> = {
    admin: allItems.map(i => i.id),
    doctor: ['overview', 'patients', 'clinical-ai', 'medication', 'specialty', 'diagnostics', 'advanced-ai'],
    nurse: ['overview', 'patients', 'care-ops', 'medication', 'specialty'],
    operations: ['overview', 'patients', 'rcm', 'care-ops', 'interop', 'cybersecurity', 'it-support'],
    patient: ['overview', 'medical-profile', 'patient-engagement'],
  };

  // Return all items to enable all options across the hub
  return allItems;
};

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const { user, activeModule, setActiveModule, activeDashboard, setActiveDashboard, sidebarOpen } = useAppStore();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(['overview', 'care-ops']));

  const navItems = getNavItems(user?.role || 'admin');

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleItemClick = (item: NavItem) => {
    if (item.children) {
      toggleGroup(item.id);
    } else {
      setActiveModule(item.id);
      setActiveDashboard(item.id);
      onClose?.();
    }
  };

  const isActive = (id: string) => activeModule === id || activeDashboard === id;

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-white w-64 shadow-2xl">
      {/* Logo */}
      <div className="flex items-center justify-between p-5 border-b border-slate-800/80 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-accent-teal flex items-center justify-center shadow-glow-primary">
            <Activity size={20} className="text-white" />
          </div>
          <div>
            <div className="font-display font-extrabold text-white text-base tracking-tight leading-tight">MedAI</div>
            <div className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">Command Center</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400">
            <X size={16} />
          </button>
        )}
      </div>

      {/* User role badge */}
      <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/20">
        <div className="flex items-center gap-3 p-2.5 bg-slate-800/70 border border-slate-700/60 rounded-xl">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary-500 to-accent-indigo flex items-center justify-center text-white text-xs font-bold shadow-sm">
            {user?.name?.charAt(0) || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-200 truncate">{user?.name || 'Guest'}</div>
            <div className="text-[11px] text-primary-400 capitalize font-medium">{user?.role || 'admin'}</div>
          </div>
          <span className="dot-live" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
        {navItems.map(item => (
          <NavGroup
            key={item.id}
            item={item}
            isExpanded={expandedGroups.has(item.id)}
            isActive={isActive(item.id)}
            activeId={activeModule}
            onToggle={() => toggleGroup(item.id)}
            onItemClick={handleItemClick}
          />
        ))}
      </nav>

      {/* Footer System Admin */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 space-y-1">
        <div className="px-3.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          System Admin
        </div>
        <button
          onClick={() => {
            window.location.href = '/hackathon/dashboard';
          }}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all duration-150 w-full cursor-pointer"
        >
          <Shield size={16} className="text-sky-400" />
          <span>Hackathon Admin</span>
          <span className="ml-auto px-1.5 py-0.5 text-[9px] font-extrabold bg-sky-500/20 text-sky-300 rounded border border-sky-500/30">LIVE</span>
        </button>
        <button
          onClick={() => handleItemClick({ id: 'settings', label: 'Settings', icon: Settings })}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-all duration-150 w-full cursor-pointer"
        >
          <Settings size={16} className="text-slate-400" />
          <span>Settings</span>
        </button>
        <button
          onClick={() => {
            window.location.href = '/hackathon/login';
          }}
          className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-all duration-150 w-full cursor-pointer"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

interface NavGroupProps {
  item: NavItem;
  isExpanded: boolean;
  isActive: boolean;
  activeId: string;
  onToggle: () => void;
  onItemClick: (item: NavItem) => void;
}

const NavGroup: React.FC<NavGroupProps> = ({ item, isExpanded, isActive, activeId, onToggle, onItemClick }) => {
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;
  const hasActiveChild = item.children?.some(c => c.id === activeId);

  const isCurrentActive = hasActiveChild || isActive;

  return (
    <div>
      <button
        onClick={() => onItemClick(item)}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 cursor-pointer select-none
          ${isCurrentActive
            ? 'bg-gradient-to-r from-primary-600/90 to-primary-700/80 text-white shadow-md shadow-primary-900/30'
            : 'text-slate-300 hover:text-white hover:bg-slate-800/70'}`}
      >
        <Icon size={17} className={`shrink-0 ${isCurrentActive ? 'text-white' : 'text-slate-400'}`} />
        <span className="flex-1 text-left truncate">{item.label}</span>
        {item.badge && (
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold shadow-xs
            ${item.badgeType === 'danger' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
              item.badgeType === 'warning' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
              'bg-sky-500/20 text-sky-300 border border-sky-500/40'}`}>
            {item.badge}
          </span>
        )}
        {hasChildren && (
          <motion.div animate={{ rotate: isExpanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
            <ChevronRight size={14} className="text-slate-400" />
          </motion.div>
        )}
      </button>

      <AnimatePresence>
        {hasChildren && isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="ml-4 pl-3 border-l border-slate-800 mt-1 space-y-1">
              {item.children!.map(child => {
                const ChildIcon = child.icon;
                const isChildActive = child.id === activeId;
                return (
                  <button
                    key={child.id}
                    onClick={() => onItemClick(child)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150
                      ${isChildActive
                        ? 'bg-primary-500/20 text-primary-300 border border-primary-500/40 shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}`}
                  >
                    <ChildIcon size={15} className="shrink-0" />
                    <span className="flex-1 text-left truncate">{child.label}</span>
                    {child.badge && (
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
                        ${child.badgeType === 'danger' ? 'bg-rose-500/20 text-rose-300' :
                          child.badgeType === 'warning' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-sky-500/20 text-sky-300'}`}>
                        {child.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
