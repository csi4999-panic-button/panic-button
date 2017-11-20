import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';
import { School } from './school';

@Injectable()
export class SchoolSearchService {

  private http: HttpClient;

  constructor(private Http: HttpClient) {
    this.http = Http;
  }

  /* GET schools whose name, domain, etc. contains search term */
  searchSchools(term: string): Observable<School[]> {
    if (!term.trim()) {
      // if not search term, return empty hero array.
      return of([]);
    }
    return this.http.get<School[]>(`api/v1/schools/search/${term}`);
  }
}


