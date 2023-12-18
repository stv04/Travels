import { Component, Input, OnInit } from '@angular/core';
import { IVuelo } from 'src/app/Interfaces/vuelos';

@Component({
  selector: 'app-vuelo',
  templateUrl: './vuelo.component.html',
  styleUrls: ['./vuelo.component.css']
})
export class VueloComponent implements OnInit{
  @Input() vuelo!: IVuelo;
  private regExpFechas = /\d{1,2}:\d{2}[A-Za-zÀ-ÿ\s]+,\s\d{1,2}\s\w+/g;

  fechaSalida = "";
  fechaLlegada = "";

  ngOnInit(): void {
    const expresion = this.vuelo.horario.join(" ").match(this.regExpFechas) ?? ["", ""];
    this.fechaSalida = expresion[0];
    this.fechaLlegada = expresion[1] ?? "";
  }
}
