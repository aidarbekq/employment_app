import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

interface User {
  id: number;
  username: string;
  email: string;
  role: "ALUMNI" | "EMPLOYER" | "ADMIN";
  first_name: string;
  last_name: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  username: string;
  password: string;
  password2: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "ALUMNI" | "EMPLOYER";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await axios.get("/api/users/me/");
      setUser(res.data);
      localStorage.setItem("role", res.data.role); // ← сохраняем роль
    } catch (error) {
      setUser(null);
      localStorage.removeItem("role"); // очищаем роль при ошибке
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const res = await axios.post("/api/users/login/", { username, password });
    localStorage.setItem("access_token", res.data.access);
    localStorage.setItem("refresh_token", res.data.refresh);
    axios.defaults.headers.common["Authorization"] = `Bearer ${res.data.access}`;
    await fetchUser();
  };

  const register = async (data: RegisterData) => {
    await axios.post("/api/users/register/", data);
    await login(data.username, data.password);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("role");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
