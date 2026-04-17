import { render, screen, fireEvent, waitFor,cleanup } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import SignIn from '@/app/(auth)/sign-in';


// ─── Mocks ────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
});

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
jest.mock('expo-router', () => ({
  router: {
    replace: jest.fn(),
    push: jest.fn(),
  },
}));

jest.mock('@/hooks/ctx', () => ({
  useSession: () => ({
    signIn: jest.fn().mockResolvedValue(undefined),
    signOut: jest.fn(),
    session: null,
    isLoading: false,
  }),
}));

jest.mock('@react-native-ama/core', () => ({
  AMAProvider: ({ children }: any) => children,
  useAMAContext: () => ({}),
}));

jest.mock('@react-native-ama/react-native', () => {
  const { Text, Pressable } = require('react-native');
  return {
    Text: ({ children, ...props }: any) => <Text {...props}>{children}</Text>,
    Pressable: ({ children, ...props }: any) => <Pressable {...props}>{children}</Pressable>,
  };
});

jest.mock('@react-native-ama/forms', () => ({
  Form: ({ children }: any) => children,
}));

// Mock custom Input — renders a real TextInput with the label as accessibilityLabel
jest.mock('@/components/ui/Input', () => {
  const { TextInput, View, Text } = require('react-native');
  return ({ label, error, ...props }: any) => (
    <View>
      <TextInput
        accessibilityLabel={label}
        accessibilityLiveRegion="assertive"
        {...props}
      />
      {error && (
        <Text accessibilityLiveRegion="assertive">{error}</Text>
      )}
    </View>
  );
});

// Mock custom Button — renders a real TouchableOpacity with accessibilityState.busy
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

// Mock ErrorToast — avoids useSafeAreaInsets issues inside it
jest.mock('@/components/ui/ErrorMessage', () => {
  const { Text } = require('react-native');
  return ({ message, visible }: any) =>
    visible ? <Text accessibilityLiveRegion="assertive">{message}</Text> : null;
});

// ─── Setup/Teardown ───────────────────────────────────────────────────────────

afterEach(() => {
  cleanup(); // ✅ clears screen between every test
  jest.clearAllMocks();
});

// ─── Helper ───────────────────────────────────────────────────────────────────

const renderSignIn = () => render(<SignIn />);
// ─── Test Suite ───────────────────────────────────────────────────────────────

  // ── Roles & Labels ──────────────────────────────────────────────────────────

  describe('roles and labels', () => {
  it('renders the sign in heading', () => {
    const { getByRole } = renderSignIn();
    expect(getByRole('header', { name: 'Iniciar sesión' })).toBeTruthy();
  });

  it('email field is labelled and accessible', () => {
    const { getByLabelText } = renderSignIn();
    expect(getByLabelText('Correo electrónico')).toBeTruthy();
  });

  it('password field is labelled and accessible', () => {
    const { getByLabelText } = renderSignIn();
    expect(getByLabelText('Contraseña')).toBeTruthy();
  });

  it('submit button has an accessible name', () => {
    const { getByRole } = renderSignIn();
    expect(getByRole('button', { name: 'Iniciar sesión' })).toBeTruthy();
  });

  it('forgot password link has an accessible name', () => {
    const { getByRole } = renderSignIn();
    expect(getByRole('button', { name: '¿Olvidaste tu contraseña?' })).toBeTruthy();
  });

  it('sign up section is labelled as a group', () => {
    const { getByLabelText } = renderSignIn();
    expect(getByLabelText('¿No tienes una cuenta? Regístrate')).toBeTruthy();
  });
});

describe('keyboard and input', () => {
  it('email field uses email keyboard', () => {
    const { getByLabelText } = renderSignIn();
    expect(getByLabelText('Correo electrónico').props.keyboardType).toBe('email-address');
  });

  it('email field disables auto-capitalisation', () => {
    const { getByLabelText } = renderSignIn();
    expect(getByLabelText('Correo electrónico').props.autoCapitalize).toBe('none');
  });

  it('email field has email autocomplete hint', () => {
    const { getByLabelText } = renderSignIn();
    expect(getByLabelText('Correo electrónico').props.autoComplete).toBe('email');
  });

  it('password field is secure', () => {
    const { getByLabelText } = renderSignIn();
    expect(getByLabelText('Contraseña').props.secureTextEntry).toBe(true);
  });
});

describe('error feedback', () => {
  it('shows email error when submitting empty form', async () => {
    const { getByRole, findByText } = renderSignIn();
    fireEvent.press(getByRole('button', { name: 'Iniciar sesión' }));
    const error = await findByText('El correo electrónico es obligatorio');
    expect(error.props.accessibilityLiveRegion).toBe('assertive');
  });

  it('shows password error when submitting empty form', async () => {
    const { getByRole, findByText } = renderSignIn();
    fireEvent.press(getByRole('button', { name: 'Iniciar sesión' }));
    const error = await findByText('La contraseña es obligatoria');
    expect(error.props.accessibilityLiveRegion).toBe('assertive');
  });

  it('announces errors to screen readers via AccessibilityInfo', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    const { getByRole } = renderSignIn();
    fireEvent.press(getByRole('button', { name: 'Iniciar sesión' }));
    await waitFor(() => {
      expect(announce).toHaveBeenCalledWith(
        expect.stringContaining('Errores en el formulario')
      );
    });
  });
  
  it('shows toast when credentials are wrong', async () => {
    const mockUseSession = jest.spyOn(require('@/hooks/ctx'), 'useSession').mockReturnValue({
      signIn: jest.fn().mockRejectedValue(new Error('Invalid credentials')),
      signOut: jest.fn(),
      session: null,
      isLoading: false,
    });

    const { getByLabelText, getByRole, findByText } = renderSignIn();
    fireEvent.changeText(getByLabelText('Correo electrónico'), 'test@email.com');
    fireEvent.changeText(getByLabelText('Contraseña'), 'password123');
    fireEvent.press(getByRole('button', { name: 'Iniciar sesión' }));
    await findByText('Usuario o contraseña incorrectos.');

    mockUseSession.mockRestore();
  });
});

describe('loading state', () => {
  it('button communicates busy state while signing in', async () => {
    const { getByLabelText, getByRole } = renderSignIn();
    fireEvent.changeText(getByLabelText('Correo electrónico'), 'test@email.com');
    fireEvent.changeText(getByLabelText('Contraseña'), 'password123');
    fireEvent.press(getByRole('button', { name: 'Iniciar sesión' }));
    await waitFor(() => {
      expect(getByRole('button', { name: 'Iniciar sesión' }).props.accessibilityState?.busy).toBe(true);
    });
  });
});

describe('navigation', () => {
  it('redirects to home after successful sign in', async () => {
    const { router } = require('expo-router');
    const { getByLabelText, getByRole } = renderSignIn();
    fireEvent.changeText(getByLabelText('Correo electrónico'), 'test@email.com');
    fireEvent.changeText(getByLabelText('Contraseña'), 'password123');
    fireEvent.press(getByRole('button', { name: 'Iniciar sesión' }));
    await waitFor(() => {
      expect(router.replace).toHaveBeenCalledWith('/');
    });
  });

  it('navigates to sign up when Regístrate is pressed', () => {
    const { router } = require('expo-router');
    const { getByRole } = renderSignIn();
    fireEvent.press(getByRole('button', { name: 'Regístrate' }));
    expect(router.push).toHaveBeenCalledWith('/sign-up');
  });

  it('navigates to restore password when forgot password is pressed', () => {
    const { router } = require('expo-router');
    const { getByRole } = renderSignIn();
    fireEvent.press(getByRole('button', { name: '¿Olvidaste tu contraseña?' }));
    expect(router.push).toHaveBeenCalledWith('/restorePassword');
  });
});

