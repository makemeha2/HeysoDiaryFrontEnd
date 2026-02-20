import React, { useMemo, useState } from 'react';

const sections = [
  { id: 'profile', label: '프로필' },
  { id: 'diary', label: '일기 설정' },
  { id: 'security', label: '보안 & 데이터' },
  { id: 'stats', label: '통계' },
  { id: 'account', label: '계정 관리' },
];

const mbtiOptions = [
  {
    type: 'INTJ',
    description: '깊이 생각하고 멀리 보는 전략가로, 감정보다 방향과 의미를 중요하게 여깁니다.',
  },
  {
    type: 'INTP',
    description: '아이디어를 분석하고 구조화하는 탐구가로, 혼자 몰입해 사고를 확장하는 편입니다.',
  },
  {
    type: 'ENTJ',
    description: '목표를 분명히 세우고 추진하는 지휘관으로, 효율과 성장을 중심에 둡니다.',
  },
  {
    type: 'ENTP',
    description: '새로운 가능성을 빠르게 발견하는 발명가로, 토론과 실험을 즐깁니다.',
  },
  {
    type: 'INFJ',
    description: '사람의 마음과 흐름을 섬세하게 읽는 조언가로, 진정성 있는 연결을 중시합니다.',
  },
  {
    type: 'INFP',
    description: '내면의 가치와 감정을 소중히 여기는 중재자로, 의미 있는 삶을 추구합니다.',
  },
  {
    type: 'ENFJ',
    description: '사람을 이끌고 응원하는 지도자로, 관계의 성장과 조화를 중요하게 여깁니다.',
  },
  {
    type: 'ENFP',
    description: '열정과 호기심이 풍부한 활동가로, 새로운 사람과 경험에서 에너지를 얻습니다.',
  },
  {
    type: 'ISTJ',
    description: '원칙과 책임을 중시하는 관리자형으로, 약속과 기준을 꾸준히 지켜냅니다.',
  },
  {
    type: 'ISFJ',
    description: '세심하게 돌보고 배려하는 수호자로, 안정적인 관계와 실질적 도움을 선호합니다.',
  },
  {
    type: 'ESTJ',
    description: '현실적인 기준으로 실행을 이끄는 관리자형으로, 체계와 결과를 중요하게 봅니다.',
  },
  {
    type: 'ESFJ',
    description: '따뜻한 분위기를 만드는 협력가로, 주변 사람의 만족과 조화를 챙깁니다.',
  },
  {
    type: 'ISTP',
    description: '문제를 빠르게 파악해 해결하는 장인형으로, 유연하고 실용적인 판단을 합니다.',
  },
  {
    type: 'ISFP',
    description: '조용하지만 감각이 풍부한 예술가형으로, 자신의 리듬과 취향을 소중히 여깁니다.',
  },
  {
    type: 'ESTP',
    description: '순간의 기회를 잘 포착하는 사업가형으로, 행동과 경험 속에서 배우는 편입니다.',
  },
  {
    type: 'ESFP',
    description: '밝은 에너지로 분위기를 살리는 연예인형으로, 현재를 즐기며 사람들과 어울립니다.',
  },
];

const mockStats = {
  totalEntries: 148,
  streakDays: 21,
  topTags: ['감사', '성장', '루틴', '여행', '관계'],
  personalityInsight:
    '최근 기록에서 감정 표현은 차분하지만, 목표에 대한 집요함이 강하게 드러납니다. 새로운 도전을 즐기며, 성찰형 피드백이 잘 맞는 편입니다.',
};

function SectionCard({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-sand/40 bg-white/70 p-6 shadow-soft backdrop-blur">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-clay">{title}</h3>
        {description ? <p className="mt-1 text-sm text-clay/60">{description}</p> : null}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Toggle({ id, label, description, checked, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <label htmlFor={id} className="text-sm font-medium text-clay/80">
          {label}
        </label>
        {description ? <p className="mt-1 text-xs text-clay/60">{description}</p> : null}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40 focus-visible:ring-offset-2 ${
          checked ? 'border-amber bg-amber' : 'border-sand/40 bg-white/70'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition ${
            checked ? 'translate-x-5' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

function RadioGroup({ name, label, options, value, onChange, direction = 'row' }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-clay/80">{label}</legend>
      <div
        className={`flex flex-wrap gap-3 ${
          direction === 'column' ? 'flex-col items-start' : 'items-center'
        }`}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-sand/40 bg-white/80 px-3 py-2 text-sm text-clay/80 shadow-sm transition hover:border-amber hover:bg-amber/10"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="h-4 w-4 text-amber focus:ring-amber/40"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SelectField({ id, label, value, options, onChange }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-clay/80">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-sand/40 bg-white/90 px-4 py-2 text-sm text-clay/90 shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function MbtiCardPicker({ value, onChange, options }) {
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-clay/80">MBTI</legend>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {options.map((option) => {
          const selected = value === option.type;
          return (
            <button
              key={option.type}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${option.type} 선택`}
              onClick={() => onChange(option.type)}
              className={`group relative h-28 rounded-xl text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40 ${
                selected ? 'ring-2 ring-amber ring-offset-2 ring-offset-linen/60' : ''
              }`}
            >
              <span className="pointer-events-none absolute inset-0 block [perspective:1200px]">
                <span className="relative block h-full w-full rounded-xl transition-transform duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                  <span
                    className={`absolute inset-0 flex items-center justify-center rounded-xl border bg-white/90 text-lg font-semibold tracking-wide text-clay shadow-soft [backface-visibility:hidden] ${
                      selected ? 'border-amber/70' : 'border-sand/40'
                    }`}
                  >
                    {option.type}
                  </span>
                  <span
                    className={`absolute inset-0 rounded-xl border bg-amber/10 p-3 text-xs leading-relaxed text-clay [backface-visibility:hidden] [transform:rotateY(180deg)] ${
                      selected ? 'border-amber/70' : 'border-amber/30'
                    }`}
                  >
                    <span className="mb-1 block text-sm font-semibold text-amber">
                      {option.type}
                    </span>
                    <span>{option.description}</span>
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function TextField({ id, label, value, onChange, placeholder }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm font-medium text-clay/80">
        {label}
      </label>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-sand/40 bg-white/90 px-4 py-2 text-sm text-clay/90 shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40"
      />
    </div>
  );
}

function StatCard({ title, value, description }) {
  return (
    <div className="rounded-2xl border border-sand/40 bg-white/70 p-4 shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-wide text-clay/40">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-clay">{value}</p>
      {description ? <p className="mt-2 text-xs text-clay/60">{description}</p> : null}
    </div>
  );
}

export default function MyPageSample() {
  const [activeSection, setActiveSection] = useState('profile');
  const [profile, setProfile] = useState({
    nickname: 'Heyso',
    mbti: 'INFJ',
    thumbnailFile: null,
    thumbnailPreview: '',
  });
  const [diary, setDiary] = useState({
    aiTone: 'empathetic',
    feedbackStrength: 'empathy',
    defaultLanguage: 'kr',
    aiCommentMode: 'follow',
    fixedLanguage: 'kr',
  });
  const [security, setSecurity] = useState({
    storageLocation: 'local',
    autoBackup: 'weekly',
    encryptBackup: true,
  });
  const [account, setAccount] = useState({
    withdrawAgree: false,
  });

  const currentSectionLabel = useMemo(
    () => sections.find((section) => section.id === activeSection)?.label,
    [activeSection],
  );

  const handleThumbnailChange = (event) => {
    const [file] = event.target.files || [];
    if (!file) return;

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

  const handleSaveSection = () => {
    const payload = {
      profile,
      diary,
      security,
      stats: mockStats,
      account,
    };
    console.log(`[${currentSectionLabel}] 저장`, payload[activeSection]);
  };

  const handleSaveAll = () => {
    console.log('[전체 저장]', {
      profile,
      diary,
      security,
      stats: mockStats,
      account,
    });
  };

  const handleExport = (type) => {
    alert(`${type} 다운로드를 시작합니다.`);
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
                  {currentSectionLabel}
                </p>
                <h1 className="mt-1 text-2xl font-semibold text-clay">
                  설정을 관리하세요 (준비중입니다)
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveSection}
                  className="rounded-full border border-amber px-5 py-2 text-sm font-semibold text-amber transition hover:bg-amber/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40"
                >
                  현재 섹션 저장
                </button>
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="rounded-full bg-amber px-5 py-2 text-sm font-semibold text-white shadow-soft transition hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40"
                >
                  전체 저장
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
                      label="닉네임"
                      value={profile.nickname}
                      onChange={(value) => setProfile((prev) => ({ ...prev, nickname: value }))}
                      placeholder="예: Heyso"
                    />
                  </SectionCard>

                  <SectionCard
                    title="Thumbnail (프로필 이미지)"
                    description="업로드한 이미지는 미리보기로만 저장됩니다."
                  >
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
                        <label htmlFor="thumbnail" className="text-sm font-medium text-clay/80">
                          이미지 업로드
                        </label>
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

              {activeSection === 'diary' && (
                <>
                  <SectionCard
                    title="AI 말투 설정"
                    description="일기 피드백의 톤과 강도를 선택하세요."
                  >
                    <RadioGroup
                      name="aiTone"
                      label="AI 말투"
                      value={diary.aiTone}
                      onChange={(value) => setDiary((prev) => ({ ...prev, aiTone: value }))}
                      options={[
                        { label: '공감형', value: 'empathetic' },
                        { label: '분석형', value: 'analytic' },
                        { label: '친구같은 말투', value: 'friendly' },
                        { label: '잔소리형', value: 'nagging' },
                      ]}
                    />
                    <RadioGroup
                      name="feedbackStrength"
                      label="피드백 강도"
                      value={diary.feedbackStrength}
                      onChange={(value) =>
                        setDiary((prev) => ({ ...prev, feedbackStrength: value }))
                      }
                      options={[
                        { label: '공감', value: 'empathy' },
                        { label: '조언', value: 'advice' },
                        { label: '팩트폭격', value: 'facts' },
                      ]}
                    />
                  </SectionCard>

                  <SectionCard
                    title="기본 일기 언어"
                    description="일기 작성 시 기본 언어를 설정합니다."
                  >
                    <RadioGroup
                      name="defaultLanguage"
                      label="언어 선택"
                      value={diary.defaultLanguage}
                      onChange={(value) =>
                        setDiary((prev) => ({ ...prev, defaultLanguage: value }))
                      }
                      options={[
                        { label: '한국어', value: 'kr' },
                        { label: '영어', value: 'en' },
                        { label: '언어감지', value: 'mix' },
                      ]}
                    />
                  </SectionCard>

                  <SectionCard
                    title="AI 댓글 언어"
                    description="AI 댓글 언어가 일기 언어를 따라갈지, 고정 언어를 사용할지 결정합니다."
                  >
                    <RadioGroup
                      name="aiCommentMode"
                      label="언어 모드"
                      value={diary.aiCommentMode}
                      onChange={(value) => setDiary((prev) => ({ ...prev, aiCommentMode: value }))}
                      options={[
                        { label: '일기 언어 따라가기', value: 'follow' },
                        { label: '고정언어', value: 'fixed' },
                      ]}
                    />
                    {diary.aiCommentMode === 'fixed' && (
                      <SelectField
                        id="fixedLanguage"
                        label="고정 언어 선택"
                        value={diary.fixedLanguage}
                        options={[
                          { label: '한국어', value: 'kr' },
                          { label: '영어', value: 'en' },
                        ]}
                        onChange={(value) =>
                          setDiary((prev) => ({ ...prev, fixedLanguage: value }))
                        }
                      />
                    )}
                  </SectionCard>
                </>
              )}

              {activeSection === 'security' && (
                <>
                  <SectionCard
                    title="데이터 저장 위치"
                    description="데이터 보관 정책을 선택하세요."
                  >
                    <RadioGroup
                      name="storageLocation"
                      label="저장 위치"
                      value={security.storageLocation}
                      onChange={(value) =>
                        setSecurity((prev) => ({ ...prev, storageLocation: value }))
                      }
                      options={[
                        { label: '로컬 우선', value: 'local' },
                        { label: '서버 백업 사용', value: 'server' },
                      ]}
                    />
                  </SectionCard>

                  <SectionCard
                    title="자동 백업 설정"
                    description="원하는 주기에 맞춰 백업을 설정하세요."
                  >
                    <SelectField
                      id="autoBackup"
                      label="백업 주기"
                      value={security.autoBackup}
                      options={[
                        { label: '끔', value: 'off' },
                        { label: '매일', value: 'daily' },
                        { label: '매주', value: 'weekly' },
                        { label: '매월', value: 'monthly' },
                      ]}
                      onChange={(value) => setSecurity((prev) => ({ ...prev, autoBackup: value }))}
                    />
                  </SectionCard>

                  <SectionCard
                    title="백업 데이터 암호화"
                    description="암호화를 켜면 백업 파일이 안전하게 보호됩니다."
                  >
                    <Toggle
                      id="encryptBackup"
                      label="백업 데이터 암호화"
                      description="민감한 데이터 보호를 위해 암호화를 활성화하세요."
                      checked={security.encryptBackup}
                      onChange={(value) =>
                        setSecurity((prev) => ({ ...prev, encryptBackup: value }))
                      }
                    />
                  </SectionCard>

                  <SectionCard
                    title="내 데이터 내보내기"
                    description="원하는 형식으로 데이터를 다운로드합니다."
                  >
                    <div className="flex flex-wrap gap-3">
                      {[
                        { label: 'JSON', value: 'JSON' },
                        { label: 'Markdown', value: 'Markdown' },
                        { label: 'PDF', value: 'PDF' },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => handleExport(item.value)}
                          className="rounded-full border border-sand/40 px-5 py-2 text-sm font-semibold text-clay/70 transition hover:border-amber hover:text-amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40"
                        >
                          {item.label} 내보내기
                        </button>
                      ))}
                    </div>
                  </SectionCard>
                </>
              )}

              {activeSection === 'stats' && (
                <>
                  <SectionCard title="기록 통계" description="내 기록의 패턴을 한눈에 확인하세요.">
                    <div className="grid gap-4 md:grid-cols-2">
                      <StatCard
                        title="총 일기 개수"
                        value={`${mockStats.totalEntries}개`}
                        description="이번 달 기준 누적 기록"
                      />
                      <StatCard
                        title="연속 작성 일수"
                        value={`${mockStats.streakDays}일`}
                        description="연속 작성이 이어지는 중"
                      />
                    </div>
                  </SectionCard>

                  <SectionCard
                    title="가장 많이 쓴 태그 TOP 5"
                    description="최근 3개월 사용 빈도 기준"
                  >
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {mockStats.topTags.map((tag, index) => (
                        <li
                          key={tag}
                          className="flex items-center justify-between rounded-2xl border border-sand/40 bg-white/80 px-4 py-3 text-sm text-clay/70 shadow-soft"
                        >
                          <span className="font-medium text-clay">#{tag}</span>
                          <span className="text-xs text-clay/40">TOP {index + 1}</span>
                        </li>
                      ))}
                    </ul>
                  </SectionCard>

                  <SectionCard
                    title="일기로 본 나의 성격 분석"
                    description="AI가 요약한 성향 분석입니다."
                  >
                    <div className="rounded-2xl border border-amber/30 bg-amber/10 px-5 py-4 text-sm text-clay/90">
                      {mockStats.personalityInsight}
                    </div>
                    <button
                      type="button"
                      className="w-fit rounded-full border border-amber px-4 py-2 text-sm font-semibold text-amber transition hover:bg-amber/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/40"
                    >
                      더보기
                    </button>
                  </SectionCard>
                </>
              )}

              {activeSection === 'account' && (
                <SectionCard title="회원탈퇴" description="탈퇴 시 데이터가 영구적으로 삭제됩니다.">
                  <div className="space-y-4 rounded-2xl border border-red-300 bg-red-50 p-5">
                    <p className="text-sm text-red-700">
                      탈퇴하면 복구가 불가능합니다. 중요한 데이터는 미리 내보내기 해주세요.
                    </p>
                    <label className="flex items-center gap-2 text-sm text-red-700">
                      <input
                        type="checkbox"
                        checked={account.withdrawAgree}
                        onChange={(event) =>
                          setAccount((prev) => ({
                            ...prev,
                            withdrawAgree: event.target.checked,
                          }))
                        }
                        className="h-4 w-4 rounded border-red-300 text-red-500 focus:ring-red-400"
                      />
                      모든 내용을 확인했고, 탈퇴에 동의합니다.
                    </label>
                    <button
                      type="button"
                      disabled={!account.withdrawAgree}
                      className={`w-full rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${
                        account.withdrawAgree
                          ? 'bg-red-500 text-white hover:bg-red-600'
                          : 'cursor-not-allowed bg-red-200 text-red-400'
                      }`}
                    >
                      계정 탈퇴하기
                    </button>
                  </div>
                </SectionCard>
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
