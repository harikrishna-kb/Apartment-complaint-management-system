import { describe, it, expect } from 'vitest';
import { isRestrictedInspectKey } from './security';

describe('Security Client-Side Protection Suite', () => {
  it('detects F12 devtools shortcut', () => {
    expect(isRestrictedInspectKey('F12')).toBe(true);
    expect(isRestrictedInspectKey('', { keyCode: 123 })).toBe(true);
  });

  it('detects Ctrl+Shift+I inspect element shortcut', () => {
    expect(isRestrictedInspectKey('I', { ctrlKey: true, shiftKey: true })).toBe(true);
    expect(isRestrictedInspectKey('i', { ctrlKey: true, shiftKey: true })).toBe(true);
  });

  it('detects Cmd+Option/Shift+I on macOS', () => {
    expect(isRestrictedInspectKey('I', { metaKey: true, shiftKey: true })).toBe(true);
  });

  it('detects Ctrl+Shift+J (Console) and Ctrl+Shift+C (Inspect Element)', () => {
    expect(isRestrictedInspectKey('J', { ctrlKey: true, shiftKey: true })).toBe(true);
    expect(isRestrictedInspectKey('C', { ctrlKey: true, shiftKey: true })).toBe(true);
  });

  it('detects Ctrl+U view page source shortcut', () => {
    expect(isRestrictedInspectKey('u', { ctrlKey: true })).toBe(true);
    expect(isRestrictedInspectKey('U', { ctrlKey: true })).toBe(true);
    expect(isRestrictedInspectKey('', { ctrlKey: true, keyCode: 85 })).toBe(true);
  });

  it('permits harmless keys like letters, numbers, and normal shortcuts', () => {
    expect(isRestrictedInspectKey('a')).toBe(false);
    expect(isRestrictedInspectKey('Enter')).toBe(false);
    expect(isRestrictedInspectKey('c', { ctrlKey: true })).toBe(false); // standard copy
    expect(isRestrictedInspectKey('v', { ctrlKey: true })).toBe(false); // standard paste
  });
});
