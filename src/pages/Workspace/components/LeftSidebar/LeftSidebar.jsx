import { BookOpen, Search, Settings, X, BarChart3 } from 'lucide-react';

import DiaryTab from './DiaryTab.jsx';
import SearchTab from './SearchTab.jsx';
import SummaryTab from './SummaryTab.jsx';

const tabs = [
  { id: 'diary', label: 'Diary', icon: BookOpen },
  { id: 'summary', label: 'Summary', icon: BarChart3 },
  { id: 'search', label: 'Search', icon: Search },
];

const LeftSidebar = ({ state, diary, moodStorage }) => {
  const content = (
    <aside className="flex h-full flex-col border-r border-sand/60 bg-linen/95 p-4">
      <div className="mb-4 flex items-center justify-between">
        <strong className="text-lg text-clay">Heyso</strong>
        <button type="button" className="rounded-full p-2 hover:bg-white md:hidden" onClick={() => state.setSidebarOpen(false)} aria-label="닫기">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="mb-5 grid grid-cols-3 gap-1 rounded-full bg-white/60 p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              className={`flex items-center justify-center rounded-full py-2 text-xs font-semibold ${
                state.sidebarTab === tab.id ? 'bg-amber text-white' : 'text-clay/65'
              }`}
              onClick={() => state.setSidebarTab(tab.id)}
              aria-label={tab.label}
            >
              <Icon className="h-4 w-4" />
            </button>
          );
        })}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto pr-1">
        {state.sidebarTab === 'diary' && <DiaryTab state={state} diary={diary} moodStorage={moodStorage} />}
        {state.sidebarTab === 'summary' && <SummaryTab diary={diary} />}
        {state.sidebarTab === 'search' && <SearchTab state={state} diary={diary} />}
      </div>
      <button
        type="button"
        className="mt-4 inline-flex items-center gap-2 rounded-full border border-sand bg-white/70 px-4 py-2 text-sm font-semibold text-clay hover:bg-white"
        onClick={() => state.setViewMode('settings')}
      >
        <Settings className="h-4 w-4" />
        설정
      </button>
    </aside>
  );

  return (
    <>
      <div className="hidden shrink-0 md:block" style={{ width: state.sidebarWidth }}>
        {content}
      </div>
      {state.sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button type="button" className="absolute inset-0 bg-black/35" aria-label="사이드바 닫기" onClick={() => state.setSidebarOpen(false)} />
          <div className="relative h-full w-[min(86vw,340px)]">{content}</div>
        </div>
      )}
    </>
  );
};

export default LeftSidebar;

