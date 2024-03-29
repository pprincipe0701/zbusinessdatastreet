sap.ui.define(
  [
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
  function (
    Controller,
    MessageBox,
    coreLibrary,
    Dialog,
    Button,
    mobileLibrary,
    Text
  ) {
    "use strict";
    // shortcut for sap.m.ButtonType
    var ButtonType = mobileLibrary.ButtonType;

    // shortcut for sap.m.DialogType
    var DialogType = mobileLibrary.DialogType;

    // shortcut for sap.ui.core.ValueState
    var ValueState = coreLibrary.ValueState;

    var idEstablecimiento

    let listaEstablecimiento = [];
    return Controller.extend("nebula.com.zformulario.controller.Main", {
      onInit: function () {
        //MessageBox.warning('Cuidado que te roben el móvil, llena con precaucixyz_z2');
        this.poblarCombos();
        this.generarModelo();
        //this.getPointCoordinates();
        this.currentPosition = "";
        this.getCurrentPositionInitial();


      },
      obtenerCoordenadasActuales: function () {
        //ppo
        return new Promise(function (resolve, reject) {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
      },
      onChangeLocationCurrent: async function (evt) {
        //ppo
        var oView = this.getView();
        var model = oView.getModel();
        var data = model.getData();

        var chekTicket = evt.getParameter("selected");
        this.chekBoxSeleccionado = chekTicket;//*** */

        oView.byId("id_txt_ticket").setVisible(true);
        oView.byId("id_btn_ver_ticket").setVisible(true);
        oView.byId("idLblDate").setVisible(true);
        oView.byId("idDatePiker").setVisible(true);
        oView.byId("idTxtHora").setVisible(true);

        if (this.getView().byId("id_cbx_location_current").getSelected()) {
          oView.byId("id_txt_ticket").setVisible(false);
          oView.byId("id_btn_ver_ticket").setVisible(false);
          oView.byId("idLblDate").setVisible(false);
          oView.byId("idDatePiker").setVisible(false);
          oView.byId("idTxtHora").setVisible(false);
          data.codigoTicket = "";
          //this.getCurrentPositionGlobal();
          //this.changePositionLocation(this.latitudeG, this.longitudeG);
          model.refresh(true);
          this.getCurrentPositionInitial();
        } else {
          this.currentPosition = "";
          /*var ticket = this.getdataTicket(data.codigoTicket);
            this.changePositionLocation(ticket.latitud, ticket.longitud);
            this.verTicket(ticket.codigoTicket);*/
          //this.changePositionLocation("-12.0460038", "-77.0305458");  
        }
      },
      verTicket: function (evt) {
        var that = this;
        var oView = this.getView();
        var model = oView.getModel();
        var data = model.getData();
        /*if (this.isEmpty(data.codigoTicket)) {
          MessageBox.error("Debe Ingresar un Ticket");
          return false;
        }
        var ticket = this.getdataTicket(data.codigoTicket);
        if (ticket === null) {
          MessageBox.error("El Ticket no Existe");
          return false;
        }*/
        var msgValidarTicket = this.validarTicket();
        if (!this.isEmpty(msgValidarTicket)) {
          MessageBox.error(msgValidarTicket);
          return false;
        }
        //this.changePositionLocation(ticket.latitud, ticket.longitud);
        //this.verTicket(ticket.codigoTicket);

        if (!this.oSuccessMessageDialog) {
          this.oSuccessMessageDialog = new Dialog({
            type: DialogType.Message,
            title: "Success",
            state: ValueState.Success,
            content: new Text({
              text:
                "Ticket : " +
                data.codigoTicket +
                " Coordenadas: " +
                this.latitudeG +
                "," +
                this.longitudeG,
            }),
            beginButton: new Button({
              type: ButtonType.Emphasized,
              text: "OK",
              press: function () {
                that.oSuccessMessageDialog.close();
                oView
                  .byId("_IDGenObjectPageLayout1")
                  .setSelectedSection("mapSection");
              }.bind(this),
            }),
          });
        }

        this.oSuccessMessageDialog.open();
      },
      validarTicket: function () {
        var msgValidacion = '';
        var oView = this.getView();
        var model = oView.getModel();
        var data = model.getData();

        if (this.isEmpty(data.codigoTicket)) {
          msgValidacion = "Debe Ingresar un Ticket";
          return msgValidacion;

        }
        var ticket = this.getdataTicket(data.codigoTicket);
        if (ticket === null || ticket === undefined) {

          msgValidacion = "El Ticket no Existe";
          return msgValidacion;
        } else {
          this.changePositionLocation(ticket.latitud, ticket.longitud);
        }

        //validar si el ticket fue usado
        var url_data =
          "./backend_mov/service/zbusiness/MovimientosDiarios?$filter=codigoTicket eq '" +
          data.codigoTicket +
          "'";

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
              //resultAll = result.value;
              if (
                result !== null &&
                result.value !== null &&
                result.value.length > 0
              )
                msgValidacion = 'Ya el Ticket fue Usado en otro Registro';
            },
            function errorCallback(xhr, readyState) {
              msgValidacion = "Error:: " + xhr;
              console.log(xhr);
            }
          );
        return msgValidacion;

      },
      getCurrentPositionGlobal: async function () {
        //ppo
        const position = await this.obtenerCoordenadasActuales();
        this.latitudeG = "" + position.coords.latitude;
        this.longitudeG = "" + position.coords.longitude;
      },
      changePositionLocation: function (latx, longx) {
        this.latitudeG = "" + latx;
        this.longitudeG = "" + longx;

        var oGeoMap = this.getView().byId("vbi");
        this.currentPosition = latx + "," + longx;
        var currentPoint = longx + ";" + latx + ";" + "0";
        oGeoMap.setInitialZoom(18);
        oGeoMap.setInitialPosition(currentPoint);
        oGeoMap.setCenterPosition(longx + ";" + latx);

        oGeoMap.destroyVos();
        var points = new sap.ui.vbm.Spots({
          items: [new sap.ui.vbm.Spot({ position: currentPoint, type: "Error", text: "X" })]
        });
        oGeoMap.addVo(points);
      },

      getCurrentPositionInitial: async function () {
        //ppo
        //this.getCurrentPositionGlobal();
        //var latitude = this.latitudeG;
        //var longitude = this.longitudeG;
        var that = this;
        var oGeoMap = this.getView().byId("vbi");
        var oMapConfig = {
          MapProvider: [
            {
              name: "GMAP",
              Source: [
                {
                  id: "s1",
                  url: "https://mt.google.com/vt/lyrs=m&x={X}&y={Y}&z={LOD}",
                },
              ],
            },
          ],
          MapLayerStacks: [
            {
              name: "DEFAULT",
              MapLayer: {
                name: "layer1",
                refMapProvider: "GMAP",
                opacity: "1",
                colBkgnd: "RGB(255,255,255)",
              },
            },
          ],
        };

        var latitude = '';
        var longitude = '';

        //var currentPoint = longitude + ";" + latitude + ";" + "0";
        oGeoMap.setMapConfiguration(oMapConfig);
        oGeoMap.setRefMapLayerStack("DEFAULT");
        oGeoMap.setInitialZoom(18);
        //Inicio - geomap
        if (navigator.geolocation) {

          navigator.geolocation.getCurrentPosition((position) => {
            //setStatus(null)
            //setLatitude(position.coords.latitude);
            //setLongitude(position.coords.longitude);
            latitude = position.coords.latitude;
            longitude = position.coords.longitude
            var currentPoint = longitude + ";" + latitude + ";" + "0";
            that.currentPosition = latitude + "," + longitude;
            oGeoMap.setInitialPosition(currentPoint);
            oGeoMap.setCenterPosition(longitude + ";" + latitude);

            oGeoMap.destroyVos();
            var points = new sap.ui.vbm.Spots({
              items: [new sap.ui.vbm.Spot({ position: currentPoint, type: "Error", text: "X" })]
            });
            oGeoMap.addVo(points);
          },
            () => {
              MessageBox.error('Unable to retrieve your location');
            });
        } else {
          MessageBox.error('Geolocation is not supproted by your broswer');
        }
        //Fin - geomap

      },

      onReview: function () {
        var self = this;
        var oView = self.getView();
        var oJsonModel = new sap.ui.model.json.JSONModel();

        var data = oView.getModel().getData();
        var dataParam = oView.getModel("modelParam").getData();
        var dataTemporada = oView.getModel("modelParam2").getData();
        var dataZona = oView.getModel("modelParam3").getData();

        var idDistrito = parseInt(data.idDistrito);
        var idMasterZona = parseInt(data.idMasterZona);
        var idRubro = parseInt(data.idRubro);
        var idAfluencia = parseInt(data.idAfluencia);
        var idEstacion = parseInt(data.idEstacion);
        var idTipoPublico = parseInt(data.idTipoPublico);
        var idNivelCompetencia = parseInt(data.idNivelCompetencia);
        var idEstacionTemporada = parseInt(data.idEstacionTemporada);

        const distrito = dataParam.listaDistrito.filter(
          (x) => x.ID === idDistrito
        );
        const zona = dataZona.listaZona.filter((x) => x.ID === idMasterZona);
        const rubro = dataParam.listaRubro.filter((x) => x.ID === idRubro);
        const afluencia = dataParam.listaAfluencia.filter(
          (x) => x.ID === idAfluencia
        );
        const estacion = dataParam.listaEstacion.filter(
          (x) => x.ID === idEstacion
        );
        const tipoPublico = dataParam.listaTipoPublico.filter(
          (x) => x.ID === idTipoPublico
        );
        const nivelCompetencia = dataParam.listaNivelCompetencia.filter(
          (x) => x.ID === idNivelCompetencia
        );
        const estacionTemporada = dataTemporada.listaTemporada.filter(
          (x) => x.ID === idEstacionTemporada
        );

        //Modelo
        var objAux = {};
        objAux.direccion =
          distrito[0].description +
          " - " +
          zona[0].description +
          " - " +
          data.direccion;
        objAux.razonSocial = data.razonSocial;
        objAux.horarioAtencion =
          data.horarioApertura + " - " + data.horarioCierre;
        objAux.rubro = rubro[0].description;
        if (data.visibleTextoRubro)
          objAux.rubro = objAux.rubro + " - " + data.otroRubro;
        objAux.afluencia =
          afluencia[0].description + " - " + tipoPublico[0].description;
        objAux.temporada =
          estacion[0].description +
          " - " +
          estacionTemporada[0].descripcionTemporada;
        objAux.nivelCompetencia = nivelCompetencia[0].description;

        oJsonModel.setData(objAux);
        oView.setModel(oJsonModel, "modelView");

        var oDialogReview = oView.byId("idDialogReview");
        if (!oDialogReview) {
          oDialogReview = sap.ui.xmlfragment(
            oView.getId(),
            "nebula.com.zformulario.fragmentViews.Review",
            this
          );
        }

        oView.addDependent(oDialogReview);
        jQuery.sap.syncStyleClass(
          "sapUiSizeCompact",
          this.getView(),
          oDialogReview
        );
        oDialogReview.open();
      },
      onCloseReview: function (evt) {
        var oView = this.getView();
        var oDialog = oView.byId("idDialogReview");
        if (oDialog) {
          oDialog.destroy();
        }
      },

      generarModelo: function () {
        var oView = this.getView();
        var oJsonModel = new sap.ui.model.json.JSONModel();
        var objAux = {};
        objAux.visibleTextoRubro = false;
        objAux.flagFinanciera = false;
        objAux.flagCentroEducativo = false;
        objAux.flagCentroSalud = false;
        objAux.flagIglesia = false;
        objAux.flagAlquiler = false;

        oJsonModel.setData(objAux);
        oView.setModel(oJsonModel);
        //oView.getModel.refresh(true);
      },
      onSearchEmpresa: function (evt) {
        //Proceso de Carga de tabla en popup
        var oView = this.getView();
        //var tabla = oView.byId("tablaSeach");       						
        var oJsonModelEstablecimiento = new sap.ui.model.json.JSONModel();
        
        //llAMAR AL SERVICIO QUE LISTA LOS ESTABLECIMIENTOS
        var url_data = "./backend_mov/service/zbusiness/EstablecimientoView";
        /* var url_data =
           "/c691e839-9871-42b8-b6c7-11a6a397783d.zbusinessdatastreet.nebulacomzformulario-0.0.1/backend_mov/service/zadmin/MasterEstacionesTemporadas?$filter=idEstacion eq " +
           idEstacion;*/

        //alert('Hola');
        var aData = jQuery
          .ajax({
            method: "GET",
            cache: false,
            headers: {
              "X-CSRF-Token": "Fetch",
            },
            async: false,
            url: url_data,
          })
          .then(
            function successCallback(result, xhr, data) {
              listaEstablecimiento = result.value;
            },
            function errorCallback(xhr, readyState) {
              jQuery.sap.log.debug(xhr);
            }
          );
        let obj = { listaEstablecimiento: listaEstablecimiento };
        oJsonModelEstablecimiento.setData(obj);
        //tabla.setModel(oJsonModelEstablecimiento);
        oView.setModel(oJsonModelEstablecimiento, "modelEstablecimiento");
        var oDialogReview = oView.byId("idDialogSeachRazon");
        if (!oDialogReview) {
          oDialogReview = sap.ui.xmlfragment(oView.getId(), "nebula.com.zformulario.fragmentViews.SeachRazon", this);
        }

        oView.addDependent(oDialogReview);
        jQuery.sap.syncStyleClass(
          "sapUiSizeCompact",
          this.getView(),
          oDialogReview
        );
        oDialogReview.open();
      },
      onFiltrarEmpresa: function (evt) {
        var oView = this.getView();
        //var modelo = oView.getModel("modelEstablecimiento").getData();
        var sValue = oView.byId("IdSearchField").getValue();
        var oJsonModelEstablecimiento = new sap.ui.model.json.JSONModel();

        if (sValue){
          const filtro = listaEstablecimiento.filter(
            (x) => x.razonSocial.includes(sValue.toLowerCase()) || x.razonSocial.includes(sValue.toUpperCase()))
            
            
            let obj = { listaEstablecimiento: filtro };
  
            oJsonModelEstablecimiento.setData(obj);
            //tabla.setModel(oJsonModelEstablecimiento);
            oView.setModel(oJsonModelEstablecimiento, "modelEstablecimiento");


        } else{
          
          let obj = { listaEstablecimiento: listaEstablecimiento };
          oJsonModelEstablecimiento.setData(obj);
            //tabla.setModel(oJsonModelEstablecimiento);
            oView.setModel(oJsonModelEstablecimiento, "modelEstablecimiento");
        }
        
      },

      onEmpresaSeleccionada: function (evt) {
        var oView = this.getView();
        var razonSocial = evt.getParameter("listItem").getBindingContext('modelEstablecimiento').getProperty('razonSocial');
        idEstablecimiento = evt.getParameter("listItem").getBindingContext('modelEstablecimiento').getProperty('idEstablecimiento');
        var idDistrito = evt.getParameter("listItem").getBindingContext('modelEstablecimiento').getProperty('idDistrito');
        var id_zona = evt.getParameter("listItem").getBindingContext('modelEstablecimiento').getProperty('idMasterZona');
        var id_direccion = evt.getParameter("listItem").getBindingContext('modelEstablecimiento').getProperty('direccion');
        var idRubro = evt.getParameter("listItem").getBindingContext('modelEstablecimiento').getProperty('idRubro');
        var horaInicio = evt.getParameter("listItem").getBindingContext('modelEstablecimiento').getProperty('horarioApertura');
        var horaFinal = evt.getParameter("listItem").getBindingContext('modelEstablecimiento').getProperty('horarioCierre');
        //oView.byId('id_razon_social').setSelectedKey(idrazonSocial);
        oView.byId('id_razon_social').setValue(razonSocial);
        oView.byId('id_distrito').setSelectedKey(idDistrito);
        this.selectDistrito();
        oView.byId('id_zona').setSelectedKey(id_zona);
        oView.byId('id_direccion').setValue(id_direccion);
        oView.byId('id_rubro').setSelectedKey(idRubro);
        oView.byId('id_horario_apertura').setValue(horaInicio);
        oView.byId('id_horario_cierre').setValue(horaFinal);
        this.onCloseSearchEmpresa();


      },
      onCloseSearchEmpresa: function (evt) {
        var oView = this.getView();
        var oDialog = oView.byId("idDialogSeachRazon");
        if (oDialog) {
          oDialog.close();
        }
      },
      onLiveChange: function (oEvent) { //Direccion
        var input = oEvent.getSource();

        //input.setValue(input.getValue().toUpperCase());
        var sValue = input.getValue();
        idEstablecimiento = null
        sValue = sValue.replace(/[^0-9]/g, '');
        input.setValue(sValue);


      },
      onLiveChangeRazon: function (oEvent) {
        var input = oEvent.getSource();
        idEstablecimiento = null
        input.setValue(input.getValue().toUpperCase());

      },
      selectRubro: function (evt) {
        var oView = this.getView();
        var model = oView.getModel();
        var data = model.getData();
        var idRubro = data.idRubro;
        if (idRubro === "31") data.visibleTextoRubro = true;
        else data.visibleTextoRubro = false;
        model.refresh(true);
      },
      selectDistrito: function (evt) {
        var oView = this.getView();
        var oJsonModel = new sap.ui.model.json.JSONModel();
        var objAux = {};
        objAux.listaZona = [];
        //oJsonModel.setData(objAux);

        oView.byId("id_zona").setSelectedKey(null);

        var resultAll = [];
        var idDistrito = oView.byId("id_distrito").getSelectedKey();

        /* var url_data =
           "/c691e839-9871-42b8-b6c7-11a6a397783d.zbusinessdatastreet.nebulacomzformulario-0.0.1/backend_mov/service/zadmin/MasterZonas?$filter=masterDistrito_ID eq " +
           idDistrito +
           " and status eq '1'";*/
        var url_data = "./backend_mov/service/zadmin/MasterZonas?$filter=masterDistrito_ID eq " + idDistrito + " and status eq '1'";

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
          objAux.listaZona.push(item);
        });
        oJsonModel.setData(objAux);
        oView.setModel(oJsonModel, "modelParam3");

      },

      onValidar: function (evt) {
        var self = this;
        var oView = this.getView();
        var model = oView.getModel();
        var data = model.getData();
        //Validar Ticket
        if (!this.chekBoxSeleccionado) {
          if (!this.isEmpty(data.codigoTicket)) {
            var msgValidarTicket = this.validarTicket();
            if (!this.isEmpty(msgValidarTicket)) {
              MessageBox.error(msgValidarTicket);
              return false;
            } else {
              var aMockMessages = [];
              var flagRequired = true;
              var flagDiffHora = true;

              var fieldsKey = [
                "id_distrito",
                "id_zona",
                "id_rubro",
                "id_afluencia",
                "id_tipo_publico",
                "id_estacion",
                "id_estacion_temporada",
                "id_nivel_competencia",
              ];
              var fieldsRequire = [
                "id_razon_social",
                "id_direccion",
                "id_horario_apertura",
                "id_horario_cierre",
                "id_distrito",
                "id_zona",
                "id_rubro",
                "id_afluencia",
                "id_tipo_publico",
                "id_estacion",
                "id_estacion_temporada",
                "id_nivel_competencia",
              ];

              var myMapDesc = {
                id_razon_social: "Razón Social",
                id_direccion: "Dirección",
                id_horario_apertura: "Hora Apertura",
                id_horario_cierre: "Hora Cierre",
                id_distrito: "Distrito",
                id_zona: "Zona",
                id_rubro: "Rubro",
                id_afluencia: "Afluencia",
                id_tipo_publico: "Tipo Publico",
                id_estacion: "Estación",
                id_estacion_temporada: "Temporada",
                id_nivel_competencia: "Nivel Competencia",
              };

              for (var i = 0; i < fieldsRequire.length; i++) {
                var field = null;
                if (fieldsKey.indexOf(fieldsRequire[i]) >= 0) {
                  field = oView.byId(fieldsRequire[i]).getSelectedKey();
                } else {
                  field = oView.byId(fieldsRequire[i]).getValue();
                }
                if (self.isEmpty(field)) {
                  aMockMessages.push({
                    type: "Error",
                    title: myMapDesc[fieldsRequire[i]],
                    description: "Debes agregar un valor",
                    subtitle: "El campo no debe estar vacío",
                  });
                  oView
                    .byId(fieldsRequire[i])
                    .setValueState(sap.ui.core.ValueState.Error);
                  oView
                    .byId(fieldsRequire[i])
                    .setValueStateText("El campo no debe estar vacío");
                  flagRequired = false;
                } else {
                  oView
                    .byId(fieldsRequire[i])
                    .setValueState(sap.ui.core.ValueState.None);
                }
              }
              //
              if (!flagRequired) {
                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData(aMockMessages);

                var oMessageTemplate = new sap.m.MessagePopoverItem({
                  type: "{type}",
                  title: "{title}",
                  description: "{description}",
                  subtitle: "{subtitle}",
                });
                //if(!self._messagePopover){
                self._messagePopover = new sap.m.MessagePopover({
                  items: {
                    path: "/",
                    template: oMessageTemplate,
                  },
                });
                //}
                self._messagePopover.setModel(oModel);
                self._messagePopover.toggle(evt.getSource());
              } else {
                if (self._messagePopover != null) {
                  self._messagePopover.destroy();
                }
                //MessageBox.success("ok validate");
              }
              if (flagRequired) {
                //Validar Horas dentrada y Fin
                var horaApertura = oView
                  .byId("id_horario_apertura")
                  .getValue()
                  .substring(0, 2);
                var horaCierre = oView
                  .byId("id_horario_cierre")
                  .getValue()
                  .substring(0, 2);
                horaApertura = parseInt(horaApertura);
                horaCierre = parseInt(horaCierre);
                if (horaApertura > horaCierre) flagDiffHora = false;
              }
              if (!flagDiffHora) {
                MessageBox.error(
                  "La hora de apertura no puede ser mayor al de cierre"
                );
              }
              if (flagRequired && flagDiffHora) {
                //this.onSave();
                this.onReview();
              }

            }

          } else {
            MessageBox.error("Debe ingresar ticket por favor.");
            oView
              .byId("id_txt_ticket")
              .setValueState(sap.ui.core.ValueState.Error);
          }
        } else {//** */
          var aMockMessages = [];
          var flagRequired = true;
          var flagDiffHora = true;

          var fieldsKey = [
            "id_distrito",
            "id_zona",
            "id_rubro",
            "id_afluencia",
            "id_tipo_publico",
            "id_estacion",
            "id_estacion_temporada",
            "id_nivel_competencia",
          ];
          var fieldsRequire = [
            "id_razon_social",
            "id_direccion",
            "id_horario_apertura",
            "id_horario_cierre",
            "id_distrito",
            "id_zona",
            "id_rubro",
            "id_afluencia",
            "id_tipo_publico",
            "id_estacion",
            "id_estacion_temporada",
            "id_nivel_competencia",
          ];

          var myMapDesc = {
            id_razon_social: "Razón Social",
            id_direccion: "Dirección",
            id_horario_apertura: "Hora Apertura",
            id_horario_cierre: "Hora Cierre",
            id_distrito: "Distrito",
            id_zona: "Zona",
            id_rubro: "Rubro",
            id_afluencia: "Afluencia",
            id_tipo_publico: "Tipo Publico",
            id_estacion: "Estación",
            id_estacion_temporada: "Temporada",
            id_nivel_competencia: "Nivel Competencia",
          };

          for (var i = 0; i < fieldsRequire.length; i++) {
            var field = null;
            if (fieldsKey.indexOf(fieldsRequire[i]) >= 0) {
              field = oView.byId(fieldsRequire[i]).getSelectedKey();
            } else {
              field = oView.byId(fieldsRequire[i]).getValue();
            }
            if (self.isEmpty(field)) {
              aMockMessages.push({
                type: "Error",
                title: myMapDesc[fieldsRequire[i]],
                description: "Debes agregar un valor",
                subtitle: "El campo no debe estar vacío",
              });
              oView
                .byId(fieldsRequire[i])
                .setValueState(sap.ui.core.ValueState.Error);
              oView
                .byId(fieldsRequire[i])
                .setValueStateText("El campo no debe estar vacío");
              flagRequired = false;
            } else {
              oView
                .byId(fieldsRequire[i])
                .setValueState(sap.ui.core.ValueState.None);
            }
          }
          //
          if (!flagRequired) {
            var oModel = new sap.ui.model.json.JSONModel();
            oModel.setData(aMockMessages);

            var oMessageTemplate = new sap.m.MessagePopoverItem({
              type: "{type}",
              title: "{title}",
              description: "{description}",
              subtitle: "{subtitle}",
            });
            //if(!self._messagePopover){
            self._messagePopover = new sap.m.MessagePopover({
              items: {
                path: "/",
                template: oMessageTemplate,
              },
            });
            //}
            self._messagePopover.setModel(oModel);
            self._messagePopover.toggle(evt.getSource());
          } else {
            if (self._messagePopover != null) {
              self._messagePopover.destroy();
            }
            //MessageBox.success("ok validate");
          }
          if (flagRequired) {
            //Validar Horas dentrada y Fin
            var horaApertura = oView
              .byId("id_horario_apertura")
              .getValue()
              .substring(0, 2);
            var horaCierre = oView
              .byId("id_horario_cierre")
              .getValue()
              .substring(0, 2);
            horaApertura = parseInt(horaApertura);
            horaCierre = parseInt(horaCierre);
            if (horaApertura > horaCierre) flagDiffHora = false;
          }
          if (!flagDiffHora) {
            MessageBox.error(
              "La hora de apertura no puede ser mayor al de cierre"
            );
          }
          if (flagRequired && flagDiffHora) {
            //this.onSave();
            this.onReview();
          }

        }

      },
      getdataTicket: function (codigoTicket) {
        var url_data =
          "./backend_mov/service/zbusiness/MasterTicket?$filter=codigoTicket eq '" +
          codigoTicket +
          "' and status eq '1'";
        var ticket = null;
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
              //resultAll = result.value;
              if (
                result !== null &&
                result.value !== null &&
                result.value.length > 0
              )
                ticket = result.value[0];
            },
            function errorCallback(xhr, readyState) {
              console.log(xhr);
            }
          );
        return ticket;
      },
      getCurrentUser: function (email) {
        var url_data =
          "./backend_mov/service/zadmin/MasterUsuarios?$filter=usuarioBtp eq '" +
          email +
          "' and status eq '1'";
        var idUsuario = 0;
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
              //resultAll = result.value;
              idUsuario = result.value[0].ID;
            },
            function errorCallback(xhr, readyState) {
              console.log(xhr);
            }
          );
        return idUsuario;
      },

      onSave: function (evt) {
        this.onCloseReview(evt);
        var self = this;
        //MessageBox.success('Pop up Review');
        var oGlobalBusyDialog = new sap.m.BusyDialog();
        oGlobalBusyDialog.open();

        var oView = this.getView();
        var model = oView.getModel();
        var data = model.getData();
        var usrResponsable = "DESCONOCIDO";
        var url_data = "./backend_mov/service/zbusiness/MovimientoDiarioCustom";
        /*var url_data =
          "/c691e839-9871-42b8-b6c7-11a6a397783d.zbusinessdatastreet.nebulacomzformulario-0.0.1/backend_mov/service/zbusiness/MovimientoDiarioCustom";*/

        /*var complete_url = window.location.href;
                var pieces = complete_url.split("?");
                if (!this.isEmpty(pieces[1])) {
                    var params = pieces[1].split("&");
                    $.each(params, function (key, value) {

                        var param_value = value.split("=");
                        console.log(key + ": " + value + " | " + param_value[1]);
                        if (param_value[0] === 'user')
                            usrResponsable = param_value[1];

                    });
                }*/

        var email = "karolvalverdesalas@gmail.com";
        var idUsuario = this.getCurrentUser(email);
        var objAux = {};
        /*Condicionar si check esta en true*/
        if (!this.chekBoxSeleccionado) {
          objAux.codigoTicket = data.codigoTicket;
        }
        /*if(el estableciento ya existe) {

          objAux.idEstablecimiento = 
        }*/
        objAux.idEstablecimiento = idEstablecimiento;
        objAux.razonSocial = data.razonSocial;
        objAux.direccion = data.direccion;
        objAux.horarioApertura = data.horarioApertura;
        objAux.horarioCierre = data.horarioCierre;
        objAux.otroRubro = data.visibleTextoRubro ? data.otroRubro : "";
        objAux.coordenada = this.currentPosition;
        objAux.idRubro = parseInt(data.idRubro);
        objAux.idDistrito = parseInt(data.idDistrito);
        objAux.idAfluencia = parseInt(data.idAfluencia);
        objAux.idTipoPublico = parseInt(data.idTipoPublico);
        objAux.idEstacionTemporada = parseInt(data.idEstacionTemporada);
        objAux.registrador = usrResponsable;
        objAux.idNivelCompetencia = parseInt(data.idNivelCompetencia);
        objAux.flagFinanciera = data.flagFinanciera ? "X" : "";
        objAux.obsFinanciera = !this.isEmpty(data.obsFinanciera) ? data.obsFinanciera : "";
        objAux.flagCentroEducativo = data.flagCentroEducativo ? "X" : "";
        objAux.obsCentroEducativo = !this.isEmpty(data.obsCentroEducativo)
          ? data.obsCentroEducativo
          : "";
        objAux.flagCentroSalud = data.flagCentroSalud ? "X" : "";
        objAux.obsCentroSalud = !this.isEmpty(data.obsCentroSalud)
          ? data.obsCentroSalud
          : "";
        objAux.flagIglesia = data.flagIglesia ? "X" : "";
        objAux.obsIglesia = !this.isEmpty(data.obsIglesia)
          ? data.obsIglesia
          : "";
        objAux.flagAlquiler = data.flagAlquiler ? "X" : "";
        objAux.obsAlquiler = !this.isEmpty(data.obsAlquiler)
          ? data.obsAlquiler
          : "";
        objAux.idMasterZona = parseInt(data.idMasterZona);
        objAux.status = "1";
        objAux.idUsuario = parseInt(idUsuario);
        objAux.observacionGeneral = !this.isEmpty(data.observacionGeneral)
          ? data.observacionGeneral
          : "";
        //var tt = '';
        //idEstablecimiento

        //oGlobalBusyDialog.close();

        var jsonObject = JSON.stringify(objAux);
        var aData2 = jQuery.ajax({
          type: "POST",
          cache: false,
          contentType: "application/json",
          url: url_data,
          dataType: "json",
          async: false,
          data: jsonObject,
          success: function (data, textStatus, jqXHR) {
            oGlobalBusyDialog.close();
            //MessageBox.success('Los datos fueron Grabados correctamente');
            //location.reload(true);
            self.mensajeCierre();
          },
          error: function (xhr, readyState) {
            oGlobalBusyDialog.close();
            MessageBox.error("no se pudo guardar los datos");
          },
        });
      },
      mensajeCierre: function () {
        var self = this;
        MessageBox.show("Los datos fueron Grabados correctamente", {
          icon: sap.m.MessageBox.Icon.SUCCESS,
          title: "",
          actions: ["OK"],
          onClose: function (sActionClicked) {
            if (sActionClicked === "OK") {
              self.generarModelo();
            }
          },
        });
      },
      onClear: function (evt) {
        this.generarModelo();
      },
      poblarComboTemporada: function (evt) {
        var oView = this.getView();
        var oJsonModel = new sap.ui.model.json.JSONModel();
        var objAux = {};
        objAux.listaTemporada = [];
        //oJsonModel.setData(objAux);

        oView.byId("id_estacion_temporada").setSelectedKey(null);

        var resultAll = [];
        var idEstacion = oView.byId("id_estacion").getSelectedKey();
        var url_data = "./backend_mov/service/zadmin/MasterEstacionesTemporadas?$filter=idEstacion eq " + idEstacion;
        /* var url_data =
           "/c691e839-9871-42b8-b6c7-11a6a397783d.zbusinessdatastreet.nebulacomzformulario-0.0.1/backend_mov/service/zadmin/MasterEstacionesTemporadas?$filter=idEstacion eq " +
           idEstacion;*/

        //alert('Hola');
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
          objAux.listaTemporada.push(item);
        });
        oJsonModel.setData(objAux);
        oView.setModel(oJsonModel, "modelParam2");
      },
      poblarCombos: function () {
        var oView = this.getView();
        var oJsonModel = new sap.ui.model.json.JSONModel();
        var objAux = {};
        objAux.listaDistrito = [];
        objAux.listaRubro = [];
        objAux.listaAfluencia = [];
        objAux.listaTipoPublico = [];
        objAux.listaEstacion = [];
        objAux.listaNivelCompetencia = [];
        var resultAll = [];
        var url_data = './backend_mov/service/zadmin/MasterData'
        /*var url_data =
          "/c691e839-9871-42b8-b6c7-11a6a397783d.zbusinessdatastreet.nebulacomzformulario-0.0.1/backend_mov/service/zadmin/MasterData";*/


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
          if (item.groupMaster === "MasterRubros") objAux.listaRubro.push(item);
          if (item.groupMaster === "MasterAfluencias")
            objAux.listaAfluencia.push(item);
          if (item.groupMaster === "MasterTipoPublicos")
            objAux.listaTipoPublico.push(item);
          if (item.groupMaster === "MasterEstaciones")
            objAux.listaEstacion.push(item);
          if (item.groupMaster === "MasterNivelCompetencias")
            objAux.listaNivelCompetencia.push(item);
        });
        oJsonModel.setData(objAux);
        oView.setModel(oJsonModel, "modelParam");
      },

      poblarDialogRazon: function () {
        var oView = this.getView();
        var oJsonModel = new sap.ui.model.json.JSONModel();
        var objAux = {};
        objAux.listaDistrito = [];
        objAux.listaRubro = [];
        objAux.listaAfluencia = [];
        objAux.listaTipoPublico = [];
        objAux.listaEstacion = [];
        objAux.listaNivelCompetencia = [];
        var resultAll = [];
        var url_data = './backend_mov/service/zadmin/MasterData'
        /*var url_data =
          "/c691e839-9871-42b8-b6c7-11a6a397783d.zbusinessdatastreet.nebulacomzformulario-0.0.1/backend_mov/service/zadmin/MasterData";*/


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
          if (item.groupMaster === "MasterRubros") objAux.listaRubro.push(item);
          if (item.groupMaster === "MasterAfluencias")
            objAux.listaAfluencia.push(item);
          if (item.groupMaster === "MasterTipoPublicos")
            objAux.listaTipoPublico.push(item);
          if (item.groupMaster === "MasterEstaciones")
            objAux.listaEstacion.push(item);
          if (item.groupMaster === "MasterNivelCompetencias")
            objAux.listaNivelCompetencia.push(item);
        });
        oJsonModel.setData(objAux);
        oView.setModel(oJsonModel, "modelParam");
      },
      isEmpty: function (inputStr) {
        var flag = false;
        if (inputStr === "") {
          flag = true;
        }
        if (inputStr === null) {
          flag = true;
        }
        if (inputStr === undefined) {
          flag = true;
        }
        if (inputStr == null) {
          flag = true;
        }

        return flag;
      },
      cambiaFecha: function (evt) {
        var oView = this.getView();
        let date = new Date()
        let day = date.getDate()

        var oDatePicker = this.getView().byId("idDatePiker");
        var fSelected = oDatePicker.getDateValue();
        var fActual = new Date();

        if (fSelected > fActual) {
          MessageBox.show("La fecha no puesde ser mayor a fecha actual")
        }
      },
      formatHora: function (evt) {
        var input = evt.getSource();
        //input.setValue(input.getValue().toUpperCase());
        var sValue = input.getValue();
        //idEstablecimiento = null
        if (sValue.length >= 5) {
          if (this.comparaTiempo(sValue)) {
            sValue = sValue.replace(/[^0-9:]/g, '');
            input.setValue(sValue);
          } else {
            MessageBox.show("Hora no válida");
          }
        }
      },
      comparaTiempo: function (time) {
        if ((parseInt(time.split(":")[0]) > 23 && parseInt(time.split(":")[0]) < 0)
        && (parseInt(time.split(":")[1]) > 59 && parseInt(time.split(":")[1]) < 0)) {
         return false
        }
          return true;
      }

    });
  }
);