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

const routes: Routes = [
  {path: 'registro',component: RegistroComponent},
  { path: 'login', component: LoginComponent},
  { path: '', component: BienvenidaComponent },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [CanActivateAdministradorGuard] },
  { path: 'usuarios-inicio', component: UsuariosInicioComponent },
  { path: 'mis-turnos', component: MisTurnosComponent },
  { path: 'turnos', component: TurnosComponent, canActivate: [CanActivateAdministradorGuard] },
  { path: 'solicitar-turno', component: SolicitarTurnoComponent },
  { path: 'mi-perfil', component: MiPerfilComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
