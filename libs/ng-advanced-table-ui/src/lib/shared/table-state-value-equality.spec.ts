import { hasNatTableStateValueChanged } from './table-state-value-equality';

class FilterToken {
  public readonly value = 'same';
}

describe('table state value equality', () => {
  it('compares non-JSON table state values without stringifying them', () => {
    expect(hasNatTableStateValueChanged([{ id: 'status', value: 1n }], [{ id: 'status', value: 1n }])).toBe(false);
    expect(
      hasNatTableStateValueChanged([{ id: 'status', value: new Set(['Healthy']) }], [{ id: 'status', value: new Set(['Healthy']) }])
    ).toBe(false);
    expect(hasNatTableStateValueChanged([{ id: 'status', value: 1n }], [{ id: 'status', value: 2n }])).toBe(true);
    expect(
      hasNatTableStateValueChanged([{ id: 'status', value: new Set(['Healthy']) }], [{ id: 'status', value: new Set(['Alert']) }])
    ).toBe(true);
    expect(
      hasNatTableStateValueChanged([{ id: 'status', value: new FilterToken() }], [{ id: 'status', value: new FilterToken() }])
    ).toBe(true);
  });
});
