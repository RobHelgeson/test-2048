import { renderHook } from '@testing-library/react-native';
import { useAnimations, AnimationPosition, TileAnimationData } from '@/hooks/useAnimations';
import { AnimationType, ANIMATION_DURATIONS, ANIMATION_SCALES, ANIMATION_OPACITY } from '@/constants/Animations';

describe('useAnimations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Hook initialization', () => {
    it('should return the expected API', () => {
      const { result } = renderHook(() => useAnimations());

      expect(result.current).toHaveProperty('isAnimating');
      expect(result.current).toHaveProperty('getTileAnimationConfig');
      expect(result.current).toHaveProperty('animateTileSlide');
      expect(result.current).toHaveProperty('animateTileMerge');
      expect(result.current).toHaveProperty('animateTileSpawn');
      expect(result.current).toHaveProperty('animateVictoryTile');
      expect(result.current).toHaveProperty('batchAnimations');
      expect(result.current).toHaveProperty('queueAnimation');
      expect(result.current).toHaveProperty('processAnimationQueue');
      expect(result.current).toHaveProperty('cancelAllAnimations');
      expect(result.current).toHaveProperty('createAnimatedStyle');
    });

    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useAnimations());

      expect(result.current.isAnimating.value).toBe(false);
      expect(result.current.activeAnimations.value).toEqual([]);
    });
  });

  describe('getTileAnimationConfig', () => {
    it('should create tile animation config with correct initial values', () => {
      const { result } = renderHook(() => useAnimations());
      const initialPosition: AnimationPosition = { x: 100, y: 200 };

      const config = result.current.getTileAnimationConfig(initialPosition);

      expect(config).toEqual({
        translateX: 100,
        translateY: 200,
        scale: 1,
        opacity: ANIMATION_OPACITY.VISIBLE,
        animationState: 'idle',
      });
    });

    it('should handle different initial positions', () => {
      const { result } = renderHook(() => useAnimations());
      const positions = [
        { x: 0, y: 0 },
        { x: 50, y: 75 },
        { x: -10, y: -20 },
      ];

      positions.forEach((position) => {
        const config = result.current.getTileAnimationConfig(position);
        expect(config.translateX).toBe(position.x);
        expect(config.translateY).toBe(position.y);
        expect(config.scale).toBe(1);
        expect(config.opacity).toBe(ANIMATION_OPACITY.VISIBLE);
        expect(config.animationState).toBe('idle');
      });
    });
  });

  describe('Animation functions integration tests', () => {
    // Mock a basic TileAnimationData object using useSharedValue
    const createMockAnimationData = (): TileAnimationData => {
      const { result: sharedValueResult } = renderHook(() => {
        // We need to import and use actual useSharedValue here
        const { useSharedValue } = require('react-native-reanimated');
        return {
          translateX: useSharedValue(0),
          translateY: useSharedValue(0),
          scale: useSharedValue(1),
          opacity: useSharedValue(1),
          animationState: useSharedValue('idle'),
        };
      });
      return sharedValueResult.current;
    };

    it('should handle animateTileSlide without throwing', () => {
      const { result } = renderHook(() => useAnimations());
      const mockAnimationData = createMockAnimationData();
      const tileId = 'tile-1';
      const fromPosition = { x: 0, y: 0 };
      const toPosition = { x: 100, y: 100 };

      expect(() => {
        result.current.animateTileSlide(tileId, mockAnimationData, fromPosition, toPosition);
      }).not.toThrow();
    });

    it('should handle animateTileMerge without throwing', () => {
      const { result } = renderHook(() => useAnimations());
      const mockAnimationData = createMockAnimationData();
      const tileId = 'tile-merge';

      expect(() => {
        result.current.animateTileMerge(tileId, mockAnimationData);
      }).not.toThrow();
    });

    it('should handle animateTileSpawn without throwing', () => {
      const { result } = renderHook(() => useAnimations());
      const mockAnimationData = createMockAnimationData();
      const tileId = 'tile-spawn';

      expect(() => {
        result.current.animateTileSpawn(tileId, mockAnimationData);
      }).not.toThrow();
    });

    it('should handle animateVictoryTile without throwing', () => {
      const { result } = renderHook(() => useAnimations());
      const mockAnimationData = createMockAnimationData();
      const tileId = 'victory-tile';

      expect(() => {
        result.current.animateVictoryTile(tileId, mockAnimationData);
      }).not.toThrow();
    });
  });

  describe('Animation management functions', () => {
    it('should handle batchAnimations with empty array', () => {
      const { result } = renderHook(() => useAnimations());
      const onAllComplete = jest.fn();

      expect(() => {
        result.current.batchAnimations([], onAllComplete);
      }).not.toThrow();
    });

    it('should handle batchAnimations with multiple animations', () => {
      const { result } = renderHook(() => useAnimations());
      const animations = [jest.fn(), jest.fn(), jest.fn()];
      const onAllComplete = jest.fn();

      expect(() => {
        result.current.batchAnimations(animations, onAllComplete);
      }).not.toThrow();
    });

    it('should cancel all animations properly', () => {
      const { result } = renderHook(() => useAnimations());

      expect(() => {
        result.current.cancelAllAnimations();
      }).not.toThrow();

      expect(result.current.isAnimating.value).toBe(false);
      expect(result.current.activeAnimations.value).toEqual([]);
    });

    it('should process animation queue without errors', () => {
      const { result } = renderHook(() => useAnimations());

      expect(() => {
        result.current.processAnimationQueue();
      }).not.toThrow();
    });

    it('should queue animations with priority', () => {
      const { result } = renderHook(() => useAnimations());
      const animation = jest.fn();

      expect(() => {
        result.current.queueAnimation('test-id', animation, 1);
      }).not.toThrow();
    });
  });

  describe('createAnimatedStyle', () => {
    it('should create animated style function without throwing', () => {
      const { result } = renderHook(() => useAnimations());

      const createMockAnimationData = (): TileAnimationData => {
        const { result: sharedValueResult } = renderHook(() => {
          const { useSharedValue } = require('react-native-reanimated');
          return {
            translateX: useSharedValue(50),
            translateY: useSharedValue(100),
            scale: useSharedValue(1.1),
            opacity: useSharedValue(0.8),
            animationState: useSharedValue('running'),
          };
        });
        return sharedValueResult.current;
      };

      const animationData = createMockAnimationData();

      expect(() => {
        const styleFunction = result.current.createAnimatedStyle(animationData);
        const style = styleFunction();

        expect(style).toHaveProperty('transform');
        expect(style).toHaveProperty('opacity');
        expect(style.transform).toBeInstanceOf(Array);
        expect(style.transform).toHaveLength(3);
      }).not.toThrow();
    });
  });

  describe('Performance considerations', () => {
    it('should not create unnecessary re-renders', () => {
      const { result, rerender } = renderHook(() => useAnimations());
      const initialAPI = Object.keys(result.current);

      rerender({});

      // The hook should return the same API structure
      expect(Object.keys(result.current)).toEqual(initialAPI);
      expect(typeof result.current.animateTileSlide).toBe('function');
      expect(typeof result.current.animateTileMerge).toBe('function');
      expect(typeof result.current.animateTileSpawn).toBe('function');
      expect(typeof result.current.getTileAnimationConfig).toBe('function');
    });

    it('should handle multiple concurrent animations', () => {
      const { result } = renderHook(() => useAnimations());

      const createMockAnimationData = (): TileAnimationData => {
        const { result: sharedValueResult } = renderHook(() => {
          const { useSharedValue } = require('react-native-reanimated');
          return {
            translateX: useSharedValue(0),
            translateY: useSharedValue(0),
            scale: useSharedValue(1),
            opacity: useSharedValue(1),
            animationState: useSharedValue('idle'),
          };
        });
        return sharedValueResult.current;
      };

      const mockAnimationData1 = createMockAnimationData();
      const mockAnimationData2 = createMockAnimationData();

      // Should not throw when running multiple animations
      expect(() => {
        result.current.animateTileSlide('tile-1', mockAnimationData1, { x: 0, y: 0 }, { x: 50, y: 50 });
        result.current.animateTileSlide('tile-2', mockAnimationData2, { x: 100, y: 100 }, { x: 150, y: 150 });
      }).not.toThrow();
    });
  });

  describe('Edge cases', () => {
    it('should handle animation completion without callback', () => {
      const { result } = renderHook(() => useAnimations());

      const createMockAnimationData = (): TileAnimationData => {
        const { result: sharedValueResult } = renderHook(() => {
          const { useSharedValue } = require('react-native-reanimated');
          return {
            translateX: useSharedValue(0),
            translateY: useSharedValue(0),
            scale: useSharedValue(1),
            opacity: useSharedValue(1),
            animationState: useSharedValue('idle'),
          };
        });
        return sharedValueResult.current;
      };

      const mockAnimationData = createMockAnimationData();

      expect(() => {
        result.current.animateTileSlide('tile-1', mockAnimationData, { x: 0, y: 0 }, { x: 100, y: 100 });
      }).not.toThrow();
    });

    it('should handle zero delay animations', () => {
      const { result } = renderHook(() => useAnimations());

      const createMockAnimationData = (): TileAnimationData => {
        const { result: sharedValueResult } = renderHook(() => {
          const { useSharedValue } = require('react-native-reanimated');
          return {
            translateX: useSharedValue(0),
            translateY: useSharedValue(0),
            scale: useSharedValue(1),
            opacity: useSharedValue(1),
            animationState: useSharedValue('idle'),
          };
        });
        return sharedValueResult.current;
      };

      const mockAnimationData = createMockAnimationData();

      expect(() => {
        result.current.animateTileSlide(
          'tile-1',
          mockAnimationData,
          { x: 0, y: 0 },
          { x: 100, y: 100 },
          { type: AnimationType.SLIDE, delay: 0 }
        );
      }).not.toThrow();
    });

    it('should handle same start and end positions', () => {
      const { result } = renderHook(() => useAnimations());

      const createMockAnimationData = (): TileAnimationData => {
        const { result: sharedValueResult } = renderHook(() => {
          const { useSharedValue } = require('react-native-reanimated');
          return {
            translateX: useSharedValue(50),
            translateY: useSharedValue(50),
            scale: useSharedValue(1),
            opacity: useSharedValue(1),
            animationState: useSharedValue('idle'),
          };
        });
        return sharedValueResult.current;
      };

      const mockAnimationData = createMockAnimationData();

      expect(() => {
        result.current.animateTileSlide('tile-1', mockAnimationData, { x: 50, y: 50 }, { x: 50, y: 50 });
      }).not.toThrow();
    });
  });

  describe('Animation with config options', () => {
    it('should handle slide animation with delay config', () => {
      const { result } = renderHook(() => useAnimations());

      const createMockAnimationData = (): TileAnimationData => {
        const { result: sharedValueResult } = renderHook(() => {
          const { useSharedValue } = require('react-native-reanimated');
          return {
            translateX: useSharedValue(0),
            translateY: useSharedValue(0),
            scale: useSharedValue(1),
            opacity: useSharedValue(1),
            animationState: useSharedValue('idle'),
          };
        });
        return sharedValueResult.current;
      };

      const mockAnimationData = createMockAnimationData();
      const config = {
        type: AnimationType.SLIDE,
        delay: 100,
        onComplete: jest.fn(),
      };

      expect(() => {
        result.current.animateTileSlide('tile-1', mockAnimationData, { x: 0, y: 0 }, { x: 50, y: 50 }, config);
      }).not.toThrow();

      // Test delayed execution
      expect(config.onComplete).not.toHaveBeenCalled();

      // Fast-forward time to trigger setTimeout
      jest.advanceTimersByTime(100);

      // The animation should have started after the delay
      // Note: The actual animation completion depends on Reanimated's internal timing
    });

    it('should handle merge animation with completion callback', () => {
      const { result } = renderHook(() => useAnimations());

      const createMockAnimationData = (): TileAnimationData => {
        const { result: sharedValueResult } = renderHook(() => {
          const { useSharedValue } = require('react-native-reanimated');
          return {
            translateX: useSharedValue(0),
            translateY: useSharedValue(0),
            scale: useSharedValue(1),
            opacity: useSharedValue(1),
            animationState: useSharedValue('idle'),
          };
        });
        return sharedValueResult.current;
      };

      const mockAnimationData = createMockAnimationData();
      const onComplete = jest.fn();

      expect(() => {
        result.current.animateTileMerge('tile-merge', mockAnimationData, {
          type: AnimationType.MERGE,
          onComplete,
        });
      }).not.toThrow();
    });
  });
});
