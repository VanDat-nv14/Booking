export const isTokenExpired = (token) => {
  try {
    // Lấy phần payload từ token
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    // Lấy thời gian hết hạn từ payload
    const exp = payload.exp;
    
    // So sánh với thời gian hiện tại
    const now = Math.floor(Date.now() / 1000);
    console.log('Token expires at:', new Date(exp * 1000).toLocaleString());
    console.log('Current time:', new Date(now * 1000).toLocaleString());
    console.log('Token is expired:', exp < now);
    
    return exp < now;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    // Nếu có lỗi, coi như token đã hết hạn
    return true;
  }
};

export const getUserFromToken = (token) => {
  try {
    // Lấy phần payload từ token
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(window.atob(base64));
    
    console.log('Token payload:', payload);
    
    // Lấy thông tin người dùng từ payload
    return {
      id: payload.nameid,
      userId: payload.nameid, // Thêm trường này để phù hợp với API
      username: payload.unique_name,
      email: payload.email,
      role: payload.role,
    };
  } catch (error) {
    console.error('Error extracting user from token:', error);
    return null;
  }
};