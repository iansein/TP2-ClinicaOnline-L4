import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { User } from 'src/app/clases/user';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  usuarioLogueado: any = null;
  spinner: boolean = false;
  isPaciente: boolean = false;
  isEspecialista: boolean = false;

  constructor(private router: Router, public authService: AuthService, public afAuth: AngularFireAuth, public angularFirestore: AngularFirestore, private notify: NotificationService) { }


  ngOnInit(): void {
    this.afAuth.authState.subscribe((user: any) => {
      if (user) {
        const usuariosCollection: AngularFirestoreCollection<User> = this.angularFirestore.collection<User>('usuarios');
        const usuarioQuery = usuariosCollection.ref.where('mail', '==', user.email).limit(1);
        usuarioQuery.get().then((querySnapshot) => {
          if (querySnapshot.empty) {
          } else {
            this.usuarioLogueado = querySnapshot.docs[0].data() as User;
            if (this.usuarioLogueado.perfil == 'paciente' && this.usuarioLogueado.aprobado) {
              this.authService.isLogged = true;
            }
            if (this.usuarioLogueado.perfil == 'admin') {
              this.authService.isAdmin = true;
            }
            else if (this.usuarioLogueado.perfil == 'paciente' && this.authService.isLogged) {
              this.isPaciente = true;
            }
            else if (this.usuarioLogueado.perfil == 'especialista' && this.usuarioLogueado.aprobado) {
              this.isEspecialista = true;
            }
            else {
              this.authService.isLogged = false;
              this.isEspecialista = false;
              this.isPaciente = false;
              this.authService.isAdmin = false;
            }
          }
        }).catch((error) => {
        });
      } else {
        this.authService.isLogged = false;
        this.authService.isAdmin = false;
        this.isPaciente = false;
        this.isEspecialista = false;
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/registro']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }

  logout() {
    this.spinner = true;
    setTimeout(() => {
      this.isPaciente = false;
      this.isEspecialista = false;
      this.authService.isAdmin = false;
      this.authService.userLogout();
      this.usuarioLogueado = null;
      this.spinner = false;
      this.authService.isLogged = false;
      this.router.navigate(['']);
      this.notify.showSuccess("Se cerró sesión exitosamente", "Cierre de sesión");
    }, 2000);
  }
}