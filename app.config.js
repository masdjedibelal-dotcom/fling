/** @type {import('expo/config').ExpoConfig} */
const appJson = require('./app.json');

function resolveIosBuildNumber() {
  const raw =
    process.env.IOS_BUILD_NUMBER ??
    process.env.PROJECT_BUILD_NUMBER ??
    process.env.BUILD_NUMBER ??
    process.env.CM_BUILD_NUMBER ??
    appJson.expo.ios?.buildNumber ??
    '4';
  const n = parseInt(String(raw), 10);
  return String(Number.isFinite(n) && n >= 1 ? n : 4);
}

module.exports = {
  expo: {
    ...appJson.expo,
    ios: {
      ...appJson.expo.ios,
      buildNumber: resolveIosBuildNumber(),
    },
  },
};
