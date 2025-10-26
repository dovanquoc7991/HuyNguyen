import { useState, useEffect, createContext, useContext, ReactNode } from "react";
import { api } from "@/assets/lib/api";
import { queryClient, TOKEN_KEY } from "@/assets/lib/queryClient"
import { ResponseStatus } from "@/assets/types/exception-type"

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe: boolean | true) => Promise<ResponseStatus>;
  logout: (token: string | null) => Promise<ResponseStatus>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<ResponseStatus>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<ResponseStatus>;
}

export const getCsrfCookie = async () => {
  await fetch('/sanctum/csrf-cookie', { credentials: 'include' });
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn((sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY)) ? true : false);
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean | true): Promise<ResponseStatus> => {
    try {
      const loginInfo = { email, password };
      await getCsrfCookie();
      const data = await api.login(loginInfo);
      if (data && data.token) {
        if (rememberMe) {
          localStorage.setItem(TOKEN_KEY, data.token);
        } else {
          sessionStorage.setItem(TOKEN_KEY, data.token);
        }
        setIsLoggedIn(true);
        return {
          success: true,
          message: "Login successful."
        };
      } else {
        setIsLoggedIn(false);
        return {
          success: false,
          message: data?.message || "Invalid login credentials."
        };
      }
    } catch (error: any) {
      setIsLoggedIn(false);
      const errMsg = error.message ? error.message : 'An error occurred during login.';
      return {
        success: false,
        message: errMsg
      };
    }
  };

  const logout = async (token: string | null): Promise<ResponseStatus> => {
    if (!token) {
      setIsLoggedIn(false);
      return {
        success: false,
        message: 'Token does not found.'
      };
    }
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    queryClient.clear();
    try {
      await api.logout(token);
      setIsLoggedIn(false);
      return {
        success: true,
        message: "Logout successful."
      };
    } catch (error: any) {
      setIsLoggedIn(false);
      const errMsg = error.message ? error.message : 'An error occurred during logout.';
      return {
        success: false,
        message: errMsg
      };
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string): Promise<ResponseStatus> => {
    try {
      await getCsrfCookie();
      const registerInfo = { firstName, lastName, email, password };
      const data = await api.register(registerInfo);
      if (data && (data.success || data.token)) {
        return {
          success: true,
          message: "Register successful."
        };
      } else {
        // Show backend error message if available
        return {
          success: false,
          message: data?.message || 'Register failed.'
        };
      }
    } catch (error: any) {
      // Show backend error message if available
      const errMsg = error?.message || 'An error occurred during adding a new account.';
      return {
        success: false,
        message: errMsg
      };
    }
  };

  const changePassword = async (
  oldPassword: string,
  newPassword: string
): Promise<ResponseStatus> => {
  try {
    await getCsrfCookie();
    const data = await api.changePassword({oldPassword, newPassword });
    if (data && data.success) {
      return {
        success: true,
        message: "Password changed successfully."
      };
    } else {
      return {
        success: false,
        message: data?.message || "Change password failed."
      };
    }
  } catch (error: any) {
    const errMsg = error?.message || "An error occurred during password change.";
    return {
      success: false,
      message: errMsg
    };
  }
};

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, register, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}