const { interseccionTexto, jsnameQueryChildInput, jsnameQueryInput, jsnameQuery, launchInquirerToContinue } = require("./utilidades");

const puppeteer = require("puppeteer");
const { _ids } = require("../constantes");

module.exports = class {
    /**@type {puppeteer.Page} */
    page;
    trace = 0;

    max_reintentos = 3;
    constructor(url, config) {
        this.url = url;
        this.config = config;

        if(config && config.max_reintentos) this.max_reintentos = config.max_reintentos;
    }

    async launch() {
        console.log("Launching Page");
        this.browser = await puppeteer.launch({
            headless: false
        });

        this.page = await this.browser.newPage();
        await this.page.goto(this.url, {
            waitUntil: "load"
        });
    }


    async aceptarTerminosCondiciones() {
        await this.page.click(jsnameQuery(_ids.aceptarPoliticas));
    }

    async seleccionarCiudadOrigen(valor) {
        console.log("Seleccionando ciudad origen");
        await this.seleccionarCiudad(_ids.contOrigen, valor);
        this.trace = 1;
    }
    
    async seleccionarCiudadDestino(valor) {
        console.log("seleccionando ciudad destino");
        await this.seleccionarCiudad(_ids.contDestino, valor);
        this.trace = 2;
    }

    async seleccionarFechas(fechaInicial, fechaFinal) {
        console.log("Seleccionando fechas");
        await this.page.waitForSelector(jsnameQueryChildInput(_ids.contFechaInicio));
        await this.page.click(jsnameQueryChildInput(_ids.contFechaInicio));

        const selectorFechaInicio = `[data-iso="${fechaInicial}"]`;
        const selectorFechaFinal = `[data-iso="${fechaFinal}"]`;
        await this.page.waitForSelector(jsnameQuery(_ids.calendar));
        const calendarEl = await this.page.$(jsnameQuery(_ids.calendar));
        
        await this.page.waitForSelector(selectorFechaInicio);
        await this.page.waitForSelector(selectorFechaFinal);
        const fechaInicioEl = await calendarEl.$(selectorFechaInicio);
        const fechaFinEl = await calendarEl.$(selectorFechaFinal);
        await this.wait(500);

        await fechaInicioEl.evaluate(el => el.click());
        await fechaFinEl.evaluate(el => el.click());
        this.trace = 3;
        console.log("Fecha seleccionada");
    }

    async buscar() {
        await this.page.keyboard.press("Enter");
        const btnBuscar = await this.page.$(jsnameQuery(_ids.btnBuscar));
            
        await btnBuscar.evaluate(el => el.click());
            
        this.trace = 4;
        console.log("Buscando...");
    }

    async ordenarResultados(valor) {
        await this.page.waitForSelector(jsnameQuery(_ids.btnOrdenarPor));
        const ordenarPOrEl = await this.page.$(jsnameQuery(_ids.btnOrdenarPor));
        await ordenarPOrEl.evaluate(el => el.click());

        await this.page.waitForSelector(jsnameQuery(_ids.contOpcionesOrdenar));
        const constenedorOpciones = await this.page.$(jsnameQuery(_ids.contOpcionesOrdenar));
        const opcionSeleccionada = await constenedorOpciones.$(`[data-value="${valor}"]`);
        await opcionSeleccionada.click();
        console.log("Vuelos ordenados");
    }

    async extraerInformacion() {
        console.log("Extrayendo información");
        await this.page.waitForSelector(jsnameQuery(_ids.contListaVuelos));
        await this.page.waitForSelector(`${jsnameQuery(_ids.contListaVuelos)} ul`);
        await new Promise(r => setTimeout(r, 1000));
        const listaVuelos = await this.page.$(`${jsnameQuery(_ids.contListaVuelos)} ul`);
      

        // const VerMas = await listaVuelos.$("li:last-child");
        // await VerMas.click();

        await listaVuelos.waitForSelector("li");
        const vuelosEl = await listaVuelos.$$("li");
        const primerosVuelos = vuelosEl.slice(0, -1);
        await this.revisarRutaYRedirigir();

        const resp = await Promise.all(primerosVuelos.map(async vuelo => {
            try {
                await vuelo.waitForSelector(jsnameQuery(_ids.detallesVuelo), {
                    timeout: 10000
                });
                const detalles = await vuelo.$(jsnameQuery(_ids.detallesVuelo));
                await detalles.evaluate(el => el.click());
    
                await vuelo.waitForSelector(jsnameQuery(_ids.contDetalles));
                await vuelo.waitForSelector(_ids.classPrecio);
                const contendorDetalles = await vuelo.$(jsnameQuery(_ids.contDetalles));
                const data = await contendorDetalles.evaluate((el, ids) => {
                    console.log(el);
                    const {classHorario, classEspecificaciones, classPrecio} = ids;
                    const readChild = (elRef) => {
                        if(elRef.hasChildNodes())
                            return Array.from(elRef.childNodes).map(c => readChild(c)).join(" ");
                
                        return elRef.textContent
                    }
    
                    const respuesta = {
                        precio: "",
                        horario: [],
                        detalles: [],
                        descripcion: "",
                        aerolinea: [],
                        styleImg: ""
                    }
    
                    console.log(el);
    
                    const horario = el.querySelector(classHorario);
                    if(horario) {
                        respuesta.horario = Array.from(horario.childNodes).map(c => readChild(c));
                        // respuesta.horario = Array.from(horario.childNodes).map(chld => {
                        //     if(chld.hasChildNodes())
                        //         return Array.from(chld.childNodes).map(c => c.textContent).join(" ");
    
                        //     return chld.textContent
                        // });
                    }
    
                    const aerolineaEl = el.querySelector(ids.classAerolinea);
                    if(aerolineaEl) respuesta.aerolinea = readChild(aerolineaEl);
    
                    const logo = el.querySelector(ids.queryImagen);
                    if(logo) respuesta.styleImg = logo.getAttribute("style");
    
                    const detalles = el.querySelectorAll(classEspecificaciones);
                    respuesta.detalles = Array.from(detalles).map(hEl => hEl.textContent);
    
                    const descriptor = el.nextElementSibling;
                    if(descriptor) respuesta.descripcion = descriptor.textContent;
    
                    const precioEl = el.querySelector(classPrecio);
                    if(precioEl) respuesta.precio = precioEl.textContent;
    
                    return respuesta
                }, _ids);
        
                return data;
            } catch (e) {
                console.log("Error extrayendo un vuelo: " + e.message);
                return null
            }
        }));

        return resp.filter(Boolean);
    }

    async seleccionarCiudad(idContenedorCiudad, valor) {
        let valorDevuelto = "";
        let contadorReintentos = 0;
        const max_reintentos = this.max_reintentos;
        let interceccionCorrecta = false;

        while(
            contadorReintentos < max_reintentos
        ) {
            await this.page.waitForSelector(jsnameQueryInput(_ids.inputFormulario));
            await this.page.waitForSelector(jsnameQueryChildInput(_ids.contOrigen));
            await this.page.waitForSelector(jsnameQueryChildInput(_ids.contDestino));
    
            await this.page.waitForSelector(jsnameQuery(idContenedorCiudad));
            const ciudadEl = await this.page.$(jsnameQueryChildInput(idContenedorCiudad));
            await this.escribirInput(ciudadEl, valor);
            
            // await this.page.keyboard.press("Tab");
            // await this.page.keyboard.press("Tab");
            await this.page.keyboard.press("ArrowDown");
            await this.page.keyboard.press("Enter");

            const url = this.page.url();
            if(url.includes("travel/explore")) await this.page.goBack();

            valorDevuelto = await ciudadEl.evaluate((el) => {
                return el.value
            });

            console.log("Valor ciudad: ", valorDevuelto);

            if(interceccionCorrecta = interseccionTexto(valorDevuelto, valor))
                contadorReintentos = max_reintentos;
            else
                await this.page.reload();

            contadorReintentos++;
        }

        if(!interceccionCorrecta) throw new Error(`No se pudo coincidir con la ciudad ingresada: "${valor}"`);
    }

    async revisarRutaYRedirigir() {
        const url = this.page.url();
        if(!url.toUpperCase().startsWith(this.url.toUpperCase())) await this.page.goBack();
    }

    /**
     * @param {puppeteer.ElementHandle<Element>} elRef  - elRef es una referencia a un elemento de entrada en el DOM (modelo de objetos de
     * documento). Se utiliza para interactuar con el elemento de entrada, como hacer clic en él, borrar su
     * valor, escribir un nuevo valor y presionar la tecla de flecha hacia abajo.
     * @param value - El parámetro de valor es el nombre de la ciudad que desea escribir en el campo de
     * entrada.
     */
    async escribirInput(elRef, value) {
        await elRef.evaluate(el => el.click());
        await this.wait(500);
        const elSegundoInput = await this.page.$(jsnameQueryChildInput(_ids.contInpDireccion));

        await this.page.keyboard.press("AltLeft");

        await this.page.keyboard.down("Shift");
        await this.page.keyboard.press("ArrowRight");
        await this.page.keyboard.up("Shift");
        
        await this.page.keyboard.press("Backspace");
        await elSegundoInput.type(" " + value, {delay: 200});
    }

    
    ultimaRuta() {
        return this.page.url();
    }

    async wait(t) {
        return await new Promise(r => setTimeout(r, t));
    }

}