import { useState } from 'react';

import { useAuth } from '@/src/features/auth/context/AuthProvider';

export function useLogout() {
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    try {
      await signOut();
    } catch {
      // AuthProvider clears the local session even if the server is unavailable.
    } finally {
      setIsLoggingOut(false);
    }
  };

  return { isLoggingOut, logout };
}
