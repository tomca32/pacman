;(function (exports){
  exports.resizeMap = function () {
  wHeight = $(window).innerHeight();
  wWidth = $(window).innerWidth();
  mapCanvas.width = wWidth * 0.9;
  mapCanvas.height = wHeight * 0.8;
  cW = mapCanvas.width;
  cH = mapCanvas.height;
  tileSize = getTileSize(world, cW, cH);
  startX = getStartX();
  startY = getStartY();
  if ($('#editorCanvas').length) {
    editorCanvas.width = cW;
    editorCanvas.height = cH;
  }
  if ($('#debugCanvas').length) {
    debugCanvas.width = cW;
    debugCanvas.height = cH;
    renderPaths();
  }
  world.draw(ctx);
}

exports.render  = function(game) {
  gc.clearRect(0,0,gameCanvas.width, gameCanvas.height);
  game.player.drawPacman();
  _.each(game.enemies,function(enemy) {
    enemy.draw();
  });
  _.each(game.bullets, function(bullet){
    bullet.draw();
  });
  renderPaths();
}

exports.renderPaths = function() {
  if (!DEBUG.PATH) return;
  var debugCanvas = document.getElementById('debugCanvas');
  var bugctx = debugCanvas.getContext('2d');
  bugctx.clearRect(0,0,debugCanvas.width,debugCanvas.height);
  _.each(DEBUG.PATHS, function(debugPath) {
    bugctx.fillStyle = debugPath.color;
    bugctx.globalAlpha = 0.2;
    _.each(debugPath.path, function(p){
      bugctx.fillRect(p[0]*tileSize+startX,p[1]*tileSize+startY,tileSize,tileSize);
    });
  });
  bugctx.globalAlpha = 1;
}
})(this);

