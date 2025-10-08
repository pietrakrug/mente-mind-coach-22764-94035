import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { LogOut, User as UserIcon, Mail, Calendar, Trash2 } from 'lucide-react';
import brain1 from '@/assets/avatars/brain-1.png';
import brain2 from '@/assets/avatars/brain-2.png';
import brain3 from '@/assets/avatars/brain-3.png';
import brain4 from '@/assets/avatars/brain-4.png';
import brain5 from '@/assets/avatars/brain-5.png';
import brain6 from '@/assets/avatars/brain-6.png';
import brain7 from '@/assets/avatars/brain-7.png';
import brain8 from '@/assets/avatars/brain-8.png';
import brain9 from '@/assets/avatars/brain-9.png';
import brain10 from '@/assets/avatars/brain-10.png';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { habitApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const AVATARS = [
  { id: '1', image: brain1, label: 'Cérebro Feliz' },
  { id: '2', image: brain2, label: 'Cérebro Brincalhão' },
  { id: '3', image: brain3, label: 'Cérebro Animado' },
  { id: '4', image: brain4, label: 'Cérebro Pensativo' },
  { id: '5', image: brain5, label: 'Cérebro Confiante' },
  { id: '6', image: brain6, label: 'Cérebro Cansado' },
  { id: '7', image: brain7, label: 'Cérebro Surpreso' },
  { id: '8', image: brain8, label: 'Cérebro Amoroso' },
  { id: '9', image: brain9, label: 'Cérebro Determinado' },
  { id: '10', image: brain10, label: 'Cérebro Zen' },
];

const Profile = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleAvatarSelect = async (avatarId: string) => {
    await updateProfile({ avatar: avatarId });
    toast({
      title: 'Avatar Updated',
      description: 'Your profile picture has been changed.',
    });
  };

  const handleResetHabit = async () => {
    setIsResetting(true);
    try {
      const activeHabit = await habitApi.getActiveHabit(user.id);
      if (activeHabit) {
        await habitApi.deleteHabit(activeHabit.id);
        toast({
          title: 'Habit Reset',
          description: 'Your habit data has been cleared. Ready for a fresh start!',
        });
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to reset habit. Please try again.',
      });
    } finally {
      setIsResetting(false);
      setShowResetDialog(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in pb-20 md:pb-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
            <UserIcon className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{user.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="font-medium">{format(new Date(user.createdAt), 'MMMM d, yyyy')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Escolha Seu Avatar</CardTitle>
          <CardDescription>Selecione um cérebro que represente você</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-4">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => handleAvatarSelect(avatar.id)}
                className={`relative transition-all group ${
                  user.avatar === avatar.id
                    ? 'ring-4 ring-primary ring-offset-2 ring-offset-background scale-110'
                    : 'hover:scale-105 opacity-70 hover:opacity-100'
                }`}
                title={avatar.label}
              >
                <Avatar className="w-20 h-20">
                  <AvatarImage src={avatar.image} alt={avatar.label} />
                  <AvatarFallback className="bg-gradient-primary">
                    {avatar.id}
                  </AvatarFallback>
                </Avatar>
                {user.avatar === avatar.id && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions that affect your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/20">
            <div>
              <h3 className="font-semibold">Reset Current Habit</h3>
              <p className="text-sm text-muted-foreground">
                This will delete all check-ins and habit data. You can create a new habit afterward.
              </p>
            </div>
            <Button variant="destructive" onClick={() => setShowResetDialog(true)} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button variant="outline" onClick={handleLogout} className="w-full gap-2">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your current habit and all associated check-in data.
              You will be able to create a new habit after this.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetHabit} disabled={isResetting} className="bg-destructive hover:bg-destructive/90">
              {isResetting ? 'Resetting...' : 'Yes, Reset My Habit'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
