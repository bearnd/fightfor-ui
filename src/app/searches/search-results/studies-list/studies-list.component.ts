import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTable } from '@angular/material';
import { ActivatedRoute } from '@angular/router';

import { Observable } from 'rxjs/Observable';
import { merge, tap } from 'rxjs/operators';

import { SearchesService } from '../../../services/searches.service';
import { SearchInterface } from '../../../interfaces/search.interface';
import {
  FacilityInterface,
  MeshTermInterface,
  MeshTermType,
  OrderType,
  StudyInterface,
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
    'conditions',
    'interventions',
    'locations',
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

    this.isLoadingStudiesCount =
      this.studyRetrieverService.isLoadingCountStudies;
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

    // Get corresponding `StudyOverallStatus` member.
    return StudyOverallStatus[status_value];
  }

  /**
   * Casts a fully-qualified mesh-term-type enum string coming from GraphQL,
   * e.g. `MeshTermType.CONDITION` to the enum value as defined under the
   * the `MeshTermType` enum.
   * @param {string} type The fully-qualified mesh-term-type enum string.
   * @returns {string} The corresponding `MeshTermType` value.
   */
  castMeshTermType(type: string): MeshTermType {
    // Split the string on `.` and keep the second part of the string with the
    // enum member name.
    const type_value = type.split('.')[1];

    // Get corresponding `MeshTermType` member.
    return MeshTermType[type_value];
  }

  getStudyInterventionMeshTerms(
    study: StudyInterface,
  ): MeshTermInterface[] | string | null {
    const meshTerms: MeshTermInterface[] = [];

    for (const studyMeshTerm of study.studyMeshTerms) {
      const meshTermType = this.castMeshTermType(studyMeshTerm.meshTermType);
      if (meshTermType === MeshTermType.INTERVENTION) {
        meshTerms.push(studyMeshTerm.meshTerm);
      }
    }

    if (meshTerms.length === 1) {
      return meshTerms[0].term;
    } else if (meshTerms.length > 1) {
      return 'Multiple';
    } else {
      return null;
    }
  }

  getStudyConditionMeshTerms(
    study: StudyInterface,
  ): MeshTermInterface[] | string | null {
    const meshTerms: MeshTermInterface[] = [];

    for (const studyMeshTerm of study.studyMeshTerms) {
      const meshTermType = this.castMeshTermType(studyMeshTerm.meshTermType);
      if (meshTermType === MeshTermType.CONDITION) {
        meshTerms.push(studyMeshTerm.meshTerm);
      }
    }

    if (meshTerms.length === 1) {
      return meshTerms[0].term;
    } else if (meshTerms.length > 1) {
      return 'Multiple';
    } else {
      return null;
    }
  }

  getStudyLocation(
    study: StudyInterface,
  ): string | null {
    if (study.locations.length === 1) {
      const facility: FacilityInterface = study.locations[0].facility;
      const components: string[] = [
        facility.city,
        facility.state,
        facility.country,
      ];
      return components.join(', ');
    } else if (study.locations.length > 1) {
      return 'Multiple';
    } else {
      return null;
    }
  }

}
