sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/library",
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/m/library",
    "sap/m/Text"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, coreLibrary,
        Dialog,
        Button,
        mobileLibrary,
        Text) {
        "use strict";

        return Controller.extend("nebula.com.zticket.controller.Main", {
            onInit: function () {
                this.getCurrentPositionGlobal();
            },
            getCurrentPositionGlobal: async function () {     //ppo  
                const position = await this.obtenerCoordenadasActuales();         
                this.latitudeG = "" + position.coords.latitude;
                this.longitudeG = "" + position.coords.longitude;
                
              },
              obtenerCoordenadasActuales: function () {//ppo
                return new Promise(function (resolve, reject) {
                  navigator.geolocation.getCurrentPosition(resolve, reject);
                });
              },
            generateTicket: function(evt) {
                var that = this;
                //this.getCurrentPositionGlobal();
                //inicio--------------
                if(navigator.geolocation)  {

                    navigator.geolocation.getCurrentPosition((position) => {
                      //setStatus(null)
                      //setLatitude(position.coords.latitude);
                      //setLongitude(position.coords.longitude);
                      that.latitudeG = position.coords.latitude;
                      that.longitudeG = position.coords.longitude
                      //==========================================================================
                      that.guardarTicket();
                      
                    },
                    () => {
                      MessageBox.error('Unable to retrieve your location');
                    });
                  } else {
                    MessageBox.error('Geolocation is not supproted by your broswer');
                  }
                //fin------------------

                /*let today = new Date(new Date().toUTCString());
                
                console.info(today.toString());
                let fechaRegistro = today.toISOString().slice(0, 10);
                let horaRegistro = today.getHours() + ":" + today.getMinutes();

                var objAux = {};
                
                var email = "karolvalverdesalas@gmail.com";
                objAux.codigoTicket = this.getTicket();
                objAux.latitud = this.latitudeG;
                objAux.longitud = this.longitudeG;
                objAux.status = '1';
                objAux.masterUsuario_ID = this.getCurrentUser(email);
                objAux.fechaRegistro = fechaRegistro;
                objAux.horaRegistro = horaRegistro;

                var jsonObject = JSON.stringify(objAux);
                var url_data = "./backend_mov/service/zbusiness/MasterTicket";

                var aData2 = jQuery.ajax({
                    type: "POST",
                    cache: false,
                    contentType: "application/json",
                    url: url_data,
                    dataType: "json",
                    async: false,
                    data: jsonObject,
                    success: function (data, textStatus, jqXHR) {
                        MessageBox.success("Se generó el ticket : " + objAux.codigoTicket + " para las coordenadas: " + that.latitudeG + "," + that.longitudeG)
                    },
                    error: function (xhr, readyState) {
                        MessageBox.error("Error al generar Ticket : " + xhr);
                    }
                });*/


            },
            guardarTicket: function(){
                let today = new Date(new Date().toUTCString());
                var that = this;
                console.info(today.toString());
                let fechaRegistro = today.toISOString().slice(0, 10);
                let horaRegistro = today.getHours() + ":" + today.getMinutes();

                var objAux = {};
                //var email = sap.ushell.Container.getService("UserInfo").getUser().getEmail();
                var email = "karolvalverdesalas@gmail.com";
                objAux.codigoTicket = this.getTicket();
                objAux.latitud = this.latitudeG + "";
                objAux.longitud = this.longitudeG + "";
                objAux.status = '1';
                objAux.masterUsuario_ID = this.getCurrentUser(email);
                objAux.fechaRegistro = fechaRegistro;
                objAux.horaRegistro = horaRegistro;

                var jsonObject = JSON.stringify(objAux);
                var url_data = "./backend_mov/service/zbusiness/MasterTicket";

                var aData2 = jQuery.ajax({
                    type: "POST",
                    cache: false,
                    contentType: "application/json",
                    url: url_data,
                    dataType: "json",
                    async: false,
                    data: jsonObject,
                    success: function (data, textStatus, jqXHR) {
                        MessageBox.success("Se generó el ticket : " + objAux.codigoTicket + " para las coordenadas: " + that.latitudeG + "," + that.longitudeG)
                    },
                    error: function (xhr, readyState) {
                        MessageBox.error("Error al generar Ticket : " + xhr);
                    }
                });
            },
            getTicket: function() {
                var letters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
                var randomLetter = Math.floor(Math.random() * letters.length);
                var numbers = Math.floor(Math.random() * 100000);
                return letters[randomLetter].toUpperCase() + numbers;
            },
            getCurrentUser: function(email){
                var url_data = "./backend_mov/service/zadmin/MasterUsuarios?$filter=usuarioBtp eq '" + email + "' and status eq '1'";
                var idUsuario = 0;
                var aData = jQuery.ajax({
                    method: 'GET',
                    cache: false,
                    headers: {
                        "X-CSRF-Token": "Fetch"
                    },
                    async: false,
                    url: url_data //'/xshana/zcritical_equip_list/parametro.xsodata/planta?$format=json'

                }).then(function successCallback(result, xhr, data) {
                    //resultAll = result.value;
                    idUsuario = result.value[0].ID;

                }, function errorCallback(xhr, readyState) {
                    console.log(xhr);
                });
                return idUsuario;
            }
        });
    });
