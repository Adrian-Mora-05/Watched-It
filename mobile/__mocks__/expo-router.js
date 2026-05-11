module.exports = {
  router: {
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
    dismissAll: jest.fn(),
  },
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
    back: jest.fn(),
    dismissAll: jest.fn(),
  }),
};