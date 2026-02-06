# Backend TimeSlotHub Implementation

## ⚠️ QUAN TRỌNG: Backend Hub Method Signature

Backend hiện tại đang gặp lỗi:
```
InvalidDataException: Error binding arguments. 
Make sure that the types of the provided values match the types of the hub method being invoked.
```

## ✅ Correct Implementation

### Option 1: Accept Dictionary<string, object>

```csharp
using Microsoft.AspNetCore.SignalR;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Hubs
{
    public class TimeSlotHub : Hub
    {
        // Accept Dictionary<string, object> from Flutter
        public async Task NotifyTimeSlotSelected(Dictionary<string, object> data)
        {
            var roomKey = data["roomKey"].ToString();
            var timeSlot = data["timeSlot"].ToString();
            var userId = data["userId"].ToString();
            var userName = data["userName"].ToString();
            
            Console.WriteLine($"📤 Broadcasting TimeSlotSelected to room: {roomKey}");
            Console.WriteLine($"   Slot: {timeSlot}, User: {userName}");
            
            // Broadcast to all in group EXCEPT sender
            await Clients.OthersInGroup(roomKey).SendAsync("TimeSlotSelected", data);
        }

        public async Task NotifyTimeSlotCleared(Dictionary<string, object> data)
        {
            var roomKey = data["roomKey"].ToString();
            var timeSlot = data["timeSlot"].ToString();
            
            Console.WriteLine($"📤 Broadcasting TimeSlotCleared to room: {roomKey}");
            Console.WriteLine($"   Slot: {timeSlot}");
            
            // Broadcast to all in group EXCEPT sender
            await Clients.OthersInGroup(roomKey).SendAsync("TimeSlotCleared", data);
        }

        public async Task JoinTimeSlotRoom(string roomKey)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, roomKey);
            Console.WriteLine($"✅ Connection {Context.ConnectionId} joined room: {roomKey}");
            
            await Clients.Group(roomKey).SendAsync("UserJoinedTimeSlotRoom", new
            {
                userId = Context.UserIdentifier,
                userName = Context.User?.Identity?.Name ?? "Anonymous",
                roomKey = roomKey
            });
        }

        public async Task LeaveTimeSlotRoom(string roomKey)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomKey);
            Console.WriteLine($"✅ Connection {Context.ConnectionId} left room: {roomKey}");
            
            await Clients.Group(roomKey).SendAsync("UserLeftTimeSlotRoom", new
            {
                userId = Context.UserIdentifier,
                userName = Context.User?.Identity?.Name ?? "Anonymous",
                roomKey = roomKey
            });
        }
    }
}
```

### Option 2: Accept Specific DTO Class

```csharp
// DTOs/TimeSlotNotificationDto.cs
public class TimeSlotNotificationDto
{
    public string RoomKey { get; set; }
    public string TimeSlot { get; set; }
    public string UserId { get; set; }
    public string UserName { get; set; }
    public string ServiceId { get; set; }
    public string StaffId { get; set; }
    public string Date { get; set; }
}

// Hubs/TimeSlotHub.cs
public async Task NotifyTimeSlotSelected(TimeSlotNotificationDto data)
{
    Console.WriteLine($"📤 Broadcasting TimeSlotSelected to room: {data.RoomKey}");
    Console.WriteLine($"   Slot: {data.TimeSlot}, User: {data.UserName}");
    
    await Clients.OthersInGroup(data.RoomKey).SendAsync("TimeSlotSelected", data);
}

public async Task NotifyTimeSlotCleared(TimeSlotNotificationDto data)
{
    Console.WriteLine($"📤 Broadcasting TimeSlotCleared to room: {data.RoomKey}");
    Console.WriteLine($"   Slot: {data.TimeSlot}");
    
    await Clients.OthersInGroup(data.RoomKey).SendAsync("TimeSlotCleared", data);
}
```

## 📝 Program.cs Configuration

Make sure to map the hub in `Program.cs`:

```csharp
// Add SignalR services
builder.Services.AddSignalR();

// ... other code ...

// Map SignalR hubs
app.MapHub<TimeSlotHub>("/timeSlotHub");
```

## 🔧 CORS Configuration (if needed)

```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFlutterApp", policy =>
    {
        policy.WithOrigins("http://localhost:*", "https://localhost:*")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ... later ...

app.UseCors("AllowFlutterApp");
```

## ✅ Test Backend

1. Run backend:
   ```bash
   dotnet run
   ```

2. Check console for:
   ```
   Now listening on: https://localhost:7164
   ```

3. When Flutter connects:
   ```
   ✅ Connection xyz123 joined room: service_1_staff_1_date_2025-10-16
   ```

4. When user selects slot:
   ```
   📤 Broadcasting TimeSlotSelected to room: service_1_staff_1_date_2025-10-16
      Slot: 16:40, User: Hùng
   ```

## 🚨 Current Error

Flutter is sending:
```json
{
  "roomKey": "service_1_staff_1_date_2025-10-16",
  "timeSlot": "16:40",
  "userId": "123",
  "userName": "Hùng",
  "serviceId": "1",
  "staffId": "1",
  "date": "2025-10-16"
}
```

Backend expects: **Dictionary<string, object>** OR **TimeSlotNotificationDto**

❌ Current backend signature is probably:
```csharp
// WRONG - multiple parameters
public async Task NotifyTimeSlotSelected(
    string roomKey, 
    string timeSlot, 
    string userId, 
    string userName, 
    string serviceId, 
    string staffId, 
    string date)
```

✅ Should be:
```csharp
// CORRECT - single parameter (Dictionary or DTO)
public async Task NotifyTimeSlotSelected(Dictionary<string, object> data)
// OR
public async Task NotifyTimeSlotSelected(TimeSlotNotificationDto data)
```

## 📊 Full Backend File

Save as: `BE_PetWeb_API/Hubs/TimeSlotHub.cs`

```csharp
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace BE_PetWeb_API.Hubs
{
    public class TimeSlotHub : Hub
    {
        public async Task NotifyTimeSlotSelected(Dictionary<string, object> data)
        {
            try
            {
                var roomKey = data["roomKey"]?.ToString() ?? "";
                var timeSlot = data["timeSlot"]?.ToString() ?? "";
                var userName = data["userName"]?.ToString() ?? "Unknown";
                
                Console.WriteLine($"📤 [TimeSlotHub] Broadcasting TimeSlotSelected");
                Console.WriteLine($"   Room: {roomKey}");
                Console.WriteLine($"   Slot: {timeSlot}");
                Console.WriteLine($"   User: {userName}");
                
                // Broadcast to others in group (NOT sender)
                await Clients.OthersInGroup(roomKey).SendAsync("TimeSlotSelected", data);
                
                Console.WriteLine($"✅ [TimeSlotHub] Broadcast complete");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ [TimeSlotHub] Error in NotifyTimeSlotSelected: {ex.Message}");
                throw;
            }
        }

        public async Task NotifyTimeSlotCleared(Dictionary<string, object> data)
        {
            try
            {
                var roomKey = data["roomKey"]?.ToString() ?? "";
                var timeSlot = data["timeSlot"]?.ToString() ?? "";
                
                Console.WriteLine($"📤 [TimeSlotHub] Broadcasting TimeSlotCleared");
                Console.WriteLine($"   Room: {roomKey}");
                Console.WriteLine($"   Slot: {timeSlot}");
                
                // Broadcast to others in group (NOT sender)
                await Clients.OthersInGroup(roomKey).SendAsync("TimeSlotCleared", data);
                
                Console.WriteLine($"✅ [TimeSlotHub] Broadcast complete");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ [TimeSlotHub] Error in NotifyTimeSlotCleared: {ex.Message}");
                throw;
            }
        }

        public async Task JoinTimeSlotRoom(string roomKey)
        {
            try
            {
                await Groups.AddToGroupAsync(Context.ConnectionId, roomKey);
                
                Console.WriteLine($"✅ [TimeSlotHub] Connection {Context.ConnectionId} joined room: {roomKey}");
                
                var notification = new Dictionary<string, object>
                {
                    { "userId", Context.UserIdentifier ?? "anonymous" },
                    { "userName", Context.User?.Identity?.Name ?? "Anonymous" },
                    { "roomKey", roomKey },
                    { "connectionId", Context.ConnectionId }
                };
                
                await Clients.Group(roomKey).SendAsync("UserJoinedTimeSlotRoom", notification);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ [TimeSlotHub] Error in JoinTimeSlotRoom: {ex.Message}");
                throw;
            }
        }

        public async Task LeaveTimeSlotRoom(string roomKey)
        {
            try
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, roomKey);
                
                Console.WriteLine($"✅ [TimeSlotHub] Connection {Context.ConnectionId} left room: {roomKey}");
                
                var notification = new Dictionary<string, object>
                {
                    { "userId", Context.UserIdentifier ?? "anonymous" },
                    { "userName", Context.User?.Identity?.Name ?? "Anonymous" },
                    { "roomKey", roomKey },
                    { "connectionId", Context.ConnectionId }
                };
                
                await Clients.Group(roomKey).SendAsync("UserLeftTimeSlotRoom", notification);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ [TimeSlotHub] Error in LeaveTimeSlotRoom: {ex.Message}");
                throw;
            }
        }

        public override async Task OnConnectedAsync()
        {
            Console.WriteLine($"🔌 [TimeSlotHub] Client connected: {Context.ConnectionId}");
            await base.OnConnectedAsync();
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            Console.WriteLine($"🔌 [TimeSlotHub] Client disconnected: {Context.ConnectionId}");
            if (exception != null)
            {
                Console.WriteLine($"   Reason: {exception.Message}");
            }
            await base.OnDisconnectedAsync(exception);
        }
    }
}
```

## ✅ After Implementing

Restart backend and try again. You should see:

**Backend console:**
```
✅ Connection xyz123 joined room: service_1_staff_1_date_2025-10-16
📤 Broadcasting TimeSlotSelected
   Room: service_1_staff_1_date_2025-10-16
   Slot: 16:40
   User: Hùng
✅ Broadcast complete
```

**Flutter console (Device 2):**
```
🔔 [DEBUG] Received TimeSlotSelected: 16:40 by Hùng
🔔 [DEBUG] Total selections: 1
```

**UI (Device 2):**
```
🟣 16:40 [👤]
👥 Hùng đang chọn
(Purple border + pulse)
```
