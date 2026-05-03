import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import LogContent from '@/app/(home)/(logger)/logContent';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    back: jest.fn(),
  },
  useLocalSearchParams: () => ({
    id_content: '1',
    title: 'Interstellar',
    type: 'Movie',
    link: encodeURIComponent('interstellar.jpg'),
  }),
}));

jest.mock('react-native', () => {
  const rn = jest.requireActual('react-native');
  rn.TouchableWithoutFeedback = ({ children }: any) => children;
  return rn;
});

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }: any) => children,
  SafeAreaView: ({ children }: any) => children,
}));

jest.mock('react-native-css-interop', () => ({
  wrapJSX: (_type: any, props: any) => props,
}));


let mockSession: string | null = 'mock-token';

jest.mock('@/hooks/ctx', () => ({
  useSession: () => ({ session: mockSession }),
}));

jest.mock('@/services/catalog.service', () => ({
  baseUrl: 'https://test.com/',
}));

jest.mock('@/services/user.service', () => ({
  logContent: jest.fn().mockResolvedValue({}),
}));

jest.mock('@/components/ui/ErrorMessage', () => {
  const { View } = require('react-native');
  return ({ visible, message }: any) =>
    visible ? <View accessibilityLabel={message} /> : <View />;
});

jest.mock('@/components/ui/ReturnButton', () => {
  const { Pressable } = require('react-native');
  return ({ onPress, label }: any) => (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} />
  );
});

jest.mock('@/components/ui/Button', () => {
  const { Pressable, Text } = require('react-native');
  return ({ onPress, label, disabled, loading }: any) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
    >
      <Text>{label}</Text>
    </Pressable>
  );
});

jest.mock('@react-native-ama/react-native', () => {
  const { Pressable, Text } = require('react-native');
  return {
    Pressable: ({ onPress, accessibilityLabel, accessibilityHint, accessibilityState, accessibilityRole, children, style }: any) => (
      <Pressable
        onPress={onPress}
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        accessibilityState={accessibilityState}
        style={style}
      >
        {children}
      </Pressable>
    ),
    Text: ({ children, accessibilityRole, accessibilityLabel, accessibilityLiveRegion, ...props }: any) => (
      <Text
        accessibilityRole={accessibilityRole}
        accessibilityLabel={accessibilityLabel}
        accessibilityLiveRegion={accessibilityLiveRegion}
        {...props}
      >
        {children}
      </Text>
    ),
  };
});

jest.mock('expo-image', () => ({
  Image: ({ accessibilityLabel }: any) => {
    const { View } = require('react-native');
    return <View accessibilityLabel={accessibilityLabel} />;
  },
}));

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('LogContent - Accessibility', () => {
    beforeEach(() => {
    jest.clearAllMocks();
    mockSession = 'mock-token';
    });

  // ── Roles & Labels ──────────────────────────────────────────────────────────

  describe('roles and labels', () => {
    it('renders the page header', async () => {
      render(<LogContent />);
      await waitFor(() => {
        expect(screen.getByRole('header', { name: 'Nueva entrada' })).toBeTruthy();
      });
    });

    it('renders the content title with type label', async () => {
      render(<LogContent />);
      await waitFor(() => {
        expect(screen.getByRole('header', { name: 'Interstellar, película' })).toBeTruthy();
      });
    });

    it('renders the poster image with accessible label', async () => {
      render(<LogContent />);
      await waitFor(() => {
        expect(screen.getByLabelText('Póster de Interstellar')).toBeTruthy();
      });
    });

    it('renders all 5 star buttons with correct labels', async () => {
      render(<LogContent />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: '1 estrella' })).toBeTruthy();
        expect(screen.getByRole('button', { name: '2 estrellas' })).toBeTruthy();
        expect(screen.getByRole('button', { name: '3 estrellas' })).toBeTruthy();
        expect(screen.getByRole('button', { name: '4 estrellas' })).toBeTruthy();
        expect(screen.getByRole('button', { name: '5 estrellas' })).toBeTruthy();
      });
    });

    it('review input is labelled and accessible', async () => {
      render(<LogContent />);
      await waitFor(() => {
        expect(screen.getByLabelText('¿Qué te pareció la película o serie?')).toBeTruthy();
      });
    });

    it('submit and cancel buttons are accessible', async () => {
      render(<LogContent />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Continuar' })).toBeTruthy();
        expect(screen.getByRole('button', { name: 'Cancelar' })).toBeTruthy();
      });
    });

    it('return button is accessible', async () => {
      render(<LogContent />);
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Volver' })).toBeTruthy();
      });
    });
  });

  // ── Star Rating ─────────────────────────────────────────────────────────────

  describe('star rating', () => {
    it('stars are unselected by default', async () => {
      render(<LogContent />);
      await waitFor(() => {
        [1, 2, 3, 4, 5].forEach(star => {
          const label = star === 1 ? '1 estrella' : `${star} estrellas`;
          const btn = screen.getByRole('button', { name: label });
          expect(btn.props.accessibilityState?.selected).toBe(false);
        });
      });
    });

    it('selecting star 3 marks stars 1-3 as selected', async () => {
      render(<LogContent />);
      await waitFor(() => screen.getByRole('button', { name: '3 estrellas' }));

      fireEvent.press(screen.getByRole('button', { name: '3 estrellas' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '1 estrella' }).props.accessibilityState?.selected).toBe(true);
        expect(screen.getByRole('button', { name: '2 estrellas' }).props.accessibilityState?.selected).toBe(true);
        expect(screen.getByRole('button', { name: '3 estrellas' }).props.accessibilityState?.selected).toBe(true);
        expect(screen.getByRole('button', { name: '4 estrellas' }).props.accessibilityState?.selected).toBe(false);
        expect(screen.getByRole('button', { name: '5 estrellas' }).props.accessibilityState?.selected).toBe(false);
      });
    });

    it('selecting star 5 marks all stars as selected', async () => {
      render(<LogContent />);
      await waitFor(() => screen.getByRole('button', { name: '5 estrellas' }));

      fireEvent.press(screen.getByRole('button', { name: '5 estrellas' }));

      await waitFor(() => {
        [1, 2, 3, 4, 5].forEach(star => {
          const label = star === 1 ? '1 estrella' : `${star} estrellas`;
          expect(screen.getByRole('button', { name: label }).props.accessibilityState?.selected).toBe(true);
        });
      });
    });

    it('star hint changes when selected', async () => {
      render(<LogContent />);
      await waitFor(() => screen.getByRole('button', { name: '3 estrellas' }));

      fireEvent.press(screen.getByRole('button', { name: '3 estrellas' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '3 estrellas' }).props.accessibilityHint)
          .toBe('Puntuación actual seleccionada');
      });
    });
  });

  // ── Error Feedback ──────────────────────────────────────────────────────────

  describe('error feedback', () => {
    it('shows error when submitting without rating', async () => {
      render(<LogContent />);
      await waitFor(() => screen.getByRole('button', { name: 'Continuar' }));
      fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
      await waitFor(() => {
        expect(screen.getByLabelText('Por favor selecciona una puntuación')).toBeTruthy();
      });
    });

    it('shows error when session is missing', async () => {
      mockSession = null;
      render(<LogContent />);
      await waitFor(() => screen.getByRole('button', { name: 'Continuar' }));
      fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
      await waitFor(() => {
        expect(screen.getByLabelText('No hay sesión activa')).toBeTruthy();
      });
    });

    it('shows error toast when logContent service fails', async () => {
      const { logContent } = require('@/services/user.service');
      logContent.mockRejectedValueOnce(new Error('Server error'));
      render(<LogContent />);
      await waitFor(() => screen.getByRole('button', { name: '5 estrellas' }));
      fireEvent.press(screen.getByRole('button', { name: '5 estrellas' }));
      fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));
      await waitFor(() => {
        expect(screen.getByLabelText('Error al registrar el contenido')).toBeTruthy();
      });
    });
  });

  // ── Loading State ───────────────────────────────────────────────────────────

  describe('loading state', () => {
    it('submit button shows busy state while submitting', async () => {
      const { logContent } = require('@/services/user.service');
      logContent.mockImplementationOnce(() => new Promise(() => {}));

      render(<LogContent />);
      await waitFor(() => screen.getByRole('button', { name: '5 estrellas' }));

      fireEvent.press(screen.getByRole('button', { name: '5 estrellas' }));
      fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));

      await waitFor(() => {
        const button = screen.getByRole('button', { name: 'Registrando...' });
        expect(button.props.accessibilityState?.busy).toBe(true);
        expect(button.props.accessibilityState?.disabled).toBe(true);
      });
    });

    it('cancel button is disabled while submitting', async () => {
      const { logContent } = require('@/services/user.service');
      logContent.mockImplementationOnce(() => new Promise(() => {}));

      render(<LogContent />);
      await waitFor(() => screen.getByRole('button', { name: '5 estrellas' }));

      fireEvent.press(screen.getByRole('button', { name: '5 estrellas' }));
      fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));

      await waitFor(() => {
        const cancel = screen.getByRole('button', { name: 'Cancelar' });
        expect(cancel.props.accessibilityState?.disabled).toBe(true);
      });
    });
  });

  // ── Input ───────────────────────────────────────────────────────────────────

  describe('review input', () => {
    it('captures text input correctly', async () => {
      render(<LogContent />);
      await waitFor(() => screen.getByLabelText('¿Qué te pareció la película o serie?'));

      fireEvent.changeText(
        screen.getByLabelText('¿Qué te pareció la película o serie?'),
        'Una película increíble'
      );

      expect(screen.getByLabelText('¿Qué te pareció la película o serie?').props.value)
        .toBe('Una película increíble');
    });

    it('input has correct accessibility hint', async () => {
      render(<LogContent />);
      await waitFor(() => {
        const input = screen.getByLabelText('¿Qué te pareció la película o serie?');
        expect(input.props.accessibilityHint).toBe('Campo opcional. Escribe tu opinión sobre el contenido');
      });
    });
  });

  // ── Navigation & Success ────────────────────────────────────────────────────

  describe('navigation', () => {
        it('navigates home after successful submit', async () => {
        const { router } = require('expo-router');

        render(<LogContent />);
        await waitFor(() => screen.getByRole('button', { name: '5 estrellas' }));

        fireEvent.press(screen.getByRole('button', { name: '5 estrellas' }));
        fireEvent.changeText(
            screen.getByLabelText('¿Qué te pareció la película o serie?'),
            'Excelente película'
        );
        fireEvent.press(screen.getByRole('button', { name: 'Continuar' }));

        await waitFor(() => {
            expect(router.replace).toHaveBeenCalledWith('/(home)');
        });
        });

        it('navigates back when cancel is pressed', async () => {
        const { router } = require('expo-router');

        render(<LogContent />);
        await waitFor(() => screen.getByRole('button', { name: 'Cancelar' }));
        fireEvent.press(screen.getByRole('button', { name: 'Cancelar' }));

        expect(router.back).toHaveBeenCalled();
        });

        it('navigates back when return button is pressed', async () => {
        const { router } = require('expo-router');

        render(<LogContent />);
        await waitFor(() => screen.getByRole('button', { name: 'Volver' }));
        fireEvent.press(screen.getByRole('button', { name: 'Volver' }));

        expect(router.back).toHaveBeenCalled();
});
  });
});