import { useMemo, useState } from 'react';
import dayjs from 'dayjs';

export const useWorkspaceState = () => {
  const [selectedDate, setSelectedDate] = useState(() => dayjs().format('YYYY-MM-DD'));
  const [viewMode, setViewMode] = useState('diary');
  const [rightPanelMode, setRightPanelMode] = useState('hidden');
  const [sidebarTab, setSidebarTab] = useState('diary');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // TODO: Wire these width setters to draggable splitters in the follow-up UI polish PR.
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [rightPanelWidth, setRightPanelWidth] = useState(360);

  return useMemo(
    () => ({
      selectedDate,
      setSelectedDate,
      viewMode,
      setViewMode,
      rightPanelMode,
      setRightPanelMode,
      sidebarTab,
      setSidebarTab,
      sidebarOpen,
      setSidebarOpen,
      sidebarWidth,
      setSidebarWidth,
      rightPanelWidth,
      setRightPanelWidth,
    }),
    [rightPanelMode, rightPanelWidth, selectedDate, sidebarOpen, sidebarTab, sidebarWidth, viewMode],
  );
};
