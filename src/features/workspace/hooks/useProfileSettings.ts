import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { authFetch } from '@lib/apiClient';
import { formatThumbnailPreviewDataUrl } from '@lib/imageFormatters.js';

export type ProfileSettings = {
  userId: number | null;
  nickname: string;
  mbti: string;
  hasThumbnail: boolean;
  thumbnailUrl: string;
  thumbnailFile: File | null;
  thumbnailPreview: string;
};

export type MbtiOption = {
  mbtiId: string;
  mbtiNm: string;
  description?: string;
};

type ProfileResponse = Partial<Omit<ProfileSettings, 'thumbnailFile' | 'thumbnailPreview'>>;

type CodeResponse = {
  codeId?: string | null;
  codeName?: string | null;
  extraInfo1?: string | null;
};

type AlertOptions = {
  title: string;
  description?: string;
  actionLabel?: string;
};

type UseProfileSettingsOptions = {
  alert?: (options: AlertOptions) => Promise<void> | void;
  activeSection?: string;
};

type UseProfileSettingsResult = {
  profile: ProfileSettings;
  setProfile: Dispatch<SetStateAction<ProfileSettings>>;
  mbtiOptions: MbtiOption[];
  handleThumbnailChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  saveProfile: () => void;
  isSavingProfile: boolean;
  isLoadingProfile: boolean;
  isLoadingMbti: boolean;
};

const MAX_THUMBNAIL_BYTES = 500 * 1024;

const INITIAL_PROFILE: ProfileSettings = {
  userId: null,
  nickname: '',
  mbti: '',
  hasThumbnail: false,
  thumbnailUrl: '',
  thumbnailFile: null,
  thumbnailPreview: '',
};

const MBTI_OPTIONS_QUERY_KEY = ['mbtiOptions'] as const;
const MY_PROFILE_QUERY_KEY = ['myProfile'] as const;
const MY_THUMBNAIL_QUERY_KEY = ['myThumbnail'] as const;

export function useProfileSettings({
  alert,
  activeSection,
}: UseProfileSettingsOptions = {}): UseProfileSettingsResult {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<ProfileSettings>(INITIAL_PROFILE);

  const enabled = activeSection === 'profile';

  const mbtiOptionsQuery = useQuery({
    queryKey: MBTI_OPTIONS_QUERY_KEY,
    enabled,
    staleTime: 0,
    queryFn: async ({ signal }) => {
      const res = await authFetch<CodeResponse[]>('/api/comCd/groups/mbti/codes', {
        method: 'GET',
        signal,
      });
      if (!res.ok) throw new Error('Failed to load mbti options');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const mbtiOptions = useMemo<MbtiOption[]>(() => {
    const data = mbtiOptionsQuery.data;
    if (!Array.isArray(data)) return [];

    return data
      .map<MbtiOption | null>((option) => {
        if (!option?.codeId) return null;
        return {
          mbtiId: option.codeId,
          mbtiNm: option.codeName ?? option.codeId,
          description: option.extraInfo1 ?? undefined,
        };
      })
      .filter((option): option is MbtiOption => Boolean(option));
  }, [mbtiOptionsQuery.data]);

  const profileQuery = useQuery({
    queryKey: MY_PROFILE_QUERY_KEY,
    enabled,
    staleTime: 0,
    queryFn: async ({ signal }) => {
      const res = await authFetch<ProfileResponse>('/api/mypage/profile', {
        method: 'GET',
        signal,
      });
      if (!res.ok) throw new Error('Failed to load profile');
      return res.data ?? {};
    },
  });

  const thumbnailQuery = useQuery({
    queryKey: MY_THUMBNAIL_QUERY_KEY,
    enabled: enabled && Boolean(profileQuery.data?.hasThumbnail) && !profile.thumbnailFile,
    staleTime: 0,
    queryFn: async ({ signal }) => {
      const res = await authFetch<ArrayBuffer>('/api/mypage/thumbnail', {
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
    if (!enabled) return;

    const data = profileQuery.data;
    if (!data) return;

    setProfile({
      ...INITIAL_PROFILE,
      userId: data.userId ?? null,
      nickname: data.nickname ?? '',
      mbti: data.mbti ?? '',
      hasThumbnail: Boolean(data.hasThumbnail),
      thumbnailUrl: data.thumbnailUrl ?? '',
      thumbnailFile: null,
      thumbnailPreview: '',
    });
  }, [enabled, profileQuery.data, profileQuery.dataUpdatedAt]);

  useEffect(() => {
    if (!enabled) return;
    if (!thumbnailQuery.data) return;

    setProfile((prev) => {
      if (prev.thumbnailFile) return prev;
      return { ...prev, thumbnailPreview: thumbnailQuery.data };
    });
  }, [enabled, thumbnailQuery.data, thumbnailQuery.dataUpdatedAt]);

  const saveProfileMutation = useMutation({
    mutationFn: async (data: ProfileSettings) => {
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: MY_PROFILE_QUERY_KEY });
      await queryClient.invalidateQueries({ queryKey: MY_THUMBNAIL_QUERY_KEY });

      await alert?.({
        title: '알림',
        description: '저장되었습니다.',
        actionLabel: '확인',
      });

      await profileQuery.refetch();
    },
    onError: async (error) => {
      await alert?.({
        title: '오류',
        description: '오류가 발생했습니다. 관리자에게 문의하세요.',
        actionLabel: '확인',
      });
      console.error('Failed to save profile', error);
    },
  });

  const saveProfile = useCallback(() => {
    if (saveProfileMutation.isPending) return;
    saveProfileMutation.mutate(profile);
  }, [profile, saveProfileMutation]);

  const handleThumbnailChange = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const [file] = event.target.files || [];
      if (!file) return;

      if (file.size > MAX_THUMBNAIL_BYTES) {
        await alert?.({
          title: '이미지 용량 초과',
          description: `프로필 이미지는 500KB 이하만 업로드할 수 있어요. (현재 ${(
            file.size / 1024
          ).toFixed(1)}KB)`,
          actionLabel: '확인',
        });

        event.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setProfile((prev) => ({
          ...prev,
          thumbnailFile: file,
          thumbnailPreview: typeof reader.result === 'string' ? reader.result : '',
        }));
      };
      reader.readAsDataURL(file);
    },
    [alert],
  );

  return {
    profile,
    setProfile,
    mbtiOptions,
    handleThumbnailChange,
    saveProfile,
    isSavingProfile: saveProfileMutation.isPending,
    isLoadingProfile: profileQuery.isLoading,
    isLoadingMbti: mbtiOptionsQuery.isLoading,
  };
}
