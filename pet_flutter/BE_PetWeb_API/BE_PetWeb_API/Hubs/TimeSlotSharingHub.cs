using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;

namespace BE_PetWeb_API.Hubs
{
    public class TimeSlotSharingHub : Hub
    {
        private readonly ILogger<TimeSlotSharingHub> _logger;
        
        // In-memory storage cho active slot selections
        private static readonly ConcurrentDictionary<string, SlotSelection> _activeSelections = new();
        private static readonly ConcurrentDictionary<string, HashSet<string>> _roomUsers = new();

        public TimeSlotSharingHub(ILogger<TimeSlotSharingHub> logger)
        {
            _logger = logger;
        }

        // Model cho slot selection
        public class SlotSelection
        {
            public string TimeSlot { get; set; }
            public string UserId { get; set; }
            public string UserName { get; set; }
            public string RoomKey { get; set; }
            public DateTime Timestamp { get; set; }
        }

        // Join room cho specific service + staff + date
        public async Task JoinTimeSlotRoom(string roomKey)
        {
            try
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, roomKey);
                
                // Track users in room
                _roomUsers.AddOrUpdate(roomKey, 
                    new HashSet<string> { Context.ConnectionId },
                    (key, existing) => { existing.Add(Context.ConnectionId); return existing; });

                _logger.LogInformation($"User {Context.ConnectionId} joined time slot room: {roomKey}");

                // Send current active selections in this room to new user
                var roomSelections = _activeSelections.Values
                    .Where(s => s.RoomKey == roomKey)
                    .ToList();

                if (roomSelections.Any())
                {
                    foreach (var selection in roomSelections)
                    {
                        await Clients.Caller.SendAsync("TimeSlotSelected", new
                        {
                            timeSlot = selection.TimeSlot,
                            userId = selection.UserId,
                            userName = selection.UserName,
                            roomKey = selection.RoomKey,
                            timestamp = selection.Timestamp
                        });
                    }
                }

                // Notify others about new user (optional)
                await Clients.OthersInGroup(roomKey).SendAsync("UserJoinedTimeSlotRoom", new
                {
                    userId = Context.UserIdentifier ?? Context.ConnectionId,
                    userName = Context.User?.Identity?.Name ?? "Anonymous",
                    roomKey = roomKey,
                    userCount = _roomUsers.GetValueOrDefault(roomKey)?.Count ?? 0
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error joining time slot room: {RoomKey}", roomKey);
            }
        }

        // Leave room
        public async Task LeaveTimeSlotRoom(string roomKey)
        {
            try
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomKey);
                
                // Remove user from room tracking
                if (_roomUsers.TryGetValue(roomKey, out var users))
                {
                    users.Remove(Context.ConnectionId);
                    if (!users.Any())
                    {
                        _roomUsers.TryRemove(roomKey, out _);
                    }
                }

                // Clear any selections by this user in this room
                var userSelections = _activeSelections.Values
                    .Where(s => s.RoomKey == roomKey && (s.UserId == Context.UserIdentifier || s.UserId == Context.ConnectionId))
                    .ToList();

                foreach (var selection in userSelections)
                {
                    var key = $"{roomKey}_{selection.TimeSlot}_{selection.UserId}";
                    if (_activeSelections.TryRemove(key, out _))
                    {
                        await Clients.OthersInGroup(roomKey).SendAsync("TimeSlotCleared", new
                        {
                            timeSlot = selection.TimeSlot,
                            userId = selection.UserId,
                            userName = selection.UserName,
                            roomKey = roomKey
                        });
                    }
                }

                _logger.LogInformation($"User {Context.ConnectionId} left time slot room: {roomKey}");

                // Notify others about user leaving
                await Clients.OthersInGroup(roomKey).SendAsync("UserLeftTimeSlotRoom", new
                {
                    userId = Context.UserIdentifier ?? Context.ConnectionId,
                    userName = Context.User?.Identity?.Name ?? "Anonymous",
                    roomKey = roomKey,
                    userCount = _roomUsers.GetValueOrDefault(roomKey)?.Count ?? 0
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error leaving time slot room: {RoomKey}", roomKey);
            }
        }

        // Notify when user selects a time slot
        public async Task NotifyTimeSlotSelected(TimeSlotSelectionRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.RoomKey) || string.IsNullOrEmpty(request.TimeSlot))
                {
                    _logger.LogWarning("Invalid time slot selection request");
                    return;
                }

                var userId = request.UserId ?? Context.UserIdentifier ?? Context.ConnectionId;
                var userName = request.UserName ?? Context.User?.Identity?.Name ?? "Anonymous";

                // Store the selection
                var selection = new SlotSelection
                {
                    TimeSlot = request.TimeSlot,
                    UserId = userId,
                    UserName = userName,
                    RoomKey = request.RoomKey,
                    Timestamp = DateTime.UtcNow
                };

                var key = $"{request.RoomKey}_{request.TimeSlot}_{userId}";
                _activeSelections.AddOrUpdate(key, selection, (k, existing) => selection);

                _logger.LogInformation($"User {userId} selected time slot {request.TimeSlot} in room {request.RoomKey}");

                // Broadcast to others in the same room (excluding sender) - without username for privacy
                await Clients.OthersInGroup(request.RoomKey).SendAsync("TimeSlotSelected", new
                {
                    timeSlot = request.TimeSlot,
                    userId = userId,
                    roomKey = request.RoomKey,
                    serviceId = request.ServiceId,
                    staffId = request.StaffId,
                    date = request.Date,
                    timestamp = selection.Timestamp
                });

                // Auto-clear after 30 seconds to prevent stuck selections
                _ = Task.Delay(TimeSpan.FromSeconds(30)).ContinueWith(async _ =>
                {
                    if (_activeSelections.TryRemove(key, out var removedSelection))
                    {
                        await Clients.Group(request.RoomKey).SendAsync("TimeSlotAutoCleared", new
                        {
                            timeSlot = removedSelection.TimeSlot,
                            userId = removedSelection.UserId,
                            roomKey = removedSelection.RoomKey,
                            reason = "Timeout"
                        });
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in NotifyTimeSlotSelected");
            }
        }

        // Notify when user clears/deselects a time slot
        public async Task NotifyTimeSlotCleared(TimeSlotSelectionRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.RoomKey) || string.IsNullOrEmpty(request.TimeSlot))
                {
                    return;
                }

                var userId = request.UserId ?? Context.UserIdentifier ?? Context.ConnectionId;
                var key = $"{request.RoomKey}_{request.TimeSlot}_{userId}";

                if (_activeSelections.TryRemove(key, out var selection))
                {
                    _logger.LogInformation($"User {userId} cleared time slot {request.TimeSlot} in room {request.RoomKey}");

                    // Broadcast to others in the same room (excluding sender) - without username for privacy
                    await Clients.OthersInGroup(request.RoomKey).SendAsync("TimeSlotCleared", new
                    {
                        timeSlot = request.TimeSlot,
                        userId = userId,
                        roomKey = request.RoomKey,
                        timestamp = DateTime.UtcNow
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in NotifyTimeSlotCleared");
            }
        }

        // Get active selections for a room
        public async Task GetActiveSelections(string roomKey)
        {
            try
            {
                var roomSelections = _activeSelections.Values
                    .Where(s => s.RoomKey == roomKey)
                    .Select(s => new
                    {
                        timeSlot = s.TimeSlot,
                        userId = s.UserId,
                        userName = s.UserName,
                        timestamp = s.Timestamp
                    })
                    .ToList();

                await Clients.Caller.SendAsync("ActiveSelections", new
                {
                    roomKey = roomKey,
                    selections = roomSelections
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active selections for room: {RoomKey}", roomKey);
            }
        }

        // Override disconnect to clean up
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            try
            {
                // Clean up all selections by this user
                var userSelections = _activeSelections.Values
                    .Where(s => s.UserId == Context.UserIdentifier || s.UserId == Context.ConnectionId)
                    .ToList();

                foreach (var selection in userSelections)
                {
                    var key = $"{selection.RoomKey}_{selection.TimeSlot}_{selection.UserId}";
                    if (_activeSelections.TryRemove(key, out _))
                    {
                        await Clients.Group(selection.RoomKey).SendAsync("TimeSlotCleared", new
                        {
                            timeSlot = selection.TimeSlot,
                            userId = selection.UserId,
                            userName = selection.UserName,
                            roomKey = selection.RoomKey,
                            reason = "UserDisconnected"
                        });
                    }
                }

                // Remove from all rooms
                foreach (var (roomKey, users) in _roomUsers.ToList())
                {
                    if (users.Remove(Context.ConnectionId))
                    {
                        if (!users.Any())
                        {
                            _roomUsers.TryRemove(roomKey, out _);
                        }

                        await Clients.Group(roomKey).SendAsync("UserLeftTimeSlotRoom", new
                        {
                            userId = Context.UserIdentifier ?? Context.ConnectionId,
                            userName = Context.User?.Identity?.Name ?? "Anonymous",
                            roomKey = roomKey,
                            userCount = users.Count,
                            reason = "Disconnected"
                        });
                    }
                }

                _logger.LogInformation($"User {Context.ConnectionId} disconnected and cleaned up");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during disconnect cleanup");
            }

            await base.OnDisconnectedAsync(exception);
        }

        // Test method
        public async Task Echo(string message)
        {
            await Clients.Caller.SendAsync("Echo", $"Echo: {message} at {DateTime.Now}");
        }
    }

    // Request model
    public class TimeSlotSelectionRequest
    {
        public string RoomKey { get; set; }
        public string TimeSlot { get; set; }
        public string UserId { get; set; }
        public string UserName { get; set; }
        public int? ServiceId { get; set; }
        public int? StaffId { get; set; }
        public string Date { get; set; }
    }
} 