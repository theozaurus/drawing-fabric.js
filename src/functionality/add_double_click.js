//= require ../drawing_fabric
//= require ../canvas

DrawingFabric.Functionality.addDoubleClick = (function(){

  return function(){

    this.initialize = function(){

      var that = this;

      var obj;

      var handle = function(event){
        obj = that.fabricCanvas.getActiveObject();
        if(obj){
          obj.set('dblselected',true);
          that.fabricCanvas.fire('object:dblselected',{e: event, target: obj});
        }
      };

      that.fabricCanvas.on('before:selection:cleared', function(){
        obj = that.fabricCanvas.getActiveObject();
        if(obj){
          obj.set('dblselected',false);
          obj = null;
        }
      });

      fabric.util.addListener(this.fabricCanvas.upperCanvasEl, 'dblclick', handle);
    };

  };

}());
