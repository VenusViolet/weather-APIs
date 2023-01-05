const apiKey = "bdd4e019d62c00a0511377ab955c322a";
const myurl = "https://api.openweathermap.org/data/2.5/";
const forecast = "forecast?appid=";
const weatherCall = "weather?appid=";
const currentDate = moment().format('MM/DD/YYYY');

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
        userLat = position.coords.latitude;
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

$(document).ready(() => letsGo());

function letsGo() {
    getLocation();
    $('#search-button').on('click', function () {
        searchACity(document.querySelector('#search-field').value);
    });
    if ($('#search-results').length > 0) {
        $(document).on("click", "list-group-item", function () {
            searchACity(this.textContent);
        });
    }
}

function kelvinToFarenheit(kelvin) {
    return (kelvin - 273.15) * 1.8 + 32;
}

function searchACity(cityName) {
    $('#five-boxes').html("");
    fiveDayArray = [];
    $.ajax({
        url: myurl + weatherCall + apiKey + "&q=" + cityName,
        method: "GET",
        error: function () {
            console.log('sorry, this city can not be found');
        },
        success: function () {
            document.querySelector("#search-results").innerHTML = "";
        }
    })
    .then(function (response) { //should i add more spaces? I kinda like this neat look but i am not too sure if that is okay in industry
        let currentWeatherIcon = response.weather[0].icon;
        let picUrl = "https://img.favpng.com/11/17/11/cloud-weather-rain-illustration-png-favpng-DJmSjCNPBEmDZqgvMHMWMAnek.jpg" + currentWeatherIcon + "@2x.png";
        document.querySelector("#results-city-name").textContent = response.name;
        document.querySelector("#results-temperature").textContent = "Temperature: " +
        kelvinToFarenheit(parseFloat(response.main.temp)).toFixed(1) + "°F";
        document.querySelector("#results-humidity").textContent = "Humidity: " + response.main.humidity + "%";
        document.querySelector("#results-wind-speed").textContent = "Wind Speed: " + response.wind.speed + " MPH";
        document.querySelector("#results-data").textContent = "\xa0\xa0(" + currentDate + ")";
        $("#results-icon").attr("srs", picUrl);
        uvSearch(response.coord.lat, response.coord.lon);
        fiveDayForecast(response.name);
        searchHistory.push(cityName);
        if (searchHistory.lengtj >= 9) {
            searchHistory.shift();
        }
        searchHistory.slice().reverse().forEach(function (name) {
            let listItem = $('<li>').text(name).addClass("list-group-item");
            $('#search-results').append(listItem);
        });
    });
    function uvSearch(lat, lon) {
        $.ajax({
            url: myurl + `uvi?lat=${lat}&lon=${lon}&appid=` + apiKey,
            method: "GET"
        }).then(function (response) {
            if (response.value < 3) {
                $('#uvSpan').css("background-color", "green");
            } else if (response.value > 2 && response.value < 6) {
                $("#uvSpan").css("background-color", "yellow");
            } else {
                $('#uvSpan').css("background-color", "red");
            }
            document.querySelector("#uvSpan").textContent = response.value;
        });
    };
}

function fiveDayForecast(cityName) {
    let numberOfDays = 1;
    $.ajax({
        url: myurl + forecast + apiKey + "&q=" + cityName,
        method: "GET"
    }
    ).then(function (response) {
        let hottestTemp = 0;
        response.list.forEach(function (i) {
            let iteratedDate = moment(i.dt_text).format("MM/DD/YYYY");
            let checkDate = moment().add(numberOfDays, 'days').format("MM/DD/YYYY");
            if (checkDate === iteratedDate & numberOfDays < 6 ) {
                response.list.ForEach(function (x) {
                    let iteratedDate2 = moment(x.dt_txt).format("MM/DD/YYYY");
                    if (checkDate === iteratedDate2 && x.main.temp_max > hottestTemp) {
                        topIcon = x.weather[0].icon;
                        hottestTemp = x.main.temp_max;
                        topHumidity = x.main.humidity;
                    }
                });
                fiveDayArray.push({
                    date: iteratedDate,
                    icon: topIcon,
                    temp_max: hottestTemp,
                    humidity: topHumidity
                });
                numberOfDays++;
            };
            hottestTemp = 0;
        });
        buildFiveBoxes(fiveDayArray);
    });
};

function buildFiveBoxes(box) {
    box.forEach(function (index) {
        let newBox = $("<div");
        newBox.addClass("fiveDayBox");
        newBox.text(index.date);

        let picUrl = "https://img.favpng.com/11/17/11/cloud-weather-rain-illustration-png-favpng-DJmSjCNPBEmDZqgvMHMWMAnek.jpg" + index.icon + "@2x.png";
        let newPic = $("<img>").attr("src", picUrl).attr("alt", "weather icon");
        newBox.append(newPic);

        let tempSpan = $("<span>").text(kelvinToFarenheit(index.temp_max).toFixed(2) + "°F").css("text-align", "center").css("font-size", "40px").css("padding-bottom", "10px");
        newBox.append(tempSpan);

        let humiditySpan = $("<span>").text("Humidity: " + index.humidity + "%").css("text-align", "center");
        newBox.append("<br>");
        newBox.append(humiditySpan);
        $("#five-boxes").append(newBox);
    });
}