import { useState } from 'react';
import { Button } from '@/components/ui/button';
import ProfileSection from './ProfileSection';
import DiaryPrefsSection from './DiaryPrefsSection';
import SecuritySection from './SecuritySection';
import AccountSection from './AccountSection';

type SectionId = 'profile' | 'diary' | 'security' | 'account';

const sections: Array<{ id: SectionId; label: string }> = [
  { id: 'profile', label: '프로필' },
  { id: 'diary', label: '일기 설정' },
  { id: 'security', label: '보안 & 데이터' },
  { id: 'account', label: '계정 관리' },
];

export default function SettingsPanel() {
  const [active, setActive] = useState<SectionId>('profile');

  return (
    <section className="min-w-0 flex-1 overflow-y-auto px-5 py-5">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-2xl font-semibold">설정</h1>
        <div className="mt-5 flex flex-wrap gap-2">
          {sections.map((section) => (
            <Button
              key={section.id}
              variant={active === section.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActive(section.id)}
            >
              {section.label}
            </Button>
          ))}
        </div>
        <div className="mt-6 rounded-lg border border-border bg-card p-5">
          {active === 'profile' ? <ProfileSection active={active === 'profile'} /> : null}
          {active === 'diary' ? <DiaryPrefsSection active={active === 'diary'} /> : null}
          {active === 'security' ? <SecuritySection /> : null}
          {active === 'account' ? <AccountSection active={active === 'account'} /> : null}
        </div>
      </div>
    </section>
  );
}
