# 📱 Watched It — Mobile

The mobile app for Watched It, built with Expo (React Native). This document covers everything specific to the mobile frontend, including project structure, setup, and our accessibility testing standards.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Accessibility](#accessibility)
  - [Component Library](#component-library)
  - [Testing Philosophy](#testing-philosophy)
  - [Running Tests](#running-tests)
  - [Writing Accessibility Tests](#writing-accessibility-tests)
  - [Test Checklist](#test-checklist)
- [Mocks & Test Setup](#mocks--test-setup)

---

## Tech Stack

| Purpose              | Technology                                                                 |
|----------------------|----------------------------------------------------------------------------|
| Framework            | [Expo](https://expo.dev/) (React Native)                                  |
| Navigation           | [Expo Router](https://expo.github.io/router/)                             |
| Styling              | [NativeWind](https://www.nativewind.dev/) (Tailwind for React Native)     |
| Accessibility        | [React Native AMA](https://nearform.com/open-source/react-native-ama/)   |
| Testing              | [Jest](https://jestjs.io/) + [React Native Testing Library](https://callstack.github.io/react-native-testing-library/) |

---

## Project Structure

```
mobile/
├── app/                   # Expo Router screens
│   ├── (auth)/
│   └── (tabs)/
├── components/            # Reusable UI components
│   └── ui/
├── hooks/                 # Custom React hooks
├── services/              # API service calls
├── assets/                # Images, fonts, icons
├── __tests__/             # All test files (mirrors app structure)
└── __mocks__/             # Jest mocks for native packages
```

---

## Getting Started

From the `mobile/` directory:

```bash
npm install
npx expo start
```

Then scan the QR code with **Expo Go**, or press:
- `a` for Android emulator
- `i` for iOS simulator

> Make sure your device and development machine are on the same network.

---

## Accessibility

Accessibility is treated as a first-class concern in this app, not an afterthought. Every screen and reusable component is expected to be usable with a screen reader and keyboard navigation.

### Component Library

We use **[React Native AMA](https://nearform.com/open-source/react-native-ama/)** (Accessible Mobile App) as our component library. AMA wraps standard React Native components and enforces accessibility best practices at runtime in development, such as:

- Minimum touch target sizes (44x44pt)
- Required `accessibilityLabel` on interactive elements
- Correct `accessibilityRole` usage
- Contrast and visibility checks

AMA components are used throughout the app but are **mocked in tests** — see [Mocks & Test Setup](#mocks--test-setup).

---

### Testing Philosophy

We test accessibility using **React Native Testing Library (RNTL)**. The core principle is:

> If you can only query elements by role and label, the component is accessible.

This means:
- We **never** use `getByTestId` as a primary query
- We **always** prefer `getByRole` and `getByLabelText`
- If a query fails, it means a real accessibility attribute is missing from the component

We do **not** use AMA's logger or provider in tests. AMA runs its checks at runtime on device. Our tests focus on verifying that the correct accessibility props exist in the rendered output.

---

### Running Tests

Run all tests:
```bash
npx jest
```

Run a specific file:
```bash
npx jest __tests__/auth/signin
```

Watch mode (reruns on save):
```bash
npx jest --watch
```

Clear cache if tests behave unexpectedly:
```bash
npx jest --clearCache
```

---

### Writing Accessibility Tests

Each screen under `app/` should have a corresponding test file under `__tests__/` mirroring the same folder structure.

#### File template

```tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { AccessibilityInfo } from 'react-native';
import MyScreen from '../../app/(auth)/my-screen'; // 🔧 Update path

// ─── Mocks ────────────────────────────────────────────────────────────────────

jest.mock('expo-router', () => ({
  router: { replace: jest.fn() },
}));

jest.mock('../../hooks/ctx', () => ({
  useSession: () => ({ signIn: jest.fn() }),
}));

// Add any other mocks your screen needs below
// jest.mock('../../hooks/useMyHook', () => ({ ... }));

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('MyScreen - Accessibility', () => {

  // ── Roles & Labels ──────────────────────────────────────────────────────────
  // Verify that every interactive element has a correct role and accessible name.
  // If any of these queries fail, a real accessibility attribute is missing.

  describe('roles and labels', () => {
    it('renders the screen heading', () => {
      render(<MyScreen />);
      expect(screen.getByRole('header', { name: 'My Screen Title' })).toBeTruthy(); // 🔧
    });

    it('INPUT_NAME field is labelled and accessible', () => { // 🔧 duplicate per field
      render(<MyScreen />);
      expect(screen.getByLabelText('INPUT_LABEL')).toBeTruthy(); // 🔧
    });

    it('submit button has an accessible name', () => {
      render(<MyScreen />);
      expect(screen.getByRole('button', { name: 'SUBMIT_LABEL' })).toBeTruthy(); // 🔧
    });
  });

  // ── Keyboard & Input ────────────────────────────────────────────────────────
  // Verify that inputs are configured for the right keyboard type, autocomplete,
  // and security settings. These props affect usability for all users.

  describe('keyboard and input', () => {
    it('email field uses email keyboard', () => {
      render(<MyScreen />);
      expect(screen.getByLabelText('EMAIL_LABEL').props.keyboardType).toBe('email-address'); // 🔧
    });

    it('password field is secure', () => {
      render(<MyScreen />);
      expect(screen.getByLabelText('PASSWORD_LABEL').props.secureTextEntry).toBe(true); // 🔧
    });

    // 🔧 Add more input prop checks as needed:
    // autoCapitalize, autoComplete, returnKeyType, etc.
  });

  // ── Error Feedback ──────────────────────────────────────────────────────────
  // Verify that validation errors are both visible and announced to screen readers.
  // Errors must carry accessibilityLiveRegion so TalkBack/VoiceOver picks them up.

  describe('error feedback', () => {
    it('shows and announces a required field error on empty submit', async () => {
      render(<MyScreen />);

      fireEvent.press(screen.getByRole('button', { name: 'SUBMIT_LABEL' })); // 🔧

      const error = await screen.findByText('ERROR_MESSAGE'); // 🔧 exact error string
      expect(error.props.accessibilityLiveRegion).toBe('assertive');
    });

    it('announces all errors to screen readers via AccessibilityInfo', async () => {
      const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');

      render(<MyScreen />);
      fireEvent.press(screen.getByRole('button', { name: 'SUBMIT_LABEL' })); // 🔧

      await waitFor(() => {
        expect(announce).toHaveBeenCalledWith(
          expect.stringContaining('ERROR_KEYWORD') // 🔧 part of expected announcement
        );
      });
    });

    // 🔧 Add one test per distinct error message / field combination if needed
  });

  // ── Loading State ───────────────────────────────────────────────────────────
  // Verify that async actions communicate progress to screen readers via
  // accessibilityState.busy. Without this, users have no feedback during loads.

  describe('loading state', () => {
    it('button communicates busy state while submitting', async () => {
      render(<MyScreen />);

      // 🔧 Fill in all required fields to pass validation
      fireEvent.changeText(screen.getByLabelText('EMAIL_LABEL'), 'test@email.com');
      fireEvent.changeText(screen.getByLabelText('PASSWORD_LABEL'), 'password123');

      fireEvent.press(screen.getByRole('button', { name: 'SUBMIT_LABEL' })); // 🔧

      await waitFor(() => {
        const button = screen.getByRole('button', { name: 'SUBMIT_LABEL' }); // 🔧
        expect(button.props.accessibilityState?.busy).toBe(true);
      });
    });
  });

  // ── Navigation & Success ────────────────────────────────────────────────────
  // Verify that successful actions trigger the correct navigation.
  // Keep mocks at the top of the file so they can be referenced here.

  describe('navigation', () => {
    it('redirects after successful submit', async () => {
      const { router } = require('expo-router');

      render(<MyScreen />);

      // 🔧 Fill in valid data, mock any API calls that need to succeed
      fireEvent.changeText(screen.getByLabelText('EMAIL_LABEL'), 'test@email.com');
      fireEvent.changeText(screen.getByLabelText('PASSWORD_LABEL'), 'password123');
      fireEvent.press(screen.getByRole('button', { name: 'SUBMIT_LABEL' })); // 🔧

      await waitFor(() => {
        expect(router.replace).toHaveBeenCalledWith('/'); // 🔧 expected route
      });
    });
  });

});
```

#### Query priority

Always query elements in this order — use the first one that works:

| Priority | Query | Use for |
|---|---|---|
| 1 | `getByRole` | Buttons, links, headers |
| 2 | `getByLabelText` | Form inputs |
| 3 | `getByText` | Visible static text |
| 4 | `getByTestId` | Last resort only |

---

### Test Checklist

Use this checklist when writing tests for any new screen or component:

- [ ] All form fields are queryable via `getByLabelText`
- [ ] All buttons are queryable via `getByRole('button', { name: '...' })`
- [ ] Email inputs have `keyboardType="email-address"`
- [ ] Password inputs have `secureTextEntry={true}`
- [ ] Error messages have `accessibilityLiveRegion="polite"`
- [ ] Loading/busy states set `accessibilityState={{ busy: true }}` on the button
- [ ] Disabled buttons include an `accessibilityHint` explaining why
- [ ] Decorative images have `accessibilityElementsHidden={true}`

---

## Mocks & Test Setup

Native packages cannot run in Jest (Node.js environment) because they depend on device APIs. We mock them so tests can run without a simulator.

### `__mocks__/react-native-reanimated.js`
Replaces Reanimated with its official JavaScript mock.

### `__mocks__/react-native-worklets.js`
Stubs out the Worklets native module required by Reanimated v4.

### `__mocks__/@react-native-ama/`
AMA components are swapped for their plain React Native equivalents (`Pressable`, `Text`, `TextInput`, `View`). This means AMA's runtime accessibility checks do **not** run in tests — which is intentional. We verify accessibility props directly instead.

### `jest.config.js`
Points Jest to the correct mocks via `moduleNameMapper` and uses `jest-expo` as the preset for Expo compatibility.

> If you add a new native package and tests start failing with a native module error, you will need to add a new mock file for it under `__mocks__/` and register it in `jest.config.js`.