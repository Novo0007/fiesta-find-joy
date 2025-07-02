
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Calendar, 
  Flag, 
  ShieldCheck, 
  Eye, 
  CheckCircle, 
  XCircle,
  AlertTriangle 
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: 'user' | 'organizer' | 'admin';
  status: string;
  created_at: string;
}

interface Event {
  id: string;
  title: string;
  organizer_id: string;
  status: string;
  moderation_status: string;
  created_at: string;
  moderated_at: string | null;
}

interface Report {
  id: string;
  report_type: string;
  reason: string;
  status: string;
  created_at: string;
  reporter_id: string;
  reported_user_id: string | null;
  reported_event_id: string | null;
}

const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch users with roles - use left join to get all users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select(`
          id,
          email,
          full_name,
          status,
          created_at,
          user_roles(role)
        `);

      if (usersError) throw usersError;

      // Fetch events pending moderation
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (eventsError) throw eventsError;

      // Fetch reports
      const { data: reportsData, error: reportsError } = await supabase
        .from('user_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      setUsers(usersData?.map((user: any) => ({
        ...user,
        role: (user.user_roles && user.user_roles[0]?.role) || 'user' as 'user' | 'organizer' | 'admin'
      })) || []);
      setEvents(eventsData || []);
      setReports(reportsData || []);
    } catch (error: any) {
      toast({
        title: "Error loading admin data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: 'user' | 'organizer' | 'admin') => {
    try {
      // Delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole,
          assigned_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          action_type: 'role_change',
          target_type: 'user',
          target_id: userId,
          details: { new_role: newRole }
        });

      toast({
        title: "Role updated",
        description: "User role has been successfully updated.",
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error updating role",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const moderateEvent = async (eventId: string, status: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('events')
        .update({
          moderation_status: status,
          moderated_by: (await supabase.auth.getUser()).data.user?.id,
          moderated_at: new Date().toISOString(),
          moderation_notes: notes
        })
        .eq('id', eventId);

      if (error) throw error;

      // Log admin action
      await supabase
        .from('admin_actions')
        .insert({
          admin_id: (await supabase.auth.getUser()).data.user?.id,
          action_type: 'event_moderation',
          target_type: 'event',
          target_id: eventId,
          details: { status, notes }
        });

      toast({
        title: "Event moderated",
        description: `Event has been ${status}.`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error moderating event",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const resolveReport = async (reportId: string, resolution: string) => {
    try {
      const { error } = await supabase
        .from('user_reports')
        .update({
          status: resolution,
          resolved_by: (await supabase.auth.getUser()).data.user?.id,
          resolved_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Report resolved",
        description: `Report has been ${resolution}.`,
      });

      fetchData();
    } catch (error: any) {
      toast({
        title: "Error resolving report",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6" />
            Admin Panel
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="events" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Events ({events.length})
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Reports ({reports.filter(r => r.status === 'pending').length})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{user.full_name || 'Unnamed User'}</p>
                      <p className="text-sm text-gray-600">{user.email}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline" className="capitalize">
                          {user.role}
                        </Badge>
                        <Badge variant={user.status === 'active' ? 'default' : 'destructive'}>
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={user.role}
                        onValueChange={(value) => updateUserRole(user.id, value as 'user' | 'organizer' | 'admin')}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="organizer">Organizer</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Event Moderation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-gray-600">
                        Created: {new Date(event.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{event.status}</Badge>
                        <Badge 
                          variant={
                            event.moderation_status === 'approved' ? 'default' :
                            event.moderation_status === 'rejected' ? 'destructive' : 'secondary'
                          }
                        >
                          {event.moderation_status}
                        </Badge>
                      </div>
                    </div>
                    {event.moderation_status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => moderateEvent(event.id, 'approved')}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => moderateEvent(event.id, 'rejected', 'Event rejected by admin')}
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{report.report_type} Report</p>
                      <p className="text-sm text-gray-600">{report.reason}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Reported: {new Date(report.created_at).toLocaleDateString()}
                      </p>
                      <Badge 
                        variant={
                          report.status === 'resolved' ? 'default' :
                          report.status === 'dismissed' ? 'secondary' : 'destructive'
                        }
                        className="mt-2"
                      >
                        {report.status}
                      </Badge>
                    </div>
                    {report.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => resolveReport(report.id, 'resolved')}
                        >
                          Resolve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveReport(report.id, 'dismissed')}
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{users.length}</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Pending Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {events.filter(e => e.moderation_status === 'pending').length}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Open Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {reports.filter(r => r.status === 'pending').length}
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPanel;
