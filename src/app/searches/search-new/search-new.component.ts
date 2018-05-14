import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-search-new',
  templateUrl: './search-new.component.html',
  styleUrls: ['./search-new.component.scss']
})
export class SearchNewComponent implements OnInit {

  tags = [
    'Tag 01',
    'Tag 02',
    'Tag 03',
  ];

  constructor() { }

  ngOnInit() {
  }

}
