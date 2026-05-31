import { Injectable, inject } from '@angular/core';
import { ToastrService, IndividualConfig } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly toastr = inject(ToastrService);

  private readonly defaultOptions: Partial<IndividualConfig> = {
    closeButton: true,
    progressBar: true,
    progressAnimation: 'decreasing',
    timeOut: 5000,
  };

  success(message: string, title = 'Success', options?: Partial<IndividualConfig>) {
    this.toastr.success(message, title, { ...this.defaultOptions, ...options });
  }

  error(message: string, title = 'Error', options?: Partial<IndividualConfig>) {
    this.toastr.error(message, title, { ...this.defaultOptions, ...options });
  }

  warning(message: string, title = 'Warning', options?: Partial<IndividualConfig>) {
    this.toastr.warning(message, title, { ...this.defaultOptions, ...options });
  }

  info(message: string, title = 'Info', options?: Partial<IndividualConfig>) {
    this.toastr.info(message, title, { ...this.defaultOptions, ...options });
  }
}
