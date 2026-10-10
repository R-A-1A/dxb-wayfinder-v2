# DXB Staff Wayfinder — Emergency Notifications Test Plan

## Scope agreed for this test branch
- General Emergency Request can be submitted by any PWA user.
- Police Assistance and Ambulance Needed can be submitted by any PWA user; push recipients must be authenticated, authorized Owner/Admin priority devices only.
- Maximum 20 Owner/Admin priority devices.
- Owner/Admin logs in on a personal device, asks for notification permission, and registers that device. Device must be explicitly approved by the Owner before it counts as a priority device.
- Per-device silence asks the user to confirm they are off shift. Silence must affect only that device.
- On reopening the PWA, an approved device is returned to active preference state.
- No attendance feature, no GPS/terminal proximity eligibility checks, and no Missing Person feature in this first scope.
- Requests must remain in a server-side record even if devices are silenced or offline.

## Current implementation status
The current branch has a test UI for three request types and local-only request history, notification permission prompting, a local device registration marker, and a per-device silence preference. It does not yet deliver requests or notifications across devices. `localStorage`, `BroadcastChannel`, and browser notification APIs do not provide a trusted cross-device emergency system by themselves.

## Backend prerequisites before real notifications
1. Add a trusted server-side API / Firebase Cloud Function to authenticate submitters, persist requests, and deliver push notifications.
2. Add a protected device registry with a maximum of 20 approved devices. Only an authenticated Owner can approve/revoke priority devices; Admin can receive but should not bypass the allowlist.
3. Associate push subscription/token with a verified Firebase Auth UID. Never accept a client-supplied role or `approved: true` as authority.
4. Add server-checked per-device notification preference and authorize changes by the matching signed-in user.
5. Configure and test Firestore rules and Cloud Function IAM/Secrets in a separate test Firebase project or explicitly approved test configuration. Do not use client-side admin credentials or expose FCM server credentials.
6. Make the app show the push status honestly, including permission denied, pending approval, silenced, active, and subscription failure.
7. Add an escalation/monitoring plan so silencing one device cannot suppress other recipients. Emergency notifications complement, not replace, established airport emergency procedures.

## Manual acceptance checks
- General Emergency Request can be submitted with optional known location/details and appears in request history.
- Police and ambulance requests can be submitted by a staff/user session.
- A non-Owner/Admin account cannot register an approved priority device.
- A 21st device cannot be approved until a registered device is revoked.
- Silencing one device does not alter any other device's preference.
- Reopening the PWA reactivates only an approved device belonging to the currently authenticated Owner/Admin.
- Push is reported as unavailable until the server-side delivery path is deployed and verified.
- Confirm no location permission is requested by the emergency notification flow.
- Confirm Missing Person remains outside the emergency panel in this phase.
- Confirm live `main` and production Firebase settings remain unchanged.
