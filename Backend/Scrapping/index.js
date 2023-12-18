const { extraerVuelos } = require("../Network/Vuelos");
const inquirer = require("inquirer");
const DatePrompt = require("inquirer-date-prompt");
const { dateTimeFormatFechaGeneral } = require("./utilidades");
const fs = require("fs");

const prompt = inquirer.createPromptModule();
prompt.registerPrompt("date", DatePrompt);


prompt([
    {
        message: "Ciudad de origen",
        name: "ciudadOrigen"
    },
    {
        message: "Ciudad de destino",
        name: "ciudadDestino"
    },
    {
        type: "date",
        message: "Fecha de salida (Usar la flechas para editar ←|↑|→|↓)",
        name: "fechaInicio",
        format: { month: "short", hour: undefined, minute: undefined },
    },
    {
        type: "date",
        message: "Fecha de regreso (Usar la flechas para editar ←|↑|→|↓)",
        name: "fechaFinal",
        format: { month: "short", hour: undefined, minute: undefined },
    }
])
.then(async res => {
    res.fechaInicio = dateTimeFormatFechaGeneral.format(res.fechaInicio).split("/").reverse().join("-");
    res.fechaFinal = dateTimeFormatFechaGeneral.format(res.fechaFinal).split("/").reverse().join("-");
    const respuesta = await extraerVuelos(res);

    console.log("Lista de precios disponibles", respuesta);
    const guardado = __dirname + `/Data/${res.ciudadOrigen}-${res.ciudadDestino}.json`;
    fs.writeFile(guardado, JSON.stringify(respuesta, null, 1), (err) => {
        if(err) return console.warn("ERROR GUARDANDO LA INFORMACIÓN: " + err.message);

        console.log("Información guardada con éxito en la siguiente ruta: " + guardado);
    })
});


