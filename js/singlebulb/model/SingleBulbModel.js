// Copyright 2014-2019, University of Colorado Boulder

/**
 * Model for 'Single Bulb' screen
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Color = require( 'SCENERY/util/Color' );
  const ColorIO = require( 'SCENERY/util/ColorIO' );
  const colorVision = require( 'COLOR_VISION/colorVision' );
  const ColorVisionModel = require( 'COLOR_VISION/common/model/ColorVisionModel' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const DerivedPropertyIO = require( 'AXON/DerivedPropertyIO' );
  const EventTimer = require( 'PHET_CORE/EventTimer' );
  const inherit = require( 'PHET_CORE/inherit' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Property = require( 'AXON/Property' );
  const PropertyIO = require( 'AXON/PropertyIO' );
  const Range = require( 'DOT/Range' );
  const SingleBulbConstants = require( 'COLOR_VISION/singlebulb/SingleBulbConstants' );
  const SingleBulbPhotonBeam = require( 'COLOR_VISION/singlebulb/model/SingleBulbPhotonBeam' );
  const StringIO = require( 'TANDEM/types/StringIO' );
  const VisibleColor = require( 'SCENERY_PHET/VisibleColor' );

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function SingleBulbModel( tandem ) {

    ColorVisionModel.call( this, tandem );

    const flashlightTandem = tandem.createTandem( 'flashlight' );
    const filterTandem = tandem.createTandem( 'filter' );

    // @public {Property.<string>} kind of light in the beam
    this.lightTypeProperty = new Property( 'colored', {
      validValues: [ 'white', 'colored' ],
      tandem: tandem.createTandem( 'lightTypeProperty' ),
      phetioType: PropertyIO( StringIO )
    } );

    // @public {Property.<string>} indicates solid beam vs individual photons
    this.beamTypeProperty = new Property( 'beam', {
      validValues: [ 'beam', 'photon' ],
      tandem: tandem.createTandem( 'beamTypeProperty' ),
      phetioType: PropertyIO( StringIO )
    } );

    // @public {Property.<number>} in units of nm, default wavelength is yellow
    this.flashlightWavelengthProperty = new NumberProperty( 570, {
      tandem: flashlightTandem.createTandem( 'flashlightWavelengthProperty' ),
      units: 'nanometers',
      range: new Range( VisibleColor.MIN_WAVELENGTH, VisibleColor.MAX_WAVELENGTH )
    } );

    // @public {Property.<number>} in units of nm, default wavelength is yellow
    this.filterWavelengthProperty = new NumberProperty( 570, {
      tandem: filterTandem.createTandem( 'filterWavelengthProperty' ),
      units: 'nanometers',
      range: new Range( VisibleColor.MIN_WAVELENGTH, VisibleColor.MAX_WAVELENGTH )
    } );

    // @public {Property.<boolean>} is the flashlight on?
    this.flashlightOnProperty = new BooleanProperty( false, {
      tandem: flashlightTandem.createTandem( 'flashlightOnProperty' )
    } );

    // @public {Property.<boolean>} is the filter on?
    this.filterVisibleProperty = new BooleanProperty( false, {
      tandem: filterTandem.createTandem( 'filterVisibleProperty' )
    } );

    // @public {Property.<Color|string>} keep track of the last photon to hit the eye,
    // for use in calculating the perceived color
    this.lastPhotonColorProperty = new Property( new Color( 0, 0, 0, 0 ) );

    // @public {DerivedProperty.<Color|string>} the color perceived by the person depends on almost every property
    this.perceivedColorProperty = new DerivedProperty( [
        this.flashlightWavelengthProperty,
        this.filterWavelengthProperty,
        this.flashlightOnProperty,
        this.filterVisibleProperty,
        this.lightTypeProperty,
        this.beamTypeProperty,
        this.lastPhotonColorProperty
      ],
      function( flashlightWavelength, filterWavelength, flashlightOn, filterVisible, lightType, beamType, lastPhotonColor ) {

        // If the beam is in photon mode, return the color of the last photon to hit the eye.
        // The logic for handling all of the cases where the beam is in photon mode is in the file
        // SingleBulbPhotonBeam, where lastPhotonColor is set.
        if ( beamType === 'photon' ) {
          return lastPhotonColor;
        }
        // if flashlight is not on, the perceived color is black
        else if ( !flashlightOn ) {
          return Color.BLACK;
        }
        // if the filter is visible, and the beam type is colored, calculate the percentage of color to pass
        else if ( filterVisible && lightType === 'colored' ) {
          let alpha; // the new alpha value for the color, porportional to the percentage of light to pass through the filter
          const halfWidth = SingleBulbConstants.GAUSSIAN_WIDTH / 2;

          // If the flashlightWavelength is outside the transmission width, no color passes.
          if ( flashlightWavelength < filterWavelength - halfWidth || flashlightWavelength > filterWavelength + halfWidth ) {
            alpha = 0;
          }
          // flashlightWavelength is within the transmission width, pass a linear percentage.
          else {
            alpha = 1 - Math.abs( filterWavelength - flashlightWavelength ) / halfWidth;
          }
          return VisibleColor.wavelengthToColor( flashlightWavelength ).withAlpha( alpha );
        }
        // if the filter is visible, and the beam is white, return the filter wavelength's color
        else if ( filterVisible && lightType === 'white' ) {
          return VisibleColor.wavelengthToColor( filterWavelength );
        }
        // if the beam is white and the filter is not visible, return white
        else if ( !filterVisible && lightType === 'white' ) {
          return Color.WHITE;
        }
        // if the filter is not visible, return the flashlight wavelength's color
        else {
          return VisibleColor.wavelengthToColor( flashlightWavelength );
        }
      }, {
        tandem: tandem.createTandem( 'perceivedColorProperty' ),
        phetioType: DerivedPropertyIO( ColorIO )
      } );

    // @public
    this.photonBeam = new SingleBulbPhotonBeam( this, SingleBulbConstants.SINGLE_BEAM_LENGTH, {
      tandem: tandem.createTandem( 'photonBeam' )
    } );

    const self = this;

    // create a new photon every 1/120 seconds
    // @private
    this.eventTimer = new EventTimer( new EventTimer.ConstantEventModel( 120 ), function( timeElapsed ) {
      self.photonBeam.createPhoton( timeElapsed );
    } );
  }

  colorVision.register( 'SingleBulbModel', SingleBulbModel );

  return inherit( ColorVisionModel, SingleBulbModel, {

    // @public
    step: function( dt ) {

      // Cap dt, see https://github.com/phetsims/color-vision/issues/115 and https://github.com/phetsims/joist/issues/130
      dt = Math.min( dt, 0.5 );

      if ( this.playingProperty.value ) {
        this.photonBeam.updateAnimationFrame( dt );
        this.eventTimer.step( dt );
      }
    },

    // @public @override
    // step one frame, assuming 60fps
    manualStep: function() {
      this.photonBeam.updateAnimationFrame( 1 / 60 );
      this.eventTimer.step( 1 / 60 );
    },

    // @public @override
    reset: function() {

      ColorVisionModel.prototype.reset.call( this );

      this.lightTypeProperty.reset();
      this.beamTypeProperty.reset();
      this.flashlightWavelengthProperty.reset();
      this.filterWavelengthProperty.reset();
      this.flashlightOnProperty.reset();
      this.filterVisibleProperty.reset();
      this.lastPhotonColorProperty.reset();

      this.photonBeam.reset();
    }
  } );
} );
