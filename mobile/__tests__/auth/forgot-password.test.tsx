import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import ForgotPasswordScreen from '@/app/(auth)/forgot-password';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
}));

jest.mock('@/services/auth.service', () => ({
  sendEmail: jest.fn(),
}));

jest.mock('@/components/ui/ReturnButton', () => {
  const { TouchableOpacity, Text } = require('react-native');
  return ({ label, onPress }: { label: string; onPress: () => void }) => (
    <TouchableOpacity accessibilityRole="button" onPress={onPress}>
      <Text>{label}</Text>
    </TouchableOpacity>
  );
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const { router } = require('expo-router');
const { sendEmail } = require('@/services/auth.service');

const fillUsername = (value = 'usuario123') => {
  fireEvent.changeText(screen.getByLabelText('Nombre de usuario'), value);
};

const submitForm = () => {
  fireEvent.press(screen.getByRole('button', { name: 'Enviar correo de restablecimiento' }));
};

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('ForgotPasswordScreen - Accessibility', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Roles & Labels ───────────────────────────────────────────────────────────

  describe('roles and labels', () => {
    it('renders the screen heading', () => {
      render(<ForgotPasswordScreen />);
      expect(screen.getByRole('header', { name: 'Cambia tu contraseña' })).toBeTruthy();
    });

    it('nombre de usuario field is labelled and accessible', () => {
      render(<ForgotPasswordScreen />);
      expect(screen.getByLabelText('Nombre de usuario')).toBeTruthy();
    });

    it('submit button has an accessible name', () => {
      render(<ForgotPasswordScreen />);
      expect(screen.getByRole('button', { name: 'Enviar correo de restablecimiento' })).toBeTruthy();
    });

    it('return button has an accessible name', () => {
      render(<ForgotPasswordScreen />);
      expect(screen.getByRole('button', { name: 'Volver a inicio de sesión' })).toBeTruthy();
    });
  });

  // ── Keyboard & Input ─────────────────────────────────────────────────────────

  describe('keyboard and input', () => {
    it('username field uses default keyboard', () => {
      render(<ForgotPasswordScreen />);
      expect(screen.getByLabelText('Nombre de usuario').props.keyboardType).toBe('default');
    });

    it('username field has autoCapitalize none', () => {
      render(<ForgotPasswordScreen />);
      expect(screen.getByLabelText('Nombre de usuario').props.autoCapitalize).toBe('none');
    });

    it('username field has returnKeyType send', () => {
      render(<ForgotPasswordScreen />);
      expect(screen.getByLabelText('Nombre de usuario').props.returnKeyType).toBe('send');
    });
  });

  // ── Error Feedback ───────────────────────────────────────────────────────────

  describe('error feedback', () => {
    it('shows error when submitting empty form', async () => {
      render(<ForgotPasswordScreen />);
      submitForm();

      const error = await screen.findByText(/Nombre no puede ser vacío/);
      expect(error).toBeTruthy();
    });

    it('announces validation errors to screen readers', async () => {
      const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
      render(<ForgotPasswordScreen />);
      submitForm();

      await waitFor(() => {
        expect(announce).toHaveBeenCalledWith(
          expect.stringContaining('Formulario con errores')
        );
      });
    });

    it('shows api error with assertive live region', async () => {
      sendEmail.mockRejectedValueOnce(new Error('Network error'));
      render(<ForgotPasswordScreen />);
      fillUsername();
      submitForm();

      await waitFor(() => {
        const error = screen.getByText(/No pudimos enviar el correo/);
        expect(error.props.accessibilityLiveRegion).toBe('assertive');
      });
    });

    it('announces api error to screen readers', async () => {
      const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
      sendEmail.mockRejectedValueOnce(new Error('Network error'));
      render(<ForgotPasswordScreen />);
      fillUsername();
      submitForm();

      await waitFor(() => {
        expect(announce).toHaveBeenCalledWith(
          expect.stringContaining('No pudimos enviar el correo')
        );
      });
    });
  });

  // ── Loading State ─────────────────────────────────────────────────────────────

  describe('loading state', () => {
    it('button communicates busy state while submitting', async () => {
      sendEmail.mockReturnValueOnce(new Promise(() => {}));
      render(<ForgotPasswordScreen />);
      fillUsername();
      submitForm();

      await waitFor(() => {
        const button = screen.getByRole('button', { name: 'Enviando...' });
        expect(button.props.accessibilityState?.busy).toBe(true);
      });
    });

    it('button is disabled while submitting', async () => {
      sendEmail.mockReturnValueOnce(new Promise(() => {}));
      render(<ForgotPasswordScreen />);
      fillUsername();
      submitForm();

      await waitFor(() => {
        const button = screen.getByRole('button', { name: 'Enviando...' });
        expect(button.props.accessibilityState?.disabled).toBe(true);
      });
    });

    it('announces loading state to screen readers', async () => {
      const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
      sendEmail.mockReturnValueOnce(new Promise(() => {}));
      render(<ForgotPasswordScreen />);
      fillUsername();
      submitForm();

      await waitFor(() => {
        expect(announce).toHaveBeenCalledWith(
          expect.stringContaining('Enviando correo de restablecimiento')
        );
      });
    });
  });

  // ── Success State ─────────────────────────────────────────────────────────────

  describe('success state', () => {
    it('shows success heading after sending email', async () => {
      sendEmail.mockResolvedValueOnce({});
      render(<ForgotPasswordScreen />);
      fillUsername();
      submitForm();

      await waitFor(() => {
        expect(screen.getByRole('header', { name: 'Revisa tu correo' })).toBeTruthy();
      });
    });

    it('shows the username in the success message', async () => {
      sendEmail.mockResolvedValueOnce({});
      render(<ForgotPasswordScreen />);
      fillUsername('miusuario');
      submitForm();

      await waitFor(() => {
        expect(screen.getByText('miusuario')).toBeTruthy();
      });
    });

    it('shows return button on success screen', async () => {
      sendEmail.mockResolvedValueOnce({});
      render(<ForgotPasswordScreen />);
      fillUsername();
      submitForm();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Volver a inicio de sesión' })).toBeTruthy();
      });
    });

    it('announces success to screen readers', async () => {
      const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
      sendEmail.mockResolvedValueOnce({});
      render(<ForgotPasswordScreen />);
      fillUsername();
      submitForm();

      await waitFor(() => {
        expect(announce).toHaveBeenCalledWith(
          expect.stringContaining('Correo de restablecimiento enviado')
        );
      });
    });
  });

  // ── Navigation ────────────────────────────────────────────────────────────────
    describe('navigation', () => {
    it('goes back when pressing return button on idle screen', () => {
        render(<ForgotPasswordScreen />);
        fireEvent.press(screen.getByRole('button', { name: 'Volver a inicio de sesión' }));
        expect(router.back).toHaveBeenCalled();
    });

    it('goes back when pressing either return button on success screen', async () => {
        sendEmail.mockResolvedValueOnce({});
        render(<ForgotPasswordScreen />);
        fillUsername();
        submitForm();

        await waitFor(() => {
        expect(screen.getByRole('header', { name: 'Revisa tu correo' })).toBeTruthy();
        });

        const buttons = screen.getAllByRole('button', { name: 'Volver a inicio de sesión' });
        expect(buttons).toHaveLength(1);

        fireEvent.press(buttons[0]);
        expect(router.back).toHaveBeenCalledTimes(1);

    });
    });

});