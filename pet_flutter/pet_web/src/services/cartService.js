import { message, Modal } from 'antd';
import { getCartApi, addToCartApi, updateCartItemApi, removeCartItemApi, clearCartApi } from '../api/cartApi';

// Check if user is authenticated
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Get current user
const getCurrentUser = () => {
  const userString = localStorage.getItem('user');
  return userString ? JSON.parse(userString) : null;
};

// Show login required modal
const showLoginRequiredModal = () => {
  return new Promise((resolve) => {
    Modal.confirm({
      title: 'Yêu cầu đăng nhập',
      content: 'Bạn cần đăng nhập để sử dụng giỏ hàng. Bạn có muốn đăng nhập ngay bây giờ?',
      okText: 'Đăng nhập',
      cancelText: 'Hủy',
      centered: true,
      onOk() {
        window.location.href = '/login';
        resolve(true);
      },
      onCancel() {
        resolve(false);
      }
    });
  });
};

// Cart Service
const cartService = {
  // Get user's cart
  async getCart() {
    if (!isAuthenticated()) {
      return { cartItems: [], total: 0, itemCount: 0 };
    }

    try {
      const response = await getCartApi();
      const cart = response.data;
      
      return {
        cartItems: cart.cartItems || [],
        total: cart.total || 0,
        itemCount: cart.cartItems ? cart.cartItems.reduce((count, item) => count + item.quantity, 0) : 0
      };
    } catch (error) {
      console.error('Error getting cart:', error);
      message.error('Không thể tải giỏ hàng');
      return { cartItems: [], total: 0, itemCount: 0 };
    }
  },

  // Add item to cart
  async addToCart(product, quantity = 1, option = null) {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      return await showLoginRequiredModal();
    }

    try {
      await addToCartApi(product.productId, quantity, option);
      
      message.success({
        content: `Đã thêm ${product.name} vào giỏ hàng`,
        duration: 2,
      });
      
      // Dispatch cart update event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (error.response?.data) {
        message.error({
          content: error.response.data,
          duration: 3,
        });
      } else {
        message.error({
          content: 'Không thể thêm sản phẩm vào giỏ hàng',
          duration: 3,
        });
      }
      return false;
    }
  },

  // Update cart item quantity
  async updateCartItem(cartItemId, quantity) {
    if (!isAuthenticated()) {
      message.error('Bạn cần đăng nhập để cập nhật giỏ hàng');
      return false;
    }

    try {
      await updateCartItemApi(cartItemId, quantity);
      message.success('Đã cập nhật số lượng');
      
      // Dispatch cart update event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      return true;
    } catch (error) {
      console.error('Error updating cart item:', error);
      if (error.response?.data) {
        message.error({
          content: error.response.data,
          duration: 3,
        });
      } else {
        message.error('Không thể cập nhật số lượng');
      }
      return false;
    }
  },

  // Remove cart item
  async removeCartItem(cartItemId) {
    if (!isAuthenticated()) {
      message.error('Bạn cần đăng nhập để xóa sản phẩm');
      return false;
    }

    try {
      await removeCartItemApi(cartItemId);
      message.success('Đã xóa sản phẩm khỏi giỏ hàng');
      
      // Dispatch cart update event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      return true;
    } catch (error) {
      console.error('Error removing cart item:', error);
      message.error('Không thể xóa sản phẩm khỏi giỏ hàng');
      return false;
    }
  },

  // Clear entire cart
  async clearCart() {
    if (!isAuthenticated()) {
      message.error('Bạn cần đăng nhập để xóa giỏ hàng');
      return false;
    }

    try {
      await clearCartApi();
      message.success('Đã xóa toàn bộ giỏ hàng');
      
      // Dispatch cart update event
      window.dispatchEvent(new CustomEvent('cartUpdated'));
      
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      message.error('Không thể xóa giỏ hàng');
      return false;
    }
  },

  // Get cart item count for header display
  async getCartItemCount() {
    if (!isAuthenticated()) {
      return 0;
    }

    try {
      const cart = await this.getCart();
      return cart.itemCount;
    } catch (error) {
      console.error('Error getting cart count:', error);
      return 0;
    }
  }
};

export default cartService; 