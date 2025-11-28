import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ToastService } from '@services/toast-service';

@Component({
  selector: 'app-toaster',
  imports: [],
  templateUrl: './toaster.html',
  styleUrl: './toaster.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toaster {
  toasts = inject(ToastService).toasts;
}
