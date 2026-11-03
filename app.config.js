module.exports = ({ config }) => ({
  ...config,
  ...(process.env.EXPO_BASE_URL
    ? { experiments: { ...config.experiments, baseUrl: process.env.EXPO_BASE_URL } }
    : {}),
});
