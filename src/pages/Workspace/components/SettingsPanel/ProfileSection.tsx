import { Upload, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { showError } from '@/lib/confirm';
import { useProfileSettings } from '../../hooks/useProfileSettings';

const fallbackMbtiOptions = [
  'INTJ',
  'INTP',
  'ENTJ',
  'ENTP',
  'INFJ',
  'INFP',
  'ENFJ',
  'ENFP',
  'ISTJ',
  'ISFJ',
  'ESTJ',
  'ESFJ',
  'ISTP',
  'ISFP',
  'ESTP',
  'ESFP',
].map((mbti) => ({ mbtiId: mbti, mbtiNm: mbti }));

export default function ProfileSection({ active }: { active: boolean }) {
  const alert = ({ title, description }: { title: string; description?: string }) => showError({ title, message: description });
  const { profile, setProfile, mbtiOptions, handleThumbnailChange, saveProfile, isSavingProfile, isLoadingProfile, isLoadingMbti } =
    useProfileSettings({ alert, activeSection: active ? 'profile' : '' }) as any;
  const options = Array.isArray(mbtiOptions) && mbtiOptions.length > 0 ? mbtiOptions : fallbackMbtiOptions;

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-4 text-sm font-medium text-foreground">프로필 이미지</h4>
        <div className="flex items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-border bg-muted">
            {profile.thumbnailPreview ? (
              <img src={profile.thumbnailPreview} alt="프로필" className="h-full w-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          <label className="flex cursor-pointer items-center gap-2 rounded-md bg-muted px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted/80">
            <Upload className="h-4 w-4" />
            이미지 업로드
            <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
          </label>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">닉네임</label>
        <input
          type="text"
          value={profile.nickname}
          onChange={(event) => setProfile((prev: any) => ({ ...prev, nickname: event.target.value }))}
          className="w-full max-w-sm rounded-md border border-border bg-muted px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">MBTI</label>
        <div className="grid max-w-sm grid-cols-4 gap-2">
          {options.map((option: any) => (
            <button
              key={option.mbtiId}
              type="button"
              onClick={() => setProfile((prev: any) => ({ ...prev, mbti: option.mbtiId }))}
              disabled={isLoadingMbti}
              className={cn(
                'rounded-md border py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                profile.mbti === option.mbtiId
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-muted text-foreground hover:border-primary/40'
              )}
            >
              {option.mbtiNm}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={saveProfile}
        disabled={isSavingProfile || isLoadingProfile}
        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSavingProfile ? '저장 중...' : '프로필 저장'}
      </button>
    </div>
  );
}
