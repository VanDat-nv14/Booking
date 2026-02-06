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
            login(token, decodeURIComponent(role || ''), decodeURIComponent(hoTen || ''), userId, email);
            alert("Đăng nhập thành công!");
            navigate('/');
        } else {
            navigate('/login');
        }
    }, [searchParams, navigate, login]);

    return <div>Processing login...</div>;
};

export default AuthCallback;
