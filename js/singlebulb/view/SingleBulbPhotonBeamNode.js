// Copyright 2002-2014, University of Colorado Boulder

/**
 * Photon beam for single bulb view
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );

  /**
   * @param {SingleBulbModel} model
   * @param {Object} [options], must contain a canvasBounds attribute of type Bounds2
   * @constructor
   */
  function SingleBulbPhotonBeamNode( model, options ) {

    this.photons = model.photonBeam.photons;

    CanvasNode.call( this, options );

    var thisNode = this;
    model.beamTypeProperty.link( function( beam ) {
      thisNode.visible = ( beam === 'photon' );
    } );

    this.invalidatePaint();
  }

  return inherit( CanvasNode, SingleBulbPhotonBeamNode, {

    // @param {CanvasContextWrapper} wrapper
    paintCanvas: function( wrapper ) {
      var context = wrapper.context;

      for ( var i = 0; i < this.photons.length; i++ ) {
        context.fillStyle = this.photons[ i ].color.toCSS();
        context.fillRect( this.photons[ i ].location.x, this.photons[ i ].location.y, 3, 2 );
      }
    },

    step: function( dt ) {
      this.invalidatePaint();
    }

  } );
} );
