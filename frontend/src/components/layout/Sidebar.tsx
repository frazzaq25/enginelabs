import { NavLink } from 'react-router-dom';
import { IconDashboard } from '../ui/icons/IconDashboard';
import { IconSettings } from '../ui/icons/IconSettings';
import { IconSparkles } from '../ui/icons/IconSparkles';

const navItems = [
  { to: '/', label: 'Overview', icon: IconSparkles },
  { to: '/dashboard', label: 'Dashboard', icon: IconDashboard },
  { to: '/settings', label: 'Settings', icon: IconSettings }
];

export function Sidebar() {
  return (
    <nav className="space-y-2 p-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand/10 text-brand-dark'
                  : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
              }`
            }
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
