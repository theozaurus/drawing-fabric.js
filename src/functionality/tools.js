//= require jquery
//= require ../drawing_fabric
//= require ../canvas

DrawingFabric.Functionality.tools = (function(){

  return function(config){

    var tool;

    this.initialize = function(){

      var that = this;

      var select = function(tool){
        $tool_elements.removeClass('active');
        config[tool].addClass('active');
      };

      var $tool_elements = $();
      build_tool = function(tool,elements){
        $tool_elements = $tool_elements.add(elements);
        elements.click( function(){ that.tool(tool); } );
      };

      build_tool('cursor',    config.cursor);
      build_tool('ellipse',   config.ellipse);
      build_tool('rectangle', config.rectangle);
      build_tool('triangle',  config.triangle);
      build_tool('line',      config.line);
      build_tool('draw',      config.draw);
      build_tool('arc',       config.arc);
      build_tool('text',      config.text);

      this.tool = function(t){
        if(t && t != tool){
          tool = t;
          select(tool);
          that.fabricCanvas.fire('tool:change',tool);
          return tool;
        } else {
          return tool;
        }
      };

      this.toolProperties = function(){
        switch(tool){
        case 'triangle':
        case 'rectangle':
        case 'ellipse':
        case 'line':
        case 'draw':
        case 'arc':
          return ['fill', 'stroke', 'strokeWidth', 'strokeDashArray'];
        case 'text':
          return ['fill', 'stroke', 'strokeWidth', 'strokeDashArray',
                  'fontFamily', 'fontStyle', 'fontSize', 'fontWeight', 'lineHeight',
                  'textBackgroundColor', 'textDecoration', 'textShadow'
                 ];
        default:
          return [];
        }
      };

      this.tool('cursor');
    };

  };

}());
