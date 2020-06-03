import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { isNullOrUndefined } from 'util';
import { UserRole } from '../../shared/models/user';
import { ToastrService, Toast } from 'ngx-toastr';
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  public authToken;
  userRoles = UserRole;
  private isAuthenticated = false; // Set this value dynamically

  constructor(private router: Router, private authenticationService: AuthService, private toastr: ToastrService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    if (this.authenticationService.isLoggedIn()) {      
      let activeUserRole = !isNullOrUndefined(localStorage.getItem('role_id')) ? localStorage.getItem('role_id') : '';      
      if (this.userRoles.Banker.toString() == activeUserRole) {
        //allowed routes for banker
        if (route.url[0].path.toLowerCase().indexOf("meetings") == 0) {
          return true;
        }
        else if (route.url[0].path.toLowerCase().indexOf("requestview") == 0) {
          return true;
        }
        else if (route.url[0].path.toLowerCase().indexOf("requestdetails") == 0) {
          return true;
        }
        else if (route.url[0].path.toLowerCase().indexOf("requestclose") == 0) {
          return true;
        }
        else if (route.url[0].path.toLowerCase().indexOf("myprofile") == 0) {
          return true;
        }
        else if (route.url[0].path.toLowerCase().indexOf("profilesetting") == 0) {
          return true;
        }
        else if (route.url[0].path.toLowerCase().indexOf("manageusers") == 0) {
          this.router.navigate(['./meetings'], { queryParams: { returnUrl: state.url } });
          return false;
        }
        else if (route.url[0].path.toLowerCase().indexOf("requestcategories") == 0) {
          return true;
        }
        else if (route.url[0].path.toLowerCase().indexOf("requestsubtypes") == 0) {
          return true;
        }
        else {
          this.router.navigate(['./meetings'], { queryParams: { returnUrl: state.url } });
          return false;
        }
      }
      else if (this.userRoles.Analyst.toString() == activeUserRole) {
        //allowed routes for Analyt
        if (route.url[0].path.toLowerCase().indexOf("meetings") == 0) {
          this.router.navigate(['./request'], { queryParams: { returnUrl: state.url } });
          return false;
        }
        else if (route.url[0].path.toLowerCase().indexOf("requestview") == 0) {
          return true;
        }
        else if (route.url[0].path.toLowerCase().indexOf("requestdetails") == 0) {
          return true;
        }
    
        else if (route.url[0].path.toLowerCase().indexOf("myprofile") == 0) {
          return true;
        }
        else if (route.url[0].path.toLowerCase().indexOf("profilesetting") == 0) {
          this.router.navigate(['./requestView'], { queryParams: { returnUrl: state.url } });
          return false;
        }
        else if (route.url[0].path.toLowerCase().indexOf("manageusers") == 0) {
          this.router.navigate(['./requestView'], { queryParams: { returnUrl: state.url } });
          return false;
        }
        else {
          this.router.navigate(['./requestView'], { queryParams: { returnUrl: state.url } });
          return false;
        }
      }
      else if (this.userRoles.Admin.toString() == activeUserRole) {
        //allowed routes for admin
        if (route.url[0].path.toLowerCase().indexOf("meetings") == 0) {
          this.router.navigate(['./requestView'], { queryParams: { returnUrl: state.url } });
          return false;
        }
        else if (route.url[0].path.toLowerCase().indexOf("requestview") == 0) {
          return true;
        }
        else if (route.url[0].path.toLowerCase().indexOf("requestdetails") == 0) {
          return true;
        }
     
        else if (route.url[0].path.toLowerCase().indexOf("myprofile") == 0) {
          return true;
        }
        else if (route.url[0].path.toLowerCase().indexOf("profilesetting") == 0) {
          this.router.navigate(['./requestView'], { queryParams: { returnUrl: state.url } });
          return false;
        }
        else if (route.url[0].path.toLowerCase().indexOf("manageusers") == 0) {
          return true;
        }
        else {
          this.router.navigate(['./requestView'], { queryParams: { returnUrl: state.url } });
          return false;
        }
      }
      else {
        this.router.navigate(['./login'], { queryParams: { returnUrl: state.url } });
        return false;
      }
    }
    this.router.navigate(['./login'], { queryParams: { returnUrl: state.url } });
    this.toastr.info("Please login again", '');    
    return false;
  }

}
