import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTable } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { merge, tap } from 'rxjs/operators';

import { SearchesService } from '../../../services/searches.service';
import { SearchInterface } from '../../../interfaces/search.interface';
import {
  Intervention,
  InterventionType,
  OrderType,
  StudyOverallStatus
} from '../../../interfaces/study.interface';
import { StudiesDataSource } from './studies.datasource';
import {
  StudyRetrieverService
} from '../../../services/study-retriever.service';


@Component({
  selector: 'app-studies-list',
  templateUrl: './studies-list.component.html',
  styleUrls: ['./studies-list.component.scss']
})
export class StudiesListComponent implements OnInit, AfterViewInit {

  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  // Studies columns to display.
  displayedColumns: string[] = [
    'briefTitle',
    'overallStatus',
    'interventions',
  ];
  // Studies table data-source.
  dataSourceStudies: StudiesDataSource;

  studiesCount: number;
  isLoadingStudiesCount: Observable<boolean>;

  // The search the component will display results for.
  public search: SearchInterface;

  constructor(
    private searchesService: SearchesService,
    private studyRetrieverService: StudyRetrieverService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    // Retrieve the referenced search UUID.
    const searchUuid: string = this.route.parent.snapshot.params['searchUuid'];
    // Retrieve the referenced search.
    this.search = this.searchesService.getSearch(searchUuid);

    this.dataSourceStudies = new StudiesDataSource(this.studyRetrieverService);
    this.dataSourceStudies.filterStudies(
      this.search.studies,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      10,
      0,
    );

    this.isLoadingStudiesCount = this.studyRetrieverService.isLoadingCountStudies;
    this.studyRetrieverService.countStudies(
      this.search.studies,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
    ).subscribe(
      (studiesCount: number) => {
        this.studiesCount = studiesCount;
      }
    )
  }

  ngAfterViewInit() {
    // Reset the paginator after sorting.
    this.sort.sortChange
      .subscribe(() => this.paginator.pageIndex = 0);

    // Subscribe to pagination events to refresh the studies.
    this.paginator.page
      .pipe(
        merge(this.sort.sortChange)
      ).pipe(
      tap(() => this.getStudiesPage())
    ).subscribe();
  }

  getStudiesPage() {

    this.dataSourceStudies.filterStudies(
      this.search.studies,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      this.sort.active,
      OrderType[this.sort.direction.toUpperCase()],
      this.paginator.pageSize,
      this.paginator.pageIndex * this.paginator.pageSize,
    );
  }

  /**
   * Casts a fully-qualified overall-status enum string coming from GraphQL,
   * e.g. `OverallStatusType.COMPLETED` to the enum value as defined under the
   * the `StudyOverallStatus` enum.
   * @param {string} status The fully-qualified overall-status enum string.
   * @returns {string} The corresponding `StudyOverallStatus` value.
   */
  castOverallStatus(status: string): StudyOverallStatus {
    // Split the string on `.` and keep the second part of the string with the
    // enum member name.
    const status_value = status.split('.')[1];
    
    return StudyOverallStatus[status_value];
  }

  /**
   * Processes an array of interventions and either returns an intervention if
   * there is only one, a string of value `Multiple` if there are multiple, or
   * `null` if there are none..
   * @param {Intervention[]} interventions The array of interventions to
   * process.
   * @returns {(Intervention|string)} The result.
   */
  rollupInterventions(interventions: Intervention[]): Intervention | string {

    // Return the intervention in a `type: name` format if there is only one,
    // return a string of value `Multiple` if there are multiple, and null if
    // the array is empty.
    if (interventions.length === 1) {
      // Retrieve the only intervention.
      const intervention = interventions[0];
      // Get the intervention type enum member out of the string.
      const interventionTypeMember =
        intervention.interventionType.split('.')[1];
      // Retrieve the intervention type enum value out of the string.
      const interventionTypeValue = InterventionType[interventionTypeMember];

      // Create a `type: name` representation of the intervention.
      return interventionTypeValue + ': ' + intervention.name;
    } else if (interventions.length > 1) {
      return 'Multiple';
    } else {
      return null;
    }
  }

}
