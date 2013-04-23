//= require jquery
//= require ../drawing_fabric
//= require ../canvas

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
