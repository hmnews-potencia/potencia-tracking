import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AppSidebar } from './app-sidebar';

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}));

describe('AppSidebar', () => {
  it('should render all nav items', () => {
    render(<AppSidebar />);

    expect(screen.getAllByText('Dashboard')).toHaveLength(2); // desktop + mobile
    expect(screen.getAllByText('Links')).toHaveLength(2);
    expect(screen.getAllByText('Conversões')).toHaveLength(2);
    expect(screen.getAllByText('Projetos')).toHaveLength(2);
    expect(screen.getAllByText('Configuracoes')).toHaveLength(2);
  });

  it('should link Conversões to /conversions', () => {
    render(<AppSidebar />);

    const conversionsLinks = screen.getAllByText('Conversões');
    conversionsLinks.forEach((link) => {
      expect(link.closest('a')).toHaveAttribute('href', '/conversions');
    });
  });

  it('should highlight active Dashboard link on root path', () => {
    render(<AppSidebar />);

    // Desktop sidebar: find the first Dashboard link in the aside
    const aside = document.querySelector('aside');
    const dashboardLink = aside?.querySelector('a[href="/"]');
    expect(dashboardLink?.className).toContain('bg-zinc-800');
  });
});
