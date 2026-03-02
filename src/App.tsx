import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { AppShell } from './components/layout/app-shell';
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
          <Route index element={<Studio />} />
          <Route path="studio" element={<Navigate to="/" replace />} />
          <Route path="profiles/:id" element={<ProfileEditor />} />
          <Route path="profiles/:id/scenarios" element={<Scenarios />} />
          <Route path="profiles/:id/scenarios/:scenarioId" element={<ScenarioEditor />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
