"use strict";

var apiKey = "e817a8ca5a3ba0db6381aec3bc14f6b2";

function loadCurrentCity() {
  navigator.geolocation.getCurrentPosition(function (position) {
    console.log(position);
    loadWeatherDataByPos(position, onCurrentCityLoaded, errorDuringLoadingCurrent);
  }, function (error) {
    console.log(error);
    loadWeatherDataByName("Moscow", onCurrentCityLoaded, errorDuringLoadingCurrent);
  }, {
    timeout: 5000
  });
}

function errorDuringLoadingCurrent() {
  alert("Can't load city");
}

function onCurrentCityLoaded(weather) {
  console.log(weather);
  var curCel = document.getElementsByClassName("current__cel")[0];
  var curCity = document.getElementsByClassName("current__city")[0];
  var curImg = document.getElementsByClassName("current__img")[0];
  var curWind = document.getElementById("cur_wind");
  var curCloudiness = document.getElementById("cur_cloudiness");
  var curPressure = document.getElementById("cur_pressure");
  var curHumidity = document.getElementById("cur_humidity");
  var curCoordinates = document.getElementById("cur_coordinates");
  curCel.textContent = "".concat(Math.round((weather.main.temp - 273.15) * 100) / 100, "\xB0C");
  curCity.textContent = weather.name;
  curImg.src = "http://openweathermap.org/img/wn/".concat(weather.weather[0].icon, "@4x.png");
  curWind.textContent = "".concat(weather.wind.speed, " m/s, ").concat(windDegToText(weather.wind.deg));
  curCloudiness.textContent = "".concat(weather.clouds.all, "%");
  curPressure.textContent = "".concat(weather.main.pressure, " hpa");
  curHumidity.textContent = "".concat(weather.main.humidity, "%");
  curCoordinates.textContent = "[".concat(weather.coord.lat, ", ").concat(weather.coord.lon, "]");
}

function addNewCityByName(name) {
  addNewCity(false, function (callback, errorCallback) {
    loadWeatherDataByName(name, callback, errorCallback);
  });
}

function addNewCityById(id) {
  addNewCity(true, function (callback, errorCallback) {
    loadWeatherDataById(id, callback, errorCallback);
  });
}

function addNewCity(fromStorage, loadFunc) {
  var favoritesList = document.getElementsByClassName("weather__favorites")[0];
  var element = createFavoriteCityElement(favoritesList);
  loadFunc(function (weather) {
    onCityLoaded(fromStorage, favoritesList, element, weather);
  }, function () {
    errorDuringLoadingFavorite(favoritesList, element);
  });
}

function onCityLoaded(fromStorage, parent, element, weather) {
  console.log(weather);
  var inStorage = getLocalFavorites().includes(weather.id);

  if (!inStorage || fromStorage) {
    fillCityElement(parent, element, weather);

    if (!inStorage) {
      addToLocalFavorites(weather.id);
    }
  } else {
    parent.removeChild(element);
  }
}

function createFavoriteCityElement(parent) {
  var template = document.getElementById("favorites-template");
  var newFav = template.content.cloneNode(true);
  var element = newFav.childNodes[1];
  parent.appendChild(element);
  return element;
}

function errorDuringLoadingFavorite(parent, element) {
  console.log(parent, element);
  parent.removeChild(element);
  alert("Can't load city");
}

function fillCityElement(parent, element, weather) {
  element.querySelector('.favorites-list__city').textContent = weather.name;
  element.querySelector('.favorites-list__img').src = "http://openweathermap.org/img/wn/".concat(weather.weather[0].icon, ".png");
  element.querySelector('.favorites-list__temp').textContent = "".concat(Math.round((weather.main.temp - 273.15) * 100) / 100, "\xB0C");

  element.querySelector('.favorites-list__button').onclick = function () {
    parent.removeChild(element);
    removeFromLocalFavorites(weather.id);
  };

  element.querySelector('#favorites-wind').textContent = "".concat(weather.wind.speed, " m/s, ").concat(windDegToText(weather.wind.deg));
  element.querySelector('#favorites-cloudiness').textContent = "".concat(weather.clouds.all, "%");
  element.querySelector('#favorites-pressure').textContent = "".concat(weather.main.pressure, " hpa");
  element.querySelector('#favorites-humidity').textContent = "".concat(weather.main.humidity, "%");
  element.querySelector('#favorites-coordinates').textContent = "[".concat(weather.coord.lat, ", ").concat(weather.coord.lon, "]");
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

function addToLocalFavorites(id) {
  var favorites = getLocalFavorites();
  favorites.push(id);
  saveFavorites(favorites);
}

function removeFromLocalFavorites(id) {
  var favorites = getLocalFavorites().filter(function (value) {
    return value !== id;
  });
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
  var url = "https://api.openweathermap.org/data/2.5/weather?q=".concat(name, "&appid=").concat(apiKey);
  loadDataByUrl(url, callback, errorCallback);
}

function loadWeatherDataByPos(position, callback, errorCallback) {
  var url = "https://api.openweathermap.org/data/2.5/weather?lat=".concat(position.coords.latitude, "&lon=").concat(position.coords.longitude, "&appid=").concat(apiKey);
  loadDataByUrl(url, callback, errorCallback);
}

function loadWeatherDataById(id, callback, errorCallback) {
  var url = "https://api.openweathermap.org/data/2.5/weather?id=".concat(id, "&appid=").concat(apiKey);
  loadDataByUrl(url, callback, errorCallback);
}

function loadDataByUrl(url, callback, errorCallback) {
  fetch(url).then(function (response) {
    if (response.status === 200) {
      response.json().then(function (json) {
        callback(json);
      });
    } else {
      errorCallback();
    }
  })["catch"](function (err) {
    errorCallback();
  });
}

window.onload = function () {
  document.getElementsByClassName("favorites__form")[0].addEventListener('submit', function (event) {
    event.preventDefault();
  });

  document.getElementsByClassName("favorites__button")[0].onclick = function () {
    var input = document.getElementsByClassName("favorites__input")[0];
    var cityName = input.value;
    input.value = "";
    addNewCityByName(cityName);
  };

  document.getElementsByClassName("header__update-geo")[0].onclick = function () {
    loadCurrentCity();
  };

  var favorites = getLocalFavorites();
  favorites.forEach(function (item) {
    addNewCityById(item);
  });
  loadCurrentCity();
};

window.addEventListener('offline', function () {
  document.getElementsByClassName("favorites__button")[0].disabled = true;
  document.getElementsByClassName("header__update-geo")[0].disabled = true;
});
window.addEventListener('online', function () {
  document.getElementsByClassName("favorites-list__button")[0].disabled = false;
  document.getElementsByClassName("header__update-geo")[0].disabled = false;
});