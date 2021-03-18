let apiKey = "e817a8ca5a3ba0db6381aec3bc14f6b2";

function addNewCity(name) {
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${name}&appid=${apiKey}`;
    fetch(url)
        .then(response => { 
            response.json().then(json => { 
                onCityAdded(json) 
            })
        })
        .catch((err) => { alert(err); })
}

function createFavoriteCityHtml(city) {
    return `
        <ul class="favorites-list">
            <li class="favorites-list__title">
                <h3 class="favorites-list__city">${city.name}</h3>
                <p class="favorites-list__temp">${Math.round((city.main.temp - 273.15) * 100) / 100}°C</p>
                <img class="favorites-list__img" src="https://www.pngfind.com/pngs/m/273-2733257_icon-weather-portal-comments-weather-icons-png-white.png"/>
                <button class="favorites-list__button"><i class="fa fa-close"></i></button>
            </li>
            <li class="favorites-list__item">
                <p class="favorites-item__title">Ветер</p>
                <p class="favorites-item__value">${city.wind.speed} m/s, ${windDegToText(city.wind.deg)}</p>
            </li>
            <li class="favorites-list__item">
                <p class="favorites-item__title">Облачность</p>
                <p class="favorites-item__value">${city.weather[0].description}</p>
            </li>
            <li class="favorites-list__item">
                <p class="favorites-item__title">Давление</p>
                <p class="favorites-item__value">${city.main.pressure} hpa</p>
            </li>
            <li class="favorites-list__item">
                <p class="favorites-item__title">Влажность</p>
                <p class="favorites-item__value">${city.main.humidity}%</p>
            </li>
            <li class="favorites-list__item">
                <p class="favorites-item__title">Координаты</p>
                <p class="favorites-item__value">[${city.coord.lat}, ${city.coord.lon}]</p>
            </li>
        </ul>`;
}

function onCityAdded(city) {
    console.log(city);
    let favoritesList = document.getElementsByClassName("weather__favorites")[0];
    let newElement = document.createElement("li");
    newElement.innerHTML = createFavoriteCityHtml(city);
    favoritesList.appendChild(newElement);
}

function windDegToText(degree){
    if (degree>337.5) return 'Northerly';
    if (degree>292.5) return 'North Westerly';
    if(degree>247.5) return 'Westerly';
    if(degree>202.5) return 'South Westerly';
    if(degree>157.5) return 'Southerly';
    if(degree>122.5) return 'South Easterly';
    if(degree>67.5) return 'Easterly';
    if(degree>22.5){return 'North Easterly';}
    return 'Northerly';
}

function getLocalFavorites() {
    if (localStorage.favorites === "") return []
    return JSON.parse(localStorage.favorites)
}

function saveFavorites(favorites) {
    localStorage.favorites = JSON.stringify(favorites)
}

var favorites = getLocalFavorites()
favorites.forEach(item => {
    addNewCity(item);
})
