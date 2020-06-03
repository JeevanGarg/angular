import { Injectable } from '@angular/core';
import { environment } from "../../../environments/environment.prod";
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest,  UserModel, LoginModel } from '../login/login-request';
import { CookieService } from 'ngx-cookie-service';
import { getLocaleDateTimeFormat } from '@angular/common';
import * as  moment from "moment";
import { strictEqual } from 'assert';
import { isNullOrUndefined } from 'util';
import { SharedService } from '../../shared/services/shared.service';



@Injectable({
  providedIn: 'root'
})
export class RegisterService {
    apiUrlLogin: string = '';
 
    constructor(private httpClient: HttpClient, private cookie: CookieService, private sharedService: SharedService) {
    this.apiUrlLogin = environment.apiUrl;
  }

  getallCoverageGroups(): Observable<any> {
    try {
      
      const headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
        return this.httpClient.get(this.apiUrlLogin +'api/getAllCoverageGroups', { headers: headers});
    }
    catch (error) {
      error.status = 500;
      //this.errorHandler.handleError(error);
    }
 }

  registerUser(userModel): Observable<any>  {
    
        let httpHeaders = new HttpHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
        });
        let options = {
            headers: httpHeaders
    };
    
    return this.httpClient.post<any>(this.apiUrlLogin + 'api/register', userModel, options);
    }
  getRoles(): Observable<any> {
    try {

      const headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      return this.httpClient.get(this.apiUrlLogin + 'api/getRoles', { headers: headers });
    }
    catch (error) {
      error.status = 500;
      //this.errorHandler.handleError(error);
    }
  }

  getDesignations(): Observable<any> {
    try {

      const headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      return this.httpClient.get(this.apiUrlLogin + 'api/getDesignations', { headers: headers });
    }
    catch (error) {
      error.status = 500;
      //this.errorHandler.handleError(error);
    }
  }

  getOffices(): Observable<any> {
    try {

      const headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      return this.httpClient.get(this.apiUrlLogin + 'api/getOffices', { headers: headers });
    }
    catch (error) {
      error.status = 500;
      //this.errorHandler.handleError(error);
    }
  }

  getTimezones(): Observable<any> {
    try {

      const headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      return this.httpClient.get(this.apiUrlLogin + 'api/getTimezones', { headers: headers });
    }
    catch (error) {
      error.status = 500;
      //this.errorHandler.handleError(error);
    }
  }
}
