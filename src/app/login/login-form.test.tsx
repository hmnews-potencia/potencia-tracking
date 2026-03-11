import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LoginForm } from './login-form';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

// Mock supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: vi.fn(),
    },
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe('LoginForm', () => {
  it('should render email input', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('should render password input', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Senha')).toBeInTheDocument();
  });

  it('should render submit button with "Entrar" text', () => {
    render(<LoginForm />);
    expect(
      screen.getByRole('button', { name: 'Entrar' }),
    ).toBeInTheDocument();
  });

  it('should render "Potencia Tracking" heading', () => {
    render(<LoginForm />);
    expect(
      screen.getByRole('heading', { name: 'Potencia Tracking' }),
    ).toBeInTheDocument();
  });

  it('should render password visibility toggle', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Mostrar senha')).toBeInTheDocument();
  });

  it('should render footer with copyright', () => {
    render(<LoginForm />);
    expect(screen.getByText(/Potencia Educacao/)).toBeInTheDocument();
    expect(screen.getByText(/2026/)).toBeInTheDocument();
  });

  it('should have email input with type="email"', () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('should have password input with type="password" by default', () => {
    render(<LoginForm />);
    const passwordInput = screen.getByLabelText('Senha');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should have required attribute on both inputs', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText('Email')).toBeRequired();
    expect(screen.getByLabelText('Senha')).toBeRequired();
  });
});
