//= require jquery
//= require ../drawing_fabric
//= require ../canvas

DrawingFabric.Functionality.canvasResizer = (function(){

  return function(container){

    this.initialize = function(){

      var that = this;

      var getDimensions = function(){
        return {width: container.width(), height: container.height()};
      };

      var isVisible = function(){
        return container.is(":visible");
      };

      var last;
      var correctSize = function(){
        if(isVisible()){
          var dimensions = getDimensions();
          if(last != dimensions){
            that.fabricCanvas.setDimensions(dimensions);
            last = dimensions;
          }
        } else {
          queueCheck();
        }
      };

      var timer = null;
      var queueCheck = function(){
        clearTimeout(timer);
        timer = setTimeout(correctSize, 1000);
      };

      var validContainer = function(){
        return container &&
               typeof container.width == 'function' &&
               typeof container.height == 'function';
      };

      if(validContainer()){
        $(window).resize(correctSize);
        correctSize();
      }
    };

  };

}());
