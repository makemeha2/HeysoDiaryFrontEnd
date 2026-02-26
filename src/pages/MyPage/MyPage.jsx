import React, { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authFetch } from '@lib/apiClient.js';
import { formatThumbnailPreviewDataUrl } from '@lib/imageFormatters.js';

import SectionCard from '@pages/MyPage/components/SectionCard';
import TextField from '@pages/MyPage/components/TextField';
import MbtiCardPicker from '@pages/MyPage/components/MbtiCardPicker';

import { useAlertDialog } from '@components/useAlertDialog.jsx';

const MyPage = () => {
  const MAX_THUMBNAIL_BYTES = 500 * 1024; // 500KB

  const queryClient = useQueryClient();
  const { alert, Alert } = useAlertDialog();

  // Section 영역
  const sections = [
    { id: 'profile', label: '프로필' },
    { id: 'diary', label: '일기 설정' },
    { id: 'security', label: '보안 & 데이터' },
    { id: 'stats', label: '통계' },
    { id: 'account', label: '계정 관리' },
  ];

  const [activeSection, setActiveSection] = useState('profile');

  // 프로필 객체
  const [profile, setProfile] = useState({
    userId: null,
    nickname: '',
    mbti: '',
    hasThumbnail: false,
    thumbnailUrl: '',
    thumbnailFile: null,
    thumbnailPreview: '',
  });

  // MBTI 가져오기
  const mbtiOptionsQuery = useQuery({
    queryKey: ['mbtiOptions'],
    staleTime: 0,
    queryFn: async ({ signal }) => {
      const res = await authFetch(`/api/comCd/groups/mbti/codes`, {
        method: 'GET',
        signal,
      });
      if (!res.ok) throw new Error('Failed to load mbti options');
      console.log('res', res);

      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const mbtiOptions = useMemo(() => {
    if (!Array.isArray(mbtiOptionsQuery.data)) return [];

    return mbtiOptionsQuery.data
      .map((option) => {
        if (!option.codeId) return null;
        return { mbtiId: option.codeId, mbtiNm: option.codeName, description: option.extraInfo1 };
      })
      .filter(Boolean);
  }, [mbtiOptionsQuery.data]);

  const profileQuery = useQuery({
    queryKey: ['myProfile'],
    staleTime: 0,
    queryFn: async ({ signal }) => {
      const res = await authFetch('/api/mypage/profile', {
        method: 'GET',
        signal,
      });

      if (!res.ok) throw new Error('Failed to load profile');
      return res.data ?? {};
    },
  });

  const thumbnailQuery = useQuery({
    queryKey: ['myThumbnail', profileQuery.data?.userId ?? 'me'],
    enabled: Boolean(profileQuery.data?.hasThumbnail),
    staleTime: 0,
    queryFn: async ({ signal }) => {
      const res = await authFetch('/api/mypage/thumbnail', {
        method: 'GET',
        signal,
        responseType: 'arraybuffer',
      });

      if (!res.ok) throw new Error('Failed to load thumbnail');

      const contentType = res.headers?.['content-type'] || 'image/jpeg';
      return formatThumbnailPreviewDataUrl(res.data, contentType);
    },
  });

  useEffect(() => {
    if (!profileQuery.data) return;

    setProfile((prev) => ({
      ...prev,
      userId: profileQuery.data.userId ?? null,
      nickname: profileQuery.data.nickname ?? '',
      mbti: profileQuery.data.mbti ?? '',
      hasThumbnail: Boolean(profileQuery.data.hasThumbnail),
      thumbnailUrl: profileQuery.data.thumbnailUrl ?? '',
      thumbnailPreview: prev.thumbnailPreview && prev.thumbnailFile ? prev.thumbnailPreview : '',
    }));
  }, [profileQuery.data]);

  useEffect(() => {
    if (!thumbnailQuery.data) return;

    setProfile((prev) => {
      if (prev.thumbnailFile) return prev;
      return { ...prev, thumbnailPreview: thumbnailQuery.data };
    });
  }, [thumbnailQuery.data]);

  const currentSectionLabel = useMemo(
    () => sections.find((section) => section.id === activeSection)?.label,
    [activeSection],
  );

  const saveProfileMutation = useMutation({
    mutationFn: async (data) => {
      const formData = new FormData();
      formData.append('nickname', data.nickname ?? '');
      formData.append('mbti', data.mbti ?? '');

      if (data.thumbnailFile instanceof File) {
        formData.append('thumbnail', data.thumbnailFile);
      }

      const res = await authFetch('/api/mypage/profile', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Failed to save profile: ${res.status}`);
      }

      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      await queryClient.invalidateQueries({ queryKey: ['myThumbnail'] });
      await alert({
        title: '알림',
        description: '수정되었습니다.',
        actionLabel: '확인',
      });
      await profileQuery.refetch();
    },
    onError: async (error) => {
      await alert({
        title: '오류',
        description: '오류가 발생했습니다. 관리자에게 문의하세요.',
        actionLabel: '확인',
      });
      console.error('Failed to save profile', error);
    },
  });

  const handleSaveAll = () => {
    if (saveProfileMutation.isPending) return;
    saveProfileMutation.mutate(profile);
  };

  const handleThumbnailChange = async (event) => {
    const [file] = event.target.files || [];
    if (!file) return;

    // ✅ 용량 체크 (선택 시점)
    if (file.size > MAX_THUMBNAIL_BYTES) {
      await alert({
        title: '이미지 용량 초과',
        description: `프로필 이미지는 500KB 이하만 업로드할 수 있어요. (현재 ${(file.size / 1024).toFixed(1)}KB)`,
        actionLabel: '확인',
      });

      // input 값 초기화(같은 파일 다시 선택 가능하게)
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setProfile((prev) => ({
        ...prev,
        thumbnailFile: file,
        thumbnailPreview: reader.result,
      }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-linen/60 px-4 py-10 text-clay">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-6 lg:flex-row">
          <aside className="w-full max-w-full shrink-0 lg:w-64">
            <div className="rounded-3xl border border-sand/40 bg-white/70 p-6 shadow-soft backdrop-blur">
              <h2 className="text-lg font-semibold text-clay">마이페이지</h2>
              <p className="mt-1 text-sm text-clay/60">원하는 섹션을 선택해 바로 편집하세요.</p>
              <nav className="mt-6 space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40 ${
                      activeSection === section.id
                        ? 'bg-amber text-white shadow'
                        : 'bg-white/60 text-clay/70 hover:bg-amber/10'
                    }`}
                  >
                    {section.label}
                    <span className="text-xs opacity-70">→</span>
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <main className="flex-1">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-amber">
                  마이페이지
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-clay">{currentSectionLabel}</h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveAll}
                  disabled={saveProfileMutation.isPending}
                  className="rounded-full bg-amber px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40"
                >
                  {saveProfileMutation.isPending ? '저장 중...' : '전체 저장'}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {activeSection === 'profile' && (
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
                        {/* <label htmlFor="thumbnail" className="text-sm font-medium text-clay/80">
                          이미지 업로드
                        </label> */}
                        <input
                          id="thumbnail"
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="block w-full text-sm text-clay/70 file:mr-4 file:rounded-full file:border-0 file:bg-amber/20 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-amber hover:file:bg-amber/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40"
                        />
                        {profile.thumbnailFile ? (
                          <p className="text-xs text-clay/60">
                            선택됨: {profile.thumbnailFile.name}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="MBTI 설정"
                    description="당신의 성향에 따라 AI 친구가 다르게 반응합니다."
                  >
                    <MbtiCardPicker
                      value={profile.mbti}
                      options={mbtiOptions}
                      onChange={(value) => setProfile((prev) => ({ ...prev, mbti: value }))}
                    />
                  </SectionCard>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
      <Alert />
    </div>
  );
};

export default MyPage;
