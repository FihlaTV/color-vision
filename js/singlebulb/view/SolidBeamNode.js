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

  /**
   * @param {Property} flashlightWavelengthProperty
   * @param {Property} filterWavelengthProperty
   * @param {Property} flashlightOnProperty
   * @param {Property} filterVisibleProperty
   * @param {Bounds2} bounds
   * @param {Number} cutoff the x-coordinate of the filter
   * @constructor
   */
  function SolidBeamNode( flashlightWavelengthProperty, perceivedColorProperty, flashlightOnProperty, filterVisibleProperty, bounds, cutoff ) {

    Node.call( this );

    // use the principle of similar triangles to calculate where to split the beam
    var width = bounds.maxX - bounds.minX;
    var triangleHeight = 8; // half the difference between the large end and small end of the beam
    var ratio = triangleHeight / width;
    var smallerTriangleHeight = ( bounds.maxX - cutoff ) * ratio;

    var leftHalfShape = new Shape()
      .moveTo( bounds.minX, bounds.minY )
      .lineTo( bounds.minX, bounds.maxY )
      .lineTo( cutoff, bounds.maxY + smallerTriangleHeight )
      .lineTo( cutoff, bounds.minY - smallerTriangleHeight )
      .close();

    var rightHalfShape = new Shape()
      .moveTo( cutoff, bounds.minY - smallerTriangleHeight )
      .lineTo( cutoff, bounds.maxY + smallerTriangleHeight )
      .lineTo( bounds.maxX, bounds.maxY + triangleHeight )
      .lineTo( bounds.maxX, bounds.minY - triangleHeight )
      .close();

    // use the whole beam when the filter is disabled, to avoid seeing the cut between the halves
    var wholeBeamShape = new Shape()
      .moveTo( bounds.minX, bounds.minY )
      .lineTo( bounds.minX, bounds.maxY )
      .lineTo( bounds.maxX, bounds.maxY + triangleHeight )
      .lineTo( bounds.maxX, bounds.minY - triangleHeight )
      .close();

    var leftHalf = new Path( leftHalfShape );
    var rightHalf = new Path( rightHalfShape );
    var wholeBeam = new Path( wholeBeamShape );

    flashlightWavelengthProperty.link( function( wavelength ) {
      var newColor = VisibleColor.wavelengthToColor( wavelength );
      rightHalf.fill = newColor;
      wholeBeam.fill = newColor;
    } );

    filterVisibleProperty.link( function( visible ) {
      // when the filter turns off, make the whole beam visible and the halves invisible
      wholeBeam.visible = !visible;
      leftHalf.visible = visible;
      rightHalf.visible = visible;

      if ( wholeBeam.visible ) {
        wholeBeam.fill = rightHalf.fill;
      }
    } );

    flashlightOnProperty.linkAttribute( this, 'visible' );
    perceivedColorProperty.linkAttribute( leftHalf, 'fill' );

    this.addChild( leftHalf );
    this.addChild( rightHalf );
    this.addChild( wholeBeam );
  }

  return inherit( Node, SolidBeamNode );
} );
