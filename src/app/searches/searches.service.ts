import {
  AngularFirestore,
  AngularFirestoreCollection
} from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';

import { SearchModel } from './search.model';
import {Injectable} from '@angular/core';

@Injectable()
export class SearchesService {

  searchesCollection: AngularFirestoreCollection<SearchModel>;
  searchesObs: Observable<SearchModel[]>;

  constructor(
    private afs: AngularFirestore
  ) {
    this.searchesCollection = this.afs.collection('/searches');
    this.searchesObs = this.searchesCollection.valueChanges();
  }

}
