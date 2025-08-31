/**
 * Navigation types for type-safe routing with Expo Router
 */

export type RootStackParamList = {
  '(tabs)': undefined;
  '+not-found': undefined;
  modal: {
    'game-over': undefined;
    tutorial: undefined;
  };
};

export type TabParamList = {
  index: undefined;
  settings: undefined;
  stats: undefined;
  about: undefined;
};

export type AppRoute = keyof RootStackParamList | keyof TabParamList;

/**
 * Navigation helper interfaces as specified in component requirements
 */
export interface RouteManager {
  navigateToScreen(route: AppRoute): void;
  handleDeepLink(url: string): void;
  getCurrentRoute(): string;
  canGoBack(): boolean;
}
