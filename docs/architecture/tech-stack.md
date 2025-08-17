# Tech Stack

This is the DEFINITIVE technology selection for the entire project. All development must use these exact versions and technologies.

## Technology Stack Table

| Category             | Technology                          | Version       | Purpose                                      | Rationale                                                                          |
| -------------------- | ----------------------------------- | ------------- | -------------------------------------------- | ---------------------------------------------------------------------------------- |
| Frontend Language    | TypeScript                          | 5.3+          | Type-safe development with full IntelliSense | Industry standard for React Native, prevents runtime errors, excellent IDE support |
| Frontend Framework   | React Native                        | 0.76+         | Cross-platform mobile development            | Latest version with New Architecture support, proven performance                   |
| Runtime Framework    | Expo                                | SDK 53.0.20   | Development and build infrastructure         | Latest stable with New Architecture enabled by default, comprehensive tooling      |
| UI Component Library | React Native Built-ins              | 0.76+         | Native platform components                   | Leverages platform-optimized components, minimal bundle size                       |
| State Management     | Zustand                             | 5.0+          | Lightweight global state management          | Perfect balance of simplicity and power for game complexity                        |
| Backend Language     | N/A                                 | N/A           | No backend required                          | Client-only architecture for MVP                                                   |
| Backend Framework    | N/A                                 | N/A           | No backend required                          | All logic runs client-side                                                         |
| API Style            | N/A                                 | N/A           | No external APIs                             | Self-contained game logic                                                          |
| Database             | expo-sqlite                         | 18.1+         | Local game data persistence                  | Superior performance vs AsyncStorage for structured data                           |
| Cache                | Memory + SQLite                     | N/A           | In-memory game state + persistent storage    | React state for active game, SQLite for persistence                                |
| File Storage         | expo-file-system                    | 18.1+         | Local asset and data storage                 | Built-in Expo solution for any file storage needs                                  |
| Authentication       | N/A                                 | N/A           | No authentication required                   | Local-only game, no user accounts needed                                           |
| Frontend Testing     | Jest + React Native Testing Library | 30.0+ / 13.2+ | Unit and integration testing                 | Standard React Native testing stack                                                |
| Backend Testing      | N/A                                 | N/A           | No backend to test                           | Client-only architecture                                                           |
| E2E Testing          | Detox                               | 20.0+         | End-to-end testing across platforms          | Expo-compatible E2E testing framework                                              |
| Build Tool           | EAS Build                           | 2024.12+      | Cross-platform builds and deployment         | Expo's managed build service with New Architecture support                         |
| Bundler              | Metro                               | 0.83+         | React Native bundling and development        | Standard React Native bundler with Expo optimizations                              |
| IaC Tool             | N/A                                 | N/A           | No infrastructure to manage                  | Client-only deployment                                                             |
| CI/CD                | GitHub Actions + EAS                | 2024.12+      | Automated testing and deployment             | GitHub Actions for testing, EAS for building and deployment                        |
| Monitoring           | Expo Application Services           | 2024.12+      | Performance and error monitoring             | Built-in monitoring through Expo ecosystem                                         |
| Logging              | React Native Logs + Console         | 4.0+          | Development debugging and logging            | Standard React Native debugging tools (Note: Flipper deprecated)                   |
| CSS Framework        | React Native StyleSheet             | 0.76+         | Platform-optimized styling                   | Built-in styling system with TypeScript support                                    |
| Navigation           | Expo Router                         | v3.5+         | Type-safe file-based routing                 | Latest with automatic typed route generation                                       |
| Animations           | React Native Reanimated             | 3.15+         | High-performance animations                  | Native driver animations for 60fps performance                                     |
| Gestures             | React Native Gesture Handler        | 2.18+         | Platform-optimized touch handling            | Native gesture recognition for responsive controls                                 |
| Dev Tools            | Expo Dev Client                     | 2024.12+      | Enhanced development experience              | Hot reload, debugging, and development features                                    |
