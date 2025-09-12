// context/AuthContext.tsx
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import axios from "axios";
import { AuthContextType } from "../types";

// Axios global setup
axios.defaults.withCredentials = true;
axios.defaults.baseURL = "https://acadex-tutor-ai.onrender.com";
// axios.defaults.baseURL ="http://localhost:5050";
// Create Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to access AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState<boolean>(true);
  document.cookie.split(';').forEach(c => console.log(c.trim()));

  // Detect password reset flow


  useEffect(() => {
    const initialize = async () => {
      const onResetPage = window.location.pathname.includes("/reset-password");
      const recoveryFlow = window.location.hash.includes("type=recovery");
  
      if (onResetPage && recoveryFlow) {
        console.log("Skipping session fetch during password reset flow.");
        setLoading(false);
        return;
      }
      try {
        await axios.post("/auth/refresh-token",);
        const { data } = await axios.get("/user/profile");
        setUser(data.user);
      } catch (err) {
        console.error("🚫 Session refresh failed:", err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
  
    initialize();
  }, []);
  


  // Fetch authenticated user, auto-refresh if unauthorized
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/user/profile");
      setUser(data.user);
      console.log("Fetched user:", data.user);
      return data.user;
    } catch (err) {
      console.error("🚫 Fetch user failed:", err);
      setUser(null);
      return null;
    }
  };

  // Signup
  const signup = async (fullName: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data } = await axios.post("/auth/signup", { fullName, email, password });
      setUser(data.user);
      await fetchUser(); // Fetch user after signup
      return true;
    } catch (error: any) {
      console.error("Signup Error:", error.response?.data?.error || error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const UpdateProfile = async (
    academic_level: string,
    study_field: string,
    institution: string,
    country: string,
    phone_number: string,
    language: string,
    linkedin: string,
    website: string,
    dob: string,
    gender: string,
    research_interest: string,
    bio: string,
    avatar_url: string): Promise<boolean> => {
    try {
      setLoading(true)
      const { data } = await axios.patch("/user/profile", {
        academic_level,
        study_field,
        institution,
        country,
        phone_number,
        language,
        linkedin,
        website,
        dob,
        gender,
        research_interest,
        bio,
        avatar_url,
      })
      setUser(data.user)
      await fetchUser(); // Fetch user after profile update 
      return true
    } catch (error) {
      console.error("Error updating user profile:", error.response?.data || error.message);
      return false
    } finally {
      setLoading(false)
    }
  }

  // Login
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data } = await axios.post("/auth/signin", { email, password });
      setUser(data.user);
      await fetchUser(); 
      return true;
    } catch (err: any) {
      console.error("Login Error:", err.response?.data?.error || err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };
  // Onboarding
  const Onboarding = async (learning_goal: string, skill_level: string,custom_goal: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { data } = await axios.post("/auth/onboarding", { learning_goal, skill_level,custom_goal });
      setUser(data.user);
      await fetchUser(); 
      return true;
    } catch (err: any) {
      console.error("Login Error:", err.response?.data?.error || err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };





  // Logout
  const logout = async () => {
    try {
      await axios.post("/auth/logout");
    } catch (error) {
      console.error("Logout Error:", error);
    } finally {
      setUser(null);
    }
  };

  const deleteAcc = async () => {
    try {
      await axios.post('/auth/delete')
      setUser(null)
    } catch (error) {
      console.log('failed to delete', error)
    } finally {
      setUser(null)
    }
  }

  // Forgot Password
  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      const { data } = await axios.post("/auth/forgot-password", { email });
      return { success: true, message: data.message || "Check your inbox" };
    } catch (err: any) {
      console.error("Forgot Password Error:", err.response?.data || err.message);
      return {
        success: false,
        message: err.response?.data?.message || "Failed to send reset link.",
      };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        fetchUser,
        login,
        logout,
        deleteAcc,
        forgotPassword,
        signup,
        setUser,
        loading,
        Onboarding,
        UpdateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
