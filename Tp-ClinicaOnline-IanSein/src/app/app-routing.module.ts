import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistroComponent } from './pages/registro/registro.component';
import { LoginComponent } from './pages/login/login.component';
import { BienvenidaComponent } from './pages/bienvenida/bienvenida.component';
import { UsuariosComponent } from './pages/usuarios/usuarios.component';
import { CanActivateAdministradorGuard } from './guards/can-activate-administrador.guard';
import { UsuariosInicioComponent } from './componentes/usuarios-inicio/usuarios-inicio.component';

const routes: Routes = [
  {path: 'registro',component: RegistroComponent},
  { path: 'login', component: LoginComponent},
  { path: '', component: BienvenidaComponent },
  { path: 'usuarios', component: UsuariosComponent, canActivate: [CanActivateAdministradorGuard] },
  { path: 'usuarios-inicio', component: UsuariosInicioComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
