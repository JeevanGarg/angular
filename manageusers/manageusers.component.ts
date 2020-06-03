import { Component, OnInit } from '@angular/core';
import { UsersService } from '../shared/services/users.service';
import { User, CoverageGroup, Roles, Designations, UserRole } from '../shared/models/user';
import { RegisterService } from '../authentication/register/register.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { environment } from 'src/environments/environment.prod';
import { ToastrService, Toast } from 'ngx-toastr';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
//import { SelectItem } from 'primeng/components/common/api';
import { SelectItem } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { isNullOrUndefined, isNull } from 'util';
import { NotificationSettingsService } from '../shared/services/notification-settings.service';
import { ActivatedRoute } from '@angular/router';
const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';
@Component({
  selector: 'app-manageusers',
  templateUrl: './manageusers.component.html',
  styleUrls: ['./manageusers.component.css']
})
export class ManageusersComponent implements OnInit {
  usersToShow: User[] = [];
  tabToShow: string = '';
  newUsersTab: string = 'New';
  approvedUsersTab: string = 'Approved';
  rejectedUsersTab: string = 'Rejected';
  userToEdit: number = 0;
  coverageGroupList: CoverageGroup[] = [];
  coverageGroupNamesList: string[] = [];
  rolesList: Roles[] = [];
  desigList: Designations[] = [];
  coverageGroupsSelected: number[] = [];
  userRoles = UserRole;
  recordsCount: number;
  searchTerm: string = '';
  isOnScroll: boolean = false;
  userEntityToEdit: User;
  coverageGroupChoices: SelectItem[] = [];
  userEntityToReject = new User;
  displayCommentsDialog: boolean = false;
  userFields: SelectItem[] = [];
  displayDownloadDialog: boolean = false;
  selectedUserFields: string[] = [];
  rangeDates: any[];
  isRangeValid: boolean;
  officeList: any[] = [];
  currentRoute: string = '';
  defaultSelect: any;
  constructor(private usersService: UsersService, private registerService: RegisterService,
    private ngxLoaderService: NgxUiLoaderService, private toastr: ToastrService, private datepipe: DatePipe,
    private myNotificationService: NotificationSettingsService,private route:ActivatedRoute) { }

  ngOnInit() {
    
    this.showNew(0);
    this.registerService.getallCoverageGroups().subscribe(cg => {
      this.coverageGroupList = cg;
      this.coverageGroupList.forEach((item) => { this.coverageGroupNamesList.push(item.title); this.coverageGroupChoices.push({ label: item.title, value: item.coverageId }); });
    });
    this.registerService.getRoles().subscribe(role => {
      this.rolesList = role;
    });

    this.registerService.getDesignations().subscribe(desig => {
      this.desigList = desig;
    });
    this.registerService.getOffices().subscribe(ofc => {
      this.officeList = ofc;
    });

    this.route.url.subscribe(url => { this.currentRoute = url[0].path });
    localStorage.setItem('currentroute', this.currentRoute);
  }

  showNew(lastUserId: number) {
    this.fetchUsers(lastUserId,null);
    this.tabToShow = this.newUsersTab;
  }

  showApproved(lastUserId: number) {
    this.fetchUsers(lastUserId,true);
    this.tabToShow = this.approvedUsersTab;
  }

  showRejected(lastUserId: number) {
    this.fetchUsers(lastUserId,false);
    this.tabToShow = this.rejectedUsersTab;
  }

  checkIfSelected(currentVal, selectedCoverageGroups) {
    if (selectedCoverageGroups.indexOf(currentVal) > -1) {
      return true;
    }
    else {
      return false;
    }
  }
  updateUser(userItem: User) {
    if (this.isNameInvalid(userItem.firstName) || this.isNameInvalid(userItem.lastName) || this.isPhoneInvalid(userItem.phone) || userItem.isApproved == null || this.isCoverageInvalid(userItem.coverageGroup)) {
      //do nothing
    }
    else {
      //if (!userItem.isApproved) {
      this.userEntityToReject = userItem;
      this.displayCommentsDialog = true;
      //}
      //else {
      //  this.saveUserData(userItem);        
      //}
    }
  }
  saveUserData(userItem) {
    let createNotificationSettings: boolean = this.userEntityToEdit.isApproved == null ? true : false;
    let userId = userItem.userId;
    this.usersService.updateUser(userItem).subscribe(op => {
      if (op.status) {
        if (createNotificationSettings) {
          this.myNotificationService.createNotificationSetting(userId).subscribe();
        }
        this.userToEdit = -1;
        if (op.errorMessage.toLowerCase().indexOf('notification')) {
          this.toastr.info(op.errorMessage, 'Manage Users');
        }
        else
          this.toastr.success(op.errorMessage, 'Manage Users');
        if (this.userEntityToEdit.isApproved != userItem.isApproved)
          this.usersToShow.splice(this.usersToShow.findIndex(p => p.userId == userItem.userId), 1);
        else {          
          userItem.roleName = this.rolesList.find(p => p.roleId == userItem.roleId).title;
          userItem.coverageGroupName.splice(0, userItem.coverageGroupName.length);
          this.coverageGroupList.forEach((p) => {
            userItem.coverageGroup.forEach((ps) => {
              if (ps == p.coverageId) {
                userItem.coverageGroupName.push(p.title);
              }
            });
            this.usersToShow[this.usersToShow.findIndex(p => p.userId == userItem.userId)] = JSON.parse(JSON.stringify(userItem));
          });
        }
        this.userEntityToEdit = null;
        //this.usersToShow[this.usersToShow.findIndex(p => p.userId == userItem.userId)] = JSON.parse(JSON.stringify(userItem));
      } else {
        this.toastr.error(op.errorMessage, 'Manage Users')
      }
    });
    this.displayCommentsDialog = false;
  }

  editUserRow(uitem) {
    if (this.userEntityToEdit != null && this.userEntityToEdit != undefined) {
      this.usersToShow[this.usersToShow.findIndex(p => p.userId == this.userEntityToEdit.userId)] = JSON.parse(JSON.stringify(this.userEntityToEdit));
    }
    this.userToEdit = uitem.userId;
    if (this.tabToShow == this.newUsersTab) {
      this.usersToShow.filter(p => p.userId == uitem.userId)[0].roleId = this.getDefaultRole(uitem.email);
    }
    this.userEntityToEdit = JSON.parse(JSON.stringify(uitem));
  }


  searchUsers(lastUserId: number) {
    if (this.tabToShow == this.newUsersTab) {
      this.showNew(lastUserId);
    }
    else if (this.tabToShow == this.approvedUsersTab) {
      this.showApproved(lastUserId);
    }
    else {
      this.showRejected(lastUserId);
    }
  }

  onScroll() {
    let lastUserId = this.usersToShow[this.usersToShow.length - 1].userId;
    this.searchUsers(lastUserId);
  }

  fetchUsers(lastUserId,isApproved) {
    this.ngxLoaderService.startBackground();
    this.usersService.getUsers(isApproved, this.searchTerm.trim().length < 3 ? '' : this.searchTerm.trim(), lastUserId).subscribe(usrs => {
      if (lastUserId == 0) {
        this.usersToShow = usrs;
        this.userToEdit = -1
        this.userEntityToEdit = null;
      }
      else {
        usrs.forEach((usr) => { if (this.usersToShow.findIndex(item => item.userId == usr.userId) == -1) { this.usersToShow.push(usr); } });
      }
      this.ngxLoaderService.stopBackground();
    });
  }

  isNameInvalid(name: string) {
    if (name.trim() == '')
      return true;
    let patternToMatch =/^[a-zA-Z ]*[a-zA-Z]+[ ]*[a-zA-Z ]*$/;
    if (!patternToMatch.test(name)) {
      return true;
    }
    return false;
  }

  isPhoneInvalid(phone: string) {
    if (phone == null || phone == undefined)
      return true;
    if (phone.toString().trim() == '') {
      return true;
    }
    //let patternToMatch = /^[1-9]{1}[0-9]{0,15}$/;
    //if (!patternToMatch.test(phone)) {
    //  return true;
    //}
    return false;
  }

  getDefaultRole(userEmail: string) {
    let evsDomains = environment.evsDomain.split(',').filter(d => d.length > 0);

    let editedUserDomain = userEmail.substring(userEmail.lastIndexOf("@") + 1, userEmail.length);
    if (evsDomains.findIndex(i => i.toLowerCase() == editedUserDomain.toLowerCase()) > -1) {
      return this.userRoles.Analyst;
    }
    else {
      return this.userRoles.Banker;
    }
  }

  isCoverageInvalid(coverageGroupId) {
    if (coverageGroupId == null || coverageGroupId == undefined || coverageGroupId == 0) {
      return true;
    }
  }
  roleChange(uitem) {
    this.usersToShow[this.usersToShow.findIndex(p => p.userId == uitem.userId)].coverageGroup = [];//.splice(0, this.usersToShow[this.usersToShow.findIndex(p => p.userId == uitem.userId)].coverageGroup.length);
    this.usersToShow[this.usersToShow.findIndex(p => p.userId == uitem.userId)].coverageGroupName = [];//.splice(0, this.usersToShow[this.usersToShow.findIndex(p => p.userId == uitem.userId)].coverageGroupName.length);
  }

  public exportAsExcelFile(myDataToDownload): void {
    var myFields: any[] = ['firstName', 'lastName', 'email'];
    var myData: any[] = [];
    for (var i = 0; i < this.usersToShow.length; i++) {
      //for (var j = 0; j < myFields.length; j++) {
      //  myData[i][j] = this.usersToShow[i][myFields[j]];
      //myData.push({  this.usersToShow[i][myFields[0]],  this.usersToShow[i][myFields[1]],  this.usersToShow[i][myFields[2]] });
      //}
    }
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(myDataToDownload);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    let fileName = 'CompanyPacketBuilder_';
    fileName += this.tabToShow == this.newUsersTab ? 'New' : this.tabToShow == this.approvedUsersTab ? 'Approved' : 'Rejected';
    this.saveAsExcelFile(excelBuffer, fileName);
  }
  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    FileSaver.saveAs(data, fileName + 'Users_' + new Date().getTime() + EXCEL_EXTENSION);
  }
  CancelDialog() {
    this.displayCommentsDialog = false;
    this.usersToShow.filter(p => p.userId == this.userEntityToEdit.userId)[0].comment = this.userEntityToEdit.comment;
  }

  isCommentInvalid(name: string) {
    if (name == null)
      return true;
    if (name == undefined)
      return true;
    if (name.trim() == '')
      return true;
    return false;
  }

  OpenDownloadDialog() {
    //this.displayDownloadDialog = true;    
    if (this.userFields.length == 0) {
      this.userFields.push({ label: 'First Name', value: 'firstName' });
      this.userFields.push({ label: 'Last Name', value: 'lastName' });
      this.userFields.push({ label: 'User Email', value: 'email' });
      this.userFields.push({ label: 'Phone', value: 'phone' });
      this.userFields.push({ label: 'Designation', value: 'designation' });
      this.userFields.push({ label: 'Role', value: 'role' });
      this.userFields.push({ label: 'Coverage Groups', value: 'coverageGroup' });
      this.userFields.push({ label: 'Office', value: 'Office' });
      this.userFields.push({ label: 'Approval Status', value: 'isApproved' });
      //this.userFields.push({ label: 'Created Date', value: 'createdDate' });
      //this.userFields.push({ label: 'Modified Date', value: 'modifiedDate' });
      this.userFields.push({ label: 'Comment', value: 'Comment' });
    }
    //this.selectedUserFields.splice(0, this.selectedUserFields.length);
    //if (this.selectedUserFields.length == 0) {
    //alert("");
    //this.selectedUserFields.push('Comment');
    //this.selectedUserFields.push('modifiedDate');
    //this.selectedUserFields.push('createdDate');
    //this.selectedUserFields.push('isApproved');
    //this.selectedUserFields.push('Office');
    //this.selectedUserFields.push('coverageGroup');
    //this.selectedUserFields.push('role');
    //this.selectedUserFields.push('designation');
    //this.selectedUserFields.push('phone');
    //this.selectedUserFields.push('email');
    //this.selectedUserFields.push('lastName');
    //this.selectedUserFields.push('firstName');      
    //}
    //console.log(this.selectedUserFields);
  }

  retrieveUsers() {
    console.log(this.rangeDates);
    if (this.selectedUserFields.length == 0) { return 1; }
    if (isNullOrUndefined(this.rangeDates))
    {
      this.isRangeValid = false;
      //return 1;      
    }
    else if (isNullOrUndefined(this.rangeDates[0]) || isNullOrUndefined(this.rangeDates[1])) {
      this.isRangeValid = false;
      return 1;
    }

    let startDate;
    let endDate;
    if (isNullOrUndefined(this.rangeDates)) {
      var d = new Date();
      d.setFullYear(2010);
      startDate = d;
      endDate = new Date();
    }
    else {
      var rangeDateToSplit = this.rangeDates + '';
      var splitDates = rangeDateToSplit.split(",");
      startDate = this.datepipe.transform(splitDates[0], 'EEE MMM dd yyyy');//.toUTCString();
      endDate = this.datepipe.transform(splitDates[1], 'EEE MMM dd yyyy');//.toUTCString();      
    }
    let orderedFields: string[] = [];
    this.userFields.forEach((f) => { if (this.selectedUserFields.indexOf(f.value)>-1) { orderedFields.push(f.label); } });
    this.usersService.downloadUsers(this.selectedUserFields, startDate, endDate, this.tabToShow == this.newUsersTab ? 'NULL' : this.tabToShow == this.approvedUsersTab ? 'true' : 'false').subscribe(o => {
      console.log(o);
      o.forEach((ite, inde) => {
        orderedFields.forEach((it, ind) => {
          Object.defineProperty(ite, it.toString(),
            Object.getOwnPropertyDescriptor(ite, ind.toString()));
          delete o[inde.toString()][ind.toString()];
        });
      });
      this.exportAsExcelFile(o);
    });
    this.rangeDates = null;

  }
  CancelDownloadDialog() {
    this.displayDownloadDialog = false;
  }

  omit_special_char(event) {
    var k;
    k = event.keyCode;
    //         k = event.keyCode;  (Both can be used)
    //return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32);
  }

  getOfficeName(officeId: any) {
    return this.officeList.find(it => it.id.toString() == officeId.toString()).officeName;
  }
}
