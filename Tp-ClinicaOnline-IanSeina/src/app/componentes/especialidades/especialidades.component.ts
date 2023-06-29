import { Component, EventEmitter, Output } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';
import { NotificationService } from 'src/app/services/notification.service';


@Component({
  selector: 'app-especialidades',
  templateUrl: './especialidades.component.html',
  styleUrls: ['./especialidades.component.scss']
})
export class EspecialidadesComponent {
  @Output() botonClickeado = new EventEmitter<any>();
  especialidades: string[] = [];
  listaFiltrada: string[] = [];
  valorInput: string;
  nuevaEspecialidad: string;
  inputValidado: boolean = false;
  arrayEspecialidades: any[] = [];

  constructor(public firestoreService: FirestoreService, private notificationService: NotificationService,) {
    this.nuevaEspecialidad = "";
    this.valorInput = "";
  }

  ngOnInit(): void {
    this.listaFiltrada = [];
    this.firestoreService.traerEspecialidades().subscribe((data: any[]) => {
      this.especialidades = data.map((doc: any) => doc.nombre);
      this.listaFiltrada = [...this.especialidades];
    });
  }

  validarEspecialidad() {
    if (this.valorInput.match(/^[a-zA-ZáéíóúÁÉÍÓÚüÜ\s]+$/)) {
      this.inputValidado = true;
      this.nuevaEspecialidad = this.valorInput;
    } else {
      this.inputValidado = false;
    }
    this.valorInput = '';
    this.listaFiltrada = [...this.especialidades];
  }

  filtrarLista() {
    this.listaFiltrada = this.especialidades.filter((item: string) =>
      item.toLowerCase().startsWith(this.valorInput.toLowerCase())
    );
  }

  agregarItem() {
    if (this.inputValidado) {
      this.firestoreService.setEspecialidad(this.nuevaEspecialidad);
      this.notificationService.showSuccess(
        'La especialidad se agregó exitosamente',
        'Especialidades'
      );
    } else {
      this.notificationService.showError(
        'Debe ingresar una especialidad válida',
        'Error'
      );
    }
  }

  clickListado(especialidad: any) {
    const especialidadConNombre = { nombre: especialidad };

    if (!this.arrayEspecialidades.some((e) => e.nombre === especialidad)) {
      if (this.arrayEspecialidades.length < 2) {
        this.arrayEspecialidades.push(especialidadConNombre);
        this.botonClickeado.emit(this.arrayEspecialidades);
      }
    } else {
      const indice = this.arrayEspecialidades.findIndex((e) => e.nombre === especialidad);
      this.arrayEspecialidades.splice(indice, 1);
      this.botonClickeado.emit(this.arrayEspecialidades);
    }
  }
}
