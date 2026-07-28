const sharp = require('sharp');
sharp({
  create: {
    width: 256,
    height: 256,
    channels: 4,
    background: { r: 255, g: 0, b: 0, alpha: 0.5 }
  }
})
.png()
.toFile('icon.png')
.then(() => {
  // Try to generate ICO by using sharp on Windows? Actually electron-builder can consume a PNG directly and convert it to ICO internally if we point `win.icon` to the PNG.
  console.log('PNG generated.');
});
