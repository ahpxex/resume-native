import { useState } from 'react';
import { NavLink } from 'react-router';
import { LayoutDashboard, FlaskConical, Settings, Menu, X } from 'lucide-react';
import { cn } from '../../lib/utils';

const links = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/studio', label: 'Studio', icon: FlaskConical },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-50 flex h-10 shrink-0 items-center border-b border-border bg-surface px-4">
      {/* Left -- app name */}
      <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-text-muted select-none">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
        <span className="text-text">resume.native</span>
      </div>

      {/* Center -- desktop navigation links */}
      <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] uppercase tracking-wider transition-colors',
                isActive
                  ? 'bg-accent-muted text-accent'
                  : 'text-text-muted hover:text-text'
              )
            }
          >
            <Icon className="h-3 w-3" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Right -- version indicator (desktop) + menu button (mobile) */}
      <div className="ml-auto flex items-center gap-3">
        <span className="hidden md:inline font-mono text-[10px] uppercase tracking-wider text-text-dim select-none">
          v0.1
        </span>
        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="rounded p-1 text-text-muted transition-colors hover:text-text md:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setMenuOpen(false)}
          />
          <div className="absolute left-0 right-0 top-full z-50 border-b border-border bg-surface p-2 md:hidden">
            <nav className="flex flex-col gap-0.5">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded px-3 py-2 font-mono text-[11px] uppercase tracking-wider transition-colors',
                      isActive
                        ? 'bg-accent-muted text-accent'
                        : 'text-text-muted hover:text-text'
                    )
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-2 border-t border-border pt-2 text-center">
              <span className="font-mono text-[10px] uppercase tracking-wider text-text-dim">
                v0.1
              </span>
            </div>
          </div>
        </>
      )}
    </header>
  );
}
