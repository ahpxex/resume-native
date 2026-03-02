import { Outlet } from 'react-router';
import { Nav } from './nav';

export function AppShell() {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-canvas">
      <Nav />
      <main className="flex-1 overflow-y-auto bg-grid">
        <Outlet />
      </main>
    </div>
  );
}
