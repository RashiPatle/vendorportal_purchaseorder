sap.ui.define(
  ["sap/ui/core/mvc/Controller", "sap/m/MessageBox", "sap/m/MessageToast", "sap/ui/model/json/JSONModel"],
  (Controller, MessageBox, MessageToast) => {
    "use strict";

    return Controller.extend("com.iherb.tm.ztmvpsiherb.controller.POtable", {
      onInit: function () {
        this._oPOTableModel = new sap.ui.model.json.JSONModel();
        this.getView().setModel(this._oPOTableModel, "POTableModel");

        this._oPkgUnitData = {};  // To store Package Unit data
        this._oPartnerLocData = {};  // To store Partner Location data

        this.onReadOdata(); // Fetch main entity first
      },

      onReadOdata: function () {
        sap.ui.core.BusyIndicator.show();
        var oDataModel = this.getOwnerComponent().getModel();
        var that = this;

        oDataModel.read("/ZC_FuItemList", {
          success: function (oData) {
            console.log("OData Response:", oData);

            // Store main data
            that._oMainData = oData.results;

            // Fetch Package Unit Data
            that.onReadPackOdata();
          },
          error: function (oError) {
            sap.ui.core.BusyIndicator.hide();
            console.error("PO data not loaded", oError);
          }
        });
      },

      onReadPackOdata: function () {
        var oDataModel = this.getOwnerComponent().getModel();
        var that = this;

        // Fetch Package Unit Data
        oDataModel.read("/ZC_PKG_UNIT", {
          success: function (oResponse) {
            console.log("Pack Type Data:", oResponse.results);

            // Store in a map for quick lookup
            oResponse.results.forEach(function (unit) {
              that._oPkgUnitData[unit.PkgUni] = unit;
            });

            // Fetch Partner Location Data
            that.onReadPartnerOdata();
          },
          error: function (oError) {
            console.error("Pack Type data not loaded", oError);
          }
        });
      },

      onReadPartnerOdata: function () {
        var oDataModel = this.getOwnerComponent().getModel();
        var that = this;

        oDataModel.read("/ZC_PARTNER_LOC", {
          success: function (oResponse) {
            console.log("Partner Data:", oResponse.results);

            // Store in a map for quick lookup
            oResponse.results.forEach(function (partner) {
              that._oPartnerLocData[partner.Partner] = partner;
            });

            // Now merge all data
            that.mergeData();
          },
          error: function (oError) {
            console.error("Partner data not loaded", oError);
          }
        });
      },

      mergeData: function () {
        var that = this;

        this._oMainData.forEach(function (item) {
          // Merge Package Unit Data
          item.PkgUnitDetails = that._oPkgUnitData[item.PkgUni] || { PkgUni: "", Descr: "" };

          // Merge Partner Location Data
          item.PartnerLocationDetails = that._oPartnerLocData[item.Partner] || { Partner: "", Location: "" };

          // Add FreightUnitEditFlag
          item.FreightUnitEditFlag = true;
        });

        // Set the final merged data to the JSON model
        this._oPOTableModel.setData({ FreightOrders: this._oMainData });

        console.log("Final Merged Data:", this._oMainData);
        sap.ui.core.BusyIndicator.hide();
      },

      // onInit() {
      //   this._oPOTableModel = new sap.ui.model.json.JSONModel();
      //   this.getView().setModel(this._oPOTableModel, "POTableModel");
      //   this._oPkgModel = this.getOwnerComponent().getModel("PkgModel");
      //   this._oPartnerModel = this.getOwnerComponent().getModel("PartnerModel");

      //   this.onReadOdata();
      //   this.onReadPackOdata();
      // },

      // onReadOdata: function () {
      //   sap.ui.core.BusyIndicator.show();
      //   var oDataModel = this.getOwnerComponent().getModel();
      //   var that = this;

      //   // oDataModel.read("/ZC_FuItemList?$expand=ZC_PKG_UNIT&$select=ID,Name,ZC_PKG_UNIT/PkgUni,ZC_PKG_UNIT/Descr")
      //   oDataModel.read("/ZC_FuItemList", {
      //     success: function (oData) {
      //       sap.ui.core.BusyIndicator.hide();
      //       console.log("OData Response:", oData); // Log full data

      //       oData.results.forEach(function (item) {
      //         item.FreightUnitEditFlag = true; // Add the flag manually
      //       }),
      //         that._oPOTableModel.setData({ FreightOrders: oData.results }); // Set data properly
      //       console.log(
      //         "Updated Data with FreightUnitEditFlag:",
      //         that._oPOTableModel.getData()
      //       );
      //     }.bind(this),
      //     error: function (oerror) {
      //       sap.ui.core.BusyIndicator.hide();
      //       console.log("PO data not loaded", oerror);
      //     }.bind(this),
      //   });
      // },

      // onReadPackOdata: function () {
      //   var oDataModel = this.getOwnerComponent().getModel();

      //   oDataModel.read("/ZC_PKG_UNIT", {
      //     success: function (oresponse) {
      //       sap.ui.core.BusyIndicator.hide();
      //       this._oPkgModel.setData(oresponse.results);
      //       console.log("Pack Type data loaded successfully");
      //       console.log("Pack Type Data:", oresponse.results);
      //     }.bind(this),
      //     error: function (oerror) {
      //       console.log("Pack Type data not loaded", oerror);
      //     }.bind(this),
      //   });

      //   oDataModel.read("/ZC_PARTNER_LOC", {
      //     success: function (oresponse) {
      //       sap.ui.core.BusyIndicator.hide();
      //       this._oPartnerModel.setData(oresponse.results);
      //       console.log("Patner Data:", oresponse.results);
      //     }.bind(this),
      //     error: function (oerror) {
      //       console.log("Patner data not loaded", oerror);
      //     }.bind(this),
      //   });
      // },

      onRefresh: function () {
        this.byId("smartTable").rebindTable();
      },

      openConfirmDialog: async function () {
        var aValidation = this._oPOTableModel.getProperty("/cValidData");

        if (!aValidation) {
          this.oCompleteDialog = await this.loadFragment({
            name: "com.iherb.tm.ztmvpsiherb.fragment.supplierConfirmBox",
          });
          this.oView.addDependent(this.oCompleteDialog);
          this.oCompleteDialog.open();
        }
      },

      onPressCancel: function () {
        this.oCompleteDialog.close();
        this.oCompleteDialog.destroy();
        this.oCompleteDialog = null;
      },

      onPressSave: function () {
        var that = this;
        this.onPressCancel();
        var i;
        let oUpdateModel = this.getView().getModel("POTableModel");
        let gettingInternalTable = this.byId("smartTable").getTable();
        let gettingAllRows = gettingInternalTable.getBinding().aKeys;
        let oSelIndices = gettingInternalTable.getSelectedIndices();

        for (i = 0; i < oSelIndices.length; i++) {
          var oFreightOrder = this.getView()
            .getModel()
            .getObject("/" + gettingAllRows[oSelIndices[i]]);
          var sFO = oFreightOrder.DbKey;

          var sPOPayload = {
            "DbKey": sFO,
            "TorId": oFreightOrder.TorId,
            "PkgQuaPcsVal": oFreightOrder.PkgQuaPcsVal,
            "PkgPcsVal": oFreightOrder.PkgPcsVal,
            "PkgUni": oFreightOrder.PkgUni,
            "PkgLength": oFreightOrder.PkgLength,
            "PkgWidth": oFreightOrder.PkgWidth,
            "PkgHeight": oFreightOrder.PkgHeight,
            "PkgMeasuom": oFreightOrder.PkgMeasuom,
            "PkgWeiVal": oFreightOrder.PkgWeiVal,
            "GroWeiUni": oFreightOrder.GroWeiUni,
            "PkgId": oFreightOrder.PkgId,
            "PkgPickupDt": oFreightOrder.PkgPickupDt
          };
          var path = "/ZC_FuItemList(guid'" + sFO + "')";
          this.getView().getModel().update(path, sPOPayload, {
            success: function (oData, response) {
              MessageToast.show(
                "Freight Unit " +
                oFreightOrder.TorId +
                " Updated successfully"
              );
              oUpdateModel.refresh(true);
            },
            error: function (oError) {
              MessageToast.show(
                "Error " +
                oFreightOrder.TorId +
                " Update request failed"
              );
            },
          });
        }
      },

      onSubmitPress: function () {
        var i;
        var that = this;
        var cValidErr = false;
        this._oPOTableModel.setProperty("/cValidData", cValidErr);

        let oUpdateModel = this.getView().getModel("POTableModel");
        let gettingInternalTable = this.byId("smartTable").getTable();
        console.log("Smart Table:", gettingInternalTable); // Debugging
        console.log("Model Data:", oUpdateModel.getData()); // Debugging

        var gettingAllRows = gettingInternalTable.getBinding().aKeys;
        var oSelIndices = gettingInternalTable.getSelectedIndices();
        if (oSelIndices.length === 0) {
          MessageBox.error("Please Select the Rows");
        } else {
          for (i = 0; i < oSelIndices.length; i++) {
            var aFreightOrder = this.getView()
              .getModel()
              .getObject("/" + gettingAllRows[oSelIndices[i]]);

            // Check if FreightUnitEditFlag exists; if not, set it manually
            if (!aFreightOrder.hasOwnProperty("FreightUnitEditFlag")) {
              aFreightOrder.FreightUnitEditFlag = true; // Default value
            }

            if (aFreightOrder.FreightUnitEditFlag === false) {
              console.log("Freight Order Data:", aFreightOrder); // Debugging
              console.log("FreightUnitEditFlag:", aFreightOrder.FreightUnitEditFlag);

              return;
            }
            this._ValidationMandatoryFields(aFreightOrder, cValidErr);
          }
          this.openConfirmDialog();
        }
      },

      _ValidationMandatoryFields: function (aFreightOrder, cValidErr) {
        if (aFreightOrder.PkgQuaPcsVal === "") {
          MessageToast.show("Please Enter Package Info");
          cValidData = true;
          this._oPOTableModel.setProperty("/cValidData", cValidData);
          return;
        }
      },

      onPackItmPress: function () {
        let oUpdateModel = this.getView().getModel("POTableModel");

        let gettingInternalTable = this.byId("smartTable").getTable();
        let gettingAllRows = gettingInternalTable.getBinding().aKeys;
        let oSelIndices = gettingInternalTable.getSelectedIndices();
        let aFreightOrder = this.getView().getModel().getObject("/" + gettingAllRows[oSelIndices[0]]);

        if (!this.oDialogPackItem) {
          this.oDialogPackItem = sap.ui.xmlfragment(
            "com.iherb.tm.ztmvpsiherb.fragment.packItem",
            this
          );
          let oPath = "/ZC_FuItemList(" + "guid" + "'" + aFreightOrder.DbKey + "')";
          this._setNewLoadData(oPath, aFreightOrder);
          this.getView().addDependent(this.oDialogPackItem);
        }
        this.oDialogPackItem.open();
      },

      _setNewLoadData: function (oPath, aFreightOrder) {
        let oPackageType = sap.ui.getCore().byId("inputPackType");
        let oPackageTypeTemplate = new sap.ui.core.ListItem({ key: "{PkgModel>PkgUni}", text: "{PkgModel>PkgUni}" });
        oPackageType.bindItems({
          path: "/ZC_FuItemList",
          template: oPackageTypeTemplate
        })
      },

      onPressCancelPack: function () {
        this.oDialogPackItem.close();
        this.oDialogPackItem.destroy();
      }

      // ******************END
    });
  }
);
