import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/utils/render';
import Dashboard from '../Dashboard';

const mockStats = {
  totalQueries: 42,
  totalTitles: 128,
  topCategories: [{ name: 'Marketing', count: 10 }],
  topPlatforms: [{ name: 'linkedin', count: 20 }],
  dailyCounts: Array.from({ length: 30 }, (_, i) => ({ date: `03-${String(i + 1).padStart(2, '0')}`, count: i })),
  myQueries: 5,
  mySavedQueries: 3,
  loading: false,
  error: null,
};

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1' }, loading: false }),
}));

vi.mock('@/hooks/useDashboardStats', () => ({
  useDashboardStats: () => mockStats,
}));

// Mock recharts to avoid SVG rendering issues in jsdom
vi.mock('recharts', () => {
  const React = require('react');
  return {
    ResponsiveContainer: ({ children }: any) => <div data-testid="chart-container">{children}</div>,
    BarChart: ({ children }: any) => <div>{children}</div>,
    PieChart: ({ children }: any) => <div>{children}</div>,
    Bar: () => null,
    Pie: ({ children }: any) => <div>{children}</div>,
    Cell: () => null,
    XAxis: () => null,
    YAxis: () => null,
    CartesianGrid: () => null,
    Tooltip: () => null,
  };
});

describe('Dashboard', () => {
  it('renders 4 KPI stat cards with correct values', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('128')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders KPI labels', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText('Requêtes générées')).toBeInTheDocument();
    expect(screen.getByText('Titres utilisés')).toBeInTheDocument();
    expect(screen.getByText('Mes requêtes')).toBeInTheDocument();
    expect(screen.getByText('Mes sauvegardes')).toBeInTheDocument();
  });

  it('renders chart sections', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText('Activité (30 derniers jours)')).toBeInTheDocument();
    expect(screen.getByText('Catégories les plus utilisées')).toBeInTheDocument();
    expect(screen.getByText('Plateformes utilisées')).toBeInTheDocument();
  });

  it('renders back link to generator', () => {
    renderWithProviders(<Dashboard />);
    const link = screen.getByText('← Retour au générateur');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/');
  });

  it('renders platform badge with label', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText('LinkedIn')).toBeInTheDocument();
  });

  it('renders category legend', () => {
    renderWithProviders(<Dashboard />);
    expect(screen.getByText('Marketing')).toBeInTheDocument();
  });
});
