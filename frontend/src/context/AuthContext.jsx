import { createContext, useContext, useState, useEffect } from 'react';
import axiosClient from '../api/axiosClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            // Khoi phuc phien lam viec tu localStorage
            const storedRole = localStorage.getItem('role');
            const storedName = localStorage.getItem('hoTen');
            const storedUserId = localStorage.getItem('userId');
            const storedEmail = localStorage.getItem('email');
            if (storedRole && storedName) {
                setUser({
                    role: storedRole,
                    hoTen: storedName,
                    userId: storedUserId,
                    email: storedEmail,
                });
            }
        }
        setLoading(false);
    }, [token]);

    // Dang nhap: luu token va thong tin user vao state va localStorage
    const login = (newToken, role, hoTen, userId, email) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('role', role);
        localStorage.setItem('hoTen', hoTen);
        localStorage.setItem('userId', String(userId));
        localStorage.setItem('email', email);
        setToken(newToken);
        setUser({ role, hoTen, userId: String(userId), email });
    };

    // Dang xuat: xoa TOAN BO du lieu phien
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('hoTen');
        localStorage.removeItem('userId');   // FIX: truoc day bi bo sot
        localStorage.removeItem('email');    // FIX: truoc day bi bo sot
        setToken(null);
        setUser(null);
    };

    // Kiem tra xem user hien tai co quyen khong
    const hasRole = (role) => {
        if (!user) return false;
        if (Array.isArray(role)) return role.includes(user.role);
        return user.role === role;
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, hasRole }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
