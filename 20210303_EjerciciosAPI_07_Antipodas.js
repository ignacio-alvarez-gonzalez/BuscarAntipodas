require([
    "esri/map",
    "esri/geometry/Point",
    "esri/geometry/webMercatorUtils",

    "esri/toolbars/draw",
    "esri/symbols/SimpleMarkerSymbol", 
    "esri/symbols/SimpleLineSymbol", 
    "esri/Color",
    "esri/graphic",

    "esri/dijit/Search",
    "esri/tasks/locator",

    "dojo/ready",
    "dojo/parser",
    "dojo/on",

    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane"
], function(
    Map,
    Point,
    webMercatorUtils,

    Draw,
    SimpleMarkerSymbol, 
    SimpleLineSymbol, 
    Color,
    Graphic,

    Search,
    Locator,

    ready,
    parser,
    on
){
    ready(function(){

        parser.parse();

        // SE CREAN AMBOS MAPAS:

        var mapa1 = new Map("divMap1", {
            basemap: "gray-vector",
            center: [-6.97, 38.88],
            zoom: 8
        });

        var mapa2 = new Map("divMap2", {
            basemap: "dark-gray-vector",
            center: [-6.97, 38.88],
            zoom: 8
        });

        mapa1.on("load", function(){
            mapa1.graphics.clear();
        });

        // SE CREAN LAS VARIABLES NECESARIAS:

        var ubicacionInicial;
        var ubicacionAntipodas;
        var coordenadasInicio;
        var coordenadasAntipodas;

        var simbolo = new SimpleMarkerSymbol(
            SimpleMarkerSymbol.STYLE_CIRCLE, 
            10,
            new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0,0,0]), 1),
            new Color([255,127,0,0.75])
        );

        var dibujo = new Draw(mapa1);

        var buscadorUbicacion = new Search(
            {map: mapa1, enableInfoWindow: false, autoNavigate: false}, 
            "buscarUbicacion"
        );
        buscadorUbicacion.startup();

        var geolocalizadorInicio = new Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");
        var geolocalizadorAntipodas = new Locator("http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer");

        on(dojo.byId("seleccionarPunto"), "click", function(){

            dibujo.activate(Draw.POINT);
            dibujo.on("draw-end", function(eventoSeleccion){

                mapa1.graphics.remove(ubicacionInicial);

                var geometria = eventoSeleccion.geometry;
                ubicacionInicial = new Graphic(geometria, simbolo);
                mapa1.graphics.add(ubicacionInicial);
                mapa1.centerAndZoom(geometria, 4);

                coordenadasInicio = webMercatorUtils.xyToLngLat(
                    eventoSeleccion.geometry.x, 
                    eventoSeleccion.geometry.y, 
                    true
                );

                dibujo.deactivate();

                geolocalizadorInicio.locationToAddress(geometria, 0);
                geolocalizadorInicio.on("location-to-address-complete", function(resultado){
                    dojo.byId("ubicacion").innerHTML = ubicarDireccion(resultado);
                });

            });

            dibujo.on("draw-end", dibujarAntipoda);
            
        });

        on(dojo.byId("buscarUbicacion"), "click", function(){

            buscadorUbicacion.on("select-result", function(eventoBuscador){

                mapa1.graphics.remove(ubicacionInicial);
    
                puntoInicial = new Point(eventoBuscador.result.feature.geometry);
                ubicacionInicial = new Graphic(puntoInicial, simbolo);
                mapa1.graphics.add(ubicacionInicial);
                mapa1.centerAndZoom(puntoInicial, 4);
    
                buscadorUbicacion.clear();

                coordenadasInicio = webMercatorUtils.xyToLngLat(
                    eventoBuscador.result.feature.geometry.x, 
                    eventoBuscador.result.feature.geometry.y, 
                    true
                );

                dojo.byId("longitud1").innerHTML = Math.round((coordenadasInicio[0])*100)/100 + "º";
                dojo.byId("latitud1").innerHTML = Math.round((coordenadasInicio[1])*100)/100 + "º";

                geolocalizadorInicio.locationToAddress(puntoInicial, 0);
                geolocalizadorInicio.on("location-to-address-complete", function(resultado){
                    dojo.byId("ubicacion").innerHTML = ubicarDireccion(resultado);
                });
            
            });

            buscadorUbicacion.on("select-result", dibujarAntipoda);

        });

        function dibujarAntipoda(){

            mapa2.graphics.remove(ubicacionAntipodas);

            var antipodaLongitud = (180-(coordenadasInicio[0]))*-1;
            var antipodaLatitud = (coordenadasInicio[1])*-1;
            coordenadasAntipodas = webMercatorUtils.lngLatToXY(antipodaLongitud, antipodaLatitud);

            var antipoda = new Point();
            antipoda.x = coordenadasAntipodas[0];
            antipoda.y = coordenadasAntipodas[1];
            antipoda.spatialReference = mapa2.spatialReference;

            ubicacionAntipodas = new Graphic(antipoda, simbolo);
            mapa2.graphics.add(ubicacionAntipodas);
            mapa2.centerAndZoom(antipoda, 4);

            dojo.byId("longitud2").innerHTML = Math.round((antipodaLongitud)*100)/100 + "º";
            dojo.byId("latitud2").innerHTML = Math.round((antipodaLatitud)*100)/100 + "º";

            geolocalizadorAntipodas.locationToAddress(antipoda, 0);
            geolocalizadorAntipodas.on("location-to-address-complete", function(resultado){
                dojo.byId("antipodas").innerHTML = ubicarDireccion(resultado);
            });

        };

        function ubicarDireccion(eventoGeolocalizador){
            console.log(eventoGeolocalizador);
            let direccionUbicacion = "";
            let listado = [];

            // var calle = eventoGeolocalizador.address.address.Address;
            // if (calle != ""){listado.push(calle)};

            var ciudad = eventoGeolocalizador.address.address.City;
            if (ciudad != ""){listado.push(ciudad + ", ")};

            var subregion = eventoGeolocalizador.address.address.Subregion;
            if (subregion != ""){listado.push(subregion + ", ")};

            var region = eventoGeolocalizador.address.address.Region;
            if (region != ""){listado.push(region + ", ")};

            var codigoPostal = eventoGeolocalizador.address.address.Postal;
            if (codigoPostal != ""){listado.push(codigoPostal + ", ")};

            var pais = eventoGeolocalizador.address.address.CountryCode;
            var etiqueta = eventoGeolocalizador.address.address.LongLabel;

            if (pais != ""){
                if (eventoGeolocalizador.address.address.Type != ""){
                    direccionUbicacion = etiqueta + ".";
                } else {
                    listado.push(pais + ".");

                    dojo.forEach(listado, function(elemento){
                        direccionUbicacion += elemento;
                    });
                };
            } else {
                direccionUbicacion = etiqueta + ".";
            };

            return direccionUbicacion;

        };

    });

});