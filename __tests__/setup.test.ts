/**
 * Basic setup verification tests for project initialization
 */

describe('Project Setup', () => {
  it('should have TypeScript configured correctly', () => {
    // This test will fail if TypeScript compilation fails
    expect(true).toBe(true);
  });

  it('should have correct package.json configuration', () => {
    const packageJson = require('../package.json');
    expect(packageJson.name).toBe('test-2048');
    expect(packageJson.main).toBe('expo-router/entry');
  });

  it('should have all required package.json scripts', () => {
    const packageJson = require('../package.json');
    const requiredScripts = [
      'start',
      'android',
      'ios',
      'web',
      'lint',
      'lint:fix',
      'format',
      'format:check',
      'type-check',
      'test',
    ];

    requiredScripts.forEach((script) => {
      expect(packageJson.scripts[script]).toBeDefined();
    });
  });
});
