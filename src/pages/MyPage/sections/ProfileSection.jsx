import SectionCard from '@pages/MyPage/components/SectionCard';
import TextField from '@pages/MyPage/components/TextField';
import MbtiCardPicker from '@pages/MyPage/components/MbtiCardPicker';

const ProfileSection = ({ profile, setProfile, mbtiOptions, onThumbnailChange }) => {
  return (
    <>
      <SectionCard
        title="나의 닉네임 설정"
        description="일기에서 사용할 닉네임을 설정하세요. AI가 이 이름으로 당신과 소통합니다."
      >
        <TextField
          id="nickname"
          value={profile.nickname}
          onChange={(value) => setProfile((prev) => ({ ...prev, nickname: value }))}
          placeholder="예: Heyso"
        />
      </SectionCard>

      <SectionCard title="프로필 이미지" description="크기는 300KB로 제한됩니다.">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="h-24 w-24 overflow-hidden rounded-2xl border border-sand/40 bg-white/70">
            {profile.thumbnailPreview ? (
              <img
                src={profile.thumbnailPreview}
                alt="프로필 미리보기"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-clay/50">
                미리보기 없음
              </div>
            )}
          </div>
          <div className="space-y-2">
            <input
              id="thumbnail"
              type="file"
              accept="image/*"
              onChange={onThumbnailChange}
              className="block w-full text-sm text-clay/70 file:mr-4 file:rounded-full file:border-0 file:bg-amber/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-amber hover:file:bg-amber/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40"
            />
            {profile.thumbnailFile ? (
              <p className="text-xs text-clay/60">선택됨: {profile.thumbnailFile.name}</p>
            ) : null}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="MBTI 설정" description="당신의 성향에 따라 AI 친구가 다르게 반응합니다.">
        <MbtiCardPicker
          value={profile.mbti}
          options={mbtiOptions}
          onChange={(value) => setProfile((prev) => ({ ...prev, mbti: value }))}
        />
      </SectionCard>
    </>
  );
};

export default ProfileSection;
