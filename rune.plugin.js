module.exports = function(webpackConfig) {
  webpackConfig.externals.fs = 'fs';
  webpackConfig.externals.xmldom = 'DOMParser';
  return webpackConfig;
}
