// TypeScript version of storageKeys.js
// This demonstrates how to convert a simple constants file

export interface StorageKeys {
  readonly Users: string;
  readonly Roles: string;
}

export const storage: StorageKeys = {
  Users: "users-storage",
  Roles: "roles-storage",
} as const;

// Alternative approach using enum for better type safety
export enum StorageKey {
  Users = "users-storage",
  Roles = "roles-storage",
}

// Type-safe helper function
export const getStorageItem = <T>(key: keyof StorageKeys): T | null => {
  try {
    const item = localStorage.getItem(storage[key]);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Error parsing storage item for key ${key}:`, error);
    return null;
  }
};

export const setStorageItem = <T>(key: keyof StorageKeys, value: T): void => {
  try {
    localStorage.setItem(storage[key], JSON.stringify(value));
  } catch (error) {
    console.error(`Error setting storage item for key ${key}:`, error);
  }
};

export const removeStorageItem = (key: keyof StorageKeys): void => {
  localStorage.removeItem(storage[key]);
};