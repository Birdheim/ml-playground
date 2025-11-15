import { createContext, useContext, useEffect, useState } from 'react';

// Define the theme type
type Theme = 'light' | 'dark';

// Define the shape of the context
interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setThemeMode: (mode: Theme) => void;
    clearThemePreference: () => void;
    userPreference: boolean;
}

// Create context with proper typing
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Type the provider props
interface ThemeProviderProps {
    children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    // Initialize theme state with proper type
    const [theme, setTheme] = useState<Theme>(() => {
        // Priority 1: Check if user has previously set a preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            return savedTheme;
        }

        // Priority 2: Use system preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        // Priority 3: Default to light
        return 'light';
    });

    // Track if user has manually set theme (vs using system default)
    const [userPreference, setUserPreference] = useState<boolean>(() => {
        return localStorage.getItem('theme') !== null;
    });

    // Listen for system theme changes (only if user hasn't set preference)
    useEffect(() => {
        if (userPreference) return; // Don't listen if user has set preference

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            setTheme(e.matches ? 'dark' : 'light');
        };

        // Modern browsers
        mediaQuery.addEventListener('change', handleChange);

        return () => {
            mediaQuery.removeEventListener('change', handleChange);
        };
    }, [userPreference]);

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    // Toggle theme (this sets user preference)
    const toggleTheme = () => {
        const newTheme: Theme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        setUserPreference(true);
        localStorage.setItem('theme', newTheme);
    };

    // Set specific theme (this sets user preference)
    const setThemeMode = (mode: Theme) => {
        setTheme(mode);
        setUserPreference(true);
        localStorage.setItem('theme', mode);
    };

    // Clear user preference and revert to system
    const clearThemePreference = () => {
        localStorage.removeItem('theme');
        setUserPreference(false);

        // Revert to system preference
        const systemPreference: Theme = window.matchMedia('(prefers-color-scheme: dark)').matches 
            ? 'dark' 
            : 'light';
        setTheme(systemPreference);
    };

    return (
        <ThemeContext.Provider
            value={{
                theme,
                toggleTheme,
                setThemeMode,
                clearThemePreference,
                userPreference,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};