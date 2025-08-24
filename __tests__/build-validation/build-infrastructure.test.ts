import { existsSync, readFileSync } from 'fs';
import * as path from 'path';

describe('Build Infrastructure Tests', () => {
  const projectRoot = path.resolve(__dirname, '../..');

  describe('Configuration Files', () => {
    test('should have app.config.ts file', () => {
      const configPath = path.join(projectRoot, 'app.config.ts');
      expect(existsSync(configPath)).toBe(true);
    });

    test('should have eas.json configuration', () => {
      const easPath = path.join(projectRoot, 'eas.json');
      expect(existsSync(easPath)).toBe(true);

      const easConfig = JSON.parse(readFileSync(easPath, 'utf8'));

      // Verify required build profiles
      expect(easConfig.build.development).toBeDefined();
      expect(easConfig.build.preview).toBeDefined();
      expect(easConfig.build.production).toBeDefined();

      // Verify development profile settings
      expect(easConfig.build.development.developmentClient).toBe(true);
      expect(easConfig.build.development.distribution).toBe('internal');
      expect(easConfig.build.development.channel).toBe('development');
    });

    test('should have build scripts in package.json', () => {
      const packagePath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

      // Verify build scripts exist
      expect(packageJson.scripts['build:ios:dev']).toContain(
        'eas build --platform ios --profile development'
      );
      expect(packageJson.scripts['build:android:dev']).toContain(
        'eas build --platform android --profile development'
      );
      expect(packageJson.scripts['build:web']).toContain(
        'npx expo export --platform web'
      );
      expect(packageJson.scripts['build:all:dev']).toContain(
        'eas build --platform all --profile development'
      );
    });
  });

  describe('Dependencies', () => {
    test('should have required EAS dependencies', () => {
      const packagePath = path.join(projectRoot, 'package.json');
      const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));

      // Development client for EAS builds
      expect(packageJson.dependencies['expo-dev-client']).toBeDefined();

      // Updates for OTA functionality
      expect(packageJson.dependencies['expo-updates']).toBeDefined();

      // Core Expo SDK
      expect(packageJson.dependencies['expo']).toMatch(/~53\.0\.20/);
    });
  });

  describe('Web Build Artifacts', () => {
    test('should have web build output directory', () => {
      const distPath = path.join(projectRoot, 'dist');
      expect(existsSync(distPath)).toBe(true);

      // Check for required build files
      const metadataPath = path.join(distPath, 'metadata.json');
      const assetMapPath = path.join(distPath, 'assetmap.json');

      expect(existsSync(metadataPath)).toBe(true);
      expect(existsSync(assetMapPath)).toBe(true);
    });
  });

  describe('Documentation', () => {
    test('should have build process documentation', () => {
      const docPath = path.join(projectRoot, 'docs', 'BUILD_PROCESS.md');
      expect(existsSync(docPath)).toBe(true);

      const docContent = readFileSync(docPath, 'utf8');
      expect(docContent).toContain('EAS Build Configuration');
      expect(docContent).toContain('Build Profiles');
      expect(docContent).toContain('Troubleshooting');
    });
  });
});
