export class User {
  id: number;
  perfil: string;
  nombre: string;
  apellido: string;
  edad: number;
  dni: number;
  obraSocial: string;
  especialidad: string;
  mail: string;
  password: string;
  imagen1: string;
  imagen2: string;
  aprobado: boolean;

  constructor() {
    this.id = 0;
    this.perfil = '';
    this.nombre = '';
    this.apellido = '';
    this.edad = 0;
    this.dni = 0;
    this.obraSocial = '';
    this.especialidad = '';
    this.mail = '';
    this.password = '';
    this.imagen1 = '';
    this.imagen2 = '';
    this.aprobado = false;
  }
}