function StateMachine(states){
  this.currentState;
  this.states = states;
  this.indexes = {}; //just for convinience
  if(!states)return;
  for( var i = 0; i< this.states.length; i++){
    this.indexes[this.states[i].name] = i;
    if (this.states[i].initial){
      this.currentState = this.states[i];
    }
  }
  
}

StateMachine.prototype.getStatus = function(){
  return this.currentState.name;
};
StateMachine.prototype.consumeEvent = function(e){
  if(this.currentState.events[e]){
    this.currentState = this.states[this.indexes[this.currentState.events[e]]] ;
  }
};

var gameStates = [

  {
    "name":"initializing",
    "initial": true,
    "events": {
      "run":"running"
    }
  },

  {
    "name":"running",
    "initial": false,
    "events": {
        "pause":"paused",
        "lose": "lost",
        "initialize":"initializing",
        "win": "won"
    }
  },

  {
    "name":"paused",
    "initial": false,
    "events": {
        "unpause": "running"
    }
  },

  {
    "name":"lost",
    "initial": false,
    "events":{
      "initialize": "initializing"
    }
  },

  {
    "name":"won",
    "initial": false,
    "events": {
      "initialize": "initializing"
    }
  },
];
Game.prototype = new StateMachine ();
Game.prototype.constructor = Game;
function Game (settings) {
  StateMachine.call(this, gameStates);
  this.world = settings.world;
  this.mapCanvas = settings.mapCanvas;
  this.init();
}

Game.prototype.init = function () {
  var that = this;
  this.spree = {
    countdown:0,
    kills:0
  };
  this.countdown = 3.5;
  this.world.parse();
  this.world.draw(this.mapCanvas);
  this.spawnTime = 1;
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
  this.enemies.push(this.spawnGhost(ghostTypes.whiteGhost, this.player));
  _.each(this.enemies, function(e){ 
    that.idleEnemies.push(e);
  });
};

Game.prototype.update = function(dt) {
  var that = this;
  if (that.getStatus() === 'initializing' && that.countdown <=0) {
    $('#infoText').html('');
    $('#infoText').css({'display':'none'});
    that.consumeEvent('run');
  } else if (that.getStatus()==='initializing'){
    $('#infoText').html(Math.round(that.countdown) ? Math.round(that.countdown) : "GO");
    $('#infoText').css({'display':'block'});
    that.countdown = that.countdown - dt;
    return;
  }
  that.handleInput();
  if (this.getStatus() === 'paused') return;

  if (this.idleEnemies.length > 0){
    this.spawnTime = this.spawnTime - dt;
    if (this.spawnTime <= 0){
      var activatedEnemy = this.idleEnemies.pop();
      activatedEnemy.init();
      this.activeEnemies.push(activatedEnemy);
      this.spawnTime = 3;
    }

  }
  if (this.getStatus() === 'lost'){
    this.player.die();  
    $('#infoText').html('YOU LOST!');
    $('#infoText').css({'display':'block'});
    _.each(this.activeEnemies, function (enemy){
      enemy.tactics = randomTactics;
    });
  } else {
    this.player.update(dt);
  }
  if (this.getStatus() === 'won'){
    $('#infoText').html('YOU WON!');
    $('#infoText').css({'display':'block'});
    _.each(this.activeEnemies, function (enemy){
      enemy.die();
    });
  } 
  _.each(this.activeEnemies, function(enemy){
    enemy.update(dt);
  });
  _.each(this.bullets, function(bullet){
    bullet.step(dt);
  });
  var bulLength = this.bullets.length;
  var eneLength = this.enemies.length;
  SPREE.countdown = SPREE.countdown - dt;
  if (SPREE.countdown <= 0) SPREE.kills = 0;
  
  for (var i = 0; i< bulLength; i = i +1) {
    if (this.bullets[i].destroyed) {
      this.toRemove.bullets.indices.push(i);
      continue;
    }
    for (var j = 0; j < eneLength; j = j + 1) {
      this.bullets[i].collide(this.enemies[j])
    }
  }
  var pT = this.player.tile;
  if (pT.type === 'pellet' || pT.type === 'booster') {
    world.pellets = world.pellets - 1;
    world.removePellet(this.player.tile);
    waka.play();
  }
  if (pT.type === 'weapon') {
    this.player.weapon = new Weapon (pT.weapon);
    this.player.weapon.pickup();
    this.world.insertTile(new Tile('open', pT.posX, pT.posY), true);
  }

  if (world.pellets < 1) {
    this.consumeEvent('win');
  } else {
    _.each(this.enemies, function(enemy){
      if (!enemy.dead) {
        if (collision(that.player, enemy) || that.player.tile.isSame(enemy.tile)) {
          that.consumeEvent('lose');
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
  if (input.isDown('P')) {
    this.togglePause();
  }
  if (this.getStatus() === 'paused') return;
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
  return new Ghost (tile.getTileCenter().x, tile.getTileCenter().y, tile, tileSize*world.speed, ghostType.color, ghostType.tactics, ghostType.fallback, target);
};

Game.prototype.togglePause = function () {
  var now = Date.now();
  if (!this.timePaused || now - this.timePaused > 300) {
    this.timePaused = Date.now();

    if (this.getStatus() === 'paused') {
      this.consumeEvent('unpause');
      $('#infoText').html('');
      $('#infoText').css({'display':'none'});
    } else {
      this.consumeEvent('pause');
      $('#infoText').html('PAUSED');
      $('#infoText').css({'display':'block'});
    }
  }
};

Game.prototype.cleanUp = function () {
  for (prop in this) {
    prop = undefined;
  }
};