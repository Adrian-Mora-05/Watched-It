import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ListScreen from '@/app/(home)/(index)/listScreen';
import { getLists } from '@/services/list.service';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

jest.mock('@/hooks/ctx', () => ({
  useSession: () => ({ session: 'mock-token' }),
}));

jest.mock('@/hooks/useLayout', () => ({
  useLayout: () => ({
    screenWidth: 390,
    headerHeight: 80,
    headerPaddingBottom: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  }),
}));

jest.mock('@/services/list.service', () => ({
  getLists: jest.fn(),
  baseUrl: 'https://m.media-amazon.com/images/M/',
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('@expo/vector-icons/MaterialIcons', () => 'MaterialIcons');

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockListsRaw = [
  { id: 119, nombre_lista: 'Disney', nombre_usuario: 'camila', enlace_imagen: 'img1.jpg' },
  { id: 119, nombre_lista: 'Disney', nombre_usuario: 'camila', enlace_imagen: 'img2.jpg' },
  { id: 124, nombre_lista: 'Vaqueras', nombre_usuario: 'camila', enlace_imagen: 'img3.jpg' },
];

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('ListScreen - Accessibility', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    (getLists as jest.Mock).mockResolvedValue(mockListsRaw);
  });

  // ── Roles & Labels ──────────────────────────────────────────────────────────

  describe('roles and labels', () => {
    it('renders the list container with an accessible label', async () => {
      render(<ListScreen />);
      await waitFor(() => {
        expect(screen.getByLabelText('Lista de listas de películas y series')).toBeTruthy();
      });
    });

    it('each list item has a descriptive accessible label', async () => {
      render(<ListScreen />);
      await waitFor(() => {
        expect(
          screen.getByLabelText('Lista Disney, hecha por camila, 2 imágenes')
        ).toBeTruthy();
        expect(
          screen.getByLabelText('Lista Vaqueras, hecha por camila, 1 imagen')
        ).toBeTruthy();
      });
    });

    it('each list item has role button', async () => {
      render(<ListScreen />);
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });

    it('singular image label is correct', async () => {
      render(<ListScreen />);
      await waitFor(() => {
        expect(
          screen.getByLabelText('Lista Vaqueras, hecha por camila, 1 imagen') // singular
        ).toBeTruthy();
      });
    });

    it('plural images label is correct', async () => {
      render(<ListScreen />);
      await waitFor(() => {
        expect(
          screen.getByLabelText('Lista Disney, hecha por camila, 2 imágenes') // plural
        ).toBeTruthy();
      });
    });
  });

  // ── Accessibility Hints ─────────────────────────────────────────────────────

  describe('accessibility hints', () => {
    it('each list item has a hint', async () => {
      render(<ListScreen />);
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        buttons.forEach(button => {
          expect(button.props.accessibilityHint).toBe('Toca para ver el contenido de esta lista');
        });
      });
    });
  });

  // ── Loading State ───────────────────────────────────────────────────────────

  describe('loading state', () => {
    it('shows loading indicator while fetching', () => {
      // delay resolution so loading state is visible
      (getLists as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockListsRaw), 500))
      );
      render(<ListScreen />);
      expect(screen.getByLabelText('Cargando más listas')).toBeTruthy();
    });

    it('loading indicator has polite live region', () => {
      (getLists as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockListsRaw), 500))
      );
      render(<ListScreen />);
      const indicator = screen.getByLabelText('Cargando más listas');
      expect(indicator.props.accessibilityLiveRegion).toBe('polite');
    });

    it('hides loading indicator after fetch completes', async () => {
      render(<ListScreen />);
      await waitFor(() => {
        expect(screen.queryByLabelText('Cargando más listas')).toBeNull();
      });
    });
  });

  // ── Navigation ──────────────────────────────────────────────────────────────

  describe('navigation', () => {
    it('navigates to list detail on press', async () => {
      const { router } = require('expo-router');
      render(<ListScreen />);

      await waitFor(() => {
        const disneyList = screen.getByLabelText('Lista Disney, hecha por camila, 2 imágenes');
        fireEvent.press(disneyList);
        expect(router.push).toHaveBeenCalledWith('/(list)/119');
      });
    });

    it('navigates to the correct list id', async () => {
      const { router } = require('expo-router');
      render(<ListScreen />);

      await waitFor(() => {
        const vaquerasList = screen.getByLabelText('Lista Vaqueras, hecha por camila, 1 imagen');
        fireEvent.press(vaquerasList);
        expect(router.push).toHaveBeenCalledWith('/(list)/124');
      });
    });
  });

  // ── Data Fetching ───────────────────────────────────────────────────────────

  describe('data fetching', () => {
    it('calls getLists on mount', async () => {
      render(<ListScreen />);
      await waitFor(() => {
        expect(getLists).toHaveBeenCalledWith(0, 30, 'mock-token');
      });
    });

    it('groups raw rows by id correctly', async () => {
      render(<ListScreen />);
      await waitFor(() => {
        // Disney has 2 raw rows but should render as 1 list item
        const disneyItems = screen.getAllByLabelText(/Lista Disney/);
        expect(disneyItems.length).toBe(1);
      });
    });

    it('handles fetch error gracefully without crashing', async () => {
      (getLists as jest.Mock).mockRejectedValue(new Error('Network error'));
      expect(() => render(<ListScreen />)).not.toThrow();
    });

    it('renders empty list when no data returned', async () => {
      (getLists as jest.Mock).mockResolvedValue([]);
      render(<ListScreen />);
      await waitFor(() => {
        expect(screen.queryByRole('button')).toBeNull();
      });
    });
  });

});