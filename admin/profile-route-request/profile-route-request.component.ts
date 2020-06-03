import { Component, OnInit } from '@angular/core';
import { UserProfileModel, UserRole } from '../../shared/models/user';
import { ToastrService, Toast } from 'ngx-toastr';
import { UsersService } from '../../shared/services/users.service';
import { KeyValuePair } from '../../shared/models/NotificationSettings';
import { SelectItem } from 'primeng/api';
import { AuthService } from '../../authentication/login/auth.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-route-profile',
  templateUrl: './profile-route-request.component.html',
  styleUrls: ['./profile-route-request.component.css']
})
export class ProfileRouteRequestComponent implements OnInit {
  profileEdit: boolean = true;
  userId: string = '';
  userEmail: string = '';
  
  constructor(private router: Router,private toastr: ToastrService,private authService:AuthService) { }

  ngOnInit() {
    
    this.userId = localStorage.getItem('user_id');
    this.userEmail = localStorage.getItem('email');    
    if (this.authService.isLoggedIn()) {
       this.router.navigate(['/meetings']);
    }
    else {
      this.router.navigate(['/login']);
    }
  }

   
}
