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
        console.log(event.e);
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

      var isObject = function(){
        return ['ellipse','rectangle'].indexOf(that.tool()) >= 0;
      };

      this.fabricCanvas.on('mouse:down', function(event){
        console.warn(that.tool());
        if(isObject() && !event.target ){
          mouseStartCoord = utils.mouseCoord(event);
          mouseState      = 'down';

          var object = newObject({
            left:   mouseStartCoord.x,
            top:    mouseStartCoord.y,
            radius: 0,
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
          mouseObject.set('width',mouseObject.left - coords.x);
          mouseObject.set('height',mouseObject.top - coords.y);
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

      this.fabricCanvas.on('object:selected', function(event){
        console.warn('object:selected',event, that.fabricCanvas.getActiveObject());
        // config.
        config.fill.html(event.target.fill);
      });

      this.fabricCanvas.on('selection:cleared', function(event){
        console.warn('selection:cleared',event);
        // config.
        config.fill.html('');
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
