import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { IRequestVuelo, IVuelo } from '../Interfaces/vuelos';
import { DatePipe } from '@angular/common';
import { BehaviorSubject, catchError, of, tap, throwError } from 'rxjs';
import { Forecastday, IWeather } from '../Interfaces/weather';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private apiKeyWeather = "b5d2196423714c0d881142725231312";
  private endpoint = "https://api.weatherapi.com/v1";
  private pathFuture = "/future.json";
  private pathForecast = "/forecast.json";
  private pathVuelos = "/ProximosVuelos"

  private api = "http://localhost:3000";
  constructor(private http: HttpClient, private dp: DatePipe) { }

  foreCast = new BehaviorSubject<Forecastday[]>([]);
  clima(data: IRequestVuelo) {
    this.foreCast.next([]);
    const params = new HttpParams()
    .set("q", data.ciudadDestino)
    .set("days", 14)
    .set("lang", "es")
    // .set("dt", this.dp.transform(data.fechaInicio, "YYYY-MM-dd")!)
    .set("key", this.apiKeyWeather)

    return this.http.get<IWeather>(this.endpoint + this.pathForecast, {
      params
    })
    .pipe(
      tap(wht => this.foreCast.next(wht.forecast.forecastday))
    )
  }

  vuelos = new BehaviorSubject<IVuelo[]>([]);
  cargandoVuelos = false;
  obtenerVuelos(data: IRequestVuelo) {
    this.cargandoVuelos = true;
    this.vuelos.next([]);
    return this.http.post<IVuelo[]>(this.api + this.pathVuelos, data)
    .pipe(
      tap(res => {
        this.cargandoVuelos = false;
        this.vuelos.next(res)
      }),
      catchError((err) => {
        this.cargandoVuelos = false;
        return throwError(() => err.error);
      })
    );
  }
}
