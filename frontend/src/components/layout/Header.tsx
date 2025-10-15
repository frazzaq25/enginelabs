import { Link, NavLink } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/UserAvatar';
import { IconMenu } from '../ui/icons/IconMenu';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3 lg:px-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Toggle navigation"
          onClick={onToggleSidebar}
        >
          <IconMenu className="h-5 w-5" />
        </Button>
        <Link to="/" className="flex items-center gap-2 font-semibold text-neutral-900">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-brand-foreground">
            UI
          </span>
          <span className="hidden text-sm font-semibold tracking-wide text-neutral-800 sm:block">
            Frontend Starter
          </span>
        </Link>
      </div>

      <nav className="hidden items-center gap-6 text-sm font-medium text-neutral-600 lg:flex">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `transition-colors hover:text-neutral-900 ${isActive ? 'text-neutral-900' : ''}`
          }
        >
          Overview
        </NavLink>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `transition-colors hover:text-neutral-900 ${isActive ? 'text-neutral-900' : ''}`
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `transition-colors hover:text-neutral-900 ${isActive ? 'text-neutral-900' : ''}`
          }
        >
          Settings
        </NavLink>
      </nav>

      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm">
          New
        </Button>
        <Avatar initials="AL" name="Ada Lovelace" />
      </div>
    </div>
  );
}
