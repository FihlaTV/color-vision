// Copyright 2014-2019, University of Colorado Boulder

/**
 * FilterWireNode forms the wire going from the filter to the slider, including the filter enabled switch.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const colorVision = require( 'COLOR_VISION/colorVision' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const inherit = require( 'PHET_CORE/inherit' );
  const LinearGradient = require( 'SCENERY/util/LinearGradient' );
  const Node = require( 'SCENERY/nodes/Node' );
  const OnOffSwitch = require( 'SUN/OnOffSwitch' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Shape = require( 'KITE/Shape' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const HOLDER_WIDTH = 10;
  const RADIUS = 5;
  const SWITCH_HEIGHT = 17;
  const SWITCH_WIDTH = 8;

  /**
   * @param {Property.<boolean>} onProperty
   * @param {Vector2} start
   * @param {Vector2} end
   * @param {Tandem} tandem
   * @constructor
   */
  function FilterWireNode( onProperty, start, end, tandem ) {

    Node.call( this );

    const switchDistance = ( end.y - start.y ) / 3;

    // draw the wire from the filter to the slider
    const wire = new Shape()
      .moveTo( start.x, start.y )
      .lineTo( start.x + HOLDER_WIDTH, start.y )
      .lineTo( start.x + HOLDER_WIDTH, start.y - HOLDER_WIDTH )
      .moveTo( start.x, start.y )
      .lineTo( start.x - HOLDER_WIDTH, start.y )
      .lineTo( start.x - HOLDER_WIDTH, start.y - HOLDER_WIDTH )
      .moveTo( start.x, start.y )
      .lineTo( start.x, end.y - RADIUS )
      .arc( start.x + RADIUS, end.y - RADIUS, RADIUS, Math.PI, Math.PI / 2, true )
      .lineTo( end.x, end.y );

    const wirePath = new Path( wire, { lineWidth: 5, stroke: '#999999' } );

    // draw the outline of the switch
    const switchOutline = new Shape()
      .arc( start.x + SWITCH_WIDTH, start.y + switchDistance + SWITCH_HEIGHT / 2, 10, -Math.PI / 2, Math.PI / 2 )
      .arc( start.x - SWITCH_WIDTH, start.y + switchDistance + SWITCH_HEIGHT / 2, 10, Math.PI / 2, -Math.PI / 2 )
      .lineTo( start.x + SWITCH_WIDTH, start.y + switchDistance - 1.5 );

    const outlinePath = new Path( switchOutline, { lineWidth: 8, stroke: '#666666' } );

    // draw the switch inside the outline
    const onOffSwitch = new OnOffSwitch( onProperty, {
      size: new Dimension2( SWITCH_HEIGHT * 2, SWITCH_HEIGHT ),
      thumbTouchAreaXDilation: 5,
      thumbTouchAreaYDilation: 5,
      centerTop: new Vector2( start.x, start.y + switchDistance ),
      thumbFill: new LinearGradient( 0, 0, 0, SWITCH_HEIGHT ).addColorStop( 0, 'black' ).addColorStop( 1, 'gray' ),
      trackOffFill: '#eeeeee',
      trackOnFill: '#eeeeee',
      trackStroke: 'black',
      thumbStroke: new LinearGradient( 0, 0, 0, SWITCH_HEIGHT ).addColorStop( 0, '#666666' ).addColorStop( 1, '#333333' ),
      tandem: tandem.createTandem( 'onOffSwitch' )
    } );

    this.addChild( wirePath );
    this.addChild( outlinePath );
    this.addChild( onOffSwitch );
  }

  colorVision.register( 'FilterWireNode', FilterWireNode );

  return inherit( Node, FilterWireNode );
} );
