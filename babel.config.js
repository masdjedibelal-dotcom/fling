module.exports = function (api) {
  api.cache(true);
  const plugins = [];

  // Keep reanimated plugin for SDK 51 / RN 0.74.
  plugins.push('react-native-reanimated/plugin');

  // Some dependency sets expect worklets plugin, but it may not be installed.
  // Load it only when available to avoid hard build failure in CI.
  try {
    require.resolve('react-native-worklets/plugin');
    plugins.push('react-native-worklets/plugin');
  } catch (_) {}

  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins,
  };
};
