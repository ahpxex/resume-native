import { Outlet } from 'react-router';
import { Menu } from 'lucide-react';
import { useSetAtom } from 'jotai';
import { sidebarOpenAtom } from '../../store/ui';
import { Nav } from './nav';

export function AppShell() {
  const setSidebarOpen = useSetAtom(sidebarOpenAtom);

  return (
    <div className="flex h-screen overflow-hidden">
      <Nav />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 items-center gap-4 border-b border-zinc-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-1.5 text-zinc-600 hover:bg-zinc-100"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold text-zinc-900">Resume Native</span>
        </header>
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
