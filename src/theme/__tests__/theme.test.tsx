/**
 * Theme System Tests
 *
 * Tests for createTheme(), useTheme(), getTheme(),
 * lightTheme/darkTheme presets, and theme provider context.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupTest, cleanupTest } from '../../__tests__/utils/test-utils';
import {
  createTheme,
  useTheme,
  getTheme,
  lightTheme,
  darkTheme,
  setThemeSignal,
  type Theme,
} from '../theme';

describe('Theme', () => {
  beforeEach(() => {
    setupTest();
  });

  afterEach(() => {
    cleanupTest();
  });

  describe('createTheme()', () => {
    it('should create theme with empty config', () => {
      const theme = createTheme({});
      
      expect(theme).toBeDefined();
      expect(theme.colors).toEqual({});
      expect(theme.fonts).toEqual({});
      expect(theme.spacing).toEqual({});
    });

    it('should create theme with colors config', () => {
      const theme = createTheme({
        colors: {
          primary: '#007aff',
          secondary: '#5856d6',
        },
      });
      
      expect(theme.colors?.primary).toBe('#007aff');
      expect(theme.colors?.secondary).toBe('#5856d6');
    });

    it('should create theme with fonts config', () => {
      const theme = createTheme({
        fonts: {
          regular: 'Arial.ttf',
          bold: 'Arial-Bold.ttf',
        },
      });
      
      expect(theme.fonts?.regular).toBe('Arial.ttf');
      expect(theme.fonts?.bold).toBe('Arial-Bold.ttf');
    });

    it('should create theme with spacing config', () => {
      const theme = createTheme({
        spacing: {
          sm: 8,
          md: 16,
          lg: 24,
        },
      });
      
      expect(theme.spacing?.sm).toBe(8);
      expect(theme.spacing?.md).toBe(16);
      expect(theme.spacing?.lg).toBe(24);
    });

    it('should create theme with all configs', () => {
      const theme = createTheme({
        colors: { primary: '#ff0000' },
        fonts: { regular: 'Test.ttf' },
        spacing: { xs: 4 },
      });
      
      expect(theme.colors?.primary).toBe('#ff0000');
      expect(theme.fonts?.regular).toBe('Test.ttf');
      expect(theme.spacing?.xs).toBe(4);
    });

    it('should preserve undefined configs as empty objects', () => {
      const theme = createTheme({
        colors: { primary: '#00ff00' },
      });
      
      expect(theme.colors?.primary).toBe('#00ff00');
      expect(theme.fonts).toEqual({});
      expect(theme.spacing).toEqual({});
    });
  });

  describe('lightTheme preset', () => {
    it('should have correct colors', () => {
      expect(lightTheme.colors?.background).toBe('#ffffff');
      expect(lightTheme.colors?.surface).toBe('#f5f5f5');
      expect(lightTheme.colors?.primary).toBe('#007aff');
      expect(lightTheme.colors?.text).toBe('#000000');
    });

    it('should have correct fonts', () => {
      expect(lightTheme.fonts?.regular).toBe('System.ttf');
      expect(lightTheme.fonts?.bold).toBe('System-Bold.ttf');
      expect(lightTheme.fonts?.mono).toBe('System-Mono.ttf');
    });

    it('should have correct spacing', () => {
      expect(lightTheme.spacing?.xs).toBe(4);
      expect(lightTheme.spacing?.sm).toBe(8);
      expect(lightTheme.spacing?.md).toBe(16);
      expect(lightTheme.spacing?.lg).toBe(24);
      expect(lightTheme.spacing?.xl).toBe(32);
    });
  });

  describe('darkTheme preset', () => {
    it('should have correct colors', () => {
      expect(darkTheme.colors?.background).toBe('#1c1c1e');
      expect(darkTheme.colors?.surface).toBe('#2c2c2e');
      expect(darkTheme.colors?.primary).toBe('#0a84ff');
      expect(darkTheme.colors?.text).toBe('#ffffff');
    });

    it('should have correct fonts', () => {
      expect(darkTheme.fonts?.regular).toBe('System.ttf');
      expect(darkTheme.fonts?.bold).toBe('System-Bold.ttf');
      expect(darkTheme.fonts?.mono).toBe('System-Mono.ttf');
    });

    it('should have correct spacing', () => {
      expect(darkTheme.spacing?.xs).toBe(4);
      expect(darkTheme.spacing?.sm).toBe(8);
      expect(darkTheme.spacing?.md).toBe(16);
      expect(darkTheme.spacing?.lg).toBe(24);
      expect(darkTheme.spacing?.xl).toBe(32);
    });
  });

  describe('useTheme() hook', () => {
    it('should return current theme', () => {
      const theme = useTheme();
      
      expect(theme).toBeDefined();
    });

    it('should return theme with undefined properties by default', () => {
      const theme = useTheme();
      
      expect(theme.colors).toBeUndefined();
      expect(theme.fonts).toBeUndefined();
      expect(theme.spacing).toBeUndefined();
    });

    it('should return updated theme after setThemeSignal', () => {
      const customTheme: Theme = {
        colors: { primary: '#custom' },
        fonts: { regular: 'Custom.ttf' },
        spacing: { md: 20 },
      };
      
      setThemeSignal(customTheme);
      const theme = useTheme();
      
      expect(theme.colors?.primary).toBe('#custom');
      expect(theme.fonts?.regular).toBe('Custom.ttf');
      expect(theme.spacing?.md).toBe(20);
    });
  });

  describe('getTheme() function', () => {
    it('should return current theme value', () => {
      const theme = getTheme();
      
      expect(theme).toBeDefined();
    });

    it('should return same value as useTheme()', () => {
      const themeFromHook = useTheme();
      const themeFromGetter = getTheme();
      
      expect(themeFromGetter).toEqual(themeFromHook);
    });
  });

  describe('theme signal state management', () => {
    it('should update theme globally', () => {
      const newTheme: Theme = {
        colors: { background: '#123456' },
      };
      
      setThemeSignal(newTheme);
      
      expect(getTheme().colors?.background).toBe('#123456');
      expect(useTheme().colors?.background).toBe('#123456');
    });

    it('should replace entire theme when updating', () => {
      setThemeSignal({
        colors: { primary: '#ff0000' },
        fonts: { regular: 'Font1.ttf' },
      });
      
      setThemeSignal({
        colors: { secondary: '#00ff00' },
        spacing: { md: 16 },
      });
      
      const theme = getTheme();
      expect(theme.colors?.secondary).toBe('#00ff00');
      expect(theme.colors?.primary).toBeUndefined();
      expect(theme.fonts).toBeUndefined();
      expect(theme.spacing?.md).toBe(16);
    });
  });
});
