// Copyright 2014-2019, University of Colorado Boulder

/**
 * SolidBeamNode shows the light beam when in beam mode, not as individual photons
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Color = require( 'SCENERY/util/Color' );
  const colorVision = require( 'COLOR_VISION/colorVision' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Property = require( 'AXON/Property' );
  const Shape = require( 'KITE/Shape' );
  const VisibleColor = require( 'SCENERY_PHET/VisibleColor' );

  // constants
  const DEFAULT_BEAM_ALPHA = 0.8;
  const WHITE_WITH_ALPHA = Color.WHITE.withAlpha( DEFAULT_BEAM_ALPHA );

  /**
   * @param {SingleBulbModel} model
   * @param {Bounds2} bounds
   * @param {number} cutoff the x-coordinate of the filter
   * @constructor
   */
  function SolidBeamNode( model, bounds, cutoff ) {

    Node.call( this );

    // use the principle of similar triangles to calculate where to split the beam
    const width = bounds.maxX - bounds.minX;
    const triangleHeight = 30; // height of right triangle the overlaps with the beam fanning
    const smallTriangleWidth = cutoff - bounds.minX;
    const smallTriangleHeight = smallTriangleWidth * triangleHeight / width;

    const leftHalfShape = new Shape()
      .moveTo( bounds.minX, bounds.minY )
      .lineTo( bounds.minX, bounds.maxY )
      .lineTo( cutoff, bounds.maxY + smallTriangleHeight )
      .lineTo( cutoff, bounds.minY - smallTriangleHeight )
      .close();

    const rightHalfShape = new Shape()
      .moveTo( cutoff, bounds.minY - smallTriangleHeight )
      .lineTo( cutoff, bounds.maxY + smallTriangleHeight )
      .lineTo( bounds.maxX, bounds.maxY + triangleHeight )
      .lineTo( bounds.maxX, bounds.minY - triangleHeight )
      .close();

    // use the whole beam when the filter is disabled, to avoid seeing the cut between the halves
    const wholeBeamShape = new Shape()
      .moveTo( bounds.minX, bounds.minY )
      .lineTo( bounds.minX, bounds.maxY )
      .lineTo( bounds.maxX, bounds.maxY + triangleHeight )
      .lineTo( bounds.maxX, bounds.minY - triangleHeight )
      .close();

    const leftHalf = new Path( leftHalfShape );
    const rightHalf = new Path( rightHalfShape );
    const wholeBeam = new Path( wholeBeamShape );

    model.flashlightWavelengthProperty.link( function( wavelength ) {
      const newColor = VisibleColor.wavelengthToColor( wavelength ).withAlpha( DEFAULT_BEAM_ALPHA );
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

    // listen for any changes to the model that condition when the beam should be white.
    Property.multilink( [
        model.flashlightWavelengthProperty,
        model.filterWavelengthProperty,
        model.lightTypeProperty,
        model.filterVisibleProperty,
        model.beamTypeProperty
      ],
      function( flashlightWavelength, filterWavelength, lightType, filterVisible, beamMode ) {
        // update the beam only if it is visible
        if ( beamMode === 'beam' ) {
          if ( lightType === 'white' && filterVisible ) {
            leftHalf.fill = VisibleColor.wavelengthToColor( filterWavelength ).withAlpha( DEFAULT_BEAM_ALPHA );
            rightHalf.fill = WHITE_WITH_ALPHA;
          }
          else if ( lightType === 'white' && !filterVisible ) {
            wholeBeam.fill = WHITE_WITH_ALPHA;
          }
          else if ( lightType === 'colored' && filterVisible ) {
            rightHalf.fill = VisibleColor.wavelengthToColor( flashlightWavelength ).withAlpha( DEFAULT_BEAM_ALPHA );
          }
          else if ( lightType === 'colored' && !filterVisible ) {
            wholeBeam.fill = VisibleColor.wavelengthToColor( flashlightWavelength ).withAlpha( DEFAULT_BEAM_ALPHA );
          }
        }
      } );

    const visibleProperty = new DerivedProperty( [ model.flashlightOnProperty, model.beamTypeProperty ],
      function( flashlightOn, beamType ) {
        return ( flashlightOn && beamType === 'beam' );
      } );
    visibleProperty.linkAttribute( this, 'visible' );

    Property.multilink( [ model.perceivedColorProperty, visibleProperty ],
      function( perceivedColor, visible ) {
        if ( visible ) {
          // scale the alpha between 0 and DEFAULT_BEAM_ALPHA instead of 0 and 1 so the beam always retains some transparency
          leftHalf.fill = perceivedColor.withAlpha( DEFAULT_BEAM_ALPHA * perceivedColor.a );
        }
      } );

    this.addChild( leftHalf );
    this.addChild( rightHalf );
    this.addChild( wholeBeam );
  }

  colorVision.register( 'SolidBeamNode', SolidBeamNode );

  return inherit( Node, SolidBeamNode );
} );
