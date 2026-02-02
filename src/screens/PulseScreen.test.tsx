import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import PulseScreen from './PulseScreen';

const createWebApp = (startParam: string) => ({
  ready: () => undefined,
  platform: 'web',
  version: 'test',
  initDataUnsafe: { start_param: startParam },
  enableClosingConfirmation: () => undefined,
  disableClosingConfirmation: () => undefined,
  HapticFeedback: { selectionChanged: () => undefined },
  openMaxLink: () => undefined,
  isMock: true,
});

describe('PulseScreen', () => {
  beforeEach(() => {
    window.WebApp = createWebApp('daily_today');
  });

  it('renders mode label from start_param', () => {
    render(<PulseScreen />);
    expect(screen.getByText(/Режим: Daily check-in/i)).toBeInTheDocument();
  });
});
