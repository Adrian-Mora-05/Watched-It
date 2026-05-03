import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import LoggerIndex from '@/app/(home)/(logger)/index';

// ─── Mocks ────────────────────────────────────────────────────────────────────
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/components/ui/imageButton', () => {
  const { Pressable } = require('react-native');
  return ({ onPress, accessibilityLabel, accessibilityHint }: any) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    />
  );
});

jest.mock('@/services/catalog.service', () => ({
  baseUrl: 'https://test.com/',
  getCatalog: jest.fn().mockResolvedValue([
    { id: 1, title: 'Interstellar', image_link: 'interstellar.jpg', type_catalog: 'Movie' },
    { id: 2, title: 'Breaking Bad', image_link: 'breakingbad.jpg', type_catalog: 'Show' },
    { id: 3, title: 'Inception', image_link: 'inception.jpg', type_catalog: 'Movie' },
    { id: 4, title: 'The Wire', image_link: 'thewire.jpg', type_catalog: 'Show' },
    { id: 5, title: 'Forrest Gump', image_link: 'forrestgump.jpg', type_catalog: 'Movie' },
    { id: 6, title: 'Chernobyl', image_link: 'chernobyl.jpg', type_catalog: 'Show' },
    { id: 7, title: 'The Matrix', image_link: 'matrix.jpg', type_catalog: 'Movie' },
    { id: 8, title: 'Succession', image_link: 'succession.jpg', type_catalog: 'Show' },
    { id: 9, title: 'Goodfellas', image_link: 'goodfellas.jpg', type_catalog: 'Movie' },
    { id: 10, title: 'Dark', image_link: 'dark.jpg', type_catalog: 'Show' },
    { id: 11, title: 'Pulp Fiction', image_link: 'pulpfiction.jpg', type_catalog: 'Movie' },
    { id: 12, title: 'Severance', image_link: 'severance.jpg', type_catalog: 'Show' },
  ]),
}));

jest.mock('@/components/ui/ErrorMessage', () => {
  const { View } = require('react-native');
  return () => <View />;
});

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('LoggerIndex - Accessibility', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Roles & Labels ──────────────────────────────────────────────────────────

  describe('roles and labels', () => {
    it('renders the screen heading', async () => {
      render(<LoggerIndex />);
      await waitFor(() => {
        expect(screen.getByRole('header', { name: 'Nueva entrada' })).toBeTruthy();
      });
    });

    it('search input is labelled and accessible', async () => {
      render(<LoggerIndex />);
      await waitFor(() => {
        expect(screen.getByLabelText('Nombre de la película o serie que acabas de ver')).toBeTruthy();
      });
    });

    it('catalog list has an accessible label', async () => {
      render(<LoggerIndex />);
      await waitFor(() => {
        expect(screen.getByLabelText('Lista de películas y series')).toBeTruthy();
      });
    });

    it('each catalog item has an accessible label with title and type', async () => {
      render(<LoggerIndex />);
      await waitFor(() => {
        expect(screen.getByLabelText('Interstellar, película')).toBeTruthy();
        expect(screen.getByLabelText('Breaking Bad, serie')).toBeTruthy();
      });
    });

    it('each catalog item has an accessible hint', async () => {
      render(<LoggerIndex />);
      await waitFor(() => {
        const item = screen.getByLabelText('Interstellar, película');
        expect(item.props.accessibilityHint).toBe('Toca para registrar esta película o serie');
      });
    });
  });

  // ── Search & Filter ─────────────────────────────────────────────────────────

  describe('search and filter', () => {
    it('filters catalog by title when typing', async () => {
      render(<LoggerIndex />);
      await waitFor(() => {
        expect(screen.getByLabelText('Interstellar, película')).toBeTruthy();
      });

      fireEvent.changeText(
        screen.getByLabelText('Nombre de la película o serie que acabas de ver'),
        'Breaking'
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Breaking Bad, serie')).toBeTruthy();
        expect(screen.queryByLabelText('Interstellar, película')).toBeNull();
      });
    });

    it('shows result count text when filtering', async () => {
      render(<LoggerIndex />);
      await waitFor(() => screen.getByLabelText('Interstellar, película'));

      fireEvent.changeText(
        screen.getByLabelText('Nombre de la película o serie que acabas de ver'),
        'Breaking'
      );

      await waitFor(() => {
        expect(screen.getByText('1 resultado encontrado')).toBeTruthy();
      });
    });

    it('announces result count to screen readers when filtering', async () => {
      const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');

      render(<LoggerIndex />);
      await waitFor(() => screen.getByLabelText('Interstellar, película'));

      fireEvent.changeText(
        screen.getByLabelText('Nombre de la película o serie que acabas de ver'),
        'Breaking'
      );

      await waitFor(() => {
        expect(announce).toHaveBeenCalledWith('1 resultado encontrado');
      });
    });

    it('shows empty state when no results match', async () => {
      render(<LoggerIndex />);
      await waitFor(() => screen.getByLabelText('Interstellar, película'));

      fireEvent.changeText(
        screen.getByLabelText('Nombre de la película o serie que acabas de ver'),
        'xyznonexistent'
      );

      await waitFor(() => {
        expect(screen.getByText('No se encontraron resultados')).toBeTruthy();
      });
    });
  });

  // ── Loading State ───────────────────────────────────────────────────────────

  describe('loading state', () => {
    it('shows loading spinner on initial fetch', () => {
      const { getCatalog } = require('@/services/catalog.service');
      getCatalog.mockImplementationOnce(() => new Promise(() => {})); // never resolves

      render(<LoggerIndex />);
      expect(screen.getByLabelText('Cargando películas y series')).toBeTruthy();
    });

    it('hides loading spinner after fetch completes', async () => {
      render(<LoggerIndex />);
      await waitFor(() => {
        expect(screen.queryByLabelText('Cargando películas y series')).toBeNull();
      });
    });
  });

  // ── Error Feedback ──────────────────────────────────────────────────────────

  describe('error feedback', () => {
    it('announces error to screen readers when fetch fails', async () => {
      const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
      const { getCatalog } = require('@/services/catalog.service');
      getCatalog.mockRejectedValueOnce(new Error('Network error'));

      render(<LoggerIndex />);

      await waitFor(() => {
        expect(announce).toHaveBeenCalledWith('Error al cargar las películas y series');
      });
    });
  });

  // ── Navigation ──────────────────────────────────────────────────────────────

describe('navigation', () => {
  it('navigates to logContent with correct params when item is pressed', async () => {
    render(<LoggerIndex />);
    await waitFor(() => screen.getByLabelText('Interstellar, película'));

    fireEvent.press(screen.getByLabelText('Interstellar, película'));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: '/logContent',
      params: {
        id_content: '1',
        title: 'Interstellar',
        type: 'Movie',
        link: encodeURIComponent('interstellar.jpg'),
      },
    });
  });
});

});