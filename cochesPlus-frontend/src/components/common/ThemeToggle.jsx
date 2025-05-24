import { useTheme } from '../../contexts/ThemeContext';

export default function ThemeToggle() {
    const { darkMode, toggleDarkMode } = useTheme();

    return (
        <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-primary-dark dark:bg-primary-light"
            aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
            {darkMode ? '☀️' : '🌙'}
        </button>
    );
}