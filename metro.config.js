const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);

config.transformer.minifierPath = "metro-minify-terser";
config.transformer.minifierConfig = {
  keep_classnames: false,
  keep_fnames: false,
  mangle: {
    toplevel: true,
  },
  output: {
    comments: false,
  },
  compress: {
    toplevel: true,
    dead_code: true,
  },
};

module.exports = config;
