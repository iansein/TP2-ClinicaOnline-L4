import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import * as FileSaver from 'file-saver';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
// import * as XLSX from 'xlsx/xlsx.mjs';
const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
import {
  Chart,
  BarElement,
  BarController,
  CategoryScale,
  Decimation,
  Filler,
  Legend,
  Title,
  Tooltip,
  LinearScale,
  registerables,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-informes',
  templateUrl: './informes.component.html',
  styleUrls: ['./informes.component.scss'],
})
export class InformesComponent implements OnInit {
  spinner: boolean = false;
  listaLogs: any[] = [];
  listaTurnos: any[] = [];

  //@ts-ignore
  chartPorEspecialidad: Chart;

  btn7Dias: boolean = false;
  btn15Dias: boolean = true;
  banderaChartSolicitados: boolean = true;

  btn7DiasFinalizado: boolean = false;
  btn15DiasFinalizado: boolean = true;
  banderaChartFinalizados = true;

  listaTurnosSolicitadosPorMedico: any[] = []
  listaTurnosFinalizadosPorMedico: any[] = []
  listaUsuariosEspecialistas: any[] = [];
  listaEspecialidades: any[] = [];
  cantidadDeDias: any;

  //directivas

  constructor(private authService: AuthService) {
    Chart.register(
      BarElement,
      BarController,
      CategoryScale,
      Decimation,
      Filler,
      Legend,
      Title,
      Tooltip,
      LinearScale,
      ChartDataLabels
    );
    Chart.register(...registerables);
  }

  //NGONINIT
  ngOnInit(): void {
    this.authService.getUsersLog().subscribe((logs) => {
      this.listaLogs = logs;
      this.listaLogs.forEach((l) => {
        l.fecha = new Date(l.fecha.seconds * 1000);
      });
    });

    //TRAER ESPECIALISTAS CON SUS ESPECIALIDADES
    this.authService.getUsers().subscribe((especialistas: any) => {
      especialistas.forEach((element: any) => {
        if (element.perfil == 'especialista') {
          this.listaUsuariosEspecialistas.push(element);

          console.log(this.listaUsuariosEspecialistas);

          this.listaUsuariosEspecialistas.forEach((especialista: any) => {
            const nombresEspecialidades = especialista.especialidad.map((especialidad: any) => especialidad.nombre);
            this.listaEspecialidades = this.listaEspecialidades.concat(nombresEspecialidades);
          });
        }
      });
    });

    this.authService.getTurnList().subscribe((turnos) => {
      this.listaTurnos = [];
      for (let i = 0; i < turnos.length; i++) {
        const turnosEspecialista = turnos[i].turnos;
        turnosEspecialista.forEach((t: any) => {
          if (t.estado != 'disponible') {
            this.listaTurnos.push(t);
          }
        });
      }
      this.generarChartCantidadTurnosEspecialidad();
      this.generarChartTurnosPorDia();
      this.generarChartTurnosSolicitadosPorMedico(this.listaTurnos);
      this.generarChartTurnosFinalizadosPorMedico(this.listaTurnos);
    });
  }

  // LOGS DE USUARIOS
  descargarPDFLogs() {
    const DATA = document.getElementById('pdflogs');
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 2,
    };
    //@ts-ignore
    html2canvas(DATA, options)
      .then((canvas) => {
        const img = canvas.toDataURL('image/PNG');

        const bufferX = 30;
        const bufferY = 30;
        const imgProps = (doc as any).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(
          img,
          'PNG',
          bufferX,
          bufferY,
          pdfWidth,
          pdfHeight,
          undefined,
          'FAST'
        );
        return doc;
      })
      .then((docResult) => {
        docResult.save(`LOGS-DE-USUARIOS.pdf`);
      });
  }

  descargarExcelLogs() {
    this.exportAsExcelFile(this.listaLogs, 'LOG-DE-USUARIOS');
  }

  // CHART CANTIDAD DE TURNOS POR ESPECIALIDAD
  generarChartCantidadTurnosEspecialidad() {
    const ctx = (<any>document.getElementById('turnosPorEspecialidad')).getContext('2d');

    if (this.chartPorEspecialidad) {
      this.chartPorEspecialidad.destroy();
    }

    const colors = [
      '#ffc409',
      '#eb445a',
      '#3dc2ff',
      '#55ff9c',
      '#2fdf75',
      '#0044ff',
      '#ee55ff',
    ];

    const especialidades = this.listaEspecialidades;
    const listaTurnosPorEspecialidad = Array(especialidades.length).fill(0);

    this.listaTurnos.forEach((t) => {
      const index = especialidades.indexOf(t.especialidad);
      if (index !== -1) {
        listaTurnosPorEspecialidad[index]++;
      }
    });

    const turnosColores = listaTurnosPorEspecialidad.map((_, i) => colors[i % colors.length]);

    //@ts-ignore
    this.chartPorEspecialidad = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: especialidades,
        datasets: [
          {
            label: undefined,
            data: listaTurnosPorEspecialidad,
            backgroundColor: turnosColores,
            borderColor: ['#000'],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        layout: {
          padding: 20,
        },
        plugins: {
          legend: {
            position: 'top',
            display: false,
          },
          title: {
            display: true,
            text: 'Cantidad de turnos por especialidad',
          },
          datalabels: {
            color: '#000',
            anchor: 'center',
            align: 'center',
            font: {
              size: 15,
              weight: 'bold',
            },
            formatter: (value, context) => {
              const index = context.dataIndex;
              return value;
            },
          },
        },
      },
    });
  }

  descargarPDFTurnosPorEspecialidad() {
    const DATA = document.getElementById('pdfTurnosPorEspecialidad');
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 2,
    };
    //@ts-ignore
    html2canvas(DATA, options)
      .then((canvas) => {
        const img = canvas.toDataURL('image/PNG');

        const bufferX = 30;
        const bufferY = 30;
        const imgProps = (doc as any).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(
          img,
          'PNG',
          bufferX,
          bufferY,
          pdfWidth,
          pdfHeight,
          undefined,
          'FAST'
        );
        return doc;
      })
      .then((docResult) => {
        docResult.save(`TURNOS-POR-ESPECIALIDAD.pdf`);
      });
  }

  //FUNCION EXCEL PARA CHART POR ESPECIALIDADES

  descargarExcelTurnosPorEspecialidad() {
    const especialidadesTurnos: Record<string, number> = {};

    this.listaTurnos.forEach((turno) => {
      const especialidad = turno.especialidad;
      if (especialidadesTurnos.hasOwnProperty(especialidad)) {
        especialidadesTurnos[especialidad]++;
      } else {
        especialidadesTurnos[especialidad] = 1;
      }
    });

    const listaTurnos = Object.keys(especialidadesTurnos).map((especialidad) => ({
      especialidad,
      turnos: especialidadesTurnos[especialidad]
    }));

    this.exportAsExcelFile(listaTurnos, 'TURNOS-POR-ESPECIALIDAD');
  }

  // CHART CANTIDAD DE TURNOS POR DIA
  generarChartTurnosPorDia() {
    const ctx = (<any>document.getElementById('turnosPorDia')).getContext('2d');

    const colors = [
      '#ffc409',
      '#eb445a',
      '#3dc2ff',
      '#4e1679',
      '#464edc',
      '#0044ff',
      '#ee55ff',
    ];

    let i = 0;
    const turnosColores = this.listaTurnos.map(
      (_) => colors[(i = (i + 1) % colors.length)]
    );
    ctx.canvas.width = 4000;
    ctx.canvas.height = 3000;

    let listaTurnosPorDia = [0, 0, 0, 0, 0, 0];
    this.listaTurnos.forEach((t) => {
      if (new Date(t.fecha.seconds * 1000).getDay() == 1) {
        listaTurnosPorDia[0]++;
      } else if (new Date(t.fecha.seconds * 1000).getDay() == 2) {
        listaTurnosPorDia[1]++;
      } else if (new Date(t.fecha.seconds * 1000).getDay() == 3) {
        listaTurnosPorDia[2]++;
      } else if (new Date(t.fecha.seconds * 1000).getDay() == 4) {
        listaTurnosPorDia[3]++;
      } else if (new Date(t.fecha.seconds * 1000).getDay() == 5) {
        listaTurnosPorDia[4]++;
      } else if (new Date(t.fecha.seconds * 1000).getDay() == 6) {
        listaTurnosPorDia[5]++;
      }
    });

    //@ts-ignore
    this.chartPorEspecialidad = new Chart(ctx, {
      type: 'polarArea',
      data: {
        //@ts-ignore
        color: "#000",
        labels: ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO'],
        datasets: [
          {
            label: undefined,
            data: listaTurnosPorDia,
            backgroundColor: turnosColores,
            borderColor: ['#000'],
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        layout: {
          padding: 0,
        },
        plugins: {
          legend: {
            position: 'top',
            display: true,
          },
          title: {
            display: true,
            text: 'Cantidad de turnos por día',
            color: '#000',
          },
          datalabels: {
            color: '#000',
            anchor: 'center',
            align: 'center',
            font: {
              size: 15,
              weight: 'bold',
            },

          },
        },
      },
    });
  }

  descargarPDFTurnosPorDia() {
    const DATA = document.getElementById('pdfTurnosPorDia');
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 2,
    };
    //@ts-ignore
    html2canvas(DATA, options)
      .then((canvas) => {
        const img = canvas.toDataURL('image/PNG');

        const bufferX = 30;
        const bufferY = 30;
        const imgProps = (doc as any).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(
          img,
          'PNG',
          bufferX,
          bufferY,
          pdfWidth,
          pdfHeight,
          undefined,
          'FAST'
        );
        return doc;
      })
      .then((docResult) => {
        docResult.save(`TURNOS-POR-DIA.pdf`);
      });
  }

  descargarExcelTurnosPorDia() {
    const listaTurnosPorDia = [
      {
        Fecha: new Date(),
        Lunes: 0,
        Martes: 0,
        Miercoles: 0,
        Jueves: 0,
        Viernes: 0,
        Sabado: 0,
      },
    ];
    this.listaTurnos.forEach((t) => {
      if (new Date(t.fecha.seconds * 1000).getDay() == 1) {
        //@ts-ignore
        listaTurnosPorDia[0].Lunes++;
      } else if (new Date(t.fecha.seconds * 1000).getDay() == 2) {
        //@ts-ignore
        listaTurnosPorDia[0].Martes++;
      } else if (new Date(t.fecha.seconds * 1000).getDay() == 3) {
        //@ts-ignore
        listaTurnosPorDia[0].Miercoles++;
      } else if (new Date(t.fecha.seconds * 1000).getDay() == 4) {
        //@ts-ignore
        listaTurnosPorDia[0].Jueves++;
      } else if (new Date(t.fecha.seconds * 1000).getDay() == 5) {
        //@ts-ignore
        listaTurnosPorDia[0].Viernes++;
      } else if (new Date(t.fecha.seconds * 1000).getDay() == 6) {
        //@ts-ignore
        listaTurnosPorDia[0].Sabado++;
      }
    });
    this.exportAsExcelFile(listaTurnosPorDia, 'TURNOS-POR-DIA');
  }

  // CHART CANTIDAD DE TURNOS SOLICITADOS POR MEDICO
  generarChartTurnosSolicitadosPorMedico(listado: any[]) {
    const ctx = (<any>document.getElementById('turnosSolicitadosPorMedico')).getContext('2d');

    const colors = [
      '#ffc409',
      '#eb445a',
      '#3dc2ff',
      '#55ff9c',
      '#2fdf75',
      '#0044ff',
      '#ee55ff',
    ];

    const especialistas = this.listaUsuariosEspecialistas;
    const nombresEspecialistas = especialistas.map((especialista: any) => `${especialista.nombre} ${especialista.apellido}`);

    const listaTurnosSolicitadosPorMedico = Array(especialistas.length).fill(0);
    listado.forEach((t) => {
      const index = especialistas.findIndex((especialista: any) => especialista.id === t.especialista.id);
      if (index !== -1 && t.estado == 'solicitado') {
        listaTurnosSolicitadosPorMedico[index]++;
      }
    });

    const turnosColores = listaTurnosSolicitadosPorMedico.map((_, i) => colors[i % colors.length]);
    //@ts-ignore
    this.chartPorEspecialidad = new Chart(ctx, {
      type: 'line',
      data: {
        labels: nombresEspecialistas,
        datasets: [
          {
            label: undefined,
            data: listaTurnosSolicitadosPorMedico,
            backgroundColor: turnosColores,
            borderColor: ['#000'],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        layout: {
          padding: 20,
        },
        plugins: {
          legend: {
            position: 'top',
            display: false,
          },
          title: {
            display: true,
            text: 'Cantidad de turnos solicitados por médico',
          },
          datalabels: {
            color: '#000',
            anchor: 'center',
            align: 'center',
            font: {
              size: 15,
              weight: 'bold',
            },
          },
        },
      },
    });
  }


  descargarPDFTurnosSolicitadosPorMedico() {
    const DATA = document.getElementById('pdfTurnosSolicitadosPorMedico');
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 2,
    };
    //@ts-ignore
    html2canvas(DATA, options)
      .then((canvas) => {
        const img = canvas.toDataURL('image/PNG');

        const bufferX = 30;
        const bufferY = 30;
        const imgProps = (doc as any).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(
          img,
          'PNG',
          bufferX,
          bufferY,
          pdfWidth,
          pdfHeight,
          undefined,
          'FAST'
        );
        return doc;
      })
      .then((docResult) => {
        docResult.save(`TURNOS-SOLICITADOS-POR-MEDICO.pdf`);
      });
  }
  //EXCEL DE TURNOS SOLICITADOS
  descargarExcelTurnosSolicitadosPorMedico() {
    const especialistas = this.listaUsuariosEspecialistas;
    const nombresEspecialistas: string[] = especialistas.map((especialista: any) => `${especialista.nombre} ${especialista.apellido}`);

    if (this.btn7Dias) {
      this.cantidadDeDias = 7;
      this.btn15Dias = false;
    } else if (this.btn15Dias) {
      this.cantidadDeDias = 15;
      this.btn7Dias = false;
    }

    const currentDate = new Date();
    const futureDate = new Date(
      currentDate.getTime() + 84600000 * this.cantidadDeDias
    );
    const listadoFiltrado: any[] = [];
    this.listaTurnos.forEach((t) => {
      if (
        new Date(t.fecha.seconds * 1000).getTime() <=
        futureDate.getTime() &&
        t.estado == 'solicitado'
      ) {
        listadoFiltrado.push(t);
      }
    });

    const listaTurnosSolicitadosPorMedico: {
      [key: string]: number | Date;
      Fecha: Date;
    }[] = [{ Fecha: new Date() }];

    console.log(listadoFiltrado);

    listadoFiltrado.forEach((t) => {
      const index = especialistas.findIndex((especialista: any) => especialista.id === t.especialista.id);
      if (index !== -1 && t.estado === 'solicitado') {
        const especialistaNombre = nombresEspecialistas[index];
        if (typeof listaTurnosSolicitadosPorMedico[0][especialistaNombre] === 'number') {
          listaTurnosSolicitadosPorMedico[0][especialistaNombre] = (listaTurnosSolicitadosPorMedico[0][especialistaNombre] as number) + 1;
        } else {
          listaTurnosSolicitadosPorMedico[0][especialistaNombre] = 1;
        }
      }
    });

    this.exportAsExcelFile(listaTurnosSolicitadosPorMedico, 'TURNOS-SOLICITADOS-POR-MEDICO');
  }


  filtrarTurnosPorDias(cantidadDias: number) {
    this.banderaChartSolicitados = false;
    if (cantidadDias == 7) {
      this.btn7Dias = true;
      this.btn15Dias = false;
    } else if (cantidadDias == 15) {
      this.btn7Dias = false;
      this.btn15Dias = true;
    }
    setTimeout(() => {
      this.banderaChartSolicitados = true;
      setTimeout(() => {
        const currentDate = new Date();
        const futureDate = new Date(
          currentDate.getTime() + 84600000 * cantidadDias
        );
        const listadoFiltrado: any[] = [];
        this.listaTurnos.forEach((t) => {
          if (
            new Date(t.fecha.seconds * 1000).getTime() <=
            futureDate.getTime() &&
            t.estado == 'solicitado'
          ) {
            listadoFiltrado.push(t);
          }
        });
        this.generarChartTurnosSolicitadosPorMedico(listadoFiltrado);
      }, 500);
    }, 100);
  }

  // CHART CANTIDAD DE TURNOS FINALIZADOS POR MEDICO
  generarChartTurnosFinalizadosPorMedico(listado: any[]) {
    const ctx = (<any>document.getElementById('turnosFinalizadosPorMedico')).getContext('2d');

    const colors = [
      '#ffc409',
      '#eb445a',
      '#3dc2ff',
      '#55ff9c',
      '#2fdf75',
      '#0044ff',
      '#ee55ff',
    ];

    let i = 0;
    const turnosColores = this.listaTurnos.map(
      (_) => colors[(i = (i + 1) % colors.length)]
    );

    const especialistas = this.listaUsuariosEspecialistas;
    const listaTurnosFinalizadosPorMedico = Array(especialistas.length).fill(0);

    listado.forEach((t) => {
      const index = especialistas.findIndex(
        (especialista) => especialista.mail === t.especialista.mail
      );
      if (index !== -1 && t.estado === 'realizado') {
        listaTurnosFinalizadosPorMedico[index]++;
      }
    });

    //@ts-ignore
    this.chartPorEspecialidad = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: especialistas.map((especialista) => `${especialista.nombre} ${especialista.apellido}`),
        datasets: [
          {
            label: undefined,
            data: listaTurnosFinalizadosPorMedico,
            backgroundColor: turnosColores,
            borderColor: ['#000'],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        layout: {
          padding: 20,
        },
        plugins: {
          legend: {
            position: 'top',
            display: false,
          },
          title: {
            display: true,
            text: 'Cantidad de turnos finalizados por médico',
          },
          datalabels: {
            color: '#fff',
            anchor: 'center',
            align: 'center',
            font: {
              size: 15,
              weight: 'bold',
            },
          },
        },
      },
    });
  }

  //EXCEL DE TURNOS FINALIZADOS 

  descargarExcelTurnosFinalizadosPorMedico() {
    const especialistas = this.listaUsuariosEspecialistas;
    const nombresEspecialistas: string[] = especialistas.map((especialista: any) => `${especialista.nombre} ${especialista.apellido}`);
    console.log(nombresEspecialistas);

    if (this.btn7DiasFinalizado) {
      this.cantidadDeDias = 7;
      this.btn15DiasFinalizado = false;
    } else if (this.btn15DiasFinalizado) {
      this.cantidadDeDias = 15;
      this.btn7DiasFinalizado = false;
    }

    const currentDate = new Date();
    const futureDate = new Date(
      currentDate.getTime() + 84600000 * this.cantidadDeDias
    );
    const listadoFiltrado: any[] = [];
    this.listaTurnos.forEach((t) => {
      if (
        new Date(t.fecha.seconds * 1000).getTime() <=
        futureDate.getTime() &&
        t.estado == 'realizado'
      ) {
        listadoFiltrado.push(t);
      }
    });

    const listaTurnosFinalizadosPorMedico: {
      [key: string]: number | Date;
      Fecha: Date;
    }[] = [{ Fecha: new Date() }];
    console.log(this.listaTurnos);

    listadoFiltrado.forEach((t) => {
      console.log(t);
      const index = especialistas.findIndex((especialista: any) => especialista.id === t.especialista.id);
      if (index !== -1 && t.estado === 'realizado') {
        const especialistaNombre = nombresEspecialistas[index];
        if (typeof listaTurnosFinalizadosPorMedico[0][especialistaNombre] === 'number') {
          listaTurnosFinalizadosPorMedico[0][especialistaNombre] = (listaTurnosFinalizadosPorMedico[0][especialistaNombre] as number) + 1;
        } else {
          listaTurnosFinalizadosPorMedico[0][especialistaNombre] = 1;
        }
      }
    });

    this.exportAsExcelFile(listaTurnosFinalizadosPorMedico, 'TURNOS-FINALIZADOS-POR-MEDICO');
  }

  descargarPDFTurnosFinalizadosPorMedico() {
    const DATA = document.getElementById('pdfTurnosFinalizadosPorMedico');
    const doc = new jsPDF('p', 'pt', 'a4');
    const options = {
      background: 'white',
      scale: 2,
    };
    //@ts-ignore
    html2canvas(DATA, options)
      .then((canvas) => {
        const img = canvas.toDataURL('image/PNG');

        const bufferX = 30;
        const bufferY = 30;
        const imgProps = (doc as any).getImageProperties(img);
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        doc.addImage(
          img,
          'PNG',
          bufferX,
          bufferY,
          pdfWidth,
          pdfHeight,
          undefined,
          'FAST'
        );
        return doc;
      })
      .then((docResult) => {
        docResult.save(`TURNOS-FINALIZADOS-POR-MEDICO.pdf`);
      });
  }

  filtrarTurnosPorDiasFinalizados(cantidadDias: number) {
    this.banderaChartFinalizados = false;
    if (cantidadDias == 7) {
      this.btn7DiasFinalizado = true;
      this.btn15DiasFinalizado = false;
    } else if (cantidadDias == 15) {
      this.btn7DiasFinalizado = false;
      this.btn15DiasFinalizado = true;
    }
    setTimeout(() => {
      this.banderaChartFinalizados = true;
      setTimeout(() => {
        const currentDate = new Date();
        const futureDate = new Date(
          currentDate.getTime() + 84600000 * cantidadDias
        );
        const listadoFiltrado: any[] = [];
        this.listaTurnos.forEach((t) => {
          if (
            new Date(t.fecha.seconds * 1000).getTime() <=
            futureDate.getTime() &&
            t.estado == 'realizado'
          ) {
            listadoFiltrado.push(t);
          }
        });
        this.generarChartTurnosFinalizadosPorMedico(listadoFiltrado);
      }, 500);
    }, 100);
  }

  // UTILES
  exportAsExcelFile(json: any[], excelFileName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ['data'],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(
      data,
      fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION
    );
  }
}