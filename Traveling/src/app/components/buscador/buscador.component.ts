import { DatePipe } from '@angular/common';
import { Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { NgbAlert, NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { BehaviorSubject, Subject, combineLatest, debounceTime, map, takeUntil, tap } from 'rxjs';
import { IRequestVuelo } from 'src/app/Interfaces/vuelos';
import { ApiService } from 'src/app/Services/api.service';


@Component({
  selector: 'app-buscador',
  templateUrl: './buscador.component.html',
  styleUrls: ['./buscador.component.css']
})
export class BuscadorComponent implements OnInit, OnDestroy{
  public form = this.fb.group({
    ciudadOrigen: ["", Validators.required], 
    ciudadDestino: ["", Validators.required], 
    fechaInicio: [this.soloFecha(new Date()), Validators.required], 
    fechaFinal: [this.soloFecha(new Date()), [Validators.required, this.validatorFechaFinal]]
  });

  mensajeError = "";

  @Output() fechasEvent = new EventEmitter();
  @ViewChild('selfClosingAlert', { static: false }) selfClosingAlert?: NgbAlert;

  today = new Date();
  lastTrace: undefined | {id_trace: number, url: string}
  constructor(private fb: FormBuilder, private api: ApiService, private dp: DatePipe) {  }
  
  ngOnInit(): void {
    const ctrlInicio = this.form.get("fechaInicio")!
    const ctrlFin = this.form.get("fechaFinal")!
    combineLatest([
      ctrlInicio.valueChanges,
      ctrlFin.valueChanges
    ])
    .pipe(takeUntil(this._stop))
    .subscribe(res => this.fechasEvent.emit(res));
    
    this.form
    .valueChanges
    .pipe(takeUntil(this._stop))
    .subscribe(() => this.lastTrace = undefined);
    
    ctrlInicio.setValue(this.today);
    
    const tomorrow = new Date(this.today);
    tomorrow.setDate(this.today.getDate() + 3);
    ctrlFin.setValue(tomorrow);
  }

  private _stop = new Subject();
  ngOnDestroy(): void {
    this._stop.next(true);
    this._stop.complete();
    this._stop.unsubscribe();
  }

  buscar() {
    if(this.form.invalid) {
      this.mensajeError = "Validar los campos del formulario";
      return;
    }

    this.buscarVuelos();
    this.buscarClima();
  }

  buscarVuelos(trace?:any) {
    
    const value = {...this.form.value} as IRequestVuelo;
    
    value.fechaFinal = this.dp.transform(value.fechaFinal, "YYYY-MM-dd")!;
    value.fechaInicio = this.dp.transform(value.fechaInicio, "YYYY-MM-dd")!;

    if(trace) {
      value.url = trace.url;
      value.id_trace = trace.id_trace;
    }

    this.api.obtenerVuelos(value)
    .subscribe({
      next: res => this.mensajeError = "",
      error: err => {
        this.lastTrace = err.trace;
        this.mensajeError = err.message ?? "Error desconocido"
      }
    });
  }

  buscarClima() {
    const value = this.form.value as IRequestVuelo;
    
    this.api.clima(value)
    .subscribe(res => {
      console.log(res);
    })

  }

  soloFecha(d: Date) {
    d.setHours(0,0,0,0);
    return d;
  }

  validatorFechaFinal(info: FormControl): ValidationErrors|null {
    if(!info.parent) return null;
    
    if(info.value?.toString() === info.parent.get("fechaInicio")!.value?.toString()) {
      return {
        error: "fechas",
        message: "La fecha inicial y final no deben ser las mismas"
      }
    }

    return null;
  }

}