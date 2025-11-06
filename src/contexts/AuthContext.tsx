import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "admin" | "super-admin";
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string, userData?: Partial<User>) => Promise<void>; // ✅ Added
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("admin_user");
    return saved ? JSON.parse(saved) : null;
  });

  const useMock = import.meta.env.VITE_USE_MOCK_AUTH === "true";

  const login = async (email: string, password: string) => {
    if (useMock) {
      if (
        email === import.meta.env.VITE_ADMIN_EMAIL &&
        password === import.meta.env.VITE_ADMIN_PASSWORD
      ) {
        const userData: User = {
          id: "1",
          name: "Admin User",
          email,
          avatar:
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
          role: "admin",
        };
        setUser(userData);
        localStorage.setItem("admin_user", JSON.stringify(userData));
      } else {
        throw new Error("Invalid credentials (mock)");
      }
    } else {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!res.ok) throw new Error("Invalid credentials (API)");

      const data = await res.json();

      const userData: User = {
        id: data.id,
        name: data.name,
        email: data.email,
        avatar: data.avatar,
        role: data.role,
      };

      setUser(userData);
      localStorage.setItem("admin_user", JSON.stringify(userData));
      localStorage.setItem("token", data.token);
    }
  };

  // ✅ OTP TOKEN LOGIN SUPPORT
  const loginWithToken = async (token: string) => {
  // Save token in local storage
  localStorage.setItem("token", token);

  // Set a simple admin user (since backend does not provide profile)
  const finalUser = {
    id: "",
    name: "Admin User",
    email: "",
    avatar: "https://ui-avatars.com/api/?name=Admin+User",
    role: "admin" as "admin" | "super-admin",
  };

  setUser(finalUser);
  localStorage.setItem("admin_user", JSON.stringify(finalUser));
};

  const logout = () => {
    setUser(null);
    localStorage.removeItem("admin_user");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        loginWithToken, // ✅ now available to call from OTP screen
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
