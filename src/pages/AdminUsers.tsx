import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface UserProfile {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_approved: boolean;
  created_at: string;
}

const AdminUsers = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, is_admin, is_approved, created_at')
      .eq('is_admin', false)
      .order('created_at', { ascending: false });

    if (profiles) {
      const usersWithDetails = await Promise.all(
        profiles.map(async (profile) => {
          const { data: userProfile } = await supabase
            .from('user_profiles')
            .select('first_name, last_name')
            .eq('id', profile.id)
            .single();
          
          const { data: { users } } = await supabase.auth.admin.listUsers();
          const authUser = users?.find(u => u.id === profile.id);
          
          return {
            id: profile.id,
            email: authUser?.email || 'N/A',
            first_name: userProfile?.first_name || '',
            last_name: userProfile?.last_name || '',
            is_approved: profile.is_approved || false,
            created_at: profile.created_at
          };
        })
      );
      setUsers(usersWithDetails as UserProfile[]);
    }
    setLoading(false);
  };

  const toggleApproval = async (userId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_approved: !currentStatus })
      .eq('id', userId);

    if (error) {
      toast.error('Failed to update user status');
    } else {
      toast.success(`User ${!currentStatus ? 'approved' : 'unapproved'}`);
      loadUsers();
    }
  };

  const deleteUser = async () => {
    if (!deleteUserId) return;

    const { error } = await supabase.auth.admin.deleteUser(deleteUserId);

    if (error) {
      toast.error('Failed to delete user');
    } else {
      toast.success('User deleted successfully');
      setDeleteUserId(null);
      loadUsers();
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">User Management</h1>
      
      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">
                    {user.first_name} {user.last_name}
                  </h3>
                  <Badge variant={user.is_approved ? 'default' : 'secondary'}>
                    {user.is_approved ? 'Approved' : 'Pending'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{user.email}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Joined: {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={user.is_approved ? 'outline' : 'default'}
                  onClick={() => toggleApproval(user.id, user.is_approved)}
                >
                  {user.is_approved ? (
                    <><XCircle className="w-4 h-4 mr-1" /> Revoke</>
                  ) : (
                    <><CheckCircle className="w-4 h-4 mr-1" /> Approve</>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setDeleteUserId(user.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteUser}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
