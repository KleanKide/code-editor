import { Routes, Route } from 'react-router-dom';
import DashboardPage from './components/DashboardPage';
import LoginPage from './components/LoginPage'
import ProjectPage from './components/ProjectPage';
function App() {
  return (
    <>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/projects/:projectId" element={<ProjectPage />} />
    </Routes>
    </>
  )
}

export default App
