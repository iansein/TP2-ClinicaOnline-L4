import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { Router } from '@angular/router';
import { User } from 'src/app/clases/user';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';


@Component({
  selector: 'app-solicitar-turno',
  templateUrl: './solicitar-turno.component.html',
  styleUrls: ['./solicitar-turno.component.scss'],
})
export class SolicitarTurnoComponent implements OnInit {
  user: any = null;
  isPaciente: boolean = false;
  spinner: boolean = false;

  especialistasList: any[] = [];
  pacientesList: any[] = [];
  nuevoArrayDeTurnos: any[] = [];
  activeEspecialista: any = null;
  activePaciente: any = null;
  speciality: any = null;
  specialistSelectionMenu: boolean = true;
  patientSelectionMenu: boolean = false;
  turnsSelectionMenu: boolean = false;

  currentSpecialistTurnList: any[] = [];
  turnosAMostrar: any[] = [];
  turnosDeUnDiaAMostrar: any[] = [];
  diasAMostrar: any[] = [];
  botonPedirTurno: boolean = false;
  turnoSeleccionado: any = null;

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
    private afAuth: AngularFireAuth,
    public angularFirestore: AngularFirestore,
  ) { }

  ngOnInit(): void {
    this.spinner = true;
    this.afAuth.authState.subscribe((user: any) => {
      if (user) {
        const usuariosCollection: AngularFirestoreCollection<User> = this.angularFirestore.collection<User>('usuarios');
        const usuarioQuery = usuariosCollection.ref.where('mail', '==', user.email).limit(1);
        usuarioQuery.get().then((querySnapshot) => {
          if (querySnapshot.empty) {
            // Realiza alguna acción si el querySnapshot está vacío
          } else {
            this.user = querySnapshot.docs[0].data() as User;
            this.authService.isLogged = true;
            if (this.user.perfil == 'admin') {
              this.authService.isAdmin = true;
              this.patientSelectionMenu = true;
            } else if (this.user.perfil == 'paciente') {
              this.isPaciente = true;
            } else {
              this.router.navigate(['']);
            }
            this.authService.getUsers().subscribe((users) => {
              if (users) {
                this.especialistasList = users.filter((u) => u.perfil == 'especialista' && u.aprobado);
                this.pacientesList = users.filter((u) => u.perfil == 'paciente');
                this.authService.getTurnList().subscribe((turnosEspecialista) => {
                  this.currentSpecialistTurnList = turnosEspecialista;
                  this.spinner = false;
                });
              } else {
                this.spinner = false;
              }
            });
          }
        }).catch((error) => {
          // Realiza alguna acción en caso de error
        });
      } else {
        this.spinner = false;
      }
    });
  }

  showSpeciality(esp: any) {
    this.specialistSelectionMenu = false;
    this.activeEspecialista = esp;
    console.log(esp);
  }

  showPatient(paciente: any) {
    this.patientSelectionMenu = false;
    this.activePaciente = paciente;
    console.log(paciente);
  }

  showTurns(especialidad: any) {
    this.turnsSelectionMenu = true;
    this.speciality = especialidad;
    this.loadFreeHours('');
    this.turnosAMostrar.forEach((t) => {
      this.diasAMostrar.push(t.fecha);
    });

    const aux: any[] = [];
    this.diasAMostrar.forEach((d) => {
      for (let i = 0; i < this.diasAMostrar.length; i++) {
        const fecha = this.diasAMostrar[i];
        if (
          d.getMonth() === fecha.getMonth() &&
          d.getDate() === fecha.getDate()
        ) {
          if (
            !aux.some((a) => {
              return (
                d.getMonth() === a.getMonth() && d.getDate() === a.getDate()
              );
            })
          ) {
            aux.push(d);
          }
        }
      }
    });

    aux.sort((a, b) => a - b);
    this.diasAMostrar = [...aux];
  }


  loadFreeHoursOneDay(date: Date) {
    this.spinner = true;
    this.turnosDeUnDiaAMostrar = [];
    setTimeout(() => {
      const currentDate = new Date();
      const listaTurnosDelEspecialista = this.currentSpecialistTurnList.filter(
        (t) => t.especialista.mail == this.activeEspecialista.mail
      );
      const turnosEspecialidad =
        // listaTurnosDelEspecialista[0].turnos =
        listaTurnosDelEspecialista[0].turnos.filter((t: any) => {
          return (
            t.especialidad == this.speciality.nombre &&
            currentDate.getTime() < new Date(t.fecha.seconds * 1000).getTime()
          );
        });
      // console.log(listaTurnosDelEspecialista[0].turnos);
      // console.log(turnosEspecialidad);
      const turnosDeUndia: any[] = [];
      for (let i = 0; i < turnosEspecialidad.length; i++) {
        const turno = { ...turnosEspecialidad[i] };
        if (
          new Date(turno.fecha.seconds * 1000).getTime() <=
          currentDate.getTime() + 84600000 * 15 &&
          new Date(turno.fecha.seconds * 1000).getDate() == date.getDate() &&
          turno.estado == 'disponible'
        ) {
          turno.fecha = new Date(turno.fecha.seconds * 1000);
          turnosDeUndia.push(turno);
        }
      }
      this.spinner = false;
      return this.turnosDeUnDiaAMostrar = [...turnosDeUndia];
    }, 500);
  }

  loadFreeHours(day: string) {
    // console.log(day);
    const currentDate = new Date();
    const listaTurnosDelEspecialista = this.currentSpecialistTurnList.filter(
      (t) => t.especialista.mail == this.activeEspecialista.mail
    );
    const turnosEspecialidad =
      // listaTurnosDelEspecialista[0].turnos =
      listaTurnosDelEspecialista[0].turnos.filter((t: any) => {
        return (
          t.especialidad == this.speciality.nombre &&
          currentDate.getTime() < new Date(t.fecha.seconds * 1000).getTime()
        );
      });
    // console.log(listaTurnosDelEspecialista[0].turnos);
    // console.log(turnosEspecialidad);
    const turnos15dias: any[] = [];
    for (let i = 0; i < turnosEspecialidad.length; i++) {
      const turno = { ...turnosEspecialidad[i] };
      if (
        new Date(turno.fecha.seconds * 1000).getTime() <=
        currentDate.getTime() + 84600000 * 15 &&
        turno.estado == 'disponible'
      ) {
        turno.fecha = new Date(turno.fecha.seconds * 1000);
        turnos15dias.push(turno);
      }
    }
    console.log(turnos15dias);
    this.turnosAMostrar = [...turnos15dias];
  }

  seleccionarTurno(turno: any) {
    this.turnoSeleccionado = turno;
    this.botonPedirTurno = true;
    this.notificationService.showInfo('Se ha seleccionado un turno', 'TURNOS');
  }

  solicitarTurno() {
    if (this.isPaciente) {
      this.turnoSeleccionado.paciente = this.user;
      this.turnoSeleccionado.estado = 'solicitado';
    } else {
      this.turnoSeleccionado.paciente = this.activePaciente;
      this.turnoSeleccionado.estado = 'solicitado';
    }
    for (let i = 0; i < this.currentSpecialistTurnList.length; i++) {
      const turnosEspecialista = this.currentSpecialistTurnList[i];
      const index = turnosEspecialista.turnos.findIndex((t: any) => {
        return (
          new Date(t.fecha.seconds * 1000).getTime() ==
          this.turnoSeleccionado.fecha.getTime() &&
          t.especialidad == this.turnoSeleccionado.especialidad
        );
      });
      turnosEspecialista.turnos[index] = this.turnoSeleccionado;
      this.authService.updateTurnList(turnosEspecialista);
    }
    this.turnosAMostrar = [];
    this.turnosDeUnDiaAMostrar = [];
    this.botonPedirTurno = false;
    this.spinner = true;
    setTimeout(() => {
      this.spinner = false;
      this.notificationService.showSuccess('Se ha solicitado el turno exitosamente', 'TURNOS');
      this.loadFreeHours('');
    }, 1000);
  }
}