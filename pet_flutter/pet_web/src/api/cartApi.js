import axiosClient from '../utils/axiosClient';

// Get user's cart
export const getCartApi = async () => {
  return await axiosClient.get('/Cart');
};

// Add item to cart
export const addToCartApi = async (productId, quantity, option = null) => {
  return await axiosClient.post('/Cart/add', {
    productId,
    quantity,
    option
  });
};

// Update cart item quantity
export const updateCartItemApi = async (cartItemId, quantity) => {
  return await axiosClient.put(`/Cart/items/${cartItemId}`, {
    quantity
  });
};

// Remove cart item
export const removeCartItemApi = async (cartItemId) => {
  return await axiosClient.delete(`/Cart/items/${cartItemId}`);
};

// Clear entire cart
export const clearCartApi = async () => {
  return await axiosClient.delete('/Cart/clear');
};

// Sync cart from localStorage to backend
export const syncCartApi = async (cartItems) => {
  return await axiosClient.post('/Cart/sync', cartItems);
}; 