import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { PackageCard } from '@components/package-card/package-card';
import { PackageData, PackageJson } from '@models/package';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-packages-section',
  imports: [PackageCard, RouterLink],
  templateUrl: './packages-section.html',
  styleUrl: './packages-section.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackagesSection {
  packageJsonData = input.required<PackageData>();
}
