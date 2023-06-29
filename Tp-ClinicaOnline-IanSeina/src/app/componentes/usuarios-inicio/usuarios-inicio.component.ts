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
      const pacientes: any[] = [];
      const especialistas: any[] = [];
      const admins: any[] = [];

      usuarios.forEach((usuario) => {
        if (usuario.perfil === 'paciente') {
          pacientes.push(usuario);
        } else if (usuario.perfil === 'especialista') {
          especialistas.push(usuario);
        } else if (usuario.perfil === 'admin') {
          admins.push(usuario);
        }
      });

      this.listaUsuarios = pacientes.slice(0, 3).concat(especialistas.slice(0, 2), admins.slice(0, 1));
    });
  }
  clickListado(usuario: any) {
    this.botonClickeado.emit(usuario);
  }
}
