import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { getPostById } from '../../services/blogService';
import BlogDetail from '../../components/blog/BlogDetail';
import { LoadingOutlined } from '@ant-design/icons';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Breadcrumbs = styled.div`
  margin-bottom: 30px;
  font-size: 16px;
  
  a {
    color: #3a8bff;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  span {
    color: #888;
    margin: 0 8px;
  }
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: #3a8bff;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 0;
  
  svg {
    margin-right: 5px;
  }
  
  &:hover {
    text-decoration: underline;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  font-size: 24px;
  color: #888;
`;

const ErrorContainer = styled.div`
  text-align: center;
  padding: 50px 0;
  
  h3 {
    font-size: 24px;
    color: #555;
    margin-bottom: 15px;
  }
  
  p {
    color: #888;
    margin-bottom: 20px;
  }
  
  button {
    background-color: #3a8bff;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    
    &:hover {
      background-color: #2a7ae2;
    }
  }
`;

const RelatedPosts = styled.div`
  margin-top: 60px;
  
  h3 {
    font-size: 24px;
    font-weight: 600;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
  }
`;

const RelatedPostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
`;

const RelatedPostCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  .image {
    height: 160px;
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .content {
    padding: 15px;
    
    h4 {
      font-size: 18px;
      margin-top: 0;
      margin-bottom: 10px;
    }
    
    a {
      text-decoration: none;
      color: #333;
      
      &:hover {
        color: #3a8bff;
      }
    }
    
    .date {
      font-size: 14px;
      color: #888;
    }
  }
`;

const BlogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  
  useEffect(() => {
    if (id) {
      fetchPost(id);
    }
  }, [id]);
  
  const fetchPost = async (postId) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getPostById(postId);
      setPost(data);
      
      // Giả định rằng bạn có hàm để lấy bài viết liên quan
      // Có thể thêm sau trong blogService.js
      // fetchRelatedPosts(data.category, data.postId);
      
    } catch (error) {
      console.error(`Error fetching blog post with ID ${postId}:`, error);
      setError('Không thể tải bài viết. Bài viết có thể đã bị xóa hoặc không tồn tại.');
    } finally {
      setLoading(false);
    }
  };
  
  // Hàm này sẽ gọi API lấy bài viết liên quan (cùng category)
  // Có thể thêm sau trong blogService.js
  const fetchRelatedPosts = async (category, currentPostId) => {
    try {
      // Giả sử bạn đã có API endpoint cho bài viết liên quan
      // const data = await getRelatedPosts(category, currentPostId);
      // setRelatedPosts(data);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };
  
  const handleGoBack = () => {
    navigate(-1); // Quay lại trang trước đó
  };
  
  // Format date helper
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };
  
  return (
    <PageContainer>
      <Breadcrumbs>
        <a href="/">Trang chủ</a>
        <span>/</span>
        <a href="/blog">Blog</a>
        <span>/</span>
        {post && post.category && <a href={`/blog?category=${post.category}`}>{post.category}</a>}
        {post && post.category && <span>/</span>}
        <span>{post ? post.title : 'Đang tải...'}</span>
      </Breadcrumbs>
      
      <BackButton onClick={handleGoBack}>
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/>
        </svg>
        Quay lại
      </BackButton>
      
      {loading ? (
        <LoadingContainer>
          <LoadingOutlined style={{ marginRight: 10 }} />
          Đang tải bài viết...
        </LoadingContainer>
      ) : error ? (
        <ErrorContainer>
          <h3>Không thể tải bài viết</h3>
          <p>{error}</p>
          <button onClick={() => navigate('/blog')}>Quay lại trang blog</button>
        </ErrorContainer>
      ) : (
        <>
          <BlogDetail post={post} />
          
          {relatedPosts.length > 0 && (
            <RelatedPosts>
              <h3>Bài viết liên quan</h3>
              <RelatedPostsGrid>
                {relatedPosts.map(relPost => (
                  <RelatedPostCard key={relPost.postId}>
                    <div className="image">
                      <img 
                        src={relPost.featuredImage || '/images/default-blog.jpg'} 
                        alt={relPost.title} 
                      />
                    </div>
                    <div className="content">
                      <h4>
                        <a href={`/blog/${relPost.postId}`}>{relPost.title}</a>
                      </h4>
                      <div className="date">{formatDate(relPost.publishDate)}</div>
                    </div>
                  </RelatedPostCard>
                ))}
              </RelatedPostsGrid>
            </RelatedPosts>
          )}
        </>
      )}
    </PageContainer>
  );
};

export default BlogDetailPage;