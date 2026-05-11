import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import Chat from '@/app/(home)/(friends)/(chat)/[id]';

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
    replace: jest.fn(),
    back: jest.fn(),
  },
  useLocalSearchParams: () => ({
    id: '1',
    name: 'Juan',
    profilePic: 'profile.jpg',
  }),
}));

jest.mock('@/hooks/ctx', () => ({
  useSession: () => ({
    session:
      'header.eyJzdWIiOiIxMjMifQ==.signature', // payload: { sub: "123" }
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
}));

const mockSendMessage = jest.fn().mockResolvedValue({});
const mockGetMessages = jest.fn().mockResolvedValue([
  {
    id: 1,
    texto: 'Hola',
    fecha_creacion: new Date().toISOString(),
    id_usuario: '999',
  },
]);

const mockSocket = {
  once: jest.fn(),
  emit: jest.fn(),
  on: jest.fn(),
};

jest.mock('@/services/chat.service', () => ({
  sendMessage: (...args: any[]) => mockSendMessage(...args),
  getMessages: (...args: any[]) => mockGetMessages(...args),
  connectSocket: jest.fn(() => mockSocket),
  disconnectSocket: jest.fn(),
}));

jest.mock('@expo/vector-icons/AntDesign', () => 'AntDesign');

jest.mock('@react-native-ama/react-native', () => {
  const { Text, Pressable } = require('react-native');
  return { Text, Pressable };
});

jest.mock('@/components/ui/ReturnButton', () => {
  const { Pressable, Text } = require('react-native');
  return ({ label, onPress }: any) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
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
        <Text accessibilityLiveRegion="assertive">{message}</Text>
      </View>
    ) : null;
});

jest.mock('@/components/ui/Input', () => {
  const { TextInput } = require('react-native');

  return ({ accessibilityLabel, ...props }: any) => (
    <TextInput accessibilityLabel={accessibilityLabel} {...props} />
  );
});

jest.mock('@/components/ui/MessageBubble', () => {
  const { View, Text } = require('react-native');

  return ({ message, senderName }: any) => (
    <View accessibilityRole="text">
      <Text>{senderName}</Text>
      <Text>{message}</Text>
    </View>
  );
});

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('Chat - Accessibility', () => {

  // ── Roles & Labels ──────────────────────────────────────────────────────────

  describe('roles and labels', () => {

    it('renders the screen heading', async () => {
      render(<Chat />);

      await waitFor(() => {
        expect(
          screen.getByRole('header', {
            name: 'Chat con Juan',
          })
        ).toBeTruthy();
      });
    });

    it('renders return button with accessible label', async () => {
      render(<Chat />);

      expect(
        screen.getByRole('button', {
          name: 'Volver',
        })
      ).toBeTruthy();
    });

    it('renders message input with accessibility label', async () => {
      render(<Chat />);

      expect(
        screen.getByLabelText('Campo de mensaje')
      ).toBeTruthy();
    });

    it('renders send button with accessibility label', async () => {
      render(<Chat />);

      expect(
        screen.getByRole('button', {
          name: 'Enviar mensaje',
        })
      ).toBeTruthy();
    });

    it('renders profile image with accessibility label', async () => {
      render(<Chat />);

      expect(
        screen.getByLabelText('Foto de perfil de Juan')
      ).toBeTruthy();
    });
  });

  // ── Keyboard & Input ────────────────────────────────────────────────────────

  describe('keyboard and input', () => {

    it('message input uses send return key type', async () => {
      render(<Chat />);

      const input = screen.getByLabelText('Campo de mensaje');

      expect(input.props.returnKeyType).toBe('send');
    });

    it('message input does not blur on submit', async () => {
      render(<Chat />);

      const input = screen.getByLabelText('Campo de mensaje');

      expect(input.props.blurOnSubmit).toBe(false);
    });
  });

  // ── Error Feedback ──────────────────────────────────────────────────────────

  describe('error feedback', () => {

    it('announces error when sending fails', async () => {
      const announce = jest.spyOn(
        AccessibilityInfo,
        'announceForAccessibility'
      );

      mockSendMessage.mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<Chat />);

      fireEvent.changeText(
        screen.getByLabelText('Campo de mensaje'),
        'Hola'
      );

      fireEvent.press(
        screen.getByRole('button', {
          name: 'Enviar mensaje',
        })
      );

      await waitFor(() => {
        expect(announce).toHaveBeenCalledWith(
          'Error al enviar el mensaje'
        );
      });
    });

    it('shows error toast when message sending fails', async () => {
      mockSendMessage.mockRejectedValueOnce(
        new Error('Network error')
      );

      render(<Chat />);

      fireEvent.changeText(
        screen.getByLabelText('Campo de mensaje'),
        'Hola'
      );

      fireEvent.press(
        screen.getByRole('button', {
          name: 'Enviar mensaje',
        })
      );

      await waitFor(() => {
        expect(
          screen.getByText(/Error al enviar mensaje/)
        ).toBeTruthy();
      });
    });
  });

  // ── Loading State ───────────────────────────────────────────────────────────

  describe('loading state', () => {

    it('send button communicates busy state while sending', async () => {
      mockSendMessage.mockImplementationOnce(
        () => new Promise(() => {})
      );

      render(<Chat />);

      fireEvent.changeText(
        screen.getByLabelText('Campo de mensaje'),
        'Hola'
      );

      fireEvent.press(
        screen.getByRole('button', {
          name: 'Enviar mensaje',
        })
      );

      await waitFor(() => {
        const button = screen.getByRole('button', {
          name: 'Enviar mensaje',
        });

        expect(
          button.props.accessibilityState?.busy
        ).toBe(true);
      });
    });

    it('send button is disabled when input is empty', async () => {
      render(<Chat />);

      const button = screen.getByRole('button', {
        name: 'Enviar mensaje',
      });

      expect(
        button.props.accessibilityState?.disabled
      ).toBe(true);
    });
  });

  // ── Navigation & Success ────────────────────────────────────────────────────

  describe('navigation', () => {

    it('goes back when pressing return button', async () => {
      const { router } = require('expo-router');

      render(<Chat />);

      fireEvent.press(
        screen.getByRole('button', {
          name: 'Volver',
        })
      );

      expect(router.back).toHaveBeenCalled();
    });

    it('announces successful message sending', async () => {
      const announce = jest.spyOn(
        AccessibilityInfo,
        'announceForAccessibility'
      );

      render(<Chat />);

      fireEvent.changeText(
        screen.getByLabelText('Campo de mensaje'),
        'Hola'
      );

      fireEvent.press(
        screen.getByRole('button', {
          name: 'Enviar mensaje',
        })
      );

      await waitFor(() => {
        expect(announce).toHaveBeenCalledWith(
          'Mensaje enviado'
        );
      });
    });
  });

});