import React, { Component, ErrorInfo, ReactNode } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Navigation error:', error, errorInfo);
    // Log to error service if available in the future
  }

  private handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <ThemedView style={styles.container}>
          <ThemedText type="title" style={styles.title}>
            Oops! Something went wrong
          </ThemedText>
          <ThemedText style={styles.message}>
            The app encountered an unexpected error. You can try again or
            restart the app.
          </ThemedText>
          <ThemedView style={styles.buttonContainer}>
            <ThemedText style={styles.retryButton} onPress={this.handleRetry}>
              Try Again
            </ThemedText>
          </ThemedView>
        </ThemedView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonContainer: {
    marginTop: 16,
  },
  retryButton: {
    textAlign: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    color: '#007AFF',
    fontWeight: '600',
  },
});
