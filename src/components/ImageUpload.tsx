import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useCloudinaryUpload } from '@/hooks/useCloudinaryUpload';
import { Upload, X, Loader2, Link } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
}

export const ImageUpload = ({ value, onChange, label = 'Product Image' }: ImageUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadImage, isUploading, uploadProgress } = useCloudinaryUpload();
  const [preview, setPreview] = useState<string | undefined>(value);
  const [imageUrl, setImageUrl] = useState<string>(value || '');

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    try {
      const imageUrl = await uploadImage(file);
      onChange(imageUrl);
    } catch (error) {
      setPreview(value);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUrlChange = (url: string) => {
    setImageUrl(url);
    setPreview(url);
    onChange(url);
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      <Tabs defaultValue="url" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="url"><Link className="w-4 h-4 mr-1" />URL</TabsTrigger>
          <TabsTrigger value="upload"><Upload className="w-4 h-4 mr-1" />Upload</TabsTrigger>
        </TabsList>
        
        <TabsContent value="url" className="space-y-2">
          <Input
            placeholder="Enter image URL"
            value={imageUrl}
            onChange={(e) => handleUrlChange(e.target.value)}
          />
          {preview && (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="upload" className="space-y-2">
          {preview ? (
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg border"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleRemove}
                disabled={isUploading}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, WEBP up to 5MB
              </p>
            </div>
          )}

          {isUploading && (
            <div className="space-y-2">
              <Progress value={uploadProgress} />
              <p className="text-sm text-center text-muted-foreground flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading... {uploadProgress}%
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
