import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/clases/user';
import { AuthService } from 'src/app/services/auth.service';
import { FirestoreService } from 'src/app/services/firestore.service';
import { NotificationService } from 'src/app/services/notification.service';


@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss'],
})
export class UsuariosComponent implements OnInit {
  usersList: any[] = [];
  createrUserMenu: boolean = false;
  formPaciente: boolean = false;
  formEspecialista: boolean = false;
  formAdministrador: boolean = false;
  spinner: boolean = false;
  especialidades: string[] = [];
  listaFiltrada: string[] = [];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    public firestoreService: FirestoreService,
  ) {}

  ngOnInit(): void {
    this.spinner = true;
    this.authService.getUsers().subscribe((users) => {
      if (users) {
        this.usersList = users;
        this.spinner = false;
      }
    });
    this.listaFiltrada = [];
    this.firestoreService.traerEspecialidades().subscribe((data: any[]) => {
      this.especialidades = data.map((doc: any) => doc.nombre);
      this.listaFiltrada = [...this.especialidades];
    });
  }

  updateUser(user: User, option: number) {
    if (user.perfil == 'especialista') {
      if (option == 1) {
        user.aprobado = true;
        this.authService.updateUser(user);
        this.notificationService.showSuccess(
          'Especialista Habilitado',
          'Administrador'
        );
      } else if (option == 2) {
        user.aprobado = false;
        this.authService.updateUser(user);
        this.notificationService.showSuccess(
          'Especialista Deshabilitado',
          'Administrador'
        );
      }
    }
  }

  showCreateUserMenu() {
    this.spinner = true;
    setTimeout(() => {
      this.spinner = false;
    }, 1500);
    this.createrUserMenu = true;
  }

  showUserList() {
    this.createrUserMenu = false;
    this.formPaciente = false;
    this.formEspecialista = false;
    this.formAdministrador = false;
  }

  goToFormPaciente() {
    this.formPaciente = true;
  }

  goToFormEspecialista() {
    this.formEspecialista = true;
  }

  goToFormAdministrador() {
    this.formAdministrador = true;
  }

  goToRegistro() {
    this.formPaciente = false;
    this.formEspecialista = false;
    this.formAdministrador = false;
  }

}