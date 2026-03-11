import { create } from 'zustand';

interface ProjectState {
  activeProjectId: string | null;
  setActiveProject: (id: string) => void;
  clearActiveProject: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  activeProjectId: null,
  setActiveProject: (id: string) => {
    document.cookie = `active-project=${id};path=/;max-age=${60 * 60 * 24 * 365};samesite=lax`;
    set({ activeProjectId: id });
  },
  clearActiveProject: () => {
    document.cookie = 'active-project=;path=/;max-age=0';
    set({ activeProjectId: null });
  },
}));
