import AccountSection from './AccountSection.jsx';
import DiaryPrefsSection from './DiaryPrefsSection.jsx';
import SecuritySection from './SecuritySection.jsx';
import ThemeSection from './ThemeSection.jsx';

const SettingsPanel = () => (
  <div className="mx-auto max-w-4xl space-y-4 px-4 py-6 md:px-8">
    <ThemeSection />
    <DiaryPrefsSection />
    <SecuritySection />
    <AccountSection />
  </div>
);

export default SettingsPanel;

