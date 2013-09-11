//= require ../drawing_fabric
//= require ../canvas

DrawingFabric.Functionality.selectWithCursor = (function(){

  var utils = DrawingFabric.utils;

  return function(){

    this.initialize = function(){

      var that = this;

      var findTargetOrig = this.fabricCanvas.findTarget;

      this.fabricCanvas.on('tool:change',function(t){
        if(t == 'cursor'){
          that.fabricCanvas.selection = true;
          that.fabricCanvas.findTarget = findTargetOrig;
        } else {
          that.fabricCanvas.selection = false;
          that.fabricCanvas.findTarget = function(){};
        }
      });

    };

  };

}());
