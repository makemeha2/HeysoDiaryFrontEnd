import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import type { ColumnDef } from '@tanstack/react-table';
import StatusFilterSelect from '@admin/components/StatusFilterSelect';
import AdminDataTable from '@admin/components/common/AdminDataTable';
import AdminAlertDialog from '@admin/components/common/dialog/AdminAlertDialog';
import {
  getAiPromptTemplateList,
  getAiPromptTemplateDetail,
  createAiPromptTemplate,
  updateAiPromptTemplate,
  addTemplateRelation,
  deleteTemplateRelation,
  previewTemplate,
} from '@admin/lib/aiTemplateApi';
import { fetchAdminCodeList } from '@admin/lib/comCdApi';
import { clearAdminAccessToken } from '@admin/lib/auth';
import type {
  AiPromptTemplateListItem,
  AiPromptTemplateDetail,
  AiPromptTemplateCreateRequest,
  AiPromptTemplateRelItem,
} from '@admin/types/aiTemplate';
import type { CommonCode, StatusFilter } from '@admin/types/comCd';

type TemplateForm = {
  templateKey: string;
  templateName: string;
  domainType: string;
  featureKey: string;
  templateRole: string;
  templateType: string;
  content: string;
  description: string;
  isActive: number;
};

const initialForm: TemplateForm = {
  templateKey: '',
  templateName: '',
  domainType: '',
  featureKey: '',
  templateRole: 'SYSTEM',
  templateType: 'ROOT',
  content: '',
  description: '',
  isActive: 1,
};

type RelForm = {
  childTemplateId: number | '';
  mergeType: string;
  sortSeq: string;
};

const initialRelForm: RelForm = {
  childTemplateId: '',
  mergeType: 'APPEND',
  sortSeq: '0',
};

const AdminAiTemplatePage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<StatusFilter>('ACTIVE');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [domainFilter, setDomainFilter] = useState<string>('');
  const [templates, setTemplates] = useState<AiPromptTemplateListItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AiPromptTemplateDetail | null>(null);

  const [domainCodes, setDomainCodes] = useState<CommonCode[]>([]);
  const [fragmentOptions, setFragmentOptions] = useState<AiPromptTemplateListItem[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AiPromptTemplateListItem | null>(null);
  const [form, setForm] = useState<TemplateForm>(initialForm);

  const [isRelOpen, setIsRelOpen] = useState(false);
  const [relForm, setRelForm] = useState<RelForm>(initialRelForm);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewVars, setPreviewVars] = useState('{}');
  const [previewResult, setPreviewResult] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [confirmDeleteRelId, setConfirmDeleteRelId] = useState<number | null>(null);

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // 도메인 코드 & Fragment 후보 초기 로딩
  useEffect(() => {
    fetchAdminCodeList('aitp_domain', 'ACTIVE').then((r) => {
      if (r.ok) setDomainCodes(r.data ?? []);
    });
    getAiPromptTemplateList('ACTIVE', 'FRAGMENT').then((r) => {
      if (r.ok) setFragmentOptions(r.data ?? []);
    });
  }, []);

  const loadTemplates = useCallback(
    async (s: StatusFilter, t: string, d: string) => {
      const result = await getAiPromptTemplateList(
        s,
        t === 'ALL' ? undefined : t,
        d || undefined,
      );
      if (!result.ok) {
        handleApiError(result.status, '템플릿 목록을 불러오지 못했습니다.');
        return;
      }
      setTemplates(result.data ?? []);
    },
    [handleApiError],
  );

  const loadDetail = useCallback(
    async (id: number) => {
      const result = await getAiPromptTemplateDetail(id);
      if (!result.ok) {
        handleApiError(result.status, '템플릿 상세를 불러오지 못했습니다.');
        return;
      }
      setDetail(result.data);
    },
    [handleApiError],
  );

  useEffect(() => {
    setErrorMessage(null);
    setSelectedId(null);
    setDetail(null);
    loadTemplates(status, typeFilter, domainFilter);
  }, [status, typeFilter, domainFilter, loadTemplates]);

  useEffect(() => {
    if (selectedId != null) {
      loadDetail(selectedId);
    } else {
      setDetail(null);
    }
  }, [selectedId, loadDetail]);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setForm(initialForm);
    setIsFormOpen(true);
  };

  const handleOpenEdit = useCallback((t: AiPromptTemplateListItem) => {
    setEditingTemplate(t);
    setForm({
      templateKey: t.templateKey,
      templateName: t.templateName,
      domainType: t.domainType,
      featureKey: t.featureKey ?? '',
      templateRole: t.templateRole,
      templateType: t.templateType,
      content: '',
      description: '',
      isActive: t.isActive,
    });
    setIsFormOpen(true);
  }, []);

  useEffect(() => {
    if (isFormOpen && editingTemplate != null && detail != null && detail.templateId === editingTemplate.templateId) {
      setForm((prev) => ({
        ...prev,
        content: detail.content ?? '',
        description: detail.description ?? '',
      }));
    }
  }, [isFormOpen, editingTemplate, detail]);

  const handleSave = async () => {
    if (!form.templateName.trim() || !form.domainType.trim() || !form.content.trim()) {
      setErrorMessage('템플릿명, 도메인 유형, 내용은 필수입니다.');
      return;
    }
    setErrorMessage(null);

    const payload: AiPromptTemplateCreateRequest = {
      templateKey: form.templateKey.trim(),
      templateName: form.templateName.trim(),
      domainType: form.domainType.trim(),
      featureKey: form.featureKey.trim() || undefined,
      templateRole: form.templateRole,
      templateType: form.templateType,
      content: form.content,
      description: form.description.trim() || undefined,
    };

    const result =
      editingTemplate == null
        ? await createAiPromptTemplate(payload)
        : await updateAiPromptTemplate(editingTemplate.templateId, {
            templateName: payload.templateName,
            domainType: payload.domainType,
            featureKey: payload.featureKey,
            templateRole: payload.templateRole,
            templateType: payload.templateType,
            content: payload.content,
            description: payload.description,
            isActive: form.isActive,
          });

    if (!result.ok) {
      handleApiError(result.status, result.errorMessage ?? '저장에 실패했습니다.');
      return;
    }

    setAlertMessage(editingTemplate == null ? '등록되었습니다.' : '수정되었습니다.');
    setIsFormOpen(false);
    await loadTemplates(status, typeFilter, domainFilter);
    if (selectedId != null) await loadDetail(selectedId);
    getAiPromptTemplateList('ACTIVE', 'FRAGMENT').then((r) => {
      if (r.ok) setFragmentOptions(r.data ?? []);
    });
  };

  const handleAddRelation = async () => {
    if (relForm.childTemplateId === '') {
      setErrorMessage('Fragment 템플릿을 선택하세요.');
      return;
    }
    if (selectedId == null) return;
    setErrorMessage(null);

    const result = await addTemplateRelation(selectedId, {
      childTemplateId: Number(relForm.childTemplateId),
      mergeType: relForm.mergeType,
      sortSeq: relForm.sortSeq !== '' ? Number(relForm.sortSeq) : undefined,
    });

    if (!result.ok) {
      handleApiError(result.status, result.errorMessage ?? 'Fragment 추가에 실패했습니다.');
      return;
    }

    setAlertMessage('Fragment가 추가되었습니다.');
    setIsRelOpen(false);
    setRelForm(initialRelForm);
    await loadDetail(selectedId);
  };

  const handleDeleteRelation = async (relId: number) => {
    if (selectedId == null) return;
    const result = await deleteTemplateRelation(selectedId, relId);
    if (!result.ok) {
      handleApiError(result.status, result.errorMessage ?? 'Fragment 삭제에 실패했습니다.');
      return;
    }
    setAlertMessage('Fragment 연결이 삭제되었습니다.');
    setConfirmDeleteRelId(null);
    await loadDetail(selectedId);
  };

  const handlePreview = async () => {
    if (selectedId == null) return;
    setPreviewError(null);
    setPreviewResult(null);

    let variables: Record<string, string> = {};
    try {
      variables = JSON.parse(previewVars);
    } catch {
      setPreviewError('변수 JSON 형식이 올바르지 않습니다.');
      return;
    }

    const result = await previewTemplate(selectedId, { variables });
    if (!result.ok) {
      setPreviewError(result.errorMessage ?? '미리보기에 실패했습니다.');
      return;
    }
    setPreviewResult(result.data?.renderedContent ?? '');
  };

  const listColumns = useMemo<ColumnDef<AiPromptTemplateListItem>[]>(
    () => [
      { accessorKey: 'templateKey', header: 'Key' },
      { accessorKey: 'templateName', header: '템플릿명' },
      { accessorKey: 'templateRole', header: 'Role' },
      { accessorKey: 'templateType', header: 'Type' },
      { accessorKey: 'domainType', header: '도메인' },
      {
        accessorKey: 'isActive',
        header: '상태',
        cell: ({ row }) => (
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              row.original.isActive === 1 ? 'bg-amber/20 text-clay' : 'bg-sand/30 text-clay/50'
            }`}
          >
            {row.original.isActive === 1 ? '활성' : '비활성'}
          </span>
        ),
      },
    ],
    [],
  );

  const relColumns = useMemo<ColumnDef<AiPromptTemplateRelItem>[]>(
    () => [
      { accessorKey: 'relId', header: 'ID' },
      { accessorKey: 'childTemplateKey', header: 'Fragment Key' },
      { accessorKey: 'childTemplateName', header: 'Fragment명' },
      { accessorKey: 'mergeType', header: '조합 방식' },
      { accessorKey: 'sortSeq', header: '순서' },
      {
        id: 'relActions',
        header: '',
        cell: ({ row }) => (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmDeleteRelId(row.original.relId);
            }}
            className="rounded border border-sand px-2 py-0.5 text-xs text-clay/70 hover:bg-sand/30"
          >
            삭제
          </button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex w-full flex-col gap-4 text-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-clay sm:text-xl">프롬프트 템플릿 관리</h1>
          <p className="text-xs text-clay/80 sm:text-sm">템플릿 목록에서 행을 클릭하면 상세가 표시됩니다.</p>
        </div>
      </header>

      {errorMessage && (
        <div className="rounded-md border border-blush/50 bg-blush/20 px-3 py-2 text-xs text-clay sm:text-sm">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* 목록 - 40vh */}
        <section
          className="flex min-w-0 flex-col gap-3 overflow-auto rounded-xl border border-sand/60 bg-linen/60 p-3"
          style={{ height: '40vh' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-clay">템플릿 목록</h2>
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
              <label className="flex items-center gap-1 text-xs text-clay">
                타입
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded border border-sand px-2 py-1 text-xs"
                >
                  <option value="ALL">전체</option>
                  <option value="ROOT">ROOT</option>
                  <option value="FRAGMENT">FRAGMENT</option>
                </select>
              </label>
              <StatusFilterSelect value={status} onChange={setStatus} />
              <button
                type="button"
                onClick={() => loadTemplates(status, typeFilter, domainFilter)}
                className="rounded border border-sand px-2 py-1 text-xs text-clay sm:text-sm"
              >
                새로고침
              </button>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="rounded bg-clay px-2 py-1 text-xs text-white sm:text-sm"
              >
                새 템플릿
              </button>
            </div>
          </div>

          <AdminDataTable
            data={templates}
            columns={listColumns}
            rowKey={(row) => String(row.templateId)}
            onRowClick={(row) => setSelectedId(row.templateId)}
            selectedKey={selectedId != null ? String(selectedId) : null}
            emptyMessage="템플릿이 없습니다."
          />
        </section>

        {/* 상세 - 60vh */}
        <section
          className="flex min-w-0 flex-col gap-3 overflow-auto rounded-xl border border-sand/60 bg-linen/60 p-3"
          style={{ height: '60vh' }}
        >
          <h2 className="font-semibold text-clay">상세</h2>

          {detail == null ? (
            <p className="text-xs text-clay/60">목록에서 템플릿을 선택하세요.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-sand/40 px-2 py-0.5 text-xs text-clay">
                  {detail.templateRole}
                </span>
                <span className="rounded-full bg-sand/40 px-2 py-0.5 text-xs text-clay">
                  {detail.templateType}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    detail.isActive === 1 ? 'bg-amber/20 text-clay' : 'bg-sand/30 text-clay/50'
                  }`}
                >
                  {detail.isActive === 1 ? '활성' : '비활성'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-clay/80">
                <span><strong>Key:</strong> {detail.templateKey}</span>
                <span><strong>도메인:</strong> {detail.domainType}</span>
                <span><strong>Feature:</strong> {detail.featureKey ?? '-'}</span>
                <span><strong>Revision:</strong> {detail.revisionNo}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-clay/70">내용</span>
                <pre className="max-h-48 overflow-auto rounded border border-sand/60 bg-white p-2 text-xs text-clay whitespace-pre-wrap break-all">
                  {detail.content}
                </pre>
              </div>

              {detail.description && (
                <p className="text-xs text-clay/70">{detail.description}</p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(detail)}
                  className="rounded border border-sand px-3 py-1 text-xs text-clay hover:bg-sand/30"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewVars('{}');
                    setPreviewResult(null);
                    setPreviewError(null);
                    setIsPreviewOpen(true);
                  }}
                  className="rounded border border-amber/60 bg-amber/10 px-3 py-1 text-xs text-clay hover:bg-amber/20"
                >
                  미리보기
                </button>
              </div>

              {/* Fragment 관계 (ROOT만) */}
              {detail.templateType === 'ROOT' && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-clay">연결된 Fragment</span>
                    <button
                      type="button"
                      onClick={() => {
                        setRelForm(initialRelForm);
                        setIsRelOpen(true);
                      }}
                      className="rounded bg-clay px-2 py-0.5 text-xs text-white"
                    >
                      Fragment 추가
                    </button>
                  </div>
                  <AdminDataTable
                    data={detail.relations}
                    columns={relColumns}
                    rowKey={(row) => String(row.relId)}
                    emptyMessage="연결된 Fragment가 없습니다."
                    maxHeightClassName="max-h-[200px]"
                  />
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* 등록/수정 다이얼로그 */}
      <Dialog.Root open={isFormOpen} onOpenChange={setIsFormOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
            <Dialog.Title className="text-sm font-semibold text-clay">
              {editingTemplate == null ? '템플릿 등록' : '템플릿 수정'}
            </Dialog.Title>

            <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">Template Key <span className="text-blush">*</span></span>
                <input
                  value={form.templateKey}
                  readOnly={editingTemplate != null}
                  onChange={(e) => setForm((p) => ({ ...p, templateKey: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm read-only:bg-linen"
                  placeholder="예: DIARY_SYSTEM_ROOT"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">템플릿명 <span className="text-blush">*</span></span>
                <input
                  value={form.templateName}
                  onChange={(e) => setForm((p) => ({ ...p, templateName: e.target.value }))}
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
                <span className="text-xs text-clay/80">Feature Key</span>
                <input
                  value={form.featureKey}
                  onChange={(e) => setForm((p) => ({ ...p, featureKey: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">Role</span>
                <select
                  value={form.templateRole}
                  onChange={(e) => setForm((p) => ({ ...p, templateRole: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                >
                  <option value="SYSTEM">SYSTEM</option>
                  <option value="USER">USER</option>
                  <option value="COMPONENT">COMPONENT</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">Type</span>
                <select
                  value={form.templateType}
                  onChange={(e) => setForm((p) => ({ ...p, templateType: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                >
                  <option value="ROOT">ROOT</option>
                  <option value="FRAGMENT">FRAGMENT</option>
                </select>
              </label>
              {editingTemplate != null && (
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-clay/80">활성 상태</span>
                  <select
                    value={String(form.isActive)}
                    onChange={(e) => setForm((p) => ({ ...p, isActive: Number(e.target.value) }))}
                    className="rounded border border-sand px-3 py-2 text-sm"
                  >
                    <option value="1">활성</option>
                    <option value="0">비활성</option>
                  </select>
                </label>
              )}
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-xs text-clay/80">내용 <span className="text-blush">*</span></span>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm font-mono"
                  rows={8}
                  placeholder="프롬프트 내용을 입력하세요. 변수는 {{variable}} 형식으로 사용하세요."
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
                onClick={() => setIsFormOpen(false)}
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

      {/* Fragment 추가 다이얼로그 */}
      <Dialog.Root open={isRelOpen} onOpenChange={setIsRelOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
            <Dialog.Title className="text-sm font-semibold text-clay">Fragment 추가</Dialog.Title>

            <div className="mt-4 flex flex-col gap-3 text-sm">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">Fragment 템플릿 <span className="text-blush">*</span></span>
                <select
                  value={relForm.childTemplateId === '' ? '' : String(relForm.childTemplateId)}
                  onChange={(e) =>
                    setRelForm((p) => ({
                      ...p,
                      childTemplateId: e.target.value === '' ? '' : Number(e.target.value),
                    }))
                  }
                  className="rounded border border-sand px-3 py-2 text-sm"
                >
                  <option value="">선택</option>
                  {fragmentOptions.map((t) => (
                    <option key={t.templateId} value={String(t.templateId)}>
                      {t.templateKey} — {t.templateName}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">조합 방식</span>
                <select
                  value={relForm.mergeType}
                  onChange={(e) => setRelForm((p) => ({ ...p, mergeType: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                >
                  <option value="APPEND">APPEND</option>
                  <option value="PREPEND">PREPEND</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">정렬 순서</span>
                <input
                  type="number"
                  value={relForm.sortSeq}
                  onChange={(e) => setRelForm((p) => ({ ...p, sortSeq: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRelOpen(false)}
                className="rounded border border-sand px-3 py-1.5 text-xs text-clay sm:text-sm"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleAddRelation}
                className="rounded bg-clay px-3 py-1.5 text-xs text-white sm:text-sm"
              >
                추가
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* 미리보기 다이얼로그 */}
      <Dialog.Root open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
            <Dialog.Title className="text-sm font-semibold text-clay">템플릿 미리보기</Dialog.Title>

            <div className="mt-4 flex flex-col gap-3">
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-xs text-clay/80">변수 (JSON)</span>
                <textarea
                  value={previewVars}
                  onChange={(e) => setPreviewVars(e.target.value)}
                  className="rounded border border-sand px-3 py-2 text-xs font-mono"
                  rows={3}
                  placeholder={'{"diary_date": "2026-04-09", "title": "테스트"}'}
                />
              </label>

              <button
                type="button"
                onClick={handlePreview}
                className="self-start rounded bg-clay px-3 py-1.5 text-xs text-white sm:text-sm"
              >
                렌더링
              </button>

              {previewError && (
                <div className="rounded border border-blush/50 bg-blush/20 px-3 py-2 text-xs text-clay">
                  {previewError}
                </div>
              )}

              {previewResult != null && (
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-medium text-clay/70">렌더링 결과</span>
                  <pre className="max-h-64 overflow-auto rounded border border-sand/60 bg-linen p-3 text-xs text-clay whitespace-pre-wrap break-all">
                    {previewResult}
                  </pre>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="rounded border border-sand px-3 py-1.5 text-xs text-clay sm:text-sm"
              >
                닫기
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Fragment 연결 삭제 확인 */}
      <Dialog.Root
        open={confirmDeleteRelId != null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteRelId(null); }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
            <Dialog.Title className="text-sm font-semibold text-clay">Fragment 연결 삭제</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-clay/80">
              이 Fragment 연결을 삭제하시겠습니까?
            </Dialog.Description>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteRelId(null)}
                className="rounded border border-sand px-3 py-1.5 text-xs text-clay sm:text-sm"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteRelId != null && handleDeleteRelation(confirmDeleteRelId)}
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

export default AdminAiTemplatePage;
