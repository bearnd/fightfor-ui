import { CollectionViewer, DataSource } from '@angular/cdk/collections';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs/observable/of';

import {
  InterventionType,
  OrderType,
  StudyInterface,
  StudyOverallStatus,
  StudyPhase,
  StudyType
} from '../../../interfaces/study.interface';
import {
  StudyRetrieverService
} from '../../../services/study-retriever.service';



export class StudiesDataSource implements DataSource<StudyInterface> {

  private studiesSubject = new BehaviorSubject<StudyInterface[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading = this.loadingSubject.asObservable();

  constructor(private studyRetrieverService: StudyRetrieverService) {
  }

  connect(collectionViewer: CollectionViewer): Observable<StudyInterface[]> {
    return this.studiesSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.studiesSubject.complete();
    this.loadingSubject.complete();
  }

  filterStudies(
    studies: StudyInterface[],
    countries?: string[],
    states?: string[],
    cities?: string[],
    overallStatuses?: StudyOverallStatus[],
    interventionTypes?: InterventionType[],
    phases?: StudyPhase[],
    studyTypes?: StudyType[],
    yearBeg?: number,
    yearEnd?: number,
    orderBy?: string,
    order?: OrderType,
    limit?: number,
    offset?: number,
  ) {
    this.loadingSubject.next(true);

    this.studyRetrieverService.filterStudies(
      studies,
      countries,
      states,
      cities,
      overallStatuses,
      interventionTypes,
      phases,
      studyTypes,
      yearBeg,
      yearEnd,
      orderBy,
      order,
      limit,
      offset,
    ).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(
      studiesFiltered => this.studiesSubject.next(studiesFiltered)
    );
  }
}
