import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';

class PetAgeChart extends StatelessWidget {
  final List<Map<String, dynamic>> pets;
  
  const PetAgeChart({
    super.key,
    required this.pets,
  });

  @override
  Widget build(BuildContext context) {
    final ageData = _calculateAgeData();
    
    if (ageData.isEmpty) {
      return _buildEmptyState();
    }

    return Container(
      padding: const EdgeInsets.all(20),
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
          // Header
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: FaIcon(
                  FontAwesomeIcons.chartPie,
                  color: Theme.of(context).colorScheme.primary,
                  size: 16,
                ),
              ),
              const SizedBox(width: 12),
              const Text(
                'Phân bố tuổi thú cưng',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: Colors.black87,
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          
          // Chart
          SizedBox(
            height: 200,
            child: Row(
              children: [
                // Pie Chart
                Expanded(
                  flex: 2,
                  child: PieChart(
                    PieChartData(
                      sections: _buildPieChartSections(ageData),
                      centerSpaceRadius: 40,
                      sectionsSpace: 2,
                    ),
                  ),
                ),
                
                // Legend
                Expanded(
                  flex: 1,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: _buildLegend(ageData),
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 16),
          
          // Statistics
          _buildStatistics(ageData),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Container(
      padding: const EdgeInsets.all(40),
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
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey.shade100,
              shape: BoxShape.circle,
            ),
            child: FaIcon(
              FontAwesomeIcons.chartPie,
              size: 32,
              color: Colors.grey.shade400,
            ),
          ),
          const SizedBox(height: 16),
          Text(
            'Chưa có dữ liệu',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: Colors.grey.shade600,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Thêm thú cưng để xem thống kê',
            style: TextStyle(
              fontSize: 14,
              color: Colors.grey.shade500,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  List<PieChartSectionData> _buildPieChartSections(Map<String, int> ageData) {
    final colors = [
      Colors.blue,
      Colors.green,
      Colors.orange,
      Colors.red,
      Colors.purple,
      Colors.teal,
    ];

    int colorIndex = 0;
    return ageData.entries.map((entry) {
      final percentage = (entry.value / pets.length) * 100;
      final color = colors[colorIndex % colors.length];
      colorIndex++;
      
      return PieChartSectionData(
        color: color,
        value: entry.value.toDouble(),
        title: '${entry.value}',
        radius: 60,
        titleStyle: const TextStyle(
          fontSize: 12,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
        badgeWidget: Container(
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(4),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Text(
            '${percentage.toStringAsFixed(1)}%',
            style: TextStyle(
              fontSize: 10,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ),
        badgePositionPercentageOffset: 1.3,
      );
    }).toList();
  }

  List<Widget> _buildLegend(Map<String, int> ageData) {
    final colors = [
      Colors.blue,
      Colors.green,
      Colors.orange,
      Colors.red,
      Colors.purple,
      Colors.teal,
    ];

    int colorIndex = 0;
    return ageData.entries.map((entry) {
      final color = colors[colorIndex % colors.length];
      colorIndex++;
      
      return Container(
        margin: const EdgeInsets.only(bottom: 8),
        child: Row(
          children: [
            Container(
              width: 12,
              height: 12,
              decoration: BoxDecoration(
                color: color,
                shape: BoxShape.circle,
              ),
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                entry.key,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            Text(
              '${entry.value}',
              style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: color,
              ),
            ),
          ],
        ),
      );
    }).toList();
  }

  Widget _buildStatistics(Map<String, int> ageData) {
    final totalPets = pets.length;
    final mostPopularGroup = ageData.entries.isNotEmpty 
        ? ageData.entries.reduce((a, b) => a.value > b.value ? a : b).key
        : '';

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _buildStatItem(
                  'Tổng thú cưng',
                  '$totalPets',
                  FontAwesomeIcons.paw,
                  Colors.blue,
                ),
              ),
              Expanded(
                child: _buildStatItem(
                  'Nhóm phổ biến',
                  mostPopularGroup,
                  FontAwesomeIcons.fire,
                  Colors.orange,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        FaIcon(
          icon,
          color: color,
          size: 16,
        ),
        const SizedBox(height: 4),
        Text(
          value,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: color,
          ),
        ),
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: Colors.grey,
          ),
          textAlign: TextAlign.center,
        ),
      ],
    );
  }

  Map<String, int> _calculateAgeData() {
    final Map<String, int> ageGroups = {
      'Dưới 1 tuổi': 0,
      '1-3 tuổi': 0,
      '4-6 tuổi': 0,
      '7-10 tuổi': 0,
      'Trên 10 tuổi': 0,
    };

    for (final pet in pets) {
      final dobStr = pet['dateOfBirth'] as String?;
      if (dobStr != null && dobStr.isNotEmpty) {
        try {
          final dob = DateTime.parse(dobStr);
          final now = DateTime.now();
          final ageInYears = now.difference(dob).inDays / 365.25;
          
          if (ageInYears < 1) {
            ageGroups['Dưới 1 tuổi'] = (ageGroups['Dưới 1 tuổi'] ?? 0) + 1;
          } else if (ageInYears <= 3) {
            ageGroups['1-3 tuổi'] = (ageGroups['1-3 tuổi'] ?? 0) + 1;
          } else if (ageInYears <= 6) {
            ageGroups['4-6 tuổi'] = (ageGroups['4-6 tuổi'] ?? 0) + 1;
          } else if (ageInYears <= 10) {
            ageGroups['7-10 tuổi'] = (ageGroups['7-10 tuổi'] ?? 0) + 1;
          } else {
            ageGroups['Trên 10 tuổi'] = (ageGroups['Trên 10 tuổi'] ?? 0) + 1;
          }
        } catch (e) {
          // Skip invalid dates
        }
      }
    }

    // Remove empty groups
    ageGroups.removeWhere((key, value) => value == 0);
    
    return ageGroups;
  }
}
