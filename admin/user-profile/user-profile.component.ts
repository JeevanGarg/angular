import { Component, OnInit } from '@angular/core';
import { UserProfileModel, UserRole } from '../../shared/models/user';
import { ToastrService, Toast } from 'ngx-toastr';
import { UsersService } from '../../shared/services/users.service';
import { KeyValuePair } from '../../shared/models/NotificationSettings';
import { SelectItem } from 'primeng/api';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  profileEdit: boolean = true;
  userId: string = '';
  userEmail: string = '';
  myProfileToShow: UserProfileModel;
  coverageGroupSelectList: KeyValuePair[] = [];
  officeSelectList: KeyValuePair[] = [];
  userRoles = UserRole;
  coverageGroupChoices: SelectItem[] = [];
  userEntityToEdit: UserProfileModel;
  errorMessage: string = '';
  currentRoute: string = '';
  constructor(private profileService: UsersService,private toastr: ToastrService,private route:ActivatedRoute) { }

  ngOnInit() {
    this.userId = localStorage.getItem('user_id');
    this.userEmail = localStorage.getItem('email');    
    this.profileService.getUser(this.userEmail, this.userId).subscribe(o => {
      if (o.user.roleId == this.userRoles.Banker) {
        o.lstCoverageGroup.forEach((it) => {
          this.coverageGroupSelectList.push({ id: it.coverageId, title: it.title });
        });
      }
      else {
        o.lstCoverageGroup.forEach((it) => {
          this.coverageGroupChoices.push({ label: it.title, value: it.coverageId });
        });
      }
      o.lstOffices.forEach((it) => {
        this.officeSelectList.push({ id: it.id, title: it.officeName});
      });
      this.myProfileToShow = o.user;
    });
    this.route.url.subscribe(url => { this.currentRoute = url[0].path });
    localStorage.setItem('currentroute', this.currentRoute);

  }
  userprofile_editClick() {
    this.profileEdit = false;
    this.userEntityToEdit = JSON.parse(JSON.stringify(this.myProfileToShow));
    //let usrprofileEdit = document.querySelector('.hide');
    //if (usrprofileEdit.classList.contains('hide')) {
    //    usrprofileEdit.classList.remove('hide');
    //    usrprofileEdit.classList.add('show');
    //    this.profileEdit = false;
    //}
    //let usrprofileEdit1 = document.querySelector('.show');
    //if (usrprofileEdit1.classList.contains('show')) {
    //    usrprofileEdit1.classList.remove('show');
    //    usrprofileEdit1.classList.add('hide');
    //}
  }
  getOfficeName(officeId: any) {    
    return this.officeSelectList.find(it => it.id.toString() == officeId.toString()).title;
  }
  updateUserProfile() {
    if (this.myProfileToShow.firstName.trim() == '' || this.myProfileToShow.lastName.trim() == '' || this.myProfileToShow.phone.trim() == '') {
      this.errorMessage = 'Please provide valid data in required fields';
    }
    else {
      this.errorMessage = '';
    this.profileService.updateUserProfile(this.myProfileToShow).subscribe(o => {
      if (o.status) {
        this.myProfileToShow.coverageGroupName.splice(0, this.myProfileToShow.coverageGroupName.length);
        if (this.myProfileToShow.roleId == this.userRoles.Banker) {
          this.myProfileToShow.coverageGroup.forEach((cgi) => {
            this.myProfileToShow.coverageGroupName.push(this.coverageGroupSelectList.find(it => it.id.toString() == cgi.toString()).title);
          })
        }
        else {
          this.myProfileToShow.coverageGroup.forEach((cgi) => {
            this.myProfileToShow.coverageGroupName.push(this.coverageGroupChoices.find(it => it.value.toString() == cgi.toString()).label);
          })
        }
        //this.myProfileToShow.coverageGroupName
        this.profileEdit = true;
        this.toastr.success(o.errorMessage, "User Profile");
        localStorage.setItem('first_last_name', this.myProfileToShow.firstName + ' ' + this.myProfileToShow.lastName);        
      }
      else {
        this.toastr.error("Error in Saving", "User Profile");
      }
    });
  }
  }
  cancelEdit() {
    this.profileEdit = true;
    this.myProfileToShow = JSON.parse(JSON.stringify(this.userEntityToEdit));
    this.errorMessage = '';
    //let usrprofileEdit = document.querySelector('.hide');
    //if (usrprofileEdit.classList.contains('hide')) {
    //  usrprofileEdit.classList.remove('hide');
    //  usrprofileEdit.classList.add('show');
    //  this.profileEdit = false;
    //}
    //let usrprofileEdit1 = document.querySelector('.show');
    //if (usrprofileEdit1.classList.contains('show')) {
    //  usrprofileEdit1.classList.remove('show');
    //  usrprofileEdit1.classList.add('hide');
    //  this.profileEdit = true;
    //}
  }

  omit_special_char(event) {
    var k;
    k = event.keyCode;
    //         k = event.keyCode;  (Both can be used)
    //return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32);
  }
}
