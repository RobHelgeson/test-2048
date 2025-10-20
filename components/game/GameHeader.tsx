import { ThemedView } from '@/components/themed/ThemedView';
import { Button } from '@/components/ui/Button';
import { StatusIndicator } from '@/components/ui/StatusIndicator';
import { useThemeColors } from '@/hooks/useTheme';
import { useGame } from '@/hooks/useGame';
import { Direction } from '@/types';
import React from 'react';
import { Dimensions, Platform, StyleSheet, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import { ScoreDisplay } from './GameHeader/ScoreDisplay';
import { KeyboardIndicator } from './KeyboardIndicator';

interface GameHeaderProps {
  /** Optional custom styling for the header container */
  style?: ViewStyle;
  /** Callback when new game is initiated */
  onNewGame?: () => void;
  /** Test ID for testing */
  testID?: string;
  /** Keyboard indicator state from useKeyboard hook */
  keyboardState?: {
    activeDirections?: Set<Direction>;
    pressedDirection?: Direction | null;
    isEnabled?: boolean;
  };
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
 * - Integration with useGame hook for real-time state updates
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
 *   keyboardState={{
 *     activeDirections: new Set([Direction.UP]),
 *     pressedDirection: Direction.UP,
 *     isEnabled: true
 *   }}
 * />
 * ```
 */
export function GameHeader({ style, onNewGame, testID, keyboardState }: GameHeaderProps) {
  const colors = useThemeColors();

  // Game state integration via useGame hook
  const { gameState, actions } = useGame();
  const { score, bestScore, gameStatus } = gameState;
  const { resetGame } = actions;

  // Animation values for score changes and new best score celebration
  const scoreAnimationScale = useSharedValue(1);
  const bestScoreAnimationScale = useSharedValue(1);
  const previousScore = React.useRef(score);
  const previousBestScore = React.useRef(bestScore);

  // Create responsive layout styles based on screen dimensions
  const dynamicStyles = React.useMemo(() => createHeaderStyles(colors), [colors]);

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
    if (bestScore !== previousBestScore.current && bestScore > previousBestScore.current) {
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
      accessibilityHint: 'Contains current score, best score, game status, and new game button',
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
        <Animated.View style={[dynamicStyles.scoreWrapper, bestScoreAnimatedStyle]}>
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
        <StatusIndicator status={gameStatus} animated={true} testID={testID ? `${testID}-status` : 'game-status'} />

        {/* New Game Button */}
        <Button
          title="New Game"
          variant="primary"
          size={dynamicStyles.isSmallScreen ? 'compact' : 'small'}
          onPress={handleNewGame}
          testID={testID ? `${testID}-new-game` : 'new-game-button'}
          accessibilityLabel="Start New Game"
          accessibilityHint="Starts a new 2048 game session, resetting the board and score"
        />
      </ThemedView>

      {/* Keyboard Controls Indicator for Web */}
      {keyboardState?.isEnabled && Platform.OS === 'web' && (
        <KeyboardIndicator
          activeDirections={keyboardState.activeDirections}
          pressedDirection={keyboardState.pressedDirection}
          visible={true}
          compact={dynamicStyles.isSmallScreen}
          testID={testID ? `${testID}-keyboard` : 'game-header-keyboard'}
        />
      )}
    </ThemedView>
  );
}

/**
 * Creates dynamic styles based on theme colors and responsive design
 */
function createHeaderStyles(colors: any) {
  const { width, height } = Dimensions.get('window');
  const isTablet = width > 768;
  const isNarrow = width < 375;
  const isSmallScreen = height < 600; // Very small screens like older iPhones

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: isTablet ? 20 : isNarrow ? 6 : 8,
      paddingVertical: isTablet ? 12 : isSmallScreen ? 4 : 6,
      // More compact layout - prefer row layout unless very constrained
      flexDirection: isNarrow && isSmallScreen ? 'column' : 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: isNarrow && isSmallScreen ? 6 : 0,
      // Platform-specific styling
      ...getPlatformHeaderShadow(),
    } as ViewStyle,

    scoresContainer: {
      flexDirection: 'row',
      gap: isTablet ? 12 : 6,
      alignItems: 'center',
    } as ViewStyle,

    scoreWrapper: {
      // Wrapper for animation transforms
    } as ViewStyle,

    controlsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: isTablet ? 12 : 6,
    } as ViewStyle,
  });

  // Return styles with flag as separate property
  return {
    ...styles,
    isSmallScreen,
  };
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
