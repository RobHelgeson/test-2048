// UI-related type definitions

export interface ButtonProps {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
}

export interface TileProps {
  value: number;
  position: {
    row: number;
    col: number;
  };
}
