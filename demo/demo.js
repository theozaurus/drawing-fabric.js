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
  c.addFunctionality(new DrawingFabric.Functionality.selectWithCursor());
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
    strokeWidth: {
      value:  $('.js-selected-properties-stroke-width-value'),
      parent: $('.js-selected-properties-stroke-width')
    },
    stroke: {
      value:  $('.js-selected-properties-stroke-value'),
      parent: $('.js-selected-properties-stroke')
    },
    fill: {
      value: $ ('.js-selected-properties-fill-value'),
      parent: $('.js-selected-properties-fill')
    },
    fontFamily: {
      value:  $('.js-selected-properties-font-family-value'),
      parent: $('.js-selected-properties-font-family')
    },
    fontSize: {
      value:  $('.js-selected-properties-font-size-value'),
      parent: $('.js-selected-properties-font-size')
    },
    lineHeight: {
      value:  $('.js-selected-properties-line-height-value'),
      parent: $('.js-selected-properties-line-height')
    },
    fontStyle: {
      value:  $('.js-selected-properties-font-style-value'),
      parent: $('.js-selected-properties-font-style')
    },
    fontWeight: {
      value:  $('.js-selected-properties-font-weight-value'),
      parent: $('.js-selected-properties-font-weight')
    }
  }));

  // Customise buttons

  //// Use spectrum colour picker
  $('.js-color').each(function(i,e){
    var $e = $(e);

    // Enable spectrum on each input
    $e.spectrum({
      showAlpha:       true,
      preferredFormat: 'rgb'
    });

    // Ensure if the input changes spectrum is updated
    $e.change(function(){
      var newVal = $e.val();
      if($e.spectrum('get') != newVal){
        $e.spectrum('set',newVal);
      }
    });
  });

  //// Turn checkboxes into toggle buttons
  $('.js-bootstrap-toggle').each(function(i,e){
    var $e = $(e);

    var $input = $e.find('input');

    // Find input and hide it
    $input.hide();

    // Wrap with boot strap toggle button
    $e.wrap('<button type="button" class="btn" data-toggle="button"></button>');

    // Make button strap toggle button match value of checkbox
    var $button = $e.parents('button');
    if($input.is(':checked')){ $button.button('toggle'); }

    $input.change(function(){
      if( $input.is(':checked') != $button.hasClass('active')){
        $button.button('toggle');
      }
    });

    $button.click(function(){
      $input.prop('checked',$button.hasClass('active'));
    });

  });


});

