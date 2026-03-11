import { create } from 'zustand';

export type PeriodPreset = 'today' | '7d' | '30d' | '90d' | 'custom';

export interface FilterState {
  period: PeriodPreset;
  dateFrom: string;
  dateTo: string;
  source: string;
  medium: string;
  campaign: string;
}

interface FilterActions {
  setPeriod: (period: PeriodPreset) => void;
  setDateRange: (from: string, to: string) => void;
  setSource: (source: string) => void;
  setMedium: (medium: string) => void;
  setCampaign: (campaign: string) => void;
  resetFilters: () => void;
  activeFilterCount: () => number;
}

export function getDateRange(period: PeriodPreset): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split('T')[0];
  let from: string;

  switch (period) {
    case 'today':
      from = to;
      break;
    case '7d':
      from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case '30d':
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case '90d':
      from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case 'custom':
      from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
  }

  return { from, to };
}

const defaultRange = getDateRange('30d');

const defaultState: FilterState = {
  period: '30d',
  dateFrom: defaultRange.from,
  dateTo: defaultRange.to,
  source: '',
  medium: '',
  campaign: '',
};

export const useFilterStore = create<FilterState & FilterActions>((set, get) => ({
  ...defaultState,

  setPeriod: (period) => {
    const range = getDateRange(period);
    set({ period, dateFrom: range.from, dateTo: range.to });
  },

  setDateRange: (from, to) => {
    set({ period: 'custom', dateFrom: from, dateTo: to });
  },

  setSource: (source) => set({ source }),
  setMedium: (medium) => set({ medium }),
  setCampaign: (campaign) => set({ campaign }),

  resetFilters: () => {
    const range = getDateRange('30d');
    set({ ...defaultState, dateFrom: range.from, dateTo: range.to });
  },

  activeFilterCount: () => {
    const state = get();
    let count = 0;
    if (state.period !== '30d') count++;
    if (state.source) count++;
    if (state.medium) count++;
    if (state.campaign) count++;
    return count;
  },
}));
