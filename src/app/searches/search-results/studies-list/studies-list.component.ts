import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SearchesService } from '../../../services/searches.service';
import { SearchInterface } from '../../../interfaces/search.interface';
import { MatSort, MatTable, MatTableDataSource } from '@angular/material';
import { StudyInterface } from '../../../interfaces/study.interface';


@Component({
  selector: 'app-studies-list',
  templateUrl: './studies-list.component.html',
  styleUrls: ['./studies-list.component.scss']
})
export class StudiesListComponent implements OnInit, AfterViewInit {

  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatSort) sort: MatSort;

  // Studies columns to display.
  displayedColumns: string[] = ['nctId'];
  // Studies table data-source.
  dataSourceStudies: MatTableDataSource<StudyInterface>;

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

    // Create a new `MatTableDataSource` with the search studies.
    this.dataSourceStudies = new MatTableDataSource(this.search.studies);
  }

  ngAfterViewInit() {
    // Enable column sorting on the studies table dat-source.
    this.dataSourceStudies.sort = this.sort;
  }

}
