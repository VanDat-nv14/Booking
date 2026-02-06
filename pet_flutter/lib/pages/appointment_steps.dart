import 'dart:async';
import 'package:flutter/material.dart';
import '../models/appointment.dart';
import '../models/time_slot.dart';
import '../services/appointment_service.dart';
import '../services/service_service.dart';
import '../services/pet_service.dart';
import '../services/secure_storage.dart';
import '../services/signalr_service.dart';

// Step 1: Chọn dịch vụ
class ServiceStep extends StatefulWidget {
  final AppointmentBookingData bookingData;
  final Function(Service) onChanged;
  const ServiceStep({required this.bookingData, required this.onChanged, super.key});

  @override
  State<ServiceStep> createState() => _ServiceStepState();
}

class _ServiceStepState extends State<ServiceStep> {
  bool isLoading = true;
  List<Service> services = [];
  String? error;

  @override
  void initState() {
    super.initState();
    _fetchServices();
  }

  Future<void> _fetchServices() async {
    setState(() { isLoading = true; });
    try {
      final svc = ServiceService();
      final data = await svc.getServices();
      services = data.map((e) => Service.fromJson(e)).toList();
      // Đảm bảo không có dữ liệu cứng, chỉ lấy từ API
    } catch (e) {
      error = e.toString();
    } finally {
      setState(() { isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) return const Center(child: CircularProgressIndicator());
    if (error != null) return Center(child: Text(error!, style: TextStyle(color: Colors.red)));
    return Column(
      children: [
        ...services.map((service) => ListTile(
          title: Text(service.name),
          subtitle: Text(service.description),
          trailing: Text('${service.price}đ'),
          selected: widget.bookingData.selectedService?.serviceId == service.serviceId,
          onTap: () => widget.onChanged(service),
        ))
      ],
    );
  }
}

// Step 2: Chọn thú cưng
class PetStep extends StatefulWidget {
  final AppointmentBookingData bookingData;
  final Function(Pet) onChanged;
  const PetStep({required this.bookingData, required this.onChanged, super.key});

  @override
  State<PetStep> createState() => _PetStepState();
}

class _PetStepState extends State<PetStep> {
  bool isLoading = true;
  List<Pet> pets = [];
  String? error;

  @override
  void initState() {
    super.initState();
    _fetchPets();
  }

  Future<void> _fetchPets() async {
    setState(() { isLoading = true; });
    try {
      final svc = PetService();
      final token = await SecureStorageService().readToken();
      if (token == null) throw Exception('Bạn chưa đăng nhập');
      final data = await svc.getUserPets(token);
      pets = data.map((e) => Pet.fromJson(e)).toList();
    } catch (e) {
      error = e.toString();
    } finally {
      setState(() { isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
      children: [
            CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation<Color>(Theme.of(context).colorScheme.primary),
            ),
            const SizedBox(height: 16),
            Text(
              'Đang tải thú cưng...',
              style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
      );
    }
    
    if (error != null) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.error_outline,
                  size: 64,
                  color: Colors.red.shade400,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Có lỗi xảy ra',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: Colors.red.shade700,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                error!,
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey.shade600,
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: _fetchPets,
                icon: const Icon(Icons.refresh),
                label: const Text('Thử lại'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),
        ),
      );
    }
    
    if (pets.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.pets,
                  size: 64,
                  color: Colors.grey.shade400,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Chưa có thú cưng nào',
                style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                  color: Colors.grey.shade600,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Vui lòng thêm thú cưng trước khi đặt lịch',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: Colors.grey.shade500,
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                onPressed: () {
                  // TODO: Navigate to add pet page
                },
                icon: const Icon(Icons.add),
                label: const Text('Thêm thú cưng'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).colorScheme.primary,
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ),
        ),
      );
    }
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
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
                  child: const Icon(
                    Icons.pets,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Chọn thú cưng',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Chọn thú cưng cần được chăm sóc',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          
          // Pets list
          ...pets.map((pet) => _buildPetCard(context, pet)),
        ],
      ),
    );
  }

  Widget _buildPetCard(BuildContext context, Pet pet) {
    final isSelected = widget.bookingData.selectedPet?.petId == pet.petId;
    final species = pet.species.toLowerCase();
    
    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.only(bottom: 20),
      child: Material(
        elevation: isSelected ? 12 : 4,
        shadowColor: isSelected 
            ? Theme.of(context).colorScheme.primary.withOpacity(0.3)
            : Colors.grey.withOpacity(0.2),
        borderRadius: BorderRadius.circular(20),
        child: Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: isSelected 
                  ? Theme.of(context).colorScheme.primary
                  : Colors.transparent,
              width: 2,
            ),
          ),
          child: InkWell(
            borderRadius: BorderRadius.circular(20),
            onTap: () => widget.onChanged(pet),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Row(
                children: [
                  // Enhanced Pet Avatar
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: isSelected
                            ? [
                                _getSpeciesColor(species),
                                _getSpeciesColor(species).withOpacity(0.8),
                              ]
                            : [
                                _getSpeciesColor(species).withOpacity(0.1),
                                _getSpeciesColor(species).withOpacity(0.05),
                              ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: isSelected
                            ? _getSpeciesColor(species)
                            : _getSpeciesColor(species).withOpacity(0.2),
                        width: isSelected ? 3 : 2,
                      ),
                      boxShadow: isSelected ? [
                        BoxShadow(
                          color: _getSpeciesColor(species).withOpacity(0.3),
                          blurRadius: 12,
                          spreadRadius: 2,
                        ),
                      ] : null,
                    ),
                    child: pet.imageUrl != null
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(17),
                            child: Image.network(
                              pet.imageUrl!,
                              fit: BoxFit.cover,
                              errorBuilder: (context, error, stackTrace) {
                                return Center(
                                  child: Icon(
                                    _getSpeciesIcon(species),
                                    color: isSelected 
                                        ? Colors.white
                                        : _getSpeciesColor(species),
                                    size: 32,
                                  ),
                                );
                              },
                            ),
                          )
                        : Center(
                            child: Icon(
                              _getSpeciesIcon(species),
                              color: isSelected 
                                  ? Colors.white
                                  : _getSpeciesColor(species),
                              size: 32,
                            ),
                          ),
                  ),
                  const SizedBox(width: 20),
                  
                  // Enhanced Pet Info
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          pet.name,
                          style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: isSelected 
                                ? Theme.of(context).colorScheme.primary
                                : Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: isSelected
                                  ? [
                                      _getSpeciesColor(species),
                                      _getSpeciesColor(species).withOpacity(0.8),
                                    ]
                                  : [
                                      _getSpeciesColor(species).withOpacity(0.1),
                                      _getSpeciesColor(species).withOpacity(0.05),
                                    ],
                            ),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Text(
                            _getSpeciesName(species),
                            style: TextStyle(
                              color: isSelected 
                                  ? Colors.white
                                  : _getSpeciesColor(species),
                              fontSize: 14,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                              decoration: BoxDecoration(
                                color: Colors.blue.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    pet.gender == 'Male' ? Icons.male : Icons.female,
                                    size: 14,
                                    color: Colors.blue.shade600,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    pet.gender == 'Male' ? 'Đực' : 'Cái',
                                    style: TextStyle(
                                      color: Colors.blue.shade600,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            if (pet.age != null) ...[
                              const SizedBox(width: 12),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.orange.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.cake,
                                      size: 14,
                                      color: Colors.orange.shade600,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${pet.age} tuổi',
                                      style: TextStyle(
                                        color: Colors.orange.shade600,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                            if (pet.weight != null) ...[
                              const SizedBox(width: 12),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                decoration: BoxDecoration(
                                  color: Colors.green.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.monitor_weight,
                                      size: 14,
                                      color: Colors.green.shade600,
                                    ),
                                    const SizedBox(width: 4),
                                    Text(
                                      '${pet.weight}kg',
                                      style: TextStyle(
                                        color: Colors.green.shade600,
                                        fontSize: 12,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ),
                  ),
                  
                  // Enhanced Selection indicator
                  if (isSelected)
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            Theme.of(context).colorScheme.primary,
                            Theme.of(context).colorScheme.primary.withOpacity(0.8),
                          ],
                        ),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Theme.of(context).colorScheme.primary.withOpacity(0.4),
                            blurRadius: 12,
                            spreadRadius: 2,
                          ),
                        ],
                      ),
                      child: const Icon(
                        Icons.check,
                        color: Colors.white,
                        size: 24,
                      ),
                    ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Color _getSpeciesColor(String species) {
    switch (species.toLowerCase()) {
      case 'dog':
      case 'chó':
        return Colors.orange;
      case 'cat':
      case 'mèo':
        return Colors.purple;
      case 'bird':
      case 'chim':
        return Colors.blue;
      case 'fish':
      case 'cá':
        return Colors.cyan;
      case 'rabbit':
      case 'thỏ':
        return Colors.pink;
      default:
        return Theme.of(context).colorScheme.primary;
    }
  }

  IconData _getSpeciesIcon(String species) {
    switch (species.toLowerCase()) {
      case 'dog':
      case 'chó':
        return Icons.pets;
      case 'cat':
      case 'mèo':
        return Icons.pets;
      case 'bird':
      case 'chim':
        return Icons.pets;
      case 'fish':
      case 'cá':
        return Icons.pets;
      case 'rabbit':
      case 'thỏ':
        return Icons.pets;
      default:
        return Icons.pets;
    }
  }

  String _getSpeciesName(String species) {
    switch (species.toLowerCase()) {
      case 'dog':
      case 'chó':
        return 'Chó';
      case 'cat':
      case 'mèo':
        return 'Mèo';
      case 'bird':
      case 'chim':
        return 'Chim';
      case 'fish':
      case 'cá':
        return 'Cá';
      case 'rabbit':
      case 'thỏ':
        return 'Thỏ';
      default:
        return species.isNotEmpty ? species : 'Khác';
    }
  }
}

// Step 3: Chọn ngày và giờ
class DateTimeStep extends StatefulWidget {
  final AppointmentBookingData bookingData;
  final Function(DateTime, TimeSlot, Staff) onChanged;
  const DateTimeStep({required this.bookingData, required this.onChanged, super.key});

  @override
  State<DateTimeStep> createState() => _DateTimeStepState();
}

class _DateTimeStepState extends State<DateTimeStep> {
  DateTime? selectedDate;
  TimeSlot? selectedSlot;
  Staff? selectedStaff;
  List<Staff> staffList = [];
  List<TimeSlot> slots = [];
  bool isLoading = false;
  
  // SignalR real-time functionality
  final SignalRService _signalRService = SignalRService();
  StreamSubscription<TimeSlotSelectionEvent>? _slotSelectedSubscription;
  StreamSubscription<TimeSlotSelectionEvent>? _slotClearedSubscription;
  StreamSubscription<bool>? _connectionStatusSubscription;
  
  // Track other users' selections
  final Map<String, TimeSlotSelectionEvent> _otherUsersSelections = {};
  bool _signalRConnected = false;
  String? _currentRoomKey;

  Future<void> fetchStaff() async {
    if (widget.bookingData.selectedService == null) {
      staffList = [];
      setState(() {});
      return;
    }
    try {
      staffList = await AppointmentService().getStaffByService(widget.bookingData.selectedService!.serviceId);
      setState(() {});
    } catch (e) {
      staffList = [];
      setState(() {});
    }
  }

  void fetchSlots() async {
    if (widget.bookingData.selectedService == null || widget.bookingData.selectedPet == null) return;
    setState(() { isLoading = true; });
    final service = AppointmentService();
    slots = await service.getAvailableTimeSlots(
      date: selectedDate ?? DateTime.now(),
      serviceId: widget.bookingData.selectedService!.serviceId,
      petId: widget.bookingData.selectedPet!.petId,
      staffId: selectedStaff?.staffId,
    );
    setState(() { isLoading = false; });
  }

  @override
  void initState() {
    super.initState();
    fetchStaff();
    _initializeSignalR();
  }

  @override
  void didUpdateWidget(covariant DateTimeStep oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.bookingData.selectedService != widget.bookingData.selectedService) {
      selectedStaff = null;
      fetchStaff();
    }
  }

  @override
  void dispose() {
    _slotSelectedSubscription?.cancel();
    _slotClearedSubscription?.cancel();
    _connectionStatusSubscription?.cancel();
    _leaveCurrentRoom();
    super.dispose();
  }

  // Initialize SignalR connection
  Future<void> _initializeSignalR() async {
    try {
      print('🔌 [DEBUG] Starting SignalR initialization...');
      final success = await _signalRService.initialize();
      print('🔌 [DEBUG] SignalR initialize result: $success');
      
      if (success) {
        setState(() {
          _signalRConnected = true;
        });
        _setupSignalRListeners();
        print('✅ [DEBUG] SignalR initialized and listeners setup');
      } else {
        setState(() {
          _signalRConnected = false;
        });
        print('❌ [DEBUG] SignalR initialization failed');
      }
    } catch (e) {
      print('❌ Failed to initialize SignalR: $e');
      setState(() {
        _signalRConnected = false;
      });
    }
  }

  // Setup SignalR event listeners
  void _setupSignalRListeners() {
    // Listen for connection status changes
    _connectionStatusSubscription = _signalRService.connectionStatusStream.listen((isConnected) {
      print('🔌 [DEBUG] SignalR connection status changed: $isConnected');
      setState(() {
        _signalRConnected = isConnected;
      });
      
      if (isConnected && _currentRoomKey != null) {
        // Rejoin room after reconnection
        print('🔄 [DEBUG] Rejoining room after reconnection: $_currentRoomKey');
        _signalRService.joinTimeSlotRoom(_currentRoomKey!);
      }
      
      if (isConnected) {
        // Try to join room if we have all required data
        _joinSignalRRoom();
      }
    });

    // Listen for other users selecting slots
    _slotSelectedSubscription = _signalRService.timeSlotSelectedStream.listen((event) {
      print('🔔 [DEBUG] Received TimeSlotSelected: ${event.timeSlot} by ${event.userName}');
      print('🔔 [DEBUG] Current room: $_currentRoomKey');
      print('🔔 [DEBUG] Event room: ${event.roomKey}');
      
      setState(() {
        _otherUsersSelections[event.timeSlot] = event;
      });
      
      print('🔔 [DEBUG] Total selections: ${_otherUsersSelections.length}');
      
      // Auto-clear after 15 seconds (same as web)
      Timer(const Duration(seconds: 15), () {
        setState(() {
          _otherUsersSelections.remove(event.timeSlot);
        });
        print('⏰ [DEBUG] Auto-cleared ${event.timeSlot}');
      });
    });

    // Listen for other users clearing slots
    _slotClearedSubscription = _signalRService.timeSlotClearedStream.listen((event) {
      print('🔕 [DEBUG] Received TimeSlotCleared: ${event.timeSlot}');
      
      setState(() {
        _otherUsersSelections.remove(event.timeSlot);
      });
      
      print('🔕 [DEBUG] Total selections after clear: ${_otherUsersSelections.length}');
    });
  }

  // Join SignalR room when conditions are met
  Future<void> _joinSignalRRoom() async {
    print('🚪 [DEBUG] _joinSignalRRoom called');
    print('🚪 [DEBUG] Connected: $_signalRConnected');
    print('🚪 [DEBUG] Service: ${widget.bookingData.selectedService?.serviceId}');
    print('🚪 [DEBUG] Staff: ${selectedStaff?.staffId}');
    print('🚪 [DEBUG] Date: $selectedDate');
    
    if (!_signalRConnected) {
      print('⚠️ [DEBUG] Cannot join room: Not connected');
      return;
    }
    
    if (widget.bookingData.selectedService == null) {
      print('⚠️ [DEBUG] Cannot join room: No service selected');
      return;
    }
    
    if (selectedStaff == null) {
      print('⚠️ [DEBUG] Cannot join room: No staff selected');
      return;
    }
    
    if (selectedDate == null) {
      print('⚠️ [DEBUG] Cannot join room: No date selected');
      return;
    }

    final roomKey = _signalRService.generateRoomKey( 
      serviceId: widget.bookingData.selectedService!.serviceId.toString(),
      staffId: selectedStaff!.staffId.toString(),
      date: selectedDate!.toIso8601String().split('T')[0],
    );
    
    print('🚪 [DEBUG] Generated room key: $roomKey');
    print('🚪 [DEBUG] Current room key: $_currentRoomKey');

    if (_currentRoomKey != roomKey) {
      await _leaveCurrentRoom();
      
      print('🚪 [DEBUG] Attempting to join room: $roomKey');
      final success = await _signalRService.joinTimeSlotRoom(roomKey);
      if (success) {
        setState(() {
          _currentRoomKey = roomKey;
        });
        print('✅ Joined SignalR room: $roomKey');
      } else {
        print('❌ Failed to join room: $roomKey');
      }
    } else {
      print('ℹ️ [DEBUG] Already in room: $roomKey');
    }
  }

  // Leave current SignalR room
  Future<void> _leaveCurrentRoom() async {
    if (_currentRoomKey != null) {
      await _signalRService.leaveTimeSlotRoom(_currentRoomKey!); // leaveTimeSlotRoom là hàm để rời khỏi phòng SignalR
      _currentRoomKey = null;
      setState(() {
        _otherUsersSelections.clear(); // clear là hàm để xóa tất cả các phần tử trong map
      });
    }
  }

  // Notify slot selection via SignalR
  Future<void> _notifySlotSelection(TimeSlot slot) async {
    if (_currentRoomKey == null || !_signalRConnected) {
      print('⚠️ [DEBUG] Cannot notify: room=$_currentRoomKey, connected=$_signalRConnected');
      return;
    }

    final timeStr = '${slot.startTime.hour.toString().padLeft(2, '0')}:${slot.startTime.minute.toString().padLeft(2, '0')}';
    
    print('📤 [DEBUG] Broadcasting slot selection: $timeStr in room $_currentRoomKey');
    
    await _signalRService.notifyTimeSlotSelected(
      roomKey: _currentRoomKey!,
      timeSlot: timeStr,
      serviceId: widget.bookingData.selectedService!.serviceId.toString(),  // Send as string - backend will accept it
      staffId: selectedStaff!.staffId.toString(),  // Send as string - backend will accept it
      date: selectedDate!.toIso8601String().split('T')[0],
    );
    
    print('✅ [DEBUG] Broadcast complete for $timeStr');
  }

  // Notify slot deselection via SignalR
  Future<void> _notifySlotDeselection(TimeSlot slot) async {
    if (_currentRoomKey == null || !_signalRConnected) {
      print('⚠️ [DEBUG] Cannot notify clear: room=$_currentRoomKey, connected=$_signalRConnected');
      return;
    }

    final timeStr = '${slot.startTime.hour.toString().padLeft(2, '0')}:${slot.startTime.minute.toString().padLeft(2, '0')}';
    
    print('📤 [DEBUG] Broadcasting slot clear: $timeStr');
    
    await _signalRService.notifyTimeSlotCleared(
      roomKey: _currentRoomKey!,
      timeSlot: timeStr,
      serviceId: widget.bookingData.selectedService!.serviceId.toString(),
      staffId: selectedStaff!.staffId.toString(),
      date: selectedDate!.toIso8601String().split('T')[0],
    );
    
    print('✅ [DEBUG] Broadcast clear complete for $timeStr');
  }

  Widget _buildLegendItem(String icon, String label, Color color) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          icon,
          style: const TextStyle(fontSize: 12),
        ),
        const SizedBox(width: 4),
        Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: color.withOpacity(0.2),
            border: Border.all(color: color, width: 1),
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        const SizedBox(width: 4),
        Text(
          label,
          style: TextStyle(
            fontSize: 10,
            color: color,
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
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
                  child: const Icon(
                    Icons.schedule,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Chọn ngày và giờ',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Chọn nhân viên, ngày và khung giờ phù hợp',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.grey.shade600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      // SignalR status indicator with room info
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Icon(
                                _signalRConnected ? Icons.wifi : Icons.wifi_off,
                                size: 12,
                                color: _signalRConnected ? Colors.green : Colors.grey,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                _signalRConnected ? 'Real-time: Hoạt động' : 'Real-time: Tắt',
                                style: TextStyle(
                                  fontSize: 10,
                                  color: _signalRConnected ? Colors.green : Colors.grey,
                                ),
                              ),
                            ],
                          ),
                          if (_currentRoomKey != null) ...[
                            const SizedBox(height: 2),
                            Text(
                              'Room: $_currentRoomKey',
                              style: const TextStyle(
                                fontSize: 8,
                                color: Colors.grey,
                              ),
                            ),
                          ],
                          if (_otherUsersSelections.isNotEmpty) ...[
                            const SizedBox(height: 2),
                            Text(
                              '${_otherUsersSelections.length} người khác đang chọn',
                              style: const TextStyle(
                                fontSize: 8,
                                color: Colors.orange,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ],
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          
          // Staff Selection
          Container(
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
                      Icons.person,
                      color: Theme.of(context).colorScheme.primary,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Chọn nhân viên',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                DropdownButtonFormField<Staff>(
              initialValue: selectedStaff,
                  hint: Text(
                    'Chọn nhân viên phụ trách',
                    style: TextStyle(color: Colors.grey.shade600),
                  ),
                  decoration: InputDecoration(
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
                    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
              items: staffList.map((staff) => DropdownMenuItem(
                value: staff,
                    child: Text(
                      staff.fullName,
                      style: const TextStyle(fontWeight: FontWeight.w500),
                    ),
              )).toList(),
              onChanged: (staff) {
                setState(() { selectedStaff = staff; });
                fetchSlots();
                _joinSignalRRoom(); // Join SignalR room when staff is selected
              },
              isExpanded: true,
            ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          
          // Date Selection
          Container(
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
                      Icons.calendar_today,
                      color: Theme.of(context).colorScheme.primary,
                      size: 20,
                    ),
                    const SizedBox(width: 8),
                    Text(
                      'Chọn ngày',
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: Colors.grey.shade300),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: CalendarDatePicker(
                    initialDate: selectedDate ?? DateTime.now(),
            firstDate: DateTime.now(),
                    lastDate: DateTime.now().add(const Duration(days: 30)),
            onDateChanged: (date) {
              setState(() { selectedDate = date; });
              fetchSlots();
              _joinSignalRRoom(); // Join SignalR room when date is selected
            },
          ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          
          // Time Slots
          if (selectedDate != null) ...[
            Container(
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
                        Icons.access_time,
                        color: Theme.of(context).colorScheme.primary,
                        size: 20,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        'Chọn khung giờ',
                        style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  
                  // Legend - Chú thích màu sắc
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: Colors.grey.shade50,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.grey.shade200),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Chú thích:',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Colors.grey.shade700,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 16,
                          runSpacing: 8,
                          children: [
                            _buildLegendItem('✅', 'Khả dụng', Colors.green),
                            _buildLegendItem('🐕', 'Thú cưng bận', Colors.red),
                            _buildLegendItem('👤', 'Nhân viên bận', Colors.orange),
                            _buildLegendItem('👥', 'Người khác chọn', Colors.purple),
                            _buildLegendItem('⏰', 'Đã qua', Colors.grey),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 16),
                  
          if (isLoading) ...[
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32),
                        child: Column(
                          children: [
                            CircularProgressIndicator(
                              valueColor: AlwaysStoppedAnimation<Color>(
                                Theme.of(context).colorScheme.primary,
                              ),
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Đang tải khung giờ...',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Colors.grey.shade600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ] else if (slots.isEmpty) ...[
                    Center(
                      child: Padding(
                        padding: const EdgeInsets.all(32),
                        child: Column(
                          children: [
                            Icon(
                              Icons.schedule,
                              size: 48,
                              color: Colors.grey.shade400,
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Không có khung giờ khả dụng',
                              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                color: Colors.grey.shade600,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 8),
                            Text(
                              'Vui lòng chọn ngày khác hoặc nhân viên khác',
                              textAlign: TextAlign.center,
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: Colors.grey.shade500,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ] else ...[
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 3,
                childAspectRatio: 3.2,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
              ),
              itemCount: slots.length,
              itemBuilder: (context, index) {
                final slot = slots[index];
                Color borderColor;
                Color backgroundColor;
                String statusText;
                String statusIcon = '';
                bool isEnabled = false;
                        
                // Kiểm tra thời gian đã qua
                final now = DateTime.now();
                final isPast = slot.startTime.isBefore(now);
                
                // Kiểm tra người khác đang chọn
                final timeStr = '${slot.startTime.hour.toString().padLeft(2, '0')}:${slot.startTime.minute.toString().padLeft(2, '0')}';
                final otherUserSelection = _otherUsersSelections[timeStr];
                final isBeingSelectedByOthers = otherUserSelection != null;
                
                if (isPast) {
                  borderColor = Colors.grey;
                  backgroundColor = Colors.grey.shade50;
                  statusText = 'Đã qua';
                  statusIcon = '⏰';
                } else if (isBeingSelectedByOthers) {
                  // Ưu tiên cao: người khác đang chọn (màu tím như web)
                  borderColor = Colors.purple;
                  backgroundColor = Colors.purple.shade50;
                  statusText = '${otherUserSelection.userName} đang chọn';
                  statusIcon = '👥';
                } else if (slot.isPetBusy) {
                  // Ưu tiên cao nhất: thú cưng bận (màu đỏ như web)
                  borderColor = Colors.red;
                  backgroundColor = Colors.red.shade50;
                  statusText = 'Thú cưng bận';
                  statusIcon = '🐕';
                } else if (slot.isStaffBusy) {
                  // Ưu tiên thứ hai: nhân viên bận (màu cam như web)
                  borderColor = Colors.orange;
                  backgroundColor = Colors.orange.shade50;
                  statusText = 'Nhân viên bận';
                  statusIcon = '👤';
                } else if (!slot.isAvailable) {
                  // Không khả dụng vì lý do khác
                  borderColor = Colors.grey;
                  backgroundColor = Colors.grey.shade50;
                  statusText = 'Không khả dụng';
                  statusIcon = '❌';
                } else {
                  // Khả dụng (màu xanh như web)
                  borderColor = Colors.green;
                  backgroundColor = Colors.green.shade50;
                  statusText = 'Khả dụng';
                  statusIcon = '✅';
                  isEnabled = true;
                }
                        
                final isSelected = selectedSlot?.id == slot.id;
                        
                return GestureDetector(
                  onTap: isEnabled && selectedStaff != null && !isBeingSelectedByOthers
                      ? () async {
                          // Notify deselection of previous slot
                          if (selectedSlot != null) {
                            await _notifySlotDeselection(selectedSlot!);
                          }
                          
                          setState(() { selectedSlot = slot; });
                          widget.onChanged(
                            selectedDate!,
                            slot,
                            selectedStaff!,
                          );
                          
                          // Notify selection of new slot
                          await _notifySlotSelection(slot);
                        }
                      : null,
                  child: Stack(
                    children: [
                      // Main time slot card with pulse animation
                      AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        curve: Curves.easeInOut,
                        decoration: BoxDecoration(
                          gradient: isSelected
                              ? LinearGradient(
                                  colors: [
                                    Theme.of(context).colorScheme.primary,
                                    Theme.of(context).colorScheme.primary.withOpacity(0.8),
                                  ],
                                  begin: Alignment.topLeft,
                                  end: Alignment.bottomRight,
                                )
                              : LinearGradient(
                                  colors: [backgroundColor, backgroundColor],
                                ),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: isSelected 
                                ? Theme.of(context).colorScheme.primary
                                : borderColor,
                            width: isSelected ? 3 : 2,
                          ),
                          boxShadow: [
                            if (isSelected)
                              BoxShadow(
                                color: Theme.of(context).colorScheme.primary.withOpacity(0.4),
                                blurRadius: 12,
                                spreadRadius: 2,
                              )
                            else if (isBeingSelectedByOthers)
                              BoxShadow(
                                color: Colors.purple.withOpacity(0.3),
                                blurRadius: 8,
                                spreadRadius: 2,
                              )
                            else
                              BoxShadow(
                                color: Colors.grey.withOpacity(0.1),
                                blurRadius: 4,
                                spreadRadius: 1,
                              ),
                          ],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            borderRadius: BorderRadius.circular(16),
                            onTap: isEnabled && selectedStaff != null && !isBeingSelectedByOthers
                                ? () async {
                                    // Notify deselection of previous slot
                                    if (selectedSlot != null) {
                                      await _notifySlotDeselection(selectedSlot!);
                                    }
                                    
                                    setState(() { selectedSlot = slot; });
                                    widget.onChanged(
                                      selectedDate!,
                                      slot,
                                      selectedStaff!,
                                    );
                                    
                                    // Notify selection of new slot
                                    await _notifySlotSelection(slot);
                                  }
                                : null,
                            child: Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  // Enhanced Icon and Time
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      if (statusIcon.isNotEmpty) ...[
                                        Text(
                                          statusIcon,
                                          style: TextStyle(
                                            fontSize: 10,
                                            color: isSelected ? Colors.white : borderColor,
                                          ),
                                        ),
                                        const SizedBox(width: 2),
                                      ],
                                      Flexible(
                                        child: Text(
                                          slot.formattedTime,
                                          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                                            fontWeight: FontWeight.bold,
                                            color: isSelected 
                                                ? Colors.white
                                                : borderColor,
                                            fontSize: 10,
                                          ),
                                          textAlign: TextAlign.center,
                                          maxLines: 1,
                                          overflow: TextOverflow.ellipsis,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 2),
                                  // Enhanced Status
                                  Flexible(
                                    child: Text(
                                      statusText,
                                      style: Theme.of(context).textTheme.bodySmall?.copyWith(
                                        color: isSelected 
                                            ? Colors.white.withOpacity(0.9)
                                            : borderColor,
                                        fontSize: 7,
                                        fontWeight: FontWeight.w600,
                                      ),
                                      textAlign: TextAlign.center,
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ),
                      
                      // User indicator badge (giống web - top-right corner)
                      if (isBeingSelectedByOthers)
                        Positioned(
                          top: -4,
                          right: -4,
                          child: Container(
                            padding: const EdgeInsets.all(4),
                            decoration: BoxDecoration(
                              color: Colors.purple,
                              shape: BoxShape.circle,
                              border: Border.all(
                                color: Colors.white,
                                width: 2,
                              ),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.purple.withOpacity(0.5),
                                  blurRadius: 4,
                                  spreadRadius: 1,
                                ),
                              ],
                            ),
                            child: const Icon(
                              Icons.person,
                              color: Colors.white,
                              size: 12,
                            ),
                          ),
                        ),
                      
                      // Pulse animation overlay cho slots being selected by others
                      if (isBeingSelectedByOthers)
                        Positioned.fill(
                          child: _PulsingBorder(),
                        ),
                    ],
                  ),
                );
              },
            ),
                  ],
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// Step 4: Xác nhận và thanh toán
class ConfirmStep extends StatelessWidget {
  final AppointmentBookingData bookingData;
  final String? errorMessage;
  final bool isLoading;
  final TextEditingController _notesController = TextEditingController();
  ConfirmStep({required this.bookingData, this.errorMessage, this.isLoading = false, super.key});

  @override
  Widget build(BuildContext context) {
    final service = bookingData.selectedService;
    final pet = bookingData.selectedPet;
    final staff = bookingData.selectedStaff;
    final date = bookingData.selectedDate;
  final slot = bookingData.selectedTimeSlot;

    final isComplete = service != null && pet != null && staff != null && slot != null;
    
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header với icon đẹp
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
                  child: const Icon(
                    Icons.check_circle_outline,
                    color: Colors.white,
                    size: 28,
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Xác nhận thông tin đặt lịch',
                        style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).colorScheme.primary,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Vui lòng kiểm tra lại thông tin trước khi xác nhận',
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          
          if (!isComplete)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.red.shade200),
              ),
              child: Row(
                children: [
                  Icon(Icons.warning, color: Colors.red.shade600),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      'Vui lòng chọn đầy đủ dịch vụ, thú cưng, nhân viên và khung giờ!',
                      style: TextStyle(color: Colors.red.shade700, fontWeight: FontWeight.w500),
                    ),
                  ),
                ],
              ),
            ),
          
          if (isComplete) ...[
            // Ghi chú section - Compact
            Container(
              margin: const EdgeInsets.only(bottom: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Ghi chú thêm (không bắt buộc)',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _notesController,
                    decoration: InputDecoration(
                      hintText: 'Nhập ghi chú cho lịch hẹn (tùy chọn)',
                      prefixIcon: const Icon(Icons.note_add),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: Theme.of(context).colorScheme.primary),
                      ),
                      filled: true,
                      fillColor: Colors.grey.shade50,
                    ),
                    maxLines: 2,
                    onChanged: (value) {
                      bookingData.notes = value;
                    },
                  ),
                ],
              ),
            ),
            // Enhanced Dịch vụ đã chọn
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              margin: const EdgeInsets.only(bottom: 20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    Colors.white,
                    Theme.of(context).colorScheme.primary.withOpacity(0.02),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Theme.of(context).colorScheme.primary.withOpacity(0.1),
                    spreadRadius: 2,
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Padding(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(12),
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
                                blurRadius: 8,
                                spreadRadius: 1,
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.medical_services,
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
                                'Dịch vụ đã chọn',
                                style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                  fontWeight: FontWeight.bold,
                                  color: Theme.of(context).colorScheme.primary,
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(
                                'Thông tin dịch vụ bạn đã lựa chọn',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Colors.grey.shade600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    Text(
                      service.name,
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                        fontWeight: FontWeight.bold,
                        color: Colors.black87,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      service.description,
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: Colors.grey.shade600,
                        height: 1.4,
                      ),
                    ),
                    const SizedBox(height: 20),
                    // Responsive service info cards
                    Column(
                      children: [
                        // First row - Category and Duration
                        Row(
                          children: [
                            Flexible(
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                                decoration: BoxDecoration(
                                  gradient: LinearGradient(
                                    colors: [
                                      Theme.of(context).colorScheme.primary.withOpacity(0.1),
                                      Theme.of(context).colorScheme.primary.withOpacity(0.05),
                                    ],
                                  ),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: Theme.of(context).colorScheme.primary.withOpacity(0.2),
                                  ),
                                ),
                                child: Text(
                                  service.category,
                                  style: TextStyle(
                                    color: Theme.of(context).colorScheme.primary,
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13,
                                  ),
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ),
                            const SizedBox(width: 12),
                            Flexible(
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                                decoration: BoxDecoration(
                                  color: Colors.blue.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(Icons.access_time, size: 14, color: Colors.blue.shade600),
                                    const SizedBox(width: 4),
                                    Flexible(
                                      child: Text(
                                        '${service.duration} phút',
                                        style: TextStyle(
                                          color: Colors.blue.shade600,
                                          fontWeight: FontWeight.w600,
                                          fontSize: 13,
                                        ),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 12),
                        // Second row - Price (full width)
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              colors: [
                                Colors.green.shade600,
                                Colors.green.shade500,
                              ],
                            ),
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.green.withOpacity(0.3),
                                blurRadius: 8,
                                spreadRadius: 1,
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.attach_money, size: 20, color: Colors.white),
                              const SizedBox(width: 8),
                              Text(
                                '${service.price.toStringAsFixed(0)}₫',
                                style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 18,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            // Compact Summary Section
            Container(
              margin: const EdgeInsets.only(bottom: 20),
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
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: Column(
                  children: [
                    // Pet Info Row
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.orange.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.pets, color: Colors.orange, size: 20),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                pet.name,
                                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                '${pet.species} • ${pet.age ?? '-'} tuổi • ${pet.weight ?? '-'} kg',
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Colors.grey.shade600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Staff Info Row
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.green.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.person, color: Colors.green, size: 20),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                staff.fullName,
                                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              if (staff.specialization != null)
                                Text(
                                  staff.specialization!,
                                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                    color: Colors.grey.shade600,
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    // Time Info Row
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.purple.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Icon(Icons.schedule, color: Colors.purple, size: 20),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                date != null ? '${date.day}/${date.month}/${date.year}' : '-',
                                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              Text(
                                slot.formattedTime,
                                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                  color: Colors.grey.shade600,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ),
            // Compact Important Notes
            Container(
              margin: const EdgeInsets.only(bottom: 20),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Theme.of(context).colorScheme.primary.withOpacity(0.05),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: Theme.of(context).colorScheme.primary.withOpacity(0.2),
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Icon(
                    Icons.info_outline,
                    color: Theme.of(context).colorScheme.primary,
                    size: 20,
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Lưu ý quan trọng',
                          style: Theme.of(context).textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: Theme.of(context).colorScheme.primary,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '• Đến sớm 10-15 phút • Hủy/đổi lịch trước 24h • Mang theo CMND',
                          style: Theme.of(context).textTheme.bodySmall?.copyWith(
                            color: Theme.of(context).colorScheme.primary.withOpacity(0.8),
                            height: 1.3,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],
          
          // Enhanced Nút xác nhận
          if (isComplete)
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              width: double.infinity,
              margin: const EdgeInsets.only(top: 24),
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      Theme.of(context).colorScheme.primary,
                      Theme.of(context).colorScheme.primary.withOpacity(0.8),
                    ],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(
                      color: Theme.of(context).colorScheme.primary.withOpacity(0.4),
                      blurRadius: 12,
                      spreadRadius: 2,
                      offset: const Offset(0, 4),
                    ),
                  ],
                ),
                child: ElevatedButton(
                  onPressed: isLoading ? null : () async {
                    // Gọi API tạo appointment, truyền thêm notes (không bắt buộc)
                    // ...existing code tạo appointment, truyền bookingData.notes...
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    padding: const EdgeInsets.symmetric(vertical: 20),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: isLoading
                      ? const SizedBox(
                          height: 24,
                          width: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 3,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.white.withOpacity(0.2),
                                shape: BoxShape.circle,
                              ),
                              child: const Icon(
                                Icons.check_circle,
                                size: 24,
                                color: Colors.white,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Text(
                              'Xác nhận đặt lịch',
                              style: Theme.of(context).textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.bold,
                                color: Colors.white,
                                fontSize: 18,
                              ),
                            ),
                          ],
                        ),
                ),
              ),
            ),
          if (errorMessage != null) ...[
            const SizedBox(height: 16),
            Text(errorMessage!, style: TextStyle(color: Colors.red)),
          ],
        ],
      ),
    );
  }
}

// Widget for pulsing border animation (giống web)
class _PulsingBorder extends StatefulWidget {
  const _PulsingBorder({super.key});

  @override
  State<_PulsingBorder> createState() => _PulsingBorderState();
}

class _PulsingBorderState extends State<_PulsingBorder> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    )..repeat(reverse: false);
    
    _animation = Tween<double>(begin: 0.0, end: 1.0).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return Container(
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: Colors.purple.withOpacity(0.7 - (_animation.value * 0.4)),
              width: 2,
            ),
          ),
        );
      },
    );
  }
}

