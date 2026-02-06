import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Restore session
            const storedRole = localStorage.getItem('role');
            const storedName = localStorage.getItem('hoTen');
            const storedUserId = localStorage.getItem('userId');
            const storedEmail = localStorage.getItem('email');
            if (storedRole && storedName) {
                setUser({ role: storedRole, hoTen: storedName, userId: storedUserId, email: storedEmail });
            }
        }
        setLoading(false);
    }, [token]);

    const login = (newToken, role, hoTen, userId, email) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('role', role);
        localStorage.setItem('hoTen', hoTen);
        localStorage.setItem('userId', userId);
        localStorage.setItem('email', email);
        setToken(newToken);
        setUser({ role, hoTen, userId, email });
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('hoTen');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
