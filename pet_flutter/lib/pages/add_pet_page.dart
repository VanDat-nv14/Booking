import 'dart:io';

import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:image_picker/image_picker.dart';
import 'package:pet_flutter/services/pet_service.dart';
import 'package:pet_flutter/services/secure_storage.dart';
import 'package:pet_flutter/utils/format_utils.dart';

class AddPetPage extends StatefulWidget {
  const AddPetPage({super.key});

  @override
  State<AddPetPage> createState() => _AddPetPageState();
}

class _AddPetPageState extends State<AddPetPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  String _species = 'Dog';
  final _breedController = TextEditingController();
  final _colorController = TextEditingController();
  final _weightController = TextEditingController();
  final _descController = TextEditingController();
  String _gender = 'Male';
  DateTime? _birthDate;
  File? _photo;

  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    // // Hủy controller khi widget không còn được sử dụng
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
      initialDate: DateTime(now.year - 1),
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
    if (!_formKey.currentState!.validate()) {
      return; // Validate là hàm xác định input đầu vào có hợp lệ hay không
    }

    setState(() {
      // setState là hàm để cập nhật state của widget
      _saving =
          true; // _saving là biến để kiểm tra xem có đang thêm thú cưng hay không
      _error = null; // _error là biến để lưu lỗi
    });

    try {
      // try là hàm để xử lý lỗi
      final token = await SecureStorageService()
          .readToken(); // readToken là hàm để đọc token từ secure_storage.dart
      if (token == null) {
        // if là hàm để kiểm tra xem token có tồn tại hay không
        throw Exception('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
      }

      final petService = PetService();
      await petService.createPet(
        token: token, // token là token của user
        name: _nameController.text.trim(),
        species: _species, // _species là biến để lưu loài của thú cưng
        breed: _breedController.text.trim().isEmpty
            ? null
            : _breedController.text.trim(),
        gender: _gender, // _gender là biến để lưu giới tính của thú cưng
        color: _colorController.text.trim().isEmpty
            ? null
            : _colorController.text.trim(),
        birthDate:
            _birthDate, // _birthDate là biến để lưu ngày sinh của thú cưng
        weight: FormatUtils.parseWeight(
          _weightController.text,
        ), // FormatUtils.parseWeight(_weightController.text) là hàm để chuyển đổi cân nặng từ string sang double
        description: _descController.text.trim().isEmpty
            ? null
            : _descController.text
                  .trim(), // _descController.text.trim().isEmpty ? null : _descController.text.trim() là hàm để kiểm tra xem mô tả có tồn tại hay không
        photo: _photo, // _photo là biến để lưu ảnh của thú cưng
      );

      if (mounted) {
        // mounted là biến để kiểm tra xem widget có được mount hay không
        // Show success message
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const FaIcon(
                  FontAwesomeIcons
                      .checkCircle, //FontAwesomeIcons.checkCircle là tên một icon trong thư viện Font Awesome được dùng để hiển thị icon check circle
                  color: Colors.white,
                  size: 20,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Đã thêm thú cưng "${_nameController.text.trim()}" thành công!',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
            backgroundColor:
                Colors.green.shade600, // Màu nền: Xanh đậm (green.shade600).
            behavior: SnackBarBehavior
                .floating, // Hiển thị: SnackBar sẽ nổi lên (floating) trên màn hình thay vì chiếm toàn bộ chiều rộng ở dưới cùng.
            shape: RoundedRectangleBorder(
              //Hình dạng: Góc của SnackBar sẽ được làm tròn với bán kính 10.
              borderRadius: BorderRadius.circular(10),
            ),
            duration: const Duration(
              seconds: 3,
            ), // Duration(seconds: 3) là hàm để hiển thị snackbar trong 3 giây
          ),
        );

        // Navigate back
        Navigator.of(context).pop(true); // Return true to indicate success
      }
    } catch (e) {
      setState(() {
        _error = _parseErrorMessage(e.toString());
      });

      // Show error snackbar
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const FaIcon(
                  FontAwesomeIcons.triangleExclamation,
                  color: Colors.white,
                  size: 20,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    'Lỗi: ${_parseErrorMessage(e.toString())}',
                    style: const TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ),
              ],
            ),
            backgroundColor: Colors.red.shade600,
            behavior: SnackBarBehavior
                .floating, // SnackBarBehavior.floating là hàm để hiển thị snackbar ở trên cùng của màn hình
            shape: RoundedRectangleBorder(
              // RoundedRectangleBorder là hàm để tạo border cho snackbar
              borderRadius: BorderRadius.circular(
                10,
              ), // BorderRadius.circular(10) là hàm để tạo border cho snackbar
            ),
            duration: const Duration(
              seconds: 4,
            ), // Duration(seconds: 4) là hàm để hiển thị snackbar trong 4 giây
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _saving = false;
        });
      }
    }
  }

  String _parseErrorMessage(String error) {
    // Parse common error messages to be more user-friendly
    if (error.contains('Bạn chưa đăng nhập')) {
      return 'Bạn chưa đăng nhập. Vui lòng đăng nhập lại.';
    } else if (error.contains('Unauthorized')) {
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    } else if (error.contains('Network')) {
      return 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.';
    } else if (error.contains('timeout')) {
      return 'Kết nối quá chậm. Vui lòng thử lại.';
    } else if (error.contains('validation')) {
      return 'Thông tin không hợp lệ. Vui lòng kiểm tra lại.';
    } else {
      return error;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.grey.shade50,
      appBar: AppBar(
        title: const Text('Thêm thú cưng'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Header Section
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary,
                borderRadius: const BorderRadius.only(
                  bottomLeft: Radius.circular(24),
                  bottomRight: Radius.circular(24),
                ),
              ),
              child: Column(
                children: [
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: const FaIcon(
                      FontAwesomeIcons.paw,
                      size: 32,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Thêm thú cưng mới',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Hãy điền thông tin chi tiết về thú cưng của bạn',
                    style: TextStyle(
                      color: Colors.white.withOpacity(0.8),
                      fontSize: 14,
                    ),
                    textAlign: TextAlign.center,
                  ),
                ],
              ),
            ),

            // Form Section
            Container(
              margin: const EdgeInsets.all(16),
              padding: const EdgeInsets.all(24),
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
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    // Error Message
                    if (_error != null)
                      Container(
                        padding: const EdgeInsets.all(12),
                        margin: const EdgeInsets.only(bottom: 16),
                        decoration: BoxDecoration(
                          // BoxDecoration là hàm để tạo border cho container
                          color: Colors.red.shade50,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.red.shade200),
                        ),
                        child: Row(
                          children: [
                            FaIcon(
                              FontAwesomeIcons
                                  .triangleExclamation, //dùng để hiển thị icon ⚠️ Cảnh báo / Warning trong thư viện Font Awesome
                              color: Colors.red.shade600,
                              size: 16,
                            ),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _error!,
                                style: TextStyle(color: Colors.red.shade700),
                              ),
                            ),
                          ],
                        ),
                      ),

                    // Photo Section
                    _buildPhotoSection(context),
                    const SizedBox(height: 24),

                    // Basic Info Section
                    _buildBasicInfoSection(context),
                    const SizedBox(height: 24),

                    // Physical Info Section
                    _buildPhysicalInfoSection(context),
                    const SizedBox(height: 24),

                    // Additional Info Section
                    _buildAdditionalInfoSection(context),
                    const SizedBox(height: 32),

                    // Submit Button
                    _buildSubmitButton(context),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPhotoSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment
          .start, // CrossAxisAlignment.start là hàm để căn chỉnh theo chiều ngang (ngang hàng)
      children: [
        Text(
          'Ảnh thú cưng',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: Colors.grey.shade800,
          ),
        ),
        const SizedBox(height: 12),
        GestureDetector(
          // GestureDetector là hàm để xử lý các sự kiện của người dùng
          onTap: _pickImage,
          child: Container(
            height: 200,
            width: double.infinity,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: _photo != null
                    ? Theme.of(context).colorScheme.primary
                    : Colors.grey.shade300,
                width: 2,
              ),
              color: _photo != null ? null : Colors.grey.shade50,
            ),
            child: _photo != null
                ? ClipRRect(
                    // ClipRRect là hàm để cắt ảnh theo đường viền
                    borderRadius: BorderRadius.circular(10),
                    child: Image.file(_photo!, fit: BoxFit.cover),
                  )
                : Column(
                    mainAxisAlignment: MainAxisAlignment
                        .center, // MainAxisAlignment.center là hàm để căn chỉnh theo chiều dọc (dọc hàng)
                    children: [
                      FaIcon(
                        FontAwesomeIcons.camera,
                        size: 48,
                        color: Colors.grey.shade400,
                      ),
                      const SizedBox(height: 12),
                      Text(
                        'Chạm để chọn ảnh',
                        style: TextStyle(
                          color: Colors.grey.shade600,
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'JPG, PNG (tối đa 5MB)',
                        style: TextStyle(
                          color: Colors.grey.shade500,
                          fontSize: 12,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildBasicInfoSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Thông tin cơ bản',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: Colors.grey.shade800,
          ),
          //titleMedium: Đây là một kiểu văn bản có sẵn trong textTheme, được dùng cho các tiêu đề vừa phải, không quá lớn nhưng cũng không quá nhỏ. Cách sử dụng titleMedium giúp bạn kế thừa các thuộc tính mặc định của tiêu đề này mà không phải định nghĩa lại từ đầu.
        ),
        const SizedBox(height: 16),

        // Pet Name
        _buildTextField(
          controller: _nameController,
          label: 'Tên thú cưng',
          icon: FontAwesomeIcons.tag,
          validator: (v) => (v == null || v.trim().isEmpty)
              ? 'Vui lòng nhập tên thú cưng'
              : null,
        ),
        const SizedBox(height: 16),

        // Species and Gender Row
        Row(
          children: [
            Expanded(
              child: _buildDropdownField(
                value: _species,
                label: 'Loài',
                icon: FontAwesomeIcons.paw,
                items: const [
                  DropdownMenuItem(
                    value: 'Dog',
                    child: Text('Chó'),
                  ), // DropdownMenuItem là hàm để tạo một item trong dropdown menu
                  DropdownMenuItem(
                    value: 'Cat',
                    child: Text('Mèo'),
                  ), // DropdownMenuItem là hàm để tạo một item trong dropdown menu
                ],
                onChanged: (v) => setState(
                  () => _species = v ?? 'Dog',
                ), // setState(() => _species = v ?? 'Dog') là hàm để cập nhật state của biến _species
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildDropdownField(
                value: _gender,
                label: 'Giới tính',
                icon: FontAwesomeIcons.venusMars,
                items: const [
                  DropdownMenuItem(value: 'Male', child: Text('Đực')),
                  DropdownMenuItem(value: 'Female', child: Text('Cái')),
                ],
                onChanged: (v) => setState(() => _gender = v ?? 'Male'),
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Breed
        _buildTextField(
          controller: _breedController,
          label: 'Giống (tùy chọn)',
          icon: FontAwesomeIcons.dna,
        ),
      ],
    );
  }

  Widget _buildPhysicalInfoSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Thông tin thể chất',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: Colors.grey.shade800,
          ),
        ),
        const SizedBox(height: 16),

        // Color and Weight Row
        Row(
          children: [
            Expanded(
              child: _buildTextField(
                controller: _colorController,
                label: 'Màu sắc (tùy chọn)',
                icon: FontAwesomeIcons.palette,
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: _buildTextField(
                controller: _weightController,
                label: 'Cân nặng (kg)',
                icon: FontAwesomeIcons.weight,
                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                ),
                validator: FormatUtils.validateWeight, 
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),

        // Birth Date
        _buildDateField(context),
      ],
    );
  }

  Widget _buildAdditionalInfoSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Thông tin bổ sung',
          style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: Colors.grey.shade800,
          ),
        ),
        const SizedBox(height: 16),

        _buildTextField(
          controller: _descController,
          label: 'Mô tả (tùy chọn)',
          icon: FontAwesomeIcons.fileText,
          maxLines: 3,
        ),
      ],
    );
  }

  Widget _buildTextField({
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
        // InputDecoration là hàm để tạo border cho text field
        labelText: label,
        prefixIcon: Padding(
          padding: const EdgeInsets.only(left: 16, right: 12),
          child: FaIcon(
            icon,
            size: 18,
            color: Theme.of(context).colorScheme.primary,
          ), // FaIcon là hàm để hiển thị icon trong thư viện Font Awesome
        ),
        prefixIconConstraints: const BoxConstraints(
          // BoxConstraints là hàm để tạo border cho text field
          minWidth: 48,
          minHeight: 24,
        ), //  prefixIconConstraints: const BoxConstraints( là hàm để đảm bảo icon không bị bóp méo, cố định một khoảng, style đẹp.
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
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.red.shade400),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.red.shade400, width: 2),
        ),
        filled: true,
        fillColor: Colors.grey.shade50,
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 16,
        ),
        labelStyle: TextStyle(color: Colors.grey.shade600, fontSize: 14),
        floatingLabelStyle: TextStyle(
          color: Theme.of(context).colorScheme.primary,
          fontSize: 12,
        ),
      ),
    );
  }

  Widget _buildDropdownField({
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
        prefixIcon: Padding(
          padding: const EdgeInsets.only(left: 16, right: 12),
          child: FaIcon(
            icon,
            size: 18,
            color: Theme.of(context).colorScheme.primary,
          ),
        ),
        prefixIconConstraints: const BoxConstraints(
          minWidth: 48,
          minHeight: 24,
        ),
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
          vertical: 16,
        ),
        labelStyle: TextStyle(color: Colors.grey.shade600, fontSize: 14),
        floatingLabelStyle: TextStyle(
          color: Theme.of(context).colorScheme.primary,
          fontSize: 12,
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
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        decoration: BoxDecoration(
          border: Border.all(color: Colors.grey.shade300),
          borderRadius: BorderRadius.circular(12),
          color: Colors.grey.shade50,
        ),
        child: Row(
          children: [
            Padding(
              padding: const EdgeInsets.only(left: 4, right: 12),
              child: FaIcon(
                FontAwesomeIcons.calendar,
                size: 18,
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
            Expanded(
              child: Text(
                _birthDate == null
                    ? 'Ngày sinh (tùy chọn)'
                    : 'Ngày sinh: ${_birthDate!.toLocal().toString().split(' ')[0]}',
                style: TextStyle(
                  color: _birthDate == null
                      ? Colors.grey.shade600
                      : Colors.grey.shade800,
                  fontSize: 14,
                ),
              ),
            ),
            if (_birthDate != null)
              GestureDetector(
                onTap: () => setState(() => _birthDate = null),
                child: FaIcon(
                  FontAwesomeIcons.xmark,
                  size: 16,
                  color: Colors.grey.shade500,
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSubmitButton(BuildContext context) {
    return Container(
      height: 56,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            Theme.of(context).colorScheme.primary,
            Theme.of(context).colorScheme.primary.withOpacity(0.8),
          ],
        ),
        borderRadius: BorderRadius.circular(12),
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
            borderRadius: BorderRadius.circular(12),
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
                  const Text(
                    'Đang thêm...',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const FaIcon(
                    FontAwesomeIcons.plus,
                    color: Colors.white,
                    size: 18,
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    'Thêm thú cưng',
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
