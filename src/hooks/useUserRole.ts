
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

type UserRole = 'user' | 'organizer' | 'admin';

export const useUserRole = () => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setUserRole(null);
        setLoading(false);
        return;
      }

      console.log('Fetching role for user:', user.id);
      setLoading(true);

      try {
        // First try to get the role from user_roles table
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .order('assigned_at', { ascending: false })
          .limit(1)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // No role found, try to insert default role
            console.log('No role found for user, inserting default user role');
            const { error: insertError } = await supabase
              .from('user_roles')
              .insert({
                user_id: user.id,
                role: 'user'
              });
            
            if (insertError) {
              console.error('Error inserting default role:', insertError);
            }
            
            setUserRole('user');
          } else {
            console.error('Error fetching user role:', error);
            setUserRole('user'); // Default to user role on error
          }
        } else {
          console.log('User role found:', data.role);
          setUserRole(data.role);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('user'); // Default to user role
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user?.id]); // Add dependency on user.id to refetch when user changes

  const canManageEvents = userRole === 'organizer' || userRole === 'admin';
  const isAdmin = userRole === 'admin';

  console.log('useUserRole state:', { userRole, loading, canManageEvents, isAdmin });

  return {
    userRole,
    loading,
    canManageEvents,
    isAdmin
  };
};
