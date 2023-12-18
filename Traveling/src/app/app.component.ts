import { Component, OnDestroy, WritableSignal } from '@angular/core';
import { IVuelo } from './Interfaces/vuelos';
import { ApiService } from './Services/api.service';
import { Subject, pipe, takeUntil } from 'rxjs';
import { Forecastday } from './Interfaces/weather';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy {
  title = 'Traveling';
  fechasDeseadas = [0, 0];

  vuelos:IVuelo[] = [];
  forecasts: Forecastday[] = [];

  constructor(private api: ApiService) {
    this.api.vuelos
    .pipe(
      takeUntil(this._stop)
    )
    .subscribe(res => this.vuelos = res);
    
    this.api.foreCast
    .pipe(
      takeUntil(this._stop)
    )
    .subscribe(res => this.forecasts = res);
  }

  get cargandoVuelos() {
    return this.api.cargandoVuelos;
  }

  private _stop = new Subject();
  ngOnDestroy(): void {
    this._stop.next(true);
    this._stop.complete();
    this._stop.unsubscribe();
  }

  onCambioFechas(fechas: Date[]) {
    this.fechasDeseadas = fechas.map(f => f?.getTime() ?? 0);
  }
}
