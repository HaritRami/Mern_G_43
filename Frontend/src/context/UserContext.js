import { createContext, useState, useContext, useEffect } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check for tokens on initial load
    useEffect(() => {
        const checkAuth = () => {
            const hasTokens = document.cookie.includes('accessToken') ||
                document.cookie.includes('refreshToken');
            setIsAuthenticated(hasTokens);

            // Optionally, you can try to get user data from localStorage
            const savedUser = localStorage.getItem('user');
            if (savedUser && hasTokens) {
                setUser(JSON.parse(savedUser));
            }
        };

        checkAuth();
    }, []);

    const login = (userData) => {
        setUser(userData);
        setIsAuthenticated(true);
        // Save user data to localStorage
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        // Clear all localStorage
        localStorage.clear();

        // Clear all cookies by getting all cookies and removing them one by one
        document.cookie.split(';').forEach(cookie => {
            const name = cookie.split('=')[0].trim();
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        });
    };

    return (
        <UserContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}; 