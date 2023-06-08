import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2'

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private toastr: ToastrService) { }

  showSuccess(message: string, title: string, config?: any) {
    if (!config) {
      this.toastr.success(message, title, { timeOut: 2000, positionClass: 'toast-top-center' });
    } else {
      this.toastr.success(message, title, config);
    }
  }

  showError(message: string, title: string, config?: any) {
    if (!config) {
      this.toastr.error(message, title, {
        timeOut: 2000,
        positionClass: 'toast-top-center',
      });
    } else {
      this.toastr.error(message, title, config);
    }
  }

  showInfo(message: string, title: string, config?: any) {
    if (!config) {
      this.toastr.info(message, title, {
        timeOut: 5000,
        positionClass: 'toast-top-center',
      });
    } else {
      this.toastr.info(message, title, config);
    }
  }

  showWarning(message: string, title: string, config?: any) {
    if (!config) {
      this.toastr.warning(message, title, {
        timeOut: 2000,
        positionClass: 'toast-top-center',
      });
    } else {
      this.toastr.warning(message, title, config);
    }
  }

  showSuccessSwal(message: string, title: string) {
    Swal.fire({
      icon: 'success',
      title: title,
      html: `<b>${message}</b>`,
      backdrop: false,
      confirmButtonColor: '#1f7977',
    });
  }
}