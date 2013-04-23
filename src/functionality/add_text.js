//= require jquery
//= require ../drawing_fabric
//= require ../utils
//= require ../canvas

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
            fontFamily:  that.properties.fontFamily(),
            fontSize:    that.properties.fontSize(),
            fontStyle:   that.properties.fontStyle(),
            lineHeight:  that.properties.lineHeight(),
            // TODO: Makes more sense to map to fill to stroke
            // Need to think of higher level mechanism to represent this
            stroke:      that.properties.fill(),
            strokeWidth: that.properties.strokeWidth(),
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
