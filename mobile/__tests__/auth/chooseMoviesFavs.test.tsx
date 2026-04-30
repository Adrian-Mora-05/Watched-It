import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ChooseFavsScreen from '@/app/(auth)/chooseMovieFavs';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({
    email: 'test@email.com',
    password: 'password123',
    name: 'Test User',
    photoUri: undefined,
  }),
}));

jest.mock('@/services/movie.service', () => ({
  baseUrl: 'http://localhost:3000/',
  getMovies: jest.fn().mockResolvedValue({
    data: [
      { id: 1, title: 'Película 1', image_link: 'img1.jpg' },
      { id: 2, title: 'Película 2', image_link: 'img2.jpg' },
      { id: 3, title: 'Película 3', image_link: 'img3.jpg' },
    ],
  }),
}));

jest.mock('@react-native-ama/react-native', () => {
  const { Text, Pressable } = require('react-native');
  return { Text, TouchableOpacity: Pressable, Pressable };
});

jest.mock('@/components/ui/ReturnButton', () => {
  const { Pressable, Text } = require('react-native');
  return ({ label, onPress }: any) => <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label}><Text>{label}</Text></Pressable>;
});

jest.mock('@/components/ui/Button', () => {
  const { Pressable, Text } = require('react-native');
  return ({ label, onPress, disabled, loading }: any) => (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
    >
      <Text>{label}</Text>
    </Pressable>
  );
});

jest.mock('@/components/ui/imageButton', () => {
  const { Pressable } = require('react-native');
  return ({ onPress, accessibilityLabel, accessibilityHint, accessibilityState }: any) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
    />
  );
});

jest.mock('@/components/ui/ErrorMessage', () => {
  const { Text, View } = require('react-native');
  return ({ message, visible }: any) =>
    visible && message ? (
      <View accessibilityRole="alert" accessibilityLiveRegion="assertive">
        <Text>{message}</Text>
      </View>
    ) : null;
});

jest.mock('@/components/ui/SearchFilter', () => () => null);

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('ChooseMovieFavsScreen - Accessibility', () => {

  describe('roles and labels', () => {
    it('renders the screen heading', async () => {
      render(<ChooseFavsScreen />);
      await waitFor(() => {
        expect(screen.getByRole('header')).toBeTruthy();
      });
    });

    it('renders the return button with correct label', async () => {
      render(<ChooseFavsScreen />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Volver' })).toBeTruthy();
      });
    });

    it('renders continue button as disabled initially', async () => {
      render(<ChooseFavsScreen />);
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Selecciona 3 películas más/ });
        expect(button.props.accessibilityState?.disabled).toBe(true);
      });
    });

    it('movies are rendered with accessible labels', async () => {
      render(<ChooseFavsScreen />);
      await waitFor(() => {
        expect(screen.getByLabelText('Película 1, no seleccionada')).toBeTruthy();
        expect(screen.getByLabelText('Película 2, no seleccionada')).toBeTruthy();
        expect(screen.getByLabelText('Película 3, no seleccionada')).toBeTruthy();
      });
    });
  });

  describe('selection behavior', () => {
    it('movie label changes to seleccionada after pressing', async () => {
      render(<ChooseFavsScreen />);
      await waitFor(() => screen.getByLabelText('Película 1, no seleccionada'));

      fireEvent.press(screen.getByLabelText('Película 1, no seleccionada'));

      await waitFor(() => {
        expect(screen.getByLabelText('Película 1, seleccionada')).toBeTruthy();
      });
    });

    it('accessibilityState.selected is true after selecting a movie', async () => {
      render(<ChooseFavsScreen />);
      await waitFor(() => screen.getByLabelText('Película 1, no seleccionada'));

      fireEvent.press(screen.getByLabelText('Película 1, no seleccionada'));

      await waitFor(() => {
        const movie = screen.getByLabelText('Película 1, seleccionada');
        expect(movie.props.accessibilityState?.selected).toBe(true);
      });
    });

    it('cannot select more than 3 movies', async () => {
      const { getMovies } = require('@/services/movie.service');
      getMovies.mockResolvedValueOnce({
        data: [
          { id: 1, title: 'Película 1', image_link: 'img1.jpg' },
          { id: 2, title: 'Película 2', image_link: 'img2.jpg' },
          { id: 3, title: 'Película 3', image_link: 'img3.jpg' },
          { id: 4, title: 'Película 4', image_link: 'img4.jpg' },
        ],
      });

      render(<ChooseFavsScreen />);
      await waitFor(() => screen.getByLabelText('Película 1, no seleccionada'));

      fireEvent.press(screen.getByLabelText('Película 1, no seleccionada'));
      fireEvent.press(screen.getByLabelText('Película 2, no seleccionada'));
      fireEvent.press(screen.getByLabelText('Película 3, no seleccionada'));
      fireEvent.press(screen.getByLabelText('Película 4, no seleccionada'));

      await waitFor(() => {
        expect(screen.queryByLabelText('Película 4, seleccionada')).toBeNull();
      });
    });

    it('deselects a movie when pressed again', async () => {
      render(<ChooseFavsScreen />);
      await waitFor(() => screen.getByLabelText('Película 1, no seleccionada'));

      fireEvent.press(screen.getByLabelText('Película 1, no seleccionada'));
      await waitFor(() => screen.getByLabelText('Película 1, seleccionada'));

      fireEvent.press(screen.getByLabelText('Película 1, seleccionada'));
      await waitFor(() => {
        expect(screen.getByLabelText('Película 1, no seleccionada')).toBeTruthy();
      });
    });
  });

  describe('continue button state', () => {
    it('button label shows remaining count when less than 3 selected', async () => {
      render(<ChooseFavsScreen />);
      await waitFor(() => screen.getByLabelText('Película 1, no seleccionada'));

      fireEvent.press(screen.getByLabelText('Película 1, no seleccionada'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Selecciona 2 películas más' })).toBeTruthy();
      });
    });

    it('button becomes enabled after selecting 3 movies', async () => {
      render(<ChooseFavsScreen />);
      await waitFor(() => screen.getByLabelText('Película 1, no seleccionada'));

      fireEvent.press(screen.getByLabelText('Película 1, no seleccionada'));
      fireEvent.press(screen.getByLabelText('Película 2, no seleccionada'));
      fireEvent.press(screen.getByLabelText('Película 3, no seleccionada'));

      await waitFor(() => {
        const button = screen.getByRole('button', { name: 'Continuar' });
        expect(button.props.accessibilityState?.disabled).toBe(false);
      });
    });

    it('navigates to chooseShowsFavs after selecting 3 movies and pressing Continuar', async () => {
      const { router } = require('expo-router');
      render(<ChooseFavsScreen />);
      await waitFor(() => screen.getByLabelText('Película 1, no seleccionada'));

      fireEvent.press(screen.getByLabelText('Película 1, no seleccionada'));
      fireEvent.press(screen.getByLabelText('Película 2, no seleccionada'));
      fireEvent.press(screen.getByLabelText('Película 3, no seleccionada'));
      fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));

      await waitFor(() => {
        expect(router.push).toHaveBeenCalledWith(
          expect.objectContaining({ pathname: '/(auth)/chooseShowsFavs' })
        );
      });
    });
  });

  describe('loading state', () => {
    it('shows loading indicator while fetching movies', async () => {
      const { getMovies } = require('@/services/movie.service');
      getMovies.mockImplementationOnce(() => new Promise(() => {})); // never resolves

      render(<ChooseFavsScreen />);
      expect(screen.getByLabelText('Cargando más películas')).toBeTruthy();
    });
  });

  describe('error state', () => {
    it('shows error toast when fetching movies fails', async () => {
      const { getMovies } = require('@/services/movie.service');
      getMovies.mockRejectedValueOnce(new Error('Network error'));

      render(<ChooseFavsScreen />);

      await waitFor(() => {
        expect(screen.getByText('Error al cargar las películas')).toBeTruthy();
      });
    });
  });
});