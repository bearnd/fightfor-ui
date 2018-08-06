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
   * Returns a copy of an array of objects alphabetically sorted by a given
   * property.
   * @param {any[]} entries The array of objects to be copied and sorted.
   * @param {string} prop The property by which sorting will be performed.
   * @returns {any[]} The sorted copy of the array.
   */
  private orderByProperty(entries: any[], prop: string): any[] {

    // Create a copy of the array.
    const entriesSorted = entries.slice();

    // Sort the array copy alphabetically by intervention name.
    entriesSorted.sort(
      (left, right) => {
        if (left[prop] < right[prop]) {
          return -1;
        }
        if (left[prop] > right[prop]) {
          return 1;
        }
        return 0;
      }
    );

    return entriesSorted
  }

  /**
   * Rolls-up an array of intervention objects into a single newline-delimited
   * string where each line contains the intervention type and name.
   * @param {Intervention[]} interventions The array of interventions to roll
   * up.
   * @returns {string} The rolled-up interventions.
   */
  rollupInterventions(interventions: Intervention[]): string {

    // Create a copy of the interventions array and sort it alphabetically by
    // the intervention name.
    const interventionsSorted: Intervention[]
      = this.orderByProperty(interventions, 'name');

    // Iterate over the sorted interventions and roll them up into a single
    // newline-delimited string including the intervention type and name
    const interventionsFull: string[] = [];
    for (const intervention of interventionsSorted) {
      let interventionFull = '';
      const interventionTypeMember =
        intervention.interventionType.split('.')[1];
      const interventionTypeValue = InterventionType[interventionTypeMember];

      interventionFull += interventionTypeValue + ': ' + intervention.name;

      interventionsFull.push(interventionFull);
    }

    return interventionsFull.join('\n');
  }


}
