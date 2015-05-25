/**
 * Created by DanielBrena on 23/05/15.
 */
routeBus.controller('RuteCreateCtrl',function($scope,$timeout){
    var directionsDisplay;
    var directionsService;
    var mapa;
    var rendererOptions = {
        draggable: true
    };
    $scope.markers = [];


    if (navigator.geolocation) {
        $scope.markers = [];
        directionsService = new google.maps.DirectionsService();
        navigator.geolocation.getCurrentPosition(function(position) {
            directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
            myLatlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

            myOptions = {
                zoom: 14,
                center: myLatlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }

            mapa = new google.maps.Map($("#mapa").get(0), myOptions);
            directionsDisplay.setMap(mapa);
            listener = google.maps.event.addListener(mapa, 'click', function(event) {
                addMarker(event.latLng);
            });
            google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {
                recreateRute(directionsDisplay.getDirections());
            });
            directionsDisplay.setPanel(document.getElementById('contenedor'));


        });
    }else{
        alert("¡ Habilita la ubicación en tu navegador !");
    }

    function addMarker(location){

            if($scope.markers.length < 1){
                marker = new google.maps.Marker({
                    position: location,
                    map: mapa,
                    draggable: true,
                    animation: google.maps.Animation.DROP
                });
            }else{
                marker = new google.maps.Marker({
                    position: location
                });
            }



        $scope.markers.push({location:location});
        createRute();



    }

    function createRute(){
        if($scope.markers.length <= 10){
            if($scope.markers.length>=2){
                var rutas_nuevas = [];

                for(var i = 1; i < $scope.markers.length-1;i++){
                    rutas_nuevas.push($scope.markers[i]);

                }

                var request = {
                    origin:$scope.markers[0].location,
                    destination:$scope.markers[$scope.markers.length-1].location,
                    waypoints:rutas_nuevas,
                    travelMode: google.maps.TravelMode.DRIVING
                };

                directionsService.route(request, function(response, status) {
                    if (status == google.maps.DirectionsStatus.OK) {
                        directionsDisplay.setDirections(response);
                    }
                });
            }
        }else{
            alert("Haz superado el limite de Marcadores");
        }


    }
    function recreateRute(r){
        var rutas = r.routes[0];
        for(var i = 1, j = 0; i < $scope.markers.length;i++,j++){
            console.log(rutas.legs[j].end_location);
            $scope.markers[i] = {location:rutas.legs[j].end_location};
        }
        createRute();
    }


    $scope.searchEvt = function(){
        $scope.markers = [];
        directionsService = new google.maps.DirectionsService();
        directionsDisplay.setMap(null);
        var direccion = $scope.searchTxt;
        var listener;
        var geocoder = new google.maps.Geocoder();

        geocoder.geocode({'address':direccion},function(results, status){
            directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);
            if(status == 'OK'){
                var mapOptions = {
                    zoom: 14,
                    center: results[0].geometry.location,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                mapa = new google.maps.Map($("#mapa").get(0), mapOptions);
                mapa.fitBounds(results[0].geometry.viewport);
                directionsDisplay.setMap(mapa);
                listener = google.maps.event.addListener(mapa, 'click', function(event) {

                    addMarker(event.latLng);
                });
                google.maps.event.addListener(directionsDisplay, 'directions_changed', function() {

                    recreateRute(directionsDisplay.getDirections());
                });
                directionsDisplay.setPanel(document.getElementById('contenedor'));
            }
        });


    }

    $scope.createEvt = function(){

        var confirmacion = confirm('¿ Estas seguro de guardar la ruta ?');
        if(confirmacion && $scope.nombreTxt != ""){
            var Ruta = Parse.Object.extend('Ruta');
            var Ubicacion = Parse.Object.extend('Ubicacion');
            var rutas = [];

            var ruta = new Ruta();
            ruta.set('nombre',$scope.nombreTxt);
            ruta.set('descripcion', $scope.descripcionTxt);

            for(var i = 0; i < $scope.markers.length; i++){

                var ubicacion = new Ubicacion();
                var r = $scope.markers[i].location;
                ubicacion.set('coordenada',new Parse.GeoPoint({latitude: r.A,longitude: r.F}));
                ubicacion.save(null,{
                    success:function(ubi){
                        rutas.push(ubi);
                    }
                });
                for(var j = 0; j < 100; j++){

                }
            }

            ruta.save(null,{
                success:function(ruta){
                    var relation = ruta.relation('ubicaciones');
                    relation.add(rutas);
                    ruta.save();
                },
                error:function(){
                    alert('La ruta no se pudo guardar');
                }
            })
        }

    }


});