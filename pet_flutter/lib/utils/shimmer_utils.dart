import 'package:flutter/material.dart';
import 'package:shimmer/shimmer.dart';

class ShimmerUtils {
  // Default shimmer colors
  static const Color baseColor = Color(0xFFE0E0E0);
  static const Color highlightColor = Color(0xFFF5F5F5);
  
  // Custom shimmer colors for different themes
  static const Color darkBaseColor = Color(0xFF424242);
  static const Color darkHighlightColor = Color(0xFF616161);
  
  // Primary theme shimmer colors
  static const Color primaryBaseColor = Color(0xFFE3F2FD);
  static const Color primaryHighlightColor = Color(0xFFF3E5F5);

  /// Tạo shimmer effect với màu mặc định
  static Widget createShimmer({
    required Widget child,
    Color? baseColor,
    Color? highlightColor,
    bool enabled = true,
  }) {
    return Shimmer.fromColors(
      baseColor: baseColor ?? ShimmerUtils.baseColor,
      highlightColor: highlightColor ?? ShimmerUtils.highlightColor,
      enabled: enabled,
      child: child,
    );
  }

  /// Tạo shimmer effect với theme primary
  static Widget createPrimaryShimmer({
    required Widget child,
    bool enabled = true,
  }) {
    return Shimmer.fromColors(
      baseColor: primaryBaseColor,
      highlightColor: primaryHighlightColor,
      enabled: enabled,
      child: child,
    );
  }

  /// Tạo shimmer effect cho dark theme
  static Widget createDarkShimmer({
    required Widget child,
    bool enabled = true,
  }) {
    return Shimmer.fromColors(
      baseColor: darkBaseColor,
      highlightColor: darkHighlightColor,
      enabled: enabled,
      child: child,
    );
  }

  /// Tạo shimmer effect với animation tùy chỉnh
  static Widget createCustomShimmer({
    required Widget child,
    Color? baseColor,
    Color? highlightColor,
    Duration period = const Duration(milliseconds: 1500),
    bool enabled = true,
  }) {
    return Shimmer.fromColors(
      baseColor: baseColor ?? ShimmerUtils.baseColor,
      highlightColor: highlightColor ?? ShimmerUtils.highlightColor,
      period: period,
      enabled: enabled,
      child: child,
    );
  }

  /// Tạo shimmer effect cho text
  static Widget shimmerText({
    required double width,
    double height = 16.0,
    double borderRadius = 4.0,
    EdgeInsetsGeometry? margin,
    Color? baseColor,
    Color? highlightColor,
  }) {
    return Container(
      margin: margin,
      child: createShimmer(
        baseColor: baseColor,
        highlightColor: highlightColor,
        child: Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(borderRadius),
          ),
        ),
      ),
    );
  }

  /// Tạo shimmer effect cho button
  static Widget shimmerButton({
    required double width,
    double height = 48.0,
    double borderRadius = 8.0,
    EdgeInsetsGeometry? margin,
    Color? baseColor,
    Color? highlightColor,
  }) {
    return Container(
      margin: margin,
      child: createShimmer(
        baseColor: baseColor,
        highlightColor: highlightColor,
        child: Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(borderRadius),
          ),
        ),
      ),
    );
  }

  /// Tạo shimmer effect cho card
  static Widget shimmerCard({
    required double width,
    required double height,
    double borderRadius = 12.0,
    EdgeInsetsGeometry? margin,
    EdgeInsetsGeometry? padding,
    Color? baseColor,
    Color? highlightColor,
  }) {
    return Container(
      margin: margin,
      child: createShimmer(
        baseColor: baseColor,
        highlightColor: highlightColor,
        child: Container(
          width: width,
          height: height,
          padding: padding,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(borderRadius),
            boxShadow: [
              BoxShadow(
                color: Colors.grey.withOpacity(0.1),
                spreadRadius: 1,
                blurRadius: 4,
                offset: const Offset(0, 2),
              ),
            ],
          ),
        ),
      ),
    );
  }

  /// Tạo shimmer effect cho avatar
  static Widget shimmerAvatar({
    required double size,
    EdgeInsetsGeometry? margin,
    Color? baseColor,
    Color? highlightColor,
  }) {
    return Container(
      margin: margin,
      child: createShimmer(
        baseColor: baseColor,
        highlightColor: highlightColor,
        child: Container(
          width: size,
          height: size,
          decoration: const BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
          ),
        ),
      ),
    );
  }

  /// Tạo shimmer effect cho list item
  static Widget shimmerListItem({
    required double width,
    double height = 80.0,
    EdgeInsetsGeometry? margin,
    Color? baseColor,
    Color? highlightColor,
  }) {
    return Container(
      margin: margin ?? const EdgeInsets.symmetric(vertical: 8.0),
      child: createShimmer(
        baseColor: baseColor,
        highlightColor: highlightColor,
        child: Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(8.0),
          ),
        ),
      ),
    );
  }

  /// Tạo shimmer effect cho banner
  static Widget shimmerBanner({
    required double width,
    double height = 200.0,
    double borderRadius = 12.0,
    EdgeInsetsGeometry? margin,
    Color? baseColor,
    Color? highlightColor,
  }) {
    return Container(
      margin: margin,
      child: createShimmer(
        baseColor: baseColor,
        highlightColor: highlightColor,
        child: Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(borderRadius),
          ),
        ),
      ),
    );
  }

  /// Tạo shimmer effect cho input field
  static Widget shimmerInputField({
    required double width,
    double height = 56.0,
    double borderRadius = 8.0,
    EdgeInsetsGeometry? margin,
    Color? baseColor,
    Color? highlightColor,
  }) {
    return Container(
      margin: margin,
      child: createShimmer(
        baseColor: baseColor,
        highlightColor: highlightColor,
        child: Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(borderRadius),
            border: Border.all(color: Colors.grey.shade200),
          ),
        ),
      ),
    );
  }

  /// Tạo shimmer effect cho loading page
  static Widget shimmerLoadingPage({
    required Widget child,
    bool isLoading = true,
    Color? baseColor,
    Color? highlightColor,
  }) {
    if (isLoading) {
      return createShimmer(
        baseColor: baseColor,
        highlightColor: highlightColor,
        child: child,
      );
    }
    return child;
  }

  /// Tạo shimmer effect cho grid
  static Widget shimmerGrid({
    required int itemCount,
    required int crossAxisCount,
    double childAspectRatio = 1.0,
    double crossAxisSpacing = 8.0,
    double mainAxisSpacing = 8.0,
    EdgeInsetsGeometry? padding,
    Color? baseColor,
    Color? highlightColor,
  }) {
    return Padding(
      padding: padding ?? EdgeInsets.zero,
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: crossAxisCount,
          childAspectRatio: childAspectRatio,
          crossAxisSpacing: crossAxisSpacing,
          mainAxisSpacing: mainAxisSpacing,
        ),
        itemCount: itemCount,
        itemBuilder: (context, index) => shimmerCard(
          width: double.infinity,
          height: double.infinity,
          baseColor: baseColor,
          highlightColor: highlightColor,
        ),
      ),
    );
  }

  /// Tạo shimmer effect cho list
  static Widget shimmerList({
    required int itemCount,
    double itemHeight = 80.0,
    EdgeInsetsGeometry? padding,
    Color? baseColor,
    Color? highlightColor,
  }) {
    return Padding(
      padding: padding ?? EdgeInsets.zero,
      child: Column(
        children: List.generate(
          itemCount,
          (index) => shimmerListItem(
            width: double.infinity,
            height: itemHeight,
            baseColor: baseColor,
            highlightColor: highlightColor,
          ),
        ),
      ),
    );
  }
}
