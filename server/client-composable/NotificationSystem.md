# ShiftSync Notification System

This document provides a comprehensive guide to integrating and using the ShiftSync notification system in your Vue.js application.

## Components Overview

### 1. NotificationBell.vue
A complete notification bell component with dropdown that displays:
- Unread notification count badge
- Dropdown with recent notifications
- Mark as read functionality
- Real-time updates via Socket.io

### 2. NotificationPreferences.vue
A full preferences page allowing users to:
- Toggle email notifications on/off
- Configure notification types (shifts, swaps, schedules)
- Save preferences to backend
- Reset to defaults

### 3. NotificationToast.vue (Existing)
Toast notifications for real-time updates

## Backend API Endpoints

The notification system provides these REST endpoints:

- `GET /api/notifications` - Get user notifications with pagination
- `GET /api/notifications/unread-count` - Get unread count only
- `PATCH /api/notifications/:id/read` - Mark specific notification as read
- `PATCH /api/notifications/read-all` - Mark all notifications as read
- `GET /api/notifications/preferences` - Get notification preferences
- `PATCH /api/notifications/preferences` - Update notification preferences

## Real-time Events

The system emits these Socket.io events:

- `newNotification` - New notification received
- `notificationRead` - Notification marked as read
- `allNotificationsRead` - All notifications marked as read

## Integration Guide

### 1. Basic Setup

```vue
<template>
  <div id="app">
    <header class="app-header">
      <h1>My App</h1>

      <!-- Add notification bell to header -->
      <NotificationBell />
    </header>

    <main>
      <!-- Your main content -->
      <router-view />

      <!-- Add preferences page to your routes -->
      <NotificationPreferences v-if="currentRoute === 'preferences'" />
    </main>

    <!-- Toast notifications for real-time updates -->
    <NotificationToast />
  </div>
</template>

<script setup lang="ts">
import NotificationBell from './NotificationBell.vue'
import NotificationPreferences from './NotificationPreferences.vue'
import NotificationToast from './NotificationToast.vue'
</script>
```

### 2. Socket.io Setup

Make sure your `useSocket.ts` composable is properly initialized:

```typescript
import { useSocket } from './useSocket'

// In your main component or app setup
const { socket, connected } = useSocket()

// The NotificationBell component will automatically
// listen for notification events when connected
```

### 3. Authentication

The notification components expect authentication tokens to be available in:
- `localStorage.getItem('token')`
- `sessionStorage.getItem('token')`

Ensure your auth system stores tokens in one of these locations.

### 4. API Configuration

Set the API base URL via environment variable:
```bash
VUE_APP_API_URL=http://localhost:3000
```

Or update the default in each component:
```typescript
const API_BASE = process.env.VUE_APP_API_URL || 'http://localhost:3000'
```

## Notification Types

The system supports these notification types:

### Shift-Related
- `SHIFT_ASSIGNED` - User assigned to a shift
- `SHIFT_CANCELLED` - User's shift was cancelled

### Swap Requests
- `SWAP_REQUEST` - Someone wants to swap with you
- `SWAP_ACCEPTED` - Your swap request was accepted
- `SWAP_APPROVED` - Manager approved swap
- `SWAP_DENIED` - Swap request was denied

### Schedule Updates
- `SCHEDULE_PUBLISHED` - New schedule available
- `AVAILABILITY_REMINDER` - Reminder to update availability

## Customization

### Styling
All components use scoped CSS and can be customized by:

1. **CSS Variables**: Override colors and spacing
```css
:root {
  --notification-primary: #2563eb;
  --notification-success: #10b981;
  --notification-danger: #ef4444;
}
```

2. **Component Props**: Pass custom classes or styling props
3. **Theme Integration**: Adapt colors to match your app's design system

### Component Behavior

#### NotificationBell
- `limit`: Number of notifications to load per page (default: 20)
- Custom API endpoints by modifying the API_BASE constant
- Dropdown positioning via CSS classes

#### NotificationPreferences
- Add/remove preference categories by modifying the form structure
- Custom validation by adding form validation logic
- Additional preference types by extending the interface

## Error Handling

The components include comprehensive error handling:

- **Network errors**: Display user-friendly error messages
- **Authentication errors**: Graceful degradation when tokens expire
- **Socket connection issues**: Automatic reconnection attempts
- **Loading states**: Clear feedback during API calls

## Performance Considerations

- **Pagination**: Notifications are paginated to avoid memory issues
- **Socket efficiency**: Only essential data sent via real-time events
- **Caching**: Original preferences cached for change detection
- **Lazy loading**: Dropdown content loaded on-demand

## Testing

### Backend API Testing
```bash
# Test notification creation
curl -X POST http://localhost:3000/api/notifications \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "SHIFT_ASSIGNED",
    "title": "New Shift Assignment",
    "message": "You have been assigned to work tomorrow"
  }'

# Test preferences
curl -X GET http://localhost:3000/api/notifications/preferences \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Component Testing
```javascript
// Test notification bell component
import { mount } from '@vue/test-utils'
import NotificationBell from './NotificationBell.vue'

const wrapper = mount(NotificationBell, {
  global: {
    mocks: {
      $socket: mockSocket
    }
  }
})

expect(wrapper.find('.notification-bell').exists()).toBe(true)
```

## Production Deployment

### Security Considerations
- Ensure proper authentication middleware
- Validate notification permissions (users can only access their own)
- Rate limiting on notification APIs
- XSS protection in notification content

### Performance Optimization
- Database indexing on notification queries
- Redis caching for unread counts
- WebSocket connection pooling
- CDN for static assets

### Monitoring
- Track notification delivery rates
- Monitor real-time connection health
- Log notification errors and failures
- User engagement analytics

## Troubleshooting

### Common Issues

1. **Notifications not appearing**
   - Check authentication token validity
   - Verify Socket.io connection status
   - Confirm API endpoint accessibility

2. **Real-time updates not working**
   - Check WebSocket connection
   - Verify server-side Socket.io setup
   - Confirm user ID mapping in socket service

3. **Preferences not saving**
   - Check network requests in browser dev tools
   - Verify authentication headers
   - Confirm backend API is receiving requests

4. **Styling issues**
   - Check for CSS conflicts
   - Verify scoped styles are working
   - Confirm viewport meta tag for mobile

### Debug Mode
Enable debug logging:
```javascript
// Add to component mounted hooks
console.log('Notification system initialized', {
  apiBase: API_BASE,
  hasToken: !!getAuthToken(),
  socketConnected: connected.value
})
```

## Support

For issues or questions about the notification system:
1. Check this documentation first
2. Review the browser console for errors
3. Test API endpoints directly with curl or Postman
4. Check the backend logs for server-side issues

The notification system is designed to be robust and user-friendly, providing a complete solution for real-time notifications in the ShiftSync application.