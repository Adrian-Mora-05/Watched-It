import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import FriendsScreen from '@/app/(home)/(friends)';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children,
  SafeAreaConsumer: ({ children }: any) =>
    children({
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    }),
  useSafeAreaInsets: () => ({
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  }),
  useSafeAreaFrame: () => ({
    x: 0,
    y: 0,
    width: 390,
    height: 844,
  }),
}));

jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

jest.mock('@/hooks/ctx', () => ({
  useSession: () => ({
    session: 'fake-session-token',
  }),
}));

jest.mock('@/hooks/useLayout', () => ({
  useLayout: () => ({
    headerHeight: 100,
    screenWidth: 390,
    headerPaddingBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  }),
}));

jest.mock('@/services/friend.service', () => ({
  getAvatarUrl: jest.fn(() => 'https://example.com/avatar.jpg'),

  getFriendRequests: jest.fn().mockResolvedValue([
    {
      id: 1,
      sender_name: 'Juan',
      sender_profile_pic: 'juan.jpg',
    },
  ]),

  getFriend: jest.fn().mockResolvedValue([
    {
      id: 1,
      friend_id: '123',
      friend_name: 'Pedro',
      friend_profile_pic: 'pedro.jpg',
      chat_id: 99,
    },
  ]),

  acceptFriendRequest: jest.fn().mockResolvedValue({}),
  denyFriendRequest: jest.fn().mockResolvedValue({}),
}));

jest.mock('@react-native-ama/react-native', () => {
  const { Text, Pressable } = require('react-native');

  return {
    Text,
    Pressable,
  };
});

jest.mock('@/components/ui/Button', () => {
  const { Pressable, Text } = require('react-native');

  return ({
    label,
    onPress,
    accessibilityHint,
  }: any) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
    >
      <Text>{label}</Text>
    </Pressable>
  );
});

jest.mock('@/components/ui/ErrorMessage', () => {
  const { Text, View } = require('react-native');

  return ({ message, visible }: any) =>
    visible ? (
      <View accessibilityRole="alert">
        <Text accessibilityLiveRegion="assertive">
          {message}
        </Text>
      </View>
    ) : null;
});

jest.mock('@/components/ui/OkayMessage', () => {
  const { Text, View } = require('react-native');

  return ({ message, visible }: any) =>
    visible ? (
      <View accessibilityRole="alert">
        <Text accessibilityLiveRegion="polite">
          {message}
        </Text>
      </View>
    ) : null;
});

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('FriendsScreen - Accessibility', () => {

  // ── Roles & Labels ──────────────────────────────────────────────────────────

  describe('roles and labels', () => {

    it('renders the screen heading', async () => {
      render(<FriendsScreen />);

      await waitFor(() => {
        expect(
          screen.getByRole('header', {
            name: 'Amigos',
          })
        ).toBeTruthy();
      });
    });

    it('renders solicitudes section heading', async () => {
      render(<FriendsScreen />);

      await waitFor(() => {
        expect(
          screen.getByRole('header', {
            name: 'Solicitudes (1)',
          })
        ).toBeTruthy();
      });
    });

    it('renders conversaciones section heading', async () => {
      render(<FriendsScreen />);

      await waitFor(() => {
        expect(
          screen.getByRole('header', {
            name: 'Conversaciones (1)',
          })
        ).toBeTruthy();
      });
    });

    it('renders request row with accessible label', async () => {
      render(<FriendsScreen />);

      await waitFor(() => {
        expect(
          screen.getByLabelText(
            'Solicitud de amistad de Juan'
          )
        ).toBeTruthy();
      });
    });

    it('renders confirm button with accessibility hint', async () => {
      render(<FriendsScreen />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', {
            name: 'Confirmar',
          })
        ).toBeTruthy();
      });
    });

    it('renders delete button with accessibility hint', async () => {
      render(<FriendsScreen />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', {
            name: 'Eliminar',
          })
        ).toBeTruthy();
      });
    });

    it('renders friend chat button', async () => {
      render(<FriendsScreen />);

      await waitFor(() => {
        expect(
          screen.getByRole('button', {
            name: 'Abrir chat con Pedro',
          })
        ).toBeTruthy();
      });
    });
  });

  // ── Accessibility Announcements ────────────────────────────────────────────

  describe('screen reader announcements', () => {

    it('announces pending friend requests on load', async () => {
      const announce = jest.spyOn(
        AccessibilityInfo,
        'announceForAccessibility'
      );

      render(<FriendsScreen />);

      await waitFor(() => {
        expect(announce).toHaveBeenCalledWith(
          'Tienes 1 solicitud de amistad pendiente'
        );
      });
    });

    it('announces accepted friend request', async () => {
      const announce = jest.spyOn(
        AccessibilityInfo,
        'announceForAccessibility'
      );

      render(<FriendsScreen />);

      await waitFor(() => {
        fireEvent.press(
          screen.getByRole('button', {
            name: 'Confirmar',
          })
        );
      });

      await waitFor(() => {
        expect(announce).toHaveBeenCalledWith(
          'Solicitud de Juan aceptada'
        );
      });
    });

    it('announces denied friend request', async () => {
      const announce = jest.spyOn(
        AccessibilityInfo,
        'announceForAccessibility'
      );

      render(<FriendsScreen />);

      await waitFor(() => {
        fireEvent.press(
          screen.getByRole('button', {
            name: 'Eliminar',
          })
        );
      });

      await waitFor(() => {
        expect(announce).toHaveBeenCalledWith(
          'Solicitud de Juan eliminada'
        );
      });
    });
  });

  // ── Navigation ──────────────────────────────────────────────────────────────

  describe('navigation', () => {

    it('opens chat when pressing a friend row', async () => {
      const { router } = require('expo-router');

      render(<FriendsScreen />);

      await waitFor(() => {
        fireEvent.press(
          screen.getByRole('button', {
            name: 'Abrir chat con Pedro',
          })
        );
      });

      expect(router.push).toHaveBeenCalledWith({
        pathname: '/[id]',
        params: {
          id: 99,
          name: 'Pedro',
          profilePic: 'pedro.jpg',
        },
      });
    });
  });

  // ── Empty States ────────────────────────────────────────────────────────────

  describe('empty states', () => {

    it('shows empty requests message', async () => {
      const {
        getFriendRequests,
      } = require('@/services/friend.service');

      getFriendRequests.mockResolvedValueOnce([]);

      render(<FriendsScreen />);

      await waitFor(() => {
        expect(
          screen.getByText(
            'No tienes solicitudes de amistad pendientes'
          )
        ).toBeTruthy();
      });
    });

    it('shows empty friends message', async () => {
      const {
        getFriend,
      } = require('@/services/friend.service');

      getFriend.mockResolvedValueOnce([]);

      render(<FriendsScreen />);

      await waitFor(() => {
        expect(
          screen.getByText(
            'No tienes amigos agregados'
          )
        ).toBeTruthy();
      });
    });
  });

  // ── Error Feedback ──────────────────────────────────────────────────────────

  describe('error feedback', () => {

    it('shows error toast when requests fail to load', async () => {
      const {
        getFriendRequests,
      } = require('@/services/friend.service');

      getFriendRequests.mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<FriendsScreen />);

      await waitFor(() => {
        expect(
          screen.getByText(
            /Error al cargar las solicitudes/
          )
        ).toBeTruthy();
      });
    });

    it('shows success toast after accepting request', async () => {
      render(<FriendsScreen />);

      await waitFor(() => {
        fireEvent.press(
          screen.getByRole('button', {
            name: 'Confirmar',
          })
        );
      });

      await waitFor(() => {
        expect(
          screen.getByText(
            'Solicitud de Juan aceptada'
          )
        ).toBeTruthy();
      });
    });
  });

});