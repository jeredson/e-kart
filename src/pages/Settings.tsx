import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import ImageCropper from '@/components/ImageCropper';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [cropSrc, setCropSrc] = useState('');
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    loadProfile();
  }, [user, navigate]);

  const loadProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (data) {
      setFirstName(data.first_name || '');
      setLastName(data.last_name || '');
      setPhoneNumber(data.phone_number || '');
      setAvatarUrl(data.avatar_url || '');
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setCropSrc(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (blob: Blob) => {
    setCroppedBlob(blob);
    setAvatarUrl(URL.createObjectURL(blob));
    setCropSrc('');
  };

  const uploadAvatar = async () => {
    if (!croppedBlob || !user) return null;

    const fileName = `${user.id}.jpg`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(fileName, croppedBlob, { upsert: true });

    if (error) {
      console.error('Avatar upload error:', error);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSave = async () => {
    if (!user) return;

    setIsLoading(true);
    let newAvatarUrl = avatarUrl;

    if (croppedBlob) {
      const uploadedUrl = await uploadAvatar();
      if (uploadedUrl) newAvatarUrl = uploadedUrl;
    }

    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        avatar_url: newAvatarUrl,
        updated_at: new Date().toISOString(),
      });

    setIsLoading(false);

    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
      setCroppedBlob(null);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <Button variant="ghost" onClick={() => navigate('/')} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl} />
                <AvatarFallback>{firstName[0]}{lastName[0]}</AvatarFallback>
              </Avatar>
              <label>
                <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                <Button variant="outline" size="sm" asChild>
                  <span className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Change Photo
                  </span>
                </Button>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user?.email || ''} disabled />
            </div>

            <Button onClick={handleSave} disabled={isLoading} className="w-full">
              {isLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Changes'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          onCropComplete={handleCropComplete}
          onCancel={() => setCropSrc('')}
        />
      )}
    </div>
  );
};

export default Settings;
