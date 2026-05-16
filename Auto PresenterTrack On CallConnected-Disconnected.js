/*
Auto Enable/Disable Presenter Track On CallConnected/Disconnected
Version 1.0.0
Company ATEA AS
Author: Mikkel A. Aronsen
=========================================================
GOAL
=========================================================
This macro automatically controls PresenterTrack based on call activity
on a Cisco Room device.
When a call starts, the macro waits for a configured delay and then:
- Optionally sets a specific camera connector as the main video source
- Enables PresenterTrack in Follow mode
When the call ends, the macro:
- Cancels any pending call-start timer
- Disables PresenterTrack by setting it to Off
The macro is intended for systems where a dedicated presenter camera should
automatically become active and start tracking when a call begins, and stop
tracking when the call ends.
=========================================================
FUNCTIONS OVERVIEW
=========================================================
CONFIGURATION
- ENABLE_CAMERA_SWITCHING
  Controls whether the macro should automatically change the main video
  source when a call starts.
- PRESENTER_CAMERA_CONNECTOR_ID
  Defines which video input connector should be selected as the main video
  source when camera switching is enabled.
- CALL_START_DELAY_MS
  Defines how long the macro waits after a successful call start before
  changing the video source and enabling PresenterTrack.
HELPER FUNCTIONS
- log(...args)
  Writes log messages to the macro log with the prefix
  [PresenterTrackOnCall].
- handleError(context)
  Creates an error handler for xAPI commands. If a command fails, the error
  is logged together with information about which action failed.
- setMainVideoSource()
  Sends an xAPI command to set the configured camera connector as the main
  video source.
- enablePresenterTrack()
  Sends an xAPI command to enable PresenterTrack in Follow mode.
- disablePresenterTrack()
  Sends an xAPI command to disable PresenterTrack by setting the mode to Off.
MAIN LOGIC
- CallSuccessful event
  Runs when the device reports that a call has started successfully.
  The macro starts a timer, then optionally changes the main video source
  and enables PresenterTrack.
- CallDisconnect event
  Runs when a call disconnects.
  The macro clears any pending startup timer and disables PresenterTrack.
- callStartTimer
  Stores the delayed call-start action so it can be cancelled if the call
  ends before the delay has completed.
- Startup log
  Logs that the macro has started and is listening for call start and call
  disconnect events.
*/
import xapi from 'xapi';
// ===========================
// CONFIG
// ===========================
// Set to true to switch main video source on call start
// Set to false to keep current camera selection
const ENABLE_CAMERA_SWITCHING = true;
// ConnectorId where the presenter camera is connected
const PRESENTER_CAMERA_CONNECTOR_ID = 2;
// Delay after call start before actions are executed (ms)
const CALL_START_DELAY_MS = 1500;
// ===========================
// HELPERS
// ===========================
function log(...args) {
  console.log('[PresenterTrackOnCall]', ...args);
}
function handleError(context) {
  return (e) => log(`ERROR (${context}):`, e?.message || e);
}
async function setMainVideoSource() {
  return xapi.command('Video Input SetMainVideoSource', {
    ConnectorId: PRESENTER_CAMERA_CONNECTOR_ID,
  }).catch(handleError('SetMainVideoSource'));
}
async function enablePresenterTrack() {
  return xapi.command('Cameras PresenterTrack Set', {
    Mode: 'Follow',
  }).catch(handleError('PresenterTrack Follow'));
}
async function disablePresenterTrack() {
  return xapi.command('Cameras PresenterTrack Set', {
    Mode: 'Off',
  }).catch(handleError('PresenterTrack Off'));
}
// ===========================
// MAIN LOGIC
// ===========================
let callStartTimer = null;
// ---------- CALL START ----------
xapi.event.on('CallSuccessful', () => {
  log('Call started');
  if (callStartTimer) clearTimeout(callStartTimer);
  callStartTimer = setTimeout(async () => {
    try {
      if (ENABLE_CAMERA_SWITCHING) {
        await setMainVideoSource();
        log(`Main video source set to ConnectorId ${PRESENTER_CAMERA_CONNECTOR_ID}`);
      } else {
        log('Camera switching disabled – keeping current video source');
      }
      await enablePresenterTrack();
      log('PresenterTrack enabled (Follow)');
    } catch (e) {
      log('Unexpected error on call start:', e?.message || e);
    }
  }, CALL_START_DELAY_MS);
});
// ---------- CALL END ----------
xapi.event.on('CallDisconnect', async () => {
  log('Call ended');
  if (callStartTimer) {
    clearTimeout(callStartTimer);
    callStartTimer = null;
  }
  await disablePresenterTrack();
  log('PresenterTrack disabled (Off)');
});
log('Macro started. Listening for call start/end events...');
