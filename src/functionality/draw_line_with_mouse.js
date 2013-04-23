//= require ../drawing_fabric
//= require ../utils
//= require ../canvas

DrawingFabric.Functionality.drawLineWithMouse = (function(){

  var utils = DrawingFabric.utils;

  return function(){

    this.initialize = function(){
      var that = this;

      var drawing = false;
      var startCoords, path;

      var isPath = function(){
        return 'line' == that.tool();
      };

      this.fabricCanvas.on('mouse:move', function(event){
        if(drawing){
          if(path){ that.fabricCanvas.remove(path); }

          var coords = utils.mouseCoord(event);
          path = new fabric.Path('M' + startCoords.x + ',' + startCoords.y+'L'+coords.x+','+coords.y);
          path.set({
            stroke:      that.properties.stroke(),
            strokeWidth: that.properties.strokeWidth()
          });

          that.fabricCanvas.add(path);
          that.fabricCanvas.renderAll();
        }
      });

      this.fabricCanvas.on('mouse:down', function(event){
        if(drawing){
          drawing = false;
          path    = null;
        } else if (isPath()) {
          drawing = true;
          var coords = utils.mouseCoord(event);
          startCoords = coords;
        }
      });


    };

  };

}());
