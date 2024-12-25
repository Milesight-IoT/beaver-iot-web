import { type PropsWithChildren } from 'react';
import iotStorage, { TOKEN_CACHE_KEY } from '@milesight/shared/src/utils/storage';

import { useStorageState, AuthContext, AuthSessionData } from '../hooks';

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState(TOKEN_CACHE_KEY);

  return (
    <AuthContext.Provider
      value={{
        login: (session: AuthSessionData) => {
          iotStorage.setItem(TOKEN_CACHE_KEY, session);
          setSession(JSON.stringify(session));
        },
        logout: () => {
          setSession(null);
        },
        session: typeof session === 'string' ? JSON.parse(session) : null,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}