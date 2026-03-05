import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TableauDeBord } from '../models/tableau-de-bord.model';


@Injectable({
  providedIn: 'root'
})
export class TableauDeBordService {

  private apiUrl = 'http://localhost:8090/stock/api/tableau-de-bord';

  constructor(private http: HttpClient) {}

  obtenirTableauDeBord(): Observable<TableauDeBord> {
    return this.http.get<TableauDeBord>(this.apiUrl);
  }
}
