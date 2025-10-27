# Manifest Display Dashboard

## Overview

The Manifest Display Dashboard is a full-screen, visual operations center designed for large TV screens and display monitors. It provides real-time monitoring of logistics manifests with auto-rotating information and visual progress indicators.

## Features

### 🎯 Key Capabilities

1. **Visual Progress Tracking**
   - Truck icons with status indicators
   - Progress bars showing trip completion percentage
   - Color-coded status (Green: Active, Yellow: Waiting, Red: Critical)

2. **Auto-Rotating Information**
   - Information rotates every 5 seconds through 3 views:
     - View 1: Company, Route, Last Update
     - View 2: Vehicle Information (Horse, Trailers)
     - View 3: Job Numbers, RMN, Duration
   - Designed for readability from a distance

3. **Critical Alerts**
   - Prominent banner for critical manifests
   - Animated pulse effect for urgent attention
   - Shows manifests >2 hours without updates

4. **Real-Time Updates**
   - Socket.IO integration for live data
   - Auto-refresh capability (15s, 30s, 1m, 2m intervals)
   - Connection status indicator

5. **Large Screen Optimization**
   - Dark theme reduces eye strain
   - Large fonts (2xl-4xl) for distance viewing
   - Gradient cards for visual separation
   - Responsive grid layout (1-4 columns based on screen size)

## Access

**URL:** `/dashboard/manifests/display`

**Navigation:**

- From manifests page: Add link in navigation
- Direct URL access
- Back button returns to manifests list

## Layout

### Header Bar

- Back button (returns to manifests)
- Connection status (Live/Offline indicator)
- Settings panel (auto-refresh, fullscreen)
- Manual refresh button
- Current time display

### Critical Alerts Banner

- Only shown when critical manifests exist
- Displays count and first 3 manifest IDs
- Red theme with pulse animation

### Stats Overview

- 8 color-coded stat cards:
  - Total (Blue)
  - Active (Green)
  - Waiting (Yellow)
  - Breakdown (Orange)
  - Accident (Red)
  - Logistical (Purple)
  - Closed (Gray)
  - Foreign (Indigo)

### Manifest Cards

- Grid layout (responsive: 1-4 columns)
- Each card shows:
  - Truck icon with status color
  - Tracking ID / Job Number
  - Progress bar (0-100%)
  - Auto-rotating details (3 views)
  - Location indicator
  - Critical alert icon (if applicable)

### Footer

- Dashboard identifier
- Rotation information

## Data Display

### Progress Calculation

- **Completed:** 100%
- **Cancelled:** 0%
- **In Progress:** Estimated based on elapsed time (assumes 8-hour average trip)
- **Progress Colors:**
  - Yellow: 0-30%
  - Blue: 30-70%
  - Green: 70-95%
  - Dark Green: 95-100%

### Staleness Indicators

- **Green:** Updated <60 minutes ago (Fresh)
- **Orange:** Updated 60-120 minutes ago (Stale)
- **Red:** Updated >120 minutes ago (Critical)

### Auto-Rotation Cycle (5 seconds per view)

**View 1 - Route Information:**

- Company name
- Route name
- Last update time

**View 2 - Vehicle Information:**

- Horse ID
- Trailer 1 ID
- Trailer 2 ID

**View 3 - Reference Numbers:**

- Job Number
- RMN (Road Manifest Number)
- Total trip duration

## Settings Panel

### Auto Refresh

- Toggle ON/OFF
- Refresh intervals: 15s, 30s, 1m, 2m
- Manual refresh always available

### Fullscreen Mode

- Fullscreen API support
- Maximize/Minimize toggle
- Ideal for dedicated display screens

## Use Cases

### 1. Operations Control Room

- Mount large TV on wall
- Enable fullscreen mode
- Set auto-refresh to 30s
- Monitor all active manifests at a glance

### 2. Warehouse Display

- Show on monitor at loading dock
- View vehicle assignments
- Track incoming/outgoing shipments

### 3. Management Dashboard

- Display in office on large screen
- Quick overview of operations
- Identify bottlenecks and delays

### 4. Remote Monitoring

- Access from laptop/tablet
- Monitor operations from anywhere
- Responsive design adapts to screen size

## Technical Details

### Real-Time Updates

- Socket.IO events monitored:
  - `manifest:updated`
  - `manifest:created`
  - `manifest:status_changed`
- Automatic data refresh on events
- Connection status tracking

### API Endpoints

- `manifest.getDisplayDashboard` - Optimized endpoint for display screens
  - Returns: Critical manifests, high-priority manifests, stats
  - Includes: Last 24 hours of active manifests
  - Filters: Stale manifests (>2 hours), cancelled, long-running

### Performance

- Efficient data queries (limited to 20 manifests)
- Optimized for large screen rendering
- Smooth animations and transitions
- Auto-rotation without API calls

## Customization

### Adjustable Parameters

**In Code:**

- Rotation interval: Change `5000` ms in useEffect
- Progress estimation: Modify `estimatedDuration` (default 8 hours)
- Staleness thresholds: Update minute values (60, 120)
- Grid columns: Adjust Tailwind classes (xl:grid-cols-3, 2xl:grid-cols-4)

**Via Settings Panel:**

- Auto-refresh interval
- Fullscreen mode

## Best Practices

1. **For Large TVs (50"+):**
   - Enable fullscreen
   - Set auto-refresh to 30-60s
   - Ensure stable network connection
   - Mount at eye level in common area

2. **For Smaller Screens:**
   - Use windowed mode
   - Set shorter refresh interval (15-30s)
   - Position near workstation

3. **Network Considerations:**
   - Stable Wi-Fi or wired connection required
   - Monitor connection status indicator
   - WebSocket support needed for real-time updates

4. **Browser Compatibility:**
   - Chrome/Edge recommended for fullscreen API
   - Modern browsers (last 2 versions)
   - JavaScript enabled

## Troubleshooting

### No Data Showing

- Check internet connection
- Verify you're logged in
- Ensure manifests exist in system
- Check console for errors

### Connection Status "Offline"

- WebSocket connection failed
- Check network/firewall settings
- Verify Socket.IO server is running
- Auto-refresh will still work

### Information Not Rotating

- JavaScript may be disabled
- Check browser console
- Refresh the page

### Progress Bars Not Accurate

- Progress is estimated based on time
- Actual progress depends on business logic
- Can be customized in code

## Future Enhancements

Potential features to add:

- Configurable rotation speed
- Custom color themes
- Alarm sounds for critical alerts
- Map view integration
- Historical trends
- Customizable stat cards
- Multi-tenant view filtering
- Export/screenshot capability

## Related Documentation

- [Manifest Core](./manifest-core.md)
- [Real-time Updates](../src/server/ws/socket.ts)
- [tRPC API](../src/server/api/routers/manifest.ts)





