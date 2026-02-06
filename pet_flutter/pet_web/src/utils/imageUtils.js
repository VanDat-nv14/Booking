import axiosClient from './axiosClient';

/**
 * Utility function to get the complete image URL for display
 * @param {string} photoPath - The path to the image from the API
 * @param {string} defaultImage - Optional default image URL to return if photoPath is null
 * @returns {string} The complete URL to display the image
 */
export const getImageUrl = (photoPath, defaultImage = null) => {
  const defaultImageFallback = defaultImage || 'https://via.placeholder.com/300?text=No+Image';
  
  if (!photoPath) return defaultImageFallback;
  
  // If it's already a full URL, return it
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  
  // Standardize path for pet images
  if (photoPath.includes('pets')) {
    // Check if the path is already in the full format '/uploads/pets/...'
    if (photoPath.includes('/uploads/pets/')) {
      return `https://localhost:7164${photoPath}`;
    } else {
      // If it's just a filename, add the full path
      const fileName = photoPath.split('/').pop(); // Get just the filename
      return `https://localhost:7164/uploads/pets/${fileName}`;
    }
  }
  
  // For other types of images, use the API baseURL without the /api part
  try {
    const baseURL = axiosClient.defaults.baseURL;
    const serverBaseURL = baseURL.substring(0, baseURL.lastIndexOf('/api'));
    return `${serverBaseURL}${photoPath.startsWith('/') ? photoPath : `/${photoPath}`}`;
  } catch (error) {
    console.error('Error creating image URL:', error);
    return defaultImageFallback;
  }
};

/**
 * Utility function for pet image URLs
 * @param {string} photoPath - The path to the pet image from the API
 * @returns {string} The complete URL to display the pet image
 */
export const getPetImageUrl = (photoPath) => {
  const defaultImage = 'https://via.placeholder.com/300?text=No+Pet+Image';
  
  if (!photoPath) return defaultImage;
  
  // Check if it's already a full URL
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  
  // Process different path formats
  if (photoPath.includes('/uploads/pets/')) {
    return `https://localhost:7164${photoPath}`;
  } else {
    // If it's just a filename or an incomplete path
    const fileName = photoPath.split('/').pop(); // Get just the filename
    return `https://localhost:7164/uploads/pets/${fileName}`;
  }
};

/**
 * Utility function for product image URLs
 * @param {string} photoPath - The path to the product image from the API
 * @returns {string} The complete URL to display the product image
 */
export const getProductImageUrl = (photoPath) => {
  const defaultImage = 'https://via.placeholder.com/300?text=No+Product+Image';
  
  if (!photoPath) return defaultImage;
  
  // Check if it's already a full URL
  if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
    return photoPath;
  }
  
  // Process different path formats for products
  if (photoPath.includes('/uploads/products/')) {
    return `https://localhost:7164${photoPath}`;
  } else if (photoPath.includes('products/')) {
    // If path is like 'products/filename.jpg'
    return `https://localhost:7164/uploads/${photoPath}`;
  } else {
    // If it's just a filename, assume it's in products folder
    const fileName = photoPath.split('/').pop(); // Get just the filename
    return `https://localhost:7164/uploads/products/${fileName}`;
  }
};

/**
 * Utility function for user avatar URLs
 * @param {string} photoPath - The path to the user avatar from the API
 * @returns {string} The complete URL to display the user avatar
 */
export const getUserAvatarUrl = (photoPath) => {
  const defaultImage = 'https://via.placeholder.com/100?text=User';
  return getImageUrl(photoPath, defaultImage);
};

/**
 * Utility function for review image URLs
 * @param {string} imagePath - The path to the review image from the API
 * @returns {string} The complete URL to display the review image
 */
export const getReviewImageUrl = (imagePath) => {
  const defaultImage = 'https://via.placeholder.com/80?text=No+Image';
  
  if (!imagePath) return defaultImage;
  
  // Check if it's already a full URL
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Process different path formats for reviews
  if (imagePath.includes('/uploads/reviews/')) {
    return `https://localhost:7164${imagePath}`;
  } else if (imagePath.includes('reviews/')) {
    // If path is like 'reviews/filename.jpg'
    return `https://localhost:7164/uploads/${imagePath}`;
  } else {
    // If it's just a filename, assume it's in reviews folder
    const fileName = imagePath.split('/').pop(); // Get just the filename
    return `https://localhost:7164/uploads/reviews/${fileName}`;
  }
}; 