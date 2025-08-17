# Monitoring and Observability

## Monitoring Stack

**Application Performance Monitoring:**

- **Frontend Monitoring:** Expo Application Services (EAS) built-in performance monitoring
- **Error Tracking:** Custom error handling system with structured logging
- **Performance Monitoring:** React DevTools Profiler and custom performance metrics
- **Analytics:** Local analytics only - no external tracking services for privacy

**Development and Debugging:**

- **Development Tools:** React Native Debugger, Metro bundler, Expo DevTools
- **Logging:** Console-based logging with categorized error levels
- **Performance Profiling:** Reanimated 3 performance monitoring, memory usage tracking
- **State Management:** Zustand DevTools integration for state debugging

## Key Metrics

**Frontend Performance Metrics:**

- **Core Web Vitals (Web Platform):**

  - First Contentful Paint (FCP) < 1.5 seconds
  - Largest Contentful Paint (LCP) < 2.5 seconds
  - Cumulative Layout Shift (CLS) < 0.1
  - First Input Delay (FID) < 100ms

- **Mobile App Performance:**

  - App launch time < 3 seconds cold start
  - Game move response time < 16ms (60fps requirement)
  - Memory usage < 100MB peak consumption
  - Animation frame rate 60fps sustained

- **Game-Specific Metrics:**
  - Move execution latency
  - Animation completion time
  - Database operation duration
  - State synchronization time

**User Experience Metrics:**

- **Engagement Metrics:**

  - Session duration
  - Games completed per session
  - Feature usage (settings, themes)
  - Error recovery success rate

- **Performance Metrics:**
  - Crash-free session rate > 99.5%
  - Average session length
  - Game completion rate
  - User retention (measured locally)

## Monitoring Implementation

### Performance Monitoring Service

```typescript
// Performance monitoring and metrics collection
class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private readonly maxMetricsPerType = 100;

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  // Measure game move performance
  measureGameMove<T>(operation: () => T, moveType: string): T {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    try {
      const result = operation();

      const duration = performance.now() - startTime;
      const endMemory = this.getMemoryUsage();

      this.recordMetric('game_move', {
        duration,
        moveType,
        memoryDelta: endMemory - startMemory,
        timestamp: Date.now(),
        success: true,
      });

      // Alert if move takes too long
      if (duration > 16) {
        console.warn(`Slow game move detected: ${duration}ms for ${moveType}`);
      }

      return result;
    } catch (error) {
      this.recordMetric('game_move', {
        duration: performance.now() - startTime,
        moveType,
        memoryDelta: 0,
        timestamp: Date.now(),
        success: false,
        error: String(error),
      });
      throw error;
    }
  }

  // Measure animation performance
  measureAnimation(animationType: string, duration: number): void {
    this.recordMetric('animation', {
      type: animationType,
      duration,
      timestamp: Date.now(),
      targetFPS: 60,
      actualFPS: this.calculateFPS(duration),
    });
  }

  // Measure database operations
  async measureDatabaseOperation<T>(
    operation: () => Promise<T>,
    operationType: string
  ): Promise<T> {
    const startTime = performance.now();

    try {
      const result = await operation();
      const duration = performance.now() - startTime;

      this.recordMetric('database', {
        operation: operationType,
        duration,
        timestamp: Date.now(),
        success: true,
      });

      // Alert if database operation is slow
      if (duration > 100) {
        console.warn(
          `Slow database operation: ${duration}ms for ${operationType}`
        );
      }

      return result;
    } catch (error) {
      this.recordMetric('database', {
        operation: operationType,
        duration: performance.now() - startTime,
        timestamp: Date.now(),
        success: false,
        error: String(error),
      });
      throw error;
    }
  }

  // Record custom metrics
  recordMetric(type: string, metric: PerformanceMetric): void {
    if (!this.metrics.has(type)) {
      this.metrics.set(type, []);
    }

    const typeMetrics = this.metrics.get(type)!;
    typeMetrics.push(metric);

    // Keep only recent metrics to prevent memory bloat
    if (typeMetrics.length > this.maxMetricsPerType) {
      typeMetrics.splice(0, typeMetrics.length - this.maxMetricsPerType);
    }
  }

  // Get performance statistics
  getPerformanceStats(type: string): PerformanceStats | null {
    const metrics = this.metrics.get(type);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const durations = metrics
      .filter((m) => typeof m.duration === 'number')
      .map((m) => m.duration);

    if (durations.length === 0) {
      return null;
    }

    const sorted = durations.sort((a, b) => a - b);

    return {
      count: durations.length,
      average: durations.reduce((a, b) => a + b, 0) / durations.length,
      median: sorted[Math.floor(sorted.length / 2)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
      min: sorted[0],
      max: sorted[sorted.length - 1],
      successRate:
        metrics.filter((m) => m.success !== false).length / metrics.length,
    };
  }

  // Monitor memory usage
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      return (performance as any).memory.usedJSHeapSize;
    }
    return 0;
  }

  // Calculate FPS from animation duration
  private calculateFPS(duration: number): number {
    if (duration === 0) return 60;
    return Math.min(60, 1000 / duration);
  }

  // Generate performance report
  generateReport(): PerformanceReport {
    const report: PerformanceReport = {
      timestamp: Date.now(),
      gameMovesStats: this.getPerformanceStats('game_move'),
      animationStats: this.getPerformanceStats('animation'),
      databaseStats: this.getPerformanceStats('database'),
      memoryUsage: this.getMemoryUsage(),
      alerts: this.generateAlerts(),
    };

    return report;
  }

  private generateAlerts(): PerformanceAlert[] {
    const alerts: PerformanceAlert[] = [];

    const gameMoveStats = this.getPerformanceStats('game_move');
    if (gameMoveStats && gameMoveStats.p95 > 16) {
      alerts.push({
        type: 'PERFORMANCE',
        severity: 'HIGH',
        message: `Game moves are slow (P95: ${gameMoveStats.p95.toFixed(2)}ms)`,
        metric: 'game_move_p95',
        threshold: 16,
        actual: gameMoveStats.p95,
      });
    }

    const memoryUsage = this.getMemoryUsage();
    if (memoryUsage > 100 * 1024 * 1024) {
      // 100MB
      alerts.push({
        type: 'MEMORY',
        severity: 'MEDIUM',
        message: `High memory usage detected (${(
          memoryUsage /
          1024 /
          1024
        ).toFixed(2)}MB)`,
        metric: 'memory_usage',
        threshold: 100 * 1024 * 1024,
        actual: memoryUsage,
      });
    }

    return alerts;
  }
}

interface PerformanceMetric {
  duration?: number;
  timestamp: number;
  success?: boolean;
  error?: string;
  [key: string]: any;
}

interface PerformanceStats {
  count: number;
  average: number;
  median: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  successRate: number;
}

interface PerformanceReport {
  timestamp: number;
  gameMovesStats: PerformanceStats | null;
  animationStats: PerformanceStats | null;
  databaseStats: PerformanceStats | null;
  memoryUsage: number;
  alerts: PerformanceAlert[];
}

interface PerformanceAlert {
  type: 'PERFORMANCE' | 'MEMORY' | 'ERROR';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  metric: string;
  threshold: number;
  actual: number;
}
```

### Application Health Monitoring

```typescript
// Application health and status monitoring
class HealthMonitor {
  private healthChecks: Map<string, HealthCheck> = new Map();
  private healthStatus: HealthStatus = 'HEALTHY';
  private lastHealthCheck: number = 0;

  // Register health checks
  registerHealthCheck(name: string, check: HealthCheckFunction): void {
    this.healthChecks.set(name, {
      name,
      check,
      lastRun: 0,
      lastResult: null,
      status: 'UNKNOWN',
    });
  }

  // Run all health checks
  async runHealthChecks(): Promise<HealthReport> {
    const now = Date.now();
    const results: HealthCheckResult[] = [];

    for (const [name, healthCheck] of this.healthChecks) {
      try {
        const startTime = performance.now();
        const result = await healthCheck.check();
        const duration = performance.now() - startTime;

        const checkResult: HealthCheckResult = {
          name,
          status: result.healthy ? 'HEALTHY' : 'UNHEALTHY',
          message: result.message,
          duration,
          timestamp: now,
          details: result.details,
        };

        results.push(checkResult);

        // Update health check record
        healthCheck.lastRun = now;
        healthCheck.lastResult = checkResult;
        healthCheck.status = checkResult.status;
      } catch (error) {
        const checkResult: HealthCheckResult = {
          name,
          status: 'ERROR',
          message: `Health check failed: ${String(error)}`,
          duration: 0,
          timestamp: now,
          error: String(error),
        };

        results.push(checkResult);
        healthCheck.status = 'ERROR';
      }
    }

    // Determine overall health status
    this.healthStatus = this.calculateOverallHealth(results);
    this.lastHealthCheck = now;

    return {
      overall: this.healthStatus,
      timestamp: now,
      checks: results,
    };
  }

  private calculateOverallHealth(results: HealthCheckResult[]): HealthStatus {
    if (results.some((r) => r.status === 'ERROR')) {
      return 'ERROR';
    }
    if (results.some((r) => r.status === 'UNHEALTHY')) {
      return 'UNHEALTHY';
    }
    return 'HEALTHY';
  }

  // Get current health status
  getHealthStatus(): HealthStatus {
    return this.healthStatus;
  }
}

// Health check implementations
const databaseHealthCheck: HealthCheckFunction = async () => {
  try {
    const storageService = new StorageService();
    const startTime = performance.now();

    // Test database connectivity
    await storageService.testConnection();

    const responseTime = performance.now() - startTime;

    return {
      healthy: responseTime < 100,
      message:
        responseTime < 100
          ? `Database healthy (${responseTime.toFixed(2)}ms)`
          : `Database slow (${responseTime.toFixed(2)}ms)`,
      details: { responseTime },
    };
  } catch (error) {
    return {
      healthy: false,
      message: `Database connection failed: ${String(error)}`,
    };
  }
};

const gameStateHealthCheck: HealthCheckFunction = async () => {
  try {
    const gameStore = useGameStore.getState();
    const board = gameStore.board;

    // Validate game state integrity
    if (!Array.isArray(board) || board.length !== 4) {
      return {
        healthy: false,
        message: 'Game board state is corrupted',
      };
    }

    return {
      healthy: true,
      message: 'Game state is valid',
      details: {
        score: gameStore.score,
        gameStatus: gameStore.gameStatus,
      },
    };
  } catch (error) {
    return {
      healthy: false,
      message: `Game state check failed: ${String(error)}`,
    };
  }
};

const memoryHealthCheck: HealthCheckFunction = async () => {
  try {
    const memoryUsage =
      'memory' in performance ? (performance as any).memory.usedJSHeapSize : 0;

    const memoryMB = memoryUsage / 1024 / 1024;
    const healthy = memoryMB < 100; // 100MB threshold

    return {
      healthy,
      message: healthy
        ? `Memory usage normal (${memoryMB.toFixed(2)}MB)`
        : `High memory usage (${memoryMB.toFixed(2)}MB)`,
      details: { memoryUsage, memoryMB },
    };
  } catch (error) {
    return {
      healthy: false,
      message: `Memory check failed: ${String(error)}`,
    };
  }
};

type HealthStatus = 'HEALTHY' | 'UNHEALTHY' | 'ERROR';

interface HealthCheckFunction {
  (): Promise<{
    healthy: boolean;
    message: string;
    details?: Record<string, any>;
  }>;
}

interface HealthCheck {
  name: string;
  check: HealthCheckFunction;
  lastRun: number;
  lastResult: HealthCheckResult | null;
  status: HealthStatus | 'UNKNOWN';
}

interface HealthCheckResult {
  name: string;
  status: HealthStatus;
  message: string;
  duration: number;
  timestamp: number;
  details?: Record<string, any>;
  error?: string;
}

interface HealthReport {
  overall: HealthStatus;
  timestamp: number;
  checks: HealthCheckResult[];
}
```

### Development Monitoring Setup

```typescript
// Development and debugging monitoring setup
class DevMonitor {
  private isProduction = process.env.NODE_ENV === 'production';
  private performanceMonitor = PerformanceMonitor.getInstance();
  private healthMonitor = new HealthMonitor();

  constructor() {
    this.setupMonitoring();
  }

  private setupMonitoring(): void {
    if (this.isProduction) {
      return; // Minimal monitoring in production
    }

    // Register health checks
    this.healthMonitor.registerHealthCheck('database', databaseHealthCheck);
    this.healthMonitor.registerHealthCheck('gameState', gameStateHealthCheck);
    this.healthMonitor.registerHealthCheck('memory', memoryHealthCheck);

    // Set up periodic health checks (development only)
    setInterval(async () => {
      const report = await this.healthMonitor.runHealthChecks();
      if (report.overall !== 'HEALTHY') {
        console.warn('Health check issues detected:', report);
      }
    }, 30000); // Every 30 seconds

    // Set up performance monitoring
    setInterval(() => {
      const report = this.performanceMonitor.generateReport();
      if (report.alerts.length > 0) {
        console.warn('Performance alerts:', report.alerts);
      }
    }, 60000); // Every minute

    // Log performance summary
    setInterval(() => {
      const gameStats =
        this.performanceMonitor.getPerformanceStats('game_move');
      if (gameStats) {
        console.info('Game Performance Summary:', {
          averageMoveTime: `${gameStats.average.toFixed(2)}ms`,
          p95MoveTime: `${gameStats.p95.toFixed(2)}ms`,
          successRate: `${(gameStats.successRate * 100).toFixed(1)}%`,
        });
      }
    }, 300000); // Every 5 minutes
  }

  // Manual diagnostics for debugging
  async runDiagnostics(): Promise<DiagnosticReport> {
    const [healthReport, performanceReport] = await Promise.all([
      this.healthMonitor.runHealthChecks(),
      Promise.resolve(this.performanceMonitor.generateReport()),
    ]);

    return {
      health: healthReport,
      performance: performanceReport,
      environment: {
        isProduction: this.isProduction,
        platform: Platform.OS,
        version: Application.nativeApplicationVersion,
        buildVersion: Application.nativeBuildVersion,
      },
      timestamp: Date.now(),
    };
  }
}

interface DiagnosticReport {
  health: HealthReport;
  performance: PerformanceReport;
  environment: {
    isProduction: boolean;
    platform: string;
    version: string | null;
    buildVersion: string | null;
  };
  timestamp: number;
}

// Initialize monitoring in development
if (__DEV__) {
  const devMonitor = new DevMonitor();

  // Expose diagnostics globally for debugging
  (global as any).runDiagnostics = () => devMonitor.runDiagnostics();
}
```
