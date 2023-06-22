import { Component, Input, OnInit } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
})
export class RegistroComponent implements OnInit {
  formPaciente: boolean = false;
  formEspecialista: boolean = false;
  spinner: boolean = false;
  especialidades: string[] = [];
  listaFiltrada: string[] = [];

  constructor(public firestoreService: FirestoreService) {}

  ngOnInit(): void {
    this.spinner = true;
    setTimeout(() => {
      this.spinner = false;
    }, 1500);

    this.listaFiltrada = [];
    this.firestoreService.traerEspecialidades().subscribe((data: any[]) => {
      this.especialidades = data.map((doc: any) => doc.nombre);
      this.listaFiltrada = [...this.especialidades];
    });
  }

  goToFormPaciente() {
    this.formPaciente = true;
  }

  goToFormEspecialista() {
    this.formEspecialista = true;
  }

  goToRegistro() {
    this.formPaciente = false;
    this.formEspecialista = false;
  }

}