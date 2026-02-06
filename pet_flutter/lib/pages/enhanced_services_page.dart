import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:intl/intl.dart';
import 'package:lottie/lottie.dart';
import 'package:pet_flutter/services/service_service.dart';
import 'package:pet_flutter/widgets/shimmer_placeholders.dart';
import 'package:pet_flutter/pages/appointment_booking_page.dart';
import 'package:pet_flutter/pages/service_detail_page.dart';

class EnhancedServicesPage extends StatefulWidget {
  const EnhancedServicesPage({super.key});
  
  @override
  State<EnhancedServicesPage> createState() => _EnhancedServicesPageState();
}

class _EnhancedServicesPageState extends State<EnhancedServicesPage> {
  bool _loading = true;
  String? _error;
  List<Map<String, dynamic>> _items = const [];
  List<Map<String, dynamic>> _filteredItems = const [];
  String _searchQuery = '';
  String _selectedCategory = 'all';
  String _sortBy = 'popular'; // popular, price_low, price_high, rating
  double _minPrice = 0;
  double _maxPrice = 1000000;
  String _selectedDuration = 'all';
  final TextEditingController _searchController = TextEditingController();

  final List<Map<String, String>> _categories = [
    {'id': 'all', 'name': 'Tất cả', 'icon': 'paw', 'emoji': '🐾'},
    {'id': 'grooming', 'name': 'Grooming', 'icon': 'scissors', 'emoji': '🐕'},
    {'id': 'medical', 'name': 'Y tế', 'icon': 'stethoscope', 'emoji': '💉'},
    {'id': 'hotel', 'name': 'Khách sạn', 'icon': 'hotel', 'emoji': '🏨'},
    {'id': 'food', 'name': 'Thức ăn', 'icon': 'utensils', 'emoji': '🍖'},
  ];

  final List<Map<String, dynamic>> _durationFilters = [
    {'id': 'all', 'name': 'Tất cả', 'value': null},
    {'id': '30', 'name': '30 phút', 'value': 30},
    {'id': '60', 'name': '1 giờ', 'value': 60},
    {'id': '120', 'name': '2 giờ', 'value': 120},
    {'id': '180', 'name': '3 giờ', 'value': 180},
  ];

  final List<Map<String, dynamic>> _sortOptions = [
    {'id': 'popular', 'name': 'Phổ biến', 'icon': FontAwesomeIcons.fire},
    {'id': 'rating', 'name': 'Đánh giá cao', 'icon': FontAwesomeIcons.star},
    {'id': 'price_low', 'name': 'Giá thấp', 'icon': FontAwesomeIcons.arrowDown},
    {'id': 'price_high', 'name': 'Giá cao', 'icon': FontAwesomeIcons.arrowUp},
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final svc = ServiceService();
      final data = await svc.getFilteredServices(
        category: _selectedCategory != 'all' ? _selectedCategory : null,
        minPrice: _minPrice > 0 ? _minPrice : null,
        maxPrice: _maxPrice < 1000000 ? _maxPrice : null,
        duration: _selectedDuration != 'all' ? 
          (_durationFilters.firstWhere((d) => d['id'] == _selectedDuration)['value'] as int?) : null,
        sortBy: _sortBy,
      );
      setState(() {
        _items = data;
        _filteredItems = data;
      });
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  void _applyFilters() {
    // Reload data with new filters
    _load();
  }

  void _applySorting() {
    // Sorting is now handled by the API
    _load();
  }

  void _onSearchChanged(String query) {
    setState(() {
      _searchQuery = query;
    });
    // For now, we'll do local search filtering
    // In the future, this could be moved to API as well
    _applyLocalSearch();
  }

  void _applyLocalSearch() {
    setState(() {
      _filteredItems = _items.where((service) {
        final matchesSearch = _searchQuery.isEmpty ||
            (service['name'] as String? ?? '').toLowerCase().contains(_searchQuery.toLowerCase()) ||
            (service['description'] as String? ?? '').toLowerCase().contains(_searchQuery.toLowerCase());
        
        return matchesSearch;
      }).toList();
    });
  }

  void _onCategoryChanged(String category) {
    setState(() {
      _selectedCategory = category;
    });
    _applyFilters();
  }

  void _onSortChanged(String sortBy) {
    setState(() {
      _sortBy = sortBy;
    });
    _applySorting();
  }

  @override
  Widget build(BuildContext context) {
    Widget body;
    
    if (_loading) {
      body = _buildShimmerBody();
    } else if (_error != null) {
      body = _buildErrorState();
    } else {
      body = _buildContent();
    }
    
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: const Text('Dịch vụ'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        elevation: 0,
        actions: [
          IconButton(
            icon: const FaIcon(FontAwesomeIcons.arrowsRotate),
            onPressed: _load,
          ),
          IconButton(
            icon: const FaIcon(FontAwesomeIcons.sliders),
            onPressed: _showFilterDialog,
          ),
        ],
      ),
      body: body,
    );
  }

  Widget _buildShimmerBody() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          // Search bar shimmer
          ShimmerInputField(
            width: double.infinity,
            height: 50,
            margin: const EdgeInsets.only(bottom: 16),
          ),
          
          // Categories shimmer
          ShimmerText(width: 100, height: 20, margin: const EdgeInsets.only(bottom: 12)),
          SingleChildScrollView(
            scrollDirection: Axis.horizontal,
            child: Row(
              children: List.generate(5, (index) => Container(
                margin: EdgeInsets.only(right: index < 4 ? 8 : 0),
                child: ShimmerButton(
                  width: 80,
                  height: 40,
                ),
              )),
            ),
          ),
          const SizedBox(height: 20),
          
          // Services shimmer
          ...List.generate(3, (index) => Container(
            margin: const EdgeInsets.only(bottom: 20),
            child: ShimmerCard(
              width: double.infinity,
              height: 200,
            ),
          )),
        ],
      ),
    );
  }

  Widget _buildErrorState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          FaIcon(
            FontAwesomeIcons.triangleExclamation,
            size: 64,
            color: Colors.red.shade300,
          ),
          const SizedBox(height: 16),
          Text(
            'Có lỗi xảy ra',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: Colors.red.shade600,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            _error!,
            style: TextStyle(color: Colors.red.shade500),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 16),
          ElevatedButton.icon(
            onPressed: _load,
            icon: const FaIcon(FontAwesomeIcons.arrowsRotate),
            label: const Text('Thử lại'),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    return Column(
      children: [
        // Enhanced Search and filters section
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.08),
                spreadRadius: 0,
                blurRadius: 20,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Column(
            children: [
              // Enhanced Search bar
              Container(
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.grey.withOpacity(0.1),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: TextField(
                  controller: _searchController,
                  onChanged: _onSearchChanged,
                  decoration: InputDecoration(
                    hintText: 'Tìm kiếm dịch vụ...',
                    hintStyle: TextStyle(
                      color: Colors.grey.shade500,
                      fontSize: 16,
                    ),
                    prefixIcon: Container(
                      padding: const EdgeInsets.all(12),
                      child: FaIcon(
                        FontAwesomeIcons.magnifyingGlass,
                        size: 18,
                        color: Colors.grey.shade600,
                      ),
                    ),
                    suffixIcon: _searchQuery.isNotEmpty
                        ? Container(
                            margin: const EdgeInsets.only(right: 8),
                            child: IconButton(
                              icon: Container(
                                padding: const EdgeInsets.all(6),
                                decoration: BoxDecoration(
                                  color: Colors.grey.shade200,
                                  shape: BoxShape.circle,
                                ),
                                child: FaIcon(
                                  FontAwesomeIcons.xmark,
                                  size: 12,
                                  color: Colors.grey.shade600,
                                ),
                              ),
                              onPressed: () {
                                _searchController.clear();
                                _onSearchChanged('');
                              },
                            ),
                          )
                        : null,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none,
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide.none,
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(16),
                      borderSide: BorderSide(
                        color: Theme.of(context).colorScheme.primary,
                        width: 2,
                      ),
                    ),
                    filled: true,
                    fillColor: Colors.grey.shade50,
                    contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  ),
                ),
              ),
              const SizedBox(height: 20),
              
              // Enhanced Category filters
              SizedBox(
                height: 60,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  itemCount: _categories.length,
                  itemBuilder: (context, index) {
                    final category = _categories[index];
                    final isSelected = _selectedCategory == category['id'];
                    return _buildEnhancedCategoryChip(category, isSelected);
                  },
                ),
              ),
              
              // Enhanced Sort and filter info
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: _buildEnhancedSortChip(),
                  ),
                  const SizedBox(width: 12),
                  _buildEnhancedFilterInfoChip(),
                ],
              ),
            ],
          ),
        ),
        
        // Enhanced Services list with animations
        Expanded(
          child: _filteredItems.isEmpty
              ? _buildEmptyState()
              : RefreshIndicator(
                  onRefresh: _load,
                  color: Theme.of(context).colorScheme.primary,
                  backgroundColor: Colors.white,
                  child: AnimatedList(
                    padding: const EdgeInsets.all(20),
                    initialItemCount: _filteredItems.length,
                    itemBuilder: (context, index, animation) {
                      final service = _filteredItems[index];
                      return SlideTransition(
                        position: animation.drive(
                          Tween<Offset>(
                            begin: const Offset(0, 0.3),
                            end: Offset.zero,
                          ).chain(CurveTween(curve: Curves.easeOutCubic)),
                        ),
                        child: FadeTransition(
                          opacity: animation,
                          child: _buildEnhancedServiceCard(context, service),
                        ),
                      );
                    },
                  ),
                ),
        ),
      ],
    );
  }

  Widget _buildEnhancedSortChip() {
    final currentSort = _sortOptions.firstWhere((s) => s['id'] == _sortBy);
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: FilterChip(
        selected: true,
        label: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            FaIcon(
              currentSort['icon'],
              size: 14,
              color: Theme.of(context).colorScheme.primary,
            ),
            const SizedBox(width: 8),
            Text(
              currentSort['name'],
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
          ],
        ),
        onSelected: (selected) => _showSortDialog(),
        backgroundColor: Theme.of(context).colorScheme.primary.withOpacity(0.1),
        selectedColor: Theme.of(context).colorScheme.primary.withOpacity(0.2),
        checkmarkColor: Theme.of(context).colorScheme.primary,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),
    );
  }

  Widget _buildEnhancedFilterInfoChip() {
    int activeFilters = 0;
    if (_selectedCategory != 'all') activeFilters++;
    if (_selectedDuration != 'all') activeFilters++;
    if (_minPrice > 0 || _maxPrice < 1000000) activeFilters++;
    
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: activeFilters > 0 
                ? Colors.orange.withOpacity(0.2)
                : Colors.grey.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: FilterChip(
        selected: activeFilters > 0,
        label: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            FaIcon(
              FontAwesomeIcons.sliders,
              size: 14,
              color: activeFilters > 0 ? Colors.orange : Colors.grey.shade600,
            ),
            const SizedBox(width: 8),
            Text(
              'Bộ lọc${activeFilters > 0 ? ' ($activeFilters)' : ''}',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: activeFilters > 0 ? Colors.orange : Colors.grey.shade700,
              ),
            ),
          ],
        ),
        onSelected: (selected) => _showFilterDialog(),
        backgroundColor: activeFilters > 0 
            ? Colors.orange.withOpacity(0.1)
            : Colors.grey.shade100,
        selectedColor: Colors.orange.withOpacity(0.2),
        checkmarkColor: Colors.orange,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      ),
    );
  }

  Widget _buildEnhancedCategoryChip(Map<String, String> category, bool isSelected) {
    final color = _getCategoryColor(category['id']!);
    return Container(
      margin: const EdgeInsets.only(right: 16),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          boxShadow: [
            BoxShadow(
              color: isSelected 
                  ? color.withOpacity(0.3)
                  : Colors.grey.withOpacity(0.1),
              blurRadius: isSelected ? 12 : 6,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: FilterChip(
          selected: isSelected,
          label: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: isSelected ? color.withOpacity(0.2) : Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  category['emoji']!,
                  style: const TextStyle(fontSize: 18),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                category['name']!,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                  color: isSelected ? color : Colors.grey.shade700,
                ),
              ),
            ],
          ),
          onSelected: (selected) {
            _onCategoryChanged(category['id']!);
          },
          backgroundColor: isSelected 
              ? color.withOpacity(0.1)
              : Colors.grey.shade50,
          selectedColor: color.withOpacity(0.2),
          checkmarkColor: color,
          side: BorderSide(
            color: isSelected ? color : Colors.grey.shade300,
            width: isSelected ? 2 : 1,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20),
          ),
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(40),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [
                  Colors.grey.shade100,
                  Colors.grey.shade50,
                ],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.1),
                  blurRadius: 20,
                  spreadRadius: 5,
                ),
              ],
            ),
            child: FaIcon(
              FontAwesomeIcons.magnifyingGlass,
              size: 56,
              color: Colors.grey.shade400,
            ),
          ),
          const SizedBox(height: 32),
          Text(
            _searchQuery.isNotEmpty ? 'Không tìm thấy dịch vụ' : 'Chưa có dịch vụ nào',
            style: Theme.of(context).textTheme.headlineSmall?.copyWith(
              color: Colors.grey.shade700,
              fontWeight: FontWeight.bold,
              fontSize: 24,
            ),
          ),
          const SizedBox(height: 12),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            decoration: BoxDecoration(
              color: Colors.grey.shade50,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              _searchQuery.isNotEmpty 
                  ? 'Thử tìm kiếm với từ khóa khác'
                  : 'Danh sách dịch vụ sẽ xuất hiện ở đây',
              style: TextStyle(
                color: Colors.grey.shade600,
                fontSize: 16,
                height: 1.5,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          if (_searchQuery.isNotEmpty) ...[
            const SizedBox(height: 24),
            ElevatedButton.icon(
              onPressed: () {
                _searchController.clear();
                _onSearchChanged('');
              },
              icon: const FaIcon(FontAwesomeIcons.rotateLeft, size: 16),
              label: const Text('Xóa bộ lọc'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Theme.of(context).colorScheme.primary,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(16),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildEnhancedServiceCard(BuildContext context, Map<String, dynamic> service) {
    final name = (service['name'] as String?) ?? 'Dịch vụ';
    final description = (service['description'] as String?) ?? '';
    final price = (service['price'] as num?)?.toDouble() ?? 0;
    final duration = service['duration'] ?? 0;
    final photo = service['photo'] as String?;
    final category = (service['category'] as String?) ?? 'general';
    final rating = (service['rating'] as num?)?.toDouble() ?? 0;
    final reviewCount = (service['reviewCount'] as num?)?.toInt() ?? 0;
    final bookingCount = (service['bookingCount'] as num?)?.toInt() ?? 0;
    
    final priceFormat = NumberFormat.currency(symbol: '₫');
    final categoryColor = _getCategoryColor(category);
    final categoryIcon = _getCategoryIcon(category);
    
    return TweenAnimationBuilder<double>(
      duration: const Duration(milliseconds: 300),
      tween: Tween(begin: 0.0, end: 1.0),
      builder: (context, value, child) {
        return Transform.scale(
          scale: 0.8 + (0.2 * value),
          child: Opacity(
            opacity: value,
            child: Container(
              margin: const EdgeInsets.only(bottom: 24),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: categoryColor.withOpacity(0.1),
                    spreadRadius: 0,
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                  BoxShadow(
                    color: Colors.grey.withOpacity(0.05),
                    spreadRadius: 0,
                    blurRadius: 10,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Material(
                color: Colors.transparent,
                child: InkWell(
                  borderRadius: BorderRadius.circular(24),
                  onTap: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (_) => const AppointmentBookingPage(),
                      ),
                    );
                  },
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Enhanced Image Section
                      Container(
                        height: 180,
                        decoration: BoxDecoration(
                          borderRadius: const BorderRadius.only(
                            topLeft: Radius.circular(24),
                            topRight: Radius.circular(24),
                          ),
                          gradient: LinearGradient(
                            colors: [
                              categoryColor.withOpacity(0.1),
                              categoryColor.withOpacity(0.3),
                              categoryColor,
                            ],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                        ),
                        child: Stack(
                          children: [
                            // Background image or enhanced placeholder
                            if (photo != null && photo.isNotEmpty)
                              ClipRRect(
                                borderRadius: const BorderRadius.only(
                                  topLeft: Radius.circular(24),
                                  topRight: Radius.circular(24),
                                ),
                                child: Image.network(
                                  photo,
                                  width: double.infinity,
                                  height: 180,
                                  fit: BoxFit.cover,
                                  errorBuilder: (context, error, stackTrace) {
                                    return _buildEnhancedImagePlaceholder(categoryIcon, categoryColor);
                                  },
                                ),
                              )
                            else
                              _buildEnhancedImagePlaceholder(categoryIcon, categoryColor),
                            
                            // Enhanced gradient overlay
                            Container(
                              decoration: BoxDecoration(
                                borderRadius: const BorderRadius.only(
                                  topLeft: Radius.circular(24),
                                  topRight: Radius.circular(24),
                                ),
                                gradient: LinearGradient(
                                  colors: [
                                    Colors.transparent,
                                    Colors.black.withOpacity(0.4),
                                  ],
                                  begin: Alignment.topCenter,
                                  end: Alignment.bottomCenter,
                                ),
                              ),
                            ),
                            
                            // Enhanced Category badge
                            Positioned(
                              top: 16,
                              left: 16,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(25),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.1),
                                      blurRadius: 8,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    FaIcon(
                                      categoryIcon,
                                      size: 14,
                                      color: categoryColor,
                                    ),
                                    const SizedBox(width: 6),
                                    Text(
                                      _getCategoryName(category),
                                      style: TextStyle(
                                        fontSize: 13,
                                        fontWeight: FontWeight.w700,
                                        color: categoryColor,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                            
                            // Enhanced Price badge
                            Positioned(
                              top: 16,
                              right: 16,
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(25),
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.1),
                                      blurRadius: 8,
                                      offset: const Offset(0, 2),
                                    ),
                                  ],
                                ),
                                child: Text(
                                  'Từ ${priceFormat.format(price)}',
                                  style: TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.w700,
                                    color: categoryColor,
                                  ),
                                ),
                              ),
                            ),
                            
                            // Enhanced Popularity indicator with fire animation
                            if (bookingCount > 10)
                              Positioned(
                                bottom: 16,
                                right: 16,
                                child: _buildAnimatedFireBadge(),
                              ),
                          ],
                        ),
                      ),
                      
                      // Enhanced Content Section
                      Padding(
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Enhanced Title and rating
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    name,
                                    style: const TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: Colors.black87,
                                      height: 1.2,
                                    ),
                                  ),
                                ),
                                if (rating > 0) ...[
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: Colors.amber.withOpacity(0.1),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        const FaIcon(
                                          FontAwesomeIcons.star,
                                          size: 12,
                                          color: Colors.amber,
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          rating.toStringAsFixed(1),
                                          style: TextStyle(
                                            fontSize: 12,
                                            fontWeight: FontWeight.w700,
                                            color: Colors.grey.shade800,
                                          ),
                                        ),
                                        const SizedBox(width: 4),
                                        Text(
                                          '($reviewCount)',
                                          style: TextStyle(
                                            fontSize: 11,
                                            color: Colors.grey.shade500,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ],
                            ),
                            
                            const SizedBox(height: 12),
                            
                            // Enhanced Description
                            Text(
                              description,
                              style: TextStyle(
                                fontSize: 15,
                                color: Colors.grey.shade600,
                                height: 1.5,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                            
                            const SizedBox(height: 16),
                            
                            // Enhanced Duration and booking info
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: Colors.grey.shade50,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                children: [
                                  FaIcon(
                                    FontAwesomeIcons.clock,
                                    size: 14,
                                    color: Colors.grey.shade600,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    '$duration phút',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.grey.shade700,
                                    ),
                                  ),
                                  const SizedBox(width: 20),
                                  FaIcon(
                                    FontAwesomeIcons.calendarCheck,
                                    size: 14,
                                    color: Colors.grey.shade600,
                                  ),
                                  const SizedBox(width: 8),
                                  Text(
                                    '$bookingCount lượt đặt',
                                    style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w600,
                                      color: Colors.grey.shade700,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            
                            const SizedBox(height: 20),
                            
                            // Enhanced Book button & Detail button
                            Row(
                              children: [
                                // Chi tiết button
                                Expanded(
                                  flex: 2,
                                  child: OutlinedButton.icon(
                                    onPressed: () {
                                      Navigator.of(context).push(
                                        MaterialPageRoute(
                                          builder: (_) => ServiceDetailPage(service: service),
                                        ),
                                      );
                                    },
                                    icon: const FaIcon(FontAwesomeIcons.circleInfo, size: 16),
                                    label: const Text(
                                      'Chi tiết',
                                      style: TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                    style: OutlinedButton.styleFrom(
                                      foregroundColor: categoryColor,
                                      side: BorderSide(color: categoryColor, width: 2),
                                      padding: const EdgeInsets.symmetric(vertical: 14),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                // Đặt ngay button
                                Expanded(
                                  flex: 3,
                                  child: ElevatedButton.icon(
                                    onPressed: () {
                                      Navigator.of(context).push(
                                        MaterialPageRoute(
                                          builder: (_) => const AppointmentBookingPage(),
                                        ),
                                      );
                                    },
                                    icon: const FaIcon(FontAwesomeIcons.calendarPlus, size: 16),
                                    label: const Text(
                                      'Đặt ngay',
                                      style: TextStyle(
                                        fontSize: 15,
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: categoryColor,
                                      foregroundColor: Colors.white,
                                      padding: const EdgeInsets.symmetric(vertical: 14),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(16),
                                      ),
                                      elevation: 0,
                                      shadowColor: categoryColor.withOpacity(0.3),
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
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildEnhancedImagePlaceholder(IconData icon, Color color) {
    return Container(
      width: double.infinity,
      height: 180,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            color.withOpacity(0.1),
            color.withOpacity(0.2),
            color.withOpacity(0.3),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: const BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.9),
                shape: BoxShape.circle,
                boxShadow: [
                  BoxShadow(
                    color: color.withOpacity(0.2),
                    blurRadius: 15,
                    spreadRadius: 2,
                  ),
                ],
              ),
              child: FaIcon(
                icon,
                size: 40,
                color: color,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'Dịch vụ ${_getCategoryName(icon.toString())}',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAnimatedFireBadge() {
    return _FireBadgeWidget();
  }

  void _showSortDialog() {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(16),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Sắp xếp theo',
              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ..._sortOptions.map((option) => ListTile(
              leading: FaIcon(
                option['icon'],
                color: _sortBy == option['id'] 
                    ? Theme.of(context).colorScheme.primary 
                    : Colors.grey.shade600,
              ),
              title: Text(option['name']),
              trailing: _sortBy == option['id'] 
                  ? FaIcon(
                      FontAwesomeIcons.check,
                      color: Theme.of(context).colorScheme.primary,
                      size: 16,
                    )
                  : null,
              onTap: () {
                _onSortChanged(option['id']);
                Navigator.pop(context);
              },
            )),
          ],
        ),
      ),
    );
  }

  void _showFilterDialog() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) => Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Bộ lọc',
                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              
              // Duration filter
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Thời gian',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: _durationFilters.map((duration) {
                  final isSelected = _selectedDuration == duration['id'];
                  return FilterChip(
                    selected: isSelected,
                    label: Text(duration['name']),
                    onSelected: (selected) {
                      setModalState(() {
                        _selectedDuration = duration['id'];
                      });
                    },
                  );
                }).toList(),
              ),
              
              const SizedBox(height: 16),
              
              // Price range
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Khoảng giá',
                  style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      decoration: InputDecoration(
                        labelText: 'Từ',
                        prefixText: '₫',
                        border: const OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.number,
                      onChanged: (value) {
                        final price = double.tryParse(value) ?? 0;
                        setModalState(() {
                          _minPrice = price;
                        });
                      },
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: TextField(
                      decoration: InputDecoration(
                        labelText: 'Đến',
                        prefixText: '₫',
                        border: const OutlineInputBorder(),
                      ),
                      keyboardType: TextInputType.number,
                      onChanged: (value) {
                        final price = double.tryParse(value) ?? 1000000;
                        setModalState(() {
                          _maxPrice = price;
                        });
                      },
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 24),
              
              // Apply button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    _applyFilters();
                    Navigator.pop(context);
                  },
                  child: const Text('Áp dụng bộ lọc'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _getCategoryColor(String category) {
    switch (category.toLowerCase()) {
      case 'grooming':
        return Colors.orange;
      case 'medical':
        return Colors.red;
      case 'hotel':
        return Colors.blue;
      case 'food':
        return Colors.green;
      default:
        return Colors.purple;
    }
  }

  IconData _getCategoryIcon(String category) {
    switch (category.toLowerCase()) {
      case 'grooming':
        return FontAwesomeIcons.scissors;
      case 'medical':
        return FontAwesomeIcons.stethoscope;
      case 'hotel':
        return FontAwesomeIcons.hotel;
      case 'food':
        return FontAwesomeIcons.utensils;
      default:
        return FontAwesomeIcons.paw;
    }
  }

  String _getCategoryName(String category) {
    switch (category.toLowerCase()) {
      case 'grooming':
        return 'Grooming';
      case 'medical':
        return 'Y tế';
      case 'hotel':
        return 'Khách sạn';
      case 'food':
        return 'Thức ăn';
      default:
        return 'Khác';
    }
  }
}

class _FireBadgeWidget extends StatefulWidget {
  @override
  _FireBadgeWidgetState createState() => _FireBadgeWidgetState();
}

class _FireBadgeWidgetState extends State<_FireBadgeWidget>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _glowController;
  late Animation<double> _pulseAnimation;
  late Animation<double> _glowAnimation;

  @override
  void initState() {
    super.initState();
    
    // Pulse animation for the fire icon
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    _pulseAnimation = Tween<double>(
      begin: 0.9,
      end: 1.1,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));
    
    // Glow animation for the shadow
    _glowController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _glowAnimation = Tween<double>(
      begin: 0.3,
      end: 0.8,
    ).animate(CurvedAnimation(
      parent: _glowController,
      curve: Curves.easeInOut,
    ));
    
    // Start animations
    _pulseController.repeat(reverse: true);
    _glowController.repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _glowController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([_pulseAnimation, _glowAnimation]),
      builder: (context, child) {
        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 12),
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [
                Colors.orange,
                Colors.deepOrange,
                Colors.red.shade600,
                Colors.red.shade700,
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
            borderRadius: BorderRadius.circular(25),
            boxShadow: [
              // Main glow shadow
              BoxShadow(
                color: Colors.orange.withOpacity(0.4 + (0.3 * _glowAnimation.value)),
                blurRadius: 15 + (8 * _glowAnimation.value),
                spreadRadius: 2 + (2 * _glowAnimation.value),
                offset: const Offset(0, 4),
              ),
              // Secondary red glow
              BoxShadow(
                color: Colors.red.withOpacity(0.2 + (0.2 * _glowAnimation.value)),
                blurRadius: 25 + (10 * _glowAnimation.value),
                spreadRadius: 1,
                offset: const Offset(0, 2),
              ),
              // Inner glow effect
              BoxShadow(
                color: Colors.white.withOpacity(0.1),
                blurRadius: 5,
                spreadRadius: -1,
                offset: const Offset(0, 1),
              ),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Enhanced Lottie fire animation - BIGGER SIZE
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: Colors.orange.withOpacity(0.4),
                      blurRadius: 12,
                      spreadRadius: 2,
                    ),
                    BoxShadow(
                      color: Colors.red.withOpacity(0.2),
                      blurRadius: 20,
                      spreadRadius: 1,
                    ),
                  ],
                ),
                child: ClipOval(
                  child: Lottie.asset(
                    'assets/animations/fire.json',
                    fit: BoxFit.contain,
                    repeat: true,
                    animate: true,
                    frameRate: FrameRate.max,
                    errorBuilder: (context, error, stackTrace) {
                      // Fallback to FontAwesome icon if Lottie fails
                      return Transform.scale(
                        scale: _pulseAnimation.value,
                        child: Transform.rotate(
                          angle: 0.1 * _pulseAnimation.value,
                          child: FaIcon(
                            FontAwesomeIcons.fire,
                            size: 24,
                            color: Colors.white,
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Text(
                'Phổ biến',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w900,
                  color: Colors.white,
                  letterSpacing: 0.5,
                  shadows: [
                    Shadow(
                      color: Colors.black.withOpacity(0.4),
                      blurRadius: 3,
                      offset: const Offset(0, 1),
                    ),
                    Shadow(
                      color: Colors.orange.withOpacity(0.3),
                      blurRadius: 6,
                      offset: const Offset(0, 0),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
