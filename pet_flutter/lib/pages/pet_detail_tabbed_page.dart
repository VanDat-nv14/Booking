import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:intl/intl.dart';
import 'edit_pet_page.dart';
import '../utils/format_utils.dart';
import '../widgets/pet_appointment_history.dart';

class PetDetailTabbedPage extends StatefulWidget {
  final Map<String, dynamic> pet;

  const PetDetailTabbedPage({super.key, required this.pet});

  @override
  State<PetDetailTabbedPage> createState() => _PetDetailTabbedPageState();
}

class _PetDetailTabbedPageState extends State<PetDetailTabbedPage> with SingleTickerProviderStateMixin {
  late Map<String, dynamic> pet;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    pet = widget.pet;
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  String _getAge() {
    final dobStr = pet['dateOfBirth'] as String?;
    if (dobStr == null || dobStr.isEmpty) return 'Không rõ';
    
    try {
      final dob = DateTime.parse(dobStr);
      final now = DateTime.now();
      final months = (now.difference(dob).inDays / 30).floor();
      if (months >= 12) {
        return '${(months / 12).floor()} tuổi';
      } else {
        return '$months tháng tuổi';
      }
    } catch (_) {
      return 'Không rõ';
    }
  }

  String _getBirthDate() {
    final dobStr = pet['dateOfBirth'] as String?;
    if (dobStr == null || dobStr.isEmpty) return 'Không rõ';
    
    try {
      final dob = DateTime.parse(dobStr);
      return DateFormat('dd/MM/yyyy').format(dob);
    } catch (_) {
      return 'Không rõ';
    }
  }

  Color _getSpeciesColor(String species) {
    switch (species.toLowerCase()) {
      case 'dog':
      case 'chó':
        return Colors.orange;
      case 'cat':
      case 'mèo':
        return Colors.purple;
      case 'bird':
      case 'chim':
        return Colors.blue;
      case 'fish':
      case 'cá':
        return Colors.cyan;
      case 'rabbit':
      case 'thỏ':
        return Colors.pink;
      default:
        return Theme.of(context).colorScheme.primary;
    }
  }

  IconData _getSpeciesIcon(String species) {
    switch (species.toLowerCase()) {
      case 'dog':
      case 'chó':
        return FontAwesomeIcons.dog;
      case 'cat':
      case 'mèo':
        return FontAwesomeIcons.cat;
      case 'bird':
      case 'chim':
        return FontAwesomeIcons.dove;
      case 'fish':
      case 'cá':
        return FontAwesomeIcons.fish;
      case 'rabbit':
      case 'thỏ':
        return FontAwesomeIcons.paw;
      default:
        return FontAwesomeIcons.paw;
    }
  }

  String _getSpeciesName(String species) {
    switch (species.toLowerCase()) {
      case 'dog':
      case 'chó':
        return 'Chó';
      case 'cat':
      case 'mèo':
        return 'Mèo';
      case 'bird':
      case 'chim':
        return 'Chim';
      case 'fish':
      case 'cá':
        return 'Cá';
      case 'rabbit':
      case 'thỏ':
        return 'Thỏ';
      default:
        return species;
    }
  }

  String _getSpeciesEmoji(String species) {
    switch (species.toLowerCase()) {
      case 'dog':
      case 'chó':
        return '🐕';
      case 'cat':
      case 'mèo':
        return '🐱';
      case 'bird':
      case 'chim':
        return '🐦';
      case 'fish':
      case 'cá':
        return '🐠';
      case 'rabbit':
      case 'thỏ':
        return '🐰';
      default:
        return '🐾';
    }
  }

  @override
  Widget build(BuildContext context) {
    final name = (pet['name'] as String?) ?? 'Thú cưng';
    final photo = (pet['photoUrl'] as String?) ?? (pet['photo'] as String?);
    final species = (pet['species'] as String?) ?? '';
    final breed = (pet['breed'] as String?) ?? '';
    final gender = (pet['gender'] as String?) ?? '';
    final weight = (pet['weight'] as num?)?.toDouble();
    final color = (pet['color'] as String?) ?? '';
    final description = (pet['description'] as String?) ?? '';
    
    final speciesColor = _getSpeciesColor(species);
    final speciesIcon = _getSpeciesIcon(species);

    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      body: CustomScrollView(
        slivers: [
          // App Bar với ảnh
          SliverAppBar(
            expandedHeight: 300,
            floating: false,
            pinned: true,
            backgroundColor: speciesColor,
            foregroundColor: Colors.white,
            flexibleSpace: FlexibleSpaceBar(
              title: Text(
                name,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 20,
                ),
              ),
              background: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      speciesColor,
                      speciesColor.withOpacity(0.8),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: photo != null
                    ? Stack(
                        fit: StackFit.expand,
                        children: [
                          Image.network(
                            photo,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return _buildDefaultAvatar(speciesIcon, speciesColor);
                            },
                          ),
                          Container(
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                colors: [
                                  Colors.transparent,
                                  speciesColor.withOpacity(0.7),
                                ],
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                              ),
                            ),
                          ),
                        ],
                      )
                    : _buildDefaultAvatar(speciesIcon, speciesColor),
              ),
            ),
            actions: [
              IconButton(
                icon: const FaIcon(FontAwesomeIcons.edit),
                onPressed: () async {
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => EditPetPage(pet: pet),
                    ),
                  );
                  if (result == true) {
                    Navigator.pop(context, true);
                  }
                },
              ),
            ],
          ),
          
          // Tab Bar
          SliverToBoxAdapter(
            child: Container(
              color: Colors.white,
              child: TabBar(
                controller: _tabController,
                labelColor: speciesColor,
                unselectedLabelColor: Colors.grey,
                indicatorColor: speciesColor,
                indicatorWeight: 3,
                tabs: const [
                  Tab(
                    icon: FaIcon(FontAwesomeIcons.idCard, size: 16),
                    text: 'Thông tin',
                  ),
                  Tab(
                    icon: FaIcon(FontAwesomeIcons.heartPulse, size: 16),
                    text: 'Sức khỏe',
                  ),
                  Tab(
                    icon: FaIcon(FontAwesomeIcons.calendarCheck, size: 16),
                    text: 'Lịch sử',
                  ),
                ],
              ),
            ),
          ),
          
          // Tab Content
          SliverFillRemaining(
            child: TabBarView(
              controller: _tabController,
              children: [
                // Tab 1: Thông tin cơ bản
                _buildInfoTab(name, species, breed, gender, weight, color, description, speciesColor, speciesIcon),
                
                // Tab 2: Thông tin sức khỏe
                _buildHealthTab(),
                
                // Tab 3: Lịch sử đặt dịch vụ
                _buildHistoryTab(name),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoTab(String name, String species, String breed, String gender, 
                      double? weight, String color, String description, 
                      Color speciesColor, IconData speciesIcon) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Species badge
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            decoration: BoxDecoration(
              color: speciesColor.withOpacity(0.15),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(
                color: speciesColor.withOpacity(0.3),
              ),
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  _getSpeciesEmoji(species),
                  style: const TextStyle(fontSize: 18),
                ),
                const SizedBox(width: 8),
                FaIcon(
                  speciesIcon,
                  size: 16,
                  color: speciesColor,
                ),
                const SizedBox(width: 8),
                Text(
                  _getSpeciesName(species),
                  style: TextStyle(
                    color: speciesColor,
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Basic Info Section
          _buildInfoSection(
            title: 'Thông tin cơ bản',
            icon: FontAwesomeIcons.idCard,
            color: Colors.blue,
            children: [
              _buildInfoRow('Tên', name, FontAwesomeIcons.tag),
              _buildInfoRow('Loài', _getSpeciesName(species), speciesIcon),
              if (breed.isNotEmpty)
                _buildInfoRow('Giống', breed, FontAwesomeIcons.dna),
              _buildInfoRow(
                'Giới tính', 
                gender == 'Male' ? 'Đực ♂️' : 'Cái ♀️', 
                gender == 'Male' ? FontAwesomeIcons.mars : FontAwesomeIcons.venus,
              ),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Physical Info Section
          _buildInfoSection(
            title: 'Thông tin thể chất',
            icon: FontAwesomeIcons.heartPulse,
            color: Colors.green,
            children: [
              if (weight != null)
                _buildInfoRow('Cân nặng', FormatUtils.formatWeightWithUnit(weight), FontAwesomeIcons.weightScale),
              if (color.isNotEmpty)
                _buildInfoRow('Màu sắc', color, FontAwesomeIcons.palette),
              _buildInfoRow('Tuổi', _getAge(), FontAwesomeIcons.birthdayCake),
              _buildInfoRow('Ngày sinh', _getBirthDate(), FontAwesomeIcons.calendar),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Description Section
          if (description.isNotEmpty)
            _buildInfoSection(
              title: 'Mô tả',
              icon: FontAwesomeIcons.fileText,
              color: Colors.purple,
              children: [
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey.shade200),
                  ),
                  child: Text(
                    description,
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey.shade700,
                      height: 1.5,
                    ),
                  ),
                ),
              ],
            ),
          
          const SizedBox(height: 24),
          
          // Action Buttons
          Row(
            children: [
              Expanded(
                child: _buildActionButton(
                  'Chỉnh sửa',
                  FontAwesomeIcons.edit,
                  Colors.orange,
                  () async {
                    final result = await Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (context) => EditPetPage(pet: pet),
                      ),
                    );
                    if (result == true) {
                      Navigator.pop(context, true);
                    }
                  },
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: _buildActionButton(
                  'Đặt lịch khám',
                  FontAwesomeIcons.calendarPlus,
                  speciesColor,
                  () {
                    // TODO: Navigate to appointment booking
                  },
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildHealthTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Health Info Section
          _buildInfoSection(
            title: 'Thông tin sức khỏe',
            icon: FontAwesomeIcons.heartPulse,
            color: Colors.red,
            children: [
              _buildInfoRow('Tình trạng sức khỏe', 'Tốt', FontAwesomeIcons.checkCircle),
              _buildInfoRow('Lần khám cuối', 'Chưa có', FontAwesomeIcons.calendar),
              _buildInfoRow('Ghi chú y tế', 'Không có', FontAwesomeIcons.noteSticky),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Vaccination Section
          _buildInfoSection(
            title: 'Tiêm phòng',
            icon: FontAwesomeIcons.syringe,
            color: Colors.blue,
            children: [
              _buildInfoRow('Tiêm phòng cơ bản', 'Chưa tiêm', FontAwesomeIcons.calendarXmark),
              _buildInfoRow('Tiêm phòng định kỳ', 'Chưa có lịch', FontAwesomeIcons.calendar),
              _buildInfoRow('Ghi chú tiêm phòng', 'Không có', FontAwesomeIcons.noteSticky),
            ],
          ),
          
          const SizedBox(height: 16),
          
          // Medical Records Section
          _buildInfoSection(
            title: 'Hồ sơ y tế',
            icon: FontAwesomeIcons.fileMedical,
            color: Colors.green,
            children: [
              _buildInfoRow('Số lần khám', '0', FontAwesomeIcons.hospital),
              _buildInfoRow('Chi phí y tế', '0₫', FontAwesomeIcons.moneyBill),
              _buildInfoRow('Ghi chú bệnh án', 'Không có', FontAwesomeIcons.fileText),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildHistoryTab(String petName) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: PetAppointmentHistory(
        petId: pet['petId'] ?? 0,
        petName: petName,
      ),
    );
  }

  Widget _buildDefaultAvatar(IconData icon, Color color) {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            color,
            color.withOpacity(0.8),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Center(
        child: FaIcon(
          icon,
          size: 80,
          color: Colors.white.withOpacity(0.8),
        ),
      ),
    );
  }

  Widget _buildInfoSection({
    required String title,
    required IconData icon,
    required Color color,
    required List<Widget> children,
  }) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 0,
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: color.withOpacity(0.1),
              borderRadius: const BorderRadius.only(
                topLeft: Radius.circular(16),
                topRight: Radius.circular(16),
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: color,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: FaIcon(
                    icon,
                    size: 16,
                    color: Colors.white,
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: color,
                  ),
                ),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              children: children,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value, IconData icon) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        children: [
          FaIcon(
            icon,
            size: 16,
            color: Colors.grey.shade600,
          ),
          const SizedBox(width: 12),
          Expanded(
            flex: 2,
            child: Text(
              label,
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
          Expanded(
            flex: 3,
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Colors.black87,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(String label, IconData icon, Color color, VoidCallback onPressed) {
    return Container(
      height: 50,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.3),
            spreadRadius: 0,
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ElevatedButton.icon(
        onPressed: onPressed,
        icon: FaIcon(icon, size: 16),
        label: Text(
          label,
          style: const TextStyle(
            fontWeight: FontWeight.w600,
            fontSize: 16,
          ),
        ),
        style: ElevatedButton.styleFrom(
          backgroundColor: color,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }
}
