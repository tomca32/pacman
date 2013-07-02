;

function Editor (gameArea, world) {
  var that = this;
  this.world = world;
  this.gameArea = gameArea;
  this.mousePos;
  this.tile;
  this.activeTile;
  this.action;
  this.undoStack = [];
  this.beforePreview;
  this.editorCanvas = document.createElement("canvas");
  this.editorCanvas.id = "editorCanvas";
  this.editorCanvas.height = $("#mapCanvas").innerHeight();
  this.editorCanvas.width = $("#mapCanvas").innerWidth();
  gameArea.appendChild(this.editorCanvas);

  $(document).on('click', '.tileOption', function(e){
    that.action = function(){return new Tile ($(e.target).parent().data("type"), that.activeTile.posX, that.activeTile.posY);}
  });
  that.editorCanvas.addEventListener('mousemove', function(e){
    that.mousePos = getMousePos(that.editorCanvas,e);
    var newT; //New Preview Tile depending on selected action
    that.tile = getTileAt(that.mousePos.x, that.mousePos.y);

    if (that.activeTile === undefined || that.tile.posX !== that.activeTile.posX || that.tile.posY !== that.activeTile.posY) {
      if (that.action) {
        if (that.beforePreview){
          //restoring previewed tile
          if (world.data[that.beforePreview.posY][that.beforePreview.posX].type !== that.beforePreview.type){
            that.world.insertTile(new Tile (that.beforePreview.type, that.beforePreview.posX, that.beforePreview.posY), true);
          }
        }
        if (!that.tile) {return;}
        that.activeTile = that.tile;
        that.draw(that.activeTile, that.editor);
        newT = that.action();
        if (that.activeTile.type !== newT.type){
          //drawing preview tile
          that.beforePreview = that.activeTile;
          that.world.insertTile(new Tile (newT.type, newT.posX, newT.posY), true);
        }
      }
    }
  });
}

Editor.prototype.draw = function (tile) {
  var ctxed = this.editorCanvas.getContext('2d'),
  x = tile.posX*tileSize + startX,
  y = tile.posY*tileSize + startY;
  ctxed.clearRect(0,0,$('#editorCanvas').innerWidth(), $('#editorCanvas').innerHeight());
  ctxed.fillStyle="rgba(255,255,255,0.5)";
  ctxed.clearRect(0,0,editor.width, editor.height);
  ctxed.fillRect(x,y,tileSize,tileSize);
  console.log('draw');
};

Editor.prototype.start = function () {
  var that = this;
  $('#editorCanvas').css({'position':'absolute','left':$('#mapCanvas').offset().left, 'top':$('#mapCanvas').offset().top});
  $('#editor').html('Close Editor');
  $(document).off('click','#editor');
  $(document).on('click', '#editor', function() {that.close();});
  $('#startButton').css({display:'none'});
  TweenLite.to('aside', 0.5, {left:0});

  
  that.editorCanvas.addEventListener('click', function(){
    if (!that.action || that.activeTile.type === that.action().type) {return false;}
    that.activeTile = that.action();
    that.undoStack.push(new Tile(that.beforePreview.type, that.beforePreview.posX, that.beforePreview.posY));
    that.world.insertTile(new Tile(that.activeTile.type, that.activeTile.posX, that.activeTile.posY), true);//new Tile ("wall", activeTile.posX, activeTile.posY);
    that.beforePreview = false;
  });

  $('#undoButton').css({display: 'inline'});

  $(document).on('click','#undoButton', function(){
    if (that.undoStack.length) {
      var oldTile = that.undoStack.pop();
      that.world.insertTile(oldTile);
      that.world.draw(ctx);
    }
  });
};

Editor.prototype.close = function () {
  var that = this;
  that.action = false;
  that.world.map = that.world.export();
  TweenLite.to('aside', 0.5, {left:-200});
  $(document).off('click','#editor');
  $('#editor').html('Editor');
  $(document).on('click','#editor', function(){that.start();});
  $('#startButton').css({'display': 'inline'});
  $('#undoButton').css({'display':'none'});
};