import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { NotificationService } from 'src/app/services/notification.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { User } from 'src/app/clases/user';

@Component({
  selector: 'app-mis-turnos',
  templateUrl: './mis-turnos.component.html',
  styleUrls: ['./mis-turnos.component.scss'],
})
export class MisTurnosComponent implements OnInit {
  formHistorial: FormGroup;
  user: any = null;
  isPaciente: boolean = false;
  isEspecialista: boolean = false;
  spinner: boolean = false;
  turnList: any[] = [];
  currentSpecialistTurnList: any[] = [];
  usuarioLogueado: any;

  botonesEspecialidad: boolean = false;
  filtroEspecialidad: boolean = false;
  btnClinico: boolean = false;
  btnOdontologo: boolean = false;
  btnOftalmologo: boolean = false;
  listaPorEspecialidad: any[] = [];

  vistaListadoDeEspecialistas: boolean = false;
  listaDeEspecialistas: any[] = [];
  listaPorEspecialista: any[] = [];

  cancelacionTurno: boolean = false;
  comentarioCancelacion: string = '';
  turnoACancelar: any = {};

  turnosDelPaciente: any[] = [];
  turnosDelEspecialista: any[] = [];
  pacientesDelEspecialista: any[] = [];
  auxPacientesDelEspecialista: any[] = [];

  vistaComentario: boolean = false;
  turnoACalificar: any = {};
  vistaComentarioCalificacion: boolean = false;
  comentarioCalificacion: string = '';

  botonCancelar: boolean = true;
  botonRechazar: boolean = true;
  confirmacionRechazo: boolean = false;
  confirmacionFinalizacion: boolean = false;
  comentarioFinalizacion: string = '';
  turnoAFinalizar: any = {};

  turnoFinalizado: any = {};

  cantidadClaveValor: number = 0;
  arrayClaveValorAdicionales: any[] = [];
  dato1: string[] = ['', ''];
  dato2: string[] = ['', ''];
  dato3: string[] = ['', ''];

  palabraBusqueda: string = '';
  turnosFiltrados: any[] = [];

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private formBuilder: FormBuilder,
    private afAuth: AngularFireAuth,
    public angularFirestore: AngularFirestore,
  ) {
    this.formHistorial = this.formBuilder.group({
      altura: ['', [Validators.required]],
      peso: ['', [Validators.required]],
      temperatura: ['', [Validators.required]],
      presion: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.spinner = true;
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
        const index = this.pacientesDelEspecialista.findIndex((p) => paciente.id === p.id);
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

      this.spinner = false;
    });
    this.authService.getUsers().subscribe((users) => {
      this.spinner = false;
      if (users) {
        this.listaDeEspecialistas = users.filter(
          (u) => u.perfil == 'especialista' && u.aprobado
        );
        console.log(this.listaDeEspecialistas);
      }
    });
  }

  verBotonesEspecialidades() {
    this.botonesEspecialidad = !this.botonesEspecialidad;
    this.btnClinico = false;
    this.btnOdontologo = false;
    this.btnOftalmologo = false;
    this.vistaListadoDeEspecialistas = false;
    this.filtroEspecialidad = false;
  }

  filtrarPorEspecialidad(especialidad: string) {
    this.spinner = true;
    setTimeout(() => {
      this.activarBoton(especialidad);
      this.spinner = false;
      this.listaPorEspecialidad = [];
      this.filtroEspecialidad = true;
      for (let i = 0; i < this.turnosDelPaciente.length; i++) {
        const turno = this.turnosDelPaciente[i];
        if (turno.especialidad == especialidad) {
          this.listaPorEspecialidad.push(turno);
        }
      }
    }, 500);
  }

  filtrarPorEspecialidadDelEspecialista(especialidad: string) {
    this.spinner = true;
    setTimeout(() => {
      this.activarBoton(especialidad);
      this.spinner = false;
      this.listaPorEspecialidad = [];
      this.filtroEspecialidad = true;
      for (let i = 0; i < this.turnosDelEspecialista.length; i++) {
        const turno = this.turnosDelEspecialista[i];
        if (turno.especialidad == especialidad) {
          this.listaPorEspecialidad.push(turno);
        }
      }
    }, 500);
  }

  activarBoton(especialidad: string) {
    switch (especialidad) {
      case 'clinico':
        this.btnClinico = true;
        this.btnOdontologo = false;
        this.btnOftalmologo = false;
        break;
      case 'odontologo':
        this.btnClinico = false;
        this.btnOdontologo = true;
        this.btnOftalmologo = false;
        break;
      case 'oftalmologo':
        this.btnClinico = false;
        this.btnOdontologo = false;
        this.btnOftalmologo = true;
        break;
    }
  }

  verListaDeEspecialistas() {
    this.vistaListadoDeEspecialistas = !this.vistaListadoDeEspecialistas;
    this.listaPorEspecialista = [...this.turnosDelPaciente];
    this.botonesEspecialidad = false;
    this.btnClinico = false;
    this.btnOdontologo = false;
    this.btnOftalmologo = false;
    this.filtroEspecialidad = false;
  }

  elegirEspecialista(especialista: any) {
    this.spinner = true;
    setTimeout(() => {
      this.spinner = false;
      this.listaPorEspecialista = [];
      this.filtroEspecialidad = true;
      for (let i = 0; i < this.turnosDelPaciente.length; i++) {
        const turno = this.turnosDelPaciente[i];
        if (turno.especialista.id == especialista.id) {
          this.listaPorEspecialista.push(turno);
        }
      }
    }, 500);
  }

  verListaDePacientes() {
    this.vistaListadoDeEspecialistas = !this.vistaListadoDeEspecialistas;
    this.listaPorEspecialista = [...this.turnosDelEspecialista];
    this.botonesEspecialidad = false;
    this.filtroEspecialidad = false;
  }

  elegirPaciente(paciente: any) {
    this.spinner = true;
    setTimeout(() => {
      this.spinner = false;
      this.listaPorEspecialista = [];
      this.filtroEspecialidad = true;
      for (let i = 0; i < this.turnosDelEspecialista.length; i++) {
        const turno = this.turnosDelEspecialista[i];
        if (turno.paciente.id == paciente.id) {
          this.listaPorEspecialista.push(turno);
        }
      }
    }, 500);
  }

  cancelarTurno(turno: any) {
    this.turnoACancelar = { ...turno };
    this.cancelacionTurno = true;
    this.vistaComentario = false;
    this.vistaComentarioCalificacion = false;
    this.botonRechazar = !this.botonRechazar;
    this.confirmacionFinalizacion = false;
    console.log(turno);
  }

  confirmarCancelacion(turno: any) {
    if (this.comentarioCancelacion == '') {
      this.notificationService.showWarning(
        'Debes ingresar un comentario sobre la razón de la cancelación',
        'Turnos'
      );
    } else {
      if (this.botonCancelar) {
        turno.estado = 'cancelado';
      } else {
        turno.estado = 'rechazado';
      }
      turno.comentarioPaciente = this.comentarioCancelacion;
      for (let i = 0; i < this.currentSpecialistTurnList.length; i++) {
        const turnosEspecialista = this.currentSpecialistTurnList[i];
        const index = turnosEspecialista.turnos.findIndex((t: any) => {
          return (
            new Date(t.fecha.seconds * 1000).getTime() ==
            new Date(turno.fecha.seconds * 1000).getTime() &&
            t.especialidad == turno.especialidad
          );
        });
        turnosEspecialista.turnos[index] = turno;
        this.authService.updateTurnList(turnosEspecialista);
      }

      this.spinner = true;
      setTimeout(() => {
        this.spinner = false;
        this.turnoACancelar = {};
        this.cancelacionTurno = false;
        this.confirmacionFinalizacion = false;
        this.notificationService.showSuccess('Turno Cancelado', 'Turnos');
      }, 1000);
    }
  }

  cancelarTurnoEspecialista(turno: any) {
    this.turnoACancelar = { ...turno };
    this.cancelacionTurno = true;
    this.vistaComentario = false;
    this.vistaComentarioCalificacion = false;
    this.botonRechazar = !this.botonRechazar;
    this.confirmacionFinalizacion = false;
    console.log(turno);
  }

  confirmarCancelacionRechazoEspecialista(turno: any) {
    if (this.comentarioCancelacion == '') {
      this.notificationService.showWarning(
        'Debes ingresar un comentario sobre la razón de la cancelación o rechazo',
        'Turnos'
      );
    } else {
      if (this.botonCancelar) {
        turno.estado = 'cancelado';
      } else {
        turno.estado = 'rechazado';
      }
      turno.comentario = this.comentarioCancelacion;
      for (let i = 0; i < this.currentSpecialistTurnList.length; i++) {
        const turnosEspecialista = this.currentSpecialistTurnList[i];
        const index = turnosEspecialista.turnos.findIndex((t: any) => {
          return (
            new Date(t.fecha.seconds * 1000).getTime() ==
            new Date(turno.fecha.seconds * 1000).getTime() &&
            t.especialidad == turno.especialidad
          );
        });
        turnosEspecialista.turnos[index] = turno;
        this.authService.updateTurnList(turnosEspecialista);
      }

      this.spinner = true;
      setTimeout(() => {
        this.spinner = false;
        this.turnoACancelar = {};
        this.cancelacionTurno = false;
        this.confirmacionRechazo = false;
        this.confirmacionFinalizacion = false;
        this.notificationService.showSuccess('Turno Cancelado', 'Turnos');
      }, 1000);
    }
  }

  calificarTurno(turno: any) {
    this.turnoACalificar = { ...turno };
    this.vistaComentarioCalificacion = true;
    this.vistaComentario = false;
    this.confirmacionFinalizacion = false;
  }

  confirmarCalificacion(turno: any) {
    if (this.comentarioCalificacion == '') {
      this.notificationService.showWarning(
        'Debes ingresar un comentario para calificar.',
        'Turnos'
      );
    } else {
      turno.comentarioPaciente = this.comentarioCalificacion;
      for (let i = 0; i < this.currentSpecialistTurnList.length; i++) {
        const turnosEspecialista = this.currentSpecialistTurnList[i];
        const index = turnosEspecialista.turnos.findIndex((t: any) => {
          return (
            new Date(t.fecha.seconds * 1000).getTime() ==
            new Date(turno.fecha.seconds * 1000).getTime() &&
            t.especialidad == turno.especialidad
          );
        });
        turnosEspecialista.turnos[index] = turno;
        this.authService.updateTurnList(turnosEspecialista);
      }

      this.spinner = true;
      setTimeout(() => {
        this.spinner = false;
        this.turnoACalificar = {};
        this.vistaComentarioCalificacion = false;
        this.confirmacionFinalizacion = false;
        this.notificationService.showSuccess('Turno Calificado', 'Turnos');
      }, 1000);
    }
  }

  verComentario(turno: any) {
    this.turnoACancelar = { ...turno };
    this.vistaComentario = true;
    this.cancelacionTurno = false;
    this.vistaComentarioCalificacion = false;
    this.botonCancelar = true;
    this.confirmacionFinalizacion = false;
  }

  rechazarTurno(turno: any) {
    this.turnoACancelar = { ...turno };
    this.botonCancelar = !this.botonCancelar;
    this.vistaComentario = false;
    this.vistaComentarioCalificacion = false;
    this.cancelacionTurno = true;
    this.confirmacionRechazo = true;
    this.confirmacionFinalizacion = false;
  }

  aceptarTurno(turno: any) {
    turno.estado = 'aceptado';
    for (let i = 0; i < this.currentSpecialistTurnList.length; i++) {
      const turnosEspecialista = this.currentSpecialistTurnList[i];
      const index = turnosEspecialista.turnos.findIndex((t: any) => {
        return (
          new Date(t.fecha.seconds * 1000).getTime() ==
          new Date(turno.fecha.seconds * 1000).getTime() &&
          t.especialidad == turno.especialidad
        );
      });
      turnosEspecialista.turnos[index] = turno;
      this.authService.updateTurnList(turnosEspecialista);
    }

    this.spinner = true;
    setTimeout(() => {
      this.spinner = false;
      this.vistaComentario = false;
      this.vistaComentarioCalificacion = false;
      this.cancelacionTurno = false;
      this.confirmacionRechazo = false;
      this.confirmacionFinalizacion = false;
      this.notificationService.showSuccess('Turno Aceptado', 'Turnos');
    }, 1000);
  }

  finalizarTurno(turno: any) {
    this.turnoAFinalizar = { ...turno };
    this.confirmacionFinalizacion = true;
    this.vistaComentario = false;
    this.vistaComentarioCalificacion = false;
  }

  confirmarFinalizacion(turno: any) {
    turno.estado = 'realizado';
    turno.comentario = this.comentarioFinalizacion;
    for (let i = 0; i < this.currentSpecialistTurnList.length; i++) {
      const turnosEspecialista = this.currentSpecialistTurnList[i];
      const index = turnosEspecialista.turnos.findIndex((t: any) => {
        return (
          new Date(t.fecha.seconds * 1000).getTime() ==
          new Date(turno.fecha.seconds * 1000).getTime() &&
          t.especialidad == turno.especialidad
        );
      });
      turnosEspecialista.turnos[index] = turno;
      this.authService.updateTurnList(turnosEspecialista);
    }

    this.spinner = true;
    setTimeout(() => {
      this.spinner = false;
      this.turnoACancelar = {};
      this.cancelacionTurno = false;
      this.confirmacionRechazo = false;
      this.confirmacionFinalizacion = false;
      this.notificationService.showSuccess('Turno Finalizado', 'Turnos');
    }, 1000);
  }

  abrirFormHistorialClinico(turno: any) {
    this.turnoFinalizado = { ...turno };
  }

  agregarClaveValor() {
    if (this.cantidadClaveValor < 3) {
      this.cantidadClaveValor++;
      if (this.cantidadClaveValor == 1) {
        this.arrayClaveValorAdicionales.push(this.dato1);
      } else if (this.cantidadClaveValor == 2) {
        this.arrayClaveValorAdicionales.push(this.dato2);
      } else {
        this.arrayClaveValorAdicionales.push(this.dato3);
      }
    }
  }

  crearHistorialClinico() {
    if (this.formHistorial.valid) {
      let detalle: any = {
        altura: this.formHistorial.getRawValue().altura,
        peso: this.formHistorial.getRawValue().peso,
        temperatura: this.formHistorial.getRawValue().temperatura,
        presion: this.formHistorial.getRawValue().presion,
      };

      let detalleAdicional: any = {};
      if (this.arrayClaveValorAdicionales.length == 1) {
        detalleAdicional.clave1 = this.dato1[0];
        detalleAdicional.valor1 = this.dato1[1];
      }
      if (this.arrayClaveValorAdicionales.length == 2) {
        detalleAdicional.clave1 = this.dato1[0];
        detalleAdicional.valor1 = this.dato1[1];
        detalleAdicional.clave2 = this.dato2[0];
        detalleAdicional.valor2 = this.dato2[1];
      }
      if (this.arrayClaveValorAdicionales.length == 3) {
        detalleAdicional.clave1 = this.dato1[0];
        detalleAdicional.valor1 = this.dato1[1];
        detalleAdicional.clave2 = this.dato2[0];
        detalleAdicional.valor2 = this.dato2[1];
        detalleAdicional.clave3 = this.dato3[0];
        detalleAdicional.valor3 = this.dato3[1];
      }

      this.turnoFinalizado.detalle = detalle;
      this.turnoFinalizado.detalleAdicional = detalleAdicional;
      this.spinner = true;
      this.modificarTurnoFinalizado(this.turnoFinalizado);
      this.authService
        .createHistorialClinico(this.turnoFinalizado)
        .then(() => {
          this.spinner = false;
          this.dato1 = ['', ''];
          this.dato2 = ['', ''];
          this.dato3 = ['', ''];
          this.arrayClaveValorAdicionales = [];
          this.cantidadClaveValor = 0;
          this.formHistorial.reset();
          this.notificationService.showSuccess(
            'Historial clínico creado',
            'Mis Turnos'
          );
        })
        .catch(() => {
          this.spinner = false;
        });
    }
  }

  modificarTurnoFinalizado(turno: any) {
    turno.historial = true;
    for (let i = 0; i < this.currentSpecialistTurnList.length; i++) {
      const turnosEspecialista = this.currentSpecialistTurnList[i];
      const index = turnosEspecialista.turnos.findIndex((t: any) => {
        return (
          new Date(t.fecha.seconds * 1000).getTime() ==
          new Date(turno.fecha.seconds * 1000).getTime() &&
          t.especialidad == turno.especialidad
        );
      });
      turnosEspecialista.turnos[index] = turno;
      this.authService.updateTurnList(turnosEspecialista);
    }
  }

  filtrarPorCamposPaciente() {
    this.turnosFiltrados = [];
    if (this.palabraBusqueda == '') {
      this.turnosFiltrados = [...this.turnosDelPaciente];
    } else {
      const busqueda = this.palabraBusqueda.trim().toLocaleLowerCase();
      for (let i = 0; i < this.turnosDelPaciente.length; i++) {
        const turno = this.turnosDelPaciente[i];
        const fechaBusqueda = this.transformarFechaParaBusqueda(turno.fecha);
        if (
          turno.especialista.nombre.toLocaleLowerCase().includes(busqueda) ||
          turno.especialista.apellido.toLocaleLowerCase().includes(busqueda) ||
          turno.especialidad.toLocaleLowerCase().includes(busqueda) ||
          turno.estado.toLocaleLowerCase().includes(busqueda) ||
          turno.paciente.nombre.toLocaleLowerCase().includes(busqueda) ||
          turno.paciente.apellido.toLocaleLowerCase().includes(busqueda) ||
          turno.paciente.obraSocial.toLocaleLowerCase().includes(busqueda) ||
          fechaBusqueda.includes(busqueda) ||
          turno?.detalle?.altura?.toString().includes(busqueda) ||
          turno?.detalle?.peso?.toString().includes(busqueda) ||
          turno?.detalle?.temperatura?.toString().includes(busqueda) ||
          turno?.detalle?.presion?.includes(busqueda) ||
          turno?.detalleAdicional?.clave1?.includes(busqueda) ||
          turno?.detalleAdicional?.clave2?.includes(busqueda) ||
          turno?.detalleAdicional?.clave3?.includes(busqueda) ||
          turno?.detalleAdicional?.valor1?.includes(busqueda) ||
          turno?.detalleAdicional?.valor2?.includes(busqueda) ||
          turno?.detalleAdicional?.valor3?.includes(busqueda)
        ) {
          this.turnosFiltrados.push(turno);
        }
      }
    }
  }

  filtrarPorCamposEspecialista() {
    this.turnosFiltrados = [];
    if (this.palabraBusqueda == '') {
      this.turnosFiltrados = [...this.turnosDelEspecialista];
    } else {
      const busqueda = this.palabraBusqueda.trim().toLocaleLowerCase();
      for (let i = 0; i < this.turnosDelEspecialista.length; i++) {
        const turno = this.turnosDelEspecialista[i];
        const fechaBusqueda = this.transformarFechaParaBusqueda(turno.fecha);
        if (
          turno.especialista.nombre.toLocaleLowerCase().includes(busqueda) ||
          turno.especialista.apellido.toLocaleLowerCase().includes(busqueda) ||
          turno.especialidad.toLocaleLowerCase().includes(busqueda) ||
          turno.estado.toLocaleLowerCase().includes(busqueda) ||
          turno.paciente.nombre.toLocaleLowerCase().includes(busqueda) ||
          turno.paciente.apellido.toLocaleLowerCase().includes(busqueda) ||
          turno.paciente.obraSocial.toLocaleLowerCase().includes(busqueda) ||
          fechaBusqueda.includes(busqueda) ||
          turno?.detalle?.altura?.toString().includes(busqueda) ||
          turno?.detalle?.peso?.toString().includes(busqueda) ||
          turno?.detalle?.temperatura?.toString().includes(busqueda) ||
          turno?.detalle?.presion?.includes(busqueda) ||
          turno?.detalleAdicional?.clave1?.includes(busqueda) ||
          turno?.detalleAdicional?.clave2?.includes(busqueda) ||
          turno?.detalleAdicional?.clave3?.includes(busqueda) ||
          turno?.detalleAdicional?.valor1?.includes(busqueda) ||
          turno?.detalleAdicional?.valor2?.includes(busqueda) ||
          turno?.detalleAdicional?.valor3?.includes(busqueda)
        ) {
          this.turnosFiltrados.push(turno);
        }
      }
    }
  }

  transformarFechaParaBusqueda(value: any) {
    if (value.seconds) {
      value = new Date(value.seconds * 1000);
    }
    let rtn =
      value.getFullYear() +
      '-' +
      (value.getMonth() + 1) +
      '-' +
      value.getDate();
    if (parseInt(rtn.split('-')[2]) < 10 && parseInt(rtn.split('-')[2]) > 0) {
      rtn =
        value.getFullYear() +
        '-' +
        (value.getMonth() + 1) +
        '-0' +
        value.getDate();
    } else {
      rtn =
        value.getFullYear() +
        '-' +
        (value.getMonth() + 1) +
        '-' +
        value.getDate();
    }
    return rtn;
  }
}