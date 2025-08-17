# Unified Project Structure

## Single Application Structure

Since this is a client-only Expo React Native application, the project follows a unified structure optimized for cross-platform mobile development without backend complexity.

```plaintext
test-2048/
├── .expo/                          # Expo development cache (auto-generated)
├── .github/                        # GitHub workflows and templates
│   └── workflows/
│       ├── ci.yml                  # Continuous integration
│       ├── eas-build.yml           # EAS Build automation
│       └── eas-update.yml          # OTA update deployment
├── app/                            # Expo Router file-based routing (REQUIRED)
│   ├── (tabs)/                     # Tab navigation group
│   │   ├── _layout.tsx            # Tab navigator configuration
│   │   ├── index.tsx              # Main game screen (/)
│   │   ├── settings.tsx           # Settings screen (/settings)
│   │   ├── stats.tsx              # Statistics screen (/stats)
│   │   └── about.tsx              # About screen (/about)
│   ├── modal/                      # Modal presentation group
│   │   ├── game-over.tsx          # Game over modal
│   │   ├── tutorial.tsx           # Tutorial modal
│   │   └── _layout.tsx            # Modal stack configuration
│   ├── _layout.tsx                # Root layout with providers (REQUIRED)
│   ├── +not-found.tsx             # 404 error screen
│   └── +html.tsx                  # Custom HTML document (web)
├── components/                     # Reusable UI components (Expo convention)
│   ├── game/                      # Game-specific components
│   │   ├── GameBoard.tsx          # Main game board container
│   │   ├── Tile.tsx               # Individual tile component
│   │   ├── GameHeader.tsx         # Score display and controls
│   │   ├── GameOverModal.tsx      # Win/lose modal
│   │   └── TutorialOverlay.tsx    # Tutorial instruction overlay
│   ├── ui/                        # Generic UI components
│   │   ├── Button.tsx             # Themed button component
│   │   ├── Modal.tsx              # Base modal component
│   │   ├── Switch.tsx             # Settings toggle switch
│   │   ├── Slider.tsx             # Value adjustment slider
│   │   └── Card.tsx               # Content card component
│   └── themed/                    # Theme-aware components
│       ├── ThemedText.tsx         # Text with theme colors
│       ├── ThemedView.tsx         # View with theme colors
│       └── ThemedSafeAreaView.tsx # Safe area with theme
├── hooks/                         # Custom React hooks (Expo convention)
│   ├── useGame.ts                # Game logic hook
│   ├── useAnimations.ts          # Animation management hook
│   ├── useGestures.ts            # Gesture handling hook
│   ├── useTheme.ts               # Theme management hook
│   ├── useStorage.ts             # Database operations hook
│   └── useHaptics.ts             # Haptic feedback hook
├── stores/                       # Zustand state stores
│   ├── gameStore.ts              # Game state management
│   ├── themeStore.ts             # Theme state management
│   ├── settingsStore.ts          # Settings state management
│   └── index.ts                  # Store exports
├── services/                     # Business logic services
│   ├── gameEngine.ts             # Core game logic
│   ├── storageService.ts         # SQLite data operations
│   ├── animationService.ts       # Animation orchestration
│   ├── achievementService.ts     # Achievement tracking
│   └── index.ts                  # Service exports
├── types/                        # TypeScript type definitions
│   ├── game.ts                   # Game-related types
│   ├── theme.ts                  # Theme-related types
│   ├── navigation.ts             # Navigation types
│   ├── storage.ts                # Database types
│   └── index.ts                  # Type exports
├── constants/                    # Application constants (Expo convention)
│   ├── Colors.ts                 # Theme color definitions
│   ├── Animations.ts             # Animation configurations
│   ├── Game.ts                   # Game configuration constants
│   ├── Layout.ts                 # Layout and sizing constants
│   └── index.ts                  # Constant exports
├── utils/                        # Utility functions
│   ├── gameUtils.ts              # Game-specific utilities
│   ├── animationUtils.ts         # Animation helper functions
│   ├── storageUtils.ts           # Database helper functions
│   ├── themeUtils.ts             # Theme helper functions
│   └── index.ts                  # Utility exports
├── assets/                       # Static assets (Expo convention)
│   ├── images/                   # Image assets
│   │   ├── icon.png             # App icon (various sizes)
│   │   ├── splash.png           # Splash screen image
│   │   ├── adaptive-icon.png    # Android adaptive icon
│   │   └── favicon.png          # Web favicon
│   ├── fonts/                   # Custom fonts (if any)
│   └── sounds/                  # Sound effects (future feature)
├── public/                      # Static web assets (Expo Router web)
│   └── favicon.ico              # Web favicon fallback
├── dist/                        # Export output directory (auto-generated)
├── scripts/                     # Development and build scripts
│   ├── reset-project.js         # Clean development environment
│   └── generate-assets.js       # Asset generation helpers
├── __tests__/                   # Test files
│   ├── components/              # Component tests
│   ├── hooks/                   # Hook tests
│   ├── services/                # Service tests
│   ├── stores/                  # Store tests
│   └── utils/                   # Utility tests
├── docs/                        # Project documentation
│   ├── architecture.md          # This architecture document
│   ├── DEVELOPMENT.md           # Development guidelines
│   ├── DEPLOYMENT.md            # Deployment instructions
│   └── CONTRIBUTING.md          # Contribution guidelines
├── .bmad-core/                  # BMad framework files (development)
├── .claude/                     # Claude AI configuration
├── .vscode/                     # VS Code workspace settings
├── .env                         # Environment variables
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── .eslintrc.js                 # ESLint configuration
├── .prettierrc                  # Prettier configuration
├── jest.config.js               # Jest testing configuration
├── metro.config.js              # Metro bundler configuration
├── babel.config.js              # Babel transpilation config
├── tsconfig.json                # TypeScript configuration
├── expo.json                    # Expo configuration (REQUIRED)
├── eas.json                     # EAS Build configuration
├── app.json                     # Legacy Expo configuration (optional)
├── package.json                 # Dependencies and scripts (REQUIRED)
├── package-lock.json            # Dependency lock file
└── README.md                    # Project overview and setup
```

## Key Structure Decisions

### Expo Router Integration (File-Based Routing)

- **Required `/app` directory** - Expo Router v3 mandates all routes live in `/app` directory
- **Root layout requirement** - `app/_layout.tsx` replaces traditional `App.tsx` for initialization
- **Route groups with parentheses** - `(tabs)` for tab navigation, `modal` for modal presentation
- **Typed routes** - Automatic TypeScript generation for type-safe navigation
- **Special file conventions** - `+not-found.tsx`, `+html.tsx` for web customization

### Component Organization (Expo Conventions)

- **Root-level `/components`** - Follows Expo's recommended flat structure vs nested `/src/components`
- **Feature-based grouping** - Game components separated from generic UI components
- **Non-route components** - All components outside `/app` are non-route by convention
- **Shared component reusability** - Components can be imported across route files

### Directory Structure (Expo Standards)

- **Root-level utilities** - `/hooks`, `/constants`, `/utils` follow Expo template conventions
- **Asset organization** - `/assets` for bundled assets, `/public` for static web assets
- **Auto-generated directories** - `.expo/`, `dist/` created automatically, ignored in git
- **Service layer separation** - Business logic isolated in `/services` directory

### Asset Management (Multi-Platform)

- **Expo asset optimization** - Automatic processing via Metro bundler
- **Platform-specific icons** - `icon.png`, `adaptive-icon.png` for different platforms
- **Web asset handling** - `/public` directory for static web assets, copied to `/dist`
- **Splash screen integration** - `splash.png` handled by Expo's splash screen system

### TypeScript Integration

- **Strict mode enabled** - Maximum type safety throughout the codebase
- **Auto-generated types** - Expo Router generates navigation types automatically
- **Centralized type definitions** - `/types` directory for shared interfaces
- **Path mapping support** - Metro supports TypeScript path aliases

### Development Tooling (Expo Ecosystem)

- **EAS Build integration** - `eas.json` for cloud builds and deployment
- **Metro bundler** - Optimized for React Native and Expo with web support
- **Expo CLI compatibility** - Structure supports `npx expo start`, `npx expo export`
- **Hot reload support** - File-based routing enables fast refresh across all platforms

### Configuration Standards

- **Required files** - `expo.json`, `package.json` are mandatory for Expo projects
- **Optional legacy support** - `app.json` for backward compatibility if needed
- **Environment management** - `.env` files supported with Expo's environment system
- **Build configuration** - `metro.config.js`, `babel.config.js` for build customization
