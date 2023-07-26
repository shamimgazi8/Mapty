let inputdistance = document.querySelector(".distance");
let inputduration = document.querySelector(".duration");
let inputcadence = document.querySelector(".cadence");
let inputelevgain = document.querySelector(".elevgain");
let inputType = document.querySelector(".type");
const toggle = document.querySelector(".toggle");
const workoutcontainer = document.querySelector(".workouts_form");

const form = document.querySelector(".form");
let mapEG;
let dataType;
let _workout;
let coords;
let now = new Date();
const month = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "Septamber",
  "October",
  "November",
  "December",
];
class workout {
  id = Math.trunc(Math.random() * 1000 + 1000);
  now = new Date();
  month = month[now.getMonth()];
  date = now.getDate();
  constructor(coods, distance, duration) {
    this.distance = distance;
    this.duration = duration;
    this.coods = coods;
  }
}
class running extends workout {
  constructor(coods, distance, duration, cadence) {
    super(coods, distance, duration);
    this.cadence = cadence;
    this.dataType = "Running";
    this.calcpace();
  }
  calcpace() {
    this.pace = this.duration / this.distance;
    return this;
  }
}
class cyceling extends workout {
  constructor(coods, distance, duration, elevGain) {
    super(coods, distance, duration);
    this.elevGain = elevGain;
    this.dataType = "Cyceling";
    this.calcspeed();
  }
  calcspeed() {
    this.speed = this.distance / (this.duration / 60);
    return this;
  }
}

class mapty {
  dataType;
  coodss;
  loca;
  MAP;
  Workout;
  _workouts = [];

  constructor() {
    this._getPosition();
    inputType.addEventListener("change", this._toggleForm);
    form.addEventListener("submit", this._workoutForm.bind(this));
    // form.addEventListener("submit", this._loadMarker);
    workoutcontainer.addEventListener("click", this.moveToPopup.bind(this));
    form.addEventListener("submit", this.setLocalStorage.bind(this));
    this.getLocalStorage();
  }
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          console.log("Please turn on Your location on Setting");
        }
      );

    return this;
  }
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    this.coods = [latitude, longitude];
    var map = L.map("map").setView(this.coods, 13);
    this.MAP = map;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.MAP);

    L.marker(this.coods)
      .addTo(map)
      .bindPopup("Your Current Location")
      .openPopup();
    map.on("click", function (mapE) {
      mapEG = mapE;
      form.classList.remove("hidden");
      inputdistance.focus();
    });
    this._workouts.forEach((work) => {
      this._loadMarker(work);
    });
  }

  _toggleForm() {
    inputcadence.closest(".op").classList.toggle("toggle_active");
    inputelevgain.closest(".op").classList.toggle("toggle_active");
    dataType = inputType.value;
  }

  _workoutForm(e) {
    e.preventDefault();
    dataType = inputType.value;
    const { lat, lng } = mapEG.latlng;
    this.coodss = [lat, lng];
    let distance, duration, cadence, elevGain;
    if (
      (+inputdistance.value > 0 &&
        +inputduration.value > 0 &&
        +inputcadence.value) ||
      +inputelevgain.value > 0
    ) {
      duration = +inputduration.value;
      distance = +inputdistance.value;
      cadence = +inputcadence.value;
      elevGain = +inputelevgain.value;
    } else {
      form.classList.add("hidden");
      this._clearFiled();
      return alert("Please insert Valid input");
    }

    if (dataType === "Running") {
      _workout = new running(this.coodss, distance, duration, cadence);
    } else if (dataType === "Cyceling") {
      _workout = new cyceling(this.coodss, distance, duration, elevGain);
    }
    this.Workout = _workout;
    this._workouts.push(this.Workout);
    this._renderWorkout(this.Workout);
    this._loadMarker(this.Workout);
    this._clearFiled();
  }
  _clearFiled() {
    inputdistance.value =
      inputcadence.value =
      inputduration.value =
      inputelevgain.value =
        "";
  }
  _renderWorkout(Workout) {
    const html = `<div class="form_result form_result_${
      Workout.dataType
    }" data-id=${Workout.id}>
          <div class="form_details">
            <div class="date"><h2>${
              Workout.dataType === "Running"
                ? `🏃‍♀️ Running on ${Workout.month} ${Workout.date}`
                : `🚴 Cyceling on ${Workout.month} ${Workout.date}`
            } </h2></div>
            <div class="result">
              <p>${
                Workout.dataType === "Running" ? "🏃‍♀️" : "🚴"
              } ${+Workout.distance.toFixed(2)}km</p>
              <p>⌚ ${+Workout.duration.toFixed(2)} min</p>
              <p>⚡ ${
                Workout.dataType === "Running"
                  ? `${+Workout.pace.toFixed(2)} MIN/KM`
                  : `${+Workout.speed.toFixed(2)} KM/H`
              }</p>
              <p>👟 ${
                Workout.dataType === "Running"
                  ? +Workout.cadence.toFixed(2)
                  : +Workout.elevGain.toFixed(2)
              } ${Workout.dataType === "Running" ? "SPM" : "M"}</p>
            </div>
          </div>
        </div>`;
    form.insertAdjacentHTML("afterend", html);
  }
  _loadMarker(Workout) {
    L.marker(Workout.coods)
      .addTo(this.MAP)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${Workout.dataType}-pop`,
        })
      )
      .setPopupContent(
        `${
          Workout.dataType === "Running"
            ? `🏃‍♀️ Running on ${month[now.getMonth()]} ${now.getDate()}`
            : `🚴 Cyceling on ${month[now.getMonth()]} ${now.getDate()}`
        }`
      )
      .openPopup();

    form.classList.add("hidden");
  }

  moveToPopup(e) {
    const el = e.target.closest(".form_result");
    if (!el) return;
    const woEl = this._workouts.find((work) => +work.id === +el.dataset.id);
    this.MAP.setView(woEl.coods, 13, {
      Animation: true,
      pan: {
        duration: 1,
      },
    });
  }
  setLocalStorage() {
    localStorage.setItem("workout", JSON.stringify(this._workouts));
  }
  getLocalStorage() {
    const data = JSON.parse(localStorage.getItem("workout"));
    if (!data) return;
    this._workouts = data;
    this._workouts.forEach((work) => {
      this._renderWorkout(work);
      // this._loadMarker(work);
    });
  }
}

const app = new mapty();
