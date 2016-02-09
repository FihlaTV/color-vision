// Copyright 2014-2015, University of Colorado Boulder

/**
 * The 'RGB' screen. Conforms to the contract specified in joist/Screen.
 *
 * @author Sam Reid
 */
define( function( require ) {
  'use strict';

  // modules
  var colorVision = require( 'COLOR_VISION/colorVision' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var RGBScreenView = require( 'COLOR_VISION/rgb/view/RGBScreenView' );
  var RGBIconNode = require( 'COLOR_VISION/rgb/view/RGBIconNode' );
  var RGBModel = require( 'COLOR_VISION/rgb/model/RGBModel' );
  var ColorVisionConstants = require( 'COLOR_VISION/common/ColorVisionConstants' );

  // strings
  var rgbBulbsModuleTitleString = require( 'string!COLOR_VISION/RgbBulbsModule.title' );

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function RGBScreen( tandem ) {
    Screen.call( this, rgbBulbsModuleTitleString, new RGBIconNode( ColorVisionConstants.HOME_SCREEN_ICON_OPTIONS ),
      function() { return new RGBModel( tandem.createTandem( 'model' ) ); },
      function( model ) { return new RGBScreenView( model, tandem.createTandem( 'view' ) ); }, {
        backgroundColor: 'black',
        navigationBarIcon: new RGBIconNode( ColorVisionConstants.NAVBAR_ICON_OPTIONS ),
        tandem: tandem
      }
    );
  }

  colorVision.register( 'RGBScreen', RGBScreen );

  return inherit( Screen, RGBScreen );
} );