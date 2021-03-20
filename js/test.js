let apiKey = "e817a8ca5a3ba0db6381aec3bc14f6b2";

function loadCurrentCity() {
    navigator.geolocation.getCurrentPosition(
        position => {
            loadWeatherDataByPos(position, onCurrentCityLoaded, errorDuringLoading);
        },
        error => {
            loadWeatherDataByName("Moscow", onCurrentCityLoaded, errorDuringLoading);
        }
    );
}

function onCurrentCityLoaded(weather) {
    console.log(weather);
    let curCel = document.getElementsByClassName("current__cel")[0];
    let curCity = document.getElementsByClassName("current__city")[0];
    let curImg = document.getElementsByClassName("current__img")[0];
    let curWind = document.getElementById("cur_wind");
    let curCloudiness = document.getElementById("cur_cloudiness");
    let curPressure = document.getElementById("cur_pressure");
    let curHumidity = document.getElementById("cur_humidity");
    let curCoordinates = document.getElementById("cur_coordinates");

    curCel.textContent = `${Math.round((weather.main.temp - 273.15) * 100) / 100}°C`;
    curCity.textContent = weather.name
    curImg.src = `http://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`
    curWind.textContent = `${weather.wind.speed} m/s, ${windDegToText(weather.wind.deg)}`;
    curCloudiness.textContent = `${weather.weather[0].description}`;
    curPressure.textContent = `${weather.main.pressure} hpa`;
    curHumidity.textContent = `${weather.main.humidity}%`;
    curCoordinates.textContent = `[${weather.coord.lat}, ${weather.coord.lon}]`;
}

function addNewCity(name) {
    loadWeatherDataByName(name, onCityLoaded, errorDuringLoading);
}

function onCityLoaded(weather) {
    console.log(weather);
    let favoritesList = document.getElementsByClassName("weather__favorites")[0];
    createFavoriteCityElement(weather, favoritesList)

    if (!getLocalFavorites().includes(weather.name)) {
        addToLocalFavorites(weather.name);
    }
}

function errorDuringLoading() {
    alert("Can't load city");
}

function createFavoriteCityElement(weather, parent) {
    let template = document.getElementById("favorites-template");
    let newFav = template.content.cloneNode(true)
    let li = newFav.childNodes[1];
    let cityName = weather.name
    newFav.querySelector('.favorites-list__city').textContent = cityName
    newFav.querySelector('.favorites-list__img').src = `http://openweathermap.org/img/wn/${weather.weather[0].icon}.png`
    newFav.querySelector('.favorites-list__temp').textContent = `${Math.round((weather.main.temp - 273.15) * 100) / 100}°C`
    newFav.querySelector('.favorites-list__button').onclick = function () {
        parent.removeChild(li);
        removeFromLocalFavorites(cityName)
    }
    newFav.querySelector('#favorites-wind').textContent = `${weather.wind.speed} m/s, ${windDegToText(weather.wind.deg)}`
    newFav.querySelector('#favorites-cloudiness').textContent = weather.weather[0].description
    newFav.querySelector('#favorites-pressure').textContent = `${weather.main.pressure} hpa`
    newFav.querySelector('#favorites-humidity').textContent = `${weather.main.humidity}%`
    newFav.querySelector('#favorites-coordinates').textContent = `[${weather.coord.lat}, ${weather.coord.lon}]`

    parent.appendChild(newFav)
}

function windDegToText(degree) {
    if (degree > 337.5) return 'Northerly';
    if (degree > 292.5) return 'North Westerly';
    if (degree > 247.5) return 'Westerly';
    if (degree > 202.5) return 'South Westerly';
    if (degree > 157.5) return 'Southerly';
    if (degree > 122.5) return 'South Easterly';
    if (degree > 67.5) return 'Easterly';
    if (degree > 22.5) return 'North Easterly';
    return 'Northerly';
}

function addToLocalFavorites(city) {
    let favorites = getLocalFavorites();
    favorites.push(city);
    saveFavorites(favorites);
}

function removeFromLocalFavorites(city) {
    let favorites = getLocalFavorites().filter(value => value !== city)
    saveFavorites(favorites);
}

function getLocalFavorites() {
    if (localStorage.favorites === undefined || localStorage.favorites === "") return [];
    return JSON.parse(localStorage.favorites);
}

function saveFavorites(favorites) {
    console.log(favorites);
    localStorage.favorites = JSON.stringify(favorites);
}

function loadWeatherDataByName(name, callback, errorCallback) {
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${apiKey}`;
    loadDataByUrl(url, callback, errorCallback);
}

function loadWeatherDataByPos(position, callback, errorCallback) {
    let url = `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${apiKey}`;
    loadDataByUrl(url, callback, errorCallback);
}

function loadDataByUrl(url, callback, errorCallback) {
    fetch(url)
        .then(response => {
            if (response.status === 200) {
                response.json().then(json => {
                    callback(json);
                });
            } else {
                errorCallback();
            }
        })
        .catch((err) => {
            errorCallback()
        });
}

window.onload = function () {
    document.getElementsByClassName("favorites__form")[0].addEventListener('submit', event => {
        event.preventDefault()
    });
    document.getElementsByClassName("favorites__button")[0].onclick = function () {
        let cityName = document.getElementsByClassName("favorites__input")[0].value;
        if (getLocalFavorites().includes(cityName)) return;
        addNewCity(cityName);
    }
    document.getElementsByClassName("header__update-geo")[0].onclick = function () {
        loadCurrentCity()
    }
    let favorites = getLocalFavorites();
    favorites.forEach(item => {
        addNewCity(item);
    });
    loadCurrentCity();
}
