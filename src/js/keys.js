var k = require('mousetrap');

function bindKeys(app) {
  k.bind('space', () => { 
    var cube = app.scene.getObjectByName('Cube');
    console.log(cube);
    cube.visible = !cube.visible;
  });
}

module.exports = bindKeys