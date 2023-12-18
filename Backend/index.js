const express = require("express");
const { extraerVuelos } = require("./Network/Vuelos");
const bodyParser = require("body-parser");
const cors = require("cors")

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("Puerto conectado correctamente");
});

app.post("/ProximosVuelos", async (req, res) => {
    const body = req.body;
    body.max_reintentos = 3;
    try {
        const vuelos = await extraerVuelos(body);
        if(vuelos.error) 
            return res.status(500).send(vuelos);
        
        res.send(vuelos);
    } catch(e) {
        res.status(500).send({
            error: true,
            message: "No se ha podido conectar "+ e.message
        });
    }
});


app.listen(PORT, () => {
    console.log("Listening on: localhost:" + PORT)
});