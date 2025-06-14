import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import supabase from '../lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('sk_tutorials_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ? {
        id: data.session.user.id,
        name: data.session.user.user_metadata?.full_name || data.session.user.email || '',
        email: data.session.user.email || '',
        role: data.session.user.user_metadata?.role || 'user',
      } : null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ? {
        id: session.user.id,
        name: session.user.user_metadata?.full_name || session.user.email || '',
        email: session.user.email || '',
        role: session.user.user_metadata?.role || 'user',
      } : null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        return false;
      }

      if (data.user) {
        const loggedInUser: User = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || data.user.email || '',
          email: data.user.email || '',
          role: data.user.user_metadata?.role || 'user',
        };
        setUser(loggedInUser);
        localStorage.setItem('sk_tutorials_user', JSON.stringify(loggedInUser));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    localStorage.removeItem('sk_tutorials_user');
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// import React, { createContext, useContext, useState, ReactNode } from 'react';
// import { supabase } from '../lib/supabase';

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
// }

// interface UserContextType {
//   user: User | null;
//   login: (email: string, password: string) => Promise<boolean>;
//   logout: () => Promise<void>;
//   isAuthenticated: boolean;
// }

// const UserContext = createContext<UserContextType | undefined>(undefined);

// export const useUser = (): UserContextType => {
//   const context = useContext(UserContext);
//   if (!context) {
//     throw new Error('useUser must be used within a UserProvider');
//   }
//   return context;
// };

// interface UserProviderProps {
//   children: ReactNode;
// }

// export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
//   const [user, setUser] = useState<User | null>(() => {
//     const savedUser = localStorage.getItem('sk_tutorials_user');
//     return savedUser ? JSON.parse(savedUser) : null;
//   });

//   const login = async (email: string, password: string): Promise<boolean> => {
//     try {
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });

//       if (error) {
//         console.error('Login error:', error.message);
//         return false;
//       }

//       if (data.user) {
//         const loggedInUser: User = {
//           id: data.user.id,
//           name: data.user.user_metadata?.full_name || data.user.email || '',
//           email: data.user.email || '',
//           role: data.user.user_metadata?.role || 'user',
//         };
//         setUser(loggedInUser);
//         localStorage.setItem('sk_tutorials_user', JSON.stringify(loggedInUser));
//         return true;
//       }

//       return false;
//     } catch (error) {
//       console.error('Login error:', error);
//       return false;
//     }
//   };

//   const logout = async (): Promise<void> => {
//     try {
//       const { error } = await supabase.auth.signOut();
//       if (error) {
//         console.error('Logout error:', error.message);
//       }
//     } catch (error) {
//       console.error('Logout error:', error);
//     }
//     setUser(null);
//     localStorage.removeItem('sk_tutorials_user');
//   };

//   const value = {
//     user,
//     login,
//     logout,
//     isAuthenticated: !!user,
//   };

//   return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
// };


// src/context/UserContext.js
// import { createContext, useContext, useEffect, useState } from 'react';
// import { supabase } from '../supabaseClient';

// const UserContext = createContext();

// export const UserProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const session = supabase.auth.getSession().then(({ data }) => {
//       setUser(data?.session?.user ?? null);
//       setLoading(false);
//     });

//     const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
//       setUser(session?.user ?? null);
//     });

//     return () => listener?.subscription.unsubscribe();
//   }, []);

//   return (
//     <UserContext.Provider value={{ user, loading }}>
//       {children}
//     </UserContext.Provider>
//   );
// };

// export const useUser = () => useContext(UserContext);