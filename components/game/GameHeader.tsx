import React from 'react';
import { StyleSheet, ViewStyle, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  withSpring,
  withSequence,
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import { ThemedView } from '@/components/themed/ThemedView';
import { useThemeColors } from '@/hooks/useTheme';
import { useGameStore } from '@/stores/gameStore';
import { ScoreDisplay } from './GameHeader/ScoreDisplay';
import { Button } from '@/components/ui/Button';
import { StatusIndicator } from '@/components/ui/StatusIndicator';

interface GameHeaderProps {
  /** Optional custom styling for the header container */
  style?: ViewStyle;
  /** Callback when new game is initiated */
  onNewGame?: () => void;
  /** Test ID for testing */
  testID?: string;
}

/**
 * GameHeader Component
 *
 * The primary header component for the 2048 game that displays score information,
 * game status, and provides new game functionality. Features responsive design,
 * theme integration, and smooth animations for score changes.
 *
 * Key Features:
 * - Live score display with current and best score tracking
 * - Game status indicator with color-coded feedback
 * - Prominent new game button with proper accessibility
 * - Responsive layout that adapts to screen sizes and orientations
 * - Score change animations with special effects for new best scores
 * - Platform-specific styling following design guidelines
 * - Full accessibility support with proper labels and hints
 * - Integration with game store for real-time state updates
 *
 * Layout Structure:
 * - Responsive flexbox layout that adapts to screen width
 * - Score displays grouped together with consistent spacing
 * - Status indicator positioned prominently
 * - New game button with appropriate visual hierarchy
 * - Tablet and mobile optimized layouts
 *
 * @example
 * ```tsx
 * <GameHeader
 *   onNewGame={() => console.log('New game started')}
 *   testID="game-header"
 * />
 * ```
 */
export function GameHeader({ style, onNewGame, testID }: GameHeaderProps) {
  const colors = useThemeColors();

  // Game store integration with optimized selectors
  const score = useGameStore((state) => state.score);
  const bestScore = useGameStore((state) => state.bestScore);
  const gameStatus = useGameStore((state) => state.gameStatus);
  const resetGame = useGameStore((state) => state.resetGame);

  // Animation values for score changes and new best score celebration
  const scoreAnimationScale = useSharedValue(1);
  const bestScoreAnimationScale = useSharedValue(1);
  const previousScore = React.useRef(score);
  const previousBestScore = React.useRef(bestScore);

  // Create responsive layout styles based on screen dimensions
  const dynamicStyles = React.useMemo(
    () => createHeaderStyles(colors),
    [colors]
  );

  // Animate score changes
  React.useEffect(() => {
    if (score !== previousScore.current && score > previousScore.current) {
      scoreAnimationScale.value = withSequence(
        withSpring(1.1, { damping: 15, stiffness: 300 }),
        withSpring(1.0, { damping: 15, stiffness: 300 })
      );
      previousScore.current = score;
    }
  }, [score, scoreAnimationScale]);

  // Animate best score achievements
  React.useEffect(() => {
    if (
      bestScore !== previousBestScore.current &&
      bestScore > previousBestScore.current
    ) {
      bestScoreAnimationScale.value = withSequence(
        withSpring(1.15, { damping: 12, stiffness: 250 }),
        withSpring(1.0, { damping: 12, stiffness: 250 })
      );
      previousBestScore.current = bestScore;
    }
  }, [bestScore, bestScoreAnimationScale]);

  // Animated styles for score displays
  const scoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreAnimationScale.value }],
  }));

  const bestScoreAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bestScoreAnimationScale.value }],
  }));

  // Handle new game with optional callback
  const handleNewGame = React.useCallback(() => {
    resetGame();
    onNewGame?.();
  }, [resetGame, onNewGame]);

  // Generate accessibility properties for the header
  const headerAccessibilityProps = React.useMemo(
    () => ({
      accessibilityRole: 'header' as const,
      accessibilityLabel: 'Game header with score and controls',
      accessibilityHint:
        'Contains current score, best score, game status, and new game button',
    }),
    []
  );

  return (
    <ThemedView
      style={[dynamicStyles.container, style]}
      backgroundColor="background"
      testID={testID || 'game-header'}
      accessible
      {...headerAccessibilityProps}
    >
      {/* Scores Container */}
      <ThemedView
        style={dynamicStyles.scoresContainer}
        testID={testID ? `${testID}-scores` : 'game-header-scores'}
        accessibilityLabel="Score information"
      >
        {/* Current Score with Animation */}
        <Animated.View style={[dynamicStyles.scoreWrapper, scoreAnimatedStyle]}>
          <ScoreDisplay
            label="Score"
            value={score}
            highlighted={false}
            testID={testID ? `${testID}-current-score` : 'current-score'}
          />
        </Animated.View>

        {/* Best Score with Animation */}
        <Animated.View
          style={[dynamicStyles.scoreWrapper, bestScoreAnimatedStyle]}
        >
          <ScoreDisplay
            label="Best"
            value={bestScore}
            highlighted={bestScore > previousBestScore.current}
            testID={testID ? `${testID}-best-score` : 'best-score'}
          />
        </Animated.View>
      </ThemedView>

      {/* Controls Container */}
      <ThemedView
        style={dynamicStyles.controlsContainer}
        testID={testID ? `${testID}-controls` : 'game-header-controls'}
        accessibilityLabel="Game controls"
      >
        {/* Game Status Indicator */}
        <StatusIndicator
          status={gameStatus}
          animated={true}
          testID={testID ? `${testID}-status` : 'game-status'}
        />

        {/* New Game Button */}
        <Button
          title="New Game"
          variant="primary"
          size="medium"
          onPress={handleNewGame}
          testID={testID ? `${testID}-new-game` : 'new-game-button'}
          accessibilityLabel="Start New Game"
          accessibilityHint="Starts a new 2048 game session, resetting the board and score"
        />
      </ThemedView>
    </ThemedView>
  );
}

/**
 * Creates dynamic styles based on theme colors and responsive design
 */
function createHeaderStyles(colors: any) {
  const { width } = Dimensions.get('window');
  const isTablet = width > 768;
  const isNarrow = width < 375;

  return StyleSheet.create({
    container: {
      paddingHorizontal: isTablet ? 24 : isNarrow ? 12 : 16,
      paddingVertical: isTablet ? 16 : 12,
      // Responsive layout direction
      flexDirection: isNarrow ? 'column' : 'row',
      alignItems: isNarrow ? 'center' : 'center',
      justifyContent: isNarrow ? 'center' : 'space-between',
      gap: isNarrow ? 12 : 0,
      // Platform-specific styling
      ...getPlatformHeaderShadow(),
    } as ViewStyle,

    scoresContainer: {
      flexDirection: 'row',
      gap: isTablet ? 16 : 12,
      alignItems: 'center',
    } as ViewStyle,

    scoreWrapper: {
      // Wrapper for animation transforms
    } as ViewStyle,

    controlsContainer: {
      flexDirection: isNarrow ? 'column' : 'row',
      alignItems: 'center',
      gap: isTablet ? 16 : 12,
    } as ViewStyle,
  });
}

/**
 * Platform-specific shadow styles for the header
 */
function getPlatformHeaderShadow() {
  if (Platform.OS === 'ios') {
    return {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    };
  } else if (Platform.OS === 'android') {
    return {
      elevation: 2,
    };
  } else {
    // Web shadow
    return {
      boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    };
  }
}

export default GameHeader;
