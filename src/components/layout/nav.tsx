import { NavLink } from 'react-router';
import { LayoutDashboard, FlaskConical, Settings, X } from 'lucide-react';
import { useAtom } from 'jotai';
import { sidebarOpenAtom } from '../../store/ui';
import { cn } from '../../lib/utils';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/studio', label: 'Resume Studio', icon: FlaskConical },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Nav() {
  const [sidebarOpen, setSidebarOpen] = useAtom(sidebarOpenAtom);

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-200 bg-white transition-transform lg:translate-x-0 lg:static lg:z-auto',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 items-center justify-between border-b border-zinc-200 px-4">
          <NavLink to="/" className="flex items-center gap-2 font-semibold text-zinc-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white text-sm font-bold">
              R
            </div>
            Resume Native
          </NavLink>
          <button onClick={() => setSidebarOpen(false)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                )
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
