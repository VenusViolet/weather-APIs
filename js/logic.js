const apiKey = "bdd4e019d62c00a0511377ab955c322a";
const myurl = "https://api.openweathermap.org/data/2.5/";
const forecast = "forecast?appid=";
const weatherCall = "weather?appid=";
const currentDate = moment().format('MM/DD?YYYY');

let searchHistory = [];
let fiveDayArray = [];

function getLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, handle_error);

    };
    function handle_error(err) {
        if(err.code == 1) {
            userLat = 19.7216;
            userLong = 155.0849;
            $.ajax({
                url: myurl + weatherCall + apiKey + "&lat=" + userLat.toFixed(1) + "&lon=" + userLong.toFixed(0),
                method: "GET", 
            }).then(function (r) {
                searchACity(r.name);
            });
        };
    };

};

function showPosition(position) {
    if (navigator.geolocation) {
        userLaat = postion.coords.latitude;
        userLong = position.coords.longitude;
    } else {
        userLat = 19.7216;
        userLong = 155.0849;
    } 
    $.ajax({
        url: myurl + weatherCall + apiKey + "&lat=" + userLat.toFixed(4) + "&lon=" + userLong.toFixed(4),
        method: "GET",
    }).then(function (r) {
        searchACity(r.name);
    });

}