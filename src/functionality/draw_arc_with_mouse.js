//= require ../drawing_fabric
//= require ../utils
//= require ../canvas

DrawingFabric.Functionality.drawArcWithMouse = (function(){

  var utils = DrawingFabric.utils;

  return function(){

    this.initialize = function(){
      var that = this;
      var stage, coordinates, shape, guide;

      var isArc = function(){
        return that.tool() == 'arc';
      };

      var center = function(event){
        coordinates.center = utils.mouseCoord(event);

        stage = 'firstPoint';
      };

      var radius = function(){
        return utils.magnitudeBetweenPoints(
          coordinates.center.x,     coordinates.center.y,
          coordinates.firstPoint.x, coordinates.firstPoint.y
        );
      };

      var endOfArc = function(angle){
        var r = radius();

        var coords = {};
        coords.x = (Math.cos(angle) * r + coordinates.center.x);
        coords.y = (Math.sin(angle) * r + coordinates.center.y);

        return coords;
      };

      var guideCircle = function(){
        if(guide){ that.fabricCanvas.remove(guide); }

        guide = new fabric.Circle({
          left:            coordinates.center.x,
          top:             coordinates.center.y,
          fill:            'none',
          stroke:          that.properties.stroke(),
          strokeWidth:     that.properties.strokeWidth(),
          selectable:      false
        });
        guide.set('opacity',0.1);
        guide.setRadius(radius());

        that.fabricCanvas.add(guide);
      };

      var arcCommand = function(){
        var r = radius();

        var x1 = coordinates.firstPoint.x - coordinates.center.x;
        var y1 = coordinates.firstPoint.y - coordinates.center.y;
        var a1 = utils.angleFromHorizontal(x1,y1);

        var x2 = coordinates.secondPoint.x - coordinates.center.x;
        var y2 = coordinates.secondPoint.y - coordinates.center.y;
        var a2 = utils.angleFromHorizontal(x2,y2);

        var sweepAngle = a2 > a1 ? a2 - a1 : 2 * Math.PI + a2 - a1;
        var sweep = sweepAngle > Math.PI ? '1,1' : '0,1';

        var deg = function(rad){ return 180 * rad / Math.PI; };

        var endCoords = endOfArc(a2);

        return 'M'+coordinates.firstPoint.x+','+coordinates.firstPoint.y+' A'+r+','+r+' 0 '+sweep+' '+endCoords.x+','+endCoords.y;
      };

      var arc = function(){
        shape = new fabric.Path(arcCommand());
        shape.set('fill','none');
        shape.set('stroke',that.properties.stroke());
        shape.set('strokeWidth',that.properties.strokeWidth());
        return shape;
      };

      var firstPoint = function(event){
        coordinates.firstPoint = utils.mouseCoord(event);

        stage = 'secondPoint';
      };

      var firstPointGuide = function(event){
        coordinates.firstPoint = utils.mouseCoord(event);

        guideCircle();
      };

      var secondPoint = function(event){
        if(shape){ that.fabricCanvas.remove(shape); }

        shape = arc();

        that.fabricCanvas.add(shape);
        that.fabricCanvas.remove(guide);

        reset();
      };

      var secondPointGuide = function(event){
        coordinates.secondPoint = utils.mouseCoord(event);

        if(shape){ that.fabricCanvas.remove(shape); }

        shape = shape = arc();

        that.fabricCanvas.add(shape);
      };

      var reset = function(){
        stage = 'center';
        coordinates = {};
        shape = null;
        guide = null;
      };
      reset();

      this.fabricCanvas.on('mouse:move',function(event){
        if(isArc()){
          switch(stage){
          case 'firstPoint':
            firstPointGuide(event);
            break;
          case 'secondPoint':
            secondPointGuide(event);
            break;
          }
        }
      });

      this.fabricCanvas.on('mouse:down',function(event){
        if(isArc()){
          switch(stage){
          case 'center':
            center(event);
            break;
          case 'firstPoint':
            firstPoint(event);
            break;
          case 'secondPoint':
            secondPoint(event);
            break;
          }
        }
      });

    };

  };

}());
