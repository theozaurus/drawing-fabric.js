//= require ./drawing_fabric

DrawingFabric.utils = {
  mouseCoord: function(event){
    return {x: event.e.layerX, y: event.e.layerY};
  },
  magnitudeBetweenPoints: function(x1,y1,x2,y2){
    return Math.sqrt(Math.pow(x1 - x2,2) + Math.pow(y1 - y2,2));
  },
  angleFromHorizontal: function(x,y){
    // Avoid divide by 0
    if(x === 0){ if(y >= 0){ return Math.PI * 0.5; } else { return Math.PI * 1.5; } }
    if(y === 0){ if(x >= 0){ return 0;             } else { return Math.PI;       } }

    var quadrant, opposite, adjacent;
    if(y >= 0){
      if(x >= 0){
        quadrant = 0; opposite = y; adjacent = x;
      } else {
        quadrant = 0.5; opposite = x; adjacent = y;
      }
    } else {
      if(x < 0){
        quadrant = 1; opposite = y; adjacent = x;
      } else {
        quadrant = 1.5; opposite = x; adjacent = y;
      }
    }

    return Math.abs(Math.atan( opposite / adjacent )) + quadrant * Math.PI;
  }
};
