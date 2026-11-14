import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import SkillAnalysis from './pages/SkillAnalysis';
import CareerMatch from './pages/CareerMatch';
import LearningPath from './pages/LearningPath';
import Assessments from './pages/Assessments';
import Progress from './pages/Progress';
import Resume from './pages/Resume';
import AgentActivity from './pages/AgentActivity';
import SkillPassport from './pages/SkillPassport';
import Simulator from './pages/Simulator';
import Insights from './pages/Insights';
import CohortAnalytics from './pages/CohortAnalytics';
import WeeklyPlanner from './pages/WeeklyPlanner';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      {/* Public Landing & Auth Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/passport/:id" element={<SkillPassport />} />

      {/* Authenticated Application Layout Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/skill-analysis" element={<SkillAnalysis />} />
          <Route path="/career-match" element={<CareerMatch />} />
          <Route path="/learning-path" element={<LearningPath />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/resume" element={<Resume />} />
          <Route path="/agent-activity" element={<AgentActivity />} />
          <Route path="/skill-passport" element={<SkillPassport />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/cohort-analytics" element={<CohortAnalytics />} />
          <Route path="/weekly-planner" element={<WeeklyPlanner />} />
          <Route path="/ai-mentor" element={<Navigate to="/dashboard" replace />} />
          <Route path="/about" element={<Navigate to="/agent-activity" replace />} />
        </Route>
      </Route>

      {/* 404 Catch-All */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
