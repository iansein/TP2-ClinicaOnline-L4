import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { RegistroComponent } from './pages/registro/registro.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { BienvenidaComponent } from './pages/bienvenida/bienvenida.component';
import { NavbarComponent } from './componentes/navbar/navbar.component';
import { AltaEspecialistaComponent } from './componentes/alta-especialista/alta-especialista.component';
import { AltaPacienteComponent } from './componentes/alta-paciente/alta-paciente.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFirestoreModule } from '@angular/fire/compat/firestore';
import { environment } from 'src/environments/environment.development';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { ToastrModule } from 'ngx-toastr';
import { AltaAdministradorComponent } from './componentes/alta-administrador/alta-administrador.component';
import { EspecialidadesComponent } from './componentes/especialidades/especialidades.component';
import { UsuariosInicioComponent } from './componentes/usuarios-inicio/usuarios-inicio.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegistroComponent,
    UsuariosComponent,
    BienvenidaComponent,
    NavbarComponent,
    AltaEspecialistaComponent,
    AltaPacienteComponent,
    AltaAdministradorComponent,
    EspecialidadesComponent,
    UsuariosInicioComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireStorageModule,
    ToastrModule.forRoot({
      preventDuplicates: true,
    }),
    BrowserAnimationsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
