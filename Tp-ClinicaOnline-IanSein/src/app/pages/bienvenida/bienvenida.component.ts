import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-bienvenida',
  templateUrl: './bienvenida.component.html',
  styleUrls: ['./bienvenida.component.scss'],
})
export class BienvenidaComponent implements OnInit {
  user: any = null;
  spinner: boolean = false;
  listaUsuarios: any;
  constructor(private router: Router, public authService: AuthService) {}

  ngOnInit(): void {
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
          },2000)
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
