import React, { createContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: any | null;
  role: string | null;
  loading: boolean;
  setUser: (user: any | null) => void;
  setRole: (role: string | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  setUser: () => {},
  setRole: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // giả lập kiểm tra đăng nhập
    setTimeout(() => {
      setUser(null);
      setRole(null);
      setLoading(false);
    }, 400);
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, loading, setUser, setRole }}>
      {children}
    </AuthContext.Provider>
  );
};
