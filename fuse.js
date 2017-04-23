var { FuseBox } = require('fuse-box');
const config = {
  homeDir: 'src',
  sourceMaps: true,
  outFile: 'bundle/bundle.js'
};

FuseBox.init(config).devServer('> Main.ts', {
  port: 8080
});
