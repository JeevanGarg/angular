import { Injectable } from "@angular/core";
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Router } from "@angular/router";
import { environment } from '../../../environments/environment.prod';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router, private cookie: CookieService) { }
  //intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
  //  return next.handle(req)
  //  //return true;
  //}
  

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let requestToProceed = req;
    if (req.url.startsWith(environment.apiUrl)) {
      const accessToken = this.cookie.check("access_token") ? this.cookie.get("access_token") : localStorage.getItem("access_token");

      if (accessToken) {
        var tokenKey = accessToken != null && accessToken != "undefined" ? accessToken : "";
        tokenKey = "Bearer " + tokenKey;
        req = req.clone({
          headers: new HttpHeaders({
            'Authorization': tokenKey, //'Bearer ' + accessToken != null && accessToken != "undefined" ? accessToken : null
            'Cache-Control': 'no-cache',
            'Pragma':'no-cache'
          })
        })
      };
    }

    

   
      //"do" part handles the case when an error status code is returned from the api
      return next.handle(req)
    }
  }

