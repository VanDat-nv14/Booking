import 'package:firebase_core/firebase_core.dart';

class FirebaseConfig {
  static Future<void> initialize() async {
    // Kiểm tra nếu Firebase đã được khởi tạo chưa
    try {
      await Firebase.initializeApp();
    } catch (e) {
      // Nếu đã khởi tạo rồi thì bỏ qua
      if (e.toString().contains('duplicate-app')) {
        print('Firebase already initialized');
      } else {
        rethrow;
      }
    }
  }
}
