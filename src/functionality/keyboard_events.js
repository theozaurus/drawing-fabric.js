//= require jquery
//= require ../drawing_fabric
//= require ../canvas

DrawingFabric.Functionality.keyboardEvents = (function(){

  return function(config){

    this.initialize = function(){

      var lastDownTarget;
      var that = this;
      var element = this.fabricCanvas.upperCanvasEl;

      $(document).mousedown(function(e){
        lastDownTarget = e.target;
      });

      $(document).keydown(function(e){
        if(lastDownTarget == element && $(':focus').length === 0){
          that.fabricCanvas.fire('key:down',e);
          // Prevent bubbling
          // Keyboard events should use our key:down method
          // Helps stop page scrolling when using cursor keys
          return false;
        }
      });

    };
  };

}());
