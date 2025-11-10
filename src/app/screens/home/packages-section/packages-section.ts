import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PackageCard } from '@components/package-card/package-card';
import { PackageData, PackageJson } from '@models/package';

@Component({
  selector: 'app-packages-section',
  imports: [PackageCard],
  templateUrl: './packages-section.html',
  styleUrl: './packages-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackagesSection {
  packageJsonData = input.required<PackageData>();
}
