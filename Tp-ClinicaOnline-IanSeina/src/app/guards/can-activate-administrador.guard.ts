import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { User } from '../clases/user';

@Injectable({
  providedIn: 'root',
})
export class CanActivateAdministradorGuard implements CanActivate {
  usuarioLogueado: any;
  constructor(
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private afAuth: AngularFireAuth,
    private angularFirestore: AngularFirestore,
  ) {
    this.afAuth.authState.subscribe((user: any) => {
    if(user) {
      const usuariosCollection: AngularFirestoreCollection<User> = this.angularFirestore.collection<User>('usuarios');
      const usuarioQuery = usuariosCollection.ref.where('mail', '==', user.email).limit(1);
      usuarioQuery.get().then((querySnapshot) => {
        if (querySnapshot.empty) {
          this.authService.isLogged = false;
        } else {
          this.usuarioLogueado = querySnapshot.docs[0].data() as User;
          if (this.usuarioLogueado.perfil == 'admin') {
            this.authService.isAdmin = true;
          }
        }
      }).catch((error) => {
      });
    }
  });
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    if (this.authService.isAdmin) {
      return true;
    }
    this.notificationService.showWarning(
      'No puedes ingresar a esta sección si no eres Administrador',
      'Usuarios'
    );
    this.router.navigate(['']);
    return false;
  }
}