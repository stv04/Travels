const BuscadorViajes = require("../Scrapping/BuscadorViajes");

async function extraerVuelos(data) {
    const {ciudadOrigen, ciudadDestino, fechaInicio, fechaFinal, max_reintentos, id_trace, url} = data;

    const trace = id_trace ?? 0;
    const buscador = new BuscadorViajes(url ?? "https://www.google.com/travel/flights", {
        max_reintentos
    });

    try {
        await buscador.launch();
        await buscador.aceptarTerminosCondiciones();
        let respuesta = [];
        switch(trace) {
            case 0:
                await buscador.seleccionarCiudadOrigen(ciudadOrigen);
            case 1:
                await buscador.seleccionarCiudadDestino(ciudadDestino);
            case 2:
                await buscador.seleccionarFechas(fechaInicio, fechaFinal);
            case 3:
                await buscador.buscar();  
            case 4:
                await buscador.ordenarResultados(2); // El 2 corresponde al precio
                respuesta = await buscador.extraerInformacion();
        }

        buscador.browser.close();

        return respuesta;
    } catch(e) {
        console.log(e);
        buscador.browser?.close();
        return {
            error: true,
            message: "Error scrapping: " + e.message,
            trace: {
                id_trace: buscador.trace,
                url: buscador.ultimaRuta()
            }
        };
    }
}

module.exports = {extraerVuelos}