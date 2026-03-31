import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { Link } from 'react-router-dom';
import { resolveHotelImageUrl } from '../utils/hotelImages';
import { IconStar, IconBuilding, IconMapPin } from '../components/icons/UiIcons';

const MyReviewsPage = () => {
    const { user, loading: authLoading } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (authLoading) return;

        const uid = user?.userId != null ? Number(user.userId) : NaN;
        if (!user || Number.isNaN(uid) || uid <= 0) {
            setLoading(false);
            setReviews([]);
            return;
        }

        setLoading(true);
        setError('');
        axiosClient
            .get(`/reviews/user/${uid}`)
            .then((res) => setReviews(Array.isArray(res.data) ? res.data : []))
            .catch((err) => {
                console.error('Error fetching user reviews:', err);
                const msg =
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    (err.response?.status === 401 ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' : null) ||
                    (err.message === 'Network Error' ? 'Không kết nối được máy chủ (kiểm tra backend đã chạy chưa).' : null) ||
                    'Không tải được danh sách đánh giá.';
                setError(msg);
                setReviews([]);
            })
            .finally(() => setLoading(false));
    }, [authLoading, user?.userId]);

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (authLoading || loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="flex items-center gap-3 mb-8">
                <IconStar className="w-8 h-8 text-amber-400 shrink-0" aria-hidden />
                <h1 className="text-2xl font-bold text-gray-800">Đánh giá của tôi</h1>
            </div>

            {error && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            {!error && reviews.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center border border-gray-100">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 ring-1 ring-slate-200/80">
                        <IconStar className="w-9 h-9" aria-hidden />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Bạn chưa có đánh giá nào</h3>
                    <p className="text-gray-500 mb-6">Hãy đặt phòng và chia sẻ trải nghiệm của bạn với mọi người!</p>
                    <Link
                        to="/"
                        className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                    >
                        Khám phá khách sạn ngay
                    </Link>
                </div>
            ) : reviews.length > 0 ? (
                <div className="space-y-6">
                    {reviews.map((review) => {
                        const cover = resolveHotelImageUrl(review.khachSan?.hinhAnhBia);
                        const maDp = review.maDatPhong || review.phieuDatPhong?.maDatPhong;
                        return (
                            <div
                                key={review.id}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                                        <div className="flex gap-4">
                                            <div className="w-16 h-16 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                                                {cover ? (
                                                    <img
                                                        src={cover}
                                                        alt=""
                                                        className="w-full h-full object-cover object-center"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                ) : (
                                                    <IconBuilding className="w-8 h-8 text-slate-300" aria-hidden />
                                                )}
                                            </div>
                                            <div>
                                                <Link
                                                    to={`/hotels/${review.khachSan?.id}`}
                                                    className="text-lg font-bold text-gray-800 hover:text-blue-600 transition-colors"
                                                >
                                                    {review.khachSan?.ten || 'Khách sạn'}
                                                </Link>
                                                <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                                    <IconMapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" aria-hidden />
                                                    {review.khachSan?.diaChi || '—'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col md:items-end">
                                            <div className="flex items-center gap-1 text-amber-500 mb-1">
                                                {Array.from({ length: 5 }, (_, i) => (
                                                    <IconStar
                                                        key={i}
                                                        className={`w-5 h-5 ${i < (review.soSaoTong || 0) ? 'text-amber-400' : 'text-slate-200'}`}
                                                    />
                                                ))}
                                                <span className="ml-2 text-sm font-bold text-gray-700">{review.soSaoTong}/5</span>
                                            </div>
                                            <p className="text-xs text-gray-400">Đã đánh giá: {formatDate(review.ngayDanhGia)}</p>
                                        </div>
                                    </div>

                                    {review.binhLuan && (
                                        <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-50">
                                            <p className="text-gray-700 italic leading-relaxed">&quot;{review.binhLuan}&quot;</p>
                                        </div>
                                    )}

                                    {review.phanHoi && (
                                        <div className="ml-4 md:ml-8 border-l-4 border-blue-500 pl-4 py-2 mt-4 bg-blue-50/50 rounded-r-xl p-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                                                    Phản hồi từ khách sạn
                                                </span>
                                                <span className="text-[10px] text-gray-400">{formatDate(review.ngayPhanHoi)}</span>
                                            </div>
                                            <p className="text-sm text-gray-700">{review.phanHoi}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="px-6 py-3 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                                    <span className="text-xs text-gray-500">
                                        Mã đặt phòng:{' '}
                                        <span className="font-mono font-medium text-gray-700">{maDp || '—'}</span>
                                    </span>
                                    <Link
                                        to={`/hotels/${review.khachSan?.id}`}
                                        className="text-xs font-bold text-blue-600 hover:underline"
                                    >
                                        Xem chi tiết khách sạn →
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : null}
        </div>
    );
};

export default MyReviewsPage;
