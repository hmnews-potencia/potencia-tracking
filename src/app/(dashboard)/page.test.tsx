import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DashboardPage from './page';

describe('DashboardPage', () => {
  it('should render dashboard heading', () => {
    render(<DashboardPage />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render dashboard description', () => {
    render(<DashboardPage />);

    expect(
      screen.getByText(/Visao geral do tracking do projeto ativo/),
    ).toBeInTheDocument();
  });
});
