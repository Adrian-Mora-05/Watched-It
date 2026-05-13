import { render, screen, waitFor } from '@testing-library/react-native';
import ListDetailScreen from '@/app/(home)/(index)/(list)/[id]';
import { getListById } from '@/services/list.service';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('expo-router', () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: () => ({ id: '119' }),
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
  getListById: jest.fn(),
  baseUrl: 'https://m.media-amazon.com/images/M/',
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('@/components/ui/ReturnButton', () => 'ReturnButton');

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockItems = [
  { id: 119, nombre_lista: 'Disney', nombre_usuario: 'camila', enlace_imagen: 'img1.jpg', contenido_id: 1 },
  { id: 119, nombre_lista: 'Disney', nombre_usuario: 'camila', enlace_imagen: 'img2.jpg', contenido_id: 2 },
  { id: 119, nombre_lista: 'Disney', nombre_usuario: 'camila', enlace_imagen: 'img3.jpg', contenido_id: 3 },
  // duplicate contenido_id to test deduplication
  { id: 119, nombre_lista: 'Disney', nombre_usuario: 'camila', enlace_imagen: 'img1.jpg', contenido_id: 1 },
];

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('ListDetailScreen - Accessibility', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    (getListById as jest.Mock).mockResolvedValue(mockItems);
  });

  // ── Roles & Labels ──────────────────────────────────────────────────────────

  describe('roles and labels', () => {
    it('renders the list info with a grouped accessible label', async () => {
      render(<ListDetailScreen />);
      await waitFor(() => {
        expect(screen.getByLabelText('Lista: Disney, hecha por camila')).toBeTruthy();
      });
    });

    it('renders the image grid with a descriptive label', async () => {
      render(<ListDetailScreen />);
      await waitFor(() => {
        // 3 unique items after deduplication
        expect(
          screen.getByLabelText('Cuadrícula de imágenes de la lista Disney, 3 elementos')
        ).toBeTruthy();
      });
    });

    it('each image has a positional accessible label', async () => {
      render(<ListDetailScreen />);
      await waitFor(() => {
        expect(screen.getByLabelText('Imagen 1 de 3 en la lista Disney')).toBeTruthy();
        expect(screen.getByLabelText('Imagen 2 de 3 en la lista Disney')).toBeTruthy();
        expect(screen.getByLabelText('Imagen 3 de 3 en la lista Disney')).toBeTruthy();
      });
    });

    it('does not render list info when items are empty', async () => {
      (getListById as jest.Mock).mockResolvedValue([]);
      render(<ListDetailScreen />);
      await waitFor(() => {
        expect(screen.queryByLabelText(/Lista:/)).toBeNull();
      });
    });
  });

  // ── Loading State ───────────────────────────────────────────────────────────

  describe('loading state', () => {
    it('shows loading indicator while fetching', () => {
      (getListById as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockItems), 500))
      );
      render(<ListDetailScreen />);
      expect(screen.getByLabelText('Cargando contenido de la lista')).toBeTruthy();
    });

    it('loading indicator has polite live region', () => {
      (getListById as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockItems), 500))
      );
      render(<ListDetailScreen />);
      const indicator = screen.getByLabelText('Cargando contenido de la lista');
      expect(indicator.props.accessibilityLiveRegion).toBe('polite');
    });

    it('hides loading indicator after fetch completes', async () => {
      render(<ListDetailScreen />);
      await waitFor(() => {
        expect(screen.queryByLabelText('Cargando contenido de la lista')).toBeNull();
      });
    });
  });

  // ── Deduplication ───────────────────────────────────────────────────────────

  describe('deduplication', () => {
    it('deduplicates items by contenido_id', async () => {
      render(<ListDetailScreen />);
      await waitFor(() => {
        // mockItems has 4 rows but contenido_id 1 is duplicated → only 3 unique
        expect(
          screen.getByLabelText('Cuadrícula de imágenes de la lista Disney, 3 elementos')
        ).toBeTruthy();
        // image 4 should not exist
        expect(screen.queryByLabelText('Imagen 4 de 4 en la lista Disney')).toBeNull();
      });
    });
  });

  // ── Data Fetching ───────────────────────────────────────────────────────────

  describe('data fetching', () => {
    it('calls getListById with correct id and token on mount', async () => {
      render(<ListDetailScreen />);
      await waitFor(() => {
        expect(getListById).toHaveBeenCalledWith(119, 'mock-token');
      });
    });

    it('handles fetch error gracefully without crashing', async () => {
      (getListById as jest.Mock).mockRejectedValue(new Error('Network error'));
      expect(() => render(<ListDetailScreen />)).not.toThrow();
    });

    it('renders empty grid when no data returned', async () => {
      (getListById as jest.Mock).mockResolvedValue([]);
      render(<ListDetailScreen />);
      await waitFor(() => {
        expect(screen.queryByLabelText(/Imagen/)).toBeNull();
      });
    });
  });


});