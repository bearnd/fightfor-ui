import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchesGridComponent } from './searches-grid.component';

describe('SearchesGridComponent', () => {
  let component: SearchesGridComponent;
  let fixture: ComponentFixture<SearchesGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchesGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchesGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
