import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { SearchInterface } from '../../interfaces/user-config.interface';
import { UserConfigService } from '../../services/user-config.service';
import { AuthService } from '../../services/auth.service';
import { MatDialog, MatDialogConfig } from '@angular/material';
import {
  MeshTermDialogComponent
} from '../../dialogs/mesh-term-dialog/mesh-term-dialog.component';
import { DescriptorInterface } from '../../interfaces/descriptor.interface';


@Component({
  selector: 'app-searches-grid',
  templateUrl: './searches-grid.component.html',
  styleUrls: ['./searches-grid.component.scss']
})
export class SearchesGridComponent implements OnInit {

  searches: SearchInterface[];

  constructor(
    private authService: AuthService,
    private userConfigService: UserConfigService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit() {
    this.searches = Object.keys(this.userConfigService.userSearches)
      .map(key => this.userConfigService.userSearches[key]);

    // Subscribe to the `UserConfigService.searchesLatest` observable. Each
    // time the searches are updated retrieve them and set them under
    // `this.searches` (in reverse order so that the latest searches appear
    // first).
    this.userConfigService.searchesLatest.subscribe(
      (searches: SearchInterface[]) => {
        if (searches) {
          this.searches = Object.keys(searches)
            .map(key => searches[key]).reverse();
        }
      }
    );
  }

  /**
   * Redirects the user to the new-search page.
   */
  onNewSearch() {
    const result = this.router.navigate(
      ['/app', 'searches', 'new']
    );
    result.then();
  }

  /**
   * Deletes a given search via its UUID and the `UserConfigService`.
   * @param searchUuid The UUID of the search to be deleted.
   */
  onDeleteSearch(searchUuid: string) {
    this.userConfigService.deleteSearch(
      this.authService.userProfile,
      searchUuid,
    );
  }

  /**
   * Redirects the user to the results summary of a given search.
   * @param searchUuid The search for which the user-results will be displayed.
   */
  onSeeResults(searchUuid: string) {
    const result = this.router.navigate(
      ['/app', 'searches', searchUuid]
    );
    result.then();
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
