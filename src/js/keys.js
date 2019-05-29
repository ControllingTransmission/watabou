var k = require('mousetrap');

function bindKeys(app) {
  // Randomize texture on foreground
  k.bind('space', () => { 
    var mesh = app.scene.getObjectByName('Foreground');
    console.log(mesh);
    mesh.material.map = app.textures[Math.floor(Math.random() * app.textures.length)]
    mesh.material.needsUpdate = true;
  });

  k.bind('1+z', () => {
    if (app.threshold > 0) {
      app.threshold = -1;
    } else {
      app.threshold = Math.abs(Math.sin(app.uniforms.u_time.value * app.thresholdSpeed)) + 0.4
    }
  });
  k.bind('1+up', () => {
    app.thresholdSpeed += 0.1;
    console.log(app.thresholdSpeed);
  });
  k.bind('1+down', () => {
    app.thresholdSpeed -= 0.1;
    console.log(app.thresholdSpeed);
  });
}

module.exports = bindKeys