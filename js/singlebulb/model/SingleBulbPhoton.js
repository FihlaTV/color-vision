// Copyright 2014-2019, University of Colorado Boulder

/**
 * Model of a photon for single bulb screen.
 *
 * @author Aaron Davis
 */
define( require => {
  'use strict';

  // modules
  const colorVision = require( 'COLOR_VISION/colorVision' );
  const inherit = require( 'PHET_CORE/inherit' );
  const merge = require( 'PHET_CORE/merge' );
  const RGBPhoton = require( 'COLOR_VISION/rgb/model/RGBPhoton' );
  const SingleBulbPhotonIO = require( 'COLOR_VISION/singlebulb/model/SingleBulbPhotonIO' );

  /**
   * @param {Vector2} location
   * @param {Vector2} velocity
   * @param {number} intensity between 0-1 for color alpha value
   * @param {Color} color
   * @param {boolean} isWhite
   * @param {number} wavelength
   * @param {Object} [options]
   * @constructor
   */
  function SingleBulbPhoton( location, velocity, intensity, color, isWhite, wavelength, options ) {

    options = merge( { phetioType: SingleBulbPhotonIO }, options );
    RGBPhoton.call( this, location, velocity, intensity, options );

    // the "wasWhite" attribute is needed to determine the intensity of a photon passing through the filter.
    // White photons passing through must be changed to match the filter color, but keep full intensity.
    // Colored photons must lose intensity when passing through the filter.
    // @public
    this.isWhite = this.wasWhite = isWhite;
    this.color = color;
    this.wavelength = wavelength;
    this.passedFilter = false;
  }

  colorVision.register( 'SingleBulbPhoton', SingleBulbPhoton );

  return inherit( RGBPhoton, SingleBulbPhoton );
} );
