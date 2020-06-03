import { Injectable } from '@angular/core';
import { environment } from "../../../environments/environment.prod";
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LoginRequest,  UserModel, LoginModel } from './login-request';
import { CookieService } from 'ngx-cookie-service';
import { getLocaleDateTimeFormat } from '@angular/common';
import * as  moment from "moment";
import { strictEqual } from 'assert';
import { isNullOrUndefined } from 'util';
import { SharedService } from '../../shared/services/shared.service';
import { ResetService } from '../../shared/services/resetpassword.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  AuthUser: LoginModel;
  apiUrlLogin: string = ''; 

    constructor(private httpClient: HttpClient, private cookie: CookieService, private sharedService: SharedService,private resetService:ResetService) {
    this.apiUrlLogin = environment.apiUrl;
  }

  login(login: LoginRequest): Observable<any> {
    try {
        let encryptedPwd = this.resetService.encryptUsingAES256(login.password);
        const params = new HttpParams()
        .set('email', login.email)
        .set('password', encryptedPwd);
        
      const headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      return this.httpClient.get( this.apiUrlLogin +'api/login', { headers: headers, params: params });
    }
    catch (error) {
      error.status = 500;
      //this.errorHandler.handleError(error);
    }
  }

  loginPost(login: LoginRequest): Observable<any> {
    let encryptedPwd = this.resetService.encryptUsingAES256(login.password);
    login.password = encryptedPwd;
    let httpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    });
    let options = {
      headers: httpHeaders
    };
    return this.httpClient.post<any>(this.apiUrlLogin + 'api/login' ,login, options);
  }


 

  getPassword(email:string): Observable<any> {
    try {
      const params = new HttpParams()
        .set('email', email);
      console.log('Passed to service:' + email);
      const headers = new HttpHeaders();
      headers.append('Content-Type', 'application/json');
      return this.httpClient.get( this.apiUrlLogin +'api/getpassword', { headers: headers, params: params  });
    }
    catch (error) {
      error.status = 500;
      //this.errorHandler.handleError(error);
    }


  }


  public setSession(AuthUser: LoginModel, rememberMe: boolean, credentialDetails: string) {
    
    this.AuthUser = AuthUser;
      if (rememberMe) {
       // let encryptedPwd = this.resetService.encryptUsingAES256(credentialDetails);
          let eDate = new Date();
          eDate.setDate(eDate.getDate() + 30);
          this.cookie.set('email', AuthUser.email, eDate);
          this.cookie.set('rem_me_expiry', eDate.toDateString(), eDate);
         // this.cookie.set('rem_me_credential', credentialDetails, eDate);
        this.cookie.set('rem_me_credential', credentialDetails, eDate);
      }
      else {
          this.cookie.check('email') ? this.cookie.delete('email') : null
          this.cookie.check('rem_me_expiry') ? this.cookie.delete('rem_me_expiry') : null
      }

      localStorage.setItem('access_token', AuthUser.accessToken);
      localStorage.setItem("expires_at", JSON.stringify(AuthUser.expiresAt.valueOf()));
      localStorage.setItem('first_last_name', AuthUser.firstName + ' ' + AuthUser.lastName);
      localStorage.setItem('user_id', !isNullOrUndefined(AuthUser.userId)? AuthUser.userId.toString():'');
      localStorage.setItem('email', !isNullOrUndefined(AuthUser.email)? AuthUser.email.toString():'');
      localStorage.setItem('coverage_group', JSON.stringify(AuthUser.userCoverageMappings));
      localStorage.setItem('role_id', !isNullOrUndefined(AuthUser.roleId) ? AuthUser.roleId.toString() : '');
      localStorage.setItem('role_name', !isNullOrUndefined(AuthUser.role) ? AuthUser.role : '');
      
      //set the coverage group in shared service , so that it can be used across modules
    this.sharedService.setCoverageGroupDetails(AuthUser.userCoverageMappings);

  }

  public GetRememberMeExpiry(): boolean {
    const currentDate = moment();
    const expiration = this.cookie.check('rem_me_expiry') ? this.cookie.get('rem_me_expiry') : '';
    const expiresAt: Date = moment(expiration).toDate();
    if (moment(expiresAt).isBefore(currentDate)) {
      return false;
    }
    else { return true; }
  }

  public isLoggedIn(): Boolean {
    
    const currentDate = moment();
    const expireAt = this.getExpiration();
    const a = moment(expireAt).isBefore(currentDate);

    // if there is no expiration of the token registered or if it has expired, return false
    if (!expireAt || moment(expireAt).isBefore(currentDate)) {
      return false;
    }

    if (this.AuthUser) {
      return true;
    }
    else {
      this.AuthUser = <LoginModel>{};
      this.AuthUser.firstName =  localStorage.getItem("first_last_name");
      this.AuthUser.accessToken =  localStorage.getItem("access_token")
      this.AuthUser.userId =  localStorage.getItem("user_id")
      if (!isNullOrUndefined(this.AuthUser.userId)) {
        return true
      }

      return false;
    }
  }

  public isLoggedOut(): Boolean {
    return !this.isLoggedIn();
  }

  public logout(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("expires_at");
    localStorage.removeItem("first_name");
    localStorage.removeItem("last_name");
    localStorage.removeItem('user_name')
    this.AuthUser = null;
    this.cookie.deleteAll();
  }

  public getAccessToken(): string {
    return this.AuthUser ? this.AuthUser.accessToken : '';
  }

  public getExpiration(): moment.Moment {
    const expiration = localStorage.getItem("expires_at");
    const expiresAt = JSON.parse(expiration);
    return moment(expiresAt);
  }

}
