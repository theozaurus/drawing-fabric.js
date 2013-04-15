$(function(){
  c = new DrawingFabric.Canvas('canvas');

  c.addFunctionality(new DrawingFabric.Functionality.tools({
    cursor:    $('.js-tools-cursor'),
    ellipse:   $('.js-tools-ellipse'),
    rectangle: $('.js-tools-rectangle')
  }));
  c.addFunctionality(new DrawingFabric.Functionality.mouseInfo({
    x:    $('.js-mouse-info-x'),
    y:    $('.js-mouse-info-y')
  }));
  c.addFunctionality(new DrawingFabric.Functionality.drawWithMouse());
  c.addFunctionality(new DrawingFabric.Functionality.selectedProperties({
    fill:   $('.js-selected-properties-fill'),
    top:    $('.js-selected-properties-top'),
    left:   $('.js-selected-properties-left'),
    width:  $('.js-selected-properties-width'),
    height: $('.js-selected-properties-height')
  }));

});

