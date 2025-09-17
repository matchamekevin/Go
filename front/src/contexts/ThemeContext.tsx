import React, { createContext, useContext, useState, ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';

interface ThemeContextProps {
	mode: ThemeMode;
	setMode: (mode: ThemeMode) => void;
	toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
	const [mode, setMode] = useState<ThemeMode>('light');
	const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
	return (
		<ThemeContext.Provider value={{ mode, setMode, toggleMode }}>
			{children}
		</ThemeContext.Provider>
	);
};

export const useThemeMode = () => {
	const context = useContext(ThemeContext);
	if (!context) throw new Error('useThemeMode must be used within ThemeProvider');
	return context;
};
