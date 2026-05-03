import { useState } from 'react';
import { ArrowLeft, FileText, Shield, User, UserX } from 'lucide-react';
import { cn } from '@/lib/utils';
import ProfileSection from './ProfileSection';
import DiaryPrefsSection from './DiaryPrefsSection';
import SecuritySection from './SecuritySection';
import AccountSection from './AccountSection';

type SectionId = 'profile' | 'diary' | 'security' | 'account';

const sections: Array<{ id: SectionId; label: string; icon: React.ReactNode }> = [
  { id: 'profile', label: '프로필', icon: <User className="h-4 w-4" /> },
  { id: 'diary', label: '일기 설정', icon: <FileText className="h-4 w-4" /> },
  { id: 'security', label: '보안 & 데이터', icon: <Shield className="h-4 w-4" /> },
  { id: 'account', label: '계정 관리', icon: <UserX className="h-4 w-4" /> },
];

type Props = {
  onClose: () => void;
};

export default function SettingsPanel({ onClose }: Props) {
  const [active, setActive] = useState<SectionId>('profile');
  const activeLabel = sections.find((section) => section.id === active)?.label ?? '설정';

  return (
    <section className="flex h-full flex-col overflow-hidden bg-background">
      <header className="flex flex-shrink-0 items-center gap-3 border-b border-border/60 px-6 py-4">
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="설정 닫기"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h2 className="text-lg font-semibold text-foreground">설정</h2>
      </header>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
        <aside className="hidden w-48 flex-shrink-0 border-r border-border/60 py-4 md:block">
          <nav className="space-y-1 px-3" aria-label="설정 메뉴">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActive(section.id)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                  active === section.id
                    ? 'bg-primary/10 font-medium text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="flex-shrink-0 overflow-x-auto border-b border-border/60 px-4 py-2 md:hidden">
          <div className="flex gap-2">
            {sections.map((section) => (
              <button
                key={section.id}
                type="button"
                onClick={() => setActive(section.id)}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                  active === section.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                )}
              >
                {section.icon}
                {section.label}
              </button>
            ))}
          </div>
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto p-6">
          <div className="max-w-2xl">
            <h3 className="mb-6 text-base font-semibold text-foreground">{activeLabel}</h3>
            {active === 'profile' ? <ProfileSection active /> : null}
            {active === 'diary' ? <DiaryPrefsSection active /> : null}
            {active === 'security' ? <SecuritySection /> : null}
            {active === 'account' ? <AccountSection active /> : null}
          </div>
        </main>
      </div>
    </section>
  );
}
