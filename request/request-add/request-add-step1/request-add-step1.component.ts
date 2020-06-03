import { Component, OnInit, AfterViewChecked, AfterContentChecked, ɵbypassSanitizationTrustResourceUrl, HostListener } from '@angular/core';
import { UserCategoriesService } from 'src/app/shared/services/usercategory.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { User } from 'src/app/shared/models/user';
import { MeetingsService } from 'src/app/shared/services/meetings.service';
import { environment } from 'src/environments/environment.prod';
import { RequestCategories, CategoryMasterModel, RequestModel, ExternalAttendesModel } from 'src/app/shared/models/usercategory';
import { isNullOrUndefined, isNull } from 'util';
import { BehaviorSubject, Observable } from "rxjs";
import { Attendes } from 'src/app/shared/models/meetings';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { RequestService } from 'src/app/shared/services/request.service';
import { ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { debounce } from 'rxjs/operators';


@Component({
    selector: 'request-add-step1',
    templateUrl: './request-add-step1.component.html',
    styleUrls: ['./request-add-step1.component.css']
})
export class RequestAddStep1Component implements OnInit, AfterViewChecked {
    currentMeetingDetails = <RequestCategories>{};
    requestType: string;
    companyName: string;
    execName: string[] = [];
    requestCategories: CategoryMasterModel[] = [];
    currRequestCategories: CategoryMasterModel;
    meetingRequestData = <RequestCategories>{};
    clientDomain: string;
    checkSelected: any[] = [];
    selectDisabled: boolean = false;
    d = new String();
    enableToNextStep: boolean = false;
    enableToSubmitAttendees: boolean = false;
    enableList: boolean = false;
    browserBackPage: string = '';
    display: boolean = false;
    cssAddclass: any;
    isCheckedCategory: CategoryMasterModel[];
    externalAttendees: Attendes[];
    externalAttendesArray: ExternalAttendesModel[];
    fa: any;
    eamail: Attendes[];
    extArray: string[] = [];
    tempextrn: string = '';
    name: any = "";
    currentRoute: string = '';


    constructor(private meetingsService: MeetingsService, private _sharedService: SharedService, private router: Router, private _activatedRoute: ActivatedRoute,
        private _rservice: RequestService, private confirmationService: ConfirmationService,private route:ActivatedRoute) {      

      this.requestType = _activatedRoute.snapshot.params["id"];
      //this._sharedService.getCategoriesObservable().subscribe(message => {
      //  this.meetingRequestData = message,      
      //    this.processRequest();
      //});
  }

    ngAfterViewChecked() {
     

  }

    onCreateRequest() {
        this._sharedService.getCategoriesObservable().subscribe(message => {
            this.meetingRequestData = message,
            this.getDatafromLocalStorage();
                
        });

    }

  getDatafromLocalStorage() {    
        if (this.meetingRequestData == null || this.meetingRequestData == undefined) {
            this.meetingRequestData = JSON.parse(localStorage.getItem('step1Data'));
    }
    this.companyName = this.meetingRequestData.CompanyName;
      this.execName = this.meetingRequestData.executives;
      this.externalAttendees = this.meetingRequestData.attendes;
    this.requestCategories = this.meetingRequestData.categories;
    if (isNullOrUndefined(this.companyName)) {
      this.companyName = "";
    }
    if (this.meetingRequestData.MeetingId > 0) {
      for (var i = 0; i < this.requestCategories.length; i++) {
        if (this.companyName.trim()!='')
          this.requestCategories[i].isDisabled = false;
        if (this.companyName.trim() == '' && this.execName.length > 0 && i >= 2) {
          this.requestCategories[i].isDisabled = false;
        }
      }
      if (this.companyName.length > 0 || this.execName.length > 0) {
        let found = this.requestCategories.filter(c => c.isChecked == true);
        if (!isNullOrUndefined(found)) {
          if (found.length > 0) {
            this.enableToNextStep = true;
          }
          else {
            this.enableToNextStep = false;
          }
        }
        else {
          this.enableToNextStep = false;
        }
      }
    }
    }

    ngOnInit() {
      
        this.externalAttendesArray = [];
      this.clientDomain = environment.clientDomain;      
      this._sharedService.getCategoriesObservable().subscribe(message => {
        this.meetingRequestData = message,          
          this.processRequest();
      }).unsubscribe();
        //this.processRequest();              
        //below condition will be executed for a new request
      // if (this.requestType == 'create' && !this.meetingRequestData.isEditRequest) {
      //  this.meetingsService.getRequestsCategories().subscribe
      //    (
      //    data => {
      //        this.requestCategories = data,
      //        this.companyName = this.meetingRequestData.CompanyName,
      //        this.execName = this.meetingRequestData.executives,
      //        this.externalAttendees = this.meetingRequestData.attendes;
      //    });

      //  this.meetingRequestData.isEditRequest = true;
      //}
      ////below condition will be executed for editing an already submitted request or click of back button from step2
      //else {
      //  this.requestCategories = this.meetingRequestData.categories;
      //  this.setEnableForEditRequests();
      //  this.companyName = this.meetingRequestData.CompanyName;
      //  this.execName = this.meetingRequestData.executives;
      //  this.externalAttendees = this.meetingRequestData.attendes;

      //  let found = this.requestCategories.filter(c => c.isChecked == true);
      //  if (!isNullOrUndefined(found)) {
      //    if (found.length > 0) {
      //      this.enableToNextStep = true;
      //    }
      //    else {
      //      this.enableToNextStep = false;
      //    }
      //  }
      //  else {
      //    this.enableToNextStep = false;
      //  }

      //}
      //if (!isNullOrUndefined(this.meetingRequestData.attendes)) {
      //  this.externalAttendees = this.meetingRequestData.attendes;
      //    this.getExternalAttendes();
          
      //  }
      //   this.currentMeetingDetails = this._sharedService.requestCategories.value;
      this.route.url.subscribe(url => { this.currentRoute = url[0].path });
      localStorage.setItem('currentroute', this.currentRoute);


    }

  processRequest() {    
    this.externalAttendesArray = [];    
    this.clientDomain = environment.clientDomain;
    
        //below condition will be executed for a new request
        if (!isNullOrUndefined(this.meetingRequestData)) {
          if (this.requestType == 'create' && !this.meetingRequestData.isEditRequest) {                        
            this.meetingsService.getRequestsCategories().subscribe
                    (
              data => {                
                          this.requestCategories = data,                            
                            this.meetingRequestData.categories=data,                            
                                this.companyName = this.meetingRequestData.CompanyName,
                                this.execName = this.meetingRequestData.executives,
                            this.externalAttendees = this.meetingRequestData.attendes,
                            this.meetingRequestData.isEditRequest = true,
                            this._sharedService.sendCategoriesRequest(this.meetingRequestData),
                          localStorage.setItem('step1Data', JSON.stringify(this.meetingRequestData));
                        });
            }
            //below condition will be executed for editing an laredy submitted request or click of back button from step2
          else {            
                this.requestCategories = this.meetingRequestData.categories;
                this.setEnableForEditRequests();
                this.companyName = this.meetingRequestData.CompanyName;
                this.execName = this.meetingRequestData.executives;
                this.externalAttendees = this.meetingRequestData.attendes;

                let found = this.requestCategories.filter(c => c.isChecked == true);
            if (!isNullOrUndefined(found)) {
              if (isNullOrUndefined(this.companyName)) {
                this.companyName = "";
              }
              if (found.length > 0 && (this.companyName.length > 0 || this.execName.length > 0)) {
                        this.enableToNextStep = true;
                    }
                    else {
                        this.enableToNextStep = false;
                    }
                }
                else {
                    this.enableToNextStep = false;
                }

            }
            if (!isNullOrUndefined(this.meetingRequestData.attendes)) {
                this.externalAttendees = this.meetingRequestData.attendes;
                this.getExternalAttendes();

            }
            this.currentMeetingDetails = this._sharedService.requestCategories.value;
        }
        else {          
            this.getDatafromLocalStorage();
        }
    }

    ngAfterViewInit() {
        
    }
    

    setEnableForEditRequests() {
        
        for (let k = 0; k < this.requestCategories.length; k++) {
            if (this.meetingRequestData.requestId > 0) {
                this.requestCategories[k].isDisabled = false;
            }

            }
        }
    
   

    oncancelRequest() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to cancel the request?',
            header: 'Cancel Request',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.router.navigate(['/meetings'])
            },
            reject: () => {

            }
        });
    }

    selectAttendies() {
        this.display = true;
    }

  

  getCurrentRequestCategories(isdisabled: any, ischecked: any, enablenext: any, selection: string) {
    
      var cs = selection;
      var splitted = cs.split(",", cs.length);
      this.checkSelected = splitted;
      if (!isNullOrUndefined(this.meetingRequestData.categories)) {
        this.requestCategories = this.meetingRequestData.categories;
      }
  
      for (let i = 0; i < this.checkSelected.length; i++) {
        if (!isNullOrUndefined(this.requestCategories)) {
          if (this.requestCategories.length > 0) {
            this.currRequestCategories = this.requestCategories.find(c => c.name == this.checkSelected[i]);
            if (!isNullOrUndefined(this.currRequestCategories)) {
              this.currRequestCategories.isDisabled = isdisabled;
            }
          }
        }
      }
   
      var kk1 = this.requestCategories.filter(c => c.isChecked == true);


      if (kk1.length > 0) {
 
        for (let i = 0; i < kk1.length; i++) {
          if (this.checkSelected.find(x=>x == kk1[i].name)) {
            var categoryindex1 = this.requestCategories.findIndex(c => c.name == kk1[i].name);
            this.requestCategories[categoryindex1].isChecked = ischecked;

          }
        }
        var kk2 = this.requestCategories.filter(c => c.isChecked == true);
      
        if (kk2.length == 0) {
          if (!isNullOrUndefined(this.execName) && this.execName.length == 0 && this.companyName.length == 0) {



            this.enableToNextStep = false;
          }
          else {
            this.enableToNextStep = false;
          }


        }
        else if (kk2.length > 0 && (this.companyName.length > 0 || this.execName.length > 0)) {
          this.enableToNextStep = true;
        }
        else {
          this.enableToNextStep = false;
        }


      }
      else {
        this.enableToNextStep = false;
      }
    }

  OnUnSelectExecName(result: any) {
    
    
    if (this.execName.length == 0) {
    //  this.getCurrentRequestCategories(true, true, false, environment.exceutiveSelection);

    }
    if (this.execName.length == 0 && this.companyName.length == 0) {
      this.getCurrentRequestCategories(true, true, false, environment.companySelection);

    }
    if (this.execName.length > 0) {
      var execname = this.externalAttendesArray.filter(x => x.isChecked == true);
      this.getCurrentRequestCategories(false, true, false, environment.exceutiveSelection);
      for (let i = 0; i < this.externalAttendesArray.length; i++) {


        if (this.execName.indexOf(this.externalAttendesArray[i].email) > -1) {
          //  this.externalAttendesArray[i].isChecked = false;
        }
        else {
          this.externalAttendesArray[i].isChecked = false;
        }


      }
    }
    else {
      if (!isNullOrUndefined(execname)) {


        for (let i = 0; i < execname.length; i++) {
          this.externalAttendesArray[i].isChecked = false;
        }
      }
    }
  }
    addCompanyName(event: any) {
      
        var cn = event.target.value;
        var patt1 = /[0-9a-zA-Z_]/g;
        var result = cn.match(patt1);
        
      
        if (!isNullOrUndefined(result) && result.length > 0) {
            this.companyName = event.target.value;
            
            if (!isNullOrUndefined(this.execName)) {
              if (this.execName.length > 0) {
                var dd = environment.companySelection.replace(environment.exceutiveSelection, "");
                if (this.companyName.length < 1) {
          
                  this.getCurrentRequestCategories(false, false, false, dd);
                }
                else {
                
                  this.getCurrentRequestCategories(false, true, false, dd);
                }
              }
                else {
                    this.getCurrentRequestCategories(false, true, false, environment.companySelection);
                }
            }
            else {
                this.getCurrentRequestCategories(false, true, false, environment.companySelection);
          }
        }
        else {
            this.companyName = event.target.value;

          if (!isNullOrUndefined(this.execName)) {
            if (this.execName.length > 0) {
              var dd = environment.companySelection.replace(environment.exceutiveSelection,"");
              this.getCurrentRequestCategories(true, false, false,dd);
            }
            else {
              this.getCurrentRequestCategories(true, false, false, environment.companySelection);
            }
          }
          else {
            this.getCurrentRequestCategories(true, false, false, environment.companySelection);
          }
        }
    }

    addExecutiveName(result: any) {
      
        if (!isNullOrUndefined(result) && result.length > 0) {
        
            this.getCurrentRequestCategories(false, false, false, environment.exceutiveSelection);
        }
        else {
          
            this.getCurrentRequestCategories(true, false, false, environment.exceutiveSelection);
        }
    }


    checkValue(event: any, category: string) {
      
      if (!isNullOrUndefined(this.meetingRequestData.categories)) {
        console.log("this meeting request data=" + JSON.stringify(this.meetingRequestData.categories));
      }
      else {
        this.meetingRequestData.categories = this.requestCategories;
      }

        let selectedCat: CategoryMasterModel;
        var status = event.target.checked;

        let isexistingCat = 0;
        let categoryIndex = -1;
        let requestId = this.requestCategories.findIndex(c => c.name == category);

        if (!isNullOrUndefined(this.meetingRequestData.categories)) {
            categoryIndex = this.meetingRequestData.categories.findIndex(c => c.name == category);
        }
        if (categoryIndex > -1) {
            this.meetingRequestData.categories[categoryIndex].isChecked = status;
          this.isCheckedCategory = this.meetingRequestData.categories.filter(c => c.isChecked == true);
          if (isNullOrUndefined(this.companyName)) {
            this.companyName = "";
          }
        
          if (this.isCheckedCategory.length > 0 && ((this.companyName.length > 0) || (this.execName.length > 0))) {
                this.enableToNextStep = true;
            }
            else {
                this.enableToNextStep = false;
            }
        }
        else {
            categoryIndex = this.requestCategories.findIndex(c => c.name == category);
            this.requestCategories[categoryIndex].isChecked = status;
            this.meetingRequestData.categories.push(this.requestCategories[categoryIndex]);
        }
    }

    createRequest() {
        
        var id = 0;
        if (!isNullOrUndefined(this.companyName) || !isNullOrUndefined(this.execName)) {
            this.meetingRequestData.CompanyName = this.companyName;
            this.meetingRequestData.executives = this.execName;
            this._sharedService.sendCategoriesRequest(this.meetingRequestData);
            this.router.navigate(['/requestSubtypes', 'create']);
        }
    }


  onKeyUp(event: KeyboardEvent) {
    
      let tokenInput = event.srcElement as any;

    if (isNullOrUndefined(this.execName)) {
      this.execName = [];
    }
    let spinnerCls = document.querySelector('.pi-spinner');
    if (spinnerCls != null) {
      spinnerCls.classList.remove('pi-spinner');
      spinnerCls.classList.remove('pi-spin');
      spinnerCls.classList.remove('ui-autocomplete-loader');
    }

    if (tokenInput.value != 'Spacebar' && tokenInput.value != null && tokenInput.value != "" ) {
     
      if (this.companyName != "") {
        this.getCurrentRequestCategories(false, true, true, environment.exceutiveSelection);
      }
      if (this.companyName == "" && this.execName.length == 0 && tokenInput.value == null) {
        this.getCurrentRequestCategories(false, false, true, environment.exceutiveSelection);
      }
    }
    if (this.execName.length == 0) {
      if (tokenInput.value != "") {
        this.getCurrentRequestCategories(false, true, true, environment.exceutiveSelection);
      }
      if (tokenInput.value == "" && this.companyName != "") {
        this.getCurrentRequestCategories(false, true, true, environment.exceutiveSelection);

    }
      if (tokenInput.value == "" && this.companyName == "") {
      this.getCurrentRequestCategories(true, false, true, environment.exceutiveSelection);
    }
      
    }
      
      try {
          let spinnerCls = document.querySelector('.pi-spinner');
          if (spinnerCls != null) {
              spinnerCls.classList.remove('pi-spinner');
              spinnerCls.classList.remove('pi-spin');
              spinnerCls.classList.remove('ui-autocomplete-loader');
          }
      //  if (event.key === ' ' || event.key === 'Spacebar') {
        if (event.key === 'Enter') {
              let found: boolean = false;
              if (!isNullOrUndefined(tokenInput) && tokenInput.value != "") {
                  this.execName.push(tokenInput.value);
                  found = true;
              }
              var exec = this.execName.toString();

              if (!isNullOrUndefined(this.execName) && exec != '' && tokenInput.value != "") {
                  if (this.execName.length > 0) {
                      this.getCurrentRequestCategories(false, true, true, environment.exceutiveSelection);
                  }
              }
              else {
                  this.addExecutiveName(null);
              }
              tokenInput.value = null;
          }
         
          if (this.companyName.length > 0) {
              this.getCurrentRequestCategories(false, true, false, environment.companySelection);
          }
        }
        catch (error) {
            console.log(error);
        }
    }

    additionalPptSelect(event: any) {
        if (!isNullOrUndefined(this.execName)) {
            for (let k = 0; k < this.execName.length; k++) {
                let index = this.execName.findIndex(c => c == event);
                if (index == -1) {
                    this.execName.push(event);
                }
            }
        }
    }

    
    cancelAttendesSelection() {
        this.display = false;
    }

    getExternalAttendes() {
               
        var clientDomainArr = this.clientDomain.split(",");
        for (let i = 0; i < this.externalAttendees.length; i++) {
            let externalAttendes = this.externalAttendees.filter(c => c.attendeEmail.indexOf(clientDomainArr[i]) > -1)
            if (!isNullOrUndefined(externalAttendes)) {
                for (let j = 0; j < externalAttendes.length; j++) {
                    let findIndx = this.externalAttendesArray.findIndex(c => c.email == externalAttendes[j].attendeEmail);
                    if (findIndx == -1) {
                        this.externalAttendesArray.push({ email: externalAttendes[j].attendeEmail, isChecked: false });
                    }
                }
            }
        }
        if (this.externalAttendesArray.length > 0) {
            this.enableList = true;
            this.setAttendeesStateForEditBack();
        }
        else {
            this.enableList = false;
        }
    }

    setAttendeesStateForEditBack() {
        for (let j = 0; j < this.externalAttendesArray.length; j++) {
            let filter: string = '';
            if (!isNullOrUndefined(this.meetingRequestData)) {
                filter = !isNullOrUndefined(this.meetingRequestData.executives) ?
                    this.meetingRequestData.executives.find(c => c == this.externalAttendesArray[j].email):null;
                if (!isNullOrUndefined(filter)) {
                    if (filter.length > 0) {
                        this.externalAttendesArray[j].isChecked = true;
                    }
                }
            }
        }
    }

    getExecutiveSelection() {
      this.display = !this.display;
      var exec = this.externalAttendesArray.find(x => x.isChecked == true);
      if (exec != null) {
        this.enableToSubmitAttendees = true;
      }
      else {
        this.enableToSubmitAttendees = false;
      }
    }


  checkSelectedAttendee(event: any, attendes: string) {
    var status = event.target.checked;
    let findIndx = this.externalAttendesArray.findIndex(c => c.email == attendes);
    if (findIndx > -1) {
      this.externalAttendesArray[findIndx].isChecked = status;

      var dd = this.externalAttendesArray.find(x => x.isChecked == true);
      if (dd != null) {
        this.enableToSubmitAttendees = true;
      }
      else {
        this.enableToSubmitAttendees = false;
      }
      if (this.execName != null) {
        if (this.execName.length > 0) {
          let indx = this.execName.indexOf(this.externalAttendesArray[findIndx].email);
          if (indx > -1 && !status) {
            this.execName.splice(indx, 1);
          }
        }
      }
    
      if (this.companyName == "") {
        if (isNullOrUndefined(this.execName)) {
          this.addExecutiveName(null);
        }
        if (!isNullOrUndefined(this.execName)) {


          if (this.execName.length == 0) {
            this.addExecutiveName(null);
          }
        }
      }
      if (this.companyName != "") {
        if (!isNullOrUndefined(this.execName)) {
          if (this.execName.length > 0) {
            this.addExecutiveName(" ");
          }
        }
      }
    }
  }

    submitAtttendes() {
      this.display = false;
      for (let k = 0; k < this.externalAttendesArray.length; k++) {
        if (!isNullOrUndefined(this.execName)) {
          let findIndx = this.execName.findIndex(c => c == this.externalAttendesArray[k].email);
          if (findIndx > -1) {
            if (this.externalAttendesArray[k].isChecked == false) {
              this.execName.splice(findIndx, 1);
            }
          }
          else {

            if (this.externalAttendesArray[k].isChecked == true) {
              this.execName.push(this.externalAttendesArray[k].email);
            }
          }
        }
        else {
          this.execName = [];
          this.execName.push(this.externalAttendesArray[k].email);
        }
      }
        if (this.execName.length > 0) {
            this.getCurrentRequestCategories(false, true, false, environment.exceutiveSelection);
        }
        else {
            this.getCurrentRequestCategories(true, false, false, environment.exceutiveSelection);
        }
    }
  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {    
    console.log("Processing beforeunload...");
    // Do more processing...
    event.returnValue = false;
  }

}


