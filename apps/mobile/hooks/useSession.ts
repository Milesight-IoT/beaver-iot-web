import { useContext, createContext } from 'react';

export interface AuthSessionData {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export const AuthContext = createContext<{
  login: (session: AuthSessionData) => void;
  logout: () => void;
  session?: AuthSessionData | null;
  isLoading: boolean;
}>({
  login: () => null,
  logout: () => null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      console.warn('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}