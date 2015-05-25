/**
 * Created by DanielBrena on 24/05/15.
 */
routeBus.controller('IndexCtrl',function($scope,socket,CONFIG){

    $scope.rutas = [];
    $scope.arreglo = {};
    $scope.arreglo.ruta = "";
    $scope.arreglo.rutas = {};
    $scope.ubicacion = {};

    $scope.marker;


    socket.on('send:message', function (data) {
        $scope.ubicacion.lat  = data.lat;
        $scope.ubicacion.lng = data.lng;

        var image = {
            url: CONFIG.URL + ":" + CONFIG.PORT + "/images/iconoAutobus.png",
            // This marker is 20 pixels wide by 32 pixels tall.
            size: new google.maps.Size(20, 32),
            // The origin for this image is 0,0.
            origin: new google.maps.Point(0,0),
            // The anchor for this image is the base of the flagpole at 0,32.
            anchor: new google.maps.Point(0, 32)
        };

        $scope.marker = new google.maps.Marker({
            position: new google.maps.LatLng($scope.ubicacion.lat,$scope.ubicacion.lng),
            zIndex: google.maps.Marker.MAX_ZINDEX + 2,
            animation: google.maps.Animation.DROP,
            icon:image
        });
        $scope.marker.setMap($scope.mapa);

        //$scope.marker.setMap(null);
        console.log(data.lat + data.lng);
    });


    var colores = ["blue","red","green"];

    $scope.directionsService = [];
    $scope.directionsService_;
    $scope.mapa;

        if (navigator.geolocation) {

            navigator.geolocation.getCurrentPosition(function(position) {

                myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

                myOptions = {
                    zoom: 14,
                    center: myLatlng,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                }

                $scope.mapa = new google.maps.Map($("#mapa_index").get(0), myOptions);




                carga();
            });
        }else{
            alert("¡ Habilita la ubicación en tu navegador !");
        }

    $scope.mostrarEvt = function(){
       /* socket.emit('send:message', {
            lat: 16.8653729,
            lng:-96.78520
        });*/
        coordenadasById($scope.arreglo.ruta);

    }

    function carga() {
        var Ruta = Parse.Object.extend('Ruta');
        var Ubicacion = Parse.Object.extend('Ubicacion');
        var query = new Parse.Query(Ruta);
        query.find({
            success: function (results) {
                $scope.$apply(function(){
                    $scope.rutas = results;
                    $scope.arreglo.rutas = $scope.rutas;
                    //console.log($scope.arreglo.rutas[0]);


                    $scope.arreglo.ruta = "ZzoevivdOX";

                    leer();
                });


            },
            error: function (error) {
                alert("Error: " + error.code + " " + error.message);

            }

        });
    }


    function leer(){


        for(var i = 0; i < $scope.rutas.length; i++){
            $scope.directionsService.push( new google.maps.DirectionsService());
            coordenadas(i);
        }


    }

    function coordenadas(j){

        var Ruta = Parse.Object.extend('Ruta');
        var Ubicacion = Parse.Object.extend('Ubicacion');

        var query = new Parse.Query(Ruta);
        query.get($scope.rutas[j].id, function (obj) {
            var relation = obj.relation('ubicaciones');
            var query = relation.query();
            query.ascending("createAt");
            query.find({
                success: function (list) {
                    var rendererOptions = {
                        polylineOptions: {
                            strokeColor: colores[j]
                        }
                    };

                    var markers = [];
                    var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
                    for (i in list) {
                        var obj = list[i];
                        var coordenada = obj.get('coordenada').toJSON();





                        markers.push({location:new google.maps.LatLng(parseFloat(coordenada.latitude),parseFloat(coordenada.longitude))});
                    }

                    var rutas_nuevas = [];

                    for(var i = 1; i < markers.length-1;i++){
                        rutas_nuevas.push(markers[i]);
                        console.log(markers[i].location);
                    }

                    var request = {
                        origin: markers[0].location,
                        destination: markers[markers.length-1].location,
                        waypoints:rutas_nuevas ,
                        travelMode: google.maps.TravelMode.DRIVING
                    };
                    directionsDisplay.setMap($scope.mapa);

                    $scope.directionsService[j].route(request, function(response, status) {
                        if (status == google.maps.DirectionsStatus.OK) {
                            directionsDisplay.setDirections(response);
                        }
                    });


                }
            });
        });
    }

    function coordenadasById(id){

        var Ruta = Parse.Object.extend('Ruta');
        var Ubicacion = Parse.Object.extend('Ubicacion');

        var query = new Parse.Query(Ruta);
        query.get(id, function (obj) {
            var relation = obj.relation('ubicaciones');
            var query = relation.query();
            query.ascending("createAt");
            query.find({
                success: function (list) {
                    if(list.length == 0){
                        carga();
                    }else {
                        var rendererOptions = {
                            polylineOptions: {
                                strokeColor: "blue"
                            }
                        };

                        var markers = [];
                        var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
                        for (i in list) {
                            var obj = list[i];
                            var coordenada = obj.get('coordenada').toJSON();


                            markers.push({location: new google.maps.LatLng(parseFloat(coordenada.latitude), parseFloat(coordenada.longitude))});
                        }

                        var rutas_nuevas = [];

                        for (var i = 1; i < markers.length - 1; i++) {
                            rutas_nuevas.push(markers[i]);

                        }


                        var request = {
                            origin: markers[0].location,
                            destination: markers[markers.length - 1].location,
                            waypoints: rutas_nuevas,
                            travelMode: google.maps.TravelMode.DRIVING
                        };
                        $scope.directionsService_ = new google.maps.DirectionsService();
                        myOptions = {
                            zoom: 14,
                            center: markers[0].location,
                            mapTypeId: google.maps.MapTypeId.ROADMAP
                        }

                        $scope.mapa = new google.maps.Map($("#mapa_index").get(0), myOptions);

                        directionsDisplay.setMap($scope.mapa);

                        $scope.directionsService_.route(request, function (response, status) {
                            if (status == google.maps.DirectionsStatus.OK) {
                                directionsDisplay.setDirections(response);
                            }
                        });
                    }


                }
            });
        });
    }








});