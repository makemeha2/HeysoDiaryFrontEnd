import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { authFetch } from '@lib/apiClient.js';
import { formatThumbnailPreviewDataUrl } from '@lib/imageFormatters.js';

const INITIAL_PROFILE = {
  userId: null,
  nickname: '',
  mbti: '',
  hasThumbnail: false,
  thumbnailUrl: '',
  thumbnailFile: null, // 사용자가 선택한 파일(업로드 대상)
  thumbnailPreview: '', // 화면 미리보기(로컬 or 서버)
};

export const useProfileSection = ({ alert } = {}) => {
  const MAX_THUMBNAIL_BYTES = 500 * 1024; // 500KB
  const queryClient = useQueryClient();

  // ✅ 프로필 편집 상태(폼 상태)
  const [profile, setProfile] = useState(INITIAL_PROFILE);

  // -----------------------------
  // 1) MBTI 옵션 조회
  // -----------------------------
  const mbtiOptionsQuery = useQuery({
    queryKey: ['mbtiOptions'],
    staleTime: 0,
    queryFn: async ({ signal }) => {
      const res = await authFetch('/api/comCd/groups/mbti/codes', { method: 'GET', signal });
      if (!res.ok) throw new Error('Failed to load mbti options');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  // ✅ UI에서 쓰기 좋은 형태로 매핑
  const mbtiOptions = useMemo(() => {
    const data = mbtiOptionsQuery.data;
    if (!Array.isArray(data)) return [];

    return data
      .map((option) => {
        if (!option?.codeId) return null;
        return {
          mbtiId: option.codeId,
          mbtiNm: option.codeName,
          description: option.extraInfo1,
        };
      })
      .filter(Boolean);
  }, [mbtiOptionsQuery.data]);

  // -----------------------------
  // 2) 프로필 기본 정보 조회
  // -----------------------------
  const profileQuery = useQuery({
    queryKey: ['myProfile'],
    staleTime: 0,
    queryFn: async ({ signal }) => {
      const res = await authFetch('/api/mypage/profile', { method: 'GET', signal });
      if (!res.ok) throw new Error('Failed to load profile');
      return res.data ?? {};
    },
  });

  // -----------------------------
  // 3) 썸네일 조회 (서버 썸네일)
  // - 사용자가 새 파일을 선택한 상태면 굳이 서버 썸네일을 덮어쓰지 않음
  // -----------------------------
  const thumbnailQuery = useQuery({
    queryKey: ['myThumbnail'],
    enabled: Boolean(profileQuery.data?.hasThumbnail) && !profile.thumbnailFile,
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

  // ✅ 서버에서 가져온 프로필 데이터를 폼 상태에 반영
  useEffect(() => {
    const data = profileQuery.data;
    if (!data) return;

    setProfile((prev) => ({
      ...prev,
      userId: data.userId ?? null,
      nickname: data.nickname ?? '',
      mbti: data.mbti ?? '',
      hasThumbnail: Boolean(data.hasThumbnail),
      thumbnailUrl: data.thumbnailUrl ?? '',

      // 사용자가 새 파일을 고른 상태면(로컬 미리보기 유지) 서버 값으로 덮어쓰지 않음
      thumbnailPreview: prev.thumbnailFile ? prev.thumbnailPreview : '',
    }));
  }, [profileQuery.data]);

  // ✅ 서버 썸네일(데이터URL)을 미리보기로 반영(단, 로컬 파일 선택 중이면 제외)
  useEffect(() => {
    if (!thumbnailQuery.data) return;

    setProfile((prev) => {
      if (prev.thumbnailFile) return prev; // 로컬 우선
      return { ...prev, thumbnailPreview: thumbnailQuery.data };
    });
  }, [thumbnailQuery.data]);

  // -----------------------------
  // 4) 저장(업로드 포함)
  // -----------------------------
  const saveProfileMutation = useMutation({
    mutationFn: async (data) => {
      // ✅ multipart/form-data 로 nickname/mbti + 파일 업로드
      const formData = new FormData();
      formData.append('nickname', data.nickname ?? '');
      formData.append('mbti', data.mbti ?? '');

      if (data.thumbnailFile instanceof File) {
        formData.append('thumbnail', data.thumbnailFile);
      }

      const res = await authFetch('/api/mypage/profile', { method: 'POST', body: formData });
      if (!res.ok) throw new Error(`Failed to save profile: ${res.status}`);
      return res.data;
    },

    // ✅ 성공 시 캐시 무효화 + 사용자 알림 + 재조회
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['myProfile'] });
      await queryClient.invalidateQueries({ queryKey: ['myThumbnail'] });

      await alert?.({
        title: '알림',
        description: '저장되었습니다.',
        actionLabel: '확인',
      });

      await profileQuery.refetch();
    },

    // ✅ 실패 시 알림 + 로그
    onError: async (error) => {
      await alert?.({
        title: '오류',
        description: '오류가 발생했습니다. 관리자에게 문의하세요.',
        actionLabel: '확인',
      });
      console.error('Failed to save profile', error);
    },
  });

  // ✅ "프로필 저장" (기존 handleSaveAll 명확화)
  const saveProfile = useCallback(() => {
    if (saveProfileMutation.isPending) return;
    saveProfileMutation.mutate(profile);
  }, [profile, saveProfileMutation]);

  // -----------------------------
  // 5) 썸네일 파일 선택 핸들러
  // -----------------------------
  const handleThumbnailChange = useCallback(
    async (event) => {
      const [file] = event.target.files || [];
      if (!file) return;

      // ✅ 용량 체크
      if (file.size > MAX_THUMBNAIL_BYTES) {
        await alert?.({
          title: '이미지 용량 초과',
          description: `프로필 이미지는 500KB 이하만 업로드할 수 있어요. (현재 ${(
            file.size / 1024
          ).toFixed(1)}KB)`,
          actionLabel: '확인',
        });

        // 같은 파일 재선택 가능하도록 input 초기화
        event.target.value = '';
        return;
      }

      // ✅ 로컬 미리보기 생성
      const reader = new FileReader();
      reader.onload = () => {
        setProfile((prev) => ({
          ...prev,
          thumbnailFile: file,
          thumbnailPreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    },
    [alert, MAX_THUMBNAIL_BYTES],
  );

  return {
    // 폼 상태
    profile,
    setProfile,

    // 외부 데이터
    mbtiOptions,

    // 액션
    handleThumbnailChange,
    saveProfile,

    // 상태
    isSavingProfile: saveProfileMutation.isPending,
    isLoadingProfile: profileQuery.isLoading,
    isLoadingMbti: mbtiOptionsQuery.isLoading,
  };
};
