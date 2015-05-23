/**
 * Created by DanielBrena on 23/05/15.
 */
routeBus.controller('RuteCreateCtrl',function($scope){
    var directionsDisplay;
    var directionsService = new google.maps.DirectionsService();
    var mapa;
    var rendererOptions = {
        draggable: true
    };
    $scope.markers = [];


    if (navigator.geolocation) {

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
                recreateRute();
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

    }
    function recreateRute(r){
        var rutas = r.routes[0];

        for(var i = 1, j = 0; i < $scope.markers.length-1;i++,j++){

            $scope.markers[i] = {location:rutas.legs[j].end_location};
        }
        createRute();
    }


    $scope.searchEvt = function(){
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
                    //computeTotalDistance(directionsDisplay.getDirections());
                    recreateRute();
                });
                directionsDisplay.setPanel(document.getElementById('contenedor'));
            }
        });


    }


})