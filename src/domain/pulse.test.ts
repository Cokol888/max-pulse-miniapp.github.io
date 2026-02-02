import { describe, expect, it } from 'vitest';
import { parseStartParam } from './pulse';

describe('parseStartParam', () => {
  it('parses daily mode', () => {
    const context = parseStartParam('daily_today');
    expect(context.mode).toBe('daily');
    expect(context.label).toBe('Daily check-in');
  });

  it('parses retro and incident details', () => {
    const retro = parseStartParam('retro_sprint12');
    const incident = parseStartParam('incident_INC-481');

    expect(retro.mode).toBe('retro');
    expect(retro.details).toBe('sprint12');
    expect(incident.mode).toBe('incident');
    expect(incident.details).toBe('INC-481');
  });
});
