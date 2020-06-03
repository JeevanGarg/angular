import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RegisterService } from './register.service';
import { CoverageGroup, Roles, Designations, User } from '../../shared/models/user';
import { ToastrService, Toast } from 'ngx-toastr';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment.prod';
import { MultiSelectModule } from 'primeng/multiselect';
//import { SelectItem } from 'primeng/components/common/api';
import { SelectItem } from 'primeng/api';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  submitDisabled: boolean = true;
  registerForm: FormGroup;
  coverageGroupList: CoverageGroup[] = [];
  rolesList: Roles[] = [];
  desigList: Designations[] = [];
  officeList: any[] = [];
  userObj = new User;
  evsDomains: string[] = [];
  userDomain: string[] = [];
  genericErrorMessage = '';
  currentRoute: string = '';
  selectedGroups: number[] =[];
  coverageGroupChoices: SelectItem[] = [];
  coverageGroupNamesList: string[] = [];
  constructor(private registerService: RegisterService, private toastr: ToastrService, private router: Router,
    private route:ActivatedRoute) { }

  ngOnInit() {
    this.evsDomains = environment.evsDomain.split(',').filter(d => d.length > 0);
    this.userDomain = environment.clientDomain.split(',').filter(d => d.length > 0);
    let regexStringFirstPart = "^[a-zA-Z0-9._%+-]+@";
    let regexCombined: string = '';
    this.userDomain.forEach((ud) => regexCombined += regexStringFirstPart + ud + "$|");
    this.evsDomains.forEach((ed) => regexCombined += regexStringFirstPart + ed + "$|");
    regexCombined = regexCombined.substring(0, regexCombined.length - 1);    
    const regex= new RegExp(regexCombined,'i')
    console.log(regex);
        this.registerForm = new FormGroup(
          {            
            'email': new FormControl('', [Validators.required, Validators.pattern(regex)]),
            //'password': new FormControl('', [Validators.required]),
            'firstName': new FormControl('', [Validators.required, Validators.pattern("^[a-zA-Z ]*[a-zA-Z]+[ ]*[a-zA-Z ]*$")]),
            'lastName': new FormControl('', [Validators.required, Validators.pattern("^[a-zA-Z ]*[a-zA-Z]+[ ]*[a-zA-Z ]*$")]),
            //'phone': new FormControl('', [Validators.required, Validators.pattern('^(\([0-9]*\)?)?[0-9_ \(\)]*$')]),
            //'phone': new FormControl('', [Validators.required, Validators.pattern('^[1-9]{1}[0-9]{0,15}$')]),
            'phone': new FormControl('', [Validators.required]),
            'coverageGroup': new FormControl(''),
            //'designation': new FormControl('', [Validators.required]),
            //'confirmpassword': new FormControl('', [Validators.required, this.checkPasswords.bind(this)]),
            'officeId': new FormControl('', [Validators.required])
            //'timezoneInfo': new FormControl('', [Validators.required])
          });
      this.registerService.getallCoverageGroups().subscribe(cg => {
        this.coverageGroupList = cg,
        this.coverageGroupList.forEach((item) => { this.coverageGroupNamesList.push(item.title); this.coverageGroupChoices.push({ label: item.title, value: item.coverageId }); });
      });
      this.registerService.getOffices().subscribe(ofc => {
        this.officeList = ofc;
      });
    this.route.url.subscribe(url => { this.currentRoute = url[0].path });
    localStorage.setItem('currentroute', this.currentRoute);

      //this.registerService.getRoles().subscribe(role => {
      //  this.rolesList = role;
      //});

      //this.registerService.getDesignations().subscribe(desig => {
      // this.desigList = desig;
      //});      

      //this.registerService.getTimezones().subscribe(tz => {
        //this.timeZones = tz;
      //});
      
  }
  isCoverageInvalid(coverageGroupId) {
    if (coverageGroupId == null || coverageGroupId == undefined || coverageGroupId == 0) {
      return true;
    }
  }
  
  

  get formInstance() { return this.registerForm.controls; }

  checkPasswords(confirmPasswordControl:FormControl) { // here we have the 'passwords' group    
    if (confirmPasswordControl.dirty) {      
      let pass = this.registerForm.controls.password.value;
      let confirmPass = this.registerForm.controls.confirmpassword.value;
      if (confirmPass == '')
        return pass == confirmPass ? null : { notSame: false }
      return pass == confirmPass ? null : { notSame: true }
    }
    else {      
      return { notSame: false }
    }    
  }

  

  registeruser() {
    
    if ((this.formInstance.phone.value != '') ? this.registerForm.invalid : true) {
      this.genericErrorMessage = "*Please enter valid value to all the required fields";
    }
    else {
      this.genericErrorMessage = "";
      this.userObj = this.registerForm.value;
      this.userObj.coverageGroup = [];
      this.userObj.coverageGroup.splice(0, this.userObj.coverageGroup.length);
    // this.userObj.coverageGroup.push(this.registerForm.controls.coverageGroup.value);
      this.userObj.coverageGroup=this.registerForm.controls.coverageGroup.value;
      this.registerService.registerUser(this.userObj).subscribe(p => {
        if (p.status) {
          if (p.errorMessage.indexOf('exist') > -1) {
            this.toastr.info(p.errorMessage, 'User Registration');
          }
          else {
            this.toastr.success(p.errorMessage, 'User Registration');
          }
        }
        else {
          this.toastr.error(p.errorMessage,'User Registration')
        }
        this.router.navigate(['/login']);
      });
    }
  }
  
}
