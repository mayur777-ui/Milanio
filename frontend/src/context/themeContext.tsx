"use client";
import {
  useState,
  useEffect,
  useContext,
  createContext,
} from "react";

interface ThemeContextType {
  theme: string | null;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>("light");
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as 'light' | 'dark' | null;
   const initialTheme = savedTheme ?? "light";
    setTheme(initialTheme);
    document.documentElement.classList.add(initialTheme);
    if(!savedTheme){ 
      localStorage.setItem("theme", initialTheme);
    }
  }, []);
  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
