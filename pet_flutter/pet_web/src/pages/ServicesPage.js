import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './ServicesPage.css';

import {
  Container,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  TextField,
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Alert,
  Divider,
  InputAdornment,
  Paper,
  useTheme,
  useMediaQuery,
  alpha,
  Zoom,
  Fade,
  Slide,
  styled
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import InfoIcon from '@mui/icons-material/Info';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ScissorsIcon from '@mui/icons-material/ContentCut';
import FavoriteIcon from '@mui/icons-material/Favorite';
import SchoolIcon from '@mui/icons-material/School';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import AppsIcon from '@mui/icons-material/Apps';
import ClearIcon from '@mui/icons-material/Clear';
import PetsIcon from '@mui/icons-material/Pets';
import serviceService from '../services/serviceService';

// Styled components to enhance UI
const HeroSection = styled(Paper)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 3,
  padding: theme.spacing(5),
  marginBottom: theme.spacing(8), // Tăng margin bottom
  position: 'relative',
  overflow: 'hidden',
  backgroundImage: `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.07)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
  boxShadow: '0 15px 50px rgba(0, 0, 0, 0.1)', // Tăng shadow
  [theme.breakpoints.down('md')]: {
    padding: theme.spacing(3),
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.08)} 0%, transparent 70%)`,
    borderRadius: '50%',
    zIndex: 0,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -80,
    left: -80,
    width: 250,
    height: 250,
    background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, 0.08)} 0%, transparent 70%)`,
    borderRadius: '50%',
    zIndex: 0,
  }
}));

const SectionTitle = styled(Typography)(({ theme, color }) => ({
  position: 'relative',
  fontWeight: 800,
  borderLeft: `5px solid ${color || theme.palette.primary.main}`,
  paddingLeft: theme.spacing(2),
  marginBottom: theme.spacing(4),
  '&::after': {
    content: '""',
    position: 'absolute',
    bottom: -8,
    left: 24,
    width: 80,
    height: 3,
    borderRadius: 2,
    backgroundColor: color || theme.palette.primary.main,
  }
}));

const AnimatedCard = styled(Card)(({ theme, color }) => ({
  height: '100%',
  width: '100%',
  borderRadius: theme.shape.borderRadius * 3,
  overflow: 'hidden',
  transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
  transform: 'translateY(0)',
  position: 'relative',
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
  border: `1px solid ${alpha(color || theme.palette.primary.main, 0.08)}`,
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-15px) scale(1.03) rotateY(2deg)',
    boxShadow: `0 20px 40px ${alpha(color || theme.palette.primary.main, 0.15)}`,
  },
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5, // Tăng từ 4px lên 5px
    background: `linear-gradient(to right, ${color || theme.palette.primary.main}, transparent)`,
    transition: 'height 0.3s ease',
  },
  '&:hover::before': {
    height: 8, // Thêm hiệu ứng hover
  }
}));

const CategoryIcon = styled(Box)(({ theme, color }) => ({
  backgroundColor: alpha(color, 0.12),
  padding: theme.spacing(1.5),
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(2),
  boxShadow: `0 6px 15px ${alpha(color, 0.15)}`,
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1) rotate(5deg)',
    boxShadow: `0 8px 20px ${alpha(color, 0.25)}`,
  }
}));

const StyledChip = styled(Chip)(({ theme, bgColor, textColor }) => ({
  borderRadius: 16,
  fontWeight: 500,
  backgroundColor: bgColor || alpha(theme.palette.primary.main, 0.1),
  color: textColor || theme.palette.primary.main,
  transition: 'all 0.3s ease',
  '& .MuiChip-icon': {
    color: 'inherit'
  },
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 3px 8px ${alpha(textColor || theme.palette.primary.main, 0.2)}`,
  }
}));

const ActionButton = styled(Button)(({ theme, color }) => ({
  borderRadius: 50,
  textTransform: 'none',
  padding: theme.spacing(1, 3),
  fontWeight: 600,
  boxShadow: 'none',
  transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  backgroundColor: color,
  position: 'relative',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: `0 10px 20px ${alpha(color || theme.palette.primary.main, 0.3)}`,
    backgroundColor: alpha(color || theme.palette.primary.main, 0.9),
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 5,
    height: 5,
    background: 'rgba(255, 255, 255, 0.5)',
    opacity: 0,
    borderRadius: '100%',
    transform: 'scale(1, 1) translate(-50%, -50%)',
    transformOrigin: '50% 50%',
  },
  '&:active': {
    transform: 'translateY(2px)',
  }
}));

const FloatingPawPrint = styled(Box)(({ theme, size, top, left, delay }) => ({
  position: 'absolute',
  top: `${top}%`,
  left: `${left}%`,
  fontSize: size,
  color: alpha(theme.palette.primary.main, 0.07),
  zIndex: 0,
  animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
  animationDelay: `${delay || 0}s`,
  transform: `rotate(${Math.random() * 180}deg)`,
  '@keyframes float': {
    '0%': {
      transform: `translateY(0) rotate(${Math.random() * 180}deg)`,
    },
    '50%': {
      transform: `translateY(-15px) rotate(${Math.random() * 180}deg)`,
    },
    '100%': {
      transform: `translateY(0) rotate(${Math.random() * 180}deg)`,
    },
  }
}));

// Helper function để hiển thị danh mục dịch vụ bằng tiếng Việt
const getCategoryLabel = (category) => {
  const categories = {
    'Grooming': 'Chăm sóc & Làm đẹp',
    'Healthcare': 'Y tế & Sức khỏe',
    'Training': 'Huấn luyện',
    'Boarding': 'Trông giữ qua đêm',
    'DayCare': 'Trông giữ ban ngày',
    'Other': 'Dịch vụ khác'
  };
  return categories[category] || category;
};

// Helper function để lấy màu cho chip danh mục
const getCategoryColor = (category) => {
  const colors = {
    'Grooming': '#2196F3', // blue
    'Healthcare': '#4CAF50', // green
    'Training': '#FF9800', // orange
    'Boarding': '#673AB7', // deep purple
    'DayCare': '#9C27B0', // purple
    'Other': '#607D8B' // blueGrey
  };
  return colors[category] || '#2196F3';
};

// Helper function để lấy icon cho danh mục
const getCategoryIcon = (category) => {
  const icons = {
    'Grooming': <ScissorsIcon />,
    'Healthcare': <FavoriteIcon />,
    'Training': <SchoolIcon />,
    'Boarding': <NightsStayIcon />,
    'DayCare': <WbSunnyIcon />,
    'Other': <AppsIcon />
  };
  return icons[category] || <AppsIcon />;
};

// Format số phút thành chuỗi thời gian dễ đọc
const formatDuration = (minutes) => {
  if (minutes >= 1440) {
    const days = Math.floor(minutes / 1440);
    const remainingMinutes = minutes % 1440;
    const hours = Math.floor(remainingMinutes / 60);
    
    if (hours > 0) {
      return `${days} ngày ${hours} giờ`;
    }
    return `${days} ngày`;
  } 
  
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes > 0) {
      return `${hours} giờ ${remainingMinutes} phút`;
    }
    return `${hours} giờ`;
  }
  
  return `${minutes} phút`;
};

// Format giá tiền
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Service Card Component với kích thước cố định và giao diện đẹp hơn
const ServiceCard = ({ service, category, categoryColor, handleOpenDetails, handleBooking }) => {
  const theme = useTheme();
  
  return (
    <AnimatedCard 
      color={categoryColor}
      className={`${category.toLowerCase()}-theme`}
      sx={{ 
        width: '280px',  // Tăng chiều rộng từ 250px lên 280px
        height: '450px', // Tăng chiều cao từ 400px lên 450px
        mx: 'auto',      // Canh giữa trong Grid item
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '80px',
          height: '80px',
          background: `radial-gradient(circle, ${alpha(categoryColor, 0.08)}, transparent 70%)`,
          zIndex: 0,
          borderRadius: '50%',
        }
      }}
    >
      <Box sx={{ position: 'relative', overflow: 'hidden' }}>
        {service.photo ? (
          <CardMedia
            component="img"
            height="200" // Tăng chiều cao ảnh từ 180px lên 200px
            image={service.photo}
            alt={service.name}
            sx={{ 
              objectFit: 'cover',
              transition: 'all 0.8s ease',
              '&:hover': {
                transform: 'scale(1.08)',
                filter: 'brightness(1.05) contrast(1.05)'
              }
            }}
          />
        ) : (
          <Box 
            sx={{ 
              height: 200, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: alpha(categoryColor, 0.08),
              overflow: 'hidden',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: `radial-gradient(circle at center, ${alpha(categoryColor, 0.15)}, transparent 70%)`
              }
            }}
          >
            <Typography
              component="i" 
              sx={{ 
                fontSize: 56, 
                color: alpha(categoryColor, 0.3),
                animation: 'pulse 3s infinite',
                '@keyframes pulse': {
                  '0%': {
                    transform: 'scale(1)',
                  },
                  '50%': {
                    transform: 'scale(1.1)',
                  },
                  '100%': {
                    transform: 'scale(1)',
                  },
                }
              }}
            >
              🐾
            </Typography>
          </Box>
        )}
        <StyledChip
          icon={getCategoryIcon(category)}
          label={getCategoryLabel(category)}
          size="small"
          bgColor={categoryColor}
          textColor="#fff"
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            fontWeight: 500,
            px: 1,
            boxShadow: '0 3px 8px rgba(0,0,0,0.15)',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: `0 6px 12px ${alpha(categoryColor, 0.25)}`
            },
            transition: 'all 0.3s ease'
          }}
        />
      </Box>
      
      <CardContent sx={{ 
        p: 3,  // Tăng padding từ 2.5 lên 3
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column',
        height: '190px', // Tăng chiều cao cho phần nội dung từ 165px lên 190px
        overflow: 'hidden',
        position: 'relative'
      }}>
        <Typography 
          variant="h6" 
          component="h3" 
          fontWeight="bold" 
          gutterBottom
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: '54px', // Tăng chiều cao từ 48px lên 54px
            color: alpha(theme.palette.text.primary, 0.87),
            fontSize: '1.1rem', // Tăng font size từ 1rem lên 1.1rem
            mb: 1.5,
          }}
        >
          {service.name}
        </Typography>
        
        <Typography 
          variant="body2" 
          color="text.secondary"
          paragraph
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            height: '72px', // Tăng chiều cao từ 63px lên 72px
            mb: 1.5, // Tăng margin bottom 
            lineHeight: 1.6,
            fontSize: '0.9rem', // Tăng font size từ 0.85rem lên 0.9rem
          }}
        >
          {service.description}
        </Typography>
        
        <Box sx={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: 1, 
          mb: 1,
          mt: 'auto'  // Push to bottom
        }}>
          <StyledChip
            icon={<AccessTimeIcon fontSize="small" />}
            label={formatDuration(service.duration)}
            variant="outlined"
            size="small"
            bgColor={alpha(theme.palette.text.secondary, 0.08)}
            textColor={theme.palette.text.secondary}
            sx={{ 
              height: '28px', // Tăng chiều cao từ 24px lên 28px
              '& .MuiChip-label': { fontSize: '0.8rem' }, // Tăng font size
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: alpha(theme.palette.text.secondary, 0.12),
              }
            }}
            className="duration-chip"
          />
          <StyledChip
            icon={<AttachMoneyIcon fontSize="small" />}
            label={formatPrice(service.price)}
            size="small"
            bgColor={alpha(categoryColor, 0.1)}
            textColor={categoryColor}
            sx={{ 
              fontWeight: 'bold', 
              height: '28px', // Tăng chiều cao
              '& .MuiChip-label': { 
                fontSize: '0.8rem' 
              },
              transition: 'all 0.3s ease',
              '&:hover': {
                backgroundColor: alpha(categoryColor, 0.2),
                transform: 'translateY(-2px)'
              }
            }}
            className="price-chip"
          />
        </Box>
      </CardContent>
      
      <CardActions sx={{ 
        p: 3, // Tăng padding từ 2 lên 3
        pt: 0, 
        pb: 3, // Tăng padding bottom
        justifyContent: 'space-between',
        height: '60px' // Tăng chiều cao cho phần action từ 55px lên 60px
      }}>
        <Button
          variant="outlined"
          startIcon={<InfoIcon fontSize="small" />}
          onClick={() => handleOpenDetails(service)}
          sx={{ 
            borderRadius: 50,
            textTransform: 'none',
            px: 2, // Tăng padding ngang để button rộng hơn
            py: 0.75, // Tăng padding dọc
            fontSize: '0.85rem', // Tăng font size
            borderColor: alpha(categoryColor, 0.5),
            color: categoryColor,
            '&:hover': {
              borderColor: categoryColor,
              backgroundColor: alpha(categoryColor, 0.05),
              transform: 'translateY(-3px)',
              boxShadow: `0 4px 10px ${alpha(categoryColor, 0.15)}`
            },
            transition: 'all 0.3s ease'
          }}
        >
          Chi tiết
        </Button>
        <ActionButton
          variant="contained"
          startIcon={<CalendarMonthIcon fontSize="small" />}
          color={categoryColor}
          sx={{ 
            px: 2, // Tăng padding ngang
            py: 0.75, // Tăng padding dọc
            fontSize: '0.85rem' // Tăng font size
          }}
          onClick={() => handleBooking(service.serviceId)}
        >
          Đặt lịch
        </ActionButton>
      </CardActions>
    </AnimatedCard>
  );
};

const ServicesPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedService, setSelectedService] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await serviceService.getActiveServices();
        setServices(data);
        setFilteredServices(data);
      } catch (err) {
        console.error('Error fetching services:', err);
        setError(typeof err === 'string' ? err : 'Không thể tải danh sách dịch vụ. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);


  useEffect(() => {
    const createPawPrints = () => {
      const container = document.querySelector('.services-container');
      if (container) {
        for (let i = 0; i < 15; i++) {
          const paw = document.createElement('div');
          paw.className = 'extra-paw';
          paw.style.left = `${Math.random() * 100}%`;
          paw.style.top = `${Math.random() * 100}%`;
          paw.style.opacity = 0.02 + Math.random() * 0.03;
          paw.style.transform = `rotate(${Math.random() * 360}deg)`;
          paw.style.animationDelay = `${Math.random() * 10}s`;
          container.appendChild(paw);
        }
      }
    };
    
    createPawPrints();
    
    return () => {
      const container = document.querySelector('.services-container');
      const paws = container?.querySelectorAll('.extra-paw');
      paws?.forEach(paw => paw.remove());
    };
  }, []);

  useEffect(() => {
    // Lọc dịch vụ dựa trên từ khóa tìm kiếm và danh mục
    const filtered = services.filter(service => {
      const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter ? service.category === categoryFilter : true;
      return matchesSearch && matchesCategory;
    });
    setFilteredServices(filtered);
  }, [searchTerm, categoryFilter, services]);

  // Handle tìm kiếm
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Handle xóa tìm kiếm
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Handle lọc theo danh mục
  const handleCategoryChange = (event) => {
    setCategoryFilter(event.target.value);
  };

  // Handle mở dialog chi tiết
  const handleOpenDetails = (service) => {
    setSelectedService(service);
    setOpen(true);
  };

  // Handle đóng dialog
  const handleClose = () => {
    setOpen(false);
  };

  // Handle đặt lịch
  const handleBooking = (serviceId) => {
    navigate(`/appointments/add?serviceId=${serviceId}`);
  };

  // Lấy danh sách các danh mục duy nhất từ dịch vụ
  const uniqueCategories = [...new Set(services.map(service => service.category))];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }} className="services-container">
      {/* Decorative elements */}
      <FloatingPawPrint component="span" role="img" aria-label="paw print" size="60px" top={5} left={85} delay={0.2}>
        🐾
      </FloatingPawPrint>
      <FloatingPawPrint component="span" role="img" aria-label="paw print" size="45px" top={20} left={5} delay={1.5}>
        🐾
      </FloatingPawPrint>
      <FloatingPawPrint component="span" role="img" aria-label="paw print" size="50px" top={70} left={90} delay={0.8}>
        🐾
      </FloatingPawPrint>
      <FloatingPawPrint component="span" role="img" aria-label="paw print" size="55px" top={40} left={95} delay={1.2}>
        🐾
      </FloatingPawPrint>
      <FloatingPawPrint component="span" role="img" aria-label="paw print" size="48px" top={85} left={15} delay={0.5}>
        🐾
      </FloatingPawPrint>

      {/* Banner & Search Section */}
      <Fade in={true} timeout={800}>
        <HeroSection elevation={4} className="hero-section">
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={7}>
                <SectionTitle 
                  variant="h2" 
                  component="h1"
                  className="section-title"
                >
                  Dịch vụ chăm sóc thú cưng
                </SectionTitle>
                
                <Typography 
                  variant="h6" 
                  color="text.secondary" 
                  className="hero-text"
                  sx={{ 
                    mb: 4,
                    maxWidth: '800px',
                    fontWeight: 'normal',
                    lineHeight: 1.7,
                    mt: 3
                  }}
                >
                  Chúng tôi cung cấp đa dạng các dịch vụ chăm sóc toàn diện cho thú cưng của bạn.
                  Từ cắt tỉa lông, khám sức khỏe đến huấn luyện chuyên nghiệp với đội ngũ bác sĩ 
                  và nhân viên giàu kinh nghiệm.
                </Typography>
                
                {/* Tìm kiếm và lọc */}
                <Grid container spacing={3} sx={{ mt: 3 }} className="search-section">
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      placeholder="Tìm kiếm dịch vụ..."
                      value={searchTerm}
                      onChange={handleSearchChange}
                      variant="outlined"
                      className="search-box"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: searchTerm && (
                          <InputAdornment position="end">
                            <IconButton 
                              edge="end" 
                              onClick={handleClearSearch}
                              size="small"
                            >
                              <ClearIcon fontSize="small" />
                            </IconButton>
                          </InputAdornment>
                        ),
                        sx: {
                          borderRadius: 50,
                          pr: 1,
                          height: '56px',
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                          },
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth variant="outlined">
                      <InputLabel 
                        id="category-filter-label" 
                        sx={{ 
                          backgroundColor: 'transparent',
                          paddingRight: 1,
                          paddingLeft: 1
                        }}>
                        Lọc theo danh mục
                      </InputLabel>
                      <Select
                        labelId="category-filter-label"
                        id="category-filter"
                        value={categoryFilter}
                        onChange={handleCategoryChange}
                        label="Lọc theo danh mục"
                        displayEmpty
                        className="filter-select"
                        sx={{
                          borderRadius: 50,
                          height: '56px',
                          pl: 1,
                          '& .MuiSelect-select': {
                            display: 'flex',
                            alignItems: 'center',
                            pl: 1
                          },
                          '.MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(theme.palette.primary.main, 0.2),
                          },
                          '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: alpha(theme.palette.primary.main, 0.3),
                          },
                          '& .MuiSvgIcon-root': { // Chỉnh icon mũi tên dropdown
                            right: 12,
                            color: theme.palette.primary.main,
                            fontSize: '1.5rem'
                          }
                        }}
                        MenuProps={{
                          PaperProps: {
                            elevation: 4,
                            sx: {
                              mt: 1,
                              borderRadius: 2,
                              maxHeight: 400,
                              '& .MuiMenuItem-root': {
                                py: 1.2,
                                '&:hover': {
                                  backgroundColor: alpha(theme.palette.primary.main, 0.08)
                                }
                              }
                            }
                          },
                          // Đảm bảo menu ở đúng vị trí
                          anchorOrigin: {
                            vertical: 'bottom',
                            horizontal: 'left',
                          },
                          transformOrigin: {
                            vertical: 'top',
                            horizontal: 'left',
                          },
                          // Đảm bảo menu luôn hiển thị trên cùng
                          slotProps: {
                            paper: {
                              style: {
                                zIndex: 1300
                              }
                            }
                          }
                        }}
                      >
                        <MenuItem value="">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <AppsIcon sx={{ mr: 1.5, color: theme.palette.text.secondary }} />
                            <Typography>Tất cả danh mục</Typography>
                          </Box>
                        </MenuItem>
                        {uniqueCategories.map((category) => (
                          <MenuItem key={category} value={category}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ color: getCategoryColor(category), mr: 1.5 }}>
                                {getCategoryIcon(category)}
                              </Box>
                              <Typography>{getCategoryLabel(category)}</Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
              
              <Grid item xs={12} md={5}>
                <Box
                  component="img"
                  src="https://img.freepik.com/free-vector/pet-care-concept-illustration_114360-1294.jpg"
                  alt="Dịch vụ thú cưng"
                  sx={{ 
                    maxWidth: '100%',
                    height: 'auto',
                    maxHeight: 300,
                    width: '900px',
                    objectFit: 'contain',
                    filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.12))',
                    animation: 'float 6s ease-in-out infinite',
                    '@keyframes float': {
                      '0%, 100%': {
                        transform: 'translateY(0)'
                      },
                      '50%': {
                        transform: 'translateY(-15px)'
                      }
                    }
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </HeroSection>
      </Fade>

      {/* Hiển thị lỗi nếu có */}
      {error && (
        <Alert 
          severity="error" 
          variant="filled" 
          sx={{ 
            mb: 5, 
            borderRadius: 3,
            boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
            animation: 'pulse 2s infinite'
          }}
        >
          {error}
        </Alert>
      )}

      {/* Loading indicator */}
      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', my: 12 }}>
          <CircularProgress size={70} thickness={4} color="primary" sx={{ mb: 4 }} className="loading-indicator" />
          <Typography variant="h6" color="primary" fontWeight={600}>
            Đang tải danh sách dịch vụ...
          </Typography>
        </Box>
      ) : filteredServices.length === 0 ? (
        <Alert 
          severity="info" 
          variant="outlined" 
          sx={{ mb: 5, py: 3, px: 4, borderRadius: 3, textAlign: 'center', boxShadow: 2 }}
          className="empty-state"
        >
          <Typography variant="h6" fontWeight="medium" gutterBottom>
            Không tìm thấy dịch vụ nào phù hợp
          </Typography>
          <Typography variant="body1">
            Vui lòng thử lại với từ khóa khác hoặc xóa bộ lọc hiện tại.
          </Typography>
          <Button 
            variant="outlined" 
            color="info" 
            sx={{ mt: 2, borderRadius: 50, px: 3 }}
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('');
            }}
          >
            Xóa tất cả bộ lọc
          </Button>
        </Alert>
      ) : (
        <>
          {/* Hiển thị danh sách dịch vụ theo danh mục */}
          {uniqueCategories.filter(category => 
            !categoryFilter || category === categoryFilter
          ).map((category, categoryIndex) => {
            const categoryServices = filteredServices.filter(service => service.category === category);
            if (categoryServices.length === 0) return null;
            const categoryColor = getCategoryColor(category);
            
            return (
              <Fade 
                in={true} 
                timeout={800} 
                style={{ transitionDelay: `${categoryIndex * 200}ms` }}
                key={category}
              >
                <Box sx={{ mb: 10 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                    <CategoryIcon color={categoryColor} className="category-icon">
                      {React.cloneElement(getCategoryIcon(category), { 
                        style: { color: categoryColor, fontSize: 32 } 
                      })}
                    </CategoryIcon>
                    <SectionTitle 
                      variant="h4" 
                      component="h2" 
                      color={categoryColor}
                      className="category-header"
                    >
                      {getCategoryLabel(category)}
                    </SectionTitle>
                  </Box>
                  
                  {/* Grid layout đã được điều chỉnh cho kích thước card mới */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    justifyContent: 'center', 
                    gap: 5, // Tăng khoảng cách giữa các card
                    mb: 2
                  }}>
                    {categoryServices.map((service, index) => (
                      <Zoom
                        key={service.serviceId}
                        in={true}
                        style={{
                          transitionDelay: `${(categoryIndex * 100) + (index * 100)}ms`
                        }}
                      >
                        <Box 
                          sx={{ width: '280px', height: '450px' }}
                          className="service-card-container"
                        >
                          <ServiceCard
                            service={service}
                            category={category}
                            categoryColor={categoryColor}
                            handleOpenDetails={handleOpenDetails}
                            handleBooking={handleBooking}
                          />
                        </Box>
                      </Zoom>
                    ))}
                  </Box>
                </Box>
              </Fade>
            );
          })}
        </>
      )}

      {/* Dialog chi tiết dịch vụ */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        TransitionComponent={Slide}
        TransitionProps={{ direction: 'up' }}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, md: 4 },
            overflow: 'hidden',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.2)', // Tăng shadow
          },
          className: 'service-dialog'
        }}
      >
        {selectedService && (
          <>
            <DialogTitle
              sx={{ 
                backgroundColor: getCategoryColor(selectedService.category),
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                py: 2.5,
                pl: 3,
                pr: 2
              }}
              className="dialog-header"
            >
              <Box fontWeight="bold" fontSize="1.2rem">{selectedService.name}</Box>
              <IconButton
                edge="end"
                color="inherit"
                onClick={handleClose}
                aria-label="close"
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.1)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.2)',
                  }
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            
            <DialogContent sx={{ p: 0 }}>
              <Grid container>
                <Grid item xs={12} md={6}>
                  {selectedService.photo ? (
                    <Box sx={{ height: { xs: 250, md: 400 }, width: '100%', position: 'relative' }} className="dialog-image">
                      <img
                        src={selectedService.photo}
                        alt={selectedService.name}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover'
                        }}
                      />
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: '35%',
                          background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
                          display: 'flex',
                          alignItems: 'flex-end',
                          padding: 3
                        }}
                        className="dialog-gradient"
                      >
                        <StyledChip
                          icon={getCategoryIcon(selectedService.category)}
                          label={getCategoryLabel(selectedService.category)}
                          size="medium"
                          bgColor={getCategoryColor(selectedService.category)}
                          textColor="#fff"
                          sx={{ fontWeight: 600, px: 1.5 }}
                        />
                      </Box>
                    </Box>
                  ) : (
                    <Box 
                      sx={{ 
                        height: { xs: 250, md: 400 },
                        width: '100%',
                        backgroundColor: alpha(getCategoryColor(selectedService.category), 0.08),
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::after': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          background: `radial-gradient(circle at center, ${alpha(getCategoryColor(selectedService.category), 0.15)}, transparent 70%)`
                        }
                      }}
                      className="dialog-image"
                    >
                      <Typography
                        component="i" 
                        sx={{ 
                          fontSize: 80, 
                          color: alpha(getCategoryColor(selectedService.category), 0.3),
                          animation: 'pulse 3s infinite',
                          mb: 2
                        }}
                      >
                        🐾
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Không có hình ảnh
                      </Typography>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 4 }}>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      sx={{ 
                        color: getCategoryColor(selectedService.category),
                        pb: 2,
                        mb: 3,
                        borderBottom: `2px solid ${alpha(getCategoryColor(selectedService.category), 0.2)}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <InfoIcon fontSize="small" />
                      Thông tin dịch vụ
                    </Typography>

                    <Box sx={{ mb: 4 }}>
                      <Typography fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>Danh mục</Typography>
                      <StyledChip
                        icon={getCategoryIcon(selectedService.category)}
                        label={getCategoryLabel(selectedService.category)}
                        bgColor={getCategoryColor(selectedService.category)}
                        textColor="#fff"
                        sx={{
                          fontWeight: 500,
                          px: 1
                        }}
                        className="styled-chip"
                      />
                    </Box>

                    <Box sx={{ mb: 4 }}>
                      <Typography fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>Thời gian thực hiện</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            backgroundColor: alpha(getCategoryColor(selectedService.category), 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 1.5
                          }}
                        >
                          <AccessTimeIcon sx={{ color: getCategoryColor(selectedService.category) }} />
                        </Box>
                        <Typography fontWeight={500} fontSize="1.1rem">
                          {formatDuration(selectedService.duration)}
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ mb: 3 }}>
                      <Typography fontWeight={600} sx={{ mb: 1, color: 'text.secondary' }}>Giá dịch vụ</Typography>
                      <StyledChip
                        icon={<AttachMoneyIcon />}
                        label={formatPrice(selectedService.price)}
                        bgColor={alpha(getCategoryColor(selectedService.category), 0.1)}
                        textColor={getCategoryColor(selectedService.category)}
                        sx={{
                          fontWeight: 'bold',
                          px: 1,
                          fontSize: '1.1rem'
                        }}
                        className="price-chip"
                      />
                    </Box>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ p: 4, borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold" 
                      sx={{ 
                        mb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          backgroundColor: alpha(getCategoryColor(selectedService.category), 0.1),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <PetsIcon sx={{ color: getCategoryColor(selectedService.category), fontSize: 18 }} />
                      </Box>
                      Mô tả dịch vụ
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}
                    >
                      {selectedService.description}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions 
              sx={{ 
                p: 3, 
                borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                bgcolor: alpha(theme.palette.background.default, 0.5)
              }}
            >
              <Button 
                variant="outlined"
                onClick={handleClose}
                sx={{ 
                  borderRadius: 50,
                  px: 3,
                  py: 1,
                  textTransform: 'none',
                  borderColor: alpha(theme.palette.text.secondary, 0.5),
                  color: theme.palette.text.secondary,
                  '&:hover': {
                    borderColor: theme.palette.text.secondary,
                    backgroundColor: alpha(theme.palette.text.secondary, 0.05),
                    transform: 'translateY(-3px)',
                    boxShadow: '0 5px 10px rgba(0, 0, 0, 0.08)'
                  },
                  transition: 'all 0.3s ease'
                }}
              >
                Đóng
              </Button>
              <ActionButton 
                variant="contained"
                startIcon={<CalendarMonthIcon />}
                color={getCategoryColor(selectedService.category)}
                sx={{ px: 3, py: 1 }}
                onClick={() => handleBooking(selectedService.serviceId)}
              >
                Đặt lịch ngay
              </ActionButton>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default ServicesPage;