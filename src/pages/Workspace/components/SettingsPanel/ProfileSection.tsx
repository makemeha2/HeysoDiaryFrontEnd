import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { showError } from '@/lib/confirm';
import { useProfileSettings } from '../../hooks/useProfileSettings';

export default function ProfileSection({ active }: { active: boolean }) {
  const alert = ({ title, description }: { title: string; description?: string }) => showError({ title, message: description });
  const { profile, setProfile, mbtiOptions, handleThumbnailChange, saveProfile, isSavingProfile, isLoadingProfile } =
    useProfileSettings({ alert, activeSection: active ? 'profile' : '' }) as any;

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label>닉네임</Label>
        <Input value={profile.nickname} onChange={(event) => setProfile((prev: any) => ({ ...prev, nickname: event.target.value }))} />
      </div>
      <div className="grid gap-2">
        <Label>MBTI</Label>
        <select
          className="h-10 rounded-lg border border-input bg-card px-3 text-sm"
          value={profile.mbti}
          onChange={(event) => setProfile((prev: any) => ({ ...prev, mbti: event.target.value }))}
        >
          <option value="">선택 안 함</option>
          {mbtiOptions.map((option: any) => (
            <option key={option.mbtiId} value={option.mbtiId}>
              {option.mbtiNm}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-2">
        <Label>프로필 이미지</Label>
        <input type="file" accept="image/*" onChange={handleThumbnailChange} className="text-sm" />
        {profile.thumbnailPreview ? <img src={profile.thumbnailPreview} alt="" className="h-16 w-16 rounded-full object-cover" /> : null}
      </div>
      <Button onClick={saveProfile} disabled={isSavingProfile || isLoadingProfile}>
        {isSavingProfile ? '저장 중' : '프로필 저장'}
      </Button>
    </div>
  );
}
