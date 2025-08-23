# Deployment Architecture

## Deployment Strategy

**Mobile App Deployment:**

- **Platform:** EAS Build (Expo Application Services)
- **iOS Distribution:** Apple App Store via App Store Connect
- **Android Distribution:** Google Play Store via Play Console
- **Build Command:** `eas build --platform all`
- **Deployment Method:** Cloud-based builds with automatic distribution

**Web App Deployment:**

- **Platform:** Vercel (recommended) or Netlify
- **Build Command:** `npx expo export --platform web`
- **Output Directory:** `dist/`
- **CDN/Edge:** Vercel Edge Network with global distribution

**Development Builds:**

- **Platform:** EAS Build development profiles
- **Distribution:** Internal testing via EAS Development Client
- **Build Command:** `eas build --profile development --platform all`

## CI/CD Pipeline

Automated deployment pipeline using GitHub Actions integrated with EAS Build services.

```yaml

```
