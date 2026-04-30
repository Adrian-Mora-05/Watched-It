import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import ResetPasswordScreen from '@/app/(auth)/reset-password';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('expo-router', () => ({
  useLocalSearchParams: jest.fn(),
}));

jest.mock('expo-router/build/global-state/routing', () => ({
  replace: jest.fn(),
}));

jest.mock('@/services/auth.service', () => ({
  resetPassword: jest.fn(),
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

const { useLocalSearchParams } = require('expo-router');
const { replace } = require('expo-router/build/global-state/routing');
const { resetPassword } = require('@/services/auth.service');

const withToken = () => useLocalSearchParams.mockReturnValue({ token: 'valid-token-abc123' });
const withoutToken = () => useLocalSearchParams.mockReturnValue({ token: undefined });

const fillForm = (password = 'password123', confirm = 'password123') => {
  fireEvent.changeText(screen.getByLabelText('Nueva contraseña'), password);
  fireEvent.changeText(screen.getByLabelText('Confirmar contraseña'), confirm);
};

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('ResetPasswordScreen - Accessibility', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    withToken();
  });

  // ── Invalid Link ─────────────────────────────────────────────────────────────

  describe('invalid link screen', () => {
    it('renders invalid link message when token is missing', () => {
      withoutToken();
      render(<ResetPasswordScreen />);
      expect(screen.getByRole('header', { name: 'Enlace inválido' })).toBeTruthy();
    });

    it('shows return button when token is missing', () => {
      withoutToken();
      render(<ResetPasswordScreen />);
      expect(screen.getByRole('button', { name: 'Volver a inicio de sesión' })).toBeTruthy();
    });
  });

  // ── Roles & Labels ───────────────────────────────────────────────────────────

  describe('roles and labels', () => {
    it('renders the screen heading', () => {
      render(<ResetPasswordScreen />);
      expect(screen.getByRole('header', { name: 'Nueva contraseña' })).toBeTruthy();
    });

    it('nueva contraseña field is labelled and accessible', () => {
      render(<ResetPasswordScreen />);
      expect(screen.getByLabelText('Nueva contraseña')).toBeTruthy();
    });

    it('confirmar contraseña field is labelled and accessible', () => {
      render(<ResetPasswordScreen />);
      expect(screen.getByLabelText('Confirmar contraseña')).toBeTruthy();
    });

    it('submit button has an accessible name', () => {
      render(<ResetPasswordScreen />);
      expect(screen.getByRole('button', { name: 'Guardar nueva contraseña' })).toBeTruthy();
    });
  });

  // ── Keyboard & Input ─────────────────────────────────────────────────────────

  describe('keyboard and input', () => {
    it('nueva contraseña field is secure', () => {
      render(<ResetPasswordScreen />);
      expect(screen.getByLabelText('Nueva contraseña').props.secureTextEntry).toBe(true);
    });

    it('confirmar contraseña field is secure', () => {
      render(<ResetPasswordScreen />);
      expect(screen.getByLabelText('Confirmar contraseña').props.secureTextEntry).toBe(true);
    });

    it('nueva contraseña has returnKeyType next', () => {
      render(<ResetPasswordScreen />);
      expect(screen.getByLabelText('Nueva contraseña').props.returnKeyType).toBe('next');
    });

    it('confirmar contraseña has returnKeyType done', () => {
      render(<ResetPasswordScreen />);
      expect(screen.getByLabelText('Confirmar contraseña').props.returnKeyType).toBe('done');
    });
  });

  // ── Error Feedback ───────────────────────────────────────────────────────────

  describe('error feedback', () => {
    it('shows error when submitting empty form', async () => {
      render(<ResetPasswordScreen />);
      fireEvent.press(screen.getByRole('button', { name: 'Guardar nueva contraseña' }));

      const error = await screen.findByText(/La contraseña es obligatoria/);
      expect(error).toBeTruthy();
    });

    it('shows error when passwords do not match', async () => {
      render(<ResetPasswordScreen />);
      fillForm('password123', 'different456');
      fireEvent.press(screen.getByRole('button', { name: 'Guardar nueva contraseña' }));

      const error = await screen.findByText(/Las contraseñas no coinciden/);
      expect(error).toBeTruthy();
    });

    it('announces validation errors to screen readers', async () => {
      const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
      render(<ResetPasswordScreen />);
      fireEvent.press(screen.getByRole('button', { name: 'Guardar nueva contraseña' }));

      await waitFor(() => {
        expect(announce).toHaveBeenCalledWith(
          expect.stringContaining('Formulario con errores')
        );
      });
    });

    it('shows api error with assertive live region', async () => {
      resetPassword.mockRejectedValueOnce({ message: 'Error' });
      render(<ResetPasswordScreen />);
      fillForm();
      fireEvent.press(screen.getByRole('button', { name: 'Guardar nueva contraseña' }));

      await waitFor(() => {
        const error = screen.getByText(/No pudimos actualizar tu contraseña/);
        expect(error.props.accessibilityLiveRegion).toBe('assertive');
      });
    });

    it('announces api error to screen readers', async () => {
      const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
      resetPassword.mockRejectedValueOnce({ message: 'Error' });
      render(<ResetPasswordScreen />);
      fillForm();
      fireEvent.press(screen.getByRole('button', { name: 'Guardar nueva contraseña' }));

      await waitFor(() => {
        expect(announce).toHaveBeenCalledWith(
          expect.stringContaining('No pudimos actualizar tu contraseña')
        );
      });
    });
  });

  // ── Loading State ─────────────────────────────────────────────────────────────

  describe('loading state', () => {
    it('button communicates busy state while submitting', async () => {
      resetPassword.mockReturnValueOnce(new Promise(() => {})); // never resolves
      render(<ResetPasswordScreen />);
      fillForm();
      fireEvent.press(screen.getByRole('button', { name: 'Guardar nueva contraseña' }));

      await waitFor(() => {
        const button = screen.getByRole('button', { name: 'Guardando...' });
        expect(button.props.accessibilityState?.busy).toBe(true);
      });
    });

    it('button is disabled while submitting', async () => {
      resetPassword.mockReturnValueOnce(new Promise(() => {}));
      render(<ResetPasswordScreen />);
      fillForm();
      fireEvent.press(screen.getByRole('button', { name: 'Guardar nueva contraseña' }));

      await waitFor(() => {
        const button = screen.getByRole('button', { name: 'Guardando...' });
        expect(button.props.accessibilityState?.disabled).toBe(true);
      });
    });

    it('announces loading state to screen readers', async () => {
      const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
      resetPassword.mockReturnValueOnce(new Promise(() => {}));
      render(<ResetPasswordScreen />);
      fillForm();
      fireEvent.press(screen.getByRole('button', { name: 'Guardar nueva contraseña' }));

      await waitFor(() => {
        expect(announce).toHaveBeenCalledWith(
          expect.stringContaining('Guardando nueva contraseña')
        );
      });
    });
  });

  // ── Success State ─────────────────────────────────────────────────────────────

  describe('success state', () => {
    it('shows success heading after password reset', async () => {
      resetPassword.mockResolvedValueOnce({});
      render(<ResetPasswordScreen />);
      fillForm();
      fireEvent.press(screen.getByRole('button', { name: 'Guardar nueva contraseña' }));

      await waitFor(() => {
        expect(screen.getByRole('header', { name: 'Contraseña actualizada' })).toBeTruthy();
      });
    });

    it('shows go to login button after success', async () => {
      resetPassword.mockResolvedValueOnce({});
      render(<ResetPasswordScreen />);
      fillForm();
      fireEvent.press(screen.getByRole('button', { name: 'Guardar nueva contraseña' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Ir a inicio de sesión' })).toBeTruthy();
      });
    });

    it('announces success to screen readers', async () => {
      const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
      resetPassword.mockResolvedValueOnce({});
      render(<ResetPasswordScreen />);
      fillForm();
      fireEvent.press(screen.getByRole('button', { name: 'Guardar nueva contraseña' }));

      await waitFor(() => {
        expect(announce).toHaveBeenCalledWith(
          expect.stringContaining('Contraseña actualizada exitosamente')
        );
      });
    });
  });

  // ── Navigation ────────────────────────────────────────────────────────────────

  describe('navigation', () => {
    it('redirects to sign-in after successful reset', async () => {
      resetPassword.mockResolvedValueOnce({});
      render(<ResetPasswordScreen />);
      fillForm();
      fireEvent.press(screen.getByRole('button', { name: 'Guardar nueva contraseña' }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Ir a inicio de sesión' })).toBeTruthy();
      });

      fireEvent.press(screen.getByRole('button', { name: 'Ir a inicio de sesión' }));
      expect(replace).toHaveBeenCalledWith('/sign-in');
    });

    it('redirects to sign-in from invalid link screen', () => {
      withoutToken();
      render(<ResetPasswordScreen />);
      fireEvent.press(screen.getByRole('button', { name: 'Volver a inicio de sesión' }));
      expect(replace).toHaveBeenCalledWith('/sign-in');
    });
  });

});