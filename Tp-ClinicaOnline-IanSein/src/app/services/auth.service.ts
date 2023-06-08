import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { User } from '../clases/user';
import { NotificationService } from './notification.service';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AngularFireModule } from '@angular/fire/compat';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  user$: any;
  isAdmin: boolean = false;
  isLogged: boolean = false;
  usuarioLogueado: any;

  constructor(
    private angularFireAuth: AngularFireAuth,
    private angularFirestore: AngularFirestore,
    private notifyService: NotificationService,
    private router: Router,
    private afAuth: AngularFireAuth,
  ) {
    this.user$ = this.angularFireAuth.authState.pipe(
      switchMap((user: any) => {
        if (user) {
          return this.angularFirestore
            .doc<User>(`usuarios/${user.uid}`)
            .valueChanges();
        } else {
          return of(null);
        }
      })
    );
  }

registerNewUser(newUser: User) {
  if (this.isAdmin) {
    var config = {
      apiKey: "AIzaSyDi_YJN8wyAfNwMtX5dLgCDeQZRpoNJiQ4",
      authDomain: "clinicaonline-labo4.firebaseapp.com",
      projectId: "clinicaonline-labo4",
      storageBucket: "clinicaonline-labo4.appspot.com",
      messagingSenderId: "899902112163",
      appId: "1:899902112163:web:e6221290ed68b7301e5a16",
      measurementId: "G-F029LSC929"
    };
    const secondaryApp = firebase.initializeApp(config, "Secondary");
    const secondaryAuth = secondaryApp.auth();
    
    secondaryApp.auth().createUserWithEmailAndPassword(newUser.mail, newUser.password)
      .then((data: any) => {
        const uid = data.user?.uid;
        const documento = this.angularFirestore.doc('usuarios/' + uid);
        
        documento.set({
          id: uid,
          perfil: newUser.perfil,
          nombre: newUser.nombre,
          apellido: newUser.apellido,
          edad: newUser.edad,
          dni: newUser.dni,
          obraSocial: newUser.obraSocial,
          especialidad: newUser.especialidad,
          mail: newUser.mail,
          password: newUser.password,
          imagen1: newUser.imagen1,
          imagen2: newUser.imagen2,
          aprobado: newUser.aprobado,
        })
          .then(() => {
            data.user?.sendEmailVerification();
            this.notifyService.showSuccessSwal("Por favor, revisa tu bandeja de entrada del correo electrónico para confirmar y activar tu cuenta.", "Registro exitoso");
          })
          .catch((error) => {
            this.notifyService.showError(this.createMessage(error.code), 'Error');
          })
          .finally(() => {
            secondaryApp.auth().signOut();
            secondaryApp.delete();
          });
      })
      .catch((error: any) => {
        this.notifyService.showError(this.createMessage(error.code), 'Error');
      });
  } else {
    this.angularFireAuth.createUserWithEmailAndPassword(newUser.mail,  newUser.password).then((data) =>{
      data.user?.sendEmailVerification();

      const documento = this.angularFirestore.doc('usuarios/' + this.angularFirestore.createId());
      const uid = documento.ref.id;

      documento.set({
          id: uid,
          perfil: newUser.perfil,
          nombre: newUser.nombre,
          apellido: newUser.apellido,
          edad: newUser.edad,
          dni: newUser.dni,
          obraSocial: newUser.obraSocial,
          especialidad: newUser.especialidad,
          mail: newUser.mail,
          password: newUser.password,
          imagen1: newUser.imagen1,
          imagen2: newUser.imagen2,
          aprobado: newUser.aprobado,
      })
      .then(() => {
        data.user?.sendEmailVerification();
        this.notifyService.showSuccessSwal("Por favor, revisa tu bandeja de entrada del correo electrónico para confirmar y activar tu cuenta.", "Registro exitoso");
      })
        .catch(() => {
        //@ts-ignore
        this.notifyService.showError(this.createMessage(error.code), 'Error');
      })
    })
      .catch(() => {
      //@ts-ignore
      this.notifyService.showError(this.createMessage(error.code), 'Error');
    })
  }
}

  updateUser(userMod: any) {
    this.angularFirestore
      .doc<any>(`usuarios/${userMod.id}`)
      .update(userMod)
      .then(() => {})
      .catch((error) => {
        this.notifyService.showError('Ocurrio un error', 'Administrador');
      });
  }

  async userLogin(email: string, password: string) {
    try {
      return await this.angularFireAuth.signInWithEmailAndPassword(
        email,
        password
      );
    } catch (error: any) {
      console.log(error.code);
      this.notifyService.showError(
        'Email y/o contraseña invalidos',
        'Inicio fallido'
      );

      throw error;

      return null;
    }
  } 

  userLogout() {
    this.isAdmin = false;
    this.isLogged = false;
    this.angularFireAuth.signOut();
  }

  private createMessage(errorCode: string): string {
    let message: string = '';
    switch (errorCode) {
      case 'auth/internal-error':
        message = 'Los campos estan vacios';
        break;
      case 'auth/operation-not-allowed':
        message = 'La operación no está permitida.';
        break;
      case 'auth/email-already-in-use':
        message = 'El email ya está registrado.';
        break;
      case 'auth/invalid-email':
        message = 'El email no es valido.';
        break;
      case 'auth/weak-password':
        message = 'La contraseña debe tener al menos 6 caracteres';
        break;
      default:
        message = 'Error al crear el usuario.';
        break;
    }

    return message;
  }

  getUserLogged() {
    return this.angularFireAuth.authState;
  } 

  getUsers() {
    const collection = this.angularFirestore.collection<any>('usuarios');
    return collection.valueChanges();
  }

  getCollection(collectionName: string) {
    const collection = this.angularFirestore.collection<any>(collectionName);
    return collection.valueChanges();
  } 
}