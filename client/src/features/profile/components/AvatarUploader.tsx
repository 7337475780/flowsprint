import { useState, useRef } from 'react';
import { Camera, Loader2, User } from 'lucide-react';
import { uploadFiles } from '../../files/api/fileApi.js';
import { useUpdateProfileMutation } from '../hooks/useProfile.js';
import { useAuthStore } from '../../../store/authStore.js';
import { toast } from 'sonner';
import { cn } from '../../../lib/utils.js';

interface AvatarUploaderProps {
  className?: string;
}

export default function AvatarUploader({ className }: AvatarUploaderProps) {
  const user = useAuthStore((s) => s.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const updateMutation = useUpdateProfileMutation();
  const [isUploading, setIsUploading] = useState(false);

  const handleAvatarClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // File validations (under 5MB and image type only)
      if (!file.type.startsWith('image/')) {
        toast.error('Only image assets are supported for avatar uploads.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Avatar image cannot exceed 5MB in size.');
        return;
      }

      setIsUploading(true);
      try {
        // 1. Upload to files API
        const uploadedFiles = await uploadFiles([file], {});
        
        if (uploadedFiles && uploadedFiles.length > 0) {
          const fileUrl = uploadedFiles[0].fileUrl;
          
          // 2. Update user profile details
          await updateMutation.mutateAsync({ avatar: fileUrl });
          toast.success('Avatar image updated successfully!');
        }
      } catch (err) {
        toast.error('Failed to upload avatar image.');
      } finally {
        setIsUploading(false);
        // Reset target value
        e.target.value = '';
      }
    }
  };

  // Safe avatar URL resolution
  const resolvedAvatar = user?.avatar
    ? user.avatar.startsWith('http')
      ? user.avatar
      : `${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000'}${user.avatar}`
    : null;

  return (
    <div className={cn('flex flex-col items-center justify-center space-y-2.5', className)}>
      <div 
        onClick={handleAvatarClick}
        className={cn(
          'relative h-24 w-24 rounded-full border bg-secondary/15 flex items-center justify-center cursor-pointer overflow-hidden group shadow-md transition-all duration-300',
          'hover:shadow-lg hover:border-primary/45 active:scale-95 hover:brightness-95',
          isUploading && 'pointer-events-none'
        )}
      >
        {/* Hidden input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept="image/*"
        />

        {/* User image or fallback icon */}
        {resolvedAvatar ? (
          <img
            src={resolvedAvatar}
            alt={user?.name || 'Avatar'}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-tr from-primary/10 to-primary/5 text-primary">
            <User className="h-9 w-9 opacity-85" />
          </div>
        )}

        {/* Hover / Upload overlay */}
        <div className={cn(
          'absolute inset-0 bg-black/45 backdrop-blur-3xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-250',
          isUploading && 'opacity-100 bg-black/60'
        )}>
          {isUploading ? (
            <Loader2 className="h-6.5 w-6.5 text-white animate-spin" />
          ) : (
            <Camera className="h-5 w-5 text-white" />
          )}
        </div>
      </div>

      <div className="text-center">
        <h4 className="text-sm font-heading font-extrabold text-foreground">{user?.name}</h4>
        <span className="text-3xs font-mono text-muted-foreground uppercase bg-secondary px-2.5 py-0.5 rounded border inline-block mt-1">
          {user?.role}
        </span>
      </div>
    </div>
  );
}
