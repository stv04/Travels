export interface IRequestVuelo {
  ciudadOrigen: string, 
  ciudadDestino: string, 
  fechaInicio: string | Date, 
  fechaFinal: string | Date,
  id_trace?: number,
  url?: string
}


export interface IVuelo {
  precio: string
  horario: string[]
  detalles: string[]
  descripcion: string
  styleImg: string
  aerolinea: string
}