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
var $ = jQuery, TweenLite = TweenLite, cW, cH, startX, startY, tileSize, ctx,gc,game, SPREE = {kills:0, countdown:0};
var DEBUG = {
	SHOWGRID: false,
	PATH: false,
	PATHS: {}
};
var world, map = classicMap;
function getMousePos(c, e) {
    var rect = c.getBoundingClientRect();
    return {x: e.clientX - rect.left,y: e.clientY - rect.top};
}


function getStartX(){
	return (cW - world.data[0].length*tileSize)/2;
}
function getStartY(){
	return (cH - world.data.length*tileSize)/2;
}

function killSound(sound, message) {
	sound.play();
	var killbox = document.createElement('div');
	$(killbox).css({'color':'red', 'font-size':'40px','opacity':1, 'display':'block', 'text-align':'center', 'position':'absolute', 'z-index':900, 'width':'100%', 'top':'40%'});
	document.body.appendChild(killbox);
	$(killbox).html(message);
	TweenLite.to(killbox, 1.5, {fontSize: '180px', top: '10%', onComplete:function(){
		$(killbox).css({'color':'white', 'display':'none', 'font-size':'100px'});
		document.body.removeChild(killbox);
	}});
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
var now,lastTime;
function main() {
	if (lastTime === undefined) lastTime = Date.now();
		now = Date.now(); //current time
				dt = (now - lastTime) / 1000.0; //time difference between clicks
				if (dt>0.02) dt = 0.02;
				game.update(dt);
				if (game.getStatus() !== "paused"){
					game.removal();
					render(game);
				}
		//removal();

		lastTime = now;

		if (resize){
			resizeMap();

			gameCanvas.height = mapCanvas.height;
			gameCanvas.width = mapCanvas.width;
			game.player.x = game.player.tile.getTilePosition().x + tileSize/2;
			game.player.y = game.player.tile.getTilePosition().y + tileSize/2;
			game.player.speed = tileSize*world.speed;
			_.each(game.enemies, function(e) {
				e.x = e.tile.getTilePosition().x + tileSize/2;
				e.y = e.tile.getTilePosition().y + tileSize/2;
				e.speed = tileSize*world.speed;
			});
			renderPaths();
			resize = false;
		}
		if (!game.gameOver) {
			requestAnimFrame(main);	
		} else {
			startGame();
		}
	}
//ACTUAL GAME
function startGame() {
	DEBUG.PATHS = {};
	SPREE = {kills:0, countdown:0};
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
	if (game) {
		console.log("GAMEOVER");
		game.cleanUp();
		game.gameOver = true;
	}
	game = new Game ({world:world, gameCanvas:gc, mapCanvas: ctx});
	startSounds[randomInt(0, startSounds.length -1)].play();
	dukeMusic.stop();
	dukeMusic.play();
	main();
	//END GAME SETUP

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
	$(document).on('click','#startButton', function() {
		if (game) {
			game.gameOver = true;
		} else {
		startGame();
		}
	});
	//startGame();
});


//RESIZE LISTENER
$(window).resize(function(){
	if (game) {
		resize = true; //If game in progress, queue the resize after tick is done
	} else {
		resizeMap();
	}

	function resizeUI() {

	}

	resizeUI();


});



});

