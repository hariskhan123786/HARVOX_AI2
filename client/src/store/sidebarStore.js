import { create } from 'zustand';

export const useSidebarStore = create((set) => ({
  isCollapsed: localStorage.getItem('sidebar_collapsed') === 'true',
  toggleCollapse: () => set((state) => {
    const next = !state.isCollapsed;
    localStorage.setItem('sidebar_collapsed', String(next));
    return { isCollapsed: next };
  }),
  setCollapsed: (val) => {
    localStorage.setItem('sidebar_collapsed', String(val));
    set({ isCollapsed: val });
  }
}));
