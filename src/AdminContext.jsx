import { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

// ─── Configure your admin email in .env ───────────────────────────────────────
// VITE_ADMIN_EMAIL=seu@email.com
// ─────────────────────────────────────────────────────────────────────────────
const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL;

const AdminContext = createContext({ isAdmin: false });

export function AdminProvider({ children }) {
  const { user } = useAuth();
  const isAdmin = !!(user && ADMIN_EMAIL && user.email === ADMIN_EMAIL);

  return (
    <AdminContext.Provider value={{ isAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  return useContext(AdminContext);
}