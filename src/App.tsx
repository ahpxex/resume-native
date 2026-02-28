import { BrowserRouter, Routes, Route } from 'react-router';
import { AppShell } from './components/layout/app-shell';
import { Dashboard } from './routes/dashboard';
import { ProfileEditor } from './routes/profile-editor';
import { Scenarios } from './routes/scenarios';
import { ScenarioEditor } from './routes/scenario-editor';
import { Studio } from './routes/studio';
import { SettingsPage } from './routes/settings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Dashboard />} />
          <Route path="profiles/:id" element={<ProfileEditor />} />
          <Route path="profiles/:id/scenarios" element={<Scenarios />} />
          <Route path="profiles/:id/scenarios/:scenarioId" element={<ScenarioEditor />} />
          <Route path="studio" element={<Studio />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
