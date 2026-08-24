import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Brain, ChevronDown, LogOut, Menu, Search, Settings, User, X
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { formatDistanceToNow } from 'date-fns';

export const Header: React.FC = () => {
  const {
    user, setSidebarOpen, sidebarOpen,
    notifications, unreadNotificationCount,
    markAllNotificationsRead, markNotificationRead,
    aiPanelOpen, setAIPanelOpen,
    alerts, unreadAlertCount,
    setUser
  } = useAppStore();

  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 flex items-center px-5 gap-4 sticky top-0 z-30 shadow-xs">
      {/* Menu toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors lg:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="flex-1 max-w-md relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder="Search patients, alerts, records..."
          className="w-full pl-10 pr-4 py-2 bg-slate-100/70 border border-slate-200/80 rounded-xl text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 focus:bg-white transition-all shadow-inner"
        />
      </div>

      <div className="flex items-center gap-3 ml-auto">
        {/* Live indicator */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-semibold text-emerald-700">
          <span className="dot-live" />
          Live
        </div>

        {/* AI Assistant toggle */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setAIPanelOpen(!aiPanelOpen)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm
            ${aiPanelOpen
              ? 'bg-gradient-to-r from-primary-600 to-accent-teal text-white shadow-glow-primary'
              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-primary-400'}`}
        >
          <Brain size={16} className={aiPanelOpen ? 'animate-pulse' : 'text-primary-600'} />
          <span className="hidden sm:block">AI Assistant</span>
        </motion.button>

        {/* Alerts button */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen(!notifOpen); setUserMenuOpen(false); }}
            className="relative p-2.5 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors"
          >
            <Bell size={19} />
            {unreadAlertCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[18px] h-4.5 bg-rose-500 text-white text-[11px] font-extrabold rounded-full flex items-center justify-center px-1 shadow-sm">
                {unreadAlertCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-88 glass-card shadow-glass-lg z-50 overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="font-bold text-slate-900 text-sm">Active Alerts</div>
                  <div className="flex items-center gap-2">
                    <span className="badge-danger">{unreadAlertCount} active</span>
                    <button onClick={() => setNotifOpen(false)} className="p-1 hover:bg-slate-200/60 rounded-lg">
                      <X size={15} className="text-slate-400" />
                    </button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto scrollbar-thin">
                  {alerts.filter(a => !a.resolved).slice(0, 8).map(alert => (
                    <div key={alert.id} className="p-3.5 border-b border-slate-100/60 hover:bg-slate-50/80 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 shadow-xs
                          ${alert.type === 'critical' ? 'bg-rose-500 shadow-rose-500/50' :
                            alert.type === 'warning' ? 'bg-amber-500 shadow-amber-500/50' :
                            alert.type === 'success' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-sky-500'}`}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-slate-800 truncate">{alert.title}</div>
                          <div className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-relaxed">{alert.message}</div>
                          <div className="text-[11px] text-slate-400 mt-1 font-medium">
                            {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {alerts.filter(a => !a.resolved).length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-sm font-medium">No active alerts</div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => { setUserMenuOpen(!userMenuOpen); setNotifOpen(false); }}
            className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-accent-teal flex items-center justify-center text-white text-xs font-extrabold shadow-md shadow-primary-500/20">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-bold text-slate-800 leading-tight">{user?.name?.split(' ')[0] || 'Admin'}</div>
              <div className="text-[11px] text-slate-500 capitalize leading-tight font-medium">{user?.role}</div>
            </div>
            <ChevronDown size={14} className="text-slate-400" />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-56 glass-card shadow-glass-lg z-50 py-1.5 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
                  <div className="text-sm font-bold text-slate-900">{user?.name}</div>
                  <div className="text-xs text-slate-500 truncate">{user?.email}</div>
                  <div className="mt-2">
                    <span className="badge-info capitalize">{user?.role}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    useAppStore.getState().setActiveModule('medical-profile');
                    useAppStore.getState().setActiveDashboard('medical-profile');
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <User size={15} className="text-slate-400" /> Profile
                </button>
                <button
                  onClick={() => {
                    useAppStore.getState().setActiveModule('settings');
                    useAppStore.getState().setActiveDashboard('settings');
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings size={15} className="text-slate-400" /> Settings
                </button>
                <div className="border-t border-slate-100 my-1" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut size={15} /> Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
