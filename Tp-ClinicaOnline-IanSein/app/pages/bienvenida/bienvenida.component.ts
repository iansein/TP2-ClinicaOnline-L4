import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { User } from 'src/app/clases/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-bienvenida',
  templateUrl: './bienvenida.component.html',
  styleUrls: ['./bienvenida.component.scss'],
})
export class BienvenidaComponent implements OnInit {
  usuarioLogueado: any;
  user: any = null;
  spinner: boolean = false;
  listaUsuarios: any;
  isPaciente: boolean = false;
  isEspecialista: boolean = false;
  constructor(private router: Router, public authService: AuthService, public afAuth: AngularFireAuth, public angularFirestore: AngularFirestore) { }

  ngOnInit(): void {

    this.afAuth.authState.subscribe((user: any) => {
      if (user) {
        const usuariosCollection: AngularFirestoreCollection<User> = this.angularFirestore.collection<User>('usuarios');
        const usuarioQuery = usuariosCollection.ref.where('mail', '==', user.email).limit(1);
        usuarioQuery.get().then((querySnapshot) => {
          if (querySnapshot.empty) {
          } else {
            this.usuarioLogueado = querySnapshot.docs[0].data() as User;
            if (this.usuarioLogueado.perfil == 'admin') {
              this.authService.isAdmin = true;

            }
            else if (this.usuarioLogueado.perfil == 'paciente') {
              this.isPaciente = true;

            }
            else {
              this.isEspecialista = true;

            }
          }
        }).catch((error) => {
        });
      } else {
        this.authService.isAdmin = false;
        this.isPaciente = false;
        this.isEspecialista = false;
      }
    });

    this.authService.getUsers().subscribe((usuarios) => {
      this.listaUsuarios = usuarios;
    });

    this.spinner = true;
    setTimeout(() => {
      this.spinner = false;
    }, 1500);

    this.authService.user$.subscribe((user: any) => {
      if (user) {
        if (user.logueado) {
          setTimeout(() => {
            this.user = user;
            this.authService.isLogged = true;
          }, 2000)
        }
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/registro']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
