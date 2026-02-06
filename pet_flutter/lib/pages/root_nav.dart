import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:pet_flutter/pages/home_page.dart';
import 'package:pet_flutter/pages/profile_page.dart';
import 'package:pet_flutter/pages/pets_page.dart';
import 'package:pet_flutter/pages/appointment_list_page.dart';
import 'package:pet_flutter/pages/enhanced_services_page.dart';
import 'package:convex_bottom_bar/convex_bottom_bar.dart';

class ServicesPage extends StatefulWidget {
  const ServicesPage({super.key});
  @override
  State<ServicesPage> createState() => _ServicesPageState();
}

class _ServicesPageState extends State<ServicesPage> {
  @override
  Widget build(BuildContext context) {
    return const EnhancedServicesPage();
  }
}

class AppointmentsPage extends StatelessWidget {
  const AppointmentsPage({super.key});
  @override
  Widget build(BuildContext context) {
    return const AppointmentListPage();
  }
}

class CartPage extends StatelessWidget {
  const CartPage({super.key});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Giỏ hàng')),
      body: const Center(child: Text('Giỏ hàng')),
    );
  }
}

class RootNav extends StatefulWidget {
  const RootNav({super.key});
  @override
  State<RootNav> createState() => _RootNavState();
}

class _RootNavState extends State<RootNav> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      const HomePage(),
      const ServicesPage(),
      const AppointmentsPage(),
      const PetsPage(),
      const ProfilePage(),
    ];

    return Scaffold(
      body: IndexedStack(index: _index, children: pages),
      bottomNavigationBar: ConvexAppBar.badge(
        {
          1: '3', // Badge cho tab Dịch vụ
          2: '2', // Badge cho tab Lịch hẹn  
        },
        style: TabStyle.react,
        backgroundColor: const Color(0xFF304FFE), // Blue theme color
        activeColor: Colors.white,
        color: Colors.white70,
        height: 65,
        curveSize: 90,
        top: -30,
        gradient: const LinearGradient(
          colors: [
            Color(0xFF304FFE),
            Color(0xFF1976D2),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        items: const [
          TabItem(icon: FontAwesomeIcons.house, title: 'Trang chủ'),
          TabItem(icon: FontAwesomeIcons.paw, title: 'Dịch vụ'),
          TabItem(icon: FontAwesomeIcons.calendarCheck, title: 'Lịch hẹn'),
          TabItem(icon: FontAwesomeIcons.heart, title: 'Thú cưng'),
          TabItem(icon: FontAwesomeIcons.user, title: 'Hồ sơ'),
        ],
        initialActiveIndex: _index,
        onTap: (int i) => setState(() => _index = i),
      ),
    );
  }
}
