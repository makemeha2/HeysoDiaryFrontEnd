import React, { useMemo, useState } from 'react';

import ProfileSection from '@pages/MyPage/sections/ProfileSection.jsx';
import { useProfileSection } from '@pages/MyPage/hooks/useProfileSection.jsx';

import { useAlertDialog } from '@components/useAlertDialog.jsx';

const MyPage = () => {
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

  const { profile, setProfile, mbtiOptions, handleThumbnailChange, saveProfile, isSavingProfile } =
    useProfileSection({ alert });

  const currentSectionLabel = useMemo(
    () => sections.find((section) => section.id === activeSection)?.label,
    [activeSection],
  );

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
                  onClick={saveProfile}
                  disabled={isSavingProfile}
                  className="rounded-full bg-amber px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40"
                >
                  {isSavingProfile ? '저장 중...' : '전체 저장'}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {activeSection === 'profile' && (
                <ProfileSection
                  profile={profile}
                  setProfile={setProfile}
                  mbtiOptions={mbtiOptions}
                  onThumbnailChange={handleThumbnailChange}
                />
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
