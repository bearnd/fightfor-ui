import { CollectionViewer, DataSource } from '@angular/cdk/collections';

import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs/internal/observable/of';

import { OrderType, StudyInterface } from '../../interfaces/study.interface';
import {
  StudyStatsRetrieverService
} from '../../services/study-stats-retriever.service';
import {
  StudiesCountByFacilityInterface
} from '../../interfaces/user-config.interface';
import { DescriptorInterface } from '../../interfaces/descriptor.interface';

export class FacilitiesDatasource implements DataSource<StudiesCountByFacilityInterface> {

  public facilitiesSubject
    = new BehaviorSubject<StudiesCountByFacilityInterface[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading = this.loadingSubject.asObservable();

  constructor(private studyStatsRetrieverService: StudyStatsRetrieverService) {}

  connect(
    collectionViewer: CollectionViewer
  ): Observable<StudiesCountByFacilityInterface []> {
    return this.facilitiesSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.facilitiesSubject.complete();
    this.loadingSubject.complete();
  }

  filterFacilities(
    studies: StudyInterface[],
    descriptors: DescriptorInterface[],
    countries?: string[],
    states?: string[],
    cities?: string[],
    currentLocationLongitude?: number,
    currentLocationLatitude?: number,
    distanceMaxKm?: number,
    overallStatuses?: string[],
    orderBy?: string,
    order?: OrderType,
    limit?: number,
    offset?: number,
  ) {
    this.loadingSubject.next(true);

    this.studyStatsRetrieverService.getCountStudiesByFacility(
      studies,
      descriptors,
      countries,
      states,
      cities,
      currentLocationLongitude,
      currentLocationLatitude,
      distanceMaxKm,
      overallStatuses,
      orderBy,
      order,
      limit,
      offset,
    ).pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(
      facilitiesFiltered => this.facilitiesSubject
        .next(facilitiesFiltered)
    );
  }

}
