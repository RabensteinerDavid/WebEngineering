import { createContext } from 'react';

export interface User {
  id: string;
  email: string;
  role: 'user' | 'moderator';
}
export const AuthContext = createContext<{
  user: User | null;
  setUser: (user: User | null) => void;
}>({
  user: null,
  setUser: () => {
    throw new Error('AuthContext.Provider is missing.');
  },
});
