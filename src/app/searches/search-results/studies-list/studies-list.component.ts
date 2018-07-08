import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SearchesService } from '../../../services/searches.service';
import { SearchInterface } from '../../../interfaces/search.interface';


@Component({
  selector: 'app-studies-list',
  templateUrl: './studies-list.component.html',
  styleUrls: ['./studies-list.component.scss']
})
export class StudiesListComponent implements OnInit {

  // The search the component will display results for.
  public search: SearchInterface;

  constructor(
    private searchesService: SearchesService,
    private route: ActivatedRoute,
  ) {
  }

  ngOnInit() {
    // Retrieve the referenced search UUID.
    const searchUuid: string = this.route.parent.snapshot.params['searchUuid'];
    // Retrieve the referenced search.
    this.search = this.searchesService.getSearch(searchUuid);

    // Perform the search.
    this.searchesService.searchStudies(searchUuid);
  }

}
