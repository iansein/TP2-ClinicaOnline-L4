import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NotificationService } from 'src/app/services/notification.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/clases/user';

@Component({
  selector: 'app-alta-paciente',
  templateUrl: './alta-paciente.component.html',
  styleUrls: ['./alta-paciente.component.scss'],
})
export class AltaPacienteComponent implements OnInit {
  formPaciente: FormGroup;
  newPaciente: User = new User();
  spinner: boolean = false;
  captcha: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private angularFireStorage: AngularFireStorage,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    this.formPaciente = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]*$/)]],
      apellido: ['', [Validators.required, Validators.pattern(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]*$/)]],
      edad: ['', [Validators.required]],
      dni: ['', [Validators.required]],
      obraSocial: ['', [Validators.required]],
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      captcha: ['', [Validators.required]],
    });
    this.captcha = this.generateRandomString(6);

  }

  ngOnInit(): void { }

  registerPaciente() {
    if (this.formPaciente.valid) {
      if (
        this.captcha.toLocaleLowerCase().trim() ==
        this.formPaciente.getRawValue().captcha.toLocaleLowerCase().trim()
      ) {
        if (this.newPaciente.imagen1 != '' && this.newPaciente.imagen2 != '') {
          this.spinner = true;
          this.newPaciente.perfil = 'paciente';
          this.newPaciente.nombre = this.formPaciente.getRawValue().nombre;
          this.newPaciente.apellido = this.formPaciente.getRawValue().apellido;
          this.newPaciente.edad = this.formPaciente.getRawValue().edad;
          this.newPaciente.dni = this.formPaciente.getRawValue().dni;
          this.newPaciente.obraSocial = this.formPaciente.getRawValue().obraSocial;
          this.newPaciente.mail = this.formPaciente.getRawValue().email;
          this.newPaciente.password = this.formPaciente.getRawValue().password;
          this.authService.registerNewUser(this.newPaciente);
          setTimeout(() => {
            this.spinner = false;
            this.formPaciente.reset();
            this.newPaciente = new User();
          }, 2000);
        } else {
          this.notificationService.showWarning(
            'Debes elegir imágenes para tu perfil',
            'Registro Paciente'
          );
        }
      } else {
        this.notificationService.showWarning(
          'El CAPTCHA no coincide',
          'Registro Paciente'
        );
      }
    } else {
      this.notificationService.showWarning(
        'Debes completar todos los campos requeridos',
        'Registro Paciente'
      );
    }
  }

  async uploadImage($event: any, option: number) {
    this.spinner = true;
    const file = $event.target.files[0];

    if (file) {
      const path = 'img ' + Date.now() + Math.random() * 10;
      const reference = this.angularFireStorage.ref(path);

      await reference.put(file).then(async () => {
        await reference.getDownloadURL().subscribe((urlImg) => {
          this.spinner = false;
          if (option == 1) {
            this.newPaciente.imagen1 = urlImg;
            this.notificationService.showSuccess(
              'Imágen de perfil subida con éxito',
              'Registro Paciente'
            );
            //@ts-ignore
            document.getElementById('profileImage1').setAttribute('src', urlImg);
          } else if (option == 2) {
            this.newPaciente.imagen2 = urlImg;
            this.notificationService.showSuccess(
              'Imágen de perfil subida con éxito',
              'Registro Paciente'
            );
            //@ts-ignore
            document.getElementById('profileImage2').setAttribute('src', urlImg);
          }
        });
      });
    } else {
      this.newPaciente.imagen1 = "";
      this.newPaciente.imagen2 = "";
      this.spinner = false;
    }
  }

  generateRandomString(num: number) {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result1 = ' ';
    const charactersLength = characters.length;
    for (let i = 0; i < num; i++) {
      result1 += characters.charAt(
        Math.floor(Math.random() * charactersLength)
      );
    }
    return result1;
  }
}