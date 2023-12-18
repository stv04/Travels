
const prompt = require("inquirer").createPromptModule();

const jsnameQuery = (id) => `[jsname="${id}"]`;
const jsnameQueryInput = id => `input${jsnameQuery(id)}`;
const jsnameQueryChildInput = id => `${jsnameQuery(id)} input`;
const launchInquirerToContinue = async () => {
    return await prompt([{
        type: "confirm",
        message: "CONTINUAR",
        name: "next"
    }])
}

const quitarAcentos = (texto) => texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");


const interseccionTexto = (textoA, textoB) => {
    return quitarAcentos(textoA).toUpperCase()
        .includes(quitarAcentos(textoB).toUpperCase());
}

async function retry(cb, max_time, max_cb, c = 0) {
    if(c >= max_cb) return null;

    c++;
    try {
        const maxPromise = new Promise((res, rej) => setTimeout(() => rej("Tardó mucho en responder"), max_time));
        
        const race = await Promise.race([cb, maxPromise]);
        
        return race;
    } catch (e) {
        console.log("Ocurrió un error: " + e.message + " reintento: " + c);
        return await retry(cb, max_time, max_cb, c);
    }
}

const dateTimeFormatFechaGeneral = new Intl.DateTimeFormat("es-ES", {
    hour: undefined, minute: undefined, day: "2-digit", month: "2-digit", year: "numeric"
});

module.exports = {
    jsnameQuery,
    jsnameQueryInput,
    jsnameQueryChildInput,
    interseccionTexto,
    launchInquirerToContinue,
    dateTimeFormatFechaGeneral,
    retry
}