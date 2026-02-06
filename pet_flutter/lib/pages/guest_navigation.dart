import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:convex_bottom_bar/convex_bottom_bar.dart';
import 'guest_home_page.dart';
import 'guest_services_page.dart';
import 'guest_booking_page.dart';
import 'guest_profile_page.dart';

class GuestNavigation extends StatefulWidget {
  const GuestNavigation({super.key});

  @override
  State<GuestNavigation> createState() => _GuestNavigationState();
}

class _GuestNavigationState extends State<GuestNavigation> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      const GuestHomePageContent(), // Tách content từ GuestHomePage
      const GuestServicesPage(),
      const GuestBookingPage(),
      const GuestProfilePage(),
    ];

    return Scaffold(
      body: IndexedStack(index: _index, children: pages),
      bottomNavigationBar: ConvexAppBar(
        style: TabStyle.react,
        backgroundColor: const Color(0xFF304FFE),
        activeColor: Colors.white,
        color: Colors.white70,
        height: 65,
        curveSize: 90,
        top: -30,
        gradient: LinearGradient(
          colors: [
            const Color(0xFF304FFE),
            const Color(0xFF1976D2),
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        items: [
          TabItem(icon: FontAwesomeIcons.house, title: 'Trang chủ'),
          TabItem(icon: FontAwesomeIcons.paw, title: 'Dịch vụ'),
          TabItem(icon: FontAwesomeIcons.calendarCheck, title: 'Đặt lịch'),
          TabItem(icon: FontAwesomeIcons.user, title: 'Tài khoản'),
        ],
        initialActiveIndex: _index,
        onTap: (int i) => setState(() => _index = i),
      ),
    );
  }
}

// Tách content của GuestHomePage để tái sử dụng
class GuestHomePageContent extends StatelessWidget {
  const GuestHomePageContent({super.key});

  @override
  Widget build(BuildContext context) {
    return const GuestHomePage();
  }
}
