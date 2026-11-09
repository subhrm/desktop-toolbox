import { vi, beforeEach } from "vitest";

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockImplementation(() => Promise.resolve()),
    readText: vi.fn().mockImplementation(() => Promise.resolve("")),
  },
});

beforeEach(() => {
  vi.clearAllMocks();
});
