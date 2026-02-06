class FormatUtils {
  /// Formats weight to display as integer if it's a whole number, otherwise with 1 decimal place
  static String formatWeight(double weight) {
    if (weight % 1 == 0) {
      return weight.toInt().toString();
    } else {
      return weight.toStringAsFixed(1);
    }
  }

  /// Formats weight with unit (kg)
  static String formatWeightWithUnit(double weight) {
    return '${formatWeight(weight)} kg';
  }

  /// Parses weight from string, returns null if invalid
  static double? parseWeight(String? weightStr) {
    if (weightStr == null || weightStr.trim().isEmpty) return null;
    
    final weight = double.tryParse(weightStr.trim());
    if (weight == null || weight <= 0 || weight > 200) return null;
    
    return weight;
  }

  /// Validates weight input
  static String? validateWeight(String? value) {
    if (value == null || value.trim().isEmpty) return null;
    
    final weight = double.tryParse(value.trim());
    if (weight == null) {
      return 'Cân nặng không hợp lệ';
    }
    if (weight <= 0) {
      return 'Cân nặng phải lớn hơn 0';
    }
    if (weight > 200) {
      return 'Cân nặng quá lớn (tối đa 200kg)';
    }
    
    return null;
  }

  /// Formats DateTime to time string (HH:mm)
  static String formatTime(DateTime dateTime) {
    return '${dateTime.hour.toString().padLeft(2, '0')}:${dateTime.minute.toString().padLeft(2, '0')}';
  }

  /// Formats DateTime to date string (dd/MM/yyyy)
  static String formatDate(DateTime dateTime) {
    return '${dateTime.day.toString().padLeft(2, '0')}/${dateTime.month.toString().padLeft(2, '0')}/${dateTime.year}';
  }

  /// Formats DateTime to full date time string (dd/MM/yyyy HH:mm)
  static String formatDateTime(DateTime dateTime) {
    return '${formatDate(dateTime)} ${formatTime(dateTime)}';
  }
}
