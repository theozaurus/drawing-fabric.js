DrawingFabric.Canvas = (function(){

  var Property = (function(){

    return function(config){
      this.parser  = config.parser || function(newVal){ return newVal; };
      this.initial = config.initial;
    };

  })();

  buildProperties = function(){
    var properties = {};

    var toolProperties = {
      'fill':                new Property({initial: 'rgba(255, 255, 255, 0)'}),
      'stroke':              new Property({initial: 'black'}),
      'strokeWidth':         new Property({initial: 2, parser: function(v){ return parseInt(v,10); }}),
      'strokeDashArray':     new Property({initial: null}),
      'fontFamily':          new Property({initial: 'sans-serif'}), // serif, monospace, cursive, fantasy
      'fontSize':            new Property({initial: 36, parser: function(v){ return parseInt(v,10); }}),
      'fontStyle':           new Property({initial: 'normal'}),     // italic, oblique
      'fontWeight':          new Property({initial: 'normal'}),     // bold, bolder, lighter
      'lineHeight':          new Property({initial: 1.0, parser: function(v){ return parseFloat(v); }}),
      'textBackgroundColor': new Property({initial: 'none'}),
      'textDecoration':      new Property({initial: 'none'}),       // underline, overline, line-through
      'textShadow':          new Property({initial: ''})
    };

    var propertySetterFactory = function(property){
      var stored = property.initial;
      return function(v){
        if(typeof v != 'undefined'){
          stored = property.parser(v);
        }
        return stored;
      };
    };

    for(var name in toolProperties){
      if(toolProperties.hasOwnProperty(name)){
        var property = toolProperties[name];
        properties[name] = propertySetterFactory(property);
      }
    }

    return properties;
  };

  return function(canvas_id){

    var that = this;

    this.properties = buildProperties();

    this.fabricCanvas = new fabric.Canvas(canvas_id);

    this.addFunctionality = function(functionality){
      functionality.initialize.apply(this);
    };

  };

}());
