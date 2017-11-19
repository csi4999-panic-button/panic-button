import { TestBed, inject } from '@angular/core/testing';

import { SchoolSearchService } from './school-search.service';

describe('SchoolSearchService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SchoolSearchService]
    });
  });

  it('should be created', inject([SchoolSearchService], (service: SchoolSearchService) => {
    expect(service).toBeTruthy();
  }));
});
