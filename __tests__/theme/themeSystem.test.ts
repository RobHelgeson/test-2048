import { ClassicTheme } from '@/constants/themes/ClassicTheme';
import { CoolTheme } from '@/constants/themes/CoolTheme';
import { validateThemeAccessibility } from '@/utils/themeUtils';

describe('Theme System', () => {
  describe('Classic Theme', () => {
    it('should have valid structure', () => {
      expect(ClassicTheme).toBeDefined();
      expect(ClassicTheme.type).toBe('classic');
      expect(ClassicTheme.name).toBe('Classic');
      expect(ClassicTheme.tokens).toBeDefined();
      expect(ClassicTheme.tokens.colors).toBeDefined();
    });

    it('should have all required tile colors', () => {
      const { colors } = ClassicTheme.tokens;

      expect(colors.tile2).toBeDefined();
      expect(colors.tile4).toBeDefined();
      expect(colors.tile8).toBeDefined();
      expect(colors.tile16).toBeDefined();
      expect(colors.tile32).toBeDefined();
      expect(colors.tile64).toBeDefined();
      expect(colors.tile128).toBeDefined();
      expect(colors.tile256).toBeDefined();
      expect(colors.tile512).toBeDefined();
      expect(colors.tile1024).toBeDefined();
      expect(colors.tile2048).toBeDefined();
      expect(colors.tileSuper).toBeDefined();
    });

    it('should have accessibility compliant colors', () => {
      const validations = validateThemeAccessibility(
        ClassicTheme.tokens.colors
      );
      const failures = validations.filter((v) => !v.result.passes);

      // Log any failures for debugging
      if (failures.length > 0) {
        console.warn('Classic theme accessibility failures:', failures);
      }

      // Should have mostly passing contrast ratios
      const passRate =
        (validations.length - failures.length) / validations.length;
      expect(passRate).toBeGreaterThan(0.8); // At least 80% should pass
    });
  });

  describe('Cool Theme', () => {
    it('should have valid structure', () => {
      expect(CoolTheme).toBeDefined();
      expect(CoolTheme.type).toBe('cool');
      expect(CoolTheme.name).toBe('Cool');
      expect(CoolTheme.tokens).toBeDefined();
      expect(CoolTheme.tokens.colors).toBeDefined();
    });

    it('should have all required tile colors', () => {
      const { colors } = CoolTheme.tokens;

      expect(colors.tile2).toBeDefined();
      expect(colors.tile4).toBeDefined();
      expect(colors.tile8).toBeDefined();
      expect(colors.tile16).toBeDefined();
      expect(colors.tile32).toBeDefined();
      expect(colors.tile64).toBeDefined();
      expect(colors.tile128).toBeDefined();
      expect(colors.tile256).toBeDefined();
      expect(colors.tile512).toBeDefined();
      expect(colors.tile1024).toBeDefined();
      expect(colors.tile2048).toBeDefined();
      expect(colors.tileSuper).toBeDefined();
    });

    it('should have accessibility compliant colors', () => {
      const validations = validateThemeAccessibility(CoolTheme.tokens.colors);
      const failures = validations.filter((v) => !v.result.passes);

      // Log any failures for debugging
      if (failures.length > 0) {
        console.warn('Cool theme accessibility failures:', failures);
      }

      // Should have mostly passing contrast ratios
      const passRate =
        (validations.length - failures.length) / validations.length;
      expect(passRate).toBeGreaterThan(0.8); // At least 80% should pass
    });
  });

  describe('Theme Design Tokens', () => {
    it('should have consistent typography tokens', () => {
      expect(ClassicTheme.tokens.typography).toEqual(
        CoolTheme.tokens.typography
      );
    });

    it('should have consistent spacing tokens', () => {
      expect(ClassicTheme.tokens.spacing).toEqual(CoolTheme.tokens.spacing);
    });

    it('should have 8pt grid system', () => {
      const { spacing } = ClassicTheme.tokens;

      expect(spacing.sm).toBe(8); // Base unit
      expect(spacing.md).toBe(16); // 2x base
      expect(spacing.lg).toBe(24); // 3x base
      expect(spacing.xl).toBe(32); // 4x base
    });
  });
});
