import { Component, Input } from '@angular/core';

@Component({
  selector: 'iconify-icon',
  template: '<i class="icon-{{icon}}"></i>',
  standalone: true
})
export class IconifyIconComponent {
  @Input() icon!: string;
}
