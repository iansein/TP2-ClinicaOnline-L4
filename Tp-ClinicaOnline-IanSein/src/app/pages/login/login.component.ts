import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/services/notification.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/clases/user';
import { Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Subscription } from 'rxjs';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  @Input() usuario?: any;
  formLogin: FormGroup;
  userLogin: User = new User();
  spinner: boolean = false;
  notifyService: any;
  userLog: any = null;

  constructor(
    private formBuilder: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService,
    private router: Router,
    private angularFirestore: AngularFirestore,
    private afAuth: AngularFireAuth,
  ) {
    this.formLogin = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.spinner = true;
    setTimeout(() => {
      this.spinner = false;
    }, 1500);
  }
  loginUser() {
    if (this.formLogin.valid) {
      this.spinner = true;
      const email = this.formLogin.getRawValue().email;
      const password = this.formLogin.getRawValue().password;

      this.authService.userLogin(email, password)
        .then(async (data: any) => {
          this.authService.isLogged = false;
          const usuariosCollection: AngularFirestoreCollection<User> = this.angularFirestore.collection<User>('usuarios');
          const usuarioQuery = usuariosCollection.ref.where('mail', '==', email).limit(1);
          usuarioQuery.get().then((querySnapshot) => {
            if (querySnapshot.empty) {
              this.notificationService.showError(
                'No se encontró el usuario correspondiente.',
                'Inicio de Sesión'
              );
              this.authService.userLogout();
              this.spinner = false;
            } else {
              const usuarioLogueado = querySnapshot.docs[0].data() as User;
              if (!data.user.emailVerified) {
                data.user.sendEmailVerification();
                this.notificationService.showWarning(
                  'Debes verificar tu correo electrónico.',
                  'Inicio de Sesión'
                );
                this.authService.userLogout();
                this.authService.isLogged = false;
                this.spinner = false;
              } else if (usuarioLogueado.perfil === 'paciente' && data.user.emailVerified) {
                this.notificationService.showSuccess("Se ha iniciado sesión correctamente.", "Inicio de sesión");
                this.userLog = usuarioLogueado;
                setTimeout(() => {
                  this.authService.createUserLog(this.userLog);
                }, 3000);
                usuarioLogueado.aprobado = true;
                this.authService.updateUser(usuarioLogueado);
                this.authService.isLogged = true;
                this.router.navigate(['']);
              }
              else if (usuarioLogueado.perfil === 'especialista' && !usuarioLogueado.aprobado) {
                this.notificationService.showWarning(
                  'Tu cuenta no está aprobada por un administrador.',
                  'Inicio de Sesión'
                );
                this.authService.userLogout();
                this.authService.isLogged = false;
                this.spinner = false;

              } else {
                this.notificationService.showSuccess("Se ha iniciado sesión correctamente.", "Inicio de sesión");
                this.userLog = usuarioLogueado;
                setTimeout(() => {
                  this.authService.createUserLog(this.userLog);
                }, 3000);
                this.authService.isLogged = true;
                this.router.navigate(['']);

              }
            }
          }).catch((error) => {
            this.spinner = false;
          });
        })
        .catch((error) => {
          this.spinner = false;
        });
    } else {
      this.notificationService.showWarning(
        'Debes completar todos los campos requeridos',
        'Inicio de Sesión'
      );
    }
  }


  clickListado($event: any) {
    this.usuario = $event;
    this.formLogin.setValue({
      email: this.usuario.mail,
      password: this.usuario.password
    });
  }
}