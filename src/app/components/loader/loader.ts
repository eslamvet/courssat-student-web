import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LoaderService } from '@services/loader-service';

@Component({
  selector: 'app-loader',
  imports: [],
  templateUrl: './loader.html',
  styleUrl: './loader.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Loader {
  showLoader = inject(LoaderService).showLoader;
}
