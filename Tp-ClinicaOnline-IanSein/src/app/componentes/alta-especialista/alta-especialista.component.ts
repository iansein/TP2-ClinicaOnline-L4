import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { NotificationService } from 'src/app/services/notification.service';
import { AuthService } from 'src/app/services/auth.service';
import { User } from 'src/app/clases/user';

@Component({
  selector: 'app-alta-especialista',
  templateUrl: './alta-especialista.component.html',
  styleUrls: ['./alta-especialista.component.scss'],
})
export class AltaEspecialistaComponent implements OnInit {

  @Input() especialidad?: any;
  formEspecialista: FormGroup;
  newEspecialista: User = new User();
  spinner: boolean = false;
  textoEspecialidades: string = "";
  captcha: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private angularFireStorage: AngularFireStorage,
    private notificationService: NotificationService,
    private authService: AuthService,
  ) {
    this.formEspecialista = this.formBuilder.group({
      nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]*$/)]],
      apellido: ['', [Validators.required, Validators.pattern(/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ\s]*$/)]],
      edad: ['', [Validators.required]],
      dni: ['', [Validators.required]],
      especialidad: ['', [Validators.required]],
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      captcha: ['', [Validators.required]],
    });
    this.captcha = this.generateRandomString(6);
  }

  ngOnInit(): void { }

  registerEspecialista() {
    if (this.formEspecialista.valid) {
      if (
        this.captcha.toLocaleLowerCase().trim() ==
        this.formEspecialista.getRawValue().captcha.toLocaleLowerCase().trim()
      ) {
        if (this.newEspecialista.imagen1 != '') {
          this.spinner = true;
          this.newEspecialista.perfil = 'especialista';
          this.newEspecialista.nombre =
            this.formEspecialista.getRawValue().nombre;
          this.newEspecialista.apellido =
            this.formEspecialista.getRawValue().apellido;
          this.newEspecialista.edad = this.formEspecialista.getRawValue().edad;
          this.newEspecialista.dni = this.formEspecialista.getRawValue().dni;
          this.newEspecialista.especialidad = this.especialidad;
          this.newEspecialista.mail =
            this.formEspecialista.getRawValue().email;
          this.newEspecialista.password =
            this.formEspecialista.getRawValue().password;
          this.authService.registerNewUser(this.newEspecialista);
          setTimeout(() => {
            this.spinner = false;
            this.formEspecialista.reset();
            this.newEspecialista = new User();
          }, 2000);
        } else {
          this.notificationService.showWarning(
            'Debes elegir una imágen para tu perfil',
            'Registro Especialista'
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
        'Registro Especialista'
      );
    }
  }

  async uploadImage($event: any) {
    this.spinner = true;
    const file = $event.target.files[0];

    if (file) {
      const path = 'img ' + Date.now() + Math.random() * 10;
      const reference = this.angularFireStorage.ref(path);

      await reference.put(file).then(async () => {
        await reference.getDownloadURL().subscribe((urlImg) => {
          this.newEspecialista.imagen1 = urlImg;
          this.spinner = false;
          this.notificationService.showSuccess(
            'Imágen de perfil subida con éxito',
            'Registro Especialista'
          );
          //@ts-ignore
          document.getElementById('profileImage').setAttribute('src', urlImg);
        });
      });
    } else {
      this.newEspecialista.imagen1 = "";
      this.spinner = false;
    }
  }

  addEspecialidad() {
    if (this.formEspecialista.getRawValue().especialidad == '') {
      this.especialidad = true;
    } else {
      this.especialidad = false;
    }
  }

  clickListado($event: any) {
    //@ts-ignore
    this.textoEspecialidades = $event.map((especialidad) => especialidad.nombre).join(' - ');
    this.especialidad = $event;
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