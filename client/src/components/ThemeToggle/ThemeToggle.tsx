import { useTheme } from "../../contexts/ThemeContext";
import './ThemeToggle.css'

function ThemeToggle() {
    const { theme, toggleTheme, userPreference, clearThemePreference } = useTheme();

    return (
        <div className="theme-toggle-container">
            <button
                onClick={toggleTheme}
                className="theme-toggle-button"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                title={`Currently in ${theme} mode`}
            >
                {theme === 'light' ? '🌙' : '☀️'}
                <span className="theme-label">
                    {theme === 'light' ? 'Dark' : 'Light'}
                </span>
            </button>

            {userPreference && (
                <button
                    onClick={clearThemePreference}
                    className="theme-reset-button"
                    title="Use system preference"
                    aria-label="Reset to system theme preference"
                >
                    Use System
                </button>
            )}
        </div>
    );
}

export default ThemeToggle