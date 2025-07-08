import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Calendar, 
  Newspaper, 
  Ticket, 
  User, 
  Plus, 
  QrCode, 
  Shield 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';

const BottomNav: React.FC = () => {
  const { user } = useAuth();
  const { canManageEvents, isAdmin } = useUserRole();
  const location = useLocation();

  // Don't show bottom nav if user is not authenticated
  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Home',
      show: true,
    },
    {
      path: '/browse',
      icon: Calendar,
      label: 'Browse',
      show: true,
    },
    {
      path: '/hackernews',
      icon: Newspaper,
      label: 'News',
      show: true,
    },
    {
      path: '/my-bookings',
      icon: Ticket,
      label: 'Bookings',
      show: true,
    },
    {
      path: '/profile',
      icon: User,
      label: 'Profile',
      show: true,
    },
  ];

  // Add organizer/admin specific items
  const adminItems = [
    {
      path: '/create-event',
      icon: Plus,
      label: 'Create',
      show: canManageEvents,
    },
    {
      path: '/validate-ticket',
      icon: QrCode,
      label: 'Validate',
      show: canManageEvents,
    },
    {
      path: '/admin',
      icon: Shield,
      label: 'Admin',
      show: isAdmin,
    },
  ];

  // Filter items based on user role and screen space
  const visibleItems = [...navItems, ...adminItems.filter(item => item.show)];

  // Limit to 5 items on mobile for better UX
  const displayItems = visibleItems.slice(0, 5);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-40 md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {displayItems.map(({ path, icon: Icon, label }) => (
          <Link
            key={path}
            to={path}
            className={cn(
              "flex flex-col items-center justify-center min-w-0 flex-1 py-2 px-1 rounded-lg transition-all duration-200",
              isActive(path)
                ? "text-primary bg-primary/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium truncate w-full text-center">
              {label}
            </span>
          </Link>
        ))}
      </div>
      
      {/* Safe area padding for devices with home indicator */}
      <div className="h-safe-area-inset-bottom" />
    </nav>
  );
};

export default BottomNav;