$(function(){
  c = new DrawingFabric.Canvas('canvas');

  c.addFunctionality(new DrawingFabric.Functionality.keyboardEvents()); // Required by keybaordCommands
  c.addFunctionality(new DrawingFabric.Functionality.keyboardCommands());

  c.addFunctionality(new DrawingFabric.Functionality.tools({
    cursor:    $('.js-tools-cursor'),
    ellipse:   $('.js-tools-ellipse'),
    rectangle: $('.js-tools-rectangle'),
    triangle:  $('.js-tools-triangle'),
    line:      $('.js-tools-line'),
    draw:      $('.js-tools-draw'),
    arc:       $('.js-tools-arc'),
    text:      $('.js-tools-text')
  }));
  c.addFunctionality(new DrawingFabric.Functionality.mouseInfo({
    x:    $('.js-mouse-info-x'),
    y:    $('.js-mouse-info-y')
  }));
  c.addFunctionality(new DrawingFabric.Functionality.addDoubleClick());
  c.addFunctionality(new DrawingFabric.Functionality.addText());
  c.addFunctionality(new DrawingFabric.Functionality.drawWithMouse());
  c.addFunctionality(new DrawingFabric.Functionality.drawArcWithMouse());
  c.addFunctionality(new DrawingFabric.Functionality.drawShapeWithMouse());
  c.addFunctionality(new DrawingFabric.Functionality.drawLineWithMouse());
  c.addFunctionality(new DrawingFabric.Functionality.selectedProperties({
    strokeWidth: $('.js-selected-properties-stroke-width'),
    stroke:      $('.js-selected-properties-stroke'),
    fill:        $('.js-selected-properties-fill')
  }));

  $('.js-color').spectrum({
    showAlpha:       true,
    preferredFormat: 'rgb'
  });


});

