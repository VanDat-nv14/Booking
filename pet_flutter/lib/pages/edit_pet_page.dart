import 'dart:io';

import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:image_picker/image_picker.dart';
import 'package:pet_flutter/services/pet_service.dart';
import 'package:pet_flutter/services/secure_storage.dart';
import 'package:pet_flutter/utils/format_utils.dart';
import 'package:pet_flutter/utils/onesignal_notification_helper.dart';

class EditPetPage extends StatefulWidget {
  const EditPetPage({super.key, required this.pet});

  final Map<String, dynamic> pet;

  @override
  State<EditPetPage> createState() => _EditPetPageState();
}

class _EditPetPageState extends State<EditPetPage> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  String _species = 'Dog';
  final _breedController = TextEditingController();
  String _gender = 'Male';
  final _colorController = TextEditingController();
  final _weightController = TextEditingController();
  final _descController = TextEditingController();
  DateTime? _birthDate;
  File? _photo;

  bool _saving = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    final p = widget.pet;
    _nameController = TextEditingController(text: p['name'] as String? ?? '');
    _species = _normalizeSpecies(p['species'] as String?);
    _breedController.text = p['breed'] as String? ?? '';
    _gender = _normalizeGender(p['gender'] as String?);
    _colorController.text = p['color'] as String? ?? '';
    final w = (p['weight'] as num?)?.toDouble();
    _weightController.text = w != null ? FormatUtils.formatWeight(w) : '';
    _descController.text = p['description'] as String? ?? '';
    final dob = p['dateOfBirth'] as String?;
    if (dob != null && dob.isNotEmpty) {
      try {
        _birthDate = DateTime.parse(dob);
      } catch (_) {}
    }
  }

  String _normalizeSpecies(String? value) {
    final v = (value ?? 'Dog').trim();
    final lower = v.toLowerCase();
    if (v == 'Dog' || v == 'Cat') return v;
    if (lower.contains('chó') || lower.contains('cho')) return 'Dog';
    if (lower.contains('mèo') ||
        lower.contains('meo') ||
        lower.contains('mèo')) {
      return 'Cat';
    }
    return 'Dog';
  }

  String _normalizeGender(String? value) {
    final v = (value ?? 'Male').trim();
    final lower = v.toLowerCase();
    if (v == 'Male' || v == 'Female') return v;
    if (lower.contains('đực') ||
        lower.contains('duc') ||
        lower.contains('male')) {
      return 'Male';
    }
    if (lower.contains('cái') ||
        lower.contains('cai') ||
        lower.contains('female')) {
      return 'Female';
    }
    return 'Male';
  }

  @override
  void dispose() {
    _nameController.dispose();
    _breedController.dispose();
    _colorController.dispose();
    _weightController.dispose();
    _descController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final xfile = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 85,
    );
    if (xfile != null) {
      setState(() {
        _photo = File(xfile.path);
      });
    }
  }

  Future<void> _pickDate() async {
    final now = DateTime.now();
    final picked = await showDatePicker(
      context: context,
      initialDate: _birthDate ?? DateTime(now.year - 1),
      firstDate: DateTime(2000),
      lastDate: now,
    );
    if (picked != null) {
      setState(() {
        _birthDate = picked;
      });
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() {
      _saving = true;
      _error = null;
    });
    try {
      final token = await SecureStorageService().readToken();
      if (token == null) throw Exception('Bạn chưa đăng nhập');
      final petService = PetService();
      await petService.updatePet(
        id: (widget.pet['petId'] as num).toInt(),
        token: token,
        name: _nameController.text.trim(),
        species: _species,
        breed: _breedController.text.trim().isEmpty
            ? null
            : _breedController.text.trim(),
        gender: _gender,
        color: _colorController.text.trim().isEmpty
            ? null
            : _colorController.text.trim(),
        birthDate: _birthDate,
        weight: FormatUtils.parseWeight(_weightController.text),
        description: _descController.text.trim().isEmpty
            ? null
            : _descController.text.trim(),
        photo: _photo,
      );

      // 🔔 Gửi OneSignal notification khi cập nhật thành công
      await OneSignalNotificationHelper.sendPetUpdateNotification(
        petName: _nameController.text.trim(),
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('✅ Đã cập nhật thú cưng và gửi thông báo!'),
          ),
        );
        Navigator.of(context).pop(true);
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          _saving = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: const Text('Sửa thú cưng'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // Header
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Theme.of(context).colorScheme.primary.withOpacity(0.1),
                      Theme.of(context).colorScheme.primary.withOpacity(0.05),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Theme.of(context).colorScheme.primary,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const FaIcon(
                        FontAwesomeIcons.paw,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Chỉnh sửa thông tin thú cưng',
                            style: Theme.of(context).textTheme.headlineSmall
                                ?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: Theme.of(context).colorScheme.primary,
                                ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Cập nhật thông tin chi tiết của thú cưng',
                            style: Theme.of(context).textTheme.bodyMedium
                                ?.copyWith(color: Colors.grey.shade600),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Error message
              if (_error != null)
                Container(
                  margin: const EdgeInsets.only(bottom: 16),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.red.shade200),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.error_outline,
                        color: Colors.red.shade600,
                        size: 20,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          _error!,
                          style: TextStyle(color: Colors.red.shade700),
                        ),
                      ),
                    ],
                  ),
                ),

              // Photo section
              _buildPhotoSection(context),
              const SizedBox(height: 24),

              // Basic info section
              _buildSection(
                context,
                title: 'Thông tin cơ bản',
                icon: Icons.info_outline,
                children: [
                  _buildTextField(
                    context,
                    controller: _nameController,
                    label: 'Tên thú cưng',
                    icon: Icons.pets,
                    validator: (v) => (v == null || v.trim().isEmpty)
                        ? 'Vui lòng nhập tên'
                        : null,
                  ),
                  const SizedBox(height: 16),
                  _buildDropdownField(
                    context,
                    value: _species,
                    label: 'Loài',
                    icon: Icons.category,
                    items: const [
                      DropdownMenuItem(value: 'Dog', child: Text('Chó')),
                      DropdownMenuItem(value: 'Cat', child: Text('Mèo')),
                    ],
                    onChanged: (v) => setState(() => _species = v ?? 'Dog'),
                  ),
                  const SizedBox(height: 16),
                  _buildTextField(
                    context,
                    controller: _breedController,
                    label: 'Giống (tuỳ chọn)',
                    icon: Icons.pets,
                  ),
                ],
              ),
              const SizedBox(height: 16),

              // Physical info section
              _buildSection(
                context,
                title: 'Thông tin thể chất',
                icon: Icons.health_and_safety,
                children: [
                  _buildDropdownField(
                    context,
                    value: _gender,
                    label: 'Giới tính',
                    icon: _gender == 'Male' ? Icons.male : Icons.female,
                    items: const [
                      DropdownMenuItem(value: 'Male', child: Text('Đực')),
                      DropdownMenuItem(value: 'Female', child: Text('Cái')),
                    ],
                    onChanged: (v) => setState(() => _gender = v ?? 'Male'),
                  ),
                  const SizedBox(height: 16),
                  _buildTextField(
                    context,
                    controller: _colorController,
                    label: 'Màu sắc (tuỳ chọn)',
                    icon: Icons.palette,
                  ),
                  const SizedBox(height: 16),
                  _buildTextField(
                    context,
                    controller: _weightController,
                    label: 'Cân nặng (kg, tuỳ chọn)',
                    icon: Icons.monitor_weight,
                    keyboardType: const TextInputType.numberWithOptions(
                      decimal: true,
                    ),
                    validator: FormatUtils.validateWeight,
                  ),
                  const SizedBox(height: 16),
                  _buildDateField(context),
                ],
              ),
              const SizedBox(height: 16),

              // Additional info section
              _buildSection(
                context,
                title: 'Thông tin bổ sung',
                icon: Icons.note_add,
                children: [
                  _buildTextField(
                    context,
                    controller: _descController,
                    label: 'Mô tả (tuỳ chọn)',
                    icon: Icons.description,
                    maxLines: 3,
                  ),
                ],
              ),
              const SizedBox(height: 32),

              // Save button
              _buildSaveButton(context),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildPhotoSection(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                Icons.photo_camera,
                color: Theme.of(context).colorScheme.primary,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                'Ảnh thú cưng',
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 16),
          GestureDetector(
            onTap: _pickImage,
            child: Container(
              height: 200,
              width: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                  width: 2,
                  style: BorderStyle.solid,
                ),
                color: Colors.grey.shade50,
              ),
              child: _photo != null
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.file(_photo!, fit: BoxFit.cover),
                    )
                  : Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Container(
                          padding: const EdgeInsets.all(16),
                          decoration: BoxDecoration(
                            color: Theme.of(
                              context,
                            ).colorScheme.primary.withOpacity(0.1),
                            shape: BoxShape.circle,
                          ),
                          child: FaIcon(
                            FontAwesomeIcons.camera,
                            color: Theme.of(context).colorScheme.primary,
                            size: 32,
                          ),
                        ),
                        const SizedBox(height: 12),
                        Text(
                          'Chạm để chọn ảnh mới',
                          style: Theme.of(context).textTheme.bodyLarge
                              ?.copyWith(
                                color: Theme.of(context).colorScheme.primary,
                                fontWeight: FontWeight.w600,
                              ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '(Tuỳ chọn)',
                          style: Theme.of(context).textTheme.bodySmall
                              ?.copyWith(color: Colors.grey.shade600),
                        ),
                      ],
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSection(
    BuildContext context, {
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Container(
      padding: const EdgeInsets.all(20),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                icon,
                color: Theme.of(context).colorScheme.primary,
                size: 20,
              ),
              const SizedBox(width: 8),
              Text(
                title,
                style: Theme.of(
                  context,
                ).textTheme.titleMedium?.copyWith(fontWeight: FontWeight.bold),
              ),
            ],
          ),
          const SizedBox(height: 16),
          ...children,
        ],
      ),
    );
  }

  Widget _buildTextField(
    BuildContext context, {
    required TextEditingController controller,
    required String label,
    required IconData icon,
    TextInputType? keyboardType,
    int maxLines = 1,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      keyboardType: keyboardType,
      maxLines: maxLines,
      validator: validator,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: Theme.of(context).colorScheme.primary),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: Theme.of(context).colorScheme.primary,
            width: 2,
          ),
        ),
        filled: true,
        fillColor: Colors.grey.shade50,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),
      ),
    );
  }

  Widget _buildDropdownField(
    BuildContext context, {
    required String value,
    required String label,
    required IconData icon,
    required List<DropdownMenuItem<String>> items,
    required void Function(String?) onChanged,
  }) {
    return DropdownButtonFormField<String>(
      initialValue: value,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: Theme.of(context).colorScheme.primary),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.grey.shade300),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(
            color: Theme.of(context).colorScheme.primary,
            width: 2,
          ),
        ),
        filled: true,
        fillColor: Colors.grey.shade50,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 12,
        ),
      ),
      items: items,
      onChanged: onChanged,
    );
  }

  Widget _buildDateField(BuildContext context) {
    return GestureDetector(
      onTap: _pickDate,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(12),
          color: Colors.grey.shade50,
        ),
        child: Row(
          children: [
            Icon(
              Icons.calendar_today,
              color: Theme.of(context).colorScheme.primary,
              size: 20,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                _birthDate == null
                    ? 'Chọn ngày sinh (tuỳ chọn)'
                    : 'Ngày sinh: ${_birthDate!.toLocal().toString().split(' ')[0]}',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: _birthDate == null
                      ? Colors.grey.shade600
                      : Colors.black87,
                ),
              ),
            ),
            Icon(Icons.arrow_drop_down, color: Colors.grey.shade600),
          ],
        ),
      ),
    );
  }

  Widget _buildSaveButton(BuildContext context) {
    return Container(
      width: double.infinity,
      height: 56,
      decoration: BoxDecoration(
        gradient: LinearGradient(
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
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: ElevatedButton(
        onPressed: _saving ? null : _submit,
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.transparent,
          shadowColor: Colors.transparent,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
        ),
        child: _saving
            ? Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'Đang lưu...',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const FaIcon(
                    FontAwesomeIcons.floppyDisk,
                    color: Colors.white,
                    size: 18,
                  ),
                  const SizedBox(width: 12),
                  Text(
                    'Lưu thay đổi',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
