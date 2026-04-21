import { render, fireEvent, waitFor, cleanup } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import SignUp from '@/app/(auth)/sign-up';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), back: jest.fn() },
}));

jest.mock('@react-native-ama/react-native', () => {
  const { Text, TouchableOpacity } = require('react-native');
  return {
    Text: ({ children, ...props }: any) => <Text {...props}>{children}</Text>,
    TouchableOpacity: ({ children, ...props }: any) => <TouchableOpacity {...props}>{children}</TouchableOpacity>,
  };
});

jest.mock('@react-native-ama/forms', () => ({
  Form: ({ children }: any) => children,
}));

jest.mock('@/components/ui/Input', () => {
  const { TextInput, View, Text } = require('react-native');
  return ({ label, error, ...props }: any) => (
    <View>
      <TextInput accessibilityLabel={label} {...props} />
      {error && <Text accessibilityLiveRegion="assertive">{error}</Text>}
    </View>
  );
});

jest.mock('@/components/ui/Button', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return ({ label, onPress, loading }: any) => (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy: !!loading }}
      onPress={onPress}
    >
      <Text>{label}</Text>
    </TouchableOpacity>
  );
});

jest.mock('@/components/ui/ReturnButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return ({ label, onPress }: any) => (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} onPress={onPress}>
      <Text>{label}</Text>
    </TouchableOpacity>
  );
});

jest.mock('@/components/ui/imageButton', () => {
  const { TouchableOpacity } = require('react-native');
  return ({ onPress, accessibilityLabel, accessibilityHint }: any) => (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      onPress={onPress}
    />
  );
});

jest.mock('@/components/ui/ErrorMessage', () => {
  const { Text } = require('react-native');
  return ({ message, visible }: any) =>
    visible ? <Text accessibilityLiveRegion="assertive">{message}</Text> : null;
});

jest.mock('@/components/camera/CameraProvider', () => ({
  CameraModule: () => null,
}));

jest.mock('@expo/vector-icons/Feather', () => 'Feather');

// ─── Setup/Teardown ───────────────────────────────────────────────────────────

afterEach(() => {
  cleanup();
  jest.clearAllMocks();
});

// ─── Helper ───────────────────────────────────────────────────────────────────

const renderSignUp = () => render(<SignUp />);

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('SignUp Screen - Accessibility', () => {

  // ── Roles & Labels ──────────────────────────────────────────────────────────

  describe('roles and labels', () => {
    it('renders the sign up heading', () => {
      const { getByRole } = renderSignUp();
      expect(getByRole('header', { name: 'Registrarse' })).toBeTruthy();
    });

    it('name field is labelled and accessible', () => {
      const { getByLabelText } = renderSignUp();
      expect(getByLabelText('Nombre')).toBeTruthy();
    });

    it('email field is labelled and accessible', () => {
      const { getByLabelText } = renderSignUp();
      expect(getByLabelText('Correo electrónico')).toBeTruthy();
    });

    it('password field is labelled and accessible', () => {
      const { getByLabelText } = renderSignUp();
      expect(getByLabelText('Contraseña')).toBeTruthy();
    });

    it('submit button has an accessible name', () => {
      const { getByRole } = renderSignUp();
      expect(getByRole('button', { name: 'Continuar' })).toBeTruthy();
    });

    it('return button has an accessible name', () => {
      const { getByRole } = renderSignUp();
      expect(getByRole('button', { name: 'Volver' })).toBeTruthy();
    });

    it('profile photo button has an accessible name and hint', () => {
      const { getByLabelText } = renderSignUp();
      const btn = getByLabelText('Foto de perfil');
      expect(btn).toBeTruthy();
      expect(btn.props.accessibilityHint).toBe('Agrega una foto de perfil');
    });
  });

  // ── Keyboard & Input ────────────────────────────────────────────────────────

  describe('keyboard and input', () => {
    it('name field uses default keyboard', () => {
      const { getByLabelText } = renderSignUp();
      expect(getByLabelText('Nombre').props.keyboardType).toBe('default');
    });

    it('name field disables auto-capitalisation', () => {
      const { getByLabelText } = renderSignUp();
      expect(getByLabelText('Nombre').props.autoCapitalize).toBe('none');
    });

    it('name field has username autocomplete hint', () => {
      const { getByLabelText } = renderSignUp();
      expect(getByLabelText('Nombre').props.autoComplete).toBe('username');
    });

    it('email field uses email keyboard', () => {
      const { getByLabelText } = renderSignUp();
      expect(getByLabelText('Correo electrónico').props.keyboardType).toBe('email-address');
    });

    it('email field disables auto-capitalisation', () => {
      const { getByLabelText } = renderSignUp();
      expect(getByLabelText('Correo electrónico').props.autoCapitalize).toBe('none');
    });

    it('email field has email autocomplete hint', () => {
      const { getByLabelText } = renderSignUp();
      expect(getByLabelText('Correo electrónico').props.autoComplete).toBe('email');
    });

    it('password field is secure', () => {
      const { getByLabelText } = renderSignUp();
      expect(getByLabelText('Contraseña').props.secureTextEntry).toBe(true);
    });
  });

  // ── Error Feedback ──────────────────────────────────────────────────────────

  describe('error feedback', () => {
    it('shows name error when submitting empty form', async () => {
      const { getByRole, findByText } = renderSignUp();
      fireEvent.press(getByRole('button', { name: 'Continuar' }));
      const error = await findByText(/nombre/i);
      expect(error.props.accessibilityLiveRegion).toBe('assertive');
    });

    it('shows email error when submitting empty form', async () => {
      const { getByRole, findByText } = renderSignUp();
      fireEvent.press(getByRole('button', { name: 'Continuar' }));
      const error = await findByText(/correo/i);
      expect(error.props.accessibilityLiveRegion).toBe('assertive');
    });

    it('shows password error when submitting empty form', async () => {
      const { getByRole, findByText } = renderSignUp();
      fireEvent.press(getByRole('button', { name: 'Continuar' }));
      const error = await findByText(/contraseña/i);
      expect(error.props.accessibilityLiveRegion).toBe('assertive');
    });

    it('announces errors to screen readers via AccessibilityInfo', async () => {
      const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
      const { getByRole } = renderSignUp();
      fireEvent.press(getByRole('button', { name: 'Continuar' }));
      await waitFor(() => {
        expect(announce).toHaveBeenCalledWith(
          expect.stringContaining('Errores en el formulario')
        );
      });
    });
  });

  // ── Navigation ──────────────────────────────────────────────────────────────

  describe('navigation', () => {
    it('goes back when return button is pressed', () => {
      const { router } = require('expo-router');
      const { getByRole } = renderSignUp();
      fireEvent.press(getByRole('button', { name: 'Volver' }));
      expect(router.back).toHaveBeenCalled();
    });

    it('navigates to chooseFavs with all params on valid submit', async () => {
      const { router } = require('expo-router');
      const { getByLabelText, getByRole } = renderSignUp();

      fireEvent.changeText(getByLabelText('Nombre'), 'usuario123');
      fireEvent.changeText(getByLabelText('Correo electrónico'), 'test@email.com');
      fireEvent.changeText(getByLabelText('Contraseña'), 'Password1!');
      fireEvent.press(getByRole('button', { name: 'Continuar' }));

      await waitFor(() => {
        expect(router.push).toHaveBeenCalledWith(
          expect.objectContaining({
            pathname: '/chooseMovieFavs',
            params: expect.objectContaining({
              email: 'test@email.com',
              name: 'usuario123',
            }),
          })
        );
      });
    });

    it('does not navigate when form is invalid', async () => {
      const { router } = require('expo-router');
      const { getByRole } = renderSignUp();
      fireEvent.press(getByRole('button', { name: 'Continuar' }));
      await waitFor(() => {
        expect(router.push).not.toHaveBeenCalled();
      });
    });
  });

  // ── Photo ────────────────────────────────────────────────────────────────────

  describe('profile photo', () => {
    it('delete button is not shown when no photo is set', () => {
      const { queryByLabelText } = renderSignUp();
      expect(queryByLabelText('Eliminar foto de perfil')).toBeNull();
    });

  });
});