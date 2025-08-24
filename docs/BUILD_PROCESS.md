# Build Process Documentation

## Overview

This document outlines the build configuration and deployment process for the 2048 React Native application using EAS Build.

## EAS Build Configuration

### Configuration Files

- **app.config.ts**: Main Expo configuration with platform-specific settings
- **eas.json**: EAS Build profiles and settings for different environments

### Build Profiles

#### Development Profile

- **Purpose**: Internal testing with development client
- **Bundle IDs**: `com.rvh.test2048.dev`
- **Features**: Simulator support, APK builds for Android
- **Command**: `npm run build:android:dev` or `npm run build:ios:dev`

#### Preview Profile

- **Purpose**: Staging/testing builds with store-compatible builds
- **Bundle IDs**: `com.rvh.test2048.preview`
- **Features**: Internal distribution, APK builds
- **Use Case**: Testing before production release

#### Production Profile

- **Purpose**: Final store releases
- **Bundle IDs**: `com.rvh.test2048`
- **Features**: Auto-increment build numbers, AAB for Android
- **Distribution**: App Store and Google Play Store

### Bundle Identifier Strategy

- Production: `com.rvh.test2048`
- Preview: `com.rvh.test2048.preview`
- Development: `com.rvh.test2048.dev`

This approach allows multiple versions to be installed simultaneously for testing.

## Available Build Commands

### Web Platform

```bash
npm run build:web
```

- Generates static export in `dist/` directory
- No authentication required
- Ready for deployment to static hosting

### Mobile Platforms (Requires EAS Authentication)

```bash
npm run build:ios:dev      # iOS development build
npm run build:android:dev  # Android development build
npm run build:all:dev      # All platforms development builds
```

## Authentication Setup

### Initial Setup

1. Install EAS CLI globally:

   ```bash
   npm install -g eas-cli
   ```

2. Login to EAS services:

   ```bash
   eas login
   ```

3. Configure project (if needed):
   ```bash
   eas build:configure
   ```

## Expo Updates Integration

### Update Channels

- **Development**: For development builds and testing
- **Preview**: For staging environment updates
- **Production**: For production app updates

### OTA Updates

- Configured with fallback timeout of 0ms
- Automatic checking on error recovery
- Runtime version policy based on app version

### Publishing Updates

```bash
eas update --channel development --message "Update description"
eas update --channel preview --message "Staging update"
eas update --channel production --message "Production update"
```

## Troubleshooting

### Common Issues

#### 1. Authentication Errors

- **Issue**: "Not logged in" error
- **Solution**: Run `eas login` and follow prompts
- **Verification**: Run `eas whoami` to confirm authentication

#### 2. Bundle Identifier Conflicts

- **Issue**: Bundle ID already exists
- **Solution**: Update bundle identifiers in app.config.ts
- **Prevention**: Use unique identifiers per environment

#### 3. Dependency Conflicts (expo-updates)

- **Issue**: Peer dependency warnings with React versions
- **Solution**: Install with `--legacy-peer-deps` flag
- **Command**: `npm install expo-updates --legacy-peer-deps`

#### 4. Web Build Failures

- **Issue**: Metro bundler errors
- **Solution**: Clear cache and retry
- **Commands**:
  ```bash
  npx expo start --clear
  npm run build:web
  ```

### Build Verification

#### Web Build Verification

1. Check `dist/` directory exists
2. Verify static routes are generated
3. Confirm bundle size is reasonable (< 2MB)
4. Test local deployment with static server

#### Mobile Build Verification (Post-Authentication)

1. Builds complete without errors
2. Installable on target devices
3. App launches and basic functionality works
4. Update mechanism functional

## Architecture Compliance

### Requirements Met

- ✅ EAS Build 2024.12+ integration
- ✅ Expo SDK 53.0.20 compatibility
- ✅ Metro 0.83+ bundler configuration
- ✅ TypeScript 5.3+ support
- ✅ New Architecture enabled by default

### File Structure Compliance

- ✅ Configuration files in project root
- ✅ Build artifacts in designated directories
- ✅ Environment separation via profiles

## Next Steps

1. **Complete Authentication**: Run `eas login` to enable mobile builds
2. **Test Mobile Builds**: Execute iOS and Android development builds
3. **Configure CI/CD**: Set up GitHub Actions with EAS integration
4. **Production Setup**: Configure Apple Developer and Google Play accounts

## Build Process Summary

The EAS Build infrastructure is fully configured and ready for use. Web builds are immediately functional, while mobile builds require one-time authentication setup. All build profiles follow architecture requirements and support the full development workflow from local testing to production deployment.
