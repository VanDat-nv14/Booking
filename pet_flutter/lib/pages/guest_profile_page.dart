import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'login_page.dart';
import 'register_page.dart';

class GuestProfilePage extends StatelessWidget {
  const GuestProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // App Bar
          SliverAppBar(
            expandedHeight: 200,
            floating: false,
            pinned: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                    colors: [
                      Theme.of(context).colorScheme.primary,
                      Theme.of(context).colorScheme.primary.withOpacity(0.8),
                    ],
                  ),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        // Avatar placeholder
                        Container(
                          width: 80,
                          height: 80,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.2),
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.white, width: 3),
                          ),
                          child: const Icon(
                            Icons.person,
                            size: 40,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 16),
                        
                        Text(
                          'Khách',
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Đăng nhập để trải nghiệm đầy đủ',
                          style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.white.withOpacity(0.9),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),

          // Content
          SliverToBoxAdapter(
            child: Column(
              children: [
                const SizedBox(height: 24),
                _buildLoginSection(context),
                const SizedBox(height: 24),
                _buildFeaturesPreview(context),
                const SizedBox(height: 24),
                _buildAppInfo(context),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildLoginSection(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Theme.of(context).colorScheme.primary.withOpacity(0.1),
            Theme.of(context).colorScheme.primary.withOpacity(0.05),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: Theme.of(context).colorScheme.primary.withOpacity(0.2),
        ),
      ),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
              shape: BoxShape.circle,
            ),
            child: FaIcon(
              FontAwesomeIcons.userPlus,
              color: Theme.of(context).colorScheme.primary,
              size: 32,
            ),
          ),
          const SizedBox(height: 20),
          
          Text(
            'Tham gia Pet Care ngay!',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              fontWeight: FontWeight.bold,
              color: Theme.of(context).colorScheme.primary,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 12),
          
          Text(
            'Đăng nhập hoặc tạo tài khoản để quản lý thú cưng, đặt lịch hẹn và nhận nhiều ưu đãi hấp dẫn.',
            style: Theme.of(context).textTheme.bodyLarge?.copyWith(
              color: Colors.grey.shade700,
              height: 1.5,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 24),
          
          // Login/Register buttons
          Row(
            children: [
              Expanded(
                child: OutlinedButton.icon(
                  onPressed: () => _navigateToLogin(context),
                  icon: const FaIcon(FontAwesomeIcons.rightToBracket, size: 16),
                  label: const Text('Đăng nhập'),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: Theme.of(context).colorScheme.primary,
                    side: BorderSide(color: Theme.of(context).colorScheme.primary),
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25),
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton.icon(
                  onPressed: () => _navigateToRegister(context),
                  icon: const FaIcon(FontAwesomeIcons.userPlus, size: 16),
                  label: const Text('Đăng ký'),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Theme.of(context).colorScheme.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(25),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFeaturesPreview(BuildContext context) {
    final features = [
      {
        'icon': FontAwesomeIcons.heart,
        'title': 'Quản lý thú cưng',
        'description': 'Lưu trữ thông tin, lịch sử khám bệnh và tiêm phòng',
        'locked': true,
      },
      {
        'icon': FontAwesomeIcons.calendarCheck,
        'title': 'Đặt lịch hẹn',
        'description': 'Đặt lịch khám bệnh, grooming và các dịch vụ khác',
        'locked': true,
      },
      {
        'icon': FontAwesomeIcons.bell,
        'title': 'Thông báo thông minh',
        'description': 'Nhắc nhở lịch hẹn, tiêm phòng và chăm sóc',
        'locked': true,
      },
      {
        'icon': FontAwesomeIcons.chartLine,
        'title': 'Theo dõi sức khỏe',
        'description': 'Biểu đồ cân nặng, lịch sử bệnh án và báo cáo',
        'locked': true,
      },
      {
        'icon': FontAwesomeIcons.tags,
        'title': 'Ưu đãi độc quyền',
        'description': 'Khuyến mãi và chương trình loyalty dành riêng',
        'locked': true,
      },
      {
        'icon': FontAwesomeIcons.headset,
        'title': 'Hỗ trợ 24/7',
        'description': 'Tư vấn trực tuyến và hỗ trợ khẩn cấp',
        'locked': false, // This one is available for guests
      },
    ];

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
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
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              FaIcon(
                FontAwesomeIcons.star,
                color: Colors.amber.shade600,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Tính năng Pet Care',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          
          ...features.map((feature) => _buildFeatureItem(
            context,
            feature['icon'] as IconData,
            feature['title'] as String,
            feature['description'] as String,
            feature['locked'] as bool,
          )),
        ],
      ),
    );
  }

  Widget _buildFeatureItem(BuildContext context, IconData icon, String title, String description, bool locked) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          Stack(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: locked 
                    ? Colors.grey.shade100 
                    : Theme.of(context).colorScheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: FaIcon(
                  icon,
                  color: locked 
                    ? Colors.grey.shade400 
                    : Theme.of(context).colorScheme.primary,
                  size: 20,
                ),
              ),
              if (locked)
                Positioned(
                  right: -2,
                  top: -2,
                  child: Container(
                    padding: const EdgeInsets.all(2),
                    decoration: BoxDecoration(
                      color: Colors.orange.shade600,
                      shape: BoxShape.circle,
                    ),
                    child: const FaIcon(
                      FontAwesomeIcons.lock,
                      color: Colors.white,
                      size: 8,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        title,
                        style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                          fontWeight: FontWeight.w600,
                          color: locked ? Colors.grey.shade600 : null,
                        ),
                      ),
                    ),
                    if (locked)
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.orange.shade100,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          'Cần đăng nhập',
                          style: TextStyle(
                            fontSize: 10,
                            color: Colors.orange.shade700,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  description,
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: Colors.grey.shade600,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAppInfo(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
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
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Về Pet Care',
            style: Theme.of(context).textTheme.titleLarge?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 16),
          
          _buildInfoItem(
            context,
            FontAwesomeIcons.mobileScreen,
            'Phiên bản ứng dụng',
            'v1.0.0',
          ),
          _buildInfoItem(
            context,
            FontAwesomeIcons.shield,
            'Bảo mật dữ liệu',
            'Mã hóa end-to-end',
          ),
          _buildInfoItem(
            context,
            FontAwesomeIcons.phone,
            'Hotline hỗ trợ',
            '1900-PETCARE',
          ),
          _buildInfoItem(
            context,
            FontAwesomeIcons.envelope,
            'Email hỗ trợ',
            'support@petcare.vn',
          ),
          
          const SizedBox(height: 20),
          
          // Social links
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              _buildSocialButton(
                context,
                FontAwesomeIcons.facebook,
                'Facebook',
                Colors.blue.shade600,
              ),
              _buildSocialButton(
                context,
                FontAwesomeIcons.instagram,
                'Instagram',
                Colors.pink.shade400,
              ),
              _buildSocialButton(
                context,
                FontAwesomeIcons.youtube,
                'YouTube',
                Colors.red.shade600,
              ),
              _buildSocialButton(
                context,
                FontAwesomeIcons.tiktok,
                'TikTok',
                Colors.black,
              ),
            ],
          ),
          
          const SizedBox(height: 20),
          
          // Terms and Privacy
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: [
              TextButton(
                onPressed: () => _showTermsDialog(context),
                child: const Text('Điều khoản sử dụng'),
              ),
              Container(
                width: 1,
                height: 16,
                color: Colors.grey.shade300,
              ),
              TextButton(
                onPressed: () => _showPrivacyDialog(context),
                child: const Text('Chính sách bảo mật'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildInfoItem(BuildContext context, IconData icon, String title, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          FaIcon(
            icon,
            color: Theme.of(context).colorScheme.primary,
            size: 16,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              title,
              style: Theme.of(context).textTheme.bodyMedium,
            ),
          ),
          Text(
            value,
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              fontWeight: FontWeight.w500,
              color: Theme.of(context).colorScheme.primary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSocialButton(BuildContext context, IconData icon, String name, Color color) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: FaIcon(
            icon,
            color: color,
            size: 20,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          name,
          style: Theme.of(context).textTheme.bodySmall,
        ),
      ],
    );
  }

  void _navigateToLogin(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => const LoginPage()),
    );
  }

  void _navigateToRegister(BuildContext context) {
    Navigator.of(context).push(
      MaterialPageRoute(builder: (context) => const RegisterPage()),
    );
  }

  void _showTermsDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Điều khoản sử dụng'),
        content: const SingleChildScrollView(
          child: Text(
            'Điều khoản sử dụng ứng dụng Pet Care:\n\n'
            '1. Ứng dụng cung cấp dịch vụ chăm sóc thú cưng\n'
            '2. Người dùng có trách nhiệm cung cấp thông tin chính xác\n'
            '3. Mọi thông tin y tế chỉ mang tính chất tham khảo\n'
            '4. Trong trường hợp khẩn cấp, vui lòng liên hệ trực tiếp với bác sĩ thú y\n'
            '5. Pet Care không chịu trách nhiệm về các quyết định điều trị\n\n'
            'Bằng việc sử dụng ứng dụng, bạn đồng ý với các điều khoản trên.',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }

  void _showPrivacyDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Text('Chính sách bảo mật'),
        content: const SingleChildScrollView(
          child: Text(
            'Chính sách bảo mật Pet Care:\n\n'
            '1. Thu thập thông tin: Chúng tôi chỉ thu thập thông tin cần thiết để cung cấp dịch vụ\n'
            '2. Sử dụng thông tin: Thông tin được sử dụng để cải thiện chất lượng dịch vụ\n'
            '3. Bảo mật: Tất cả dữ liệu được mã hóa và bảo mật theo tiêu chuẩn quốc tế\n'
            '4. Chia sẻ: Chúng tôi không chia sẻ thông tin cá nhân với bên thứ ba\n'
            '5. Quyền của người dùng: Bạn có quyền yêu cầu xóa hoặc chỉnh sửa thông tin\n\n'
            'Liên hệ: privacy@petcare.vn để biết thêm chi tiết.',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }
}
