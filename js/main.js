let apiKey = "e817a8ca5a3ba0db6381aec3bc14f6b2"

function loadCurrentCity() {
    navigator.geolocation.getCurrentPosition(
        position => {
            console.log(position)
            loadWeatherDataByPos(position, onCurrentCityLoaded, errorDuringLoadingCurrent)
        },
        error => {
            console.log(error)
            loadWeatherDataByName("Moscow", onCurrentCityLoaded, errorDuringLoadingCurrent)
        }, {timeout: 5000}
    )
}

function errorDuringLoadingCurrent() {
    alert("Can't load city")
}

function onCurrentCityLoaded(weather) {
    console.log(weather)
    let curCel = document.getElementsByClassName("current__cel")[0]
    let curCity = document.getElementsByClassName("current__city")[0]
    let curImg = document.getElementsByClassName("current__img")[0]
    let curWind = document.getElementById("cur_wind")
    let curCloudiness = document.getElementById("cur_cloudiness")
    let curPressure = document.getElementById("cur_pressure")
    let curHumidity = document.getElementById("cur_humidity")
    let curCoordinates = document.getElementById("cur_coordinates")

    curCel.textContent = `${Math.round((weather.main.temp - 273.15) * 100) / 100}°C`
    curCity.textContent = weather.name
    curImg.src = `http://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`
    curWind.textContent = `${weather.wind.speed} m/s, ${windDegToText(weather.wind.deg)}`
    curCloudiness.textContent = `${weather.clouds.all}%`
    curPressure.textContent = `${weather.main.pressure} hpa`
    curHumidity.textContent = `${weather.main.humidity}%`
    curCoordinates.textContent = `[${weather.coord.lat}, ${weather.coord.lon}]`
}

function addNewCityByName(name) {
    addNewCity(false, (callback, errorCallback) => {
        loadWeatherDataByName(name, callback, errorCallback)
    })
}

function addNewCityById(id) {
    addNewCity(true, (callback, errorCallback) => {
        loadWeatherDataById(id, callback, errorCallback)
    })
}

function addNewCity(fromStorage, loadFunc) {
    let favoritesList = document.getElementsByClassName("weather__favorites")[0]
    let element = createFavoriteCityElement(favoritesList)
    loadFunc(weather => {
        onCityLoaded(fromStorage, favoritesList, element, weather)
    }, function () {
        errorDuringLoadingFavorite(favoritesList, element)
    })
}

function onCityLoaded(fromStorage, parent, element, weather) {
    console.log(weather)
    let inStorage = getLocalFavorites().includes(weather.id)
    if (!inStorage || fromStorage) {
        fillCityElement(parent, element, weather)
        if (!inStorage) {
            addToLocalFavorites(weather.id)
        }
    } else {
        parent.removeChild(element)
    }
}

function createFavoriteCityElement(parent) {
    let template = document.getElementById("favorites-template")
    let newFav = template.content.cloneNode(true)
    let element = newFav.childNodes[1]
    parent.appendChild(element)

    return element
}

function errorDuringLoadingFavorite(parent, element) {
    console.log(parent, element)
    parent.removeChild(element)
    alert("Can't load city")
}

function fillCityElement(parent, element, weather) {
    element.querySelector('.favorites-list__city').textContent = weather.name
    element.querySelector('.favorites-list__img').src = `http://openweathermap.org/img/wn/${weather.weather[0].icon}.png`
    element.querySelector('.favorites-list__temp').textContent = `${Math.round((weather.main.temp - 273.15) * 100) / 100}°C`
    element.querySelector('.favorites-list__button').onclick = function () {
        parent.removeChild(element)
        removeFromLocalFavorites(weather.id)
    }
    element.querySelector('#favorites-wind').textContent = `${weather.wind.speed} m/s, ${windDegToText(weather.wind.deg)}`
    element.querySelector('#favorites-cloudiness').textContent = `${weather.clouds.all}%`
    element.querySelector('#favorites-pressure').textContent = `${weather.main.pressure} hpa`
    element.querySelector('#favorites-humidity').textContent = `${weather.main.humidity}%`
    element.querySelector('#favorites-coordinates').textContent = `[${weather.coord.lat}, ${weather.coord.lon}]`
}

function windDegToText(degree) {
    if (degree > 337.5) return 'Northerly'
    if (degree > 292.5) return 'North Westerly'
    if (degree > 247.5) return 'Westerly'
    if (degree > 202.5) return 'South Westerly'
    if (degree > 157.5) return 'Southerly'
    if (degree > 122.5) return 'South Easterly'
    if (degree > 67.5) return 'Easterly'
    if (degree > 22.5) return 'North Easterly'
    return 'Northerly'
}

function addToLocalFavorites(id) {
    let favorites = getLocalFavorites()
    favorites.push(id)
    saveFavorites(favorites)
}

function removeFromLocalFavorites(id) {
    let favorites = getLocalFavorites().filter(value => value !== id)
    saveFavorites(favorites)
}

function getLocalFavorites() {
    if (localStorage.favorites === undefined || localStorage.favorites === "") return []
    return JSON.parse(localStorage.favorites)
}

function saveFavorites(favorites) {
    console.log(favorites)
    localStorage.favorites = JSON.stringify(favorites)
}

function loadWeatherDataByName(name, callback, errorCallback) {
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${apiKey}`
    loadDataByUrl(url, callback, errorCallback)
}

function loadWeatherDataByPos(position, callback, errorCallback) {
    let url = `https://api.openweathermap.org/data/2.5/weather?lat=${position.coords.latitude}&lon=${position.coords.longitude}&appid=${apiKey}`
    loadDataByUrl(url, callback, errorCallback)
}

function loadWeatherDataById(id, callback, errorCallback) {
    let url = `https://api.openweathermap.org/data/2.5/weather?id=${id}&appid=${apiKey}`
    loadDataByUrl(url, callback, errorCallback)
}

function loadDataByUrl(url, callback, errorCallback) {
    fetch(url)
        .then(response => {
            if (response.status === 200) {
                response.json().then(json => {
                    callback(json)
                })
            } else {
                errorCallback()
            }
        })
        .catch((err) => {
            errorCallback()
        })
}

window.onload = function () {
    document.getElementsByClassName("favorites__form")[0].addEventListener('submit', event => {
        event.preventDefault()
    })
    document.getElementsByClassName("favorites__button")[0].onclick = function () {
        let input = document.getElementsByClassName("favorites__input")[0]
        let cityName = input.value
        input.value = ""
        addNewCityByName(cityName)
    }
    document.getElementsByClassName("header__update-geo")[0].onclick = function () {
        loadCurrentCity()
    }
    let favorites = getLocalFavorites()
    favorites.forEach(item => {
        addNewCityById(item)
    })
    loadCurrentCity()
}

window.addEventListener('offline', () => {
    document.getElementsByClassName("favorites__button")[0].disabled = true
    document.getElementsByClassName("header__update-geo")[0].disabled = true
})

window.addEventListener('online', () => {
    document.getElementsByClassName("favorites-list__button")[0].disabled = false
    document.getElementsByClassName("header__update-geo")[0].disabled = false
})
