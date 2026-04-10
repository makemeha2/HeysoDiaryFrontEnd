import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import type { ColumnDef } from '@tanstack/react-table';
import StatusFilterSelect from '@admin/components/StatusFilterSelect';
import AdminDataTable from '@admin/components/common/AdminDataTable';
import AdminAlertDialog from '@admin/components/common/dialog/AdminAlertDialog';
import {
  getAiRuntimeProfileList,
  createAiRuntimeProfile,
  updateAiRuntimeProfile,
  deleteAiRuntimeProfile,
} from '@admin/lib/aiTemplateApi';
import { fetchAdminCodeList } from '@admin/lib/comCdApi';
import { clearAdminAccessToken } from '@admin/lib/auth';
import type { AiRuntimeProfile, AiRuntimeProfileCreateRequest } from '@admin/types/aiTemplate';
import type { CommonCode, StatusFilter } from '@admin/types/comCd';

type ProfileForm = {
  profileKey: string;
  profileName: string;
  domainType: string;
  provider: string;
  model: string;
  modelName: string;
  temperature: string;
  topP: string;
  maxTokens: string;
  description: string;
  isActive: boolean;
};

const initialForm: ProfileForm = {
  profileKey: '',
  profileName: '',
  domainType: '',
  provider: '',
  model: '',
  modelName: '',
  temperature: '',
  topP: '',
  maxTokens: '',
  description: '',
  isActive: true,
};

const MODEL_REFERENCE = [
  { provider: 'OpenAI', model: 'GPT-4o', feature: '자연스러운 문장 + 속도 빠름, 멀티모달 강점', usage: '일기 생성, 실시간 대화형 글쓰기' },
  { provider: '', model: 'GPT-4o-mini', feature: '저비용 + 준수한 문장 품질', usage: '대량 일기 생성, 비용 최적화' },
  { provider: '', model: 'GPT-4 Turbo', feature: '구조적 글쓰기 + 안정적인 문장', usage: '일기 다듬기/교정 (Editing)' },
  { provider: 'Anthropic', model: 'Claude 3 Opus', feature: '감정 표현 + 서사형 글쓰기 매우 강함', usage: '감성 일기, 스토리형 글' },
  { provider: '', model: 'Claude 3.5 Sonnet', feature: '긴 문맥 유지 + 논리 + 자연스러움', usage: '일기 분석 + 개선' },
  { provider: '', model: 'Claude 4 Sonnet', feature: '긴 글 처리 + 일관성 유지 최고 수준', usage: '장기 일기 분석, 회고' },
];

const AdminRuntimeProfilePage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<StatusFilter>('ACTIVE');
  const [domainFilter, setDomainFilter] = useState<string>('');
  const [profiles, setProfiles] = useState<AiRuntimeProfile[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<AiRuntimeProfile | null>(null);
  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [domainCodes, setDomainCodes] = useState<CommonCode[]>([]);
  const [aiModelCodes, setAiModelCodes] = useState<CommonCode[]>([]);

  const handleApiError = useCallback(
    (apiStatus: number, fallback: string) => {
      if (apiStatus === 401) {
        clearAdminAccessToken();
        navigate('/admin/login?reason=sessionExpired', { replace: true });
        return;
      }
      if (apiStatus === 403) {
        setErrorMessage('관리자 권한이 없습니다.');
        return;
      }
      setErrorMessage(fallback);
    },
    [navigate],
  );

  // 도메인 코드 & AI 모델 코드 초기 로딩 (단일 호출)
  useEffect(() => {
    fetchAdminCodeList('aitp_domain', 'ACTIVE').then((r) => {
      if (r.ok) setDomainCodes(r.data ?? []);
    });
    fetchAdminCodeList('ai_models', 'ACTIVE').then((r) => {
      if (r.ok) setAiModelCodes(r.data ?? []);
    });
  }, []);

  // provider 옵션: extraInfo1 기준으로 중복 제거
  const providerOptions = useMemo(
    () => [...new Set(aiModelCodes.map((c) => c.extraInfo1).filter((v): v is string => !!v))],
    [aiModelCodes],
  );

  // model 옵션: 선택된 provider에 맞는 모델만
  const modelOptions = useMemo(
    () => (form.provider ? aiModelCodes.filter((c) => c.extraInfo1 === form.provider) : aiModelCodes),
    [aiModelCodes, form.provider],
  );

  const loadProfiles = useCallback(
    async (s: StatusFilter, d: string) => {
      const result = await getAiRuntimeProfileList(s, d || undefined);
      if (!result.ok) {
        handleApiError(result.status, '런타임 프로파일 목록을 불러오지 못했습니다.');
        return;
      }
      setProfiles(result.data ?? []);
    },
    [handleApiError],
  );

  useEffect(() => {
    setErrorMessage(null);
    loadProfiles(status, domainFilter);
  }, [status, domainFilter, loadProfiles]);

  const handleOpenCreate = () => {
    setEditingProfile(null);
    setForm(initialForm);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = useCallback((profile: AiRuntimeProfile) => {
    setEditingProfile(profile);
    setForm({
      profileKey: profile.profileKey,
      profileName: profile.profileName,
      domainType: profile.domainType,
      provider: profile.provider ?? '',
      model: profile.model,
      modelName: profile.modelName,
      temperature: profile.temperature != null ? String(profile.temperature) : '',
      topP: profile.topP != null ? String(profile.topP) : '',
      maxTokens: profile.maxTokens != null ? String(profile.maxTokens) : '',
      description: profile.description ?? '',
      isActive: profile.isActive === 1,
    });
    setIsDialogOpen(true);
  }, []);

  const handleSave = async () => {
    if (!form.profileName.trim() || !form.model.trim() || !form.domainType.trim()) {
      setErrorMessage('프로파일명, 도메인 유형, 모델은 필수입니다.');
      return;
    }

    setErrorMessage(null);
    const payload: AiRuntimeProfileCreateRequest = {
      profileKey: form.profileKey.trim(),
      profileName: form.profileName.trim(),
      domainType: form.domainType.trim(),
      model: form.model.trim(),
      provider: form.provider.trim() || undefined,
      temperature: form.temperature !== '' ? Number(form.temperature) : null,
      topP: form.topP !== '' ? Number(form.topP) : null,
      maxTokens: form.maxTokens !== '' ? Number(form.maxTokens) : null,
      description: form.description.trim() || undefined,
    };

    const result =
      editingProfile == null
        ? await createAiRuntimeProfile(payload)
        : await updateAiRuntimeProfile(editingProfile.runtimeProfileId, {
            profileName: payload.profileName,
            domainType: payload.domainType,
            model: payload.model,
            provider: payload.provider,
            temperature: payload.temperature,
            topP: payload.topP,
            maxTokens: payload.maxTokens,
            description: payload.description,
          });

    if (!result.ok) {
      handleApiError(result.status, result.errorMessage ?? '저장에 실패했습니다.');
      return;
    }

    setAlertMessage(editingProfile == null ? '등록되었습니다.' : '수정되었습니다.');
    setIsDialogOpen(false);
    await loadProfiles(status, domainFilter);
  };

  const handleDelete = async (id: number) => {
    const result = await deleteAiRuntimeProfile(id);
    if (!result.ok) {
      handleApiError(result.status, result.errorMessage ?? '삭제에 실패했습니다.');
      return;
    }
    setAlertMessage('삭제되었습니다.');
    setConfirmDeleteId(null);
    await loadProfiles(status, domainFilter);
  };

  const columns = useMemo<ColumnDef<AiRuntimeProfile>[]>(
    () => [
      { accessorKey: 'profileKey', header: 'Profile Key' },
      { accessorKey: 'profileName', header: '프로파일명' },
      { accessorKey: 'domainType', header: '도메인' },
      { accessorKey: 'provider', header: 'Provider' },
      { accessorKey: 'modelName', header: '모델' },
      {
        accessorKey: 'temperature',
        header: 'Temperature',
        cell: ({ row }) => row.original.temperature ?? '-',
      },
      {
        accessorKey: 'topP',
        header: 'Top P',
        cell: ({ row }) => row.original.topP ?? '-',
      },
      {
        accessorKey: 'maxTokens',
        header: 'Max Tokens',
        cell: ({ row }) => row.original.maxTokens ?? '-',
      },
      {
        accessorKey: 'isActive',
        header: '상태',
        cell: ({ row }) => (
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              row.original.isActive === 1
                ? 'bg-amber/20 text-clay'
                : 'bg-sand/30 text-clay/50'
            }`}
          >
            {row.original.isActive === 1 ? '활성' : '비활성'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEdit(row.original);
              }}
              className="rounded border border-sand px-2 py-0.5 text-xs text-clay hover:bg-sand/30"
            >
              수정
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDeleteId(row.original.runtimeProfileId);
              }}
              className="rounded border border-sand px-2 py-0.5 text-xs text-clay/70 hover:bg-sand/30"
            >
              삭제
            </button>
          </div>
        ),
      },
    ],
    [handleOpenEdit],
  );

  const isCreateMode = editingProfile == null;

  return (
    <div className="flex w-full flex-col gap-4 text-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-clay sm:text-xl">런타임 프로파일 관리</h1>
          <p className="text-xs text-clay/80 sm:text-sm">AI 실행 설정을 등록/수정합니다.</p>
        </div>
      </header>

      {errorMessage && (
        <div className="rounded-md border border-blush/50 bg-blush/20 px-3 py-2 text-xs text-clay sm:text-sm">
          {errorMessage}
        </div>
      )}

      <section className="flex min-w-0 flex-col gap-3 rounded-xl border border-sand/60 bg-linen/60 p-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold text-clay">프로파일 목록</h2>
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1 text-xs text-clay">
              도메인
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="rounded border border-sand px-2 py-1 text-xs"
              >
                <option value="">전체</option>
                {domainCodes.map((c) => (
                  <option key={c.codeId} value={c.codeId}>{c.codeName}</option>
                ))}
              </select>
            </label>
            <StatusFilterSelect value={status} onChange={setStatus} />
            <button
              type="button"
              onClick={() => loadProfiles(status, domainFilter)}
              className="rounded border border-sand px-2 py-1 text-xs text-clay sm:text-sm"
            >
              새로고침
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="rounded bg-clay px-2 py-1 text-xs text-white sm:text-sm"
            >
              새 프로파일
            </button>
          </div>
        </div>

        <AdminDataTable
          data={profiles}
          columns={columns}
          rowKey={(row) => String(row.runtimeProfileId)}
          emptyMessage="런타임 프로파일이 없습니다."
          maxHeightClassName="max-h-[400px]"
        />

        {/* 모델 참조표 */}
        <div className="mt-2">
          <h3 className="mb-2 text-xs font-semibold text-clay/80">AI 모델 참조표 (일기/글쓰기 관점)</h3>
          <div className="overflow-auto rounded-lg border border-sand/60">
            <table className="w-full min-w-[560px] text-xs">
              <thead>
                <tr className="bg-sand/40 text-left text-clay">
                  <th className="px-3 py-2 font-semibold">구분</th>
                  <th className="px-3 py-2 font-semibold">모델</th>
                  <th className="px-3 py-2 font-semibold">특징 (일기/글쓰기 관점)</th>
                  <th className="px-3 py-2 font-semibold">추천 용도</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand/40">
                {(() => {
                  const rows: React.ReactNode[] = [];
                  let i = 0;
                  while (i < MODEL_REFERENCE.length) {
                    const providerName = MODEL_REFERENCE[i].provider;
                    if (providerName) {
                      let span = 1;
                      while (i + span < MODEL_REFERENCE.length && !MODEL_REFERENCE[i + span].provider) {
                        span++;
                      }
                      for (let j = 0; j < span; j++) {
                        const item = MODEL_REFERENCE[i + j];
                        rows.push(
                          <tr key={item.model} className="bg-white hover:bg-linen/60">
                            {j === 0 && (
                              <td
                                rowSpan={span}
                                className="border-r border-sand/40 px-3 py-2 align-middle font-semibold text-clay"
                              >
                                {providerName}
                              </td>
                            )}
                            <td className="px-3 py-2 font-medium text-clay">{item.model}</td>
                            <td className="px-3 py-2 text-clay/80">{item.feature}</td>
                            <td className="px-3 py-2 text-clay/80">{item.usage}</td>
                          </tr>,
                        );
                      }
                      i += span;
                    } else {
                      i++;
                    }
                  }
                  return rows;
                })()}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 등록/수정 다이얼로그 */}
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
            <Dialog.Title className="text-sm font-semibold text-clay">
              {isCreateMode ? '런타임 프로파일 등록' : '런타임 프로파일 수정'}
            </Dialog.Title>

            <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">Profile Key <span className="text-blush">*</span></span>
                <input
                  value={form.profileKey}
                  readOnly={!isCreateMode}
                  onChange={(e) => setForm((p) => ({ ...p, profileKey: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm read-only:bg-linen"
                  placeholder="예: DIARY_AI_DEFAULT"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">프로파일명 <span className="text-blush">*</span></span>
                <input
                  value={form.profileName}
                  onChange={(e) => setForm((p) => ({ ...p, profileName: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">도메인 유형 <span className="text-blush">*</span></span>
                <select
                  value={form.domainType}
                  onChange={(e) => setForm((p) => ({ ...p, domainType: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                >
                  <option value="">선택</option>
                  {domainCodes.map((c) => (
                    <option key={c.codeId} value={c.codeId}>{c.codeName}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">Provider</span>
                <select
                  value={form.provider}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, provider: e.target.value, model: '' }))
                  }
                  className="rounded border border-sand px-3 py-2 text-sm"
                >
                  <option value="">선택 안함</option>
                  {providerOptions.map((pv) => (
                    <option key={pv} value={pv}>{pv}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-xs text-clay/80">모델 <span className="text-blush">*</span></span>
                <select
                  value={form.model}
                  onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                >
                  <option value="">선택</option>
                  {modelOptions.map((c) => (
                    <option key={c.codeId} value={c.codeId}>{c.codeName}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">Temperature</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={form.temperature}
                  onChange={(e) => setForm((p) => ({ ...p, temperature: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                  placeholder="예: 0.7"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">Top P</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={form.topP}
                  onChange={(e) => setForm((p) => ({ ...p, topP: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                  placeholder="예: 0.9"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">Max Tokens</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={form.maxTokens}
                  onChange={(e) => setForm((p) => ({ ...p, maxTokens: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                  placeholder="예: 2000"
                />
              </label>
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-xs text-clay/80">설명</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                  rows={2}
                />
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="rounded border border-sand px-3 py-1.5 text-xs text-clay sm:text-sm"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded bg-clay px-3 py-1.5 text-xs text-white sm:text-sm"
              >
                저장
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog.Root open={confirmDeleteId != null} onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
            <Dialog.Title className="text-sm font-semibold text-clay">삭제 확인</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-clay/80">
              이 런타임 프로파일을 삭제하시겠습니까? (비활성 처리됩니다)
            </Dialog.Description>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="rounded border border-sand px-3 py-1.5 text-xs text-clay sm:text-sm"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteId != null && handleDelete(confirmDeleteId)}
                className="rounded bg-clay px-3 py-1.5 text-xs text-white sm:text-sm"
              >
                삭제
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AdminAlertDialog
        open={!!alertMessage}
        onOpenChange={(open) => { if (!open) setAlertMessage(null); }}
        title="알림"
        description={alertMessage ?? ''}
      />
    </div>
  );
};

export default AdminRuntimeProfilePage;
