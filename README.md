# Descrición

En este poryecto se trabaja la técnica del web scrapping para realizar consultas hacia la web de [Google Flights]("https://www.google.com/travel/flights") para buscar los vuelos según la información de destino, origen y fechas que ingrese el usuario, extrayendo de esa forma los vuelos más económicos según los datos que se hayan solicitado, además presenta un frontend encargado de mostrar la información solicitada por api, para mostrar la lista de vuelos detallada, combinada con el clima de los próximos 14 días, utilizado el api de [WeatherAPI](https://www.weatherapi.com/).


## Características
1. Backend con nodejs `v16.15.1`
- Para las pruebas de scrapping se utilizó [puppeteer]("https://pptr.dev/")
- [Inquirer]("https://www.npmjs.com/package/inquirer#documentation") Para interacción con la consola.
- [Express]("https://expressjs.com") para la creación del API

2. Frontend hecho en angular `v16.2.10`
- Estilos y formulario con [ng-bootstrap]("https://ng-bootstrap.github.io/#/home") y [Angular material]("https://material.angular.io/")


## Instalación
1. Realizar las instalaciones correspondientes para el backend

```sh
cd Backend
npm install
```

- Para realizar la prueba directa del scrapping, ejecute el siguiente comando:
```sh
npm run scrap
```
    
- Para inicializar el api de conección con el front ejecute:
```sh
npm start
```

2. Conectar con el frontend

- Primero nos aseguramos de estar en la carpeta `Frontend` del proyecto, ubicandonos en la carpeta raiz  y ejecutando el siguiente comando:

```sh
cd Frontend
```

- Una vez allí procedemos a instalar las dependencias e inicializar el proyecto:
```sh
npm install
npm start
```



## Limitaciones
- El clima solo se muestra para los próximos 14 días (incluyendo la fecha actual).
- Las ciudades ingresadas no pueden presentar errores ortográficos y debe coincidir parcialmente con el nombre que define google al seleccionar la ciudad
