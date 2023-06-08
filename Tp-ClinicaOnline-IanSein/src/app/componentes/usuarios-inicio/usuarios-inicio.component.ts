import { Component, EventEmitter, Output } from '@angular/core';
import { FirestoreService } from 'src/app/services/firestore.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-usuarios-inicio',
  templateUrl: './usuarios-inicio.component.html',
  styleUrls: ['./usuarios-inicio.component.scss']
})
export class UsuariosInicioComponent {

  @Output() botonClickeado = new EventEmitter<any>();
  listaUsuarios: any;
  constructor(public firestoreService: FirestoreService, public auth: AuthService,) {

  }
  ngOnInit(): void {
    this.auth.getUsers().subscribe((usuarios) => {
      this.listaUsuarios = usuarios;
    });
  }
  clickListado(usuario: any) {
    this.botonClickeado.emit(usuario);
  }
}
