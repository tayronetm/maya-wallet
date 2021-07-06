import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { retry, catchError } from "rxjs/operators";
import { Subject } from "rxjs";

import { AngularFireDatabase } from '@angular/fire/database';
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class CurrencyService {
  api = "http://localhost:3001";

  private subject = new Subject<any[]>();
  private resumes = Array<any>();
  private operations = Array<any>();

  constructor(private http: HttpClient, public db: AngularFireDatabase) {}

  getCurrencies(param): Observable<any> {
    return this.http
      .get<any>(`${this.api}/prices`, {
        params: new HttpParams().set("name", param),
      })
      .pipe(retry(1), catchError(this.handleError));
  }
  
  getOperations(): Observable<any> {
    return this.http.get<any>(`${this.api}/operations`);
  }

  getResumes(): Observable<any> {
    return this.http.get<any>(`${this.api}/resumes`);
  }

  getResumesByFirebase(){
    return this.db.list('resumes')
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(c => {
            const data = c.payload.val() as any;
            const key = c.payload.key;
            return { key, ...data };
          });
        })
      );
  }

  getOperationsByFirebase(){
    return this.db.list('operations')
      .snapshotChanges()
      .pipe(
        map(changes => {
          return changes.map(c => {
            const data = c.payload.val() as any;
            const id = c.payload;
            return { ...data };
          });
        })
      );
  }

  postOperationByFirebase(param, debug?) {
    console.log('DEBUG', debug)
    return this.db.list('operations').push(param)
  }

  postResumesByFirebase(param) {
    return this.db.list('resumes').push(param)
  }

  removeResume(key) {
    this.db.list('resumes').remove(key);
  }

  updateResumesByFirebase(key, value) {
    console.log('KEY', key)
    return this.db.list('resumes').update(key,value);
  }

  postOperation(param): Observable<any> {
    this.operations.push(param)
    this.subject.next(this.operations);
    return this.http.post<any>(`${this.api}/operations`, param);
  }

  postResumeUpdate(param): Observable<any> {
    this.resumes.push(param)
    this.subject.next(this.resumes);
    return this.http.post<any>(`${this.api}/resumes/set`, param);
  }

  postNewResume(param): Observable<any> {
    this.resumes.push(param)
    this.subject.next(this.resumes);
    return this.http.post<any>(`${this.api}/resumes/push`, param);
  }

  updateResume(param): Observable<any> {
    return this.http.put<any>(`${this.api}/resumes/${param.id}`, param);
  }

  handleError(error) {
    let errorMessage = "";
    if (error.error instanceof ErrorEvent) {
      // Get client-side error
      errorMessage = error.error.message;
    } else {
      // Get server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.log(errorMessage);
    return throwError(errorMessage);
  }

  returnResumes() {
    return this.subject;
  }

  OnDestroy() {
    this.subject.unsubscribe();
  }
}
