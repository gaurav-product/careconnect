import type React from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { Loading } from './components/ui';
import Login from './pages/Login';
import Register from './pages/Register';
import JoinPlan from './pages/JoinPlan';
import PlanList from './pages/PlanList';
import CreatePlan from './pages/CreatePlan';
import FamilyDashboard from './pages/FamilyDashboard';
import DayRecordPage from './pages/DayRecord';
import TeamPage from './pages/Team';
import HandoverPage from './pages/Handover';
import PlanEditor from './pages/PlanEditor';
import InsightsPage from './pages/Insights';
import AttendantToday from './pages/AttendantToday';
import NotFound from './pages/NotFound';

function Protected({ children, role }: { children: React.JSX.Element; role?: 'family' | 'attendant' }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <Loading label="Checking your session…" />;
  if (!user) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function Home() {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={user.role === 'attendant' ? '/duty' : '/plans'} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/join" element={<Protected><JoinPlan /></Protected>} />
      <Route path="/plans" element={<Protected role="family"><PlanList /></Protected>} />
      <Route path="/plans/new" element={<Protected role="family"><CreatePlan /></Protected>} />
      <Route path="/p/:planId" element={<Protected><FamilyDashboard /></Protected>} />
      <Route path="/p/:planId/day/:date" element={<Protected><DayRecordPage /></Protected>} />
      <Route path="/p/:planId/team" element={<Protected><TeamPage /></Protected>} />
      <Route path="/p/:planId/handover" element={<Protected><HandoverPage /></Protected>} />
      <Route path="/p/:planId/plan" element={<Protected><PlanEditor /></Protected>} />
      <Route path="/p/:planId/insights" element={<Protected><InsightsPage /></Protected>} />
      <Route path="/duty" element={<Protected><AttendantToday /></Protected>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
