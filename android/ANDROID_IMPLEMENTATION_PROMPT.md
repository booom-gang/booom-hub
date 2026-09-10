# BOOOM Android App Implementation Prompt

Build a production-quality native Android application for the existing BOOOM private group social platform. The Android app must connect to the existing backend and share the same users, gallery, calendar, messages, authentication, and Socket.IO chat session as the web application. Do not create a second backend, local-only mock data layer, or separate database.

## Product Context

BOOOM is a private social space for a closed group of friends. The current web app provides:

- Shared master-password login with a user-created display name
- Home screen showing the group member card deck
- Shared image gallery with uploads, paging, full-screen viewing, downloading, and owner deletion
- Real-time group chat with message history, typing indicators, online presence, and owner-only deletion
- Shared calendar with monthly events and creator-only edit/delete permissions
- Profile editing, profile photo upload/removal, hobbies, theme switching, and logout

The Android app should feel like the same product, not a generic mobile dashboard. Preserve the existing visual identity: warm orange accent, dark/light themes, rounded controls, friendly typography, playful but restrained decorative details, and fast touch-first interactions.

## Required Technology

Use:

- Kotlin
- Jetpack Compose and Material 3
- Navigation Compose
- Coroutines and Flow
- A repository/data-source architecture
- Retrofit or Ktor Client for REST
- OkHttp for authenticated HTTP and upload progress
- A Socket.IO Android client compatible with Socket.IO server 4.x
- Kotlin serialization, Moshi, or Gson, used consistently
- DataStore or encrypted preferences for the JWT and the last authenticated user
- Coil for remote image loading and caching
- Android Photo Picker or an equivalent system picker

Use a single app module unless the chosen platform requires otherwise. Keep UI, domain, data, networking, and persistence responsibilities separate enough to test independently.

## Runtime Configuration

Make backend URLs configurable through `BuildConfig` or a simple environment configuration object. Never hardcode production secrets.

Required values:

- `API_BASE_URL`: `https://booom-hub.onrender.com/api/`
- `SOCKET_BASE_URL`: `https://booom-hub.onrender.com`

Use the deployed Render backend for the app. Do not use emulator addresses, localhost, LAN IPs, or local development ports in production builds.

If local HTTP is used during development, configure cleartext traffic only for the development build. Do not weaken TLS requirements in release builds.

## Authentication Contract

Login endpoint:

`POST /api/auth/login`

Request:

```json
{
  "masterPassword": "string",
  "username": "Display Name"
}
```

Rules:

- The master password is shared by the group.
- The username is trimmed and must be 2 to 30 characters.
- Login creates the user automatically if the case-insensitive username does not already exist.
- The backend rate-limits login attempts.

Success response:

```json
{
  "token": "jwt",
  "user": {
    "_id": "mongodb-id",
    "username": "Display Name",
    "profile_picture": null,
    "about": "",
    "hobbies": [],
    "joined_at": "ISO-8601 timestamp"
  }
}
```

Attach the token to every authenticated REST request:

`Authorization: Bearer <token>`

Store the token in secure local storage, not plain text preferences. On app launch, restore the token, call `GET /api/users/me`, and show the authenticated shell only when that request succeeds. Clear the token and navigate to login on a 401 response. Avoid logging the token or the master password.

## REST API Contract

All paths below are relative to the configured API base URL.

### Users

`GET /users`

Returns all users sorted by join date ascending:

```json
[
  {
    "_id": "mongodb-id",
    "username": "Name",
    "profile_picture": "profile-picture/user-id/file.webp",
    "about": "About text",
    "hobbies": ["Music", "Travel"],
    "joined_at": "ISO-8601 timestamp"
  }
]
```

`GET /users/me`

Returns the authenticated user in the same shape.

`PATCH /users/me`

Accepts any recognized subset of:

```json
{
  "username": "New Name",
  "about": "Up to 300 characters",
  "profile_picture": "profile-picture/user-id/file.webp",
  "hobbies": ["Music", "Travel"]
}
```

Validate username length 2-30, about length at most 300, and at most 10 hobbies in the UI. The backend also validates and normalizes these values.

`DELETE /users/me/profile-picture`

Removes the current user's profile image and returns the updated user.

`DELETE /users/me`

Deletes the current account. Require a confirmation dialog, then clear local auth and return to login.

### Gallery and Media

`POST /media/presigned-url`

Request:

```json
{
  "fileName": "photo.webp",
  "fileType": "image/webp",
  "mediaKind": "gallery-image"
}
```

`mediaKind` is either `gallery-image` or `profile-picture`. The response is:

```json
{
  "uploadUrl": "https://signed-r2-url",
  "fileKey": "gallery-image/user-id/uuid-photo.webp",
  "publicUrl": "https://public-r2-url/gallery-image/user-id/uuid-photo.webp"
}
```

The signed URL expires after five minutes. Use the returned `fileKey`; never construct one locally.

Upload the raw file bytes with an unauthenticated HTTP `PUT` to `uploadUrl`, including:

`Content-Type: <the same fileType sent to the backend>`

For gallery images, resize/compress before upload to approximately the web app's limits: WebP, maximum 1920px, maximum 1 MB. For profile images, use WebP, maximum 512px, maximum 0.5 MB. Show per-file progress and support cancellation where practical.

After a gallery upload succeeds:

`POST /media/gallery`

```json
{
  "media_type": "image",
  "file_key": "gallery-image/user-id/uuid-photo.webp",
  "file_size_bytes": 123456
}
```

If registration fails after the R2 upload, call:

`POST /media/cleanup-r2`

```json
{
  "file_key": "gallery-image/user-id/uuid-photo.webp"
}
```

For a profile photo, after the R2 upload succeeds, call `PATCH /users/me` with the returned `fileKey` as `profile_picture`.

`GET /media/gallery?page=1&limit=24`

Response:

```json
{
  "items": [
    {
      "_id": "mongodb-id",
      "user_id": {
        "_id": "mongodb-id",
        "username": "Name",
        "profile_picture": "profile-picture/..."
      },
      "media_type": "image",
      "file_key": "gallery-image/...",
      "thumbnail_key": null,
      "file_size_bytes": 123456,
      "created_at": "ISO-8601 timestamp",
      "proxy_url": "https://wsrv.nl/?url=..."
    }
  ],
  "page": 1,
  "limit": 24,
  "total": 100,
  "totalPages": 5
}
```

Use `proxy_url` when present. Otherwise construct the public R2 URL from the configured public media base URL. The backend currently returns image records; keep the media model extensible for video but do not invent unsupported video APIs.

`DELETE /media/gallery/{id}`

Only the owner can delete an item. Remove it from the local list after success.

### Messages

`GET /messages?limit=50&before=<ISO timestamp>`

The backend clamps limit to 1-50 and returns chronological messages, oldest first:

```json
[
  {
    "_id": "mongodb-id",
    "user_id": "mongodb-id",
    "sender_name": "Name",
    "message_text": "Hello",
    "timestamp": "ISO-8601 timestamp"
  }
]
```

Use this for initial chat history and cursor-based older-message pagination. Do not duplicate messages received over Socket.IO.

`DELETE /messages/{id}`

Only the message owner can delete. The response includes `deletedId`. Use a confirmation action and remove the message after success.

Important compatibility rule: the web frontend currently emits `message:delete` on Socket.IO, but the backend does not handle that event. Android must use the REST delete endpoint above.

### Events

`GET /events?month=9&year=2026`

Both query parameters are required. The response is an array sorted by date:

```json
[
  {
    "_id": "mongodb-id",
    "title": "Dinner",
    "description": "Optional details",
    "date": "ISO-8601 timestamp",
    "created_by": {
      "_id": "mongodb-id",
      "username": "Creator",
      "profile_picture": "profile-picture/..."
    },
    "created_at": "ISO-8601 timestamp"
  }
]
```

`POST /events`

```json
{
  "title": "Dinner",
  "description": "Optional details",
  "date": "2026-09-20T18:30:00.000Z"
}
```

Title is required and limited to 120 characters. Description is limited to 1000 characters. Send dates as ISO-8601 UTC strings.

`PATCH /events/{id}` accepts any subset of `title`, `description`, and `date`. Only the creator may update.

`DELETE /events/{id}` only succeeds for the creator.

## Socket.IO Contract

Connect to `SOCKET_BASE_URL` using Socket.IO protocol 4.x and pass the JWT in handshake auth:

```json
{
  "auth": {
    "token": "jwt"
  }
}
```

Use a lifecycle-aware connection manager. Connect after authentication, disconnect on logout, reconnect after transient network loss, and expose connection state to the UI.

Server-to-client events:

`presence:update`

```json
{
  "onlineUserIds": ["mongodb-id-1", "mongodb-id-2"]
}
```

`message:new`

```json
{
  "_id": "mongodb-id",
  "user_id": "mongodb-id",
  "sender_name": "Name",
  "message_text": "Hello",
  "timestamp": "ISO-8601 timestamp"
}
```

`typing:update`

```json
{
  "username": "Name",
  "isTyping": true
}
```

`error`

```json
{
  "message": "Message cannot be empty"
}
```

Client-to-server events:

- `message:send` with `{ "message_text": "Hello" }`
- `typing:start` with no payload
- `typing:stop` with no payload

The server trims and validates messages, stores them, and broadcasts `message:new` to every connected client. Treat `message:new` as delivery confirmation. Do not depend on an acknowledgement callback because the current backend does not invoke one.

Show server errors for empty messages, messages over 2000 characters, missing users, and send failures. Debounce typing signals and always send `typing:stop` when leaving the chat screen or losing focus.

## Screens and Navigation

Use a bottom navigation bar for Home, Gallery, Chat, Calendar, and Settings. Preserve navigation state where reasonable and support Android back behavior for dialogs, full-screen media, and nested screens.

### Login

- Display the BOOOM identity and a friendly private-group explanation.
- Fields: display name and master password.
- Validate display name locally before submitting.
- Show loading, rate-limit, invalid-password, network, and generic error states.
- Do not retain the master password after login.

### Home

- Greet the current user by username.
- Load all members from `GET /users`.
- Show a swipeable or stacked member card deck with avatar, name, about text, and hobbies where available.
- Show empty and loading states.
- Provide clear actions to open Gallery and Chat.
- Keep the playful orange-accented visual language and lightweight decorative motion without hurting accessibility.

### Gallery

- Load page 1 from the gallery endpoint and support Load More pagination.
- Use a responsive two-to-four-column image grid depending on screen width.
- Show uploader identity and ownership-aware delete actions.
- Use the Android photo picker with multi-select.
- Show a review/upload screen with thumbnails, remove-before-upload actions, per-file progress, success, and failure states.
- Upload through the exact presigned URL flow.
- Open images in a full-screen viewer with swipe navigation, download/share action, and owner-only delete.
- Show retry and empty states.

### Chat

- Load the most recent 50 messages from REST.
- Connect to Socket.IO and display online member count or presence indicators.
- Render sent and received bubbles with sender name, timestamp, and ownership-aware delete action.
- Support pull-to-load older history using the `before` cursor.
- Send messages in real time, with a 2000-character limit.
- Show typing indicators, connection state, send failures, and retry affordances.
- Deduplicate a message if it is already present by `_id`.
- Keep the composer above the keyboard using Compose insets.

### Calendar

- Start on the current month and request events whenever month/year changes.
- Provide previous/next month controls and a month grid.
- Mark days with events and show the selected day's event list.
- Allow creating an event with title, description, date, and time.
- Allow edit/delete only when the current user's ID equals `created_by._id`.
- Show server validation errors and refresh the month after mutations.
- Handle timezone conversion explicitly: display in the device timezone, send ISO-8601 timestamps, and avoid silently changing the calendar day.

### Settings

Use sections or tabs for:

- Edit Profile
- Theme
- Log out
- Delete account, behind a destructive confirmation

Profile editing includes avatar upload/removal, username, about text with a 300-character counter, up to 10 hobbies, join date, validation, save progress, and success/error feedback. Profile image upload must use the same presigned R2 flow.

Theme should support persisted light and dark modes and optionally follow system default. Keep the orange accent in both modes and maintain readable contrast.

## State, Error, and Loading Requirements

- Represent loading, content, empty, refreshing, submitting, upload progress, error, and retry states explicitly.
- Use one source of truth for the authenticated user and token.
- Use immutable UI state and stable IDs for list items.
- Cancel requests and image work when screens leave composition.
- Handle HTTP 401 globally by clearing auth.
- Handle 403 as a permission message, 404 as missing content, 429 as rate limiting, and 5xx/network failures with retry guidance.
- Never expose backend secrets, R2 credentials, JWT contents, or the master password in logs.
- Cache read-only gallery, users, events, and message history only as a resilience enhancement; server data remains authoritative.

## Accessibility and Android Quality

- Support TalkBack labels for icon-only actions.
- Use at least touch-friendly hit targets and readable text.
- Provide content descriptions for avatars, gallery images, delete buttons, and navigation items.
- Respect dark mode, font scaling, display cutouts, keyboard insets, and rotation where practical.
- Use system back gestures correctly.
- Avoid blocking the main thread during image compression, uploads, or database/network work.

## Suggested Package Shape

```text
app/
  data/
    local/
    remote/
    repository/
  domain/
    model/
    repository/
  navigation/
  ui/
    auth/
    home/
    gallery/
    chat/
    calendar/
    settings/
    components/
    theme/
  util/
```

Suggested repositories:

- `AuthRepository`
- `UserRepository`
- `GalleryRepository`
- `MessageRepository`
- `EventRepository`
- `ChatSocketRepository`
- `MediaUploadRepository`

Use DTOs for wire responses and map them into domain models. Keep snake_case JSON mapping explicit rather than relying on accidental naming behavior.

## Verification Checklist

Before considering the Android app complete:

1. Log in on Android with a new display name and confirm the user appears on the web Home screen.
2. Log in on web and Android as different users.
3. Send a message from Android and confirm it appears on web in real time.
4. Send a message from web and confirm it appears on Android in real time.
5. Confirm typing indicators and presence update in both clients.
6. Delete an Android-owned message using REST and confirm the UI updates correctly.
7. Upload a gallery image on Android and confirm it appears on web and survives app restart.
8. Upload and remove an Android profile photo and confirm the web profile updates.
9. Create, edit, and delete calendar events with the correct creator permissions.
10. Confirm a non-owner cannot see or use edit/delete actions successfully.
11. Kill and relaunch the app, restore the session securely, and recover from a temporary network loss.
12. Test light/dark theme persistence, rotation, keyboard behavior, accessibility labels, and large font settings.
13. Test emulator and physical-device URL configuration separately.

Do not modify the existing backend API contract unless a clearly documented incompatibility blocks a required feature. If a backend change becomes necessary, isolate it, explain why, and preserve compatibility with the existing web frontend.
