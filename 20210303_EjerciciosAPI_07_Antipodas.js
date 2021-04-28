require([
    "esri/map",
    "esri/geometry/Point",
    "esri/geometry/webMercatorUtils",

    "esri/toolbars/draw",
    "esri/symbols/SimpleMarkerSymbol", 
    "esri/symbols/SimpleLineSymbol", 
    "esri/Color",
    "esri/graphic",

    "dojo/ready",
    "dojo/parser",

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

    ready,
    parser,
){
    ready(function(){

        parser.parse();

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

        mapa1.on("load", iniciarDibujo);

        function iniciarDibujo() {
            mapa1.graphics.clear();
            dibujo = new Draw(mapa1);
            dibujo.activate(Draw.POINT);
            dibujo.on("draw-end", dibujarAntipoda);
        };

        function dibujarAntipoda(evento){

            console.log(evento)

            // dibujo.deactivate();

            var geometria = evento.geometry;

            var simbolo = new SimpleMarkerSymbol(
                SimpleMarkerSymbol.STYLE_SQUARE, 
                10,
                new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([0,0,0]), 1),
                new Color([255,127,0,0.5])
            );

            var grafico1 = new Graphic(geometria, simbolo);
            mapa1.graphics.add(grafico1);

            
            var coordenadasPunto = webMercatorUtils.xyToLngLat(evento.geometry.x, evento.geometry.y, true);
            console.log(coordenadasPunto);

            antipodaLongitud = (180-(coordenadasPunto[0]))*-1;
            console.log(antipodaLongitud);

            antipodaLatitud = (coordenadasPunto[1])*-1;
            console.log(antipodaLatitud);

            var coordenadasAntipodas = webMercatorUtils.lngLatToXY(antipodaLongitud, antipodaLatitud);
            console.log(coordenadasAntipodas);

            var antipoda = new Point();
            antipoda.x = coordenadasAntipodas[0];
            antipoda.y = coordenadasAntipodas[1];
            antipoda.spatialReference = evento.geometry.spatialReference;
            console.log(antipoda)

            var grafico2 = new Graphic(antipoda, simbolo);
            mapa2.graphics.add(grafico2);

            mapa2.centerAndZoom(antipoda, 4);
            mapa2.on("zoom-end", redibujar);

        };

        // function redibujar(){
        //     dibujo = new Draw(mapa1);
        //     dibujo.activate(Draw.POINT);
        //     dibujo.on("draw-end", function(){
        //         // mapa1.graphics.clear();
        //         dibujarAntipoda;
        //     });
        // };


    });

});