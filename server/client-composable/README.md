# ShiftSync Real-Time Socket.io Implementation

This implementation adds real-time functionality to the ShiftSync application using Socket.io for instant notifications and live updates.

## Features

### Server-Side Events

- **`schedule:published`** - When a manager publishes a schedule, notifies all staff at that location
- **`schedule:updated`** - When a shift is modified, notifies assigned staff members
- **`swap:requested`** - Notifies target staff member when someone requests a swap
- **`swap:resolved`** - Notifies all parties when a swap is approved, accepted, or cancelled
- **`overtime:warning`** - Alerts managers when an assignment would push staff toward overtime
- **`conflict:detected`** - When two managers try to assign the same staff simultaneously

### Client-Side Features

- JWT-based authentication for Socket.io connections
- Location-based rooms (managers only see events for their locations, admins see all)
- Toast notifications with customizable actions
- Reactive schedule updates without page refresh
- Connection status monitoring
- Notification history and management

## Server Setup

The Socket.io server is automatically initialized in `src/index.ts`:

```typescript
import { initializeSocketService } from './services/socketService'

const httpServer = createServer(app)
const socketService = initializeSocketService(httpServer)
```

### Authentication

Socket.io connections are authenticated using JWT tokens:

```typescript
// Client connects with auth token
const socket = io(serverUrl, {
  auth: {
    token: 'your-jwt-token-here'
  }
})
```

### Room Management

Users are automatically assigned to rooms based on:

- **Location access**: `location:${locationId}` for each certified location
- **Role**: `role:staff`, `role:manager`, or `role:admin`

## Client Usage

### 1. Install Socket.io Client

```bash
npm install socket.io-client
```

### 2. Initialize Socket Connection

```typescript
// In your main App.vue or store
import { useGlobalSocket } from './composables/useSocket'

// Initialize once with user data and auth token
const user = {
  id: 1,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  role: 'STAFF'
}

useGlobalSocket(user, authToken)
```

### 3. Use in Components

```vue
<template>
  <div>
    <!-- Schedule component that reacts to updates -->
    <ScheduleView
      v-if="scheduleNeedsRefresh"
      @schedule-loaded="markScheduleAsRefreshed"
    />

    <!-- Toast notifications -->
    <NotificationToast />
  </div>
</template>

<script setup>
import { useGlobalSocket } from './composables/useSocket'
import NotificationToast from './components/NotificationToast.vue'

const socket = useGlobalSocket()

const {
  connected,
  scheduleNeedsRefresh,
  notifications,
  markScheduleAsRefreshed
} = socket
</script>
```

## Event Examples

### Schedule Published
```json
{
  "locationId": 1,
  "locationName": "Downtown Store",
  "weekStart": "2024-03-04",
  "weekEnd": "2024-03-10",
  "publishedShifts": 25,
  "publishedBy": {
    "id": 5,
    "name": "Jane Manager"
  }
}
```

### Swap Request
```json
{
  "swapRequestId": 123,
  "fromUser": { "id": 1, "name": "John Doe" },
  "toUser": { "id": 2, "name": "Jane Smith" },
  "fromShift": {
    "id": 456,
    "date": "2024-03-05",
    "startTime": "2024-03-05T09:00:00Z",
    "endTime": "2024-03-05T17:00:00Z",
    "location": "Downtown Store"
  },
  "type": "SWAP",
  "reason": "Doctor appointment"
}
```

### Overtime Warning
```json
{
  "userId": 1,
  "userName": "John Doe",
  "shiftId": 789,
  "overtimeImpact": {
    "currentWeeklyHours": 35,
    "projectedWeeklyHours": 43,
    "additionalOvertimeHours": 3,
    "additionalOvertimeCost": 67.50
  },
  "locationId": 1
}
```

## Composable API

### `useSocket(user, authToken)`

Returns an object with:

#### State
- `connected: Ref<boolean>` - Connection status
- `notifications: Ref<ToastNotification[]>` - All notifications
- `scheduleNeedsRefresh: Ref<boolean>` - Whether schedule should refresh
- `unreadNotifications: ComputedRef<ToastNotification[]>` - Recent notifications
- `hasUnreadNotifications: ComputedRef<boolean>` - Whether there are unread notifications

#### Methods
- `connect()` - Manually connect to server
- `disconnect()` - Disconnect from server
- `addNotification(notification)` - Add custom notification
- `removeNotification(id)` - Remove specific notification
- `clearAllNotifications()` - Clear all notifications
- `markScheduleAsRefreshed()` - Reset schedule refresh flag

## Notification System

### Toast Notifications

Notifications support:

- **Multiple types**: `info`, `success`, `warning`, `error`
- **Custom actions**: Buttons with click handlers
- **Auto-dismiss**: Configurable duration
- **Rich content**: Title, message, and actions

Example notification:
```typescript
addNotification({
  type: 'warning',
  title: 'Schedule Updated',
  message: 'Your shift on March 5th has been modified.',
  actions: [
    {
      label: 'View Changes',
      handler: () => navigateToSchedule(),
      style: 'primary'
    }
  ],
  duration: 10000
})
```

### NotificationToast Component

Props:
- `maxVisible?: number` - Max notifications to show (default: 5)
- `position?: string` - Position on screen (default: 'top-right')
- `autoRemove?: boolean` - Auto-remove after action click (default: true)

## Security

- All Socket.io connections require valid JWT tokens
- Users can only join rooms for locations they're certified for
- Role-based event filtering (staff vs manager events)
- Automatic disconnection on token expiry

## Error Handling

The system gracefully handles:
- Connection failures with automatic retry
- Authentication errors with user feedback
- Network interruptions with reconnection
- Server restarts with session restoration

## Testing

### Manual Testing

Use the browser console to test events:

```javascript
// Trigger test notification
window.socketComposable?.addNotification({
  type: 'info',
  title: 'Test',
  message: 'Testing notification system'
})

// Check connection status
console.log('Connected:', window.socketComposable?.connected.value)
```

### Integration Testing

Mock the socket service for testing:

```typescript
// In your test setup
vi.mock('./composables/useSocket', () => ({
  useGlobalSocket: () => ({
    connected: ref(true),
    notifications: ref([]),
    addNotification: vi.fn()
  })
}))
```

## Environment Variables

Server:
```bash
CLIENT_URL=http://localhost:5173  # For CORS
```

Client:
```bash
VITE_API_BASE_URL=http://localhost:3000  # Socket.io server URL
```

## Performance Considerations

- Notifications are limited to 50 recent items
- Auto-cleanup of old notifications
- Connection pooling and room-based targeting
- Efficient event serialization
- Memory leak prevention on component unmount

## Browser Support

Compatible with all modern browsers that support:
- WebSockets
- Vue 3 Composition API
- ES2017+ JavaScript features

Falls back gracefully when WebSockets are unavailable.