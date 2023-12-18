import { Component, Input } from '@angular/core';
import { Forecastday } from 'src/app/Interfaces/weather';

@Component({
  selector: 'app-clima',
  templateUrl: './clima.component.html',
  styleUrls: ['./clima.component.css']
})
export class ClimaComponent {
  @Input() foreCast!: Forecastday;
  @Input() fechas!: number[];
}
