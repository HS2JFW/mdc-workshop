import { MoralCenterDashboard } from './components/MoralCenterDashboard';
import { logoutSystem } from './components/moral-center/utils/adminAuthService';

function App() {
  const handleLogout = () => {
    logoutSystem();
  };

  return <MoralCenterDashboard onLogout={handleLogout} />;
}

export default App;
