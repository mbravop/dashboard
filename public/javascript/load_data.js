import {
  tiempoArr,
  precipitacionArr,
  uvArr,
  temperaturaArr,
} from "./static_data.js";

let fechaActual = () => new Date().toISOString().slice(0, 10);

let cargarPrecipitacion = () => {
  let URL =
    "https://api.open-meteo.com/v1/forecast?latitude=-2.1962&longitude=-79.8862&hourly=precipitation_probability&timezone=auto";

  fetch(URL)
    .then((responseText) => responseText.json())
    .then((responseJSON) => {
      let data = responseJSON.hourly.precipitation_probability;
      
      let precipitacionMinima = Math.min(...data);
      let precipitacionMaxima = Math.max(...data);
      let precipitacionSuma = data.reduce((a, b) => a + b, 0);
      let precipitacionPromedio = Math.round(precipitacionSuma/data.length);
      document.getElementById("precipitacionMinValue").textContent = `Min ${precipitacionMinima} [%]`
      document.getElementById("precipitacionMaxValue").textContent = `Max ${precipitacionMaxima} [%]`
      document.getElementById("precipitacionPromValue").textContent = `Prom ${precipitacionPromedio} [%]`
    })
    .catch(console.error);
};

let cargarFechaActual = () => {
  //Obtenga la referencia al elemento h6
  let coleccionHTML = document.getElementsByTagName("h6");

  let tituloH6 = coleccionHTML[0];
  //Actualice la referencia al elemento h6 con el valor de la función fechaActual()
  tituloH6.textContent = fechaActual();
};



let cargarOpenMeteo = async () => {
  //URL que responde con la respuesta a cargar
  let URL =
    "https://api.open-meteo.com/v1/forecast?latitude=-2.1962&longitude=-79.8862&hourly=temperature_2m&timezone=auto";

  fetch(URL)
    .then((responseText) => responseText.json())
    .then((responseJSON) => {
      //Referencia al elemento con el identificador plot
      let plotRef = document.getElementById("plot1");

      //Etiquetas del gráfico
      let labels = responseJSON.hourly.time;

      //Etiquetas de los datos
      let data = responseJSON.hourly.temperature_2m;

      let temperaturaMinima = Math.min(...data);
      let temperaturaMaxima = Math.max(...data);
      let temperaturaSuma = data.reduce((a, b) => a + b, 0);
      let temperaturaPromedio = Math.round(temperaturaSuma/data.length);
      document.getElementById("temperaturaMinValue").textContent = `Min ${temperaturaMinima} [ºC]`
      document.getElementById("temperaturaMaxValue").textContent = `Max ${temperaturaMaxima} [ºC]`
      document.getElementById("temperaturaPromValue").textContent = `Prom ${temperaturaPromedio} [ºC]`

      //Objeto de configuración del gráfico
      let config = {
        type: "line",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Temperature [2m]",
              data: data,
            },
          ],
        },
      };

      //Objeto con la instanciación del gráfico
      let chart1 = new Chart(plotRef, config);
    })
    .catch(console.error);
};

let cargarOpenMeteo2 = async () => {
  //URL que responde con la respuesta a cargar
  let URL2 =
    "https://api.open-meteo.com/v1/forecast?latitude=-2.1962&longitude=-79.8862&hourly=relativehumidity_2m&timezone=auto";

  fetch(URL2)
    .then((responseText) => responseText.json())
    .then((responseJSON) => {
      //Referencia al elemento con el identificador plot
      let plotRef2 = document.getElementById("plot2");

      //Etiquetas del gráfico
      let labels2 = responseJSON.hourly.time;

      //Etiquetas de los datos
      let data2 = responseJSON.hourly.relativehumidity_2m;

      //Objeto de configuración del gráfico
      let config2 = {
        type: "line",
        data: {
          labels: labels2,
          datasets: [
            {
              label: "Relative Humidity [2 m]",
              data: data2,
              borderColor: "red",
            },
          ],
        },
      };

      //Objeto con la instanciación del gráfico
      let chart1 = new Chart(plotRef2, config2);
    })
    .catch(console.error);
};

let cargarRayosUV = async () => {
  let URL =
    "https://api.open-meteo.com/v1/forecast?latitude=-2.1962&longitude=-79.8862&daily=uv_index_max&timezone=auto";

  fetch(URL)
    .then((responseText) => responseText.json())
    .then((responseJSON) => {
      let data = responseJSON.daily.uv_index_max;
      
      let UVMinima = Math.min(...data);
      let UVMaxima = Math.max(...data);
      let UVSuma = data.reduce((a, b) => a + b, 0);
      let UVPromedio = Math.round(UVSuma/data.length);
      document.getElementById("UVMinValue").textContent = `Min ${UVMinima} [--]`
      document.getElementById("UVMaxValue").textContent = `Max ${UVMaxima} [--]`
      document.getElementById("UVPromValue").textContent = `Prom ${UVPromedio} [--]`
    })
    .catch(console.error);
};

cargarPrecipitacion();
cargarRayosUV();
cargarFechaActual();
cargarOpenMeteo();
cargarOpenMeteo2();

let parseXML = (responseText) => {
  // Parsing XML
  const parser = new DOMParser();
  const xml = parser.parseFromString(responseText, "application/xml");

  // Referencia al elemento `#forecastbody` del documento HTML

  let forecastElement = document.querySelector("#forecastbody");
  forecastElement.innerHTML = "";

  // Procesamiento de los elementos con etiqueta `<time>` del objeto xml
  let timeArr = xml.querySelectorAll("time");

  timeArr.forEach((time) => {
    let from = time.getAttribute("from").replace("T", " ");

    let humidity = time.querySelector("humidity").getAttribute("value");
    let windSpeed = time.querySelector("windSpeed").getAttribute("mps");
    let precipitation = time.querySelector("precipitation").getAttribute("probability");
    let pressure = time.querySelector("pressure").getAttribute("value");
    let cloud = time.querySelector("clouds").getAttribute("all");

    let template = `
          <tr>
              <td>${from}</td>
              <td>${humidity}</td>
              <td>${windSpeed}</td>
              <td>${precipitation}</td>
              <td>${pressure}</td>
              <td>${cloud}</td>
          </tr>
      `;

    //Renderizando la plantilla en el elemento HTML
    forecastElement.innerHTML += template;
  });
};

// Callback async
let selectListener = async (event) => {
  let selectedCity = event.target.value;
  let cityStorage = localStorage.getItem(selectedCity);

  if (cityStorage == null) {
    try {
      //API key
      let APIkey = "64082b5ef19662f52b316f32ebe182a7";
      let url = `https://api.openweathermap.org/data/2.5/forecast?q=${selectedCity}&mode=xml&appid=${APIkey}`;

      let response = await fetch(url);
      let responseText = await response.text();

      await parseXML(responseText);
      await localStorage.setItem(selectedCity, responseText);
    } catch (error) {
      console.log(error);
    }
  } else {
    // Procese un valor previo
    parseXML(cityStorage);
  }
};

let loadForecastByCity = () => {
  //Handling event
  let selectElement = document.querySelector("select");
  selectElement.addEventListener("change", selectListener);
};

loadForecastByCity();

let loadExternalTable = async () => {
  //Requerimiento asíncrono
  let proxyURL = 'https://cors-anywhere.herokuapp.com/'
  let url = proxyURL + 'https://www.gestionderiesgos.gob.ec/monitoreo-de-inundaciones/'
  
  let response = await fetch(url);
  let htmlText = await response.text();

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(htmlText, 'text/html');

  const tableElement = xmlDoc.querySelector('#postcontent table');
  const monitoreoElement = document.getElementById('monitoreo');

  monitoreoElement.innerHTML = tableElement.outerHTML;
};

loadExternalTable();
