import React, { createContext, useContext, useEffect, useState } from 'react';

// Defines the custom user type replacing the Firebase user
interface AuthUser {
  id?: number | string;
  name: string;
  email: string;
  token?: string;
  role?: string;
}

interface AppContextType {
  services: any[];
  categories: Record<string, any[]>;
  loadingServices: boolean;
  user: AuthUser | null;
  loadingUser: boolean;
  setUser: (user: AuthUser | null) => void;
  refreshServices: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<any[]>([]);
  const [categories, setCategories] = useState<Record<string, any[]>>({});
  const [loadingServices, setLoadingServices] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const loadServices = async () => {
    setLoadingServices(true);
    try {
      const response = await fetch('/api/services');
      const svcs = await response.json();
      
      const cats: Record<string, any[]> = {};
      svcs.forEach((data: any) => {
        const cat = data.category || 'OTHER';
        if (!cats[cat]) cats[cat] = [];
        cats[cat].push(data);
      });
      setServices(svcs);
      setCategories(cats);
    } catch (err) {
      console.error("Failed to load services:", err);
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => {
    loadServices();
    // Use local storage to persist the user session for now
    const storedUser = localStorage.getItem('auth_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch(e) {}
    }
    setLoadingUser(false);
  }, []);

  const handleSetUser = (u: AuthUser | null) => {
    if (u) {
      localStorage.setItem('auth_user', JSON.stringify(u));
    } else {
      localStorage.removeItem('auth_user');
    }
    setUser(u);
  };

  return (
    <AppContext.Provider value={{ services, categories, loadingServices, user, loadingUser, setUser: handleSetUser, refreshServices: loadServices }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
