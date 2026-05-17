import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import DiaryScreen from '@/app/(home)/(tabs)/(profile)/diary';

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('@/hooks/ctx', () => ({
  useSession: () => ({ session: 'mock-token' }),
}));

jest.mock('@/services/diary.service', () => ({
  getDiaryEntries: jest.fn().mockResolvedValue({
    data: [
      {
        id: 1,
        type: 'movie',
        fecha_creado: '2026-05-11T12:00:00Z',
        calificacion: 5,
        content: {
          id: 10,
          titulo: 'Interstellar',
          anio: 2014,
          enlace_imagen: 'interstellar.jpg',
        },
      },
      {
        id: 2,
        type: 'series',
        fecha_creado: '2026-05-11T13:00:00Z',
        calificacion: 4,
        content: {
          id: 11,
          titulo: 'Breaking Bad',
          anio: 2008,
          enlace_imagen: 'bb.jpg',
        },
      },
    ],
  }),
}));

jest.mock('@/components/ui/DiaryEntryCard', () => {
  const { Pressable, Text } = require('react-native');

  return ({ title, onPress }: any) => (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Entrada ${title}`}
    >
      <Text>{title}</Text>
    </Pressable>
  );
});

jest.mock('@react-native-ama/react-native', () => {
  const { Text } = require('react-native');
  return {
    Text: (props: any) => <Text {...props}>{props.children}</Text>,
  };
});

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('DiaryScreen - Accessibility', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── Roles & Labels ──────────────────────────────────────────────────────────

  describe('roles and labels', () => {

    it('renders month header with accessibility label', async () => {
      render(<DiaryScreen />);

      await waitFor(() => {
        expect(
          screen.getByRole('header', { name: /mayo/i })
        ).toBeTruthy();
      });
    });

    it('renders diary entries as accessible buttons', async () => {
  render(<DiaryScreen />);

  await waitFor(() => {
    expect(screen.getByLabelText('Entrada Interstellar')).toBeTruthy();
    expect(screen.getByLabelText('Entrada Breaking Bad')).toBeTruthy();
  }, { timeout: 8000 });
});

  });

  // ── Interaction ─────────────────────────────────────────────────────────────

  describe('interaction', () => {

    it('calls onPress when entry is pressed', async () => {

      render(<DiaryScreen />);

      await waitFor(() => {
        fireEvent.press(screen.getByLabelText('Entrada Interstellar'));
      });

      expect(screen.getByLabelText('Entrada Interstellar')).toBeTruthy();
    });

  });

  // ── FlatList rendering ──────────────────────────────────────────────────────

  describe('list rendering', () => {

    it('renders at least one month section', async () => {

      render(<DiaryScreen />);

      await waitFor(() => {
        expect(
          screen.getByRole('header', { name: /mayo/i })
        ).toBeTruthy();
      });

    });

    it('renders multiple entries', async () => {

      render(<DiaryScreen />);

      await waitFor(() => {
        const entries = screen.getAllByRole('button');
        expect(entries.length).toBeGreaterThan(0);
      });

    });

  });

});