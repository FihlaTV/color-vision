// Copyright 2002-2013, University of Colorado Boulder

/**
 * Model of a photon beam, made of individual photon particles.
 *
 * @author Aaron Davis (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var VisibleColor = require( 'SCENERY_PHET/VisibleColor' );
  var Color = require( 'SCENERY/util/Color' );
  var SingleBulbPhoton = require( 'COLOR_VISION/singlebulb/model/SingleBulbPhoton' );
  var Constants = require( 'COLOR_VISION/ColorVisionConstants' );

  /**
   * @param {SingleBulbModel} model
   * @param {Number} size the length of the beam. This is used to determine what location to restart the photons.
   # @constructor
   */
  function SingleBulbPhotonBeam( model, size ) {
    this.photons = [];
    this.size = size;
    this.model = model;

    var photons = this.photons;
    var startingX = this.size;

    this.model.flashlightOnProperty.onValue( false, function() {
      photons.push( SingleBulbPhoton.createFromPool( startingX, 1, Color.BLACK.withAlpha( 0 ), false ) );
    } );
  }

  var updateAnimationFrame = function( dt ) {

    function randomColor() {
      var r = Math.floor( Math.random() * 256 );
      var g = Math.floor( Math.random() * 256 );
      var b = Math.floor( Math.random() * 256 );
      return new Color( r, g, b, 1 );
    }

    var halfWidth = Constants.GAUSSIAN_WIDTH / 2;
    var probability; // probability for a given photon to pass the filter

    // if the flashlight is on, create new photons this animation frame
    if ( this.model.flashlightOn ) {
      // create a number of photon proportional to dt
      var numToCreate = Math.random() * Math.floor( 5 / dt * 0.016 );
      for ( var i = 0; i < numToCreate; i++ ) {
        var newColor = ( this.model.light === 'white' ) ? randomColor() : VisibleColor.wavelengthToColor( this.model.flashlightWavelength );
        var newPhoton = SingleBulbPhoton.createFromPool( this.size, 1, newColor, ( this.model.light === 'white' ) );

        // randomly offset the starting location of the photon
        newPhoton.location.x += ( Math.random() * newPhoton.velocity.x * dt );
        this.photons.push( newPhoton );
      }
    }

    // move all photons that are currently active
    for ( var j = 0; j < this.photons.length; j++ ) {
      var photon = this.photons[j];

      // check if the photon just passed through the filter location
      if ( this.model.filterVisible && photon.location.x < this.filterOffset && !photon.passedFilter ) {

        // If the flashlightWavelength is outside the transmission width, no photons pass.
        if ( this.model.flashlightWavelength < this.model.filterWavelength - halfWidth || this.model.flashlightWavelength > this.model.filterWavelength + halfWidth ) {
          probability = 0;
        }
        // flashlightWavelength is within the transmission width, pass a linear percentage.
        else {
          probability = 1 - ( ( Math.abs( this.model.filterWavelength - this.model.flashlightWavelength ) / halfWidth ) );
        }

        // set the probability to be 0.3 for white photons
        probability = ( !photon.wasWhite ) ? probability : 0.3;

        // remove a percentage of photons from the beam
        if ( Math.random() >= probability ) {
          photon.freeToPool();
          this.photons.splice( j, 1 ); // remove jth photon from list
        }
        // if the beam is white, make sure it is the color of the filter
        else if ( photon.isWhite ) {
          photon.color = VisibleColor.wavelengthToColor( this.model.filterWavelength );
          photon.isWhite = false;
        }
        // if the photon is not white
        else {
          // set the photonIntensity to be the same as the percentage passing through the filter,
          // for use when setting the perceived color when the photon hits the eye.
          // make sure the intensity is at least 0.2, otherwise it looks too black in the view
          photon.intensity = ( probability < 0.2 ) ? 0.2 : probability;
        }
      }

      // keep track of photons which pass the filter
      if ( photon.location.x < this.filterOffset ) {
        photon.passedFilter = true;
      }

      // move the photon unless it goes out of bounds
      // see related bounds checking code in the view file SingleBulbPhotonBeamNode.js,
      // since this does not seem to completely keep them inside the canvas bounds (for unknown reasons)
      if ( photon.location.x > 0 && photon.location.y > 0 && photon.location.y < Constants.BEAM_HEIGHT ) {
        photon.updateAnimationFrame( dt );

      // if the photon goes out of bounds, update the lastPhotonColor property, which is used in determining the perceived color
      }
      else {
        if ( photon.isWhite ) {
          this.model.lastPhotonColor = new Color( 255, 255, 255, 1 );
        }
        else {
          // set the intensity of the plast photon to leave so we know to adjust the intensity of the perceived color
          var colorWithIntensity = photon.color.copy();
          if ( !photon.wasWhite ) {
            colorWithIntensity.setAlpha( photon.intensity );
          }
          this.model.lastPhotonColor = colorWithIntensity;
        }
        photon.freeToPool();
        this.photons.splice( j, 1 ); // remove jth photon from list
      }
    }

    // emit a black photon for reseting the perceived color to black if no more photons passing through the filter
    if ( probability === 0 && this.model.filterVisible && !this.model.perceivedColor.equals( Color.BLACK ) ) {
      var blackPhoton = SingleBulbPhoton.createFromPool( this.filterOffset, 1, Color.BLACK.withAlpha( 0 ), false );
      blackPhoton.passedFilter = true;
      this.photons.push( blackPhoton );
    }
  };

  var reset = function() {
    // set all photons to be out of bounds to trigger empty redraw
    for ( var i = 0; i < this.photons.length; i++ ) {
      this.photons[i].location.x = 0;
    }
  };

  return inherit( PropertySet, SingleBulbPhotonBeam, { updateAnimationFrame: updateAnimationFrame, reset: reset } );
} );
