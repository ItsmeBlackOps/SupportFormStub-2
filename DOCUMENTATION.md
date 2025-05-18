# Modern Candidate Management Application Documentation

## Table of Contents
- [Overview](#overview)
- [Core Features](#core-features)
- [User Interface Components](#user-interface-components)
- [Task Types](#task-types)
- [Data Management](#data-management)
- [Real-time Features](#real-time-features)
- [Notifications](#notifications)
- [Hidden Features](#hidden-features)

## Overview

The Modern Candidate Management Application is a comprehensive web-based tool for managing candidate interviews, assessments, and other support tasks. It provides real-time updates, automated notifications, and intelligent form handling.

## Core Features

### Tab Navigation
- **Add/Edit Candidate Tab**
  - Displays form for new entries or editing existing ones
  - Tab badge shows total number of scheduled candidates
  - Responsive design switches to dropdown on mobile
  - Active tab indicated with indigo highlight and underline

### Form Handling
- **Smart Form**
  - Dynamic fields based on task type
  - Real-time validation
  - Autocomplete suggestions from previous entries
  - Paste image support for automatic data extraction
  - Case-sensitive field formatting (capitalizes names, technologies)
  - Phone number auto-formatting (+X (XXX) XXX-XXXX)

### Task Management
- **Task Types**
  - Interview Support
  - Assessment Support
  - Mock Interview
  - Resume Understanding
  - Resume Making
- **Each type has unique fields and validation rules**

## User Interface Components

### Buttons
- **Primary Actions**
  - Save/Update: Indigo background with hover state
  - Add New: Plus icon with label
  - View Details: Eye icon with tooltip
  - Edit: Pencil icon with tooltip
  - Clone: Files icon with tooltip
  - Delete: Red trash icon with tooltip

### Form Fields
- **Text Inputs**
  - Error states with red border and message
  - Focus states with indigo ring
  - Required field indicators (red asterisk)
  - Hover states for interactive elements

### Modals
- **Detail Modal**
  - Closeable with X button or ESC key
  - Copy buttons for table format and subject line
  - Success indicator when copying
  - Backdrop click to close
  - Scrollable content for long entries

### Timeline View
- **Scheduled Tab**
  - Grouped by task type
  - Color-coded sections
  - Expandable/collapsible groups
  - Status indicators
  - Expert badge (star icon)
  - Time/date formatting in EDT

## Data Management

### Local Storage
- Persists candidates between sessions
- Automatic saving on all operations
- Data recovery on page reload

### Autocomplete System
- **Sources data from:**
  - Previous entries
  - Real-time socket suggestions
  - Maintains unique sets for:
    - Names
    - Technologies
    - Email addresses
    - Phone numbers

## Real-time Features

### WebSocket Integration
- **Status Updates**
  - Real-time status changes
  - Visual indicators
  - Sound notifications
  - Toast notifications
  - Automatic reconnection with exponential backoff

### Image Processing
- **Paste Support**
  - Accepts clipboard images
  - Extracts candidate data
  - Loading overlay during processing
  - Error handling with user feedback

## Notifications

### Interview Reminders
- **45-minute Warning**
  - For pending interviews only
  - Sound alert
  - Toast notification
  - NY timezone based

- **30-minute Warning**
  - For all interviews
  - Sound alert
  - Toast notification
  - NY timezone based

### Status Updates
- **Toast Notifications**
  - Success messages (green)
  - Error messages (red)
  - Info messages (blue)
  - Warning messages (amber)
  - Auto-dismiss after 3 seconds
  - Manual dismiss option

## Hidden Features

### Keyboard Shortcuts
- **Form Navigation**
  - Tab: Next field
  - Shift+Tab: Previous field
  - Enter: Submit form
  - Esc: Close modals

### Autocomplete Interaction
- **Keyboard Navigation**
  - Arrow Up/Down: Navigate suggestions
  - Enter: Select suggestion
  - Esc: Close suggestions
  - Tab: Select first suggestion

### Data Validation
- **Phone Numbers**
  - International format support
  - Auto-formatting
  - Preserves country codes

- **Email Validation**
  - Format checking
  - Domain validation
  - Case-insensitive matching

### Expert Mode
- Indicated by star icon
- Special handling in timeline view
- Preserved during cloning operations

### Time Handling
- All times in EDT/EST
- Automatic timezone conversion
- Date formatting with month names
- 12-hour time format with AM/PM

## Technical Notes

### Performance Optimizations
- Debounced search
- Memoized components
- Lazy loading of modals
- Efficient re-rendering strategies

### Error Handling
- Network error recovery
- Data validation
- Graceful fallbacks
- User feedback

### Accessibility
- ARIA labels
- Keyboard navigation
- Focus management
- Screen reader support
- Color contrast compliance

### Mobile Responsiveness
- Adaptive layouts
- Touch-friendly interfaces
- Responsive images
- Dynamic font sizing

### Browser Support
- Modern browser compatibility
- Fallback behaviors
- Progressive enhancement
- Cross-browser testing