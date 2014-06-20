// Copyright 2002-2013, University of Colorado Boulder

/**
 * SolidBeamNode shows the light beam when in beam mode, not as individual photons
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
  var Color = require( 'SCENERY/util/Color' );
  var Property = require( 'AXON/Property' );

  // constants
  var DEFAULT_BEAM_ALPHA = 0.8;
  var UNFILTERED_WHITE_COLOR = Color.WHITE.withAlpha( DEFAULT_BEAM_ALPHA );

  /**
   * @param {SingleBulbModel} model
   * @param {Bounds2} bounds
   * @param {Number} cutoff the x-coordinate of the filter
   * @constructor
   */
  function SolidBeamNode( model, bounds, cutoff ) {

    Node.call( this );

    // use the principle of similar triangles to calculate where to split the beam
    var width = bounds.maxX - bounds.minX;
    var triangleHeight = 30; // height of right triangle the overlaps with the beam fanning
    var smallTriangleWidth = cutoff - bounds.minX;
    var smallTriangleHeight = smallTriangleWidth * triangleHeight / width;

    var leftHalfShape = new Shape()
      .moveTo( bounds.minX, bounds.minY )
      .lineTo( bounds.minX, bounds.maxY )
      .lineTo( cutoff, bounds.maxY + smallTriangleHeight )
      .lineTo( cutoff, bounds.minY - smallTriangleHeight )
      .close();

    var rightHalfShape = new Shape()
      .moveTo( cutoff, bounds.minY - smallTriangleHeight )
      .lineTo( cutoff, bounds.maxY + smallTriangleHeight )
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

    model.flashlightWavelengthProperty.link( function( wavelength ) {
      var newColor = VisibleColor.wavelengthToColor( wavelength );
      rightHalf.fill = newColor;
      wholeBeam.fill = newColor;
    } );

    model.filterVisibleProperty.link( function( visible ) {
      // when the filter turns off, make the whole beam visible and the halves invisible
      wholeBeam.visible = !visible;
      leftHalf.visible = visible;
      rightHalf.visible = visible;

      if ( wholeBeam.visible ) {
        wholeBeam.fill = rightHalf.fill.withAlpha( DEFAULT_BEAM_ALPHA );
      }
    } );

    // This derived property listens for any changes to the model that condition when the beam should be white.
    // It is not assigned to a var, since it would never be used.
    model.toDerivedProperty( [ 'flashlightWavelength', 'filterWavelength', 'light', 'filterVisible', 'beam' ],
      function( flashlightWavelength, filterWavelength, light, filterVisible, beamMode ) {
        // update the beam only if it is visible
        if ( beamMode === 'beam' ) {
          if ( light === 'white' && filterVisible ) {
            leftHalf.fill = VisibleColor.wavelengthToColor( filterWavelength );
            rightHalf.fill = Color.WHITE;
          }
          else if ( light === 'white' && !filterVisible ) {
            wholeBeam.fill = UNFILTERED_WHITE_COLOR;
          }
          else if ( light === 'colored' && filterVisible ) {
            rightHalf.fill = VisibleColor.wavelengthToColor( flashlightWavelength );
          }
        }
      } );

    var visibleProperty = model.toDerivedProperty( [ 'flashlightOn', 'beam' ],
      function( flashlightOn, beamProperty ) {
        return ( flashlightOn && beamProperty === 'beam' );
      } );
    visibleProperty.linkAttribute( this, 'visible' );

    Property.multilink( [model.perceivedColorProperty, visibleProperty], function( perceivedColor, visible ) {
      if ( visible ) {
        leftHalf.fill = perceivedColor;
      }
    } );

    this.addChild( leftHalf );
    this.addChild( rightHalf );
    this.addChild( wholeBeam );
  }

  return inherit( Node, SolidBeamNode );
} );
