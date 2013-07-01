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
    enemy.draw();
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
	var ed = new Editor (gameArea, world);

	$(document).on('click','#editor', function () {
		ed.start();
	});
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

