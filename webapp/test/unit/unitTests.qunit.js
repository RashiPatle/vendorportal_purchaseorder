/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comiherbtm/z_tm_vpsiherb/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
