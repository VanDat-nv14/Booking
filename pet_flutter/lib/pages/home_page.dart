import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:lottie/lottie.dart';
import 'package:pet_flutter/services/secure_storage.dart';
import 'package:pet_flutter/pages/profile_page.dart';
import 'package:pet_flutter/pages/reviews_page.dart';
import 'package:pet_flutter/widgets/banner_carousel.dart';
import 'package:pet_flutter/widgets/shimmer_placeholders.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  final _storage = SecureStorageService();
  String? _username;
  int? _userId;
  String? _token;
  bool _isLoading = true;
  bool _hasShownWelcome = false;

  @override
  void initState() {
    super.initState();
    _loadUser();
  }

  Future<void> _loadUser() async {
    // Simulate loading time
    await Future.delayed(const Duration(milliseconds: 2000));
    
    final userJson = await _storage.readUser();
    _token = await _storage.readToken();
    if (userJson != null) {
      final map = jsonDecode(userJson) as Map<String, dynamic>;
      setState(() {
        _username = (map['fullName'] as String?) ?? (map['username'] as String?);
        _userId = (map['userId'] as num?)?.toInt();
        _isLoading = false;
      });
      
      // Show welcome animation after loading
      if (!_hasShownWelcome && mounted) {
        _hasShownWelcome = true;
        Future.delayed(const Duration(milliseconds: 300), () {
          if (mounted) {
            _showWelcomeAnimation();
          }
        });
      }
    } else {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _showWelcomeAnimation() async {
    return showDialog(
      context: context,
      barrierDismissible: false,
      barrierColor: Colors.black.withOpacity(0.6),
      builder: (BuildContext context) {
        return Dialog(
          backgroundColor: Colors.transparent,
          elevation: 0,
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.1),
                  blurRadius: 20,
                  spreadRadius: 2,
                ),
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Lottie animation
                Lottie.asset(
                  'assets/animations/congratulation.json',
                  width: 200,
                  height: 200,
                  fit: BoxFit.contain,
                  repeat: true,
                ),
                const SizedBox(height: 16),
                Text(
                  'Chào mừng bạn trở lại!',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                Text(
                  _username != null ? 'Xin chào, $_username!' : 'Xin chào!',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w600,
                    color: Colors.grey.shade800,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Chúc bạn có một ngày tuyệt vời 🎉',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade600,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                // Close button
                TextButton(
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                  style: TextButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: const Text(
                    'Bắt đầu',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: _buildCustomAppBar(context),
      body: _isLoading ? _buildShimmerBody() : _buildNormalBody(),
    );
  }

  Widget _buildShimmerBody() {
    return SingleChildScrollView(
      child: Column(
        children: [
          // Banner Shimmer
          ShimmerBanner(
            width: double.infinity,
            height: 200,
            margin: const EdgeInsets.all(16),
          ),
          
          // Service Categories Shimmer
          _buildShimmerServiceCategories(),
          
          // Quick Actions Shimmer
          _buildShimmerQuickActions(),
          
          // Featured Services Shimmer
          _buildShimmerFeaturedServices(),
          
          // Upcoming Appointments Shimmer
          _buildShimmerUpcomingAppointments(),
          
          // My Pets Shimmer
          _buildShimmerMyPets(),
          
          // Customer Reviews Shimmer
          _buildShimmerCustomerReviews(),
          
          // Services Preview Shimmer
          _buildShimmerServicesPreview(),
          
          // Stats Shimmer
          _buildShimmerStats(),
        ],
      ),
    );
  }

  Widget _buildNormalBody() {
    return SingleChildScrollView(
      child: Column(
        children: [
          // Banner Carousel
          const BannerCarousel(),
          
          // Service Categories Section
          _buildServiceCategoriesSection(context),
          
          // Quick Actions Section
          _buildQuickActionsSection(context),
          
          // Featured Services Section
          _buildFeaturedServicesSection(context),
          
          // Upcoming Appointments Section
          _buildUpcomingAppointmentsSection(context),
          
          // My Pets Section
          _buildMyPetsSection(context),
          
          // Customer Reviews Section
          _buildCustomerReviewsSection(context),
          
          // Services Preview Section
          _buildServicesPreviewSection(context),
          
          // Stats Section
          _buildStatsSection(context),
        ],
      ),
    );
  }

  PreferredSizeWidget _buildCustomAppBar(BuildContext context) {
    return PreferredSize(
      preferredSize: const Size.fromHeight(120),
      child: Container(
        decoration: BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Theme.of(context).colorScheme.primary,
              Theme.of(context).colorScheme.primary.withOpacity(0.8),
            ],
          ),
          boxShadow: [
            BoxShadow(
              color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
              spreadRadius: 1,
              blurRadius: 10,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                // Top row: Logo/Title and Notifications
                Row(
                  children: [
                    // Logo/Title
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const FaIcon(
                            FontAwesomeIcons.paw,
                            color: Colors.white,
                            size: 24,
                          ),
                        ),
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'PetCare',
                              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            Text(
                              'Chăm sóc thú cưng chuyên nghiệp',
                              style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                color: Colors.white.withOpacity(0.8),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const Spacer(),
                    // Notifications
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: IconButton(
                        padding: EdgeInsets.zero,
                        onPressed: () {
                          // TODO: Navigate to notifications page
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Tính năng thông báo đang được phát triển')),
                          );
                        },
                        icon: Lottie.asset(
                          'assets/animations/notification_bell.json',
                          width: 32,
                          height: 32,
                          fit: BoxFit.contain,
                        ),
                        tooltip: 'Thông báo',
                      ),
                    ),
                    const SizedBox(width: 8),
                    // User Avatar
                    GestureDetector(
                      onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(
                  builder: (_) => ProfilePage(
                    initialToken: _token,
                    initialUserId: _userId,
                  ),
                ),
              );
            },
                      child: Container(
                        width: 40,
                        height: 40,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: Colors.white.withOpacity(0.3),
                            width: 2,
                          ),
                        ),
                        child: _username != null && _username!.isNotEmpty
                            ? Center(
                                child: Text(
                                  _username![0].toUpperCase(),
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 16,
                                  ),
                                ),
                              )
                            : const FaIcon(
                                FontAwesomeIcons.user,
                                color: Colors.white,
                                size: 18,
                              ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Welcome message
                if (_username != null)
                  Row(
                    children: [
                      const FaIcon(
                        FontAwesomeIcons.hand,
                        color: Colors.white,
                        size: 16,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Xin chào, $_username!',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildQuickActionsSection(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Thao tác nhanh',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
              color: Colors.grey.shade800,
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _buildQuickActionCard(
                  context,
                  'Đặt lịch',
                  FontAwesomeIcons.calendarPlus,
                  Theme.of(context).colorScheme.primary,
                  () {
                    // TODO: Navigate to appointment booking
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Tính năng đặt lịch đang được phát triển')),
                    );
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildQuickActionCard(
                  context,
                  'Thú cưng',
                  FontAwesomeIcons.paw,
                  Colors.orange,
                  () {
                    // TODO: Navigate to pets page
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Tính năng quản lý thú cưng đang được phát triển')),
                    );
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildQuickActionCard(
                  context,
                  'Dịch vụ',
                  FontAwesomeIcons.stethoscope,
                  Colors.green,
                  () {
                    // TODO: Navigate to services page
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Tính năng dịch vụ đang được phát triển')),
                    );
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _buildQuickActionCard(
                  context,
                  'Đánh giá',
                  FontAwesomeIcons.star,
                  Colors.amber,
                  () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => const ReviewsPage(),
                      ),
                    );
                  },
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildQuickActionCard(
                  context,
                  'Lịch hẹn',
                  FontAwesomeIcons.calendarCheck,
                  Colors.blue,
                  () {
                    // TODO: Navigate to appointments page
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Tính năng lịch hẹn đang được phát triển')),
                    );
                  },
                ),
              ),
              const SizedBox(width: 12),
                      Expanded(
                        child: _buildQuickActionCard(
                          context,
                          'Hỗ trợ',
                          FontAwesomeIcons.headset,
                          Colors.purple,
                          () {
                            // TODO: Navigate to support page
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Tính năng hỗ trợ đang được phát triển')),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: _buildQuickActionCard(
                          context,
                          'Thông báo',
                          FontAwesomeIcons.bell,
                          Colors.red,
                          () {
                            // TODO: Navigate to notifications page
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(content: Text('Tính năng thông báo đang được phát triển')),
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(child: Container()), // Empty space
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionCard(
    BuildContext context,
    String title,
    IconData icon,
    Color color,
    VoidCallback onTap,
  ) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              spreadRadius: 1,
              blurRadius: 5,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: FaIcon(
                icon,
                color: color,
                size: 24,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              title,
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                fontWeight: FontWeight.w600,
                color: Colors.grey.shade700,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildServicesPreviewSection(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Dịch vụ nổi bật',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.grey.shade800,
                ),
              ),
              TextButton(
            onPressed: () {
                  // TODO: Navigate to all services
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Tính năng xem tất cả dịch vụ đang được phát triển')),
                  );
                },
                child: Text(
                  'Xem tất cả',
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: [
                _buildServiceCard(
                  context,
                  'Spa & Chăm sóc',
                  'Tắm rửa, cắt tỉa lông',
                  FontAwesomeIcons.spa,
                  Colors.purple,
                ),
                const SizedBox(width: 12),
                _buildServiceCard(
                  context,
                  'Khám sức khỏe',
                  'Kiểm tra định kỳ',
                  FontAwesomeIcons.stethoscope,
                  Colors.blue,
                ),
                const SizedBox(width: 12),
                _buildServiceCard(
                  context,
                  'Huấn luyện',
                  'Đào tạo thú cưng',
                  FontAwesomeIcons.graduationCap,
                  Colors.orange,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildServiceCard(
    BuildContext context,
    String title,
    String subtitle,
    IconData icon,
    Color color,
  ) {
    return Container(
      width: 160,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 5,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: FaIcon(
              icon,
              color: color,
              size: 20,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: Theme.of(context).textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: Colors.grey.shade800,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            subtitle,
            style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Colors.grey.shade600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatsSection(BuildContext context) {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            Theme.of(context).colorScheme.primary,
            Theme.of(context).colorScheme.primary.withOpacity(0.8),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
            spreadRadius: 1,
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: _buildStatItem(
              context,
              '12',
              'Thú cưng',
              FontAwesomeIcons.paw,
            ),
          ),
          Container(
            width: 1,
            height: 40,
            color: Colors.white.withOpacity(0.3),
          ),
          Expanded(
            child: _buildStatItem(
              context,
              '8',
              'Lịch hẹn',
              FontAwesomeIcons.calendarCheck,
            ),
          ),
          Container(
            width: 1,
            height: 40,
            color: Colors.white.withOpacity(0.3),
          ),
          Expanded(
            child: _buildStatItem(
              context,
              '5',
              'Dịch vụ',
              FontAwesomeIcons.stethoscope,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(
    BuildContext context,
    String value,
    String label,
    IconData icon,
  ) {
    return Column(
      children: [
        FaIcon(
          icon,
          color: Colors.white,
          size: 20,
        ),
        const SizedBox(height: 8),
        Text(
          value,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 24,
            fontWeight: FontWeight.bold,
          ),
        ),
        Text(
          label,
          style: TextStyle(
            color: Colors.white.withOpacity(0.8),
            fontSize: 12,
          ),
        ),
      ],
    );
  }

  Widget _buildServiceCategoriesSection(BuildContext context) {
    final serviceCategories = [
      {
        'name': 'Tắm rửa',
        'icon': FontAwesomeIcons.shower,
        'color': Colors.blue,
        'description': 'Chăm sóc vệ sinh',
      },
      {
        'name': 'Cắt tỉa',
        'icon': FontAwesomeIcons.scissors,
        'color': Colors.purple,
        'description': 'Cắt tỉa lông đẹp',
      },
      {
        'name': 'Khám bệnh',
        'icon': FontAwesomeIcons.stethoscope,
        'color': Colors.green,
        'description': 'Kiểm tra sức khỏe',
      },
      {
        'name': 'Spa & Massage',
        'icon': FontAwesomeIcons.spa,
        'color': Colors.pink,
        'description': 'Thư giãn cho thú cưng',
      },
      {
        'name': 'Huấn luyện',
        'icon': FontAwesomeIcons.graduationCap,
        'color': Colors.orange,
        'description': 'Đào tạo ngoan ngoãn',
      },
      {
        'name': 'Chăm sóc răng',
        'icon': FontAwesomeIcons.tooth,
        'color': Colors.teal,
        'description': 'Vệ sinh răng miệng',
      },
      {
        'name': 'Cắt móng',
        'icon': FontAwesomeIcons.handScissors,
        'color': Colors.indigo,
        'description': 'Cắt móng chuyên nghiệp',
      },
      {
        'name': 'Chăm sóc đặc biệt',
        'icon': FontAwesomeIcons.heart,
        'color': Colors.red,
        'description': 'Dịch vụ cao cấp',
      },
    ];

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Danh mục dịch vụ',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.grey.shade800,
                ),
              ),
              TextButton(
                onPressed: () {
                  // TODO: Navigate to all services
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Xem tất cả dịch vụ')),
                  );
                },
                child: Text(
                  'Xem tất cả',
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              childAspectRatio: 0.8,
              crossAxisSpacing: 12,
              mainAxisSpacing: 12,
            ),
            itemCount: serviceCategories.length,
            itemBuilder: (context, index) {
              final category = serviceCategories[index];
              return _buildServiceCategoryCard(
                context,
                category['name'] as String,
                category['icon'] as IconData,
                category['color'] as Color,
                category['description'] as String,
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildServiceCategoryCard(
    BuildContext context,
    String name,
    IconData icon,
    Color color,
    String description,
  ) {
    return GestureDetector(
      onTap: () {
        // TODO: Navigate to specific service category
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Chọn danh mục: $name'),
            backgroundColor: color,
          ),
        );
      },
      child: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.withOpacity(0.1),
              spreadRadius: 1,
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(8.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: FaIcon(
                  icon,
                  color: color,
                  size: 20,
                ),
              ),
              const SizedBox(height: 6),
              Flexible(
                child: Text(
                  name,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    fontWeight: FontWeight.w600,
                    color: Colors.grey.shade800,
                    fontSize: 11,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const SizedBox(height: 2),
              Flexible(
                child: Text(
                  description,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey.shade600,
                    fontSize: 9,
                  ),
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFeaturedServicesSection(BuildContext context) {
    final featuredServices = [
      {
        'name': 'Tắm gội toàn thân',
        'description': 'Dịch vụ tắm gội chuyên nghiệp với sản phẩm cao cấp',
        'price': '150.000đ',
        'image': 'assets/1.jpg',
        'color': Colors.blue,
        'rating': 4.8,
      },
      {
        'name': 'Cắt móng cho mèo',
        'description': 'Cắt móng an toàn, không gây stress cho thú cưng',
        'price': '80.000đ',
        'image': 'assets/2.jpg',
        'color': Colors.purple,
        'rating': 4.9,
      },
      {
        'name': 'Spa & Massage',
        'description': 'Thư giãn hoàn toàn với liệu pháp massage chuyên nghiệp',
        'price': '300.000đ',
        'image': 'assets/3.jpg',
        'color': Colors.pink,
        'rating': 4.7,
      },
    ];

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Dịch vụ nổi bật',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.grey.shade800,
                ),
              ),
              TextButton(
                onPressed: () {
                  // TODO: Navigate to all services
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Xem tất cả dịch vụ')),
                  );
                },
                child: Text(
                  'Xem tất cả',
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 280,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: featuredServices.length,
              itemBuilder: (context, index) {
                final service = featuredServices[index];
                return _buildFeaturedServiceCard(
                  context,
                  service['name'] as String,
                  service['description'] as String,
                  service['price'] as String,
                  service['image'] as String,
                  service['color'] as Color,
                  service['rating'] as double,
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeaturedServiceCard(
    BuildContext context,
    String name,
    String description,
    String price,
    String image,
    Color color,
    double rating,
  ) {
    return Container(
      width: 200,
      margin: const EdgeInsets.only(right: 16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Service Image
          Container(
            height: 120,
            width: double.infinity,
            decoration: BoxDecoration(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
              image: DecorationImage(
                image: AssetImage(image),
                fit: BoxFit.cover,
              ),
            ),
            child: Container(
              decoration: BoxDecoration(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    Colors.black.withOpacity(0.3),
                  ],
                ),
              ),
              child: Stack(
                children: [
                  // Rating badge
                  Positioned(
                    top: 8,
                    right: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.9),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const FaIcon(
                            FontAwesomeIcons.star,
                            size: 10,
                            color: Colors.amber,
                          ),
                          const SizedBox(width: 2),
                          Text(
                            rating.toString(),
                            style: const TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Service Info
          Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Service Name
                Text(
                  name,
                  style: Theme.of(context).textTheme.titleSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Colors.grey.shade800,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                
                // Service Description
                Text(
                  description,
                  style: Theme.of(context).textTheme.bodySmall?.copyWith(
                    color: Colors.grey.shade600,
                    fontSize: 11,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 8),
                
                // Price and Book Button
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    // Price
                    Text(
                      'Giá từ $price',
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        color: color,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                      ),
                    ),
                    
                    // Book Button
                    GestureDetector(
                      onTap: () {
                        // TODO: Navigate to booking form
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(
                            content: Text('Đặt dịch vụ: $name'),
                            backgroundColor: color,
                          ),
                        );
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                        decoration: BoxDecoration(
                          color: color,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          'Đặt ngay',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 10,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildUpcomingAppointmentsSection(BuildContext context) {
    final upcomingAppointments = [
      {
        'petName': 'Bé Miu',
        'petAvatar': '🐱',
        'serviceName': 'Cắt tỉa lông',
        'time': '10:00 sáng',
        'date': '3/10/2025',
        'status': 'confirmed',
        'color': Colors.green,
      },
      {
        'petName': 'Chó Rex',
        'petAvatar': '🐕',
        'serviceName': 'Tắm gội toàn thân',
        'time': '14:30 chiều',
        'date': '5/10/2025',
        'status': 'pending',
        'color': Colors.orange,
      },
      {
        'petName': 'Mèo Luna',
        'petAvatar': '🐈',
        'serviceName': 'Khám sức khỏe',
        'time': '09:00 sáng',
        'date': '7/10/2025',
        'status': 'confirmed',
        'color': Colors.blue,
      },
    ];

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Lịch hẹn sắp tới của bạn',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.grey.shade800,
                ),
              ),
              TextButton(
                onPressed: () {
                  // TODO: Navigate to appointments page
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Xem tất cả lịch hẹn')),
                  );
                },
                child: Text(
                  'Xem tất cả',
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: upcomingAppointments.length,
            itemBuilder: (context, index) {
              final appointment = upcomingAppointments[index];
              return _buildUpcomingAppointmentCard(
                context,
                appointment['petName'] as String,
                appointment['petAvatar'] as String,
                appointment['serviceName'] as String,
                appointment['time'] as String,
                appointment['date'] as String,
                appointment['status'] as String,
                appointment['color'] as Color,
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildUpcomingAppointmentCard(
    BuildContext context,
    String petName,
    String petAvatar,
    String serviceName,
    String time,
    String date,
    String status,
    Color color,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
        border: Border.all(
          color: color.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          // Pet Avatar
          Container(
            width: 50,
            height: 50,
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: BorderRadius.circular(25),
              border: Border.all(
                color: color.withOpacity(0.3),
                width: 2,
              ),
            ),
            child: Center(
              child: Text(
                petAvatar,
                style: const TextStyle(fontSize: 24),
              ),
            ),
          ),
          const SizedBox(width: 16),
          
          // Appointment Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Pet Name
                Text(
                  petName,
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: Colors.grey.shade800,
                  ),
                ),
                const SizedBox(height: 4),
                
                // Service Name
                Text(
                  serviceName,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey.shade700,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                
                // Time and Date
                Row(
                  children: [
                    FaIcon(
                      FontAwesomeIcons.clock,
                      size: 12,
                      color: Colors.grey.shade600,
                    ),
                    const SizedBox(width: 4),
                    Text(
                      '$time, $date',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          
          // Status Badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
            decoration: BoxDecoration(
              color: status == 'confirmed' 
                  ? Colors.green.withOpacity(0.1)
                  : Colors.orange.withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: status == 'confirmed' 
                    ? Colors.green.withOpacity(0.3)
                    : Colors.orange.withOpacity(0.3),
                width: 1,
              ),
            ),
            child: Text(
              status == 'confirmed' ? 'Đã xác nhận' : 'Chờ xác nhận',
              style: TextStyle(
                color: status == 'confirmed' ? Colors.green : Colors.orange,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMyPetsSection(BuildContext context) {
    final myPets = [
      {
        'name': 'Miu',
        'avatar': '🐱',
        'breed': 'Mèo Anh lông ngắn',
        'age': '2 tuổi',
        'color': Colors.orange,
      },
      {
        'name': 'Bim',
        'avatar': '🐶',
        'breed': 'Golden Retriever',
        'age': '3 tuổi',
        'color': Colors.amber,
      },
      {
        'name': 'Luna',
        'avatar': '🐈',
        'breed': 'Mèo Ba Tư',
        'age': '1 tuổi',
        'color': Colors.purple,
      },
    ];

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Thú cưng của bạn',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.grey.shade800,
                ),
              ),
              TextButton(
                onPressed: () {
                  // TODO: Navigate to pets page
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Xem tất cả thú cưng')),
                  );
                },
                child: Text(
                  'Xem tất cả',
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 120,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: myPets.length + 1, // +1 for add button
              itemBuilder: (context, index) {
                if (index == myPets.length) {
                  return _buildAddPetCard(context);
                }
                final pet = myPets[index];
                return _buildPetCard(
                  context,
                  pet['name'] as String,
                  pet['avatar'] as String,
                  pet['breed'] as String,
                  pet['age'] as String,
                  pet['color'] as Color,
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPetCard(
    BuildContext context,
    String name,
    String avatar,
    String breed,
    String age,
    Color color,
  ) {
    return GestureDetector(
      onTap: () {
        // TODO: Navigate to PetDetailScreen
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Xem chi tiết: $name'),
            backgroundColor: color,
          ),
        );
      },
      child: Container(
        width: 100,
        margin: const EdgeInsets.only(right: 12),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Pet Avatar
            Container(
              width: 70,
              height: 70,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                borderRadius: BorderRadius.circular(35),
                border: Border.all(
                  color: color.withOpacity(0.3),
                  width: 2,
                ),
              ),
              child: Center(
                child: Text(
                  avatar,
                  style: const TextStyle(fontSize: 28),
                ),
              ),
            ),
            const SizedBox(height: 6),
            
            // Pet Name
            Text(
              name,
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: Colors.grey.shade800,
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 2),
            
            // Breed and Age
            Flexible(
              child: Text(
                '$breed - $age',
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: Colors.grey.shade600,
                  fontSize: 9,
                ),
                textAlign: TextAlign.center,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAddPetCard(BuildContext context) {
    return GestureDetector(
      onTap: () {
        // TODO: Navigate to AddPetScreen
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Thêm thú cưng mới')),
        );
      },
      child: SizedBox(
        width: 100,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Add Button
            Container(
              width: 70,
              height: 70,
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(35),
                border: Border.all(
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                  width: 2,
                  style: BorderStyle.solid,
                ),
              ),
              child: Center(
                child: FaIcon(
                  FontAwesomeIcons.plus,
                  color: Theme.of(context).colorScheme.primary,
                  size: 20,
                ),
              ),
            ),
            const SizedBox(height: 6),
            
            // Add Text
            Text(
              'Thêm bé mới',
              style: Theme.of(context).textTheme.titleSmall?.copyWith(
                fontWeight: FontWeight.bold,
                color: Theme.of(context).colorScheme.primary,
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCustomerReviewsSection(BuildContext context) {
    final reviews = [
      {
        'name': 'Nguyễn Thị Lan',
        'avatar': '👩',
        'content': 'Nhân viên thân thiện, dịch vụ tốt! Thú cưng của tôi rất hài lòng.',
        'rating': 5,
        'date': '2 ngày trước',
        'color': Colors.blue,
      },
      {
        'name': 'Trần Văn Minh',
        'avatar': '👨',
        'content': 'Phòng khám sạch sẽ, bác sĩ chuyên nghiệp. Rất đáng tin cậy!',
        'rating': 5,
        'date': '1 tuần trước',
        'color': Colors.green,
      },
      {
        'name': 'Lê Thị Hoa',
        'avatar': '👩',
        'content': 'Dịch vụ spa tuyệt vời, giá cả hợp lý. Sẽ quay lại!',
        'rating': 4,
        'date': '3 ngày trước',
        'color': Colors.purple,
      },
    ];

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Đánh giá khách hàng',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: Colors.grey.shade800,
                ),
              ),
              TextButton(
                onPressed: () {
                  // TODO: Navigate to ReviewsScreen
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Xem tất cả đánh giá')),
                  );
                },
                child: Text(
                  'Xem tất cả',
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.primary,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            height: 200,
            child: PageView.builder(
              itemCount: reviews.length,
              itemBuilder: (context, index) {
                final review = reviews[index];
                return _buildReviewCard(
                  context,
                  review['name'] as String,
                  review['avatar'] as String,
                  review['content'] as String,
                  review['rating'] as int,
                  review['date'] as String,
                  review['color'] as Color,
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildReviewCard(
    BuildContext context,
    String name,
    String avatar,
    String content,
    int rating,
    String date,
    Color color,
  ) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
        border: Border.all(
          color: color.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // User Info
          Row(
            children: [
              // User Avatar
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: color.withOpacity(0.3),
                    width: 1,
                  ),
                ),
                child: Center(
                  child: Text(
                    avatar,
                    style: const TextStyle(fontSize: 20),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              
              // User Name and Date
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      name,
                      style: Theme.of(context).textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.grey.shade800,
                      ),
                    ),
                    Text(
                      'Đánh giá $date',
                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                        color: Colors.grey.shade600,
                        fontSize: 11,
                      ),
                    ),
                  ],
                ),
              ),
              
              // Rating Stars
              Row(
                children: List.generate(5, (index) {
                  return FaIcon(
                    FontAwesomeIcons.star,
                    size: 12,
                    color: index < rating ? Colors.amber : Colors.grey.shade300,
                  );
                }),
              ),
            ],
          ),
          const SizedBox(height: 16),
          
          // Review Content
          Text(
            content,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey.shade700,
              height: 1.4,
            ),
            maxLines: 4,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }

  // Shimmer Methods
  Widget _buildShimmerServiceCategories() {
    return Container(
      margin: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ShimmerText(width: 150, height: 20, margin: const EdgeInsets.only(bottom: 12)),
          Row(
            children: List.generate(4, (index) => Expanded(
              child: Container(
                margin: EdgeInsets.only(right: index < 3 ? 8 : 0),
                child: Column(
                  children: [
                    ShimmerAvatar(size: 50, margin: const EdgeInsets.only(bottom: 8)),
                    ShimmerText(width: 60, height: 12),
                  ],
                ),
              ),
            )),
          ),
        ],
      ),
    );
  }

  Widget _buildShimmerQuickActions() {
    return Container(
      margin: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ShimmerText(width: 120, height: 20, margin: const EdgeInsets.only(bottom: 12)),
          Row(
            children: [
              Expanded(child: ShimmerButton(width: double.infinity, height: 80, margin: const EdgeInsets.only(right: 8))),
              Expanded(child: ShimmerButton(width: double.infinity, height: 80, margin: const EdgeInsets.only(left: 8))),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildShimmerFeaturedServices() {
    return Container(
      margin: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ShimmerText(width: 150, height: 20, margin: const EdgeInsets.only(bottom: 12)),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: List.generate(3, (index) => Container(
                width: 200,
                margin: EdgeInsets.only(right: index < 2 ? 12 : 0),
                child: ShimmerCard(
                  width: double.infinity,
                  height: 120,
                ),
              )),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShimmerUpcomingAppointments() {
    return Container(
      margin: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ShimmerText(width: 200, height: 20, margin: const EdgeInsets.only(bottom: 12)),
          ...List.generate(2, (index) => ShimmerListItem(
            width: double.infinity,
            height: 80,
            margin: const EdgeInsets.only(bottom: 8),
          )),
        ],
      ),
    );
  }

  Widget _buildShimmerMyPets() {
    return Container(
      margin: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ShimmerText(width: 100, height: 20, margin: const EdgeInsets.only(bottom: 12)),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: List.generate(3, (index) => Container(
                width: 150,
                margin: EdgeInsets.only(right: index < 2 ? 12 : 0),
                child: ShimmerCard(
                  width: double.infinity,
                  height: 100,
                ),
              )),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShimmerCustomerReviews() {
    return Container(
      margin: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ShimmerText(width: 150, height: 20, margin: const EdgeInsets.only(bottom: 12)),
          ...List.generate(2, (index) => ShimmerListItem(
            width: double.infinity,
            height: 100,
            margin: const EdgeInsets.only(bottom: 8),
          )),
        ],
      ),
    );
  }

  Widget _buildShimmerServicesPreview() {
    return Container(
      margin: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ShimmerText(width: 120, height: 20, margin: const EdgeInsets.only(bottom: 12)),
          Row(
            children: [
              Expanded(child: ShimmerButton(width: double.infinity, height: 60, margin: const EdgeInsets.only(right: 8))),
              Expanded(child: ShimmerButton(width: double.infinity, height: 60, margin: const EdgeInsets.only(left: 8))),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildShimmerStats() {
    return Container(
      margin: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          ShimmerText(width: 100, height: 20, margin: const EdgeInsets.only(bottom: 12)),
          Row(
            children: [
              Expanded(child: ShimmerCard(width: double.infinity, height: 80, margin: const EdgeInsets.only(right: 8))),
              Expanded(child: ShimmerCard(width: double.infinity, height: 80, margin: const EdgeInsets.only(left: 8))),
            ],
          ),
        ],
      ),
    );
  }
}


