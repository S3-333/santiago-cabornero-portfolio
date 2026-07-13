import { createContext, use, useState, useMemo, useCallback } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState('en');

    const toggleLanguage = useCallback(() => {
        setLanguage((prev) => (prev === 'en' ? 'es' : 'en'));
    }, []);

    // toggleLanguage es estable (useCallback con deps=[]) — el memo solo re-corre cuando language cambia
    const value = useMemo(() => ({ language, toggleLanguage }), [language, toggleLanguage]);

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
}

// React 19: use() replaces useContext() for consuming context
// FIX: Throw explícito si el hook se intenta usar fuera de LanguageProvider
// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage() {
    const context = use(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
