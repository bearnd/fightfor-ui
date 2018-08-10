import { AfterViewInit, Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSelect, MatSort, MatTable } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';

import { Observable } from 'rxjs/Observable';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Subject } from 'rxjs/Subject';
import { merge, take, takeUntil, tap } from 'rxjs/operators';

import { SearchesService } from '../../../services/searches.service';
import { SearchInterface } from '../../../interfaces/search.interface';
import {
  FacilityInterface,
  MeshTermInterface,
  MeshTermType,
  OrderType, RecruitmentStatusType,
  StudyInterface,
} from '../../../interfaces/study.interface';
import { StudiesDataSource } from './studies.datasource';
import {
  StudyRetrieverService
} from '../../../services/study-retriever.service';
import { castEnumToArray, castMeshTermType } from '../../../shared/utils';


interface EnumInterface {
  id: string;
  name: string;
}


@Component({
  selector: 'app-studies-list',
  templateUrl: './studies-list.component.html',
  styleUrls: ['./studies-list.component.scss']
})
export class StudiesListComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild('multiSelect') multiSelect: MatSelect;

  // Form-controllers for the recruitment-status multi-select and filter.
  public selectRecruitmentStatusCtrl: FormControl = new FormControl();
  public selectRecruitmentStatusFilterCtrl: FormControl = new FormControl();

  /** list of banks */
  private recruitmentStatuses = castEnumToArray(RecruitmentStatusType);

  /** list of banks filtered by search keyword for multi-selection */
  public filteredRecruitmentStatusMulti: ReplaySubject<EnumInterface[]> =
    new ReplaySubject<EnumInterface[]>(1);

   /** Subject that emits when the component has been destroyed. */
  private _onDestroy = new Subject<void>();

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
  // Page-size options used in the studies-table paginator.
  studiesPageSizeOptions = [10, 25, 50];
  // Total number of studies used in the studies-table paginator.
  studiesCount: number;
  // An observable indicating whether the total number of studies populating
  // `studiesCount` which is used in the paginator is being loaded.
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
    );

    console.log(this.recruitmentStatuses);

    // set initial selection
    this.selectRecruitmentStatusFilterCtrl
      .setValue(null);

    // load the initial bank list
    this.filteredRecruitmentStatusMulti.next(this.recruitmentStatuses.slice());

    this.selectRecruitmentStatusFilterCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterBanksMulti();
      });
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

    this.setInitialValue();
  }

  ngOnDestroy() {
    this._onDestroy.next();
    this._onDestroy.complete();
  }

  /**
   * Sets the initial value after the filteredBanks are loaded initially
   */
  private setInitialValue() {
    this.filteredRecruitmentStatusMulti
      .pipe(take(1), takeUntil(this._onDestroy))
      .subscribe(() => {
        // setting the compareWith property to a comparison function
        // triggers initializing the selection according to the initial value of
        // the form control (i.e. _initializeSelection())
        // this needs to be done after the filteredBanks are loaded initially
        // and after the mat-option elements are available
        // this.multiSelect.compareWith = (a, b) => a.id === b.id;
        this.multiSelect.compareWith = (a, b) => {
          if (a && b) {
            return a.id === b.id;
          }
          return false;
        };
      });
  }

  private filterBanksMulti() {
    if (!this.recruitmentStatuses) {
      return;
    }
    // get the search keyword
    let search = this.selectRecruitmentStatusFilterCtrl.value;
    if (!search) {
      this.filteredRecruitmentStatusMulti.next(this.recruitmentStatuses.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredRecruitmentStatusMulti.next(
      this.recruitmentStatuses.filter(bank => bank.name.toLowerCase().indexOf(search) > -1)
    );
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

  getStudyInterventionMeshTerms(
    study: StudyInterface,
  ): MeshTermInterface[] | string | null {
    const meshTerms: MeshTermInterface[] = [];

    for (const studyMeshTerm of study.studyMeshTerms) {
      const meshTermType = castMeshTermType(studyMeshTerm.meshTermType);
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
      const meshTermType = castMeshTermType(studyMeshTerm.meshTermType);
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
