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
var world, map = classicMap;
function getMousePos(c, e) {
    var rect = c.getBoundingClientRect();
    return {x: e.clientX - rect.left,y: e.clientY - rect.top};
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



function drawEditor(tile, editor) {
	var ctxed = document.getElementById('editorCanvas').getContext('2d'),
			x = tile.posX*tileSize + startX,
			y = tile.posY*tileSize + startY;
	ctxed.clearRect(0,0,$('#editorCanvas').innerWidth(), $('#editorCanvas').innerHeight());
	ctxed.fillStyle="rgba(255,255,255,0.5)";
	ctxed.clearRect(0,0,editor.width, editor.height);
	ctxed.fillRect(x,y,tileSize,tileSize);
}

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
		world.map = world.export();
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
						world.insertTile(new Tile (beforePreview.type, beforePreview.posX, beforePreview.posY), true);
					}
				}

				if (!tile) {return;}
				activeTile = tile;
				drawEditor(activeTile, editor);
				newT = action();
				if (activeTile.type !== newT.type){
					//drawing preview tile
					beforePreview = activeTile;
					world.insertTile(new Tile (newT.type, newT.posX, newT.posY), true);
				}
			}
		}
	});

	editor.addEventListener('click', function(){
		if (!action || activeTile.type === action().type) {return false;}
		activeTile = action();
		undoStack.push(new Tile(beforePreview.type, beforePreview.posX, beforePreview.posY));
		world.insertTile(new Tile(activeTile.type, activeTile.posX, activeTile.posY), true);//new Tile ("wall", activeTile.posX, activeTile.posY);
		beforePreview = false;
	});

	$('#undoButton').css({display: 'inline'});

	$(document).on('click','#undoButton', function(){
		if (undoStack.length) {
			var oldTile = undoStack.pop();
			insertTile(oldTile);
			world.draw(ctx);
		}
	});

}

//GAME FUNCTIONS






function renderPaths() {
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

function render (game) {
  gc.clearRect(0,0,gameCanvas.width, gameCanvas.height);
  game.player.drawPacman();
  _.each(game.enemies,function(enemy) {
    enemy.drawGhost();
  });
  _.each(game.bullets, function(bullet){
    bullet.draw();
  });
  if (DEBUG.PATH) {
    renderPaths();
  }
};



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
	if ($('#debugCanvas').length) {
		debugCanvas.width = cW;
		debugCanvas.height = cH;
		renderPaths();
	}
	world.draw(ctx);
}

//ACTUAL GAME
function startGame() {
	if ($('#gameCanvas').length) {gameArea.removeChild(document.getElementById('gameCanvas'));}
	$('.options').css({display:'none'});
	var gameCanvas = document.createElement("canvas"),
			lastTime = Date.now();
	gc = gameCanvas.getContext('2d');
	gameCanvas.id = "gameCanvas";
	gameCanvas.height = mapCanvas.height;
	gameCanvas.width = mapCanvas.width;
	gameArea.appendChild(gameCanvas);
	$('#gameCanvas').css({'position':'absolute','left':$('#mapCanvas').offset().left, 'top':$('#mapCanvas').offset().top});
	world.parse();
	world.draw(ctx);

	var game = new Game ({world:world, gc:gc});
	//END GAME SETUP

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

		game.update(dt);
		game.removal();
		render(game);
		//removal();

		lastTime = now;

		if (resize){
			resizeMap();

			game.height = mapCanvas.height;
			game.width = mapCanvas.width;
			player.x = player.tile.getTilePosition().x + tileSize/2;
			player.y = player.tile.getTilePosition().y + tileSize/2;
			player.speed = tileSize*world.speed;
			_.each(enemies, function(e) {
				e.x = e.tile.getTilePosition().x + tileSize/2;
				e.y = e.tile.getTilePosition().y + tileSize/2;
				e.speed = tileSize*world.speed;
			});
			renderPaths();
			resize = false;
		}
		if (game.gameOver) {
			end();
		} else {
			requestAnimFrame(main);	
		}
	}
	if (!game.gameOver) main();	
}

$(window).load(function(){
	world = new World(map);
	startX = getStartX();
	startY = getStartY();
	world.draw(ctx);

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

