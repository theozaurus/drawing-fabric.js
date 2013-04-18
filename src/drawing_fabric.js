//= require fabric
//= require jquery

DrawingFabric = {};

DrawingFabric.Functionality = {};

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
        if(lastDownTarget == element){ that.fabricCanvas.fire('key:down',e); }
        // Prevent bubbling
        // Keyboard events should use our key:down method
        // Helps stop page scrolling when using cursor keys
        return false;
      });

    };
  };

}());

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

DrawingFabric.Functionality.tools = (function(){

  return function(config){

    var tool = 'cursor';

    this.initialize = function(){

      var that = this;

      config.cursor.click(    function(){ that.tool('cursor');    });
      config.ellipse.click(   function(){ that.tool('ellipse');   });
      config.rectangle.click( function(){ that.tool('rectangle'); });
      config.triangle.click(  function(){ that.tool('triangle');  });
      config.line.click(      function(){ that.tool('line');      });
      config.draw.click(      function(){ that.tool('draw');      });
      config.arc.click(       function(){ that.tool('arc');       });
      config.text.click(      function(){ that.tool('text');      });

      this.tool = function(t){
        if(t && t != tool){
          tool = t;
          that.fabricCanvas.fire('tool:change',tool);
          return tool;
        } else {
          return tool;
        }
      };
    };

  };

}());

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
          stroke:          that.stroke(),
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

        shape = new fabric.Path(arcCommand());
        shape.set('fill','none');
        shape.set('stroke',that.stroke());

        that.fabricCanvas.add(shape);
        that.fabricCanvas.remove(guide);

        reset();
      };

      var secondPointGuide = function(event){
        coordinates.secondPoint = utils.mouseCoord(event);

        if(shape){ that.fabricCanvas.remove(shape); }

        shape = new fabric.Path(arcCommand());
        shape.set('fill','none');
        shape.set('stroke',that.stroke());

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
            if(!event.target){center(event);}
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

        } else if (drawing){
          drawing = false;
          that.fabricCanvas.isDrawingMode = false;
        }
      });

    };

  };

}());

DrawingFabric.Functionality.drawLineWithMouse = (function(){

  var utils = DrawingFabric.utils;

  return function(){

    this.initialize = function(){
      var that = this;

      var drawing = false;
      var startCoords, path;

      var isPath = function(){
        return 'line' == that.tool();
      };

      this.fabricCanvas.on('mouse:move', function(event){
        if(drawing){
          if(path){ that.fabricCanvas.remove(path); }

          var coords = utils.mouseCoord(event);
          path = new fabric.Path('M' + startCoords.x + ',' + startCoords.y+'L'+coords.x+','+coords.y);
          path.set({
            stroke: that.stroke()
          });

          that.fabricCanvas.add(path);
          that.fabricCanvas.renderAll();
        }
      });

      this.fabricCanvas.on('mouse:down', function(event){
        if(drawing){
          drawing = false;
          path    = null;
        } else if (isPath()) {
          drawing = true;
          var coords = utils.mouseCoord(event);
          startCoords = coords;
        }
      });


    };

  };

}());

DrawingFabric.Functionality.drawShapeWithMouse = (function(){

  return function(){

    var mouseState, mouseObject, mouseStartCoord;
    var utils = DrawingFabric.utils;

    this.initialize = function(){
      var that = this;

      var newObject = function(args){
        switch(that.tool()){
        case 'ellipse':
          return new fabric.Ellipse(args);
        case 'rectangle':
          return new fabric.Rect(args);
        case 'triangle':
          return new fabric.Triangle(args);
        }
      };

      var setDimensions = function(object,width,height){
        switch(that.tool()){
        case 'ellipse':
          object.set('rx',width * 0.5).
                 set('ry',height * 0.5).
                 set('width',width).
                 set('height',height);
          break;
        case 'triangle':
        case 'rectangle':
          object.set('width',width).
                 set('height',height);
          break;
        }
      };

      var isObject = function(){
        return ['ellipse','rectangle','triangle'].indexOf(that.tool()) >= 0;
      };

      this.fabricCanvas.on('mouse:down', function(event){
        if(isObject() && !event.target ){
          mouseStartCoord = utils.mouseCoord(event);
          mouseState      = 'down';

          var object = newObject({
            left:   mouseStartCoord.x,
            top:    mouseStartCoord.y,
            fill:   that.fill(),
            active: true
          });

          object.set('width',0).set('height',0);

          that.fabricCanvas.add(object);
          that.fabricCanvas.setActiveObject(object);
          mouseObject = object;
        }
      });

      this.fabricCanvas.on('mouse:up', function(event){
        mouseState  = 'up';
        if(mouseObject){
          // Remove object if mouse didn't move anywhere
          var coords = utils.mouseCoord(event);
          if(coords.x == mouseStartCoord.x && coords.y == mouseStartCoord.y){
            that.fabricCanvas.remove(mouseObject);
          }
          mouseObject.setCoords();
          mouseObject = null;
        }
      });

      this.fabricCanvas.on('mouse:move', function(event){

        if(isObject() && mouseState == 'down'){
          // Resize object as mouse moves
          var coords = utils.mouseCoord(event);

          var width  = coords.x - mouseStartCoord.x;
          var height = coords.y - mouseStartCoord.y;


          var centerX, centerY;
          if(event.e.altKey){
            centerX = mouseStartCoord.x;
            centerY = mouseStartCoord.y;
            width  *= 2;
            height *= 2;
          } else {
            centerX = mouseStartCoord.x + 0.5 * width;
            centerY = mouseStartCoord.y + 0.5 * height;
          }

          setDimensions(mouseObject,Math.abs(width),Math.abs(height));
          mouseObject.set('left',centerX).
                      set('top',centerY);

          that.fabricCanvas.renderAll();
        }
      });
    };

  };

}());


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

DrawingFabric.Functionality.addText = (function(){

  var utils = DrawingFabric.utils;

  var fixTabKey = function(e){
    if(e.keyCode == 9){
      // get caret position/selection
      var start = this.selectionStart;
      var end   = this.selectionEnd;

      var $this = $(this);
      var value = $this.val();

      // set textarea value to: text before caret + tab + text after caret
      $this.val(value.substring(0, start) + "\t" + value.substring(end));

      // put caret at right position again (add one for the tab)
      this.selectionStart = this.selectionEnd = start + 1;

      // prevent the focus lose
      e.preventDefault();
    }
  };

  return function(){

    this.initialize = function(){

      var that = this;

      var selectedObj;
      var $hiddenInput;

      var createHiddenInput = function(){
        if($hiddenInput){return;}
        $hiddenInput = $('<textarea></textarea>');
        $hiddenInput.css('position','absolute');
        $hiddenInput.css('left','-900000px');
        $hiddenInput.keydown(fixTabKey);
        $(that.fabricCanvas.wrapperEl).append($hiddenInput);
      };
      createHiddenInput();

      var isText = function(){
        return that.tool() == 'text';
      };

      var activeTextObject = function(obj){
        return obj instanceof fabric.Text && obj;
      };

      var setupHiddenInput = function(obj){
        $hiddenInput.val(obj.text);
        $hiddenInput.focus();
      };

      var context = function(){
        return that.fabricCanvas.getSelectionContext();
      };

      var withContext = function(yield){
        var ctx = context();
        ctx.save();
        ctx.font = selectedObj._getFontDeclaration();
        yield(ctx);
        ctx.restore();
      };

      var selectionToSelectionByLine = function(indexes){
        var text = selectedObj.text;

        var lines = [];
        // Iterate over the characters to create an array of start and end
        // points for each line (we need a selection box for each line)
        for(var i=indexes[0]; i <= indexes[1]; i++){
          if(i == indexes[0]){
            lines.unshift({start: i});
          }
          if(i == indexes[1]){
            lines[0].end = i;
            break;
          }
          if(text[i] == '\n'){
            lines[0].end = i;
            lines.unshift({start: i+1});
          }
        }

        return lines;
      };

      var cursor;
      var cursorBlinker;
      var renderCaratCursor = function(indexes){
        var coords = cursorIndexToCanvasPosition(indexes[0]);

        removeCarats();

        cursor = new fabric.Rect({
          top:        coords.y,
          left:       coords.x,
          originY:    'top',
          originX:    'left',
          height:     coords.dy,
          width:      1,
          angle:      coords.angle,
          selectable: false
        });
        cursorBlinker = setInterval(function(){
          cursor.set('opacity', !cursor.opacity ? 1 : 0);
          that.fabricCanvas.renderAll();
        }, 500);
        that.fabricCanvas.add(cursor);
        lastCoords = coords;
      };

      var selections = [];
      var renderCaratSelection = function(indexes){
        var lines = selectionToSelectionByLine(indexes);

        removeCarats();

        // For each line build a selection box
        for(var j=0; j < lines.length; j++){
          var line        = lines[j];
          var coordsStart = cursorIndexToCanvasPosition(line.start);
          var coordsEnd   = cursorIndexToCanvasPosition(line.end);

          var width = utils.magnitudeBetweenPoints(
            coordsStart.x,
            coordsStart.y,
            coordsEnd.x,
            coordsEnd.y
          );

          // Get start and end of selection box
          var selection = new fabric.Rect({
            top:        coordsStart.y,
            left:       coordsStart.x,
            originY:    'top',
            originX:    'left',
            opacity:    0.5,
            height:     coordsStart.dy,
            width:      width,
            angle:      coordsStart.angle,
            selectable: false
          });

          that.fabricCanvas.add(selection);
          selections.push(selection);
        }
      };

      var removeCarats = function(){
        if(cursor){
          that.fabricCanvas.remove(cursor);
          clearInterval(cursorBlinker);
          cursor = null;
        }
        for(var i = 0; i < selections.length; i++){
          that.fabricCanvas.remove(selections[i]);
        }
        selections = [];
      };

      var cursorIndexToCanvasPosition = function(cursorIndex){
        var dx,dy,x,y;

        var text = selectedObj.text;

        // Iterate over the characters to find which line the index is on
        // and how many characters in it is
        var newLineCount      = 0;
        var charsSinceNewLine = 0;

        for(var i=0; i < cursorIndex; i++){
          if(text[i] == '\n'){
            newLineCount += 1;
            charsSinceNewLine = 0;
          } else {
            charsSinceNewLine += 1;
          }
        }

        var snippet = text.slice(cursorIndex - charsSinceNewLine,cursorIndex);

        withContext(function(ctx){
          dx = ctx.measureText(snippet).width;
          dy = selectedObj.fontSize * selectedObj.lineHeight;

          // Translate to coordinates relative to canvas
          x  = dx * selectedObj.scaleX + selectedObj.left;
          y  = dy * selectedObj.scaleY * newLineCount + selectedObj.top;
          dy = dy * selectedObj.scaleY;

          var point    = new fabric.Point( x, y );
          var origin   = new fabric.Point( selectedObj.left, selectedObj.top );
          var angle    = fabric.util.degreesToRadians(selectedObj.angle);

          var rotatedPoint = fabric.util.rotatePoint(point,origin,angle);
          results = {
            x:     rotatedPoint.x,
            y:     rotatedPoint.y,
            angle: selectedObj.angle,
            dy:    dy
          };
        });

        return results;
      };

      var cursorIndex = function(){
        return [$hiddenInput[0].selectionStart,$hiddenInput[0].selectionEnd];
      };

      var lastIndexes;
      var handleCarat = function(){
        var indexes = cursorIndex();
        if(indexes != lastIndexes){
          if(indexes[0] == indexes[1]){
            renderCaratCursor(indexes);
          } else {
            renderCaratSelection(indexes);
          }
          lastIndexes = indexes;
        }
      };

      $hiddenInput.keyup(function(e){
        if(selectedObj){
          selectedObj.set('text',$hiddenInput.val());
          handleCarat();
          that.fabricCanvas.renderAll();
        }
      });

      this.fabricCanvas.on('object:dblselected', function(event){
        selectedObj = activeTextObject(event.target);
        if(selectedObj){
          handleCarat();
          setupHiddenInput(selectedObj);
        }
      });

      this.fabricCanvas.on('selection:cleared', function(event){
        selectedObj = null;
        removeCarats();
      });

      var update = function(){
        if(selectedObj){ setupHiddenInput(selectedObj); handleCarat(); }
      };

      this.fabricCanvas.on('object:scaling',  update);
      this.fabricCanvas.on('object:rotating', update);
      this.fabricCanvas.on('object:moving',   update);

      this.fabricCanvas.on('mouse:down', function(event){
        if(isText()){
          var coords = utils.mouseCoord(event);

          var obj = new fabric.Text('',{
            left:        coords.x,
            top:         coords.y,
            originY:     'top',
            originX:     'left',
            active:      true,
            dblselected: true
          });

          that.fabricCanvas.add(obj);
          that.fabricCanvas.setActiveObject(obj);

          // Disgusting hack that seems to make sure the textarea gets focused
          setTimeout(function(){
            that.fabricCanvas.fire('object:dblselected',{target:obj,e:event.e});
          },1);
        }
      });

    };

  };

}());

DrawingFabric.Functionality.selectedProperties = (function(){

  return function(config){

    this.initialize = function(){
      var that = this;

      var update = function(event){
        var shape = event.target;
        config.fill.html(shape.fill);
        config.top.html(shape.top);
        config.left.html(shape.left);
        config.width.html(shape.get('width'));
        config.height.html(shape.get('height'));
      };

      this.fabricCanvas.on('object:selected', update);
      this.fabricCanvas.on('object:modified', update);
      this.fabricCanvas.on('object:scaling',  update);
      this.fabricCanvas.on('object:moving',   update);

      this.fabricCanvas.on('selection:cleared', function(event){
        config.fill.html('');
        config.top.html('');
        config.left.html('');
        config.width.html('');
        config.height.html('');
      });

    };

  };

}());

DrawingFabric.Canvas = (function(){

  return function(canvas_id){

    var that = this;

    this.fill = function(){
      return 'green';
    };

    this.stroke = function(){
      return 'black';
    };

    this.fabricCanvas = new fabric.Canvas(canvas_id);

    this.addFunctionality = function(functionality){
      functionality.initialize.apply(this);
    };

  };

}());
