//= require jquery
//= require ../drawing_fabric
//= require ../canvas

DrawingFabric.Functionality.selectedProperties = (function(){

  return function(config){

    this.initialize = function(){

      var eachConfig = function(fun){
        for(var n in config){
          if(config.hasOwnProperty(n) && that.properties.hasOwnProperty(n)){
            fun(n,config[n]);
          }
        }
      };

      var showDomElement = function($element){
        if($element){ $element.show(); }
      };

      var hideDomElement = function($element){
        if($element){ $element.hide(); }
      };

      var setDomElementValue = function($element,value){
        if(value === null || value == "none"){ return; }
        if($element.is('[type="checkbox"]')){
          $element.prop("checked",value == $element.val());
        } else {
          $element.val((value||'').toString());
        }
        $element.trigger('change');
      };

      var getDomElementValue = function($element){
        if($element.is('[type="checkbox"]')){
          if($element.prop("checked")){
            return $element.val();
          } else {
            return 'normal';
          }
        } else {
          return $element.val();
        }
      };

      var domInputChangeFactory = function(property){
        return function(event){
          var value = getDomElementValue($(event.target));
          var parsedValue = that.properties[property](value);
          if(currentShape && supported && supported.indexOf(property) >= 0){
            currentShape.set(propertyName(property),parsedValue);
            that.fabricCanvas.renderAll();
          }
        };
      };

      var bindDomElements = function(){
        eachConfig(function(n,conf){
          var $e = conf.value;
          var defaultValue = that.properties[n]();
          $e.change(domInputChangeFactory(n));
          setDomElementValue( $e, defaultValue );
        });
      };

      var supportedProperties = function(shape){
        var properties          = that.properties;
        var shapeProperties     = shape.originalState;
        var supportedProperties = [];
        for(var p in properties){
          if(properties.hasOwnProperty(p) && shapeProperties.hasOwnProperty(p)){
            supportedProperties.push(p);
          }
        }
        return supportedProperties;
      };

      var that = this;

      bindDomElements();

      var currentShape;
      var supported;
      var updateDOM = function(event){
        var shape = event.target;

        if(currentShape != shape){ supported = supportedProperties(shape); }
        currentShape = shape;

        eachConfig(function(n,conf){
          if(supported.indexOf(n) >= 0){
            showDomElement(conf.parent);
            setDomElementValue(conf.value,currentShape.get(propertyName(n)));
          } else {
            hideDomElement(conf.parent);
          }
        });
      };

      var updateDOMTool = function(event){
        var supportedToolProperties = that.toolProperties();

        eachConfig(function(n,conf){
          if(supportedToolProperties.indexOf(n) >= 0){
            showDomElement(conf.parent);
          } else {
            hideDomElement(conf.parent);
          }
        });
      };
      updateDOMTool();

      // It makes more sense in the UI
      // to have the fill setting map to stroke, and stroke to fill for text
      var propertyMappings = {
        text: {
          stroke: 'fill',
          fill:   'stroke'
        }
      };

      var propertyName = function(property){
        if( currentShape &&
            propertyMappings[currentShape.type] &&
            propertyMappings[currentShape.type][property] ){
          return propertyMappings[currentShape.type][property];
        } else {
          return property;
        }
      };

      var updateShape = function(property,value){
        if(currentShape){
          currentShape.set(propertyName(property),value);
          that.fabricCanvas.renderAll();
        }
      };

      this.fabricCanvas.on('object:selected', updateDOM);
      this.fabricCanvas.on('object:modified', updateDOM);
      this.fabricCanvas.on('object:scaling',  updateDOM);
      this.fabricCanvas.on('object:moving',   updateDOM);

      this.fabricCanvas.on('tool:change', updateDOMTool);

      this.fabricCanvas.on('selection:cleared', function(event){
        currentShape = null;
        supported    = null;
      });

    };

  };

}());
