import { Component, EventEmitter, Input, Output } from '@angular/core';

import { MatChipEvent, MatDialog, MatDialogConfig } from '@angular/material';
import { DescriptorInterface } from '../interfaces/descriptor.interface';
import { MeshTermDialogComponent } from '../dialogs/mesh-term-dialog/mesh-term-dialog.component';


@Component({
  selector: 'app-mesh-term-chip',
  templateUrl: './mesh-term-chip.component.html',
})
export class MeshTermChipComponent {

  @Input() descriptor: DescriptorInterface;
  @Input() trailingIcon = 'remove_red_eye';
  @Input() removeIcon = null;
  @Input() selectable = false;
  @Input() selected = false;
  @Input() removable = false;
  @Output() removed = new EventEmitter<DescriptorInterface>();

  constructor(private dialog: MatDialog) {}

  onRemoved(): void {
    this.removed.emit(this.descriptor);
  }

  /**
   * Opens a new dialog with the `MeshTermDialogComponent` which displays
   * details for the clicked mesh-term.
   */
  onOpenMeshTermDialog(descriptor: DescriptorInterface) {

    // Create a new dialog configuration object.
    const dialogConfig: MatDialogConfig = new MatDialogConfig();

    // Automatically focus on the dialog elements.
    dialogConfig.autoFocus = true;
    // Allow the user from closing the dialog by clicking outside.
    dialogConfig.disableClose = false;
    // Make the dialog cast a shadow on the rest of the UI behind it and
    // preclude the user from interacting with it.
    dialogConfig.hasBackdrop = true;
    // Make the dialog auto-close if the user navigates away from it.
    dialogConfig.closeOnNavigation = true;
    // Set the dialog dimensions to 60% of the window dimensions.
    dialogConfig.width = '60%';
    dialogConfig.height = '60%';

    // Inject the defined descriptor into the data passed to the dialog.
    dialogConfig.data = { descriptor: descriptor };

    // Open the dialog with the given configuration.
    this.dialog.open(MeshTermDialogComponent, dialogConfig);
  }
}
