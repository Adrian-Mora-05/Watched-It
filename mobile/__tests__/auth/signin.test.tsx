import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import SignIn from '../../app/(auth)/sign-in';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

jest.mock('../../hooks/ctx', () => ({
  useSession: () => ({ signIn: jest.fn() }),
}));

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('SignIn Screen - Accessibility', () => {

  // ── Roles & Labels ──────────────────────────────────────────────────────────

  describe('roles and labels', () => {
    it('renders the app heading', () => {
      render(<SignIn />);
      expect(screen.getByRole('header', { name: 'Watched It' })).toBeTruthy();
    });

    it('email field is labelled and accessible', () => {
      render(<SignIn />);
      expect(screen.getByLabelText('Correo electrónico')).toBeTruthy();
    });

    it('password field is labelled and accessible', () => {
      render(<SignIn />);
      expect(screen.getByLabelText('Contraseña')).toBeTruthy();
    });

    it('submit button has an accessible name', () => {
      render(<SignIn />);
      expect(screen.getByRole('button', { name: 'Iniciar sesión' })).toBeTruthy();
    });

    it('forgot password link has an accessible name', () => {
      render(<SignIn />);
      expect(
        screen.getByRole('button', { name: '¿Olvidaste tu contraseña?' })
      ).toBeTruthy();
    });

    it('sign up section is labelled as a group', () => {
      render(<SignIn />);
      expect(
        screen.getByLabelText('¿No tienes una cuenta? Regístrate')
      ).toBeTruthy();
    });
  });

  // ── Keyboard & Input ────────────────────────────────────────────────────────

  describe('keyboard and input', () => {
    it('email field uses email keyboard', () => {
      render(<SignIn />);
      expect(
        screen.getByLabelText('Correo electrónico').props.keyboardType
      ).toBe('email-address');
    });

    it('email field disables auto-capitalisation', () => {
      render(<SignIn />);
      expect(
        screen.getByLabelText('Correo electrónico').props.autoCapitalize
      ).toBe('none');
    });

    it('email field has email autocomplete hint', () => {
      render(<SignIn />);
      expect(
        screen.getByLabelText('Correo electrónico').props.autoComplete
      ).toBe('email');
    });

    it('password field is secure', () => {
      render(<SignIn />);
      expect(
        screen.getByLabelText('Contraseña').props.secureTextEntry
      ).toBe(true);
    });
  });

  // ── Error Feedback ──────────────────────────────────────────────────────────

  describe('error feedback', () => {
    it('shows email error when submitting empty form', async () => {
      render(<SignIn />);
      fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));

      const error = await screen.findByText('El correo electrónico es obligatorio');
      expect(error.props.accessibilityLiveRegion).toBe('assertive');
    });

    it('shows password error when submitting empty form', async () => {
      render(<SignIn />);
      fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));

      const error = await screen.findByText('La contraseña es obligatoria');
      expect(error.props.accessibilityLiveRegion).toBe('assertive');
    });

    it('announces errors to screen readers via AccessibilityInfo', async () => {
      const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');

      render(<SignIn />);
      fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));

      await waitFor(() => {
        expect(announce).toHaveBeenCalledWith(
          expect.stringContaining('Errores en el formulario')
        );
      });
    });

  });

  // ── Loading State ───────────────────────────────────────────────────────────

  describe('loading state', () => {
    it('button communicates busy state while signing in', async () => {
      render(<SignIn />);

      fireEvent.changeText(
        screen.getByLabelText('Correo electrónico'),
        'test@email.com'
      );
      fireEvent.changeText(screen.getByLabelText('Contraseña'), 'password123');
      fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));

      await waitFor(() => {
        const button = screen.getByRole('button', { name: 'Iniciar sesión' });
        expect(button.props.accessibilityState?.busy).toBe(true);
      });
    });
  });

  // ── Navigation ──────────────────────────────────────────────────────────────

  describe('navigation', () => {
    it('redirects to home after successful sign in', async () => {
      const { router } = require('expo-router');

      render(<SignIn />);

      fireEvent.changeText(
        screen.getByLabelText('Correo electrónico'),
        'test@email.com'
      );
      fireEvent.changeText(screen.getByLabelText('Contraseña'), 'password123');
      fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));

      await waitFor(() => {
        expect(router.replace).toHaveBeenCalledWith('/');
      });
    });
  });

});