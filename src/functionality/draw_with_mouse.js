//= require ../drawing_fabric
//= require ../utils
//= require ../canvas

DrawingFabric.Functionality.drawWithMouse = (function(){

  var utils = DrawingFabric.utils;

  return function(){

    this.initialize = function(){
      var that = this;

      var drawing = false;

      this.fabricCanvas.on('tool:change',function(t){
        if(t == 'draw'){
          drawing = true;
          that.fabricCanvas.isDrawingMode = true;
          that.fabricCanvas.freeDrawingColor     = that.properties.stroke();
          that.fabricCanvas.freeDrawingLineWidth = that.properties.strokeWidth();

        } else if (drawing){
          drawing = false;
          that.fabricCanvas.isDrawingMode = false;
        }
      });

    };

  };

}());
