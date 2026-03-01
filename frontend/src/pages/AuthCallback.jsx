import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const token = searchParams.get('token');
        const role = searchParams.get('role');
        const hoTen = searchParams.get('hoTen');
        const userId = searchParams.get('userId'); // Ensure backend sends this in redirectUrl
        const email = searchParams.get('email');   // Ensure backend sends this in redirectUrl

        if (token) {
            const decodedRole = decodeURIComponent(role || '');
            login(token, decodedRole, decodeURIComponent(hoTen || ''), userId, email);
            alert("Đăng nhập thành công!");
            
            let dest = '/';
            if (decodedRole === 'ADMIN' || decodedRole === 'Admin') dest = '/admin/dashboard';
            else if (decodedRole === 'HOTEL_MANAGER' || decodedRole === 'HotelManager') dest = '/manager/dashboard';
            
            navigate(dest);
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate, login]);

    return <div>Processing login...</div>;
};

export default AuthCallback;
