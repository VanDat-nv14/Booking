import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:lottie/lottie.dart';
import 'package:pet_flutter/services/auth_service.dart';
import 'package:pet_flutter/services/secure_storage.dart';
import 'package:pet_flutter/services/onesignal_service.dart';
import 'package:pet_flutter/pages/register_page.dart';
import 'package:pet_flutter/widgets/shimmer_placeholders.dart';

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _usernameOrEmailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _authService = AuthService();
  final _storage = SecureStorageService();
  bool _loading = false;
  bool _isInitialLoading = true;
  String? _error;
  bool _obscurePassword = true;
  bool _rememberMe = false;
  bool _isUsernameFocused = false;
  bool _isPasswordFocused = false;

  @override
  void initState() {
    super.initState();
    // Simulate initial loading - giảm thời gian để test nhanh hơn
    Future.delayed(const Duration(milliseconds: 1500), () {
      if (mounted) {
        setState(() {
          _isInitialLoading = false;
        });
      }
    });
  }

  @override
  void dispose() {
    _usernameOrEmailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    print('🔐 Login attempt started');
    
    // Check if form is valid
    if (_formKey.currentState != null && !_formKey.currentState!.validate()) {
      print('❌ Form validation failed');
      return;
    }
    
    print('✅ Form validation passed');
    print('📝 Username/Email: ${_usernameOrEmailController.text.trim()}');
    print('🔑 Password length: ${_passwordController.text.length}');
    
    setState(() {
      _loading = true;
      _error = null;
    });
    
    try {
      print('🌐 Calling auth service...');
      final res = await _authService.login(
        usernameOrEmail: _usernameOrEmailController.text.trim(),
        password: _passwordController.text,
      );
      
      print('✅ Auth service response received');
      print('📄 Response: $res');
      
      final token = res['token'] as String?;
      final user = res['user']; // Get user object from response
      
      if (token != null) {
        print('💾 Saving token...');
        await _storage.saveToken(token);
        print('✅ Token saved');
      } else {
        print('⚠️ No token in response');
      }
      
      if (user != null) {
        print('💾 Saving user data...');
        print('👤 User data: $user');
        await _storage.saveUser(jsonEncode(user));
        print('✅ User data saved');
        
        // 🔔 Set OneSignal External User ID
        try {
          final role = user['role']?.toString();
          
          // Dùng staffId cho Staff, userId cho Customer
          String? externalId;
          if (role == 'Staff') {
            externalId = user['staffId']?.toString();
          }
          externalId ??= user['userId']?.toString();
          
          if (externalId != null) {
            await OneSignalService().setExternalUserId(externalId);
            print('🔔 OneSignal External User ID set: $externalId (role: $role)');
          }
        } catch (e) {
          print('⚠️ Failed to set OneSignal External User ID: $e');
        }
      } else {
        print('⚠️ No user data in response');
      }
      
      if (mounted) {
        print('🏠 Navigating to home...');
        // Show success animation
        await _showSuccessAnimation();
        // Navigate back to AuthWrapper which will automatically show RootNav for authenticated users
        Navigator.of(context).pushNamedAndRemoveUntil(
          '/',
          (route) => false,
        );
        print('✅ Navigation completed');
      }
    } catch (e) {
      print('❌ Login error: $e');
      setState(() {
        _error = e.toString();
      });
      
      // Show error animation
      if (mounted) {
        await _showErrorAnimation(e.toString());
      }
    } finally {
      if (mounted) {
        setState(() {
          _loading = false;
        });
        print('🔄 Loading state reset');
      }
    }
  }

  Future<void> _showSuccessAnimation() async {
    return showDialog(
      context: context,
      barrierDismissible: false,
      barrierColor: Colors.black.withOpacity(0.5),
      builder: (BuildContext context) {
        // Auto close dialog after animation completes
        Future.delayed(const Duration(milliseconds: 1500), () {
          if (context.mounted) {
            Navigator.of(context).pop();
          }
        });

        return Dialog(
          backgroundColor: Colors.transparent,
          elevation: 0,
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // Lottie animation
                Lottie.asset(
                  'assets/animations/check_mark_success.json',
                  width: 120,
                  height: 120,
                  fit: BoxFit.contain,
                  repeat: false,
                ),
                const SizedBox(height: 16),
                Text(
                  'Đăng nhập thành công!',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                Text(
                  'Chào mừng bạn trở lại',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade600,
                  ),
                  textAlign: TextAlign.center,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Future<void> _showErrorAnimation(String errorMessage) async {
    // Parse error message to get user-friendly text
    String displayMessage = 'Đăng nhập thất bại';
    String detailMessage = 'Vui lòng kiểm tra lại thông tin';
    
    if (errorMessage.contains('Invalid username or password') || 
        errorMessage.contains('Tên đăng nhập hoặc mật khẩu không đúng')) {
      displayMessage = 'Sai tài khoản hoặc mật khẩu';
      detailMessage = 'Vui lòng kiểm tra lại thông tin đăng nhập';
    } else if (errorMessage.contains('Network') || 
               errorMessage.contains('connection') ||
               errorMessage.contains('SocketException')) {
      displayMessage = 'Không thể kết nối';
      detailMessage = 'Vui lòng kiểm tra kết nối mạng';
    } else if (errorMessage.contains('timeout')) {
      displayMessage = 'Hết thời gian chờ';
      detailMessage = 'Vui lòng thử lại';
    }
    
    return showDialog(
      context: context,
      barrierDismissible: false,
      barrierColor: Colors.black.withOpacity(0.5),
      builder: (BuildContext context) {
        // Auto close dialog after animation completes
        Future.delayed(const Duration(milliseconds: 2500), () {
          if (context.mounted) {
            Navigator.of(context).pop();
          }
        });

        return Dialog(
          backgroundColor: Colors.transparent,
          elevation: 0,
          child: Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
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
                // Lottie error animation
                Lottie.asset(
                  'assets/animations/connectionerror.json',
                  width: 100,
                  height: 100,
                  fit: BoxFit.contain,
                  repeat: true,
                ),
                const SizedBox(height: 20),
                Text(
                  displayMessage,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.red.shade600,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 12),
                Text(
                  detailMessage,
                  style: TextStyle(
                    fontSize: 15,
                    color: Colors.grey.shade700,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 20),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      Navigator.of(context).pop();
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red.shade600,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      elevation: 0,
                    ),
                    child: const Text(
                      'Thử lại',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
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
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          onPressed: () => Navigator.of(context).pop(),
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.9),
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: Colors.grey.withOpacity(0.2),
                  spreadRadius: 1,
                  blurRadius: 4,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Icon(
              Icons.arrow_back_ios_new,
              color: Theme.of(context).colorScheme.primary,
              size: 18,
            ),
          ),
        ),
        title: Text(
          'Đăng nhập',
          style: TextStyle(
            color: Theme.of(context).colorScheme.primary,
            fontWeight: FontWeight.bold,
          ),
        ),
        centerTitle: true,
      ),
      body: SafeArea(
        child: Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [
                Theme.of(context).colorScheme.primary.withOpacity(0.1),
                Colors.grey.shade50,
              ],
            ),
          ),
          child: SingleChildScrollView(
            child: ConstrainedBox(
              constraints: BoxConstraints(
                minHeight: MediaQuery.of(context).size.height - MediaQuery.of(context).padding.top - MediaQuery.of(context).padding.bottom,
              ),
              child: IntrinsicHeight(
                child: Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Header Section
                      _buildHeader(),
                      const SizedBox(height: 40),
                      
                      // Error Message
                      if (_error != null) _buildErrorCard(),
                      
                      // Form Section
                      _isInitialLoading ? _buildShimmerFormCard() : _buildFormCard(),
                      
                      const SizedBox(height: 24),
                      
                      // Register Link
                      _isInitialLoading ? _buildShimmerRegisterLink() : _buildRegisterLink(),
                      
                      const SizedBox(height: 16),
                      
                      // Explore Button
                      _isInitialLoading ? _buildShimmerExploreButton() : _buildExploreButton(),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Theme.of(context).colorScheme.primary,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Theme.of(context).colorScheme.primary.withOpacity(0.3),
                spreadRadius: 5,
                blurRadius: 20,
                offset: const Offset(0, 5),
              ),
            ],
          ),
          child: const FaIcon(
            FontAwesomeIcons.paw,
            color: Colors.white,
            size: 40,
          ),
        ),
        const SizedBox(height: 24),
        Text(
          'Chào mừng trở lại!',
          style: Theme.of(context).textTheme.headlineMedium?.copyWith(
            fontWeight: FontWeight.bold,
            color: Theme.of(context).colorScheme.primary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          'Đăng nhập để tiếp tục',
          style: Theme.of(context).textTheme.bodyLarge?.copyWith(
            color: Colors.grey.shade600,
          ),
        ),
      ],
    );
  }

  Widget _buildErrorCard() {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.red.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.red.shade200),
      ),
      child: Row(
        children: [
          Icon(Icons.error_outline, color: Colors.red.shade600, size: 20),
          const SizedBox(width: 12),
          Expanded(
            child: Text(
              _error!,
              style: TextStyle(
                color: Colors.red.shade700,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShimmerFormCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 20,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Username/Email Field Shimmer
          ShimmerInputField(
            width: double.infinity,
            height: 56,
            margin: const EdgeInsets.only(bottom: 20),
          ),
          
          // Password Field Shimmer
          ShimmerInputField(
            width: double.infinity,
            height: 56,
            margin: const EdgeInsets.only(bottom: 20),
          ),
          
          // Remember Me & Forgot Password Shimmer
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  ShimmerText(width: 20, height: 20, borderRadius: 4),
                  const SizedBox(width: 8),
                  ShimmerText(width: 120, height: 16),
                ],
              ),
              ShimmerText(width: 100, height: 16),
            ],
          ),
          const SizedBox(height: 24),
          
          // Login Button Shimmer
          ShimmerButton(
            width: double.infinity,
            height: 56,
            margin: const EdgeInsets.only(bottom: 24),
          ),
          
          // Divider
          _buildDivider(),
          
          const SizedBox(height: 24),
          
          // Social Login Buttons Shimmer
          ShimmerButton(
            width: double.infinity,
            height: 52,
            margin: const EdgeInsets.only(bottom: 12),
          ),
          ShimmerButton(
            width: double.infinity,
            height: 52,
          ),
        ],
      ),
    );
  }

  Widget _buildFormCard() {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 20,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // Username/Email Field
          _buildAnimatedTextField(
            controller: _usernameOrEmailController,
            label: 'Username hoặc Email',
            icon: FontAwesomeIcons.user,
            isFocused: _isUsernameFocused,
            onFocusChange: (focused) => setState(() => _isUsernameFocused = focused),
            validator: (v) {
              if (v == null || v.trim().isEmpty) return 'Vui lòng nhập username hoặc email';
              return null;
            },
          ),
          const SizedBox(height: 20),
          
          // Password Field
          _buildAnimatedPasswordField(
            controller: _passwordController,
            label: 'Mật khẩu',
            icon: FontAwesomeIcons.lock,
            isFocused: _isPasswordFocused,
            onFocusChange: (focused) => setState(() => _isPasswordFocused = focused),
            validator: (v) {
              if (v == null || v.isEmpty) return 'Vui lòng nhập mật khẩu';
              if (v.length < 6) return 'Mật khẩu phải có ít nhất 6 ký tự';
              return null;
            },
          ),
          const SizedBox(height: 20),
          
          // Remember Me & Forgot Password
          _buildRememberMeAndForgotPassword(),
          const SizedBox(height: 24),
          
          // Login Button
          _buildLoginButton(),
          
          const SizedBox(height: 24),
          
          // Divider
          _buildDivider(),
          
          const SizedBox(height: 24),
          
          // Social Login Buttons
          _buildSocialLoginButtons(),
        ],
      ),
    );
  }

  Widget _buildAnimatedTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    required bool isFocused,
    required Function(bool) onFocusChange,
    String? Function(String?)? validator,
  }) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
      transform: Matrix4.identity()..scale(isFocused ? 1.02 : 1.0),
      child: TextFormField(
        controller: controller,
        validator: validator,
        onTap: () => onFocusChange(true),
        onFieldSubmitted: (_) => onFocusChange(false),
        onChanged: (value) {
          if (value.isEmpty) onFocusChange(false);
        },
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            padding: const EdgeInsets.only(left: 16, right: 12),
            child: FaIcon(
              icon, 
              size: 18, 
              color: isFocused 
                  ? Theme.of(context).colorScheme.primary 
                  : Colors.grey.shade600,
            ),
          ),
          prefixIconConstraints: const BoxConstraints(
            minWidth: 48,
            minHeight: 24,
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(
              color: isFocused 
                  ? Theme.of(context).colorScheme.primary 
                  : Colors.grey.shade300,
              width: isFocused ? 2 : 1,
            ),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(
              color: isFocused 
                  ? Theme.of(context).colorScheme.primary 
                  : Colors.grey.shade300,
              width: isFocused ? 2 : 1,
            ),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(
              color: Theme.of(context).colorScheme.primary, 
              width: 2,
            ),
          ),
          filled: true,
          fillColor: isFocused 
              ? Theme.of(context).colorScheme.primary.withOpacity(0.05)
              : Colors.grey.shade50,
          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
          labelStyle: TextStyle(
            color: isFocused 
                ? Theme.of(context).colorScheme.primary 
                : Colors.grey.shade600,
            fontSize: 14,
            fontWeight: isFocused ? FontWeight.w600 : FontWeight.normal,
          ),
          floatingLabelStyle: TextStyle(
            color: Theme.of(context).colorScheme.primary,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _buildAnimatedPasswordField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    required bool isFocused,
    required Function(bool) onFocusChange,
    String? Function(String?)? validator,
  }) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
      transform: Matrix4.identity()..scale(isFocused ? 1.02 : 1.0),
      child: TextFormField(
        controller: controller,
        obscureText: _obscurePassword,
        validator: validator,
        onTap: () => onFocusChange(true),
        onFieldSubmitted: (_) => onFocusChange(false),
        onChanged: (value) {
          if (value.isEmpty) onFocusChange(false);
        },
        decoration: InputDecoration(
          labelText: label,
          prefixIcon: AnimatedContainer(
            duration: const Duration(milliseconds: 300),
            padding: const EdgeInsets.only(left: 16, right: 12),
            child: FaIcon(
              icon, 
              size: 18, 
              color: isFocused 
                  ? Theme.of(context).colorScheme.primary 
                  : Colors.grey.shade600,
            ),
          ),
          prefixIconConstraints: const BoxConstraints(
            minWidth: 48,
            minHeight: 24,
          ),
          suffixIcon: Container(
            margin: const EdgeInsets.only(right: 8),
            child: IconButton(
              onPressed: () {
                setState(() {
                  _obscurePassword = !_obscurePassword;
                });
              },
              icon: AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: _obscurePassword 
                      ? Colors.grey.shade100 
                      : Theme.of(context).colorScheme.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(
                    color: _obscurePassword 
                        ? Colors.grey.shade300 
                        : Theme.of(context).colorScheme.primary.withOpacity(0.3),
                    width: 1,
                  ),
                ),
                child: FaIcon(
                  _obscurePassword ? FontAwesomeIcons.eyeSlash : FontAwesomeIcons.eye,
                  size: 16,
                  color: _obscurePassword 
                      ? Colors.grey.shade600 
                      : Theme.of(context).colorScheme.primary,
                ),
              ),
              tooltip: _obscurePassword ? 'Hiện mật khẩu' : 'Ẩn mật khẩu',
            ),
          ),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(
              color: isFocused 
                  ? Theme.of(context).colorScheme.primary 
                  : Colors.grey.shade300,
              width: isFocused ? 2 : 1,
            ),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(
              color: isFocused 
                  ? Theme.of(context).colorScheme.primary 
                  : Colors.grey.shade300,
              width: isFocused ? 2 : 1,
            ),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(
              color: Theme.of(context).colorScheme.primary, 
              width: 2,
            ),
          ),
          filled: true,
          fillColor: isFocused 
              ? Theme.of(context).colorScheme.primary.withOpacity(0.05)
              : Colors.grey.shade50,
          contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 20),
          labelStyle: TextStyle(
            color: isFocused 
                ? Theme.of(context).colorScheme.primary 
                : Colors.grey.shade600,
            fontSize: 14,
            fontWeight: isFocused ? FontWeight.w600 : FontWeight.normal,
          ),
          floatingLabelStyle: TextStyle(
            color: Theme.of(context).colorScheme.primary,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }

  Widget _buildRememberMeAndForgotPassword() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        // Remember Me Checkbox
        GestureDetector(
          onTap: () {
            setState(() {
              _rememberMe = !_rememberMe;
            });
          },
          child: Row(
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 200),
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  color: _rememberMe 
                      ? Theme.of(context).colorScheme.primary 
                      : Colors.transparent,
                  border: Border.all(
                    color: _rememberMe 
                        ? Theme.of(context).colorScheme.primary 
                        : Colors.grey.shade400,
                    width: 2,
                  ),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: _rememberMe
                    ? const Icon(
                        Icons.check,
                        color: Colors.white,
                        size: 14,
                      )
                    : null,
              ),
              const SizedBox(width: 8),
              Text(
                'Ghi nhớ đăng nhập',
                style: TextStyle(
                  color: _rememberMe 
                      ? Theme.of(context).colorScheme.primary 
                      : Colors.grey.shade600,
                  fontWeight: _rememberMe ? FontWeight.w600 : FontWeight.normal,
                ),
              ),
            ],
          ),
        ),
        
        // Forgot Password Link
        GestureDetector(
          onTap: _showForgotPasswordDialog,
          child: Text(
            'Quên mật khẩu?',
            style: TextStyle(
              color: Theme.of(context).colorScheme.primary,
              fontWeight: FontWeight.w600,
              decoration: TextDecoration.underline,
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDivider() {
    return Row(
      children: [
        Expanded(
          child: Container(
            height: 1,
            color: Colors.grey.shade300,
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Text(
            'Hoặc',
            style: TextStyle(
              color: Colors.grey.shade600,
              fontWeight: FontWeight.w500,
            ),
          ),
        ),
        Expanded(
          child: Container(
            height: 1,
            color: Colors.grey.shade300,
          ),
        ),
      ],
    );
  }

  Widget _buildSocialLoginButtons() {
    return Column(
      children: [
        // Google Login Button
        _buildSocialButton(
          text: 'Đăng nhập với Google',
          icon: FontAwesomeIcons.google,
          color: Colors.red.shade600,
          onPressed: _handleGoogleLogin,
        ),
        const SizedBox(height: 12),
        
        // Facebook Login Button
        _buildSocialButton(
          text: 'Đăng nhập với Facebook',
          icon: FontAwesomeIcons.facebook,
          color: Colors.blue.shade700,
          onPressed: _handleFacebookLogin,
        ),
      ],
    );
  }

  Widget _buildSocialButton({
    required String text,
    required IconData icon,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return Container(
      height: 52,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade300, width: 1.5),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 0,
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onPressed,
          borderRadius: BorderRadius.circular(16),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              FaIcon(
                icon,
                color: color,
                size: 20,
              ),
              const SizedBox(width: 12),
              Text(
                text,
                style: TextStyle(
                  color: Colors.grey.shade800,
                  fontWeight: FontWeight.w600,
                  fontSize: 16,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLoginButton() {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
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
            spreadRadius: 0,
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: _loading ? null : _submit,
          borderRadius: BorderRadius.circular(16),
          child: SizedBox(
            height: 56,
            child: _loading
                ? const Center(
                    child: SizedBox(
                      width: 24,
                      height: 24,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    ),
                  )
                : Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const FaIcon(FontAwesomeIcons.rightToBracket, color: Colors.white, size: 18),
                      const SizedBox(width: 12),
                      Text(
                        'Đăng nhập',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
          ),
        ),
      ),
    );
  }

  void _showForgotPasswordDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: Colors.orange.shade100,
                borderRadius: BorderRadius.circular(8),
              ),
              child: FaIcon(
                FontAwesomeIcons.key,
                color: Colors.orange.shade600,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            const Text('Quên mật khẩu?'),
          ],
        ),
        content: const Text(
          'Tính năng này đang được phát triển. Vui lòng liên hệ admin để được hỗ trợ.',
          style: TextStyle(fontSize: 14),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }

  void _handleGoogleLogin() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Đăng nhập Google đang được phát triển'),
        backgroundColor: Colors.red.shade600,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  void _handleFacebookLogin() {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Đăng nhập Facebook đang được phát triển'),
        backgroundColor: Colors.blue.shade600,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      ),
    );
  }

  Widget _buildShimmerRegisterLink() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          ShimmerText(width: 120, height: 16),
          const SizedBox(width: 8),
          ShimmerText(width: 80, height: 16),
        ],
      ),
    );
  }

  Widget _buildRegisterLink() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Chưa có tài khoản? ',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: Colors.grey.shade600,
            ),
          ),
          GestureDetector(
            onTap: () {
              Navigator.of(context).push(
                MaterialPageRoute(builder: (_) => const RegisterPage()),
              );
            },
            child: Text(
              'Đăng ký ngay',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Theme.of(context).colorScheme.primary,
                fontWeight: FontWeight.bold,
                decoration: TextDecoration.underline,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildShimmerExploreButton() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              ShimmerText(width: 16, height: 16, borderRadius: 8),
              const SizedBox(width: 8),
              ShimmerText(width: 120, height: 16),
            ],
          ),
          const SizedBox(height: 12),
          ShimmerButton(
            width: double.infinity,
            height: 40,
          ),
        ],
      ),
    );
  }

  Widget _buildExploreButton() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              FaIcon(
                FontAwesomeIcons.eye,
                color: Colors.grey.shade600,
                size: 16,
              ),
              const SizedBox(width: 8),
              Text(
                'Hoặc khám phá trước',
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey.shade600,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton.icon(
              onPressed: () {
                Navigator.of(context).pushNamedAndRemoveUntil(
                  '/',
                  (route) => false,
                );
              },
              icon: FaIcon(
                FontAwesomeIcons.arrowLeft,
                color: Colors.grey.shade700,
                size: 14,
              ),
              label: Text(
                'Quay lại trang chủ',
                style: TextStyle(
                  color: Colors.grey.shade700,
                  fontWeight: FontWeight.w500,
                ),
              ),
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: Colors.grey.shade300),
                padding: const EdgeInsets.symmetric(vertical: 12),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}


