function randomInt (rMin, rMax){
  return Math.floor(Math.random() * (rMax - rMin + 1)) + rMin;
}
function getTileSize(map, canvasWidth, canvasHeight) {
  //calculates tile dimensions
  if (canvasWidth/map.data[0].length<canvasHeight/map.data.length){
    return Math.floor(canvasWidth/map.data[0].length);
  }
  return Math.floor(canvasHeight/map.data.length);
}
function tileExists(posX,posY){
  //check if tile is within world bounds
  if (isNaN(posX) || isNaN(posY) || posX === undefined || posY === undefined){
   return false;
 }

 if (posX < 0 || posY < 0 || posX > world.data[0].length-1 || posY > world.data.length -1) {
  return false;
}

return true;
}

function randomTileFromArray(arr) {
  var len = arr.length;
  return arr[randomInt(0, len-1)];
}

function getTile(posX,posY){
  //gets tile by grid position
  if (tileExists(posX,posY)){
    return world.data[posY][posX];  
  }
  return false;
}

function getTileAt(x,y) {
  //gets tile by absolute x,y coords
  return getTile(Math.floor((x-startX)/tileSize), Math.floor((y-startY)/tileSize));
}

function tileIsWall (tile) {
  if (tile) {
    return tileExists(tile.posX, tile.posY) && tile.isWall();  
  }
  return false;
}

function getRandomTile(world, type, excluding) {

  var row = randomInt(0,world.data.length);
  var column = randomInt(0, world.data[0].length);
  var tile = getTile(column,row);
  if (tile.type === type || type ==="any") {
    _.each(excluding, function(t){
      if (tile.type === t) return getRandomTile(world,type);
    });
    return tile;
  }
  return getRandomTile(world, type);
}


function oppositeDirection(direction){
  switch (direction) {
    case 'up':
      return 'down';

    case 'down':
      return 'up';

    case 'left':
      return 'right';

    case 'right':
      return 'left';
  }
  return false;
}

function Tile (tileInfo,posX,posY) {
  var that = this;
  this.type = tileInfo;
  this.posX = posX;
  this.posY = posY;
  this.hitPoints = 10;
}

Tile.prototype.hit = function (damage) {
  this.hitPoints = this.hitPoints - damage;
  if (this.hitPoints <= 0) {
    this.type = 'open';
    this.drawTile();
  }
}

Tile.prototype.getTilePosition = function(){
  //gets tile x,y coords
  return {x:this.posX*tileSize + startX, y:this.posY*tileSize + startY};
};

Tile.prototype.getTileCenter = function(){
  var pos = this.getTilePosition();
  return {x:pos.x+tileSize/2, y: pos.y +tileSize/2};
};

Tile.prototype.getTileEnd = function (direction) {
//returns the end pixels of a tile in a given direction
  var p = this.getTileCenter();
  switch (direction) {
    case "up":
      return {x:p.x, y:p.y-tileSize/2};
    case "down":
      return {x:p.x, y:p.y+tileSize/2};
    case "left":
      return {x:p.x-tileSize/2, y:p.y};
    case "right":
      return {x:p.x+tileSize/2, y:p.y};  
  }
};

Tile.prototype.isSame = function (other) {
  //determines if given tile is the same as this one
  if (this.posX === other.posX && this.posY === other.posY) return true;
  return false;
};
  //////////////////////////////////////////////TILE GETTERS\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
Tile.prototype.upper = function(){
  if (this.posY ===0 && !this.isWall()) {
    return getTile(this.posX, world.data.length-1);
  }
  return getTile(this.posX,this.posY-1);
};

Tile.prototype.lower = function(){
  if (this.posY ===world.data.length-1 && !this.isWall()) {
    return getTile(this.posX, 0);
  }
  return getTile(this.posX,this.posY+1);
};

Tile.prototype.left = function(){
  if (this.posX ===0 && !this.isWall()) {
    return getTile(world.data[0].length-1, this.posY);
  }
  return getTile(this.posX-1,this.posY);
};

Tile.prototype.right = function(){
  if (this.posX ===world.data[0].length-1 && !this.isWall()) {
    return getTile(0, this.posY);
  }
  return getTile(this.posX+1,this.posY);
};

Tile.prototype.checkDirection = function(direction) {
  //returns the next tile in a specified direction
  switch(direction){
    case 'up':
    return this.upper();

    case 'down':
    return this.lower();

    case 'right':
    return this.right();

    case 'left':
    return this.left();
  }
};

Tile.prototype.determineDirection = function(targetTile) {
  //returns the direction to target
  if (targetTile.isSame(this.right())){
    return 'right';
  } 
  if (targetTile.isSame(this.left())) {
    return 'left';
  }
  if (targetTile.isSame(this.lower())) {
    return 'down';
  }
  if (targetTile.isSame(this.upper())) {
    return 'up';
  }
  return false;
};

Tile.prototype.getValidNeighbours = function(passGate, illegalTile) {
  //returns an array of valid tiles (not walls, maybe gates and filters illegal tile)

  function valid(tile) {
    if (tile) {
      if (illegalTile){
        if (tile.isSame(illegalTile)) {
          return false;
        }
      }
      return !tileIsWall(tile) || (passGate && tile.isGate());
    }
  }
  var neighbours = [];
  if (valid(this.upper())) {
    neighbours.push(this.upper());
  }
  if (valid(this.lower())) {
    neighbours.push(this.lower());
  }
  if (valid(this.right())) {
    neighbours.push(this.right());
  }
  if (valid(this.left())) {
    neighbours.push(this.left());
  }
  return neighbours;
}

////////////////////////////////////////////TILE TYPE GETTERS/////////////////////////////////////////////////
Tile.prototype.isGate = function() {
  if (this.type ==='gate') {
    return true;
  }
  return false;
};

Tile.prototype.isWall = function(noGates){
  if (this.type ==='wall') {
    return true;
  }
  if (!noGates) {
    return this.isGate();
  } 
    return false;
};

Tile.prototype.tileBlocked = function(){
  //check if tile surounded by walls
  return tileIsWall(this.upper()) && tileIsWall(this.lower()) && tileIsWall(this.left()) && tileIsWall(this.right());
};

Tile.prototype.isolatedTile = function() {
  //check if tile has no walls around
  return !tileIsWall(this.upper()) && !tileIsWall(this.lower()) && !tileIsWall(this.left()) && !tileIsWall(this.right());
};

Tile.prototype.isVerticalWall = function() {
  if (tileIsWall(this.upper()) && tileIsWall(this.lower())) {
    if (!tileIsWall(this.left()) || !tileIsWall(this.right())) {
      return true;
    }
  }
  return false;
};

Tile.prototype.isHorizontalWall = function() {
  if (tileIsWall(this.left()) && tileIsWall(this.right())){
    if (!tileIsWall(this.upper()) || !tileIsWall(this.lower())) {
      return true;
    }
  }
  return false;
};

  ////////////////////////////////////////////////////DRAWING//////////////////////////////////////////////////////////
  

Tile.prototype.clearTile = function(){
  var x = this.getTilePosition().x,
      y = this.getTilePosition().y;
  ctx.fillStyle=world.bgColor;
  ctx.clearRect(x,y,tileSize,tileSize);
};
Tile.prototype.drawUpRightCornerInner = function(x,y) {
  ctx.beginPath();
  ctx.arc(x,y+tileSize,tileSize/3,Math.PI*3/2,0, false);
  ctx.stroke();
  if (this.isGate()) {
    ctx.fill();
  }
};

Tile.prototype.drawUpLeftCornerInner = function(x,y) {
  ctx.beginPath();
  ctx.arc(x+tileSize,y+tileSize,tileSize/3,Math.PI*3/2,Math.PI, true);
  ctx.stroke();
  if (this.isGate()) {
    ctx.fill();
  }
};

Tile.prototype.drawDownRightCornerInner = function (x,y) {
  ctx.beginPath();
  ctx.arc(x,y,tileSize/3,0,Math.PI/2, false);
  ctx.stroke(); 
  if (this.isGate()) {
    ctx.fill();
  }
};

Tile.prototype.drawDownLeftCornerInner = function(x,y) {
  ctx.beginPath();
  ctx.arc(x+tileSize,y,tileSize/3,Math.PI,Math.PI/2, true);
  ctx.stroke();
  if (this.isGate()) {
    ctx.fill();
  }
};

Tile.prototype.drawUpRightCornerOuter = function(x,y) {
  ctx.beginPath();
  ctx.arc(x,y+tileSize,tileSize*2/3,Math.PI*3/2,0, false);
  ctx.stroke();
};

Tile.prototype.drawUpLeftCornerOuter = function(x,y) {
  ctx.beginPath();
  ctx.arc(x+tileSize,y+tileSize,tileSize*2/3,Math.PI*3/2,Math.PI, true);
  ctx.stroke();
};

Tile.prototype.drawDownLeftCornerOuter = function(x,y) {
  ctx.beginPath();
  ctx.arc(x+tileSize,y,tileSize*2/3,Math.PI,Math.PI/2, true);
  ctx.stroke();
};

Tile.prototype.drawDownRightCornerOuter = function(x,y) {
  ctx.beginPath();
  ctx.arc(x,y,tileSize*2/3,0,Math.PI/2, false);
  ctx.stroke(); 
};

Tile.prototype.drawCorner = function(x,y){
  if (!this.upper().left().isWall()) {
    this.drawDownRightCornerInner(x,y);
  }
  if (!this.upper().right().isWall()) {
    this.drawDownLeftCornerInner(x,y);    
  }
  if (!this.lower().left().isWall()) {
    this.drawUpRightCornerInner(x,y);
  }
  if (!this.lower().right().isWall()) {
    this.drawUpLeftCornerInner(x,y);
  }
};

Tile.prototype.drawIsolatedWall = function(x,y){
  ctx.beginPath();
  ctx.arc(x+tileSize/2, y+tileSize/2,tileSize/6,0, Math.PI*2,true);
  ctx.stroke();
};

Tile.prototype.drawLeftEnd = function(x,y) {
  ctx.beginPath();
  ctx.moveTo(x+tileSize,y+tileSize/3);
  ctx.lineTo(x+tileSize/3, y+tileSize/3);
  ctx.moveTo(x+tileSize,y+tileSize*2/3);
  ctx.lineTo(x+tileSize/3, y+tileSize*2/3);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x+tileSize/3, y+tileSize/2,tileSize/6,Math.PI*3/2, Math.PI/2,true);
  ctx.stroke();
};

Tile.prototype.drawRightEnd = function (x,y) {
  ctx.beginPath();
  ctx.moveTo(x,y+tileSize/3);
  ctx.lineTo(x+tileSize*2/3, y+tileSize/3);
  ctx.moveTo(x,y+tileSize*2/3);
  ctx.lineTo(x+tileSize*2/3, y+tileSize*2/3);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x+tileSize*2/3, y+tileSize/2,tileSize/6,Math.PI*3/2, Math.PI/2,false);
  ctx.stroke();
};

Tile.prototype.drawTopEnd = function(x,y) {
  ctx.beginPath();
  ctx.moveTo(x+tileSize/3,y+tileSize);
  ctx.lineTo(x+tileSize/3, y+tileSize/3);
  ctx.moveTo(x+tileSize*2/3,y+tileSize);
  ctx.lineTo(x+tileSize*2/3, y+tileSize/3);
  ctx.stroke(); 
  ctx.beginPath();
  ctx.arc(x+tileSize/2, y+tileSize/3,tileSize/6,0, Math.PI,true);
  ctx.stroke(); 
};

Tile.prototype.drawBottomEnd = function (x,y) {
  ctx.beginPath();
  ctx.moveTo(x+tileSize/3,y);
  ctx.lineTo(x+tileSize/3, y+tileSize*2/3);
  ctx.moveTo(x+tileSize*2/3,y);
  ctx.lineTo(x+tileSize*2/3, y+tileSize*2/3);
  ctx.stroke(); 
  ctx.beginPath();
  ctx.arc(x+tileSize/2, y+tileSize*2/3,tileSize/6,0, Math.PI,false);
  ctx.stroke(); 
};

Tile.prototype.drawCornerTile = function (x,y){
  if (tileIsWall(this.upper()) && tileIsWall(this.right())) {
    this.drawDownLeftCornerOuter(x,y);
    if (!tileIsWall(this.upper().right())) {this.drawDownLeftCornerInner(x,y);}

  } else if (tileIsWall(this.upper()) && tileIsWall(this.left())) {
    this.drawDownRightCornerOuter(x,y);
    if (!tileIsWall(this.upper().left())) {this.drawDownRightCornerInner(x,y);}

  } else if (tileIsWall(this.lower()) && tileIsWall(this.right())) {
    this.drawUpLeftCornerOuter(x,y);
    if (!tileIsWall(this.lower().right())) {this.drawUpLeftCornerInner(x,y);}

  } else if (tileIsWall(this.lower()) && tileIsWall(this.left())) {
    this.drawUpRightCornerOuter(x,y);
    if (!tileIsWall(this.lower().left())) {this.drawUpRightCornerInner(x,y);}

  } else {
    //Not corner but a last tile in line
    if (tileIsWall(this.right())){
      this.drawLeftEnd(x,y);
    } else if (tileIsWall(this.left())){
      this.drawRightEnd(x,y);
    } else if (tileIsWall(this.lower())){
      this.drawTopEnd(x,y);
    } else if (tileIsWall(this.upper())){
      this.drawBottomEnd(x,y);
    }
  }
};

Tile.prototype.drawVerticalWall = function(x,y){
  if (!tileIsWall(this.left())){
    if (this.isGate() && !tileIsWall(this.right())) {
      ctx.fillRect(x+tileSize/3,y,tileSize/3, tileSize);
    }
    ctx.beginPath();
    ctx.moveTo(x+tileSize/3, y);
    ctx.lineTo(x+tileSize/3, y+tileSize);
    ctx.stroke();
  } else {
    if (!tileIsWall(this.left().upper())){
      this.drawDownRightCornerInner(x,y);
    } 
    if (!tileIsWall(this.left().lower())) {
      this.drawUpRightCornerInner(x,y);
    }
  }
  if (!tileIsWall(this.right())){
    ctx.beginPath();
    ctx.moveTo(x+tileSize*2/3, y);
    ctx.lineTo(x+tileSize*2/3, y+tileSize);
    ctx.stroke(); 
  } else {
    if (!tileIsWall(this.right().upper())){
      this.drawDownLeftCornerInner(x,y);
    }
    if (!tileIsWall(this.right().lower())){
      this.drawUpLeftCornerInner(x,y);
    }
  }
};

Tile.prototype.drawHorizontalWall = function(x,y){
  if (!tileIsWall(this.upper())){
    if (this.isGate() && !tileIsWall(this.lower())) {
      ctx.fillRect(x,y+tileSize/3,tileSize, tileSize/3);
    }
    ctx.beginPath();
    ctx.moveTo(x, y+tileSize/3);
    ctx.lineTo(x+tileSize,y+tileSize/3);
    ctx.stroke();
  } else {
    if (!tileIsWall(this.upper().left())){
      this.drawDownRightCornerInner(x,y);
    }
      if (!tileIsWall(this.upper().right())){
      this.drawDownLeftCornerInner(x,y);
    }
  }
  if (!tileIsWall(this.lower())){
    ctx.beginPath();
    ctx.moveTo(x, y+tileSize*2/3);
    ctx.lineTo(x+tileSize,y+tileSize*2/3);
    ctx.stroke(); 
  } else {
    if (!tileIsWall(this.lower().left())){
      this.drawUpRightCornerInner(x,y);
    }
    if (!tileIsWall(this.lower().right())){
      this.drawUpLeftCornerInner(x,y);
    }
  }
};

Tile.prototype.drawWallTile = function(x,y){
  ctx.strokeStyle = world.wallColor;
  if (this.isGate()) {
    ctx.strokeStyle = world.gateColor;
    ctx.fillStyle = world.gateColor;
  }
  if (this.tileBlocked()){
    this.drawCorner(x,y);
  } else if (this.isolatedTile()){
    this.drawIsolatedWall(x,y);
  } else{
    if (this.isVerticalWall()) {
      this.drawVerticalWall(x,y);
    } else if (this.isHorizontalWall()){
      this.drawHorizontalWall(x,y);
    } else {
      this.drawCornerTile(x,y);
    } 
  }
};

Tile.prototype.drawPelletTile = function(x,y){
  var x = x+tileSize/2,
      y = y+tileSize/2;
  ctx.fillStyle= world.pelletColor;
  ctx.beginPath();
  ctx.arc(x,y,tileSize/10, 0, Math.PI *2, true);
  ctx.closePath();
  ctx.fill();
};

Tile.prototype.drawBoosterTile = function(x,y){
  var x = x+tileSize/2,
      y = y+tileSize/2;
  ctx.fillStyle = world.boosterColor;
  ctx.beginPath();
  ctx.arc(x,y,tileSize/5, 0, Math.PI *2, true);
  ctx.closePath();
  ctx.fill(); 
};

Tile.prototype.drawTile = function(){
  var x = this.getTilePosition().x,
      y = this.getTilePosition().y;
  this.clearTile();
  if (DEBUG.SHOWGRID) {
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.moveTo(x,y);
    ctx.lineTo(x+tileSize, y);
    ctx.lineTo(x+tileSize, y+tileSize);
    ctx.lineTo(x, y+tileSize);
    ctx.closePath();
    ctx.stroke();
  }
  switch (this.type) {
    case "open":
    break;

    case "wall":
    this.drawWallTile(x,y);
    break;

    case "pellet":
    this.drawPelletTile(x,y);
    break;

    case "booster":
    this.drawBoosterTile(x,y);
    break;

    case "gate":
    this.drawWallTile(x,y);
    break;

  }
}

function distance (tile1, tile2) {
  return Math.abs(tile1.posX - tile2.posX) + Math.abs(tile1.posY - tile2.posY);
}

//PATHFINDING
Tile.prototype.path = function(actor, endTile) {
  var current, neighbours, nLength, i, neighbour, g, gBest, ret = [], openList = [], closedList = [];
  this.g = 0; //distance from start to node
  this.h = distance(this, endTile); //distance from node to end
  this.f = this.g + this.h; //total distance from start to end
  this.par = false; //starting tile has no parent
  openList.push(this);
  if (DEBUG.PATH) {
    // var debugCanvas = document.getElementById('debugCanvas');
    // var bugctx = debugCanvas.getContext('2d');
    
    // bugctx.fillStyle = actor.color;
  }
  while (openList.length) {

    current = _.min (openList, function(t) {return t.f}); //finding node with minimum f (total distance to target) - underscore.js
    if (current.posX === endTile.posX && current.posY === endTile.posY) {
      //if reached target node
      DEBUG.PATHS[actor.color] = {color: actor.color, path: []};
      while (current.par){
        if (DEBUG.PATH) {
          
          DEBUG.PATHS[actor.color].path.push([current.posX, current.posY]);
        }
        ret.push(current.par.determineDirection(current));
        current = current.par;
      }
      return ret.reverse();
    }

    //normal case, target not found, moving current node to closed and process neighbours
    openList.splice(openList.indexOf(current),1); //removing from openList
    closedList.push(current);

    neighbours = current.getValidNeighbours(actor.isGhost, actor.illegalTile);
    nLength = neighbours.length;
    for (i = 0; i < nLength; i=i+1) {
     neighbour = neighbours[i];
      if (!_.contains(closedList, neighbour)) { //if node already checked continue- underscore.js
        g = current.g+1;
        gBest = false;

        if(!_.contains(openList, neighbour)) {
          //if node visited for the first time - underscore.js
          gBest = true;
          neighbour.h = distance (neighbour, endTile);
          neighbour.par = false;
          openList.push(neighbour);
        } else if (g < neighbour.g) {
          gBest = true;
        }

        if (gBest) {
          //This is the best path to this node so far

          neighbour.par = current;
          neighbour.g = g;
          neighbour.f = neighbour.g + neighbour.h;
        }
      }
    } //end for

  } //end while
  return [];
}

function World (map) {
  this.map = map;
  this.parse();
}

World.prototype.parse = function (map) {
  var map = map === undefined ? this.map : map,
  newTile, newLine, i, j, line, lineL, tile,
  l = map.data.length;

  this.data = [];
  this.pellets = 0;
  this.bgColor = map.bgColor;
  this.pelletColor = map.pelletColor;
  this.boosterColor = map.boosterColor;
  this.wallColor = map.wallColor;
  this.speed = map.speed;
  this.gateColor = map.gateColor;
  this.ghostStart = [];


  for (i = 0; i <l; i=i+1) {
    line = map.data[i];
    lineL = line.length;
    newLine = [];
    for (j = 0; j < lineL; j=j+1) {
      tile = map.data[i][j];

      switch (tile) {
        case "X":
        newTile = new Tile ("wall", j, i);
        break;

        case ".":
        newTile = new Tile ("open", j, i);
        break;  

        case "o":
        newTile = new Tile ("pellet", j, i);
        this.pellets = this.pellets + 1;
        break;

        case "O":
        newTile = new Tile ("booster", j ,i);
        break;

        case "G":
        newTile = new Tile("gate",j,i);
        break;

        case "T":
        newTile = new Tile("tunnel",j,i);
        break;

        case "S":
        newTile = new Tile("player",j,i);
        this.playerStart = {x:j,y:i};
        break;

        case "E":
        newTile = new Tile("enemy",j,i);
        this.ghostStart.push(newTile);
        break;
      }
      newLine.push(newTile);
    }
    this.data.push(newLine);
  }
}

World.prototype.draw = function (ctx) {
  var i, j, row, tile,
  worldL = this.data.length;
  ctx.fillStyle= this.bgColor;
  ctx.fillRect(0,0,cW, cH);
  for (i = 0; i < worldL; i=i+1){
    row = this.data[i].length;
    for (j = 0; j < row; j=j+1) {
      tile = this.data[i][j];
      tile.drawTile();
    }
  }
}

World.prototype.export = function () {
  //Exports world into a map object
  var e = {}, wL = world.data.length, rL = world.data[0].length;

  e.bgCollor = this.bgColor;
  e.pelletColor = this.pelletColor;
  e.boosterColor = this.boosterColor;
  e.wallColor = this.wallColor;
  e.speed = this.speed;
  e.gateColor = this.gateColor;
  e.data = [];

  for (var i = 0; i < wL; i = i + 1) {
    e.data.push([]);
    for (var j = 0; j<rL; j=j+1) {
      if (_.has(tileDictionary, this.data[i][j].type)) {
        e.data[i].push(tileDictionary[this.data[i][j].type]);
      } else {
        throw new Error("Tile Dictionary does not contain "+this.data[i][j].type);
      }
    }
  }

  return e;
};

World.prototype.insertTile = function (tile, redrawTile){
  //inserts tile at a position in the world (optional: redraws it)
  var i, j, tempTile;
  this.data[tile.posY][tile.posX] = tile;

  if (redrawTile){
    for (i =0; i<3; i=i+1){
      for (j=0; j<3; j=j+1){
        if (tileExists(tile.posX+j-1, tile.posY+i-1)){
          tempTile = new Tile(this.data[tile.posY+i-1][tile.posX+j-1].type, tile.posX+j-1, tile.posY+i-1); 
          tempTile.drawTile();
        }
      }
    }
  }
};

World.prototype.removePellet = function (tile) {
  var newT = new Tile('open', tile.posX, tile.posY);
  this.insertTile(newT, true);
  tile = newT;
}

var tileDictionary = {
  wall: "X",
  open: ".",
  pellet: "o",
  booster: "O",
  gate: "G",
  tunnel: "T",
  player: "S",
  enemy: "E"
};