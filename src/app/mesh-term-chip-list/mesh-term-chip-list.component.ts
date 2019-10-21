import { Component, Input } from '@angular/core';

import { DescriptorInterface } from '../interfaces/descriptor.interface';

@Component({
  selector: 'app-mesh-term-chip-list',
  templateUrl: './mesh-term-chip-list.component.html',
  // styleUrls: ['./mesh-term-chip-list.component.scss']
})
export class MeshTermChipListComponent {

  @Input() descriptors: DescriptorInterface[];
  @Input() trailingIcon = 'info_outline';
  @Input() removeIcon = null;
  @Input() selectable = false;
  @Input() removable = false;

  constructor() {}
}
