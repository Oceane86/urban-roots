import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UrbanSpacesService {
  private apiUrl = 'https://www.observatoire-agriculture-urbaine.org/json/listsites.php?v=1720789221209';

  constructor(private http: HttpClient) {}

  getUrbanSpaces(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
