function Game (settings) {
  var that = this;
  var world = settings.world;
  var gc = settings.world;
  this.spawnTime = 2;
  this.gameOver = false;
  this.paused = false;
  this.player = new Pacman (world.playerStart.x * tileSize + startX+tileSize/2, world.playerStart.y*tileSize+startY+tileSize/2, getTile(world.playerStart.x, world.playerStart.y), tileSize*world.speed, world.pelletColor);
  this.enemies = [];
  this.idleEnemies = []; 
  this.activeEnemies = []; 
  this.bullets = []; 
  this.ghostStart = randomTileFromArray(world.ghostStart);
  this.toRemove = {enemies:{indices:[], arr:this.activeEnemies},bullets:{indices:[], arr:this.bullets}};
  this.enemies.push(this.spawnGhost(ghostTypes.redGhost, this.player));
  this.enemies.push(this.spawnGhost(ghostTypes.greenGhost, this.player));
  this.enemies.push(this.spawnGhost(ghostTypes.blueGhost, this.player));
  _.each(this.enemies, function(e){ 
    that.idleEnemies.push(e);
  });

}

Game.prototype.update = function(dt) {
  var that = this;
  that.handleInput();
  if (this.idleEnemies.length > 0){
    this.spawnTime = this.spawnTime - dt;
    console.log(this.spawnTime);
    if (this.spawnTime <= 0){
      var activatedEnemy = this.idleEnemies.pop();
      activatedEnemy.init();
      this.activeEnemies.push(activatedEnemy);
      console.log(this.activeEnemies);
      this.spawnTime = 3;
    }

  }
  this.player.update(dt);
  _.each(this.activeEnemies, function(enemy){
    enemy.update(dt);
  });
  _.each(this.bullets, function(bullet){
    bullet.step(dt);
  });
  var bulLength = this.bullets.length;
  var eneLength = this.enemies.length;
  for (var i = 0; i< bulLength; i = i +1) {
    if (this.bullets[i].destroyed) {
      this.toRemove.bullets.indices.push(i);
      continue;
    }
    for (var j = 0; j < eneLength; j = j + 1) {
      this.bullets[i].collide(this.enemies[j]);
    }
  }
  if (this.player.tile.type === 'pellet' || this.player.tile.type === 'booster') {
    world.pellets = world.pellets - 1;
    world.removePellet(this.player.tile);
  }

  if (world.pellets < 1) {
    this.gameOver = 'win';
  } else {
    _.each(this.enemies, function(enemy){
      if (!enemy.dead) {
        if (collision(that.player, enemy) || that.player.tile.isSame(enemy.tile)) {
          gameOver = 'loser';
        }
      }
    });
  }
};

Game.prototype.removal = function() {
  _.each(this.toRemove, function(s){
    s.indices = _.sortBy(s.indices, function(e){return e;});
    for (var i = s.indices.length-1; i >= 0; i = i - 1) {
      s.arr.splice(s.indices[i], 1);
    }
    s.indices = [];
  });
};

Game.prototype.handleInput = function () {
  var that = this;
  if (input.isDown('LEFT')) {
    this.player.changeMovement('left');
  }
  if (input.isDown('RIGHT')) {
    this.player.changeMovement('right');
  }
  if (input.isDown('UP')) {
    this.player.changeMovement('up');
  }
  if (input.isDown('DOWN')) {
    this.player.changeMovement('down');
  }
  if (input.isDown('SPACE')) {
    var newBullets = this.player.fire();
    if (newBullets) {
      _.each (newBullets, function(b) {
        that.bullets.push(b);
      });
    }
  }
};

Game.prototype.spawnGhost = function (ghostType, target){
  var tile = randomTileFromArray(world.ghostStart);
  return new Ghost (tile.getTileCenter().x, tile.getTileCenter().y, tile, tileSize*world.speed, ghostType.color, ghostType.tactics, target);
};