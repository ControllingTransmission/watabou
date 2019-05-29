var k = require('mousetrap');

function bindKeys(app) {
  // Randomize texture on foreground
  k.bind('space', () => {
    var mesh = app.scene.getObjectByName('Foreground');
    console.log(mesh);
    var newIndex = Math.floor(Math.random() * app.textures.length);
    while (newIndex == mesh.material.textureIndex) {
      newIndex = Math.floor(Math.random() * app.textures.length);
    }
    mesh.material.map = app.textures[newIndex];
    mesh.material.textureIndex = newIndex;
    mesh.material.needsUpdate = true;
  });

  k.bind('z', () => {
    if (app.keyboard['1']) { app.threshold.startLoop(); }
    if (app.keyboard['2']) { app.pixelate.startLoop(); }
    if (app.keyboard['3']) { app.rgbShift.startLoop(); }
    if (app.keyboard['4']) { app.rgbAngle.startLoop(); }
  });
  k.bind('x', () => {
    if (app.keyboard['1']) { app.threshold.endAnimation(); }
    if (app.keyboard['2']) { app.pixelate.endAnimation(); }
    if (app.keyboard['3']) { app.rgbShift.endAnimation(); }
    if (app.keyboard['4']) { app.rgbAngle.endAnimation(); }
  });
  k.bind('up', () => {
    if (app.keyboard['1']) { app.threshold.speed += 0.1; }
    if (app.keyboard['2']) { app.pixelate.speed += 0.1; }
    if (app.keyboard['3']) { app.rgbShift.speed += 0.1; }
    if (app.keyboard['4']) { app.rgbAngle.speed += 0.1; }
    console.log(app.threshold.speed, app.rgbShift.speed, app.pixelate.speed);
  });
  k.bind('down', () => {
    if (app.keyboard['1']) { app.threshold.speed -= 0.1; }
    if (app.keyboard['2']) { app.pixelate.speed -= 0.1; }
    if (app.keyboard['3']) { app.rgbShift.speed -= 0.1; }
    if (app.keyboard['4']) { app.rgbAngle.speed -= 0.1; }

    console.log(app.threshold.speed, app.rgbShift.speed, app.pixelate.speed);
  });

  k.bind('p', () => {
    console.log('start pulse');
    if (app.keyboard['1']) { app.threshold.loopTo(0.5); }
    if (app.keyboard['2']) { app.pixelate.loopTo(1.0); }
    if (app.keyboard['3']) { app.rgbShift.loopTo(0.0); }
    if (app.keyboard['4']) { app.rgbAngle.loopTo(0.0); }

  }, 'keydown');

}

module.exports = bindKeys