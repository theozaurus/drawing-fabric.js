//= require fabric

DrawingFabric = {};

DrawingFabric.Functionality = {};

DrawingFabric.utils = {
  mouseCoord: function(event){
    return {x: event.e.layerX, y: event.e.layerY};
  },
  magnitudeBetweenPoints: function(x1,y1,x2,y2){
    return Math.sqrt(Math.pow(x1 - x2,2) + Math.pow(y1 - y2,2));
  }
};

DrawingFabric.Functionality.mouseInfo = (function(){

  return function(config){

    this.initialize = function(){

      this.fabricCanvas.on("mouse:move",function(event){
        config.x.html(event.e.layerX);
        config.y.html(event.e.layerY);
      });

    };

  };

}());

DrawingFabric.Functionality.tools = (function(){

  return function(config){

    var tool = 'cursor';

    this.initialize = function(){

      config.cursor.click(    function(){ tool = 'cursor';    });
      config.ellipse.click(   function(){ tool = 'ellipse';   });
      config.rectangle.click( function(){ tool = 'rectangle'; });

      this.tool = function(){ return tool; };
    };

  };

}());

DrawingFabric.Functionality.drawWithMouse = (function(){

  return function(){

    var mouseState, mouseObject, mouseStartCoord;
    var utils = DrawingFabric.utils;

    this.initialize = function(){
      var that = this;

      var newObject = function(args){
        switch(that.tool()){
        case 'ellipse':
          return new fabric.Ellipse(args);
        case 'rectangle':
          return new fabric.Rect(args);
        }
      };

      var setDimensions = function(object,width,height){
        switch(that.tool()){
        case 'ellipse':
          object.set('rx',width * 0.5).
                 set('ry',height * 0.5).
                 set('width',width).
                 set('height',height);
          break;
        case 'rectangle':
          object.set('width',width).
                 set('height',height);
          break;
        }
      };

      var isObject = function(){
        return ['ellipse','rectangle'].indexOf(that.tool()) >= 0;
      };

      this.fabricCanvas.on('mouse:down', function(event){
        if(isObject() && !event.target ){
          mouseStartCoord = utils.mouseCoord(event);
          mouseState      = 'down';

          var object = newObject({
            left:   mouseStartCoord.x,
            top:    mouseStartCoord.y,
            fill:   that.colour(),
            active: true
          });

          that.fabricCanvas.add(object);
          that.fabricCanvas.setActiveObject(object,event);
          mouseObject = object;
        }
      });

      this.fabricCanvas.on('mouse:up', function(event){
        mouseState  = 'up';
        if(mouseObject){
          // Remove object if mouse didn't move anywhere
          var coords = utils.mouseCoord(event);
          if(coords.x == mouseStartCoord.x && coords.y == mouseStartCoord.y){
            that.fabricCanvas.remove(mouseObject);
          }
          mouseObject.setCoords();
          mouseObject = null;
        }
      });

      this.fabricCanvas.on('mouse:move', function(event){

        if(isObject() && mouseState == 'down'){
          // Resize object as mouse moves
          var coords = utils.mouseCoord(event);

          var width  = coords.x - mouseStartCoord.x;
          var height = coords.y - mouseStartCoord.y;

          var centerX = mouseStartCoord.x + 0.5 * width;
          var centerY = mouseStartCoord.y + 0.5 * height;

          setDimensions(mouseObject,Math.abs(width),Math.abs(height));
          mouseObject.set('left',centerX).
                      set('top',centerY);

          that.fabricCanvas.renderAll();
        }
      });
    };

  };

}());

DrawingFabric.Functionality.selectedProperties = (function(){

  return function(config){

    this.initialize = function(){
      var that = this;

      var update = function(event){
        var shape = event.target;
        config.fill.html(shape.fill);
        config.top.html(shape.top);
        config.left.html(shape.left);
        config.width.html(shape.get('width'));
        config.height.html(shape.get('height'));
      };

      this.fabricCanvas.on('object:selected', update);
      this.fabricCanvas.on('object:modified', update);
      this.fabricCanvas.on('object:scaling',  update);
      this.fabricCanvas.on('object:moving',   update);

      this.fabricCanvas.on('selection:cleared', function(event){
        config.fill.html('');
        config.top.html('');
        config.left.html('');
        config.width.html('');
        config.height.html('');
      });

    };

  };

}());

DrawingFabric.Canvas = (function(){

  return function(canvas_id){

    var that = this;

    this.colour = function(){
      return 'green';
    };

    this.fabricCanvas = new fabric.Canvas(canvas_id);

    this.addFunctionality = function(functionality){
      functionality.initialize.apply(this);
    };

  };

}());
