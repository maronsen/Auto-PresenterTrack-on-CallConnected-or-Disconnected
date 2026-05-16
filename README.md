# Auto PresenterTrack on CallConnected or Disconnected

## Extended Description

This macro automatically controls **PresenterTrack** based on call activity on a Cisco Room device.

It is designed for rooms where PresenterTrack should be enabled when a video call starts and disabled again when the call ends. This is useful in presenter-focused rooms where a dedicated presenter camera should become active automatically during meetings, lectures, training sessions, or hybrid presentations.

When a call starts successfully, the macro waits for a configured delay. After that delay, it can optionally switch the main video source to a configured presenter camera and then enable PresenterTrack in `Follow` mode. When the call disconnects, the macro cancels any pending call-start action and disables PresenterTrack by setting it to `Off`.

The macro is intentionally simple and call-driven. It does not depend on wake state, user interface buttons, or manual operation. It only reacts to call start and call disconnect events.

***

## Why This Macro Exists

This macro was created to make PresenterTrack behavior more automatic and predictable in rooms where presenter tracking is only needed during calls.

In many presenter-focused rooms, users expect the camera system to be ready when the meeting starts. They should not need to manually select the presenter camera, enable PresenterTrack, or understand the underlying camera configuration. The room should simply prepare itself when the call begins.

Without automation, PresenterTrack may be left disabled when a call starts, or it may remain enabled after a call ends. Both situations can create inconsistent room behavior. If PresenterTrack is not enabled during the call, remote participants may not get the correct presenter view. If PresenterTrack stays enabled after the call, the room may be left in an unwanted camera state for the next user.

This macro solves that by tying PresenterTrack behavior directly to call activity:

*   Call starts → prepare presenter camera behavior
*   Call is active → PresenterTrack is enabled
*   Call ends → PresenterTrack is disabled

The macro is especially useful in rooms where a presenter camera should only be used during meetings, such as classrooms, training rooms, lecture rooms, briefing rooms, town hall spaces, and presentation rooms.

***

## How The Macro Works

The macro listens for call start and call disconnect events from the Cisco Room device.

When the device reports that a call has started successfully, the macro starts a short timer. This delay gives the call and video system time to stabilize before camera-related commands are sent.

After the delay, the macro can optionally select the configured presenter camera as the main video source. It then enables PresenterTrack in `Follow` mode so the presenter tracking behavior is ready during the call.

When the call disconnects, the macro cancels any pending delayed call-start action. This is important because a call may start and then end before the delay has completed. By clearing the timer, the macro avoids enabling PresenterTrack after the call has already ended.

After cancelling any pending timer, the macro disables PresenterTrack by setting it to `Off`.

In practical terms, the behavior is:

*   A call starts successfully
*   The macro waits briefly
*   The presenter camera can be selected automatically
*   PresenterTrack is enabled in `Follow` mode
*   The call ends
*   Any pending startup action is cancelled
*   PresenterTrack is disabled

***

## Configuration Options

The macro includes a small configuration section that controls camera switching, the presenter camera connector, and the delay after call start.

***

### Enable Camera Switching

```javascript
const ENABLE_CAMERA_SWITCHING = true;
```

Controls whether the macro should change the main video source when a call starts.

*   `true` = switch to the configured presenter camera after call start
*   `false` = keep the current camera source and only enable PresenterTrack

Use `true` when the room should always use a dedicated presenter camera during calls.

Use `false` if camera selection should be handled manually, by another macro, or by another room automation workflow.

***

### Presenter Camera Connector

```javascript
const PRESENTER_CAMERA_CONNECTOR_ID = 2;
```

Defines which video input connector is used for the presenter camera.

This value is only used when camera switching is enabled.

Example:

*   Presenter camera is connected to input `2`
*   The macro selects ConnectorId `2` when a call starts

This is the most important setting to verify before using the macro. If the connector ID is wrong, the macro may select the wrong camera.

***

### Call Start Delay

```javascript
const CALL_START_DELAY_MS = 1500;
```

Controls how long the macro waits after a successful call start before running the call-start actions.

The value is configured in milliseconds.

Example:

*   `1500` = wait 1.5 seconds after the call starts

This delay helps ensure that the call, video pipeline, and camera system are ready before the macro selects the camera and enables PresenterTrack.

***

## Practical Use Cases

### Classrooms

In a classroom, the teacher may expect presenter tracking to be active when a remote or hybrid class begins.

This macro can automatically enable PresenterTrack when the call starts, so the teacher does not need to manually prepare the camera tracking before the lesson.

***

### Training Rooms

In training rooms, instructors often use a dedicated presenter area.

The macro helps ensure that PresenterTrack is enabled during the call, making the room easier to use for instructors and more consistent for remote participants.

***

### Lecture Rooms

Lecture rooms often need predictable camera behavior when a session starts.

By enabling PresenterTrack on call start and disabling it on call end, the room begins each remote session in a consistent presenter-ready state and returns to a clean state afterward.

***

### Briefing Rooms

In briefing rooms, PresenterTrack may only be needed while the room is in a video meeting.

This macro enables presenter tracking when the call begins and turns it off automatically when the call ends.

***

### Rooms Without Dedicated Technical Support

Some rooms do not have AV support available for every meeting.

This macro helps those rooms behave correctly without requiring users to understand PresenterTrack settings, camera source selection, or Cisco xAPI commands.

***

## User Experience Benefit

For local users, the macro removes an extra setup step. They do not need to manually enable PresenterTrack or select the presenter camera when starting a call.

For remote participants, the benefit is a more consistent video experience. The room is more likely to provide the intended presenter-focused view as soon as the meeting begins.

For support teams, the macro helps standardize room behavior. PresenterTrack is automatically enabled during calls and disabled when calls end, reducing the chance that the room is left in the wrong camera mode.

***

## Operational Behavior

The macro uses call activity as the main trigger.

When a call starts successfully, the macro treats the room as being in an active meeting scenario. It waits for the configured delay, optionally selects the presenter camera, and enables PresenterTrack.

When a call disconnects, the macro treats the meeting as finished. It cancels any pending call-start timer and disables PresenterTrack.

If camera switching is enabled, the macro selects the configured presenter camera before enabling PresenterTrack.

If camera switching is disabled, the macro leaves the current camera source unchanged and only enables PresenterTrack.

***

## Call-Based PresenterTrack Activation

Call-based activation means that PresenterTrack is only prepared when a call actually starts.

This is useful because presenter tracking is often only needed when remote participants are connected. The macro avoids keeping PresenterTrack active unnecessarily when the room is idle or not in a meeting.

The call-start delay is included to avoid sending camera and PresenterTrack commands too early while the call is still being established.

***

## Call-Based PresenterTrack Deactivation

When the call ends, the macro disables PresenterTrack by setting it to `Off`.

This keeps the system clean after the meeting and prevents PresenterTrack from staying enabled unnecessarily.

The macro also cancels any pending call-start timer. This prevents a delayed action from enabling PresenterTrack after a call has already disconnected.

***

## Camera Source Selection

The macro can optionally select the presenter camera when a call starts.

This is useful in rooms where the presenter camera should always be the active source during calls.

If this is not wanted, camera switching can be disabled. The macro will still enable PresenterTrack, but it will not change the selected camera source.

***

## Error Handling And Logging

The macro writes log messages with this prefix:

```text
[PresenterTrackOnCall]
```

This makes it easier to identify the macro output in the Cisco macro logs.

If an xAPI command fails, the macro logs which action failed. This helps during troubleshooting because it shows whether the problem happened while selecting the camera, enabling PresenterTrack, or disabling PresenterTrack.

The macro also catches unexpected errors during the call-start action, allowing the script to keep running even if one command fails.

***

## Recommended Default Configuration

```javascript
const ENABLE_CAMERA_SWITCHING = true;

const PRESENTER_CAMERA_CONNECTOR_ID = 2;

const CALL_START_DELAY_MS = 1500;
```

Use this configuration when:

*   The room has a dedicated presenter camera
*   The presenter camera should be selected automatically when a call starts
*   PresenterTrack should start automatically in `Follow` mode during calls
*   PresenterTrack should be disabled when the call ends

If the camera source should not be changed automatically, use:

```javascript
const ENABLE_CAMERA_SWITCHING = false;
```

***

## Summary

This macro automatically controls PresenterTrack based on Cisco Room device call activity.

When a call starts, the macro waits for a short delay, optionally selects the configured presenter camera, and enables PresenterTrack in `Follow` mode. When the call ends, it cancels any pending call-start action and disables PresenterTrack by setting it to `Off`.

The macro was created to make presenter-focused rooms easier to use, more predictable, and less dependent on manual setup. Its main value is automatic PresenterTrack readiness during calls, clean shutdown after calls, optional presenter camera selection, and consistent behavior for classrooms, training rooms, lecture rooms, briefing rooms, presentation rooms, and similar spaces.
