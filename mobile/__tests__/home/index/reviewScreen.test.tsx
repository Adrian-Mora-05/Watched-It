import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import ReviewScreen from '@/app/(home)/(index)/reviewScreen';
import { getReviews, addLike, removeLike } from '@/services/review.service';

// ─── Mocks ────────────────────────────────────────────────────────────────────

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

jest.mock('@/services/review.service', () => ({
  getReviews: jest.fn(),
  addLike: jest.fn(),
  removeLike: jest.fn(),
  baseUrl: 'https://m.media-amazon.com/images/M/',
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
}));

jest.mock('@expo/vector-icons/AntDesign', () => 'AntDesign');
jest.mock('@expo/vector-icons/FontAwesome', () => 'FontAwesome');

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mockReviews = [
  {
    id: 1,
    contenido: 'really nice',
    cant_me_gusta: 2,
    calificacion: 5,
    nombre: 'ximemolina',
    titulo: 'The Shawshank Redemption',
    año: 1994,
    enlace_imagen: 'img1.jpg',
    tipo: 'pelicula',
    liked: false,
  },
  {
    id: 2,
    contenido: 'increible plot twist',
    cant_me_gusta: 0,
    calificacion: 4,
    nombre: 'camila',
    titulo: 'Shutter Island',
    año: 2010,
    enlace_imagen: 'img2.jpg',
    tipo: 'pelicula',
    liked: true,
  },
];

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('ReviewScreen - Accessibility', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    (getReviews as jest.Mock).mockResolvedValue(mockReviews);
    (addLike as jest.Mock).mockResolvedValue({});
    (removeLike as jest.Mock).mockResolvedValue({});
  });

  // ── Roles & Labels ──────────────────────────────────────────────────────────

  describe('roles and labels', () => {
    it('renders the section header', async () => {
      render(<ReviewScreen />);
      await waitFor(() => {
        expect(screen.getByRole('header', { name: 'Populares de la semana' })).toBeTruthy();
      });
    });

    it('renders the list with an accessible label', async () => {
      render(<ReviewScreen />);
      await waitFor(() => {
        expect(screen.getByLabelText('Lista de reseñas populares')).toBeTruthy();
      });
    });

    it('each review title row has a descriptive label', async () => {
      render(<ReviewScreen />);
      await waitFor(() => {
        expect(
          screen.getByLabelText('The Shawshank Redemption, 1994. Reseña de ximemolina')
        ).toBeTruthy();
        expect(
          screen.getByLabelText('Shutter Island, 2010. Reseña de camila')
        ).toBeTruthy();
      });
    });

    it('each review image has a descriptive label', async () => {
      render(<ReviewScreen />);
      await waitFor(() => {
        expect(screen.getByLabelText('Imagen de The Shawshank Redemption')).toBeTruthy();
        expect(screen.getByLabelText('Imagen de Shutter Island')).toBeTruthy();
      });
    });

    it('each review comment has a descriptive label', async () => {
      render(<ReviewScreen />);
      await waitFor(() => {
        expect(screen.getByLabelText('Comentario: really nice')).toBeTruthy();
        expect(screen.getByLabelText('Comentario: increible plot twist')).toBeTruthy();
      });
    });

    it('star rating has a descriptive label', async () => {
      render(<ReviewScreen />);
      await waitFor(() => {
        expect(screen.getByLabelText('Calificación: 5 de 5 estrellas')).toBeTruthy();
        expect(screen.getByLabelText('Calificación: 4 de 5 estrellas')).toBeTruthy();
      });
    });

    it('like button has role button', async () => {
      render(<ReviewScreen />);
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        expect(buttons.length).toBeGreaterThan(0);
      });
    });
  });

  // ── Like Button Labels ──────────────────────────────────────────────────────

  describe('like button labels', () => {
    it('shows "Dar me gusta" label when not liked', async () => {
      render(<ReviewScreen />);
      await waitFor(() => {
        // review 1 has liked: false and 2 likes
        expect(screen.getByLabelText('Dar me gusta. 2 me gusta')).toBeTruthy();
      });
    });

    it('shows "Quitar me gusta" label when already liked', async () => {
      render(<ReviewScreen />);
      await waitFor(() => {
        // review 2 has liked: true and 0 likes
        expect(screen.getByLabelText('Quitar me gusta. 0 me gusta')).toBeTruthy();
      });
    });

    it('like button has correct hint when not liked', async () => {
      render(<ReviewScreen />);
      await waitFor(() => {
        const likeButton = screen.getByLabelText('Dar me gusta. 2 me gusta');
        expect(likeButton.props.accessibilityHint).toBe('Toca para dar me gusta');
      });
    });

    it('like button has correct hint when liked', async () => {
      render(<ReviewScreen />);
      await waitFor(() => {
        const likeButton = screen.getByLabelText('Quitar me gusta. 0 me gusta');
        expect(likeButton.props.accessibilityHint).toBe('Toca para quitar el me gusta');
      });
    });

    it('like button has correct accessibilityState when not liked', async () => {
      render(<ReviewScreen />);
      await waitFor(() => {
        const likeButton = screen.getByLabelText('Dar me gusta. 2 me gusta');
        expect(likeButton.props.accessibilityState?.checked).toBe(false);
      });
    });

    it('like button has correct accessibilityState when liked', async () => {
      render(<ReviewScreen />);
      await waitFor(() => {
        const likeButton = screen.getByLabelText('Quitar me gusta. 0 me gusta');
        expect(likeButton.props.accessibilityState?.checked).toBe(true);
      });
    });
  });

  // ── Like Interactions ───────────────────────────────────────────────────────

  describe('like interactions', () => {
    it('calls addLike when pressing an unliked review', async () => {
      render(<ReviewScreen />);
      await waitFor(() => {
        fireEvent.press(screen.getByLabelText('Dar me gusta. 2 me gusta'));
      });
      await waitFor(() => {
        expect(addLike).toHaveBeenCalledWith(1, 'pelicula', 'mock-token');
      });
    });

    it('calls removeLike when pressing a liked review', async () => {
      render(<ReviewScreen />);
      await waitFor(() => {
        fireEvent.press(screen.getByLabelText('Quitar me gusta. 0 me gusta'));
      });
      await waitFor(() => {
        expect(removeLike).toHaveBeenCalledWith(2, 'pelicula', 'mock-token');
      });
    });

    it('optimistically updates like count on press', async () => {
      render(<ReviewScreen />);
      await waitFor(() => {
        fireEvent.press(screen.getByLabelText('Dar me gusta. 2 me gusta'));
      });
      await waitFor(() => {
        // after liking, count goes from 2 to 3 and label changes
        expect(screen.getByLabelText('Quitar me gusta. 3 me gusta')).toBeTruthy();
      });
    });

    it('reverts like count on API failure', async () => {
      (addLike as jest.Mock).mockRejectedValue(new Error('Network error'));
      render(<ReviewScreen />);

      await waitFor(() => {
        fireEvent.press(screen.getByLabelText('Dar me gusta. 2 me gusta'));
      });

      await waitFor(() => {
        // should revert back to original state
        expect(screen.getByLabelText('Dar me gusta. 2 me gusta')).toBeTruthy();
      });
    });
  });

  // ── Loading State ───────────────────────────────────────────────────────────

  describe('loading state', () => {
    it('shows loading indicator while fetching', () => {
      (getReviews as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockReviews), 500))
      );
      render(<ReviewScreen />);
      expect(screen.getByLabelText('Cargando más reseñas')).toBeTruthy();
    });

    it('loading indicator has polite live region', () => {
      (getReviews as jest.Mock).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockReviews), 500))
      );
      render(<ReviewScreen />);
      const indicator = screen.getByLabelText('Cargando más reseñas');
      expect(indicator.props.accessibilityLiveRegion).toBe('polite');
    });

    it('hides loading indicator after fetch completes', async () => {
      render(<ReviewScreen />);
      await waitFor(() => {
        expect(screen.queryByLabelText('Cargando más reseñas')).toBeNull();
      });
    });
  });

  // ── Data Fetching ───────────────────────────────────────────────────────────

  describe('data fetching', () => {
    it('calls getReviews on mount', async () => {
      render(<ReviewScreen />);
      await waitFor(() => {
        expect(getReviews).toHaveBeenCalledWith(0, 15, 'mock-token');
      });
    });

    it('handles fetch error gracefully without crashing', async () => {
      (getReviews as jest.Mock).mockRejectedValue(new Error('Network error'));
      expect(() => render(<ReviewScreen />)).not.toThrow();
    });

    it('renders empty list when no data returned', async () => {
      (getReviews as jest.Mock).mockResolvedValue([]);
      render(<ReviewScreen />);
      await waitFor(() => {
        expect(screen.queryByRole('button')).toBeNull();
      });
    });
  });

});