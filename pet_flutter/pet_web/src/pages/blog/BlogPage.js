import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import * as blogService from '../../services/blogService';

const BlogContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const BlogHeader = styled.div`
  text-align: center;
  margin-bottom: 50px;
`;

const PageTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 15px;
  color: #333;
`;

const PageDescription = styled.p`
  font-size: 1.2rem;
  color: #666;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
`;

const CategoryTabs = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  flex-wrap: wrap;
`;

const CategoryTab = styled.button`
  padding: 8px 16px;
  margin: 0 8px 10px;
  background: ${props => props.active ? '#0073e6' : 'transparent'};
  color: ${props => props.active ? 'white' : '#666'};
  border: ${props => props.active ? 'none' : '1px solid #ddd'};
  border-radius: 20px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#0073e6' : '#f5f5f5'};
  }
`;

const FeaturedSection = styled.div`
  margin-bottom: 60px;
`;

const FeaturedGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-gap: 30px;
  
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const MainFeatured = styled.div`
  position: relative;
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  
  &:hover {
    .image {
      transform: scale(1.05);
    }
  }
  
  @media (max-width: 768px) {
    height: 400px;
  }
`;

const FeaturedImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.src || ''});
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;
`;

const FeaturedOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 40px 30px;
  background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0));
  color: white;
  
  @media (max-width: 768px) {
    padding: 30px 20px;
  }
`;

const FeaturedCategory = styled.div`
  font-size: 0.9rem;
  text-transform: uppercase;
  font-weight: 600;
  color: #ffdd59;
  margin-bottom: 10px;
`;

const FeaturedTitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 15px;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const FeaturedMeta = styled.div`
  display: flex;
  align-items: center;
`;

const FeaturedAuthorImage = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: #e0e0e0;
  background-image: ${props => props.src ? `url(${props.src})` : 'none'};
  background-size: cover;
  margin-right: 10px;
`;

const FeaturedInfo = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
`;

const SideFeatured = styled.div`
  display: flex;
  flex-direction: column;
  gap: 30px;
`;

const SideFeaturedItem = styled.div`
  display: flex;
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  height: calc(50% - 15px);
  transition: transform 0.3s;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  @media (max-width: 900px) {
    height: 180px;
  }
`;

const SideFeaturedImage = styled.div`
  flex: 0 0 40%;
  background-image: url(${props => props.src || ''});
  background-size: cover;
  background-position: center;
`;

const SideFeaturedContent = styled.div`
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
`;

const SideFeaturedCategory = styled.div`
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 600;
  color: #0073e6;
  margin-bottom: 8px;
`;

const SideFeaturedTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 10px;
  line-height: 1.4;
`;

const SideFeaturedMeta = styled.div`
  font-size: 0.8rem;
  color: #777;
  margin-top: auto;
`;

const BlogGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-gap: 30px;
  
  @media (max-width: 1000px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const BlogCard = styled.div`
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  height: 100%;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 25px rgba(0, 0, 0, 0.1);
    
    .card-image {
      transform: scale(1.05);
    }
  }
`;

const CardImageContainer = styled.div`
  height: 200px;
  overflow: hidden;
`;

const CardImage = styled.div`
  height: 100%;
  background-image: url(${props => props.src || ''});
  background-size: cover;
  background-position: center;
  transition: transform 0.5s ease;
`;

const CardContent = styled.div`
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const CardCategory = styled.div`
  font-size: 0.8rem;
  text-transform: uppercase;
  font-weight: 600;
  color: #0073e6;
  margin-bottom: 10px;
`;

const CardTitle = styled.h3`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 10px;
  line-height: 1.4;
`;

const CardExcerpt = styled.p`
  font-size: 0.95rem;
  color: #777;
  line-height: 1.6;
  margin-bottom: 15px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex-grow: 1;
`;

const CardMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #eee;
  margin-top: auto;
`;

const CardAuthor = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  color: #666;
`;

const CardAuthorImage = styled.div`
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background-color: #e0e0e0;
  background-image: ${props => props.src ? `url(${props.src})` : 'none'};
  background-size: cover;
  margin-right: 8px;
`;

const CardDate = styled.div`
  font-size: 0.85rem;
  color: #999;
`;

const LoadMoreButton = styled.button`
  display: block;
  margin: 50px auto 0;
  padding: 12px 30px;
  background-color: #0073e6;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background-color: #005bb5;
    transform: translateY(-2px);
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
    transform: none;
  }
`;

// Tạo excerpt từ nội dung HTML
const createExcerpt = (html, maxLength = 150) => {
  // Loại bỏ tất cả các thẻ HTML
  const text = html.replace(/<[^>]*>?/gm, '');
  
  // Cắt chuỗi
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('all');
  const [visiblePosts, setVisiblePosts] = useState(6);
  const [categories, setCategories] = useState([]);
  
  // Fetch all posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const allPosts = await blogService.getAllPosts();
        
        if (Array.isArray(allPosts)) {
          setPosts(allPosts);
          
          // Extract unique categories
          const uniqueCategories = [...new Set(allPosts.map(post => post.category))];
          setCategories(uniqueCategories);
        }
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Không thể tải bài viết. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPosts();
  }, []);
  
  // Filter posts by category
  const filteredPosts = currentCategory === 'all' 
    ? posts 
    : posts.filter(post => post.category === currentCategory);
  
  // Get featured posts
  const featuredPosts = [...filteredPosts].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 3);
  const mainFeatured = featuredPosts[0];
  const sideFeatured = featuredPosts.slice(1, 3);
  
  // Get regular posts (excluding featured ones)
  const regularPosts = filteredPosts
    .filter(post => !featuredPosts.find(fp => fp.postId === post.postId))
    .slice(0, visiblePosts);
  
  const handleLoadMore = () => {
    setVisiblePosts(prev => prev + 6);
  };
  
  const hasMorePosts = regularPosts.length < filteredPosts.length - featuredPosts.length;
  
  return (
    <BlogContainer>
      <BlogHeader>
        <PageTitle>Blog Thú Cưng</PageTitle>
        <PageDescription>
          Khám phá các bài viết hay về chăm sóc thú cưng, dinh dưỡng, huấn luyện và nhiều thông tin hữu ích khác.
        </PageDescription>
      </BlogHeader>
      
      <CategoryTabs>
        <CategoryTab 
          active={currentCategory === 'all'} 
          onClick={() => setCurrentCategory('all')}
        >
          Tất cả
        </CategoryTab>
        {categories.map(category => (
          <CategoryTab 
            key={category}
            active={currentCategory === category}
            onClick={() => setCurrentCategory(category)}
          >
            {category}
          </CategoryTab>
        ))}
      </CategoryTabs>
      
      {loading ? (
        <div>Đang tải bài viết...</div>
      ) : error ? (
        <div>{error}</div>
      ) : (
        <>
          {mainFeatured && (
            <FeaturedSection>
              <FeaturedGrid>
                <Link to={`/blog/${mainFeatured.postId}`}>
                  <MainFeatured>
                    <FeaturedImage className="image" src={mainFeatured.featuredImage} />
                    <FeaturedOverlay>
                      <FeaturedCategory>{mainFeatured.category}</FeaturedCategory>
                      <FeaturedTitle>{mainFeatured.title}</FeaturedTitle>
                      <FeaturedMeta>
                        <FeaturedAuthorImage src={mainFeatured.userAvatar} />
                        <FeaturedInfo>
                          {mainFeatured.authorName} · {format(new Date(mainFeatured.publishDate), 'd MMMM, yyyy', { locale: vi })}
                        </FeaturedInfo>
                      </FeaturedMeta>
                    </FeaturedOverlay>
                  </MainFeatured>
                </Link>
                
                <SideFeatured>
                  {sideFeatured.map(post => (
                    <Link to={`/blog/${post.postId}`} key={post.postId}>
                      <SideFeaturedItem>
                        <SideFeaturedImage src={post.featuredImage} />
                        <SideFeaturedContent>
                          <SideFeaturedCategory>{post.category}</SideFeaturedCategory>
                          <SideFeaturedTitle>{post.title}</SideFeaturedTitle>
                          <SideFeaturedMeta>
                            {format(new Date(post.publishDate), 'd MMMM, yyyy', { locale: vi })}
                          </SideFeaturedMeta>
                        </SideFeaturedContent>
                      </SideFeaturedItem>
                    </Link>
                  ))}
                </SideFeatured>
              </FeaturedGrid>
            </FeaturedSection>
          )}
          
          <BlogGrid>
            {regularPosts.map(post => (
              <Link to={`/blog/${post.postId}`} key={post.postId}>
                <BlogCard>
                  <CardImageContainer>
                    <CardImage className="card-image" src={post.featuredImage} />
                  </CardImageContainer>
                  <CardContent>
                    <CardCategory>{post.category}</CardCategory>
                    <CardTitle>{post.title}</CardTitle>
                    <CardExcerpt>{createExcerpt(post.content)}</CardExcerpt>
                    <CardMeta>
                      <CardAuthor>
                        <CardAuthorImage src={post.userAvatar} />
                        {post.authorName}
                      </CardAuthor>
                      <CardDate>
                        {format(new Date(post.publishDate), 'd MMM, yyyy', { locale: vi })}
                      </CardDate>
                    </CardMeta>
                  </CardContent>
                </BlogCard>
              </Link>
            ))}
          </BlogGrid>
          
          {hasMorePosts && (
            <LoadMoreButton onClick={handleLoadMore}>
              Xem thêm bài viết
            </LoadMoreButton>
          )}
        </>
      )}
    </BlogContainer>
  );
};

export default BlogPage;