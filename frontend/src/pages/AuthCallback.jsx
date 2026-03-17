import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const ranRef = useRef(false);

    useEffect(() => {
        if (ranRef.current) return;
        ranRef.current = true;
        const token = searchParams.get('token');
        const role = searchParams.get('role');
        const hoTen = searchParams.get('hoTen');
        const userId = searchParams.get('userId'); // Ensure backend sends this in redirectUrl
        const email = searchParams.get('email');   // Ensure backend sends this in redirectUrl
        const avatarUrl = searchParams.get('avatarUrl'); // Google picture URL (optional)

        if (token) {
            const decodedRole = decodeURIComponent(role || '');
            login(token, decodedRole, decodeURIComponent(hoTen || ''), userId, email, avatarUrl ? decodeURIComponent(avatarUrl) : null);
            
            let dest = '/';
            if (decodedRole === 'ADMIN' || decodedRole === 'Admin') dest = '/admin/dashboard';
            else if (decodedRole === 'HOTEL_MANAGER' || decodedRole === 'HotelManager') dest = '/manager/dashboard';
            
            // Replace so user can't go "back" to callback page
            setTimeout(() => navigate(dest, { replace: true }), 0);
        } else {
            navigate('/login', { replace: true });
        }
    }, [searchParams, navigate, login]);

    return (
        <div className="min-h-[40vh] flex items-center justify-center">
            <div className="flex items-center gap-3 text-gray-700">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <span>Đang đăng nhập...</span>
            </div>
        </div>
    );
};

export default AuthCallback;
