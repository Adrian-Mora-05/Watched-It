import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import SignIn from '../../app/(auth)/sign-in';

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

jest.mock('../../hooks/ctx', () => ({
  useSession: () => ({ signIn: jest.fn() }),
}));

describe('SignIn Screen - Accessibility', () => {

  describe('roles and labels', () => {
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
  });

  describe('keyboard and input', () => {
    it('email field uses email keyboard', () => {
      render(<SignIn />);
      expect(screen.getByLabelText('Correo electrónico').props.keyboardType).toBe('email-address');
    });

    it('password field is secure', () => {
      render(<SignIn />);
      expect(screen.getByLabelText('Contraseña').props.secureTextEntry).toBe(true);
    });
  });

  describe('error feedback', () => {
    it('announces errors to screen readers', async () => {
      
      render(<SignIn />);

      fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));

      const error = await screen.findByText('El correo electrónico es obligatorio');
      expect(error.props.accessibilityLiveRegion).toBe('polite');
    });
  });

  describe('loading state', () => {
    it('button communicates busy state while signing in', async () => {
      render(<SignIn />);

      fireEvent.changeText(screen.getByLabelText('Correo electrónico'), 'test@email.com');
      fireEvent.changeText(screen.getByLabelText('Contraseña'), '123456');
      fireEvent.press(screen.getByRole('button', { name: 'Iniciar sesión' }));

      await waitFor(() => {
        const button = screen.getByRole('button', { name: 'Iniciar sesión' });
        expect(button.props.accessibilityState?.busy).toBe(true);
      });
    });
  });

});