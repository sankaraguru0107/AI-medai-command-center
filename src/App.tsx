import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AIAssistantPanel } from './components/ai/AIAssistantPanel';
import { LoginPage } from './pages/LoginPage';
import { DashboardRouter } from './pages/DashboardRouter';
import { ModuleRouter } from './pages/ModuleRouter';
import { useAppStore, generateDemoAlerts, generateDemoUser } from './store/appStore';

const AppLayout: React.FC = () => {
  const { sidebarOpen, aiPanelOpen } = useAppStore();

  return (
    <div className="flex h-screen bg-mesh overflow-hidden">
      {/* Sidebar */}
      <motion.div
        animate={{ x: sidebarOpen ? 0 : -256, width: 256 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="shrink-0 h-full z-20"
      >
        <Sidebar />
      </motion.div>

      {/* Main content */}
      <motion.div
        animate={{ marginRight: aiPanelOpen ? 384 : 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="flex-1 flex flex-col min-w-0 overflow-hidden"
      >
        <Header />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Routes>
            <Route path="/" element={<DashboardRouter />} />
            <Route path="/module/:moduleId" element={<ModuleRouter />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </motion.div>

      {/* AI Panel */}
      <AIAssistantPanel />
    </div>
  );
};

import { EmergencyPassportPage } from './pages/EmergencyPassportPage';
import { HackathonLoginPage } from './pages/hackathon/HackathonLoginPage';
import { HackathonLayout } from './components/hackathon/HackathonLayout';
import { HackathonDashboardPage } from './pages/hackathon/HackathonDashboardPage';
import { NetworkView } from './pages/hackathon/subpages/NetworkView';
import { BedsView } from './pages/hackathon/subpages/BedsView';
import { MedicinesView } from './pages/hackathon/subpages/MedicinesView';
import { StaffView } from './pages/hackathon/subpages/StaffView';
import { ForecastView } from './pages/hackathon/subpages/ForecastView';
import { SupplyChainView } from './pages/hackathon/subpages/SupplyChainView';
import { RedistributionView } from './pages/hackathon/subpages/RedistributionView';
import { AlertsView } from './pages/hackathon/subpages/AlertsView';
import { AssistantView } from './pages/hackathon/subpages/AssistantView';
import { EmergencyView } from './pages/hackathon/subpages/EmergencyView';
import { AnalyticsView } from './pages/hackathon/subpages/AnalyticsView';

export const App: React.FC = () => {
  const { isAuthenticated, setUser, setAlerts, addNotification } = useAppStore();

  // Seed demo data when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setAlerts(generateDemoAlerts());

      const t1 = setTimeout(() => {
        addNotification({
          id: 'n1',
          type: 'alert',
          title: 'Critical vitals — James Wilson',
          body: 'SpO2 dropped to 87%. Immediate attention needed.',
          timestamp: new Date(),
          read: false,
        });
      }, 2000);

      const t2 = setTimeout(() => {
        addNotification({
          id: 'n2',
          type: 'ai',
          title: 'AI Risk Scan Complete',
          body: '3 patients flagged as high-risk for readmission.',
          timestamp: new Date(),
          read: false,
        });
      }, 5000);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isAuthenticated]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/hackathon/login" element={<HackathonLoginPage />} />
        <Route path="/hackathon" element={<HackathonLayout />}>
          <Route path="dashboard" element={<HackathonDashboardPage />} />
          <Route path="network" element={<NetworkView />} />
          <Route path="beds" element={<BedsView />} />
          <Route path="medicines" element={<MedicinesView />} />
          <Route path="staff" element={<StaffView />} />
          <Route path="forecast" element={<ForecastView />} />
          <Route path="supply-chain" element={<SupplyChainView />} />
          <Route path="redistribution" element={<RedistributionView />} />
          <Route path="alerts" element={<AlertsView />} />
          <Route path="assistant" element={<AssistantView />} />
          <Route path="emergency" element={<EmergencyView />} />
          <Route path="analytics" element={<AnalyticsView />} />
          <Route path="" element={<Navigate to="/hackathon/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/hackathon/dashboard" replace />} />
        </Route>
        <Route path="/emergency-passport" element={<EmergencyPassportPage />} />
        <Route path="/passport" element={<EmergencyPassportPage />} />
        <Route path="/" element={<Navigate to="/hackathon/login" replace />} />
        <Route path="/login" element={<Navigate to="/hackathon/login" replace />} />
        <Route
          path="/*"
          element={
            <AnimatePresence mode="wait">
              {!isAuthenticated ? (
                <Navigate to="/hackathon/login" replace />
              ) : (
                <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-screen">
                  <AppLayout />
                </motion.div>
              )}
            </AnimatePresence>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

