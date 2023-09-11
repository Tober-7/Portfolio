"use strict";

//#region prettier-ignore
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
//#endregion

//#region Elements

    const form = document.querySelector(".form");
    const containerWorkouts = document.querySelector(".workouts");
    const inputType = document.querySelector(".form__input--type");
    const inputDistance = document.querySelector(".form__input--distance");
    const inputDuration = document.querySelector(".form__input--duration");
    const inputCadence = document.querySelector(".form__input--cadence");
    const inputElevation = document.querySelector(".form__input--elevation");

//#endregion

//#region Classes

    class App {

        #map;
        #mapEvent;
        #workouts = [];

        constructor () {
            this._getWorkoutData.call(this);

            this._getPosition();

            form.addEventListener("submit", this._newWorkout.bind(this));
        
            inputType.addEventListener("change", this._toggleElevationField);

            containerWorkouts.addEventListener("click", this._goToMarker.bind(this));
        };

        _getPosition () {
            if (navigator.geolocation) navigator.geolocation.getCurrentPosition(
                this._loadMap.bind(this),
                function () {
                    alert("Could not get your position. Please allow position tracking in the browser settings.");
                }
            );
        };

        _loadMap (pos) {
            const {latitude, longitude} = pos.coords;
            // const link = `https://www.google.com/maps/@${latitude},${longitude}`;
            const coords = [latitude, longitude]

            this.#map = L.map("map").setView(coords, 13);

            L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);

            L.marker(coords).addTo(this.#map)
                .bindPopup("You are here!")
                .openPopup();

            this.#map.on("click", this._showForm.bind(this));

            this.#workouts.forEach(w => {
                w.date = new Date(new Date(this.#workouts[0].date));
                const description = this._getDescription(w);
                this._renderMarker(w.coords[0], w.coords[1], w.typ, w.type, description);
            });
        };

        _showForm (mapE) {
            this.#mapEvent = mapE;
            form.classList.remove("hidden");
            inputDistance.focus();
        };

        _toggleElevationField () {
            inputElevation.closest(".form__row").classList.toggle("form__row--hidden");
            inputCadence.closest(".form__row").classList.toggle("form__row--hidden"); 
        };

        _newWorkout (e) {
            e.preventDefault();

            let workout;

            const dis = +inputDistance.value;
            const dur = +inputDuration.value;
            const cad = +inputCadence.value;
            const ele = +inputElevation.value;
            const typ = inputType.value;

            const type = typ === "running";
            
            const {lat, lng} = this.#mapEvent.latlng;
            const coords = [lat, lng];

            if (dis <= 0) return this._invalidAlert("distance");
            if (dur <= 0) return this._invalidAlert("duration");

            if (type) {
                if (cad <= 0) return this._invalidAlert("cadence");

                workout = new Running(coords, dis, dur, typ, type, cad);
                this.#workouts.push(workout);
            }

            if (!type) {
                if (!Number.isFinite(ele)) return alert(`Please enter a valid ${s} (a number)`);

                workout = new Cycling(coords, dis, dur, typ, type, ele);
                this.#workouts.push(workout);
            }

            const description = this._getDescription(workout);
    
            this._renderMarker.call(this, lat, lng, typ, type, description);

            this._renderWorkout(workout, description);

            inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value = "";
            form.classList.add("hidden");

            this._saveWorkoutData();
        };

        _invalidAlert (s) {
            alert(`Please enter a valid ${s} (a number greater than zero)`);
        };

        _goToMarker (e) {
            const workout = e.target.closest(".workout");

            if (!workout) return;

            const coords = this.#workouts.find(w => w.id === workout.dataset.id).coords;
            
            this.#map.setView(coords, this.#map._zoom, {animate: true, pan: {duration: 1}});
        };

        _getDescription (w) {
            return `${(w.typ).slice(0, 1).toUpperCase() + (w.typ).slice(1)} on ${w.date.getDate()}. ${w.date.toLocaleString('default', { month: 'long' })}`;
        };

        _renderMarker (lat, lng, typ, type, desc) {
            L.marker([lat, lng]).addTo(this.#map)
                .bindPopup(L.popup({
                    maxWidth: 250,
                    minWidth: 100,
                    autoClose: false,
                    closeOnClick: false,
                    className: `${typ}-popup`,
                }))
                .setPopupContent(`${type ? "🏃‍♂️" : "🚴‍♀️"} ${desc}`)
                .openPopup();
        };

        _renderWorkout (w, desc) {
            containerWorkouts.insertAdjacentHTML("beforeend",
            `
            <li class="workout workout--${w.typ}" data-id="${w.id}">
              <h2 class="workout__title">${desc}</h2>
              <div class="workout__details">
                <span class="workout__icon">${w.type ? "🏃‍♂️" : "🚴‍♀️"}</span>
                <span class="workout__value">${w.distance}</span>
                <span class="workout__unit">km</span>
              </div>
              <div class="workout__details">
                <span class="workout__icon">⏱</span>
                <span class="workout__value">${w.duration}</span>
                <span class="workout__unit">min</span>
              </div>
              <div class="workout__details">
                <span class="workout__icon">⚡️</span>
                <span class="workout__value">${w.type ? w.pace.toFixed(2) : w.speed.toFixed(2)}</span>
                <span class="workout__unit">${w.type ? "min/km" : "km/h"}</span>
              </div>
              <div class="workout__details">
                <span class="workout__icon">${w.type ? "🦶🏼" : "⛰"}</span>
                <span class="workout__value">${w.type ? w.cadence : w.elevationGain}</span>
                <span class="workout__unit">${w.type ? "spm" : "m"}</span>
              </div>
            </li>
            `);
        };

        _saveWorkoutData () {
            localStorage.setItem("workouts", JSON.stringify(this.#workouts));
        };

        _getWorkoutData () {
            const data =  JSON.parse(localStorage.getItem("workouts"));
            
            if (!data) return;

            this.#workouts = data;

            this.#workouts.forEach(w => {
                w.date = new Date(new Date(this.#workouts[0].date));
                const description = this._getDescription(w);
                this._renderWorkout(w, description);
            });
        };

        reset () {
            localStorage.removeItem("workouts");
            location.reload();
        };
    };

    const app = new App();

    class Workout {
        date = new Date();
        id = (Date.now() + "").slice(-10);

        constructor (coords, distance, duration, typ, type) {
            this.coords = coords;
            this.distance = distance;
            this.duration = duration;
            this.typ = typ;
            this.type = type;
        };
    };

    class Running extends Workout {
        constructor (coords, distance, duration, typ, type, cadence) {
            super(coords, distance, duration, typ, type);
            this.cadence = cadence;
            this.calcPace();
        };

        calcPace () {
            this.pace = this.duration / this.distance;
            return this.pace;
        };
    };

    class Cycling extends Workout {
        constructor (coords, distance, duration, typ, type, elevationGain) {
            super(coords, distance, duration, typ, type);
            this.elevationGain = elevationGain;
            this.calcSpeed();
        };

        calcSpeed () {
            this.speed = this.distance / (this.duration / 60);
            return this.speed;
        };
    };

//#endregion