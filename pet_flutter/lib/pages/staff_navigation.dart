import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import 'package:convex_bottom_bar/convex_bottom_bar.dart';
import 'staff_dashboard_page.dart';
import 'staff_appointments_page.dart';
import 'staff_schedule_page.dart';
import 'staff_profile_page.dart';
import 'staff_chat_page.dart';

class StaffNavigation extends StatefulWidget {
  const StaffNavigation({super.key});

  @override
  State<StaffNavigation> createState() => _StaffNavigationState();
}

class _StaffNavigationState extends State<StaffNavigation> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final pages = <Widget>[
      const StaffDashboardPage(),
      const StaffAppointmentsPage(),
      const StaffSchedulePage(),
      const StaffChatPage(),
      const StaffProfilePage(),
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
          TabItem(icon: FontAwesomeIcons.chartLine, title: 'Tổng quan'),
          TabItem(icon: FontAwesomeIcons.calendarCheck, title: 'Lịch hẹn'),
          TabItem(icon: FontAwesomeIcons.calendar, title: 'Ca làm'),
          TabItem(icon: FontAwesomeIcons.comments, title: 'Chat'),
          TabItem(icon: FontAwesomeIcons.user, title: 'Hồ sơ'),
        ],
        initialActiveIndex: _index,
        onTap: (int i) => setState(() => _index = i),
      ),
    );
  }
}
