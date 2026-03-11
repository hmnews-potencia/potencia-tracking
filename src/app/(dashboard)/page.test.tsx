import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from './page';

describe('DashboardPage (empty state)', () => {
  it('should render empty state message', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Nenhum dado ainda')).toBeInTheDocument();
  });

  it('should render instructions text', () => {
    render(<DashboardPage />);

    expect(
      screen.getByText(/Crie links UTM e integre o script de tracking/),
    ).toBeInTheDocument();
  });
});
