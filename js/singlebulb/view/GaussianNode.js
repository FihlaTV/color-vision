// Copyright 2002-2013, University of Colorado Boulder

/**
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Shape = require( 'KITE/Shape' );
  var VisibleColor = require( 'SCENERY_PHET/VisibleColor' );
  var Util = require( 'DOT/Util' );

  /**
   * @param {Property} filterWavelengthProperty
   * @param {Rectangle} track
   * @constructor
   */
  function GaussianNode( filterWavelengthProperty, track ) {

    Node.call( this );

    // function for a gaussian with mean 0 and standard deviation 0.5
    var constant = 1 / ( 0.5 * Math.sqrt( 2 * Math.PI ) );
    function gaussian( x ) {
      var exponent = -Math.pow( x, 2 );
      return constant * Math.pow( Math.E, exponent );
    }

    var wavelengthToPosition = function( wavelength ) {
      return Math.floor( Util.clamp( Util.linear( VisibleColor.MIN_WAVELENGTH, VisibleColor.MAX_WAVELENGTH, 0, track.width, wavelength ), 0, track.width ) );
    };

    // constants for determining the shape of the gaussian
    var numSamples = 50;
    var distanceFromMean = 3;
    var height = track.bottom - track.top;
    var xScale = 10;
    var xOffset = track.left - ( distanceFromMean * xScale );

    var curve = new Shape().moveTo( xOffset, track.bottom );
    for ( var i = -distanceFromMean; i <= distanceFromMean; i += distanceFromMean * 2 / numSamples ) {
      curve.lineTo( i * xScale + xOffset, track.bottom - gaussian( i ) * height );
    }
    curve.close();

    var path = new Path( curve,
      {
        lineWidth: 0.5,
        stroke: 'white',
        fill: 'green'
      } );

    filterWavelengthProperty.link( function( wavelength ) {
      var postion = wavelengthToPosition( wavelength );
      path.x = postion + xScale;
    } );

    this.addChild( path );
  }

  return inherit( Path, GaussianNode );
} );