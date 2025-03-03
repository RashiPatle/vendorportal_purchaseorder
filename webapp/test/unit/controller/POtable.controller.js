/*global QUnit*/

sap.ui.define([
	"comiherbtm/z_tm_vpsiherb/controller/POtable.controller"
], function (Controller) {
	"use strict";

	QUnit.module("POtable Controller");

	QUnit.test("I should test the POtable controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
