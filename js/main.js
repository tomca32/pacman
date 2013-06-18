var requestAnimFrame = (function() {
	return window.requestAnimationFrame       ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame    ||
	window.oRequestAnimationFrame      ||
	window.msRequestAnimationFrame     ||
	function(callback){
		window.setTimeout(callback, 1000 / 60);
};
}());
var $ = jQuery, TweenLite = TweenLite, cW, cH, startX, startY, tileSize, ctx,gc;
var DEBUG = {
	SHOWGRID: false,
	PATH: true,
	PATHS: {}
};

function getMousePos(c, e) {
    var rect = c.getBoundingClientRect();
    return {x: e.clientX - rect.left,y: e.clientY - rect.top};
}
var world,
	map = {
	bgColor: "rgb(0,0,0)",
	wallColor: "rgb(0,34,255)",
	pelletColor: "rgb(255,255,0)",
	boosterColor: "rgb(255,60,0)",
	gateColor: "rgba(255,255,255, 0.5)",
	speed: 10,
	data: [
	"XXXXXXXXXXXXXXXXXXXXXXXXXXXX",
	"XooooooooooooXXooooooooooooX", 
	"XoXXXXoXXXXXoXXoXXXXXoXXXXoX", 
	"XoXXXXoXXXXXoXXoXXXXXoXXXXoX", 
	"XoXXXXoXXXXXoXXoXXXXXoXXXXoX", 
	"XooooooooooooooooooooooooooX", 
	"XoXXXXoXXoXXXXXXXXoXXoXXXXoX", 
	"XoXXXXoXXoXXXXXXXXoXXoXXXXoX",
	"XooooooXXooooXXooooXXooooooX", 
	"XXXXXXoXXXXX.XX.XXXXXoXXXXXX", 
	".....XoXXXXX.XX.XXXXXoX.....",
	".....XoXX..........XXoX.....",
	".....XoXX.XXXGGXXX.XXoX.....",
	"XXXXXXoXX.X......X.XXoXXXXXX",
	"T....Xo...X..E...X...oX....T",
	"XXXXXXoXX.X......X.XXoXXXXXX",
	".....XoXX.XXXXXXXX.XXoX.....",
	".....XoXX.....S....XXoX.....",
	".....XoXX.XXXXXXXX.XXoX.....",
	"XXXXXXoXX.XXXXXXXX.XXoXXXXXX",
	"XooooooooooooXXooooooooooooX",
	"XoXXXXoXXXXXoXXoXXXXXoXXXXoX",
	"XoXXXXoXXXXXoXXoXXXXXoXXXXoX",
	"XoooXXooooooo..oooooooXXoooX",
	"XXXoXXoXXoXXXXXXXXoXXoXXoXXX",
	"XXXoXXoXXoXXXXXXXXoXXoXXoXXX",
	"XooooooXXooooXXooooXXooooooX",
	"XoXXXXXXXXXXoXXoXXXXXXXXXXoX",
	"XoXXXXXXXXXXoXXoXXXXXXXXXXoX",
	"XooooooooooooooooooooooooooX",
	"XXXXXXXXXXXXXXXXXXXXXXXXXXXX"]
};

function getTileSize(map, canvasWidth, canvasHeight) {
	//calculates tile dimensions
	if (canvasWidth/map.data[0].length<canvasHeight/map.data.length){
		return Math.floor(canvasWidth/map.data[0].length);
	}
	return Math.floor(canvasHeight/map.data.length);
}

$(document).ready(function() {
var wHeight = $(window).innerHeight(),
		wWidth = $(window).innerWidth(),
		gameArea = document.getElementById('game'),
		mapCanvas = document.getElementById('mapCanvas'),
		resize = false, gameInProgress = false;
ctx = mapCanvas.getContext('2d');
mapCanvas.width = wWidth * 0.9;
mapCanvas.height = wHeight * 0.8;
cW = mapCanvas.width;
cH = mapCanvas.height;
tileSize = getTileSize(map, cW, cH);

if (DEBUG.PATH) {
	var debugCanvas = document.createElement("canvas");
	debugCanvas.id = 'debugCanvas';
	debugCanvas.width = mapCanvas.width;
	debugCanvas.height = mapCanvas.height;
	debugCanvas.style = "position:absolute;";
	gameArea.appendChild(debugCanvas);
	$(debugCanvas).css({'position':'absolute','left':$('#mapCanvas').offset().left, 'top':$('#mapCanvas').offset().top});
}

function getStartX(){
	return (cW - world.data[0].length*tileSize)/2;
}
function getStartY(){
	return (cH - world.data.length*tileSize)/2;
}

function parseMap(map){
	//parses map from a string
	world = {
		data: [],
		pellets: 0,
		bgColor: map.bgColor,
		pelletColor: map.pelletColor,
		boosterColor: map.boosterColor,
		wallColor: map.wallColor,
		speed: map.speed,
		gateColor: map.gateColor
	};
	var newTile, newLine, i, j, line, lineL, tile,
			l = map.data.length;
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
				world.pellets = world.pellets + 1;
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
				newTile = new Tile("open",j,i);
				world.playerStart = {x:j,y:i};
				break;

				case "E":
				newTile = new Tile("open",j,i);
				world.ghostStart = {x:j,y:i};
				break;
			}
			newLine.push(newTile);
		}
		world.data.push(newLine);
	}
	return world;
}



function insertTile(tile, redrawTile){
	//inserts tile at a position in the world (optional: redraws it)
	var i, j, tempTile;
	world.data[tile.posY][tile.posX] = tile;

	if (redrawTile){
		for (i =0; i<3; i=i+1){
			for (j=0; j<3; j=j+1){
				if (tileExists(tile.posX+j-1, tile.posY+i-1)){
					tempTile = new Tile(world.data[tile.posY+i-1][tile.posX+j-1].type, tile.posX+j-1, tile.posY+i-1);	
					tempTile.drawTile();
				}
			}
		}
	}
}

function drawWorld(world) {
	var i, j, row, tile,
		worldL = world.data.length;
	ctx.fillStyle= world.bgColor;
	ctx.fillRect(0,0,cW, cH);
	for (i = 0; i < worldL; i=i+1){
		row = world.data[i].length;
		for (j = 0; j < row; j=j+1) {
			tile = world.data[i][j];
			tile.drawTile();
		}
	}
}

function drawEditor(tile, editor) {
	var ctxed = document.getElementById('editorCanvas').getContext('2d'),
			x = tile.posX*tileSize + startX,
			y = tile.posY*tileSize + startY;
	ctxed.clearRect(0,0,$('#editorCanvas').innerWidth(), $('#editorCanvas').innerHeight());
	ctxed.fillStyle="rgba(255,255,255,0.5)";
	ctxed.clearRect(0,0,editor.width, editor.height);
	ctxed.fillRect(x,y,tileSize,tileSize);
}





//END DRAWING FUNCTIONS
//EDITOR FUNCTIONALITY

function startEditor(){
	var mousePos, activeTile,
			action = false,
			undoStack = [], 
			beforePreview = false,  //storing old Tile before preview overrwrites it
			editor = document.createElement("canvas");
	editor.id = "editorCanvas";
	editor.height = $('#mapCanvas').innerHeight();
	editor.width = $('#mapCanvas').innerWidth();
	gameArea.appendChild(editor);

	function closeEditor() {
		//Closing editor animation
		TweenLite.to('aside', 0.5, {left:-200});
		$(document).off('click','#editor');
		$('#editor').html('Editor');
		$(document).on('click','#editor', startEditor);
		$('#startButton').css({'display': 'inline'});
		$('#undoButton').css({'display':'none'});
		document.getElementById('game').removeChild(document.getElementById('editorCanvas'));
	}
	$('#editorCanvas').css({'position':'absolute','left':$('#mapCanvas').offset().left, 'top':$('#mapCanvas').offset().top});
	$('#editor').html('Close Editor');
	$(document).off('click','#editor');
	$(document).on('click', '#editor', closeEditor);
	$('#startButton').css({display:'none'});

	TweenLite.to('aside', 0.5, {left:0});
	

	$(document).on('click', '#emptyOption', function(){
		action = function(){return new Tile ("open", activeTile.posX, activeTile.posY);};
	});
	$(document).on('click', '#wallOption', function(){
		action = function(){return new Tile ("wall", activeTile.posX, activeTile.posY);};
	});
	$(document).on('click', '#pelletOption', function(){
		action = function(){return new Tile ("pellet", activeTile.posX, activeTile.posY);};
	});
	$(document).on('click', '#boosterOption', function(){
		action = function(){return new Tile ("booster", activeTile.posX, activeTile.posY);};
	});
	$(document).on('click', '#gateOption', function(){
		action = function(){return new Tile ("gate", activeTile.posX, activeTile.posY);};
	});
	
	editor.addEventListener('mousemove', function(e){
		mousePos = getMousePos(editor,e);
		var newT, //New Preview Tile depending on selected action
				tile = getTileAt(mousePos.x, mousePos.y);

		if (activeTile === undefined || tile.posX !== activeTile.posX || tile.posY !== activeTile.posY) {
			
			

			if (action) {
				if (beforePreview){
					//restoring previewed tile
					if (world.data[beforePreview.posY][beforePreview.posX].type !== beforePreview.type){
						insertTile(new Tile (beforePreview.type, beforePreview.posX, beforePreview.posY), true);
					}
				}

				if (!tile) {return;}
				activeTile = tile;
				drawEditor(activeTile, editor);
				newT = action();
				if (activeTile.type !== newT.type){
					//drawing preview tile
					beforePreview = activeTile;
					insertTile(new Tile (newT.type, newT.posX, newT.posY), true);
				}
			}
		}
	});

	editor.addEventListener('click', function(){
		if (!action || activeTile.type === action().type) {return false;}
		activeTile = action();
		undoStack.push(new Tile(beforePreview.type, beforePreview.posX, beforePreview.posY));
		insertTile(new Tile(activeTile.type, activeTile.posX, activeTile.posY), true);//new Tile ("wall", activeTile.posX, activeTile.posY);
		beforePreview = false;
	});

	$('#undoButton').css({display: 'inline'});

	$(document).on('click','#undoButton', function(){
		if (undoStack.length) {
			var oldTile = undoStack.pop();
			insertTile(oldTile);
			drawWorld(world);
		}
	});

}

//GAME FUNCTIONS

function moveEntity(entity, dt){
	switch (entity.moving) {
		case 'up':
			entity.y -= entity.speed*dt;
			break;

		case 'down':
			entity.y += entity.speed*dt;
			break;

		case 'left':
			entity.x -= entity.speed*dt;
			break;

		case 'right':
			entity.x += entity.speed*dt;
			break;
	}
}

function changeMovement(entity, direction){
	entity.nextMove = direction;
}





function resizeMap() {
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
	drawWorld(world);
}

//ACTUAL GAME
function startGame() {
	//GAME SETUP
	var game = document.createElement("canvas"),
			gameOver = false,
			lastTime = Date.now(),
			player = new Pacman (world.playerStart.x * tileSize + startX+tileSize/2, world.playerStart.y*tileSize+startY+tileSize/2, getTile(world.playerStart.x, world.playerStart.y), tileSize*world.speed, world.pelletColor),
			ghostTactics = function(target) {return target.tile;},
			ghost = new Ghost (world.ghostStart.x * tileSize+startX+tileSize/2, world.ghostStart.y * tileSize+startY+tileSize/2, getTile(world.ghostStart.x, world.ghostStart.y), tileSize*world.speed, ghostTypes.redGhost.color, ghostTypes.redGhost.tactics, player),
			ghost2 = new Ghost (world.ghostStart.x * tileSize+startX+tileSize/2, world.ghostStart.y * tileSize+startY+tileSize/2, getTile(world.ghostStart.x, world.ghostStart.y), tileSize*world.speed, ghostTypes.greenGhost.color, ghostTypes.greenGhost.tactics, player),
			enemies = [];
	enemies.push(ghost);
	enemies.push(ghost2);		
	gameInProgress = true;
	gc = game.getContext('2d');
	$('.options').css({display:'none'});

	game.id = "gameCanvas";
	game.height = mapCanvas.height;
	game.width = mapCanvas.width;
	gameArea.appendChild(game);
	$('#gameCanvas').css({'position':'absolute','left':$('#mapCanvas').offset().left, 'top':$('#mapCanvas').offset().top});

	document.addEventListener('keydown', function(event){
		switch (event.keyCode) {
			case 37:
				changeMovement(player, 'left');
				break;
			case 38:
				changeMovement(player, 'up');
				break;
			case 39:
				changeMovement(player, 'right');
				break;
			case 40:
				changeMovement(player, 'down');
				break;
		}
	});
	//END GAME SETUP

	function updateEntity(entity, dt) {
		entity.tile = getTileAt(entity.x, entity.y);

		if (entity.inTileCenter(0.009 * entity.speed/tileSize)) {
				
			if (entity.isGhost) {
				if (!(entity.tile.posX === entity.oldTile.posX && entity.tile.posY === entity.oldTile.posY)){
					if (entity.toStep <= 0 || entity.path.length <1){
						entity.centerEntity();
						entity.init();
					} else {
						entity.centerEntity();
						entity.step();
					}
					entity.oldTile = entity.tile;
					entity.illegalTile = entity.oldTile;
					
				}
			} else {

				if (tileIsWall(entity.tile.checkDirection(entity.moving))){
					entity.moving = false;
					entity.centerEntity();
				}

				if(!tileIsWall(entity.tile.checkDirection(entity.nextMove))) {
					entity.moving = entity.nextMove;
					if (entity.nextMove){
						entity.orientation = entity.nextMove;
					}
				}
			}
		}
		if (entity.moving) {
			moveEntity(entity, dt);	
			
		}
	}

	function removePellet(tile) {
		var newT = new Tile('open', tile.posX, tile.posY);
		world.data[tile.posY][tile.posX] = newT;
		newT.drawTile();
		tile = newT;
	}

	function update(dt) {
		updateEntity(player, dt);
		_.each(enemies, function(enemy){
			updateEntity(enemy,dt);
		});
		//updateEntity(ghost, dt);
		if (player.tile.type === 'pellet' || player.tile.type === 'booster') {
			world.pellets = world.pellets - 1;
			removePellet(player.tile);
		}

		if (world.pellets < 1) {
			gameOver = 'win';
		} else {
			_.each(enemies, function(enemy){
				if (player.tile.posX === enemy.tile.posX && player.tile.posY === enemy.tile.posY) {
					gameOver = 'loser';
				}
			});
		}
		
		
	}

	function render() {
		gc.clearRect(0,0,game.width, game.height);
		player.drawPacman();
		_.each(enemies,function(enemy) {
			enemy.drawGhost();
		});
		if (DEBUG.PATH) {
			var debugCanvas = document.getElementById('debugCanvas');
    	var bugctx = debugCanvas.getContext('2d');
			bugctx.clearRect(0,0,debugCanvas.width,debugCanvas.height);
			_.each(DEBUG.PATHS, function(debugPath) {
				bugctx.fillStyle = debugPath.color;
				bugctx.globalAlpha = 0.2;
				_.each(debugPath.path, function(p){
					bugctx.fillRect(p[0],p[1],tileSize,tileSize);
				});
			});
			bugctx.globalAlpha = 1;
		}
	}

	function end () {
		if (gameOver === 'win') {
			alert("YOU WIN");
		} else {
			alert("YOU SUCK!");
		}
	}

	function main() {
		var now = Date.now(), //current time
				dt = (now - lastTime) / 1000.0; //time difference between clicks

		update(dt);
		render();
		//removal();

		lastTime = now;

		if (resize){
			resizeMap();
			game.height = mapCanvas.height;
			game.width = mapCanvas.width;
			player.x = player.tile.getTilePosition().x + tileSize/2;
			player.y = player.tile.getTilePosition().y + tileSize/2;
			player.speed = tileSize*world.speed;
			ghost.x = ghost.tile.getTilePosition().x + tileSize/2;
			ghost.y = ghost.tile.getTilePosition().y + tileSize/2;
			ghost.speed = tileSize*world.speed;
			resize = false;
		}
		if (gameOver) {
			end();
		} else {
			requestAnimFrame(main);	
		}
	}
	main();
	_.each(enemies, function(enemy){
		enemy.init();
	});
	
}

$(window).load(function(){
	world = parseMap(map);
	startX = getStartX();
	startY = getStartY();
	drawWorld(world);

	$(document).on('click','#editor', startEditor);
	$(document).on('click','#startButton', startGame);
	//startGame();
});


//RESIZE LISTENER
$(window).resize(function(){
	if (gameInProgress) {
		resize = true; //If game in progress, queue the resize after tick is done
	} else {
		resizeMap();
	}
});



});

