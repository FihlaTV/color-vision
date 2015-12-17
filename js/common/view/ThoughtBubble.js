// Copyright 2014-2015, University of Colorado Boulder

/**
 * View for ThoughtBubble objects
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var colorVision = require( 'COLOR_VISION/colorVision' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Shape = require( 'KITE/Shape' );
  var Path = require( 'SCENERY/nodes/Path' );

  /**
   * @param {Property.<Color|string>} perceivedColorProperty
   * @param {number} yRadius
   * @param {Object} [options]
   * @constructor
   */
  function ThoughtBubble( perceivedColorProperty, yRadius, options ) {

    var ellipse = new Shape().ellipse( 0, 0, yRadius * 2, yRadius, 0 );
    Path.call( this, ellipse,
      {
        lineWidth: 0.5,
        stroke: '#c0b9b9' // gray
      } );

    perceivedColorProperty.linkAttribute( this, 'fill' );

    this.mutate( options );
  }

  colorVision.register( 'ThoughtBubble', ThoughtBubble );

  return inherit( Path, ThoughtBubble );
} );