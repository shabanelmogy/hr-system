// Expo's native JS logger registers listeners only on device runtimes. Jest
// does not provide its native module registry, so the device-only side effect
// is intentionally empty in the Node test environment.
module.exports = {};
