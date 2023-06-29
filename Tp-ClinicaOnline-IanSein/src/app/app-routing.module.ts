import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistroComponent } from './pages/registro/registro.component';
import { LoginComponent } from './pages/login/login.component';
import { BienvenidaComponent } from './pages/bienvenida/bienvenida.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { CanActivateAdministradorGuard } from './guards/can-activate-administrador.guard';
import { UsuariosInicioComponent } from './componentes/usuarios-inicio/usuarios-inicio.component';
import { MisTurnosComponent } from './pages/mis-turnos/mis-turnos.component';
import { TurnosComponent } from './pages/turnos/turnos.component';
import { SolicitarTurnoComponent } from './pages/solicitar-turno/solicitar-turno.component';
import { MiPerfilComponent } from './pages/mi-perfil/mi-perfil.component';
import { PacientesComponent } from './pages/pacientes/pacientes.component';
import { InformesComponent } from './pages/informes/informes.component';

const routes: Routes = [
  {
    path: 'admin',
    component: UsuariosComponent,
    children: [{ path: 'usuarios', component: UsuariosComponent }],
  },
  {
    path: 'admin',
    component: TurnosComponent,
    children: [{ path: 'turnos', component: TurnosComponent }],
  },
  {
    path: 'admin',
    component: InformesComponent,
    children: [{ path: 'informes', component: InformesComponent }],
  },
  { path: 'registro', component: RegistroComponent, data: { animation: 'Registro' } },
  { path: 'login', component: LoginComponent, data: { animation: 'Login' } },
  { path: '', component: BienvenidaComponent, data: { animation: 'Home' } },
  { path: 'usuarios-inicio', component: UsuariosInicioComponent },
  { path: 'mis-turnos', component: MisTurnosComponent },
  { path: 'solicitar-turno', component: SolicitarTurnoComponent },
  { path: 'mi-perfil', component: MiPerfilComponent },
  { path: 'pacientes', component: PacientesComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
