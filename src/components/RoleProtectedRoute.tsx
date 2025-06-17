
import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RoleProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'organizer' | 'admin';
  requireManageEvents?: boolean;
}

const RoleProtectedRoute = ({ 
  children, 
  requiredRole, 
  requireManageEvents = false 
}: RoleProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { userRole, loading: roleLoading, canManageEvents, isAdmin } = useUserRole();
  const location = useLocation();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  const hasRequiredAccess = () => {
    if (requireManageEvents) {
      return canManageEvents;
    }
    if (requiredRole === 'admin') {
      return isAdmin;
    }
    if (requiredRole === 'organizer') {
      return canManageEvents;
    }
    return true;
  };

  if (!hasRequiredAccess()) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto shadow-xl border-0 backdrop-blur-sm bg-white/80">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Restricted</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access this page. This feature is only available to {
                requireManageEvents ? 'event organizers and administrators' : 
                requiredRole === 'admin' ? 'administrators' : 'organizers'
              }.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Current role: <span className="font-semibold capitalize">{userRole || 'loading...'}</span>
            </p>
            <div className="space-y-2">
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="w-full"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
              <p className="text-xs text-gray-400">
                If you believe this is an error, try refreshing the page or contact support.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
