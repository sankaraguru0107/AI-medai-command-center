import React from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

export const ModuleRouter: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const { setActiveModule } = useAppStore();
  
  React.useEffect(() => {
    if (moduleId) setActiveModule(moduleId);
  }, [moduleId]);

  return null; // DashboardRouter handles the rendering
};
