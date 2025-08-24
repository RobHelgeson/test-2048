import {GameBoard} from '@/components/game/GameBoard';
import {GameHeader} from '@/components/game/GameHeader';
import {ThemedSafeAreaView} from '@/components/themed/ThemedSafeAreaView';
import {ThemedView} from '@/components/themed/ThemedView';
import {useGame} from '@/hooks/useGame';
import {useTheme} from '@/hooks/useTheme';
import React from 'react';
import {Dimensions, Platform, ScrollView, StyleSheet, Text} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

/**
 * Simple Error Boundary Component for Game Screen
 * Provides graceful error handling for the integrated game components
 */
class GameErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: Error }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    // Update state to show error UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Game Screen Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <ThemedView
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
            backgroundColor: 'rgba(0, 0, 0, 0.02)', // Subtle background tint
          }}
        >
          <ThemedView
            style={{
              padding: 24,
              borderRadius: 16, // Larger radius for modern look
              backgroundColor: 'rgba(255, 59, 48, 0.08)', // iOS-style error red with transparency
              borderWidth: 1,
              borderColor: 'rgba(255, 59, 48, 0.2)', // Subtle border
              maxWidth: 320,
              alignItems: 'center',
              // Add subtle shadow for depth
              ...(Platform.OS === 'ios' && {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.12,
                shadowRadius: 8,
              }),
              ...(Platform.OS === 'android' && {
                elevation: 4,
              }),
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: '700', // Bold for hierarchy
                marginBottom: 12,
                color: '#D70015', // High contrast error color
                textAlign: 'center',
              }}
            >
              ⚠️ Game Error
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: '#8E8E93', // iOS secondary text color
                textAlign: 'center',
                lineHeight: 22, // Better line height for readability
              }}
            >
              Something went wrong while loading the game. Please try refreshing the app.
            </Text>
          </ThemedView>
        </ThemedView>
      );
    }

    return this.props.children;
  }
}

export default function GameScreen() {
  // Game logic integration with optimized selectors to prevent unnecessary re-renders
  const { actions, isLoading } = useGame();

  // Subscribe to Zustand store for real-time updates (as specified in story)
  // These values are used by child components through the store subscriptions
  const { colors } = useTheme();

  // Handle new game action
  const handleNewGame = React.useCallback(() => {
    actions.resetGame();
  }, [actions]);

  // Dynamic styles based on screen size and theme
  const dynamicStyles = React.useMemo(() => createGameScreenStyles(colors), [colors]);

  return (
    <GameErrorBoundary>
      <ThemedSafeAreaView style={styles.container} testID="game-screen">
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={dynamicStyles.scrollContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          <ThemedView style={[styles.content, dynamicStyles.content]} backgroundColor="background">
            {/* Show loading state if game is initializing - with visual polish */}
            {isLoading ? (
              <ThemedView
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: 0.8, // Subtle fade effect
                }}
              >
                <ThemedView
                  style={{
                    backgroundColor: colors.background,
                    borderRadius: 12,
                    padding: 24,
                    alignItems: 'center',
                    // Subtle shadow for depth
                    ...(Platform.OS === 'ios' && {
                      shadowColor: colors.shadow || '#000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.1,
                      shadowRadius: 4,
                    }),
                    ...(Platform.OS === 'android' && {
                      elevation: 2,
                    }),
                  }}
                >
                  <Text
                    style={{
                      color: colors.text,
                      fontSize: 18,
                      fontWeight: '600', // Better typography hierarchy
                      marginBottom: 8,
                    }}
                  >
                    Loading Game
                  </Text>
                  <Text
                    style={{
                      color: colors.textSecondary || colors.text,
                      fontSize: 14,
                      opacity: 0.7, // Secondary text treatment
                    }}
                  >
                    Please wait...
                  </Text>
                </ThemedView>
              </ThemedView>
            ) : (
              <>
                {/* Game Header with scores and controls */}
                <GameHeader style={dynamicStyles.header} onNewGame={handleNewGame} testID="game-header" />

                {/* Main Game Board - central focal point */}
                <ThemedView style={dynamicStyles.boardContainer} testID="board-container">
                  <GameBoard style={dynamicStyles.board} testID="game-board" />
                </ThemedView>
              </>
            )}
          </ThemedView>
        </ScrollView>
      </ThemedSafeAreaView>
    </GameErrorBoundary>
  );
}

// Base styles that don't depend on theme or screen size
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});

/**
 * Creates dynamic styles based on theme colors and screen dimensions
 * Implements responsive layout with proper spacing and visual hierarchy
 */
function createGameScreenStyles(colors: any) {
  // Responsive breakpoints as specified in story requirements
  const isTablet = screenWidth > 768; // 768px+ for tablet screens
  const isNarrow = screenWidth < 375; // Below 375px for narrow screens
  const isPortrait = screenHeight > screenWidth;
  const isWide = screenWidth >= 768; // Desktop/tablet landscape

  // Calculate dynamic spacing using 8pt grid system
  const baseSpacing = 8;

  // Platform-specific adaptations for navigation areas
  const platformPadding = {
    ios: isPortrait ? baseSpacing * 2 : baseSpacing, // More padding on iOS in portrait
    android: baseSpacing * 1.5, // Standard Android padding
    web: isWide ? baseSpacing * 4 : baseSpacing * 2, // Larger padding on web/desktop
  };

  const currentPlatformPadding = Platform.select(platformPadding) || baseSpacing * 2;

  // Responsive container padding: 375px-768px+ range support
  const containerPadding = isTablet
    ? Math.max(baseSpacing * 4, currentPlatformPadding) // 32pt+ tablet
    : isNarrow
      ? baseSpacing * 1.5 // 12pt narrow
      : baseSpacing * 2; // 16pt standard mobile

  const headerMargin = isTablet
    ? baseSpacing * 2 // 16pt tablet
    : isNarrow
      ? baseSpacing // 8pt narrow
      : baseSpacing * 1.5; // 12pt standard

  const boardContainerMargin = isTablet
    ? baseSpacing * 3 // 24pt tablet
    : baseSpacing * 2; // 16pt mobile

  // Touch target sizing requirements (44x44pt iOS, 48x48dp Android)
  const minTouchTarget =
    Platform.select({
      ios: 44,
      android: 48,
      web: 32,
    }) || 44;

  return StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      minHeight: isNarrow || screenHeight < 600 ? undefined : screenHeight - 100, // Allow scrolling on small screens
    },

    content: {
      paddingHorizontal: containerPadding,
      paddingTop: isPortrait ? baseSpacing * 2 : baseSpacing, // More top padding in portrait
      paddingBottom: baseSpacing,
      gap: isNarrow ? baseSpacing * 1.5 : baseSpacing * 2, // 12pt narrow, 16pt normal
      // Reduce flex on small screens to allow proper sizing
      ...(!isTablet &&
        screenHeight < 600 && {
          flex: 0,
          minHeight: screenHeight - 150, // Ensure minimum height on very small screens
        }),
      // Ensure content doesn't overlap with safe areas in landscape
      ...(Platform.OS === 'ios' &&
        !isPortrait && {
          paddingHorizontal: Math.max(containerPadding, baseSpacing * 5), // 40pt minimum for landscape notch
        }),
    },

    header: {
      width: '100%',
      marginBottom: headerMargin,
      // Ensure header doesn't exceed reasonable width on tablets
      maxWidth: isTablet ? 600 : '100%',
      alignSelf: 'center',
      // Ensure header elements meet touch target requirements
      minHeight: isTablet ? minTouchTarget * 1.5 : minTouchTarget,
    },

    boardContainer: {
      flex: screenHeight < 600 ? 0 : 1, // Don't use flex on very small screens
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: boardContainerMargin,
      // Responsive layout adaptations for different screen sizes
      ...(isWide && {
        maxWidth: 600, // Prevent board from becoming too large on wide screens
        alignSelf: 'center',
      }),
      // Ensure board fits on small screens
      ...(!isTablet &&
        screenHeight < 600 && {
          marginTop: baseSpacing,
          marginBottom: baseSpacing,
        }),
      // Add subtle background for board area on larger screens
      ...(isTablet && {
        backgroundColor: colors.background,
        borderRadius: 12,
        padding: baseSpacing * 2,
        // Add subtle shadow on tablets for depth
        ...(Platform.OS === 'ios' && {
          shadowColor: colors.shadow || '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }),
        ...(Platform.OS === 'android' && {
          elevation: 2,
        }),
      }),
    },

    board: {
      // GameBoard component handles its own sizing and touch targets
      // Ensure proper scaling for tablet screens
      ...(isTablet && {
        transform: [{ scale: 1.1 }], // Slightly larger on tablets for better visibility
      }),
    },
  });
}
