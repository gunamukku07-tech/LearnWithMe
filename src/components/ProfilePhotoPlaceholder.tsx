import React, { useRef } from 'react';
import { Camera, RotateCcw, User } from 'lucide-react';
import { useData } from '../context/DataContext';

interface ProfilePhotoPlaceholderProps {
  size?: 'sm' | 'md' | 'lg';
  editable?: boolean;
  className?: string;
}

export const ProfilePhotoPlaceholder: React.FC<ProfilePhotoPlaceholderProps> = ({
  size = 'md',
  editable = false,
  className = '',
}) => {
  const { profile, saveProfile, isAdmin } = useData();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const canEdit = Boolean(editable && isAdmin);

  const initials =
    (profile.name || 'Guna Sekhar')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'GS';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (result) {
        saveProfile({
          ...profile,
          avatarUrl: result,
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClearPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveProfile({
      ...profile,
      avatarUrl: '',
    });
  };

  const sizeClasses = {
    sm: 'w-11 h-11 text-sm',
    md: 'w-20 h-20 sm:w-24 sm:h-24 text-2xl',
    lg: 'w-28 h-28 sm:w-32 sm:h-32 text-3xl sm:text-4xl',
  };

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <div
        onClick={() => {
          if (canEdit) fileInputRef.current?.click();
        }}
        role={canEdit ? 'button' : undefined}
        tabIndex={canEdit ? 0 : undefined}
        onKeyDown={(e) => {
          if (canEdit && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        aria-label={canEdit ? `Upload or change profile photo for ${profile.name}` : profile.name}
        className={`group relative ${sizeClasses[size]} rounded-full bg-gradient-to-br from-[#FFF8EF] via-[#F9EFE8] to-[#F7DDE1] border-2 border-[#D9A5A5] shadow-[0_8px_24px_-8px_rgba(89,68,56,0.14)] flex items-center justify-center overflow-hidden shrink-0 ${
          canEdit ? 'cursor-pointer hover:border-[#594438] transition-all duration-300' : ''
        }`}
      >
        {profile.avatarUrl ? (
          <img
            src={profile.avatarUrl}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-[#594438] select-none">
            <span className="font-display font-semibold tracking-tight leading-none">
              {initials}
            </span>
            {size === 'lg' && (
              <span className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-[#887467]">
                <User className="w-2.5 h-2.5 text-[#D9A5A5]" />
                { profile.name || 'Guna Sekhar' }
              </span>
            )}
          </div>
        )}

        {canEdit && (
          <div className="absolute inset-0 bg-[#594438]/65 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-[#FFF8EF] p-2 text-center">
            <Camera className="w-4 h-4 mb-0.5 text-[#F7DDE1]" />
            {size !== 'sm' && (
              <span className="text-[9px] font-medium leading-tight">
                {profile.avatarUrl ? 'Change Photo' : 'Add Photo'}
              </span>
            )}
          </div>
        )}
      </div>

      {canEdit && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {size !== 'sm' && (
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1 text-[11px] font-medium text-[#594438] hover:text-[#b57373] transition-colors cursor-pointer"
              >
                <Camera className="w-3 h-3 text-[#D9A5A5]" />
                <span>{profile.avatarUrl ? 'Update Photo' : 'Upload Profile Photo'}</span>
              </button>
              {profile.avatarUrl && (
                <button
                  type="button"
                  onClick={handleClearPhoto}
                  title="Reset to monogram placeholder"
                  className="inline-flex items-center gap-0.5 text-[11px] text-[#887467] hover:text-[#594438] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-2.5 h-2.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
