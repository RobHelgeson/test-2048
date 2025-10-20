import { Stack } from 'expo-router';

export default function ModalLayout() {
  return (
    <Stack>
      <Stack.Screen name="game-over" options={{ title: 'Game Over', presentation: 'modal' }} />
      <Stack.Screen name="tutorial" options={{ title: 'Tutorial', presentation: 'modal' }} />
    </Stack>
  );
}
