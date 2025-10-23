import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { LogOut, User as UserIcon, Mail, Calendar, Trash2, Phone, CreditCard, Edit2, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
  const { user, logout, updateProfile, refreshUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [habitCount, setHabitCount] = useState(0);
  
  const [editForm, setEditForm] = useState({
    full_name: '',
    whatsapp: '',
    birth_date: '',
    cpf: '',
  });

  useEffect(() => {
    if (user?.profile) {
      setEditForm({
        full_name: user.profile.full_name || '',
        whatsapp: user.profile.whatsapp || '',
        birth_date: user.profile.birth_date || '',
        cpf: user.profile.cpf || '',
      });
    }
    loadHabitCount();
  }, [user]);

  const loadHabitCount = async () => {
    if (!user) return;
    
    const { data: habits } = await supabase
      .from('habits')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true);
    
    setHabitCount(habits?.length || 0);
  };

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const handleAvatarSelect = async (avatarId: string) => {
    try {
      await updateProfile({ avatar: avatarId });
      toast({
        title: 'Avatar Atualizado',
        description: 'Sua foto de perfil foi alterada.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao atualizar avatar.',
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      await updateProfile(editForm);
      setIsEditing(false);
      toast({
        title: 'Perfil Atualizado',
        description: 'Suas informações foram salvas com sucesso.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao atualizar perfil.',
      });
    }
  };

  const handleCancelEdit = () => {
    if (user?.profile) {
      setEditForm({
        full_name: user.profile.full_name || '',
        whatsapp: user.profile.whatsapp || '',
        birth_date: user.profile.birth_date || '',
        cpf: user.profile.cpf || '',
      });
    }
    setIsEditing(false);
  };

  const handleResetHabit = async () => {
    setIsResetting(true);
    try {
      const { data: activeHabits } = await supabase
        .from('habits')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (activeHabits && activeHabits.length > 0) {
        for (const habit of activeHabits) {
          await supabase
            .from('habits')
            .delete()
            .eq('id', habit.id);
        }
        
        toast({
          title: 'Hábitos Resetados',
          description: 'Seus dados de hábitos foram limpos. Pronto para um novo começo!',
        });
        await loadHabitCount();
        navigate('/dashboard');
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Falha ao resetar hábitos. Tente novamente.',
      });
    } finally {
      setIsResetting(false);
      setShowResetDialog(false);
    }
  };

  const profile = user.profile;
  const selectedAvatar = AVATARS.find(a => a.id === profile?.avatar) || AVATARS[0];

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in pb-20 md:pb-6">
      <div>
        <h1 className="text-3xl font-bold">Perfil</h1>
        <p className="text-muted-foreground mt-1">Gerencie sua conta e preferências</p>
      </div>

      {habitCount >= 3 && (
        <Card className="border-warning bg-warning/10">
          <CardContent className="pt-6">
            <p className="text-sm font-medium">
              ⚠️ Você atingiu o limite de 3 hábitos consecutivos. Complete ou resete um hábito existente para criar um novo.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Seus dados cadastrais</CardDescription>
            </div>
            {!isEditing ? (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} className="gap-2">
                <Edit2 className="h-4 w-4" />
                Editar
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancelEdit} className="gap-2">
                  <X className="h-4 w-4" />
                  Cancelar
                </Button>
                <Button size="sm" onClick={handleSaveProfile} className="gap-2">
                  <Save className="h-4 w-4" />
                  Salvar
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="full_name">Nome Completo</Label>
                <Input
                  id="full_name"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  value={editForm.whatsapp}
                  onChange={(e) => setEditForm({ ...editForm, whatsapp: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birth_date">Data de Nascimento</Label>
                <Input
                  id="birth_date"
                  type="date"
                  value={editForm.birth_date}
                  onChange={(e) => setEditForm({ ...editForm, birth_date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={editForm.cpf}
                  onChange={(e) => setEditForm({ ...editForm, cpf: e.target.value })}
                  maxLength={14}
                />
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{profile?.full_name || 'Não informado'}</p>
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
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <p className="font-medium">{profile?.whatsapp || 'Não informado'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Data de Nascimento</p>
                  <p className="font-medium">
                    {profile?.birth_date ? format(new Date(profile.birth_date), 'dd/MM/yyyy') : 'Não informado'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">CPF</p>
                  <p className="font-medium">{profile?.cpf || 'Não informado'}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Membro Desde</p>
                  <p className="font-medium">
                    {profile?.created_at ? format(new Date(profile.created_at), 'dd/MM/yyyy') : 'Não disponível'}
                  </p>
                </div>
              </div>
            </>
          )}
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
                  profile?.avatar === avatar.id
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
                {profile?.avatar === avatar.id && (
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
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
          <CardDescription>Ações irreversíveis que afetam seus dados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-destructive/5 rounded-lg border border-destructive/20">
            <div>
              <h3 className="font-semibold">Resetar Hábitos Atuais ({habitCount}/3)</h3>
              <p className="text-sm text-muted-foreground">
                Isso vai deletar todos os check-ins e dados de hábitos. Você pode criar novos hábitos depois.
              </p>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setShowResetDialog(true)} 
              className="gap-2"
              disabled={habitCount === 0}
            >
              <Trash2 className="h-4 w-4" />
              Resetar
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button variant="outline" onClick={handleLogout} className="w-full gap-2">
            <LogOut className="h-4 w-4" />
            Sair
          </Button>
        </CardContent>
      </Card>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza absoluta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso vai deletar permanentemente seus {habitCount} hábito(s) ativo(s) e todos os dados de check-in associados.
              Você poderá criar novos hábitos depois.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetHabit} disabled={isResetting} className="bg-destructive hover:bg-destructive/90">
              {isResetting ? 'Resetando...' : 'Sim, Resetar Meus Hábitos'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Profile;
