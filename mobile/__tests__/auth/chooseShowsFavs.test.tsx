import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ChooseShowsFavsScreen from '@/app/(auth)/chooseShowsFavs';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('expo-router', () => ({
  router: { replace: jest.fn(), back: jest.fn() },
  useLocalSearchParams: () => ({
    email: 'test@email.com',
    password: 'password123',
    name: 'Test User',
    photoUri: undefined,
    favs: JSON.stringify([1, 2, 3]),
  }),
}));

jest.mock('@/services/show.service', () => ({
  baseUrl: 'http://localhost:3000/',
  getShows: jest.fn().mockResolvedValue({
    data: [
      { id: 1, title: 'Serie 1', image_link: 'img1.jpg' },
      { id: 2, title: 'Serie 2', image_link: 'img2.jpg' },
      { id: 3, title: 'Serie 3', image_link: 'img3.jpg' },
    ],
  }),
}));

jest.mock('@/services/auth.service', () => ({
  signup: jest.fn().mockResolvedValue({}),
}));

jest.mock('@/hooks/ctx', () => ({
  useSession: () => ({ signIn: jest.fn().mockResolvedValue({}) }),
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

describe('ChooseShowsFavsScreen - Accessibility', () => {

  describe('roles and labels', () => {
    it('renders the screen heading', async () => {
      render(<ChooseShowsFavsScreen />);
      await waitFor(() => {
        expect(screen.getByRole('header')).toBeTruthy();
      });
    });

    it('renders the return button with correct label', async () => {
      render(<ChooseShowsFavsScreen />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Volver' })).toBeTruthy();
      });
    });

    it('renders register button as disabled initially', async () => {
      render(<ChooseShowsFavsScreen />);
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /Selecciona 3 series más/ });
        expect(button.props.accessibilityState?.disabled).toBe(true);
      });
    });

    it('shows are rendered with accessible labels', async () => {
      render(<ChooseShowsFavsScreen />);
      await waitFor(() => {
        expect(screen.getByLabelText('Serie 1, no seleccionada')).toBeTruthy();
        expect(screen.getByLabelText('Serie 2, no seleccionada')).toBeTruthy();
        expect(screen.getByLabelText('Serie 3, no seleccionada')).toBeTruthy();
      });
    });
  });

  describe('selection behavior', () => {
    it('show label changes to seleccionada after pressing', async () => {
      render(<ChooseShowsFavsScreen />);
      await waitFor(() => screen.getByLabelText('Serie 1, no seleccionada'));

      fireEvent.press(screen.getByLabelText('Serie 1, no seleccionada'));

      await waitFor(() => {
        expect(screen.getByLabelText('Serie 1, seleccionada')).toBeTruthy();
      });
    });

    it('accessibilityState.selected is true after selecting a show', async () => {
      render(<ChooseShowsFavsScreen />);
      await waitFor(() => screen.getByLabelText('Serie 1, no seleccionada'));

      fireEvent.press(screen.getByLabelText('Serie 1, no seleccionada'));

      await waitFor(() => {
        const show = screen.getByLabelText('Serie 1, seleccionada');
        expect(show.props.accessibilityState?.selected).toBe(true);
      });
    });

    it('cannot select more than 3 shows', async () => {
      const { getShows } = require('@/services/show.service');
      getShows.mockResolvedValueOnce({
        data: [
          { id: 1, title: 'Serie 1', image_link: 'img1.jpg' },
          { id: 2, title: 'Serie 2', image_link: 'img2.jpg' },
          { id: 3, title: 'Serie 3', image_link: 'img3.jpg' },
          { id: 4, title: 'Serie 4', image_link: 'img4.jpg' },
        ],
      });

      render(<ChooseShowsFavsScreen />);
      await waitFor(() => screen.getByLabelText('Serie 1, no seleccionada'));

      fireEvent.press(screen.getByLabelText('Serie 1, no seleccionada'));
      fireEvent.press(screen.getByLabelText('Serie 2, no seleccionada'));
      fireEvent.press(screen.getByLabelText('Serie 3, no seleccionada'));
      fireEvent.press(screen.getByLabelText('Serie 4, no seleccionada'));

      await waitFor(() => {
        expect(screen.queryByLabelText('Serie 4, seleccionada')).toBeNull();
      });
    });

    it('deselects a show when pressed again', async () => {
      render(<ChooseShowsFavsScreen />);
      await waitFor(() => screen.getByLabelText('Serie 1, no seleccionada'));

      fireEvent.press(screen.getByLabelText('Serie 1, no seleccionada'));
      await waitFor(() => screen.getByLabelText('Serie 1, seleccionada'));

      fireEvent.press(screen.getByLabelText('Serie 1, seleccionada'));
      await waitFor(() => {
        expect(screen.getByLabelText('Serie 1, no seleccionada')).toBeTruthy();
      });
    });
  });

  describe('register button state', () => {
    it('button label shows remaining count when less than 3 selected', async () => {
      render(<ChooseShowsFavsScreen />);
      await waitFor(() => screen.getByLabelText('Serie 1, no seleccionada'));

      fireEvent.press(screen.getByLabelText('Serie 1, no seleccionada'));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Selecciona 2 series más' })).toBeTruthy();
      });
    });

    it('button becomes enabled after selecting 3 shows', async () => {
      render(<ChooseShowsFavsScreen />);
      await waitFor(() => screen.getByLabelText('Serie 1, no seleccionada'));

      fireEvent.press(screen.getByLabelText('Serie 1, no seleccionada'));
      fireEvent.press(screen.getByLabelText('Serie 2, no seleccionada'));
      fireEvent.press(screen.getByLabelText('Serie 3, no seleccionada'));

      await waitFor(() => {
        const button = screen.getByRole('button', { name: 'Registrarse' });
        expect(button.props.accessibilityState?.disabled).toBe(false);
      });
    });
  });

  describe('navigation', () => {
    it('calls signup and navigates to home after registering', async () => {
      const { router } = require('expo-router');
      const { signup } = require('@/services/auth.service');

      render(<ChooseShowsFavsScreen />);
      await waitFor(() => screen.getByLabelText('Serie 1, no seleccionada'));

      fireEvent.press(screen.getByLabelText('Serie 1, no seleccionada'));
      fireEvent.press(screen.getByLabelText('Serie 2, no seleccionada'));
      fireEvent.press(screen.getByLabelText('Serie 3, no seleccionada'));
      fireEvent.press(screen.getByRole('button', { name: 'Registrarse' }));

      await waitFor(() => {
        expect(signup).toHaveBeenCalled();
        expect(router.replace).toHaveBeenCalledWith('/(home)');
      });
    });
  });

  describe('loading state', () => {
    it('shows loading indicator while fetching shows', async () => {
      const { getShows } = require('@/services/show.service');
      getShows.mockImplementationOnce(() => new Promise(() => {}));

      render(<ChooseShowsFavsScreen />);
      expect(screen.getByLabelText('Cargando más series')).toBeTruthy();
    });
  });

    describe('error state', () => {
    it('shows error toast when fetching shows fails', async () => {
        const { getShows } = require('@/services/show.service');
        getShows.mockRejectedValueOnce(new Error('Network error'));

        render(<ChooseShowsFavsScreen />);

        await waitFor(() => {
        expect(screen.getByText('Error al cargar las series')).toBeTruthy();
        });
    });
    });
});