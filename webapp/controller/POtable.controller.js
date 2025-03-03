sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageBox", "sap/m/MessageToast",  "sap/ui/model/json/JSONModel"],
  (Controller, MessageBox, MessageToast) => {
    "use strict";

    return Controller.extend("com.iherb.tm.ztmvpsiherb.controller.POtable", {
      onInit() {
        this._oPOTableModel = new sap.ui.model.json.JSONModel();
        this.getView().setModel(this._oPOTableModel, "POTableModel");
        this._oPkgModel = this.getOwnerComponent().getModel("PkgModel");
        this._oPartnerModel = this.getOwnerComponent().getModel("PartnerModel");

        this.onReadOdata();
        this.onReadPackOdata();
      },

      onReadOdata: function () {
        sap.ui.core.BusyIndicator.show();
        var oDataModel = this.getOwnerComponent().getModel();
        var that = this;

        oDataModel.read("/ZC_FuItemList", {
          success: function (oData) {
            sap.ui.core.BusyIndicator.hide();
            console.log("OData Response:", oData); // Log full data

            if (oData.results && oData.results.length > 0) {
              console.log("First Freight Order Data:", oData.results[0]); // Log first item

              oData.results.forEach(function (item) {
                item.FreightUnitEditFlag = true; // Add the flag manually
              }),
                that._oPOTableModel.setData({ FreightOrders: oData.results }); // Set data properly
              console.log(
                "Updated Data with FreightUnitEditFlag:",
                that._oPOTableModel.getData()
              );
              console.log("PO data loaded successfully");
            }
          }.bind(this),
          error: function (oerror) {
            sap.ui.core.BusyIndicator.hide();
            console.log("PO data not loaded", oerror);
          }.bind(this),
        });
      },

      onReadPackOdata: function () {
        var oDataModel = this.getOwnerComponent().getModel();

        oDataModel.read("/ZC_PKG_UNIT", {
          success: function (oresponse) {
            sap.ui.core.BusyIndicator.hide();
            this._oPkgModel.setData(oresponse.results);
            console.log("Pack Type data loaded successfully");
            console.log("Pack Type Data:", oresponse.results);
          }.bind(this),
          error: function (oerror) {
            console.log("Pack Type data not loaded", oerror);
          }.bind(this),
        });

        oDataModel.read("/ZC_PARTNER_LOC", {
          success: function (oresponse) {
            sap.ui.core.BusyIndicator.hide();
            this._oPartnerModel.setData(oresponse.results);
            console.log("Patner Data:", oresponse.results);
          }.bind(this),
          error: function (oerror) {
            console.log("Patner data not loaded", oerror);
          }.bind(this),
        });
      },

      onRefresh: function () {
        this.byId("smartTable").rebindTable();
      },

         
      // ******************END
    });
  }
);
