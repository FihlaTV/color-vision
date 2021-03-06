// Copyright 2014-2019, University of Colorado Boulder

/**
 * Model of the photon beams used on the RGB screen, made of individual photon particles.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const colorVision = require( 'COLOR_VISION/colorVision' );
  const ColorVisionConstants = require( 'COLOR_VISION/common/ColorVisionConstants' );
  const inherit = require( 'PHET_CORE/inherit' );
  const RGBPhoton = require( 'COLOR_VISION/rgb/model/RGBPhoton' );
  const Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {string} color an rgb string
   * @param {Property.<number>} intensityProperty the intensity property for this color from the model
   * @param {Property.<number>} perceivedIntensityProperty the perceived intensity property for this color from the model
   * @param {number} beamLength the length of the beam, used to calculate the starting x coordinate
   * @param {Tandem} tandem
   * @constructor
   */
  function RGBPhotonBeam( color, intensityProperty, perceivedIntensityProperty, beamLength, tandem ) {

    // @public
    this.photons = [];
    this.color = color;
    this.beamLength = beamLength;

    // @private
    this.intensityProperty = intensityProperty;
    this.perceivedIntensityProperty = perceivedIntensityProperty;
  }

  colorVision.register( 'RGBPhotonBeam', RGBPhotonBeam );

  return inherit( Object, RGBPhotonBeam, {

    // @public
    updateAnimationFrame: function( dt ) {

      // move all photons that are currently active
      for ( let i = 0; i < this.photons.length; i++ ) {

        // calculate the new location of the photon in order to check whether will still be in bounds
        const newX = this.photons[ i ].location.x + dt * this.photons[ i ].velocity.x;
        const newY = this.photons[ i ].location.y + dt * this.photons[ i ].velocity.y;

        if ( newX > 0 && newY > 0 && newY < ColorVisionConstants.BEAM_HEIGHT ) {
          this.photons[ i ].updateAnimationFrame( newX, newY );
        }
        else {
          this.perceivedIntensityProperty.set( this.photons[ i ].intensity );
          this.photons.splice( i, 1 ); // remove jth RGBPhoton from list
        }
      }

      // emit a black photon for resetting the perceived color to black if no more photons are emitted this frame
      if ( this.intensityProperty.get() === 0 ) {
        const blackPhoton = new RGBPhoton(
          new Vector2( this.beamLength, ColorVisionConstants.BEAM_HEIGHT / 2 ),
          new Vector2( ColorVisionConstants.X_VELOCITY, 0 ),
          0
        );
        this.photons.push( blackPhoton );
      }
    },

    // @public
    createPhoton: function( timeElapsed ) {
      const intensity = this.intensityProperty.get();

      // only create a new photon if intensity is greater than 0
      if ( intensity > 0 ) {
        const x = this.beamLength + ColorVisionConstants.X_VELOCITY * timeElapsed;
        const yVelocity = ( phet.joist.random.nextDouble() * ColorVisionConstants.FAN_FACTOR - ( ColorVisionConstants.FAN_FACTOR / 2 ) ) * 60;

        const initialY = yVelocity * ( 25 / 60 ) + ( ColorVisionConstants.BEAM_HEIGHT / 2 );
        const deltaY = yVelocity * timeElapsed;
        const y = initialY + deltaY;

        this.photons.push( new RGBPhoton(
          new Vector2( x, y ),
          new Vector2( ColorVisionConstants.X_VELOCITY, yVelocity ),
          intensity )
        );
      }
    },

    // @public
    reset: function() {
      // empty photon array
      while ( this.photons.length ) {
        this.photons.pop();
      }
    }
  } );
} );