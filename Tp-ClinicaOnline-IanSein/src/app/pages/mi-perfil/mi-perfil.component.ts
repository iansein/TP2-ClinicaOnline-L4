import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { User } from 'src/app/clases/user';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';


@Component({
  selector: 'app-mi-perfil',
  templateUrl: './mi-perfil.component.html',
  styleUrls: ['./mi-perfil.component.scss'],
})
export class MiPerfilComponent implements OnInit {
  user: any = null;
  spinner: boolean = false;
  isPaciente: boolean = false;
  isEspecialista: boolean = false;
  specialistDays: any[] = [];

  especialidad1: boolean = true;
  especialidad2: boolean = false;

  lunes: boolean = false;
  martes: boolean = false;
  miercoles: boolean = false;
  jueves: boolean = false;
  viernes: boolean = false;
  sabado: boolean = false;
  turnDuration: number = 30;

  currentTurnList: any = {};

  historialClinico: any[] = [];
  historialClinicoFiltrado: any[] = [];
  hayHistorial: boolean = false;
  hayHistorialFiltrado: boolean = true;
  btnTodo: boolean = true;
  btnClinico: boolean = false;
  btnOdontologo: boolean = false;
  btnOftalmologo: boolean = false;

  fechaActual: Date = new Date();

  constructor(
    public authService: AuthService,
    private notificationService: NotificationService,
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
          this.user = querySnapshot.docs[0].data() as User;
          if (!querySnapshot.empty) {
            this.authService.isLogged = true;
            if (this.user.perfil == 'admin') {
              this.authService.isAdmin = true;
            } else if (this.user.perfil == 'paciente') {
              this.isPaciente = true;
              this.authService.getHistorialesClinicos().subscribe((historial) => {
                this.historialClinico = historial.filter((h) => h.paciente.id == this.user.id);
                this.hayHistorial = this.historialClinico.length > 0;
              });
            } else if (this.user.perfil == 'especialista') {
              this.isEspecialista = true;
              if (this.user.especialidad[0].diasTurnos) {
                this.specialistDays = [...this.user.especialidad[0].diasTurnos];
                this.turnDuration = this.user.especialidad[0].duracionTurno;
                this.activateDayButton();
                this.authService.getTurnList().subscribe((turnosEspecialista) => {
                  this.currentTurnList = turnosEspecialista.find((listaTurnos) => listaTurnos.especialista.mail == this.user.mail);
                });
              }
            }
          }
          this.spinner = false;
        }).catch((error) => {
          // Realiza alguna acción en caso de error
          this.spinner = false;
        });
      } else {
        this.spinner = false;
      }
    });
  }

  addDay(day: string) {
    if (this.especialidad1) {
      if (
        !this.specialistDays.some((d) => d == day) &&
        !this?.user?.especialidad[1]?.diasTurnos?.some((d: any) => d == day)
      ) {
        this.specialistDays.push(day);
        this.notificationService.showInfo('Se ha asignado un Día', 'MI PERFIL');
        this.activateDeactivateDayButton(day);
      } else if (this.specialistDays.some((d) => d == day)) {
        const index = this.specialistDays.indexOf(day);
        this.specialistDays.splice(index, 1);
        this.notificationService.showInfo(
          'Se cancelo la asignación del día',
          'MI PERFIL'
        );
        this.activateDeactivateDayButton(day);
      } else {
        this.notificationService.showWarning(
          'Este día ya esta asignado para otra especialidad',
          'MI PERFIL'
        );
      }
    } else if (this.especialidad2) {
      if (
        !this.specialistDays.some((d) => d == day) &&
        !this.user.especialidad[0].diasTurnos.some((d: any) => d == day)
      ) {
        this.specialistDays.push(day);
        this.notificationService.showInfo('Se ha asignado un Día', 'MI PERFIL');
        this.activateDeactivateDayButton(day);
      } else if (this.specialistDays.some((d) => d == day)) {
        const index = this.specialistDays.indexOf(day);
        this.specialistDays.splice(index, 1);
        this.notificationService.showInfo(
          'Se cancelo la asignación del día',
          'MI PERFIL'
        );
        this.activateDeactivateDayButton(day);
      } else {
        this.notificationService.showWarning(
          'Este día ya esta asignado para otra especialidad',
          'MI PERFIL'
        );
      }
    }
    // console.log(this.specialistDays);
  }

  activateDeactivateDayButton(day: string) {
    switch (day) {
      case 'lunes':
        this.lunes = !this.lunes;
        break;
      case 'martes':
        this.martes = !this.martes;
        break;
      case 'miércoles':
        this.miercoles = !this.miercoles;
        break;
      case 'jueves':
        this.jueves = !this.jueves;
        break;
      case 'viernes':
        this.viernes = !this.viernes;
        break;
      case 'sábado':
        this.sabado = !this.sabado;
        break;
    }
  }

  activateDayButton() {
    this.specialistDays.forEach((day) => {
      switch (day) {
        case 'lunes':
          this.lunes = true;
          break;
        case 'martes':
          this.martes = true;
          break;
        case 'miércoles':
          this.miercoles = true;
          break;
        case 'jueves':
          this.jueves = true;
          break;
        case 'viernes':
          this.viernes = true;
          break;
        case 'sábado':
          this.sabado = true;
          break;
      }
    });
  }

  deactivateDayButton() {
    this.specialistDays.forEach((day) => {
      switch (day) {
        case 'lunes':
          this.lunes = false;
          break;
        case 'martes':
          this.martes = false;
          break;
        case 'miércoles':
          this.miercoles = false;
          break;
        case 'jueves':
          this.jueves = false;
          break;
        case 'viernes':
          this.viernes = false;
          break;
        case 'sábado':
          this.sabado = false;
          break;
      }
    });
  }

  updateUser() {
    let esp: any = {};
    if (this.especialidad1) {
      esp.nombre = this.user.especialidad[0].nombre;
      esp.diasTurnos = [...this.specialistDays];
      esp.duracionTurno = this.turnDuration;
      this.user.especialidad[0] = esp;
    } else if (this.especialidad2) {
      esp.nombre = this.user.especialidad[1].nombre;
      esp.diasTurnos = [...this.specialistDays];
      esp.duracionTurno = this.turnDuration;
      this.user.especialidad[1] = esp;
    }

    // *******************************************************************
    // *******************************************************************
    // *******************************************************************

    const listaDeTurnos: any[] = [];
    const currentDate = new Date();
    const turnDuration = this.turnDuration * 60000;

    for (let i = 0; i < this.specialistDays.length; i++) {
      const day = this.specialistDays[i];
      let dayNumber = 0;
      switch (day) {
        case 'lunes':
          dayNumber = 1;
          break;
        case 'martes':
          dayNumber = 2;
          break;
        case 'miércoles':
          dayNumber = 3;
          break;
        case 'jueves':
          dayNumber = 4;
          break;
        case 'viernes':
          dayNumber = 5;
          break;
        case 'sábado':
          dayNumber = 6;
          break;
      }

      // CREACION DE TURNOS
      for (let j = 1; j <= 60; j++) {
        const date = new Date(currentDate.getTime() + 84600000 * j);
        if (date.getDay() == dayNumber) {
          let turnDay = new Date(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            8
          );
          let turnoNew: any = {};
          turnoNew.estado = 'disponible';
          if (this.especialidad1) {
            turnoNew.especialidad = this.user.especialidad[0].nombre;
          } else {
            turnoNew.especialidad = this.user.especialidad[1].nombre;
          }
          turnoNew.especialista = this.user;
          turnoNew.paciente = null;
          turnoNew.fecha = new Date(turnDay.getTime());
          listaDeTurnos.push(turnoNew);
          while (turnDay.getHours() < 19) {
            turnoNew = {};
            turnDay = new Date(turnDay.getTime() + turnDuration);
            if (turnDay.getHours() != 19) {
              turnoNew.estado = 'disponible';
              if (this.especialidad1) {
                turnoNew.especialidad = this.user.especialidad[0].nombre;
              } else {
                turnoNew.especialidad = this.user.especialidad[1].nombre;
              }
              turnoNew.especialista = this.user;
              turnoNew.paciente = null;
              turnoNew.fecha = new Date(turnDay.getTime());
              listaDeTurnos.push(turnoNew);
            }
          }
        }
      }
    }

    // CREACION DE LISTA DE TURNOS DEL ESPECIALISTA, ESTO SE GUARDA EN LA BD
    const turno: any = {};
    //@ts-ignore
    if (this.currentTurnList?.id) {
      //@ts-ignore
      turno.id = this.currentTurnList.id;
    }
    turno.especialista = this.user;
    turno.turnos = listaDeTurnos;

    //@ts-ignore
    if (this.currentTurnList?.turnos?.length) {
      let especialidad: string = '';
      if (this.especialidad1) {
        especialidad = this.user.especialidad[0].nombre;
      } else {
        especialidad = this.user.especialidad[1].nombre;
      }
      //@ts-ignore
      this.currentTurnList.turnos = this.currentTurnList.turnos.filter(
        (t: any) => {
          return (
            (t.estado != 'disponible' && t.especialidad == especialidad) ||
            t.especialidad != especialidad
          );
        }
      );

      //@ts-ignore
      turno.turnos = [...this.currentTurnList.turnos];
      for (let i = 0; i < listaDeTurnos.length; i++) {
        const newTurn = listaDeTurnos[i];
        turno.turnos.push(newTurn);
      }
      this.authService.updateTurnList(turno);
    } else {
      this.authService.createTurnList(turno);
    }

    this.authService.updateUser(this.user);
    this.showTurnsOne();
    this.notificationService.showSuccess('Se han actualizado los horarios', 'MI PERFIL');
  }

  showTurnsOne() {
    if (!this.especialidad1) {
      this.especialidad1 = true;
      this.especialidad2 = false;
      this.turnDuration = this.user.especialidad[0].duracionTurno;
      this.deactivateDayButton();
      this.specialistDays = [...this.user.especialidad[0].diasTurnos];
      this.activateDayButton();
    }
  }

  showTurnsTwo() {
    if (!this.especialidad2) {
      this.especialidad1 = false;
      this.especialidad2 = true;
      this.turnDuration = this.user.especialidad[1].duracionTurno;
      this.deactivateDayButton();
      this.specialistDays = [...this.user.especialidad[1].diasTurnos];
      this.activateDayButton();
    }
  }

  verHistorialClinico() {
    this.historialClinicoFiltrado = [...this.historialClinico];
  }

  filtrarHistorialClinico(especialidad: string) {
    switch (especialidad) {
      case 'todo':
        this.btnTodo = true;
        this.btnClinico = false;
        this.btnOdontologo = false;
        this.btnOftalmologo = false;
        break;
      case 'clinico':
        this.btnTodo = false;
        this.btnClinico = true;
        this.btnOdontologo = false;
        this.btnOftalmologo = false;
        break;
      case 'odontologo':
        this.btnTodo = false;
        this.btnClinico = false;
        this.btnOdontologo = true;
        this.btnOftalmologo = false;
        break;
      case 'oftalmologo':
        this.btnTodo = false;
        this.btnClinico = false;
        this.btnOdontologo = false;
        this.btnOftalmologo = true;
        break;
    }

    this.historialClinicoFiltrado = [];
    if (especialidad == 'todo') {
      this.historialClinicoFiltrado = [...this.historialClinico];
    } else {
      for (let i = 0; i < this.historialClinico.length; i++) {
        const historial = this.historialClinico[i];
        if (historial.especialidad == especialidad) {
          this.historialClinicoFiltrado.push(historial);
        }
      }
    }

    if (this.historialClinicoFiltrado.length == 0) {
      this.hayHistorialFiltrado = false;
    } else {
      this.hayHistorialFiltrado = true;
    }
  }

}