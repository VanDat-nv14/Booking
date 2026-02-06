import React from 'react';
import { 
  Box, Typography, Paper, Grid, Button, Divider, Chip, Card, CardMedia, 
  Avatar, useTheme, alpha, IconButton, Tooltip, Fade, Grow, Container
} from '@mui/material';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import PetsIcon from '@mui/icons-material/Pets';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import ScaleIcon from '@mui/icons-material/Scale';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import DescriptionIcon from '@mui/icons-material/Description';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import CakeIcon from '@mui/icons-material/Cake';
import axiosClient from '../../utils/axiosClient';

const PetDetail = ({ pet, onDelete }) => {
  const theme = useTheme();
  const defaultImage = 'https://via.placeholder.com/300?text=No+Image';
  
  // Helper function to get pet value regardless of field naming convention
  const getPetValue = (frontendField, backendField) => {
    // Check frontend field name first (e.g., "name")
    if (pet[frontendField] !== undefined) {
      return pet[frontendField];
    }
    // Then check backend field name (e.g., "Name")
    if (pet[backendField] !== undefined) {
      return pet[backendField];
    }
    return null;
  };
  
  const getImageUrl = (photoPath) => {
    if (!photoPath) return defaultImage;
    
    // Nếu đã là URL đầy đủ thì sử dụng luôn
    if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) {
      return photoPath;
    }
    
    // Nếu có photoUrl thì sử dụng (từ quá trình xử lý trước)
    if (pet.photoUrl) {
      return pet.photoUrl;
    }
    
    // Xử lý cho các trường hợp khác
    try {
      // Nếu đường dẫn có dạng /uploads/pets/
      if (photoPath.includes('/uploads/pets/')) {
        return `https://localhost:7164${photoPath}`;
      }
      
      // Nếu chỉ là tên file
      const fileName = photoPath.split('/').pop();
      if (fileName === photoPath) {
        return `https://localhost:7164/uploads/pets/${fileName}`;
      }
      
      // Trường hợp khác, sử dụng baseURL của axiosClient
      const baseURL = axiosClient.defaults.baseURL;
      const serverBaseURL = baseURL.substring(0, baseURL.lastIndexOf('/api'));
      return `${serverBaseURL}${photoPath.startsWith('/') ? photoPath : `/${photoPath}`}`;
    } catch (error) {
      console.error('Error getting image URL:', error);
      return defaultImage;
    }
  };
  
  const handleDelete = () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa ${getPetValue('name', 'Name')}?`)) {
      onDelete(pet.petId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không có thông tin';
    try {
      return format(new Date(dateString), 'dd MMMM yyyy', { locale: vi });
    } catch (e) {
      return 'Ngày không hợp lệ';
    }
  };
  
  const getSpeciesIcon = (species) => {
    if (species?.toLowerCase().includes('chó')) return '🐕';
    if (species?.toLowerCase().includes('mèo')) return '🐈';
    if (species?.toLowerCase().includes('chim')) return '🦜';
    if (species?.toLowerCase().includes('cá')) return '🐠';
    if (species?.toLowerCase().includes('thỏ')) return '🐇';
    return '🐾';
  };
  
  const getGenderColor = (gender) => {
    return gender === 'Đực' 
      ? {
          light: alpha(theme.palette.info.main, 0.1),
          main: theme.palette.info.main,
          icon: <MaleIcon fontSize="small" />
        }
      : {
          light: alpha(theme.palette.secondary.main, 0.1),
          main: theme.palette.secondary.main,
          icon: <FemaleIcon fontSize="small" />
        };
  };
  
  const petName = getPetValue('name', 'Name');
  const petGender = getPetValue('gender', 'Gender');
  const petSpecies = getPetValue('species', 'Species');
  const petBreed = getPetValue('breed', 'Breed');
  const petPhoto = getPetValue('photo', 'Photo');
  const petDateOfBirth = getPetValue('dateOfBirth', 'DateOfBirth');
  const petWeight = getPetValue('weight', 'Weight');
  const petColor = getPetValue('color', 'Color');
  const petDescription = getPetValue('description', 'Description');
  const petOwnerName = getPetValue('ownerName', 'OwnerName');
  const petAge = getPetValue('age', 'Age');
  
  const genderStyle = getGenderColor(petGender);

  return (
    <Fade in={true} timeout={500}>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Paper 
          elevation={3} 
          sx={{ 
            borderRadius: 4,
            overflow: 'hidden',
            backgroundImage: `linear-gradient(to bottom right, ${alpha(theme.palette.primary.main, 0.02)}, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 1)})`,
            backdropFilter: 'blur(20px)',
            boxShadow: `0 10px 40px ${alpha(theme.palette.common.black, 0.1)}`
          }}
        >
          {/* Header Section */}
          <Box 
            sx={{ 
              p: { xs: 2, md: 4 }, 
              background: `linear-gradient(120deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.background.paper, 0.6)} 100%)`,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' }, 
              alignItems: { xs: 'flex-start', sm: 'center' }, 
              justifyContent: 'space-between',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2, sm: 0 } }}>
              <Tooltip title="Quay lại danh sách" arrow>
                <IconButton 
                  component={Link} 
                  to="/pets" 
                  sx={{ 
                    mr: 2, 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    }
                  }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
              
              <Box>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'text.secondary',
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    fontWeight: 500
                  }}
                >
                  Thông tin chi tiết
                </Typography>
                <Typography 
                  variant="h5" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 700,
                    background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  {petName}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                variant="outlined" 
                color="primary" 
                component={Link} 
                to={`/pets/edit/${pet.petId}`}
                startIcon={<EditIcon />}
                sx={{ 
                  borderRadius: 2,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.15)}`,
                  '&:hover': {
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.25)}`,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s'
                }}
              >
                Chỉnh sửa
              </Button>
              <Button 
                variant="outlined" 
                color="error" 
                onClick={handleDelete}
                startIcon={<DeleteIcon />}
                sx={{ 
                  borderRadius: 2,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.error.main, 0.15)}`,
                  '&:hover': {
                    boxShadow: `0 4px 12px ${alpha(theme.palette.error.main, 0.25)}`,
                    transform: 'translateY(-2px)'
                  },
                  transition: 'all 0.3s'
                }}
              >
                Xóa
              </Button>
            </Box>
          </Box>
          
          {/* Main Content */}
          <Grid container sx={{ p: { xs: 2, md: 4 } }}>
            {/* Pet Image Section */}
            <Grid item xs={12} md={5} sx={{ pr: { md: 4 } }}>
              <Grow in={true} timeout={800}>
                <Box>
                  <Card 
                    elevation={6} 
                    sx={{ 
                      borderRadius: 4, 
                      overflow: 'hidden',
                      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      '&:hover': {
                        transform: 'scale(1.02)',
                        boxShadow: `0 16px 32px ${alpha(theme.palette.common.black, 0.15)}`
                      }
                    }}
                  >
                    {/* Gender Badge */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        left: 16,
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center',
                        backgroundColor: 'white',
                        borderRadius: 4,
                        px: 2,
                        py: 0.5,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                        color: genderStyle.main,
                      }}
                    >
                      {genderStyle.icon}
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          ml: 1, 
                          fontWeight: 600,
                          color: genderStyle.main
                        }}
                      >
                        {petGender}
                      </Typography>
                    </Box>
                    
                    <CardMedia
                      component="img"
                      image={getImageUrl(petPhoto)}
                      alt={petName}
                      sx={{ 
                        height: 380, 
                        objectFit: 'cover',
                        transition: 'transform 0.8s ease-in-out',
                        '&:hover': {
                          transform: 'scale(1.05)'
                        }
                      }}
                    />
                    
                    {/* Pet Type Overlay */}
                    <Box
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                        p: 3,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <Avatar 
                        sx={{ 
                          width: 48, 
                          height: 48, 
                          fontWeight: 'bold',
                          fontSize: '1.5rem',
                          mr: 2,
                          bgcolor: alpha(theme.palette.common.white, 0.2),
                          border: '2px solid white'
                        }}
                      >
                        {getSpeciesIcon(petSpecies)}
                      </Avatar>
                      <Box>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'white', 
                            opacity: 0.9,
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                            fontWeight: 500
                          }}
                        >
                          Loài
                        </Typography>
                        <Typography 
                          variant="h6" 
                          color="white"
                          sx={{ 
                            textShadow: '0 1px 2px rgba(0,0,0,0.4)',
                            fontWeight: 600
                          }}
                        >
                          {petSpecies} {petBreed && `(${petBreed})`}
                        </Typography>
                      </Box>
                    </Box>
                  </Card>
                  
                  <Paper 
                    elevation={2} 
                    sx={{ 
                      mt: 3, 
                      p: 3,
                      borderRadius: 3,
                      background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.background.paper, 0.8)})`,
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        mr: 2
                      }}
                    >
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                        sx={{ 
                          display: 'block', 
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          letterSpacing: 0.5
                        }}
                      >
                        Chủ sở hữu
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {petOwnerName || 'Không có thông tin'}
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              </Grow>
            </Grid>
            
            {/* Pet Details Section */}
            <Grid item xs={12} md={7}>
              <Box sx={{ mt: { xs: 4, md: 0 } }}>
                {/* Basic Info Section */}
                <Box sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip 
                      label={petSpecies} 
                      color="primary"
                      sx={{ 
                        borderRadius: 2,
                        fontWeight: 500,
                        px: 1,
                        boxShadow: `0 2px 5px ${alpha(theme.palette.primary.main, 0.3)}`
                      }} 
                    />
                    {petBreed && (
                      <Chip 
                        label={petBreed} 
                        variant="outlined" 
                        sx={{ 
                          borderRadius: 2,
                          fontWeight: 500,
                          px: 1,
                          boxShadow: `0 2px 5px ${alpha(theme.palette.grey[400], 0.2)}`
                        }}
                      />
                    )}
                  </Box>
                </Box>
                
                {/* Pet Info Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        height: '100%',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: `0 10px 20px ${alpha(theme.palette.primary.light, 0.2)}`
                        },
                        background: `linear-gradient(45deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            mr: 2
                          }}
                        >
                          <CalendarTodayIcon />
                        </Avatar>
                        <Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ fontWeight: 500 }}
                          >
                            Ngày sinh
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 600,
                              fontSize: '1.1rem',
                              mt: 0.5
                            }}
                          >
                            {petDateOfBirth ? formatDate(petDateOfBirth) : 'Không có thông tin'}
                          </Typography>
                          {petDateOfBirth && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <CakeIcon fontSize="small" sx={{ color: theme.palette.primary.main, mr: 0.5 }} />
                              <Typography variant="caption" color="text.secondary">
                                {petAge ? `${petAge} tuổi` : 'Không rõ tuổi'}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        height: '100%',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: `0 10px 20px ${alpha(theme.palette.success.light, 0.2)}`
                        },
                        background: `linear-gradient(45deg, ${alpha(theme.palette.success.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.success.main, 0.1),
                            color: theme.palette.success.main,
                            mr: 2
                          }}
                        >
                          <ScaleIcon />
                        </Avatar>
                        <Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ fontWeight: 500 }}
                          >
                            Cân nặng
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 600,
                              fontSize: '1.1rem',
                              mt: 0.5
                            }}
                          >
                            {petWeight ? `${petWeight} kg` : 'Không có thông tin'}
                          </Typography>
                          {petWeight && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                              <FavoriteIcon fontSize="small" sx={{ color: theme.palette.success.main, mr: 0.5 }} />
                              <Typography variant="caption" color="text.secondary">
                                Cân nặng khỏe mạnh
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        height: '100%',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: `0 10px 20px ${alpha(theme.palette.warning.light, 0.2)}`
                        },
                        background: `linear-gradient(45deg, ${alpha(theme.palette.warning.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.warning.main, 0.1),
                            color: theme.palette.warning.main,
                            mr: 2
                          }}
                        >
                          <ColorLensIcon />
                        </Avatar>
                        <Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ fontWeight: 500 }}
                          >
                            Màu sắc
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 600,
                              fontSize: '1.1rem',
                              mt: 0.5
                            }}
                          >
                            {petColor || 'Không có thông tin'}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        height: '100%',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: `0 10px 20px ${alpha(theme.palette.info.light, 0.2)}`
                        },
                        background: `linear-gradient(45deg, ${alpha(theme.palette.info.main, 0.05)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <Avatar
                          sx={{
                            bgcolor: alpha(theme.palette.info.main, 0.1),
                            color: theme.palette.info.main,
                            mr: 2
                          }}
                        >
                          <LocalHospitalIcon />
                        </Avatar>
                        <Box>
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ fontWeight: 500 }}
                          >
                            Tình trạng sức khỏe
                          </Typography>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              fontWeight: 600,
                              fontSize: '1.1rem',
                              mt: 0.5
                            }}
                          >
                            {pet.healthStatus || 'Không có thông tin'}
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
                
                {/* Description Section */}
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    boxShadow: `0 5px 15px ${alpha(theme.palette.common.black, 0.07)}`,
                    background: `linear-gradient(120deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        mr: 2
                      }}
                    >
                      <DescriptionIcon color="primary" />
                    </Box>
                    <Typography 
                      variant="h6"
                      sx={{ 
                        fontWeight: 600,
                        color: theme.palette.primary.main
                      }}
                    >
                      Mô tả
                    </Typography>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      lineHeight: 1.8,
                      p: 1.5,
                      fontStyle: petDescription ? 'normal' : 'italic',
                      color: petDescription ? 'text.primary' : 'text.secondary',
                      borderLeft: petDescription ? `4px solid ${alpha(theme.palette.primary.main, 0.5)}` : 'none',
                      pl: petDescription ? 2 : 1.5,
                      borderRadius: 1,
                      bgcolor: petDescription ? alpha(theme.palette.primary.main, 0.02) : 'transparent'
                    }}
                  >
                    {petDescription || 'Không có mô tả chi tiết nào về thú cưng này.'}
                  </Typography>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Fade>
  );
};

export default PetDetail;