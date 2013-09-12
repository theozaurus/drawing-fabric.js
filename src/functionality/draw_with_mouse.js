//= require ../drawing_fabric
//= require ../utils
//= require ../canvas

DrawingFabric.Functionality.drawWithMouse = (function(){

  var utils = DrawingFabric.utils;

  return function(){

    this.initialize = function(){
      var that = this;

      var drawing = false;

      var setProperties = function(){
        console.warn('setProperties');
        that.fabricCanvas.freeDrawingBrush.color = that.properties.stroke();
        that.fabricCanvas.freeDrawingBrush.width = that.properties.strokeWidth();
      };

      this.fabricCanvas.on('tool:change',function(t){
        if(t == 'draw'){
          drawing = true;
          that.fabricCanvas.isDrawingMode = true;
          setProperties();
        } else if (drawing){
          drawing = false;
          that.fabricCanvas.isDrawingMode = false;
        }
      });

      this.fabricCanvas.on('property:change', function(name){
        if(drawing && (name == 'stroke' || name == 'strokeWidth')){
          setProperties();
        }
      });

    };

  };

}());
