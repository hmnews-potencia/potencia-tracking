import { describe, it, expect, beforeEach } from 'vitest';
import { useProjectStore } from './project-store';

// Mock document.cookie
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
});

describe('useProjectStore', () => {
  beforeEach(() => {
    useProjectStore.setState({ activeProjectId: null });
    document.cookie = '';
  });

  it('should start with null activeProjectId', () => {
    const state = useProjectStore.getState();
    expect(state.activeProjectId).toBeNull();
  });

  it('should set active project and persist to cookie', () => {
    const { setActiveProject } = useProjectStore.getState();
    setActiveProject('test-uuid-123');

    const state = useProjectStore.getState();
    expect(state.activeProjectId).toBe('test-uuid-123');
    expect(document.cookie).toContain('active-project=test-uuid-123');
  });

  it('should clear active project and remove cookie', () => {
    const { setActiveProject, clearActiveProject } = useProjectStore.getState();
    setActiveProject('test-uuid-123');
    clearActiveProject();

    const state = useProjectStore.getState();
    expect(state.activeProjectId).toBeNull();
    expect(document.cookie).toContain('max-age=0');
  });

  it('should update when setting a different project', () => {
    const { setActiveProject } = useProjectStore.getState();
    setActiveProject('project-1');
    expect(useProjectStore.getState().activeProjectId).toBe('project-1');

    setActiveProject('project-2');
    expect(useProjectStore.getState().activeProjectId).toBe('project-2');
  });
});
