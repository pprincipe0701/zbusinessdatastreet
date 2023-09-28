sap.ui.define([
    "sap/ui/core/mvc/Controller"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller) {
        "use strict";

        return Controller.extend("nebula.com.ztablerocontrol.controller.Main", {
            onInit: function () {
                this.poblarCombos();

            },
            onSearch: function(evt){

                alert("Hola");
            },
            onFilterChange: function (evt){
                alert ("Hola soy change");
            },
            poblarCombos: function () {
                var oView = this.getView();
                var oJsonModel = new sap.ui.model.json.JSONModel();
                var objAux = {};
                objAux.listaDistrito = [];
                objAux.listaZona = []; //depende de distrito
                objAux.listaUsuario=[];
                
                var resultAll = [];
                var url_data = './backend_mov/service/zadmin/MasterData'
       
                var aData = jQuery
                  .ajax({
                    method: "GET",
                    cache: false,
                    headers: {
                      "X-CSRF-Token": "Fetch",
                    },
                    async: false,
                    url: url_data, //'/xshana/zcritical_equip_list/parametro.xsodata/planta?$format=json'
                  })
                  .then(
                    function successCallback(result, xhr, data) {
                      resultAll = result.value;
                    },
                    function errorCallback(xhr, readyState) {
                      jQuery.sap.log.debug(xhr);
                    }
                  );
                //Generar modelos
                //
        
                resultAll.forEach((item, index) => {
                  //console.log('Index: ' + index + ' Value: ' + item);
                  if (item.groupMaster === "MasterDistritos")
                    objAux.listaDistrito.push(item);
  
                });
                oJsonModel.setData(objAux);
                oView.setModel(oJsonModel, "modelParam");
              }
        });
    });
