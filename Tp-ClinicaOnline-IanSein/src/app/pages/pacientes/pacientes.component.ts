import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { User } from 'src/app/clases/user';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-pacientes',
  templateUrl: './pacientes.component.html',
  styleUrls: ['./pacientes.component.scss'],
})
export class PacientesComponent implements OnInit {
  spinner: boolean = false;
  user: any = null;
  usersList: any[] = [];
  turnosDelPaciente: any;
  turnosDelEspecialista: any;
  currentSpecialistTurnList: any;
  pacientesAtendidos: any[] = [];
  turnosFiltrados: any;
  turnList: any;
  pacientesDelEspecialista: any;
  auxPacientesDelEspecialista: any;
  isPaciente: any;
  isEspecialista: any;
  usuarioLogueado: any;
  listaDeEspecialistas: any;


  historialClinico: any[] = [];
  historialActivo: any[] = [];
  historialClinicoDelEspecialista: any[] = [];
  hayPacientesAtendidos: boolean = false;
  turnosActivos: any[] = [];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private afAuth: AngularFireAuth,
    private angularFirestore: AngularFirestore,
  ) { }

  ngOnInit(): void {
    this.spinner = true;
    this.authService.user$.subscribe((user: any) => {
      if (user) {
        this.user = user;
        this.authService.isLogged = true;
      }
      this.authService.getUsers().subscribe((users) => {
        if (users) {
          this.usersList = users;
        }
        this.authService.getHistorialesClinicos().subscribe((historial) => {
          this.historialClinico = historial;
          this.pacientesAtendidos = [];
          this.historialClinicoDelEspecialista = [];
          historial.forEach((h) => {
            for (let i = 0; i < this.usersList.length; i++) {
              const usuario = this.usersList[i];
              if (
                usuario.perfil == 'paciente' &&
                usuario.id == h.paciente.id &&
                this.user.id == h.especialista.id
              ) {
                this.usersList[i].historial = true;
                this.pacientesAtendidos = this.pacientesAtendidos.filter(
                  (p) => {
                    return p.id != usuario.id;
                  }
                );
                this.pacientesAtendidos.push(usuario);
                // console.log(this.usersList[i]);
              }
            }
          });

          this.historialClinicoDelEspecialista = this.historialClinico.filter(
            (h) => {
              return h.especialista.id == user.id;
            }
          );

          this.historialClinicoDelEspecialista.forEach((h) => {
            h.paciente.contadorHistorial = 0;
          });
          for (let i = 0; i < this.pacientesAtendidos.length; i++) {
            const paciente = this.pacientesAtendidos[i];
            paciente.contador = 0;
            this.historialClinicoDelEspecialista.forEach((h) => {
              if (paciente.id == h.paciente.id) {
                paciente.contador++;
                h.paciente.contador = paciente.contador;
              }
            });
          }

          if (this.pacientesAtendidos.length == 0) {
            this.hayPacientesAtendidos = false;
          } else {
            this.hayPacientesAtendidos = true;
          }
        });
      });
    });

    this.afAuth.authState.subscribe((user: any) => {
      if (user) {
        const usuariosCollection: AngularFirestoreCollection<User> = this.angularFirestore.collection<User>('usuarios');
        const usuarioQuery = usuariosCollection.ref.where('mail', '==', user.email).limit(1);
        usuarioQuery.get().then((querySnapshot) => {
          if (querySnapshot.empty) {
            // Lógica en caso de que no se encuentre un usuario
          } else {
            this.usuarioLogueado = querySnapshot.docs[0].data() as User;
            if (this.usuarioLogueado.perfil === 'admin') {
              this.authService.isAdmin = true;
            } else if (this.usuarioLogueado.perfil === 'paciente') {
              this.isPaciente = true;
            } else {
              this.isEspecialista = true;
            }
            this.loadTurns(); // Cargar los turnos después de obtener el usuario logueado
          }
        }).catch((error) => {
          // Manejo de error en caso de fallo en la consulta
        });
      }
    });
    setTimeout(() => {
      this.spinner = false;
    }, 5000)
  }

  verHistorialPaciente(paciente: any) {
    this.historialActivo = [];
    this.turnosActivos = [];
    for (let i = 0; i < this.historialClinico.length; i++) {
      const historial = this.historialClinico[i];
      if (historial.paciente.id == paciente.id) {
        this.historialActivo.push(historial);
      }
    }
    for (let i = 0; i < this.turnosFiltrados.length; i++) {
      const turnoFiltrado = this.turnosFiltrados[i];
      if (turnoFiltrado.paciente.id == paciente.id) {
        this.turnosActivos.push(turnoFiltrado);
      }
    }
  }

  loadTurns() {
    this.authService.getTurnList().subscribe((turns: any) => {
      this.currentSpecialistTurnList = turns;
      this.turnList = [];
      this.turnosFiltrados = [];
      this.turnosDelPaciente = [];
      this.turnosDelEspecialista = [];
      this.pacientesDelEspecialista = [];
      this.auxPacientesDelEspecialista = [];

      for (let i = 0; i < turns.length; i++) {
        const turnSpecialist = turns[i].turnos;
        for (let j = 0; j < turnSpecialist.length; j++) {
          const turn = turnSpecialist[j];
          if (turn.estado !== 'disponible') {
            this.turnList.push(turn);
            if (turn.paciente?.id === this.usuarioLogueado?.id) {
              this.turnosDelPaciente.push(turn);
            }
            if (turn.especialista?.id === this.usuarioLogueado?.id) {
              this.turnosDelEspecialista.push(turn);
              this.auxPacientesDelEspecialista.push(turn.paciente);
            }
          }
        }
      }

      for (let i = 0; i < this.auxPacientesDelEspecialista.length; i++) {
        const paciente = this.auxPacientesDelEspecialista[i];
        const index = this.pacientesDelEspecialista.findIndex((p: any) => paciente.id === p.id);
        if (index === -1) {
          this.pacientesDelEspecialista.push(paciente);
        }
      }

      if (this.isPaciente) {
        this.turnosFiltrados = [...this.turnosDelPaciente];
      } else if (this.isEspecialista) {
        this.turnosFiltrados = [...this.turnosDelEspecialista];
      }

      // console.log(this.pacientesDelEspecialista);
      // console.log(this.turnosDelEspecialista);
      // console.log(this.turnosDelPaciente);
      // console.log(this.turnList);

    });
    this.authService.getUsers().subscribe((users) => {
      if (users) {
        this.listaDeEspecialistas = users.filter(
          (u) => u.perfil == 'especialista' && u.aprobado
        );
        console.log(this.listaDeEspecialistas);
      }
    });
  }
}