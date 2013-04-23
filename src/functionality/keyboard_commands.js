//= require ../drawing_fabric
//= require ../canvas

DrawingFabric.Functionality.keyboardCommands = (function(){

  return function(config){

    this.initialize = function(){

      var that = this;

      var activeObject = function(){
        var obj = that.fabricCanvas.getActiveGroup() || that.fabricCanvas.getActiveObject();
        if(obj && !obj.get('dblselected')){ return obj; }
      };

      var move = function(x,y){
        var obj = activeObject();
        if(obj){
          obj.set('left',obj.left + x);
          obj.set('top',obj.top + y);
          obj.setCoords();
          that.fabricCanvas.renderAll();
        }
      };

      var destroy = function(){
        var obj = activeObject();
        if(obj){
          if(obj.hasOwnProperty('objects')){
            var objs = obj.objects;
            for( var i = 0; i < objs.length; i++ ){
              destroyObject(objs[i]);
            }
            that.fabricCanvas.discardActiveGroup();
            that.fabricCanvas.renderAll();
          } else {
            destroyObject(obj);
          }
        }
      };

      var destroyObject = function(obj){
        that.fabricCanvas.remove(obj);
      };

      this.fabricCanvas.on('key:down',function(e){
        var scale = (e.shiftKey && 10) || 1;

        switch(e.which){
        case 76: // l
        case 37: // left
          move(-1 * scale,0);
          break;
        case 72: // h
        case 39: // right
          move(1 * scale,0);
          break;
        case 75: // k
        case 38: // up
          move(0,-1 * scale);
          break;
        case 74: // j
        case 40: // down
          move(0,1 * scale);
          break;

        case 8:  // backspace
        case 46: // delete
          destroy();
        }
      });

    };

  };

}());
