//= require ../drawing_fabric
//= require ../utils
//= require ../canvas

DrawingFabric.Functionality.drawShapeWithMouse = (function(){

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
        case 'triangle':
          return new fabric.Triangle(args);
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
        case 'triangle':
        case 'rectangle':
          object.set('width',width).
                 set('height',height);
          break;
        }
      };

      var isObject = function(){
        return ['ellipse','rectangle','triangle'].indexOf(that.tool()) >= 0;
      };

      this.fabricCanvas.on('mouse:down', function(event){
        if(isObject()){
          mouseStartCoord = utils.mouseCoord(event);
          mouseState      = 'down';

          var object = newObject({
            left:        mouseStartCoord.x,
            top:         mouseStartCoord.y,
            fill:        that.properties.fill(),
            stroke:      that.properties.stroke(),
            strokeWidth: that.properties.strokeWidth(),
            active:      true
          });

          object.set('width',0).set('height',0);

          that.fabricCanvas.add(object);
          that.fabricCanvas.setActiveObject(object);
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


          var centerX, centerY;
          if(event.e.altKey){
            centerX = mouseStartCoord.x;
            centerY = mouseStartCoord.y;
            width  *= 2;
            height *= 2;
          } else {
            centerX = mouseStartCoord.x + 0.5 * width;
            centerY = mouseStartCoord.y + 0.5 * height;
          }

          setDimensions(mouseObject,Math.abs(width),Math.abs(height));
          mouseObject.set('left',centerX).
                      set('top',centerY);

          that.fabricCanvas.renderAll();
        }
      });
    };

  };

}());
