import { Component, OnInit, ElementRef, ViewChild, AfterContentChecked, Renderer2, HostListener} from '@angular/core';
import { UserCategoriesService } from 'src/app/shared/services/usercategory.service';
import { SharedService } from 'src/app/shared/services/shared.service';
import { User } from 'src/app/shared/models/user';
import { MeetingsService } from 'src/app/shared/services/meetings.service';
import { environment } from 'src/environments/environment.prod';
import { RequestCategories, CategoryMasterModel, RequestModel, ExternalAttendesModel, UserFavouritesModel, Results, FavouritesStatus, DefaultCategoriesModel } from 'src/app/shared/models/usercategory';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { moveItemInArray } from '@angular/cdk/drag-drop';
import { isNullOrUndefined } from 'util';
import { updateLocale } from 'moment';
import { strictEqual, ok } from 'assert';
import { TmplAstContent } from '@angular/compiler';
import { CookieService } from 'ngx-cookie-service';
//import { ConfirmationService } from 'primeng/components/common/api';
import { ConfirmationService } from 'primeng/api';
import { Observable, Subscription } from 'rxjs';
import { filter } from 'minimatch';
import { ISlimScrollOptions, SlimScrollEvent } from 'ngx-slimscroll';
import {ScrollPanelModule} from 'primeng/scrollpanel';

@Component({
    selector: 'request-add-step2',
    templateUrl: './request-add-step2.component.html',
    styleUrls: ['./request-add-step2.component.css']
})
export class RequestAddStep2Component implements OnInit, AfterContentChecked {

    allCategories: CategoryMasterModel[] = [];
    userNames: string[] = [];
    validUserDialog: boolean = true;
    internalEVSAttendeesList: string[] = [];
    subCategories: CategoryMasterModel[] = [];
    childCategories: CategoryMasterModel[] = [];
    parentCategories: CategoryMasterModel[] = [];
    iconList: string[] = [];
    requestMethod: string;
    evsDomains: string[] = [];
    clientDomains: string[] = [];
    favourites: UserFavouritesModel[] = [];
    favStatus = new FavouritesStatus;
    additionalIns: any;
    ccName1: string = '';
    requestCategories: CategoryMasterModel[] = [];
    envEVSDomain: string;
    envClientDomain: string;
    yearRange: any;
    coverageGroup: string;
    roleId: number;
    modifiedCategoryID: number;
    isfavSaved: boolean = false;
    isFavUpdate: boolean = false;
    isaddInformation: boolean = false;
    isDeletedFav = new FavouritesStatus;
    parentCatID: number = 0;
    nextCatID: number = 0;
    loadChild: boolean = false;
    minDateValue: any;
    maxDateValue: any;
    companyName: string='';
    currentCatId: number;
    currCat: string;
    nextCatId: string;
    txtAddIns: string = '';
    txtAddTeam: string = '';
    deadline: Date;
    deadlineValid: boolean[] = [];
    selectedOption: string;
    request = <RequestModel>{};
    userName: string;

    isSaved: boolean = false;
    result = <Results>{};
    Seltime: any;
    SeltimeText: any;
    deadlineRange: any;
    deadlineOption: any;
    selectedDate: any;
    selectedtime: any;
    currentDate: Date;
    dispCat: string;
    selectedMeeetingDate: string;
    isTabActive: boolean = false;
    isFavData: boolean = false;
    favClass: string;
    isTest: boolean;
    isSubmitEnabled: boolean;
    isNextEnabled: boolean = true;
    isPreviousEnabled: boolean = false;
    isDoneEnabled: boolean = false;
    displayFavDialog: boolean = false;
    display: boolean = false;
    parentElements: string[];
    additional: string[];
    sendParent: string[];
    additionalUsers: User[] = [];
    _diffInHour: any;
    isAddShow: boolean = false;
    meetingReqCategories = <RequestCategories>{};
    meetingRequestData = <RequestCategories>{};
    isReqTypeDialog: boolean = false;
    activeTab: string;
    lengthCat: number = 0;
    userId: any = '';
    filteredUsers: any[];
    User: any;
    minDate;
    maxDate;
    minTime;
    maxTime;
    currentRoute: string = '';
    isCustomDateValid;
    SavedFavorites: DefaultCategoriesModel[] = [];
    NothingSelected: boolean;
    public custom_sel: boolean = false;
    browserBackPage: string = '';
    iscompanyValid: boolean;
    _companyName: string;
    executivename: string='';
    visited: string[] = [];
    displayFavoriteDialog: boolean = false;
    isDoneClickedForFavoriteDialog: boolean = false;
    categoryIdForFavoriteDialog: number = 0;
    isNextclick: boolean;
    isPreviousClicked: boolean;
    currentIndex: any;
    opts: ISlimScrollOptions;
    scrollEvents: EventEmitter<SlimScrollEvent>;
    constructor(private categoriesService: UserCategoriesService, private datepipe: DatePipe, private router: Router, private cookie: CookieService,
      private _sharedService: SharedService, private confirmationService: ConfirmationService, private _meetingService: MeetingsService, private renderer: Renderer2,
        private cd: ChangeDetectorRef, private route: ActivatedRoute) {
           
        this._sharedService.getCategoriesObservable().subscribe(message => {
            this.meetingReqCategories = message
           
        });
    }

    getstep2DatafromStorage() {
        if (this.meetingRequestData == null || this.meetingRequestData == undefined) {
            this.meetingRequestData = JSON.parse(localStorage.getItem('step1Data'));
        }
    }


  ngOnInit() {
    this.userId = localStorage.getItem('user_id');
    this.coverageGroup = localStorage.getItem('coverage_group');
    this.roleId = !isNullOrUndefined(localStorage.getItem('role_id')) ? parseInt(localStorage.getItem('role_id')) : 0;
    this.envEVSDomain = environment.evsDomain;
    this.companyName = '';
    this.executivename = '';
         
    this.envClientDomain = environment.clientDomain;
    this.evsDomains = !isNullOrUndefined(this.envEVSDomain) ? this.envEVSDomain.split(',').filter(c => c.length > 0) : null;
    this.clientDomains = !isNullOrUndefined(this.envClientDomain) ? this.envClientDomain.split(',').filter(c => c.length > 0) : null;
    if (this.meetingReqCategories == null || this.meetingReqCategories == undefined) {
      this.router.navigate(['/requestCategories', 'create']);
    }
    else {
      this.processRequestStep2();
    }

    this.route.url.subscribe(url => { this.currentRoute = url[0].path });
    localStorage.setItem('currentroute', this.currentRoute);
  }

    processRequestStep2() {
        if (!isNullOrUndefined(this.meetingReqCategories)) {
            this.companyName = this.meetingReqCategories.CompanyName;
            this.executivename = !isNullOrUndefined(this.meetingReqCategories.executives) ? this.meetingReqCategories.executives.join(', ') : null;
            this.subCategories = [];
            this.lengthCat = this.parentCategories.length;
            this.favClass = 'fa - heart - o';
            this.yearRange = '2000: 2030';
            //let favoriteIcon = document.querySelector('.FavourtIcon');
            // this is to cater browser back from step 3. If user hits browser back on step 3 then following ocde would return some user selections, set that to all categories
            // and don't set allcategories on the next line of code
            this._sharedService.getUserSelections().subscribe(o => { if (o != null || o.length > 0) { this.allCategories = o; } }).unsubscribe();
            //retrieving visited categories if any
            this._sharedService.getUserVisitedCategories().subscribe(o => { if (o != null) { this.visited = o; } }).unsubscribe();
            this.categoriesService.getCategories(this.meetingReqCategories).subscribe
                (
                    data => {

                        // if we have allCategories from previous step no need to fill it
                        if (this.allCategories.length <= 0 || this.allCategories == null) {
                            this.allCategories = data;
                        }
                        if (this.meetingReqCategories.requestId > 0) {
                            this.categoriesService.retrieveFavourites(this.userId).subscribe(myFavs => {
                                if (myFavs != null) {
                                    for (var i = 0; i < myFavs.length; i++) {
                                        this.SavedFavorites.push(new DefaultCategoriesModel({
                                            categoryId: myFavs[i].categoryId,
                                            name: myFavs[i].name,
                                            isChecked: myFavs[i].isChecked == null ? false : myFavs[i].isChecked,
                                            parentCategory: myFavs[i].parentCategory
                                        }));
                                    }
                                }
                                else { this.SavedFavorites = myFavs; }

                                //this is only invoked to clean favorites before we want to insert anything into it from start. This is done locally and not on db.
                                //If we don't delete then from subequent request from same session, the code would insert duplicate favorites                        
                                this._sharedService.deleteAllFavorites();
                                this._sharedService.setSavedFavorites(this.SavedFavorites);
                                this.parentCategories = this.meetingReqCategories.categories.filter(c => c.isChecked == true);

                                let parentCategoriesFromAllCategories: string[] = [];
                                this.allCategories.forEach((ac) => { if (ac.parentCategory == 0) { parentCategoriesFromAllCategories.push(ac.name) } });
                                for (var i = 0; i < this.parentCategories.length; i++) {
                                    if (parentCategoriesFromAllCategories.indexOf(this.parentCategories[i].name) == -1) {
                                        if (this.allCategories.filter((t) => t.name == this.parentCategories[i].name).length == 0) {
                                            this.allCategories.push(data.filter((df) => df.categoryId == this.parentCategories[i].categoryId)[0]);
                                            data.filter((df) => df.parentCategory == this.parentCategories[i].categoryId).forEach((eachParent) => {
                                                if (this.allCategories.filter((t) => t.categoryId == eachParent.categoryId).length == 0) {
                                                    this.allCategories.push(eachParent);
                                                }
                                                data.filter((ndf) => ndf.parentCategory == eachParent.categoryId).forEach((eachChild) => {
                                                    if (this.allCategories.filter((t) => t.categoryId == eachChild.categoryId).length == 0) {
                                                        this.allCategories.push(eachChild);
                                                    }
                                                });
                                            });
                                        }
                                    }
                                }
                                //case of deleting something
                                for (var i = 0; i < parentCategoriesFromAllCategories.length; i++) {
                                    if (this.parentCategories.findIndex((pc) => pc.name == parentCategoriesFromAllCategories[i]) == -1) {
                                        var tempCategoryId = this.allCategories.filter((t) => t.name == parentCategoriesFromAllCategories[i])[0].categoryId;
                                        this.allCategories.filter((df) => df.parentCategory == tempCategoryId).forEach((eachParent) => {
                                            this.allCategories.filter((ndf) => ndf.parentCategory == eachParent.categoryId).forEach((eachChild) => {
                                                this.allCategories.splice(this.allCategories.findIndex((ac) => ac.categoryId == eachChild.categoryId), 1);
                                            });
                                            this.allCategories.splice(this.allCategories.findIndex((ac) => ac.categoryId == eachParent.categoryId), 1);
                                        });
                                        this.allCategories.splice(this.allCategories.findIndex((ac) => ac.name == parentCategoriesFromAllCategories[i]), 1);
                                        if (this.visited.indexOf(parentCategoriesFromAllCategories[i]) >= 0) {
                                            this.visited.splice(this.visited.indexOf(parentCategoriesFromAllCategories[i]), 1);
                                        }
                                    }
                                }

                                this.parentCatID = this.parentCategories[0].categoryId,
                                    this.currCat = this.parentCategories[0].name,
                                    this.activeTab = this.parentCategories[0].name;
                                if (this.visited == [] || this.visited.lastIndexOf(this.activeTab) == -1) {
                                    this.visited.push(this.activeTab);
                                }

                                this.getFavouritesStatus(this.parentCategories[0].categoryId);
                                //changing the sequence of method call
                                this.PopulateDetailsforSubcategories(this.parentCategories[0].categoryId);

                            });
                        }
                        else {
                            for (var i = 0; i < data.length; i++) {
                                this.SavedFavorites.push(new DefaultCategoriesModel({
                                    categoryId: data[i].categoryId,
                                    name: data[i].name,
                                    isChecked: data[i].isChecked == null ? false : data[i].isChecked,
                                    parentCategory: data[i].parentCategory
                                }));
                            }
                            //this is only invoked to clean favorites before we want to insert anything into it from start. This is done locally and not on db.
                            //If we don't delete then from subequent request from same session, the code would insert duplicate favorites
                            this._sharedService.deleteAllFavorites();
                            this._sharedService.setSavedFavorites(this.SavedFavorites);
                            this.parentCategories = this.meetingReqCategories.categories.filter(c => c.isChecked == true);

                            let parentCategoriesFromAllCategories: string[] = [];
                            this.allCategories.forEach((ac) => { if (ac.parentCategory == 0) { parentCategoriesFromAllCategories.push(ac.name) } });
                            for (var i = 0; i < this.parentCategories.length; i++) {
                                if (parentCategoriesFromAllCategories.indexOf(this.parentCategories[i].name) == -1) {
                                    if (this.allCategories.filter((t) => t.name == this.parentCategories[i].name).length == 0) {
                                        this.allCategories.push(data.filter((df) => df.categoryId == this.parentCategories[i].categoryId)[0]);
                                        data.filter((df) => df.parentCategory == this.parentCategories[i].categoryId).forEach((eachParent) => {
                                            if (this.allCategories.filter((t) => t.categoryId == eachParent.categoryId).length == 0) {
                                                this.allCategories.push(eachParent);
                                            }
                                            data.filter((ndf) => ndf.parentCategory == eachParent.categoryId).forEach((eachChild) => {
                                                if (this.allCategories.filter((t) => t.categoryId == eachChild.categoryId).length == 0) {
                                                    this.allCategories.push(eachChild);
                                                }
                                            });
                                        });
                                    }
                                }
                            }
                            //case of deleting something
                            for (var i = 0; i < parentCategoriesFromAllCategories.length; i++) {
                                if (this.parentCategories.findIndex((pc) => pc.name == parentCategoriesFromAllCategories[i]) == -1) {
                                    var tempCategoryId = this.allCategories.filter((t) => t.name == parentCategoriesFromAllCategories[i])[0].categoryId;
                                    this.allCategories.filter((df) => df.parentCategory == tempCategoryId).forEach((eachParent) => {
                                        this.allCategories.filter((ndf) => ndf.parentCategory == eachParent.categoryId).forEach((eachChild) => {
                                            this.allCategories.splice(this.allCategories.findIndex((ac) => ac.categoryId == eachChild.categoryId), 1);
                                        });
                                        this.allCategories.splice(this.allCategories.findIndex((ac) => ac.categoryId == eachParent.categoryId), 1);
                                    });
                                    this.allCategories.splice(this.allCategories.findIndex((ac) => ac.name == parentCategoriesFromAllCategories[i]), 1);
                                    if (this.visited.indexOf(parentCategoriesFromAllCategories[i]) >= 0) {
                                        this.visited.splice(this.visited.indexOf(parentCategoriesFromAllCategories[i]), 1);
                                    }
                                }
                            }

                            this.parentCatID = this.parentCategories[0].categoryId,
                                this.currCat = this.parentCategories[0].name,
                                this.activeTab = this.parentCategories[0].name;
                            if (this.visited == [] || this.visited.lastIndexOf(this.activeTab) == -1) {
                                this.visited.push(this.activeTab);
                            }

                            this.getFavouritesStatus(this.parentCategories[0].categoryId);
                            //changing the sequence of method call
                            this.PopulateDetailsforSubcategories(this.parentCategories[0].categoryId);
                        }
                    }
                );



            this.Seltime = '';
            this.SeltimeText = '';


            this.deadlineRange = [
                { "time": environment.deadlineRange12Hrs },
                { "time": environment.deadlineRange24Hrs },
                { "time": environment.deadlineRange48Hrs },
                { "time": environment.deadlineRangeCustom }
            ];


            this.isTabActive = true;
            
            this.validateDeadline(this.deadlineRange);
            this._meetingService.getRequestsCategories().subscribe
                (
                    data => {
                        this.requestCategories = data;
                    },
                );
            this.requestMethod = this.route.snapshot.paramMap.get('id');
            this.iconList = ['img_sprite PIB_Icon', 'img_sprite Icon_2', 'img_sprite Icon_3', 'img_sprite PIB_Icon'];
            this.cd.detectChanges();
            //if set collapse category is set to false it would collapse all the categories, this is utilized when we toggle favorites but that doesn't change the checked status of child items
            this._sharedService.setCollapseCategory(false);
            this.scrollEvents = new EventEmitter<SlimScrollEvent>();
            this.opts = {
                position: "right", // left | right
                barBackground: "red", // #C9C9C9
                barOpacity: "0.8", // 0.8
                barWidth: "5", // 10
                barBorderRadius: "20", // 20
                barMargin: "0", // 0
                gridBackground: "#d9d9d9", // #D9D9D9
                gridOpacity: "1", // 1
                gridWidth: "5", // 2
                gridBorderRadius: "20", // 20
                gridMargin: "0", // 0
                alwaysVisible: true, // true
                visibleTimeout: 1000, // 1000
            }

        }
    else
    {
        this.getstep2DatafromStorage();
    }

    }


  gobackStep1() {
    this._sharedService.sendCategoriesRequest(this.meetingReqCategories);
    //storing step 2 selections, we'll utilize it when user comes to step 2 from step 1
    this._sharedService.setUserSelections(this.allCategories);
    //storing step 2 visited categories
    this._sharedService.setUserVisitedCategories(this.visited);
    this.router.navigate(['/requestCategories', 'req']);
  }

  ngAfterContentChecked() {
    if (!isNullOrUndefined(this.meetingReqCategories)) {
      this.parentCategories = this.meetingReqCategories.categories.filter(c => c.isChecked == true);
      console.log("request-add aftercontent parentcategories=" + JSON.stringify(this.parentCategories))
    }
  }

  //getFavouritesStatus(parentCategory: number) {

  //  let favStatus = this.categoriesService.getFavouritesStatus(this.userId, parentCategory).subscribe
  //    (data => {
  //      this.favStatus = data,
  //        this.setFavouritesIcon(this.favStatus.isFav);        
  //    });
  //}

  getFavouritesStatus(parentCategory: number) {    
    let mySavedselections: DefaultCategoriesModel[] = [];
    let originalselections: DefaultCategoriesModel[] = [];
    let mySavedFavorites: DefaultCategoriesModel[] = [];
    //retrieving saved favorites for category - first we are saving parent categories
    this.allCategories.filter((t) => t.parentCategory == parentCategory).forEach((tsub) => {
      let obj: DefaultCategoriesModel = new DefaultCategoriesModel({ categoryId: tsub.categoryId, name: tsub.name, isChecked: tsub.isChecked == null ? false : tsub.isChecked, parentCategory: tsub.parentCategory });

      mySavedselections.push(obj);
      //code to save sub categories/child
      this.allCategories.filter(t => t.parentCategory == obj.categoryId).forEach((tchild) =>
        mySavedselections.push(new DefaultCategoriesModel({ categoryId: tchild.categoryId, name: tchild.name, isChecked: tchild.isChecked == null ? false : tchild.isChecked, parentCategory: tchild.parentCategory })
        ));
    });

    //we'll fetch default order here
    let myTempData: DefaultCategoriesModel[] = [];
    //let tempCategories: number[] = [];
    this._sharedService.getDefaultCategories().subscribe(
      o => {
        myTempData = o;
        myTempData.filter((t) => t.parentCategory == parentCategory).forEach((tsub, tindex) => {
          originalselections.push(tsub);
          //tempCategories.push(tsub.categoryId);
          myTempData.filter(t => t.parentCategory == tsub.categoryId).forEach((tchild, tchildIndex) => {
            originalselections.push(tchild);
            //tempCategories.push(tchild.categoryId);
          });
        });
      }
    );

    //retrieve saved favorites
    let tempSubscriptionForFavorites = this._sharedService.getSavedFavorites().subscribe(o => {
      //since we are setting saved favorites as null(in request-add.component.ts) in case there is no favorite for category, thats why we are adding a check for that here
      if (o != null) {
        //mySavedFavorites = o;
        //comparing all saved favorites with all default
        if (JSON.stringify(myTempData) == JSON.stringify(o)) {
          //set favorites as null as there is no favorite
          //deleting all saved favorites as there is no favorite for this user          
          this._sharedService.deleteAllFavorites();
        } else {
          o.filter((t) => t.parentCategory == parentCategory).forEach((tsub) => {
            let obj: DefaultCategoriesModel = new DefaultCategoriesModel({ categoryId: tsub.categoryId, name: tsub.name, isChecked: tsub.isChecked == null ? false : tsub.isChecked, parentCategory: tsub.parentCategory });
            mySavedFavorites.push(obj);
            //categoryIds.push(obj.categoryId);
            o.filter(t => t.parentCategory == obj.categoryId).forEach((tchild) => mySavedFavorites.push(tchild));
          });
        }
      }
    });
    tempSubscriptionForFavorites.unsubscribe();
    console.log('originalselections');
    console.log(originalselections);
    console.log('mySavedselections');
    console.log(mySavedselections);
    console.log('mySavedFavorites');
    console.log(mySavedFavorites);
    let myFavStatus = new FavouritesStatus();
    if (JSON.stringify(originalselections) == JSON.stringify(mySavedFavorites) || mySavedFavorites.length == 0) {
      //saved selection is same as default      
      //myFavStatus.      
      myFavStatus.isFav = false;
      myFavStatus.isNew = true;
      myFavStatus.parentCategory = parentCategory;
      this.favStatus = myFavStatus;
      this.setFavouritesIcon(myFavStatus.isFav);
      this._sharedService.setFavoritesStatus(myFavStatus);
      //no favorite thats why setting it to null, this would also be utilized in request-add-details.component.ts

      //this._sharedService.setSavedFavorites(null);      
    }
    else {
      //saved current selection is not same as default      
      //now check if my current selection is same as my saved favorites      
      if (JSON.stringify(mySavedFavorites) == JSON.stringify(mySavedselections)) {
        //mySavedFavorites == mySavedselections        
        myFavStatus.isFav = true;
        myFavStatus.parentCategory = parentCategory;
        myFavStatus.isNew = false;
        this.favStatus = myFavStatus;
        this.setFavouritesIcon(myFavStatus.isFav);
        this._sharedService.setFavoritesStatus(myFavStatus);
        //this._sharedService.setSavedFavorites(mySavedselections);
      }
      else {
        //my current selection is different from my saved favorites                
        myFavStatus.isFav = false;
        myFavStatus.parentCategory = parentCategory;
        myFavStatus.isNew = false;
        this.favStatus = myFavStatus;
        this.setFavouritesIcon(myFavStatus.isFav);
        this._sharedService.setFavoritesStatus(myFavStatus);
      }
      //favorites exist thats why setting it to that value, this would also be utilized in request-add-details.component.ts
      //this.enableDisableNavigationButtons(parentCategory);            
    }
    //check if we have at least one selection and based upon that disable navigation buttons
    this.checkIfAtLeastOneIsSelected(parentCategory);
  }

  enableDisableNavigationButtons(parentCategory: number) {
    if (this.parentCategories.findIndex(p => p.categoryId == parentCategory) == 0 && this.parentCategories.length == 1) {
      //since there is just 1 category and it has selections, only enable Done button
      this.isNextEnabled = false;
      this.isPreviousEnabled = false
      this.isDoneEnabled = this.visited.length == this.parentCategories.length;      
    }
    else if (this.parentCategories.findIndex(p => p.categoryId == parentCategory) == 0 && this.parentCategories.length > 1) {
      //we are on first category and there are more, so only enable next button as we already have some selections
      this.isNextEnabled = true;
      this.isPreviousEnabled = false
      //this.isDoneEnabled = false;
      //this will enable done button if we have visited all categories, else it will mark them as disabled
      this.isDoneEnabled = this.visited.length == this.parentCategories.length;      
    }

    else if (this.parentCategories.findIndex(p => p.categoryId == parentCategory) > 0 && this.parentCategories.length - 1 == this.parentCategories.findIndex(p => p.categoryId == parentCategory)) {
      //we are on category thats is last ,so enable previous and done buttons as we already have some selections
      this.isNextEnabled = false;
      this.isPreviousEnabled = true
      this.isDoneEnabled = this.visited.length == this.parentCategories.length;      
    }
    else if (this.parentCategories.findIndex(p => p.categoryId == parentCategory) > 0 && this.parentCategories.length - 1 > this.parentCategories.findIndex(p => p.categoryId == parentCategory)) {
      //we are on category which is neither first nor last, so enable previous and next buttons as we already have some selections
      this.isNextEnabled = true;
      this.isPreviousEnabled = true
      //this.isDoneEnabled = false;
      //this will enable done button if we have visited all categories, else it will mark them as disabled
      this.isDoneEnabled = this.visited.length == this.parentCategories.length;      
    }
    //if nothing is selected for any of the main categories then disable Done button - Siddhartha
    this.parentCategories.forEach((selectedParent) => {
      if (this.allCategories.filter((all) => all.parentCategory == selectedParent.categoryId && all.isChecked).length <= 0) {
        this.isDoneEnabled = false;        
      }
    });      
  }

  //Added to validate datetime entered by datetime picker, disabling submit button based upon that and also setting min date to current date -1 minute
  validateCustomDate() {
    if (this.selectedDate < new Date() || this.selectedDate > this.maxDate) {
      this.isNextEnabled = false;
      this.isCustomDateValid = false;
      this.selectedDate = new Date();
      this.selectedDate = this.selectedDate.addMinutes(-1);
    }
    else {
      this.isNextEnabled = true;
      this.isCustomDateValid = true;
    }
    this.minDate = new Date();
  }
  ondeadline() {
    //Modified to validate datetime entered by datetime picker
    if (this.deadlineOption == "custom") {
      this.custom_sel = true;
      this.isNextEnabled = false;
      this.minDate = new Date();
      this.maxDate = new Date(this.meetingReqCategories.MeetingStartTime);
    }
    else {
      this.custom_sel = false;
      if (this.deadlineOption != null) {
        //this will enable submit button when selected option is not custom
        this.isNextEnabled = true;
      }
      else
        this.isNextEnabled = false;
    }
    this.isCustomDateValid = true;

  }

  addCompanyName(event: any) {
    if (!isNullOrUndefined(event.target.value)) {
      this.iscompanyValid = true;
    }
    else { this.iscompanyValid = false; }
  }

  validateDeadline(deadlineRange: any) {
    for (let j = 0; j < deadlineRange.length; j++) {
      if (deadlineRange[j]["time"] == environment.deadlineRangeCustom) {
        this.deadlineValid.push(true);
      }
      else {
        let deadlineValue = deadlineRange[j]["time"];
        let hoursFrmDeadline = parseInt(deadlineValue.substring(0, 2));

        let currentDate = new Date();
        //let meetingDate = new Date(this.meetingStartDate);        
        let meetingDate = new Date(this.meetingReqCategories.MeetingStartTime);
        let difference = Math.abs(meetingDate.valueOf() - currentDate.valueOf()) / 3600000;
        console.log('Diff is:' + difference);

        if (hoursFrmDeadline < difference) {
          console.log(deadlineValue + "," + hoursFrmDeadline + "," + difference);
          this.deadlineValid.push(true);
        }
        else {
          console.log(deadlineValue + "," + hoursFrmDeadline + "," + difference);
          this.deadlineValid.push(false);
        }
      }
    }
  }

  setFavouritesIcon(isfav: boolean, modifyFavObject: boolean = false, favO = null) {
    //let favoriteIcon = document.querySelector('.FavourtIcon');
    if (isfav) {
      //favoriteIcon.classList.remove('fa-heart-o');
      //favoriteIcon.classList.add('fa-heart');
    }
    else {
      //favoriteIcon.classList.remove('fa-heart');
      //favoriteIcon.classList.add('fa-heart-o');
    }
    this.favStatus.isFav = isfav;
    if (modifyFavObject) {
      this.favStatus = favO;
    }
    //storing step 2 selections, we'll utilize it when user comes to step 2 from step 1
    this._sharedService.setUserSelections(this.allCategories);
    //storing step 2 visited categories
    this._sharedService.setUserVisitedCategories(this.visited);
  }

  updateCategories(event: CategoryMasterModel[]) {
    let origIndex: number[] = [];
    for (let i = 0; i < this.allCategories.length; i++) {
      let filteredItems = event.filter(c => c.categoryId == this.allCategories[i].categoryId);
      let index = this.allCategories.indexOf(filteredItems[0]);
      if (index > -1) {
        this.allCategories[index] = null;
        origIndex.push(index);
      }
    }
    for (let k = 0; k < event.length; k++) {
      let newIndex = origIndex[k];
      this.allCategories[newIndex] = event[k];
    }
    this.isFavUpdate = true;
  }

  updateModifiedCategoryId(event: any) {

    this.modifiedCategoryID = event;
    console.log('par id rec mod' + this.modifiedCategoryID);
  }

  updateCheckedState(event: CategoryMasterModel) {
    let subCategory: number;
    let parentCategory: number;
    let index = this.allCategories.findIndex(c => c.categoryId == event.categoryId);
    if (index > -1) {
      this.allCategories[index] = event;
    }
    subCategory = this.allCategories.findIndex(c => c.categoryId == event.parentCategory);
    parentCategory = this.allCategories.findIndex(c => c.categoryId == this.allCategories[subCategory].parentCategory);
    if (subCategory > -1) {
      //adding condition so that on unchecking of child sub category, the parent doesn't get unchecked
      if (event.isChecked) {
        this.allCategories[subCategory].isChecked = event.isChecked;
      }
    }
    //removing this condition as it was delestcting parent categories on deselecting sub categories
    //if (parentCategory > -1) {
    //  this.allCategories[parentCategory].isChecked = event.isChecked;
    //}
    if (this.parentCatID == event.parentCategory) {
      this.isFavUpdate = true;
    }
    //check if something is selected and based on that enable/disable navigation buttons
    this.checkIfAtLeastOneIsSelected(this.parentCatID);

  }

  checkIfAtLeastOneIsSelected(parentCategory: number) {
    let returnValue: boolean = false;
    this.allCategories.filter((t) => t.parentCategory == parentCategory).forEach((tsub) => {
      if (tsub.isChecked) {
        returnValue = true;
      }
    });

    if (returnValue) {
      this.enableDisableNavigationButtons(parentCategory);
      this.NothingSelected = false;
    }
    else {
      this.isNextEnabled = false;
      this.isPreviousEnabled = false;
      this.isDoneEnabled = false;
      this.NothingSelected = true;
    }

  }

  PopulateDetailsforSubcategories(parentCategory: number) {
    this.subCategories = [];
    for (let j = 0; j < this.allCategories.length; j++) {
      if (this.allCategories[j].parentCategory == parentCategory) {
        this.subCategories.push(this.allCategories[j]);
      }
    }
    for (let k = 0; k < this.subCategories.length; k++) {
      let childItems = this.allCategories.filter(c => c.parentCategory == this.subCategories[k].categoryId);
      if (!isNullOrUndefined(childItems)) {
        for (let z = 0; z < childItems.length; z++) {
          this.subCategories.push(childItems[z]);
        }
      }
    }
    this.loadChild = true;
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


  confirmationsaveFavourites(categoryId: number, isDoneClicked: boolean = false) {
    //if already a favorite don't give the message asking the user to save favorites
    this._sharedService.getFavoritesStatus().subscribe(o => {
      //alert('!o.isFav' + !o.isFav + ' o.parentCategory' + o.parentCategory + '==categoryId' + categoryId + ' !this.NothingSelected' + !this.NothingSelected);
      if (!o.isFav && o.parentCategory == categoryId && !this.NothingSelected) {
        this.displayFavoriteDialog = true;        
        this.isDoneClickedForFavoriteDialog = isDoneClicked;
        this.categoryIdForFavoriteDialog = categoryId;
      }
        //this.confirmationService.confirm({
        //  message: 'Do you want to set current selection as favorite?',
        //  header: 'Confirmation',
        //  icon: 'pi pi-exclamation-triangle',
        //  accept: () => {
        //    //this.saveFavourites( categoryId); updated as we have now added a new parameter to the method
        //    this.saveFavourites(categoryId);
        //    if (isDoneClicked) {              
        //      this._sharedService.setUserSelections(this.allCategories);
        //      //storing step 2 visited categories
        //      this._sharedService.setUserVisitedCategories(this.visited);
        //      this.router.navigate(['preview']);
        //    }
        //  },
        //  reject: () => {
        //    this.isFavUpdate = false;
        //    this.isfavSaved = false;
        //    if (isDoneClicked) {              
        //      this._sharedService.setUserSelections(this.allCategories);
        //      //storing step 2 visited categories
        //      this._sharedService.setUserVisitedCategories(this.visited);
        //      this.router.navigate(['preview']);
        //    }
        //  }
        //});
      //}      
    }).unsubscribe();
  }
  DoNotMakeFavorite() {
    this.isFavUpdate = false;
    this.isfavSaved = false;
    this.displayFavoriteDialog = false;
    if (this.isDoneClickedForFavoriteDialog) {              
              this._sharedService.setUserSelections(this.allCategories);
              //storing step 2 visited categories
              this._sharedService.setUserVisitedCategories(this.visited);
              this.router.navigate(['preview']);
    }
    else
      this.loadNextCategory();
  }

  MakeFavorite() {    
    this.saveFavourites(this.categoryIdForFavoriteDialog);    
    this.displayFavoriteDialog = false;
    if (this.isDoneClickedForFavoriteDialog) {              
              this._sharedService.setUserSelections(this.allCategories);
              //storing step 2 visited categories
              this._sharedService.setUserVisitedCategories(this.visited);
              this.router.navigate(['preview']);
    }
    else
      this.loadNextCategory();
  }

  selectCategory(cIndex: any, isChild: any, isNextclick: boolean, isPreviousClicked = false) {
    if (!this.NothingSelected) {      
      
      let currId = 0;
      let nextCatId = 0;
      let subCat = 0;
      var element = document.getElementById("eight_li");
      var elementPIB = document.getElementById("PIB");
      var elementNext = document.getElementById("nxtbtn");
      if (elementNext.innerHTML == 'Submit') {
        this.saveRequestData();
        return;
      }      
      else {
        this.currentIndex = cIndex;
        this.isPreviousClicked = isPreviousClicked;
        this.isNextclick = isNextclick;
        //this.isNextEnabled = true;

        //added new check to make sure if  the request for this user and category is for the first
        //modified the condition and its content. We shouldn't be using modified category this doesn't reflect the category we are currently on.
        //this.isFavUpdate is probably not used, did some testing to confirm it
        //if (this.modifiedCategoryID > 0 && this.isFavUpdate && (!this.isfavSaved || this.favStatus.isNew)) {
        //alert('this.favStatus.parentCategory' + this.favStatus.parentCategory + '>0' + ' !this.isfavSaved' + !this.isfavSaved + ' this.favStatus.isNew' + this.favStatus.isNew + ' !this.favStatus.isFav' + !this.favStatus.isFav);
        if (this.favStatus.parentCategory > 0 && (!this.isfavSaved || this.favStatus.isNew) && !this.favStatus.isFav) {
          //this.confirmationsaveFavourites(this.modifiedCategoryID);
          //to resolve the issue of asked to save favorites even when navigation is disabled          
          if (isNextclick) { this.confirmationsaveFavourites(this.favStatus.parentCategory); }
          else if (this.visited.length == this.parentCategories.length || !(this.visited.lastIndexOf(this.activeTab) - 1 != cIndex) || !(this.visited.lastIndexOf(this.activeTab) + 1 != cIndex) || !(this.visited.lastIndexOf(this.parentCategories[cIndex].name) == -1) || !(this.visited.lastIndexOf(this.parentCategories[cIndex - 1].name) == -1)) {
            this.confirmationsaveFavourites(this.favStatus.parentCategory);
          }
          else {
            this.loadNextCategory();
          }

        }
        else {
          this.loadNextCategory();
        }                
      }      
    }
    }

  loadNextCategory() {

    if (this.isNextclick) {
      this.getNextCategoryOnClick(this.isPreviousClicked);

      let ind = this.parentCategories.findIndex(c => c.categoryId == this.parentCatID);
      this.currCat = this.parentCategories[ind].name;
      this.activeTab = this.parentCategories[ind].name;
      this.isFavUpdate = false;
      this.isfavSaved = false;
      this.isTabActive = this.currentIndex;
      if (this.visited == [] || this.visited.lastIndexOf(this.activeTab) == -1) {
        this.visited.push(this.activeTab);
      }

      this.getFavouritesStatus(this.parentCatID);
      //changing the sequence for methods
      this.PopulateDetailsforSubcategories(this.parentCatID);
    }
    else {
      if (this.visited.length == this.parentCategories.length || !(this.visited.lastIndexOf(this.activeTab) - 1 != this.currentIndex) || !(this.visited.lastIndexOf(this.activeTab) + 1 != this.currentIndex) || !(this.visited.lastIndexOf(this.parentCategories[this.currentIndex].name) == -1) || !(this.visited.lastIndexOf(this.parentCategories[this.currentIndex - 1].name) == -1)) {
        this.parentCatID = this.parentCategories[this.currentIndex].categoryId;
        this.isaddInformation = false;

        let ind = this.parentCategories.findIndex(c => c.categoryId == this.parentCatID);
        this.currCat = this.parentCategories[ind].name;
        this.activeTab = this.parentCategories[ind].name;
        this.isFavUpdate = false;
        this.isfavSaved = false;
        this.isTabActive = this.currentIndex;
        if (this.visited == [] || this.visited.lastIndexOf(this.activeTab) == -1) {
          this.visited.push(this.activeTab);
        }

        this.getFavouritesStatus(this.parentCatID);
        //changing the sequence for methods
        this.PopulateDetailsforSubcategories(this.parentCatID);
      }
    }
  }

  getNextCategoryOnClick(isPreviousClicked) {
    let parentCat = this.parentCategories.filter(c => c.categoryId == this.parentCatID);
    if (!isNullOrUndefined(parentCat[0].categoryId)) {
      let nextId = parentCat[0].categoryId;
      //added condition to check if previous button is clicked, so that if previous button is clicked on second last step it should not take us to Additional info

      // Don't think this check is now required as step 3 is a different component altogether now
      //if (nextId == this.parentCategories[this.parentCategories.length - 1].categoryId && !isPreviousClicked) {
      //      this.currCat = parentCat[0].name;
      //      this.parentCatID = nextId;
      //  this.setAdditionalInformationTabActive();
      //  //change for done button
      //  this.isDoneEnabled = true;
      //  }
      //  else {
      let index = this.parentCategories.indexOf(parentCat[0]);
      if (index > -1) {
        if (!isPreviousClicked) {
          //next button clicked                  
          nextId = this.parentCategories[index + 1].categoryId;
          this.currCat = this.parentCategories[index + 1].name;
          this.parentCatID = nextId;
          this.isaddInformation = false;
          //this.isPreviousEnabled = true;
          //this.isDoneEnabled = false;
          //if (nextId == this.parentCategories[this.parentCategories.length - 1].categoryId) {
          //  this.isNextEnabled = false;
          //  this.isDoneEnabled = true;
          //}
        }
        else {
          //previous button clicked                  
          nextId = this.parentCategories[index - 1].categoryId;
          this.currCat = this.parentCategories[index - 1].name;
          this.parentCatID = nextId;
          this.isaddInformation = false;
          //this.isDoneEnabled = false;
          //if (index == 1) {
          //  this.isPreviousEnabled = false;
          //}
        }
      }

      //}

    }
  }

  NavigateToPreview() {
    if (this.favStatus.parentCategory > 0 && (!this.isfavSaved || this.favStatus.isNew) && !this.favStatus.isFav) {
      //this.confirmationsaveFavourites(this.modifiedCategoryID);      
      this.confirmationsaveFavourites(this.favStatus.parentCategory, true);
    }
    else {
      this._sharedService.setUserSelections(this.allCategories);
      //storing step 2 visited categories
      this._sharedService.setUserVisitedCategories(this.visited);
      this.router.navigate(['preview']);
    }
  }
  setAdditionalInformationTabActive() {
    var element = document.getElementById("eight_li");
    var elementPIB = document.getElementById("PIB");
    // commented following lines of changing next button to submit button, we have added a new button for done
    //var elementNext = document.getElementById("nxtbtn");
    let liIndex = document.getElementById("eight_li");
    elementPIB.classList.remove('active');
    //elementNext.innerHTML = 'Submit';
    liIndex.classList.add("active");
    this.isaddInformation = true;
    //this will disbale submit button on load.
    this.isNextEnabled = false;
    this.isPreviousEnabled = false;
  }

  saveRequestData() {
    //this.selectedDate = this.datepipe.transform(this.selectedDate, 'MMM dd, yyyy H:mm:ss');
    //commented as we are utilising datetime picker
    //this.selectedtime = this.datepipe.transform(this.selectedtime, 'mediumTime');
    var deadlineDate;
    //commented as we are utilising datetime picker
    //if (this.selectedtime == null && this.selectedDate == null) {
    if (this.selectedDate == null) {
      let meetingTime = new Date(this.meetingReqCategories.MeetingStartTime);
      deadlineDate = new Date(meetingTime);
      let hoursFrmDeadline = parseInt(this.deadlineOption.substring(0, 2));
      deadlineDate.setHours(meetingTime.getHours() - hoursFrmDeadline);
    }
    else {
      //commented as we are utilising datetime picker
      //deadlineDate = new Date(this.selectedDate + ' ' + this.selectedtime);
      deadlineDate = new Date(this.selectedDate);
    }

    this.request.additionalInstructions = this.txtAddIns;
    this.request.additionalTeamMembers = this.User;
    this.request.description = this.meetingReqCategories.MeetingSubject;
    this.request.status = 'Request Pending';
    this.request.createdBy = this.userId;
    this.request.raisedBy = this.userId;
    //this.request.assignedTo = this.coverageGroup;
    this.request.meetingId = this.meetingReqCategories.MeetingId;
    this.request.title = this.meetingReqCategories.MeetingSubject;
    this.request.companyName = this.meetingReqCategories.CompanyName;
    this.request.deadline = deadlineDate;
    this.request.categories = this.allCategories;
    this.categoriesService.saveRequest(this.request)
      .subscribe(fav => {
        this.result = fav
        if (this.result) { alert('Request submitted successfully'); }
        this.router.navigate(['/meetings'])
      });

  }

  updateFavouritesStatus(categoryId: number) {    
    if (!this.favStatus.isNew) {
      //check favourites class
      //let favoriteIcon = document.querySelector('.FavourtIcon');
      /*if (favoriteIcon.classList.contains('fa-heart-o'))*/
      if(this.favStatus.isFav){
        //favoriteIcon.classList.remove('fa-heart-o');
        //favoriteIcon.classList.add('fa-heart');
        //save favourites          
        //this.saveFavourites(this.parentCatID);          
        //Not Saving favourites on click of heart/toggle anymore, we now use this to deactivate or activate favourites
        //27 Nov, now that we are removing that isActive field we should not activate favorites anymore, we should simply retrieve favorietes, hence commenting below line
        //this.categoriesService.activateFavourites(this.userId, categoryId).subscribe(fav => {
        //this.isDeletedFav = fav.isFav;        
        // set it to false..need to check and test
        this.isfavSaved = false;
        this.retrieveUpdatedFavourites(categoryId);
        this.isDeletedFav = this.favStatus;
        //});

      }
      else {
        //favoriteIcon.classList.remove('fa-heart');
        //favoriteIcon.classList.add('fa-heart-o');
        //delete favourites
        //we won't be deleting favourites now, will only set them inactive            
        // if you want to remove this as your favourite or don't want to use favourite, we'll mark your favourites as notActive        
        this.deleteFavouritesforCategory(categoryId);
      }
      // we want to collapse all the opened categories so that selections are refreshed
      this._sharedService.setCollapseCategory(true);
      // check if at least one is selected and based upon that enable disbale navigation buttons
      this.checkIfAtLeastOneIsSelected(categoryId);
    }
  }

  retrieveUpdatedFavourites(categoryId) {
    // array to contain all categories of passed parent categories
    //let tempCategories: CategoryMasterModel[] = [];
    let tempCategories: DefaultCategoriesModel[] = [];
    // array to contain all sub categories of passed parent categories' children
    //let tempSubCategories: CategoryMasterModel[] = [];
    let tempSubCategories: DefaultCategoriesModel[] = [];
    // array that would temporarily hold latest data for allCategories
    let tempallCategories: CategoryMasterModel[] = [];

    let tempCategoriesMaster: CategoryMasterModel[] = [];
    //this.categoriesService.getCategories(this.meetingReqCategories).subscribe
    let tempSubscribe = this._sharedService.getSavedFavorites().subscribe(

      data => {
        tempCategories = data.filter((tc, tindex) => tc.parentCategory == categoryId);
        let tempArray: number[] = [];

        //retrieving indices of the elements that have same parent as passed to this method
        this.allCategories.forEach((allItem, allIndex) => {
          if (allItem.parentCategory == categoryId) {
            tempArray.push(allIndex);
            tempCategoriesMaster.push(allItem);
          }
        });

        //retrieving indices of all sub categories that have above retrieved categories as parent
        for (var i = 0; i < tempCategories.length; i++) {
          this.allCategories.forEach((allItem, allIndex) => {
            if (allItem.parentCategory == tempCategories[i].categoryId) {
              tempArray.push(allIndex);
              tempCategoriesMaster.push(allItem);
            }
          });
        }

        // in this temp variable push all elements of AllCategories except the ones that match indices collected in previous two steps.
        //This would create a list of all sub categories and categories other than that of current page elements        
        for (var i = 0; i < this.allCategories.length; i++) {
          if (tempArray.findIndex(p => p == i) == -1)
            tempallCategories.push(this.allCategories[i]);
        }
        let k: number = tempCategories.length;
        // Push all elements of this current page to tempAllCategories
        for (var i = 0; i < tempCategories.length; i++) {

          tempallCategories.push(new CategoryMasterModel({
            categoryId: tempCategories[i].categoryId, isChecked: tempCategories[i].isChecked, parentCategory: tempCategories[i].parentCategory, name: tempCategories[i].name,
            children: tempCategoriesMaster[i].children, createdBy: tempCategoriesMaster[i].createdBy, createdDateTime: tempCategoriesMaster[i].createdDateTime,
            Icon: tempCategoriesMaster[i].Icon, isFav: tempCategoriesMaster[i].isFav, sortOrder: 0, status: tempCategoriesMaster[i].status
          }));
          tempSubCategories = data.filter((tc, tindex) => tc.parentCategory == tempCategories[i].categoryId);

          for (var j = 0; j < tempSubCategories.length; j++) {
            tempallCategories.push(new CategoryMasterModel({
              categoryId: tempSubCategories[j].categoryId, isChecked: tempSubCategories[j].isChecked, parentCategory: tempSubCategories[j].parentCategory, name: tempSubCategories[j].name,
              children: tempCategoriesMaster[j + k].children, createdBy: tempCategoriesMaster[j + k].createdBy, createdDateTime: tempCategoriesMaster[j + k].createdDateTime,
              Icon: tempCategoriesMaster[j + k].Icon, isFav: tempCategoriesMaster[j + k].isFav, sortOrder: 0, status: tempCategoriesMaster[j + k].status
            }));
          }
          k += tempSubCategories.length;
        }
        this.allCategories = tempallCategories.filter(p => true);
        this.parentCategories = this.meetingReqCategories.categories.filter(c => c.isChecked == true);

        this.PopulateDetailsforSubcategories(categoryId);
        //this.getFavouritesStatus(categoryId),
        //this.getFavouritesStatusNew(categoryId)\
        let myFavObj = new FavouritesStatus();
        myFavObj.isNew = false;
        myFavObj.isFav = true;
        myFavObj.parentCategory = categoryId;
        this.favStatus = myFavObj;
        this.setFavouritesIcon(myFavObj.isFav);
        this._sharedService.setFavoritesStatus(myFavObj);
        this.parentCatID = categoryId,
          this.currCat = this.parentCategories.filter(i => i.categoryId == categoryId)[0].name;
        this.activeTab = this.currCat;
        //tempArray.length = 0;
        k = null;
      }
    );
    tempSubscribe.unsubscribe();
  }

  saveFavourites(categoryId: number) {
    let favouriteCat: UserFavouritesModel[] = [];
    let myFavoritesToSave: DefaultCategoriesModel[] = [];
    let isFav: boolean = false;
    let suCat: CategoryMasterModel[] = [];
    let currentCat = categoryId.toString();
    suCat = this.allCategories.filter(c => c.parentCategory == parseInt(currentCat));
    let childCat: CategoryMasterModel[] = [];
    //let categoryIdToSave: number[] = [];
    if (!isNullOrUndefined(suCat)) {
      for (let i = 0; i < suCat.length; i++) {
        let userfav = <UserFavouritesModel>{ categoryId: suCat[i].categoryId, name: suCat[i].name, sortOrder: suCat[i].sortOrder, userId: this.userId, isChecked: suCat[i].isChecked };
        favouriteCat.push(userfav);
        //added to save sub categories in shared service
        myFavoritesToSave.push(new DefaultCategoriesModel({ categoryId: suCat[i].categoryId, name: suCat[i].name, isChecked: suCat[i].isChecked == null ? false : suCat[i].isChecked, parentCategory: suCat[i].parentCategory }));
        //categoryIdToSave.push(suCat[i].categoryId);
        childCat = this.allCategories.filter(c => c.parentCategory == suCat[i].categoryId);
        if (!isNullOrUndefined(childCat)) {
          for (let k = 0; k < childCat.length; k++) {
            let child = <UserFavouritesModel>{
              categoryId: childCat[k].categoryId, name: childCat[k].name, sortOrder: childCat[k].sortOrder,
              userId: this.userId, isChecked: childCat[k].isChecked
            };
            favouriteCat.push(child);
            //added to save sub child categories in shared service
            myFavoritesToSave.push(new DefaultCategoriesModel({ categoryId: child.categoryId, name: child.name, isChecked: child.isChecked == null ? false : child.isChecked, parentCategory: suCat[i].categoryId }));
            //categoryIdToSave.push(child.categoryId);
          }

        }
      }

      this.categoriesService.saveFavourites(favouriteCat)
        .subscribe(fav => {
          this.result = fav,
            this.isfavSaved = this.result.status;
          //added to save favorites localy as well          
          this._sharedService.setSavedFavorites(myFavoritesToSave);
          myFavoritesToSave.splice(0, myFavoritesToSave.length);
          favouriteCat.splice(0, favouriteCat.length);
        }
        );
    }
  }

  deleteFavouritesforCategory(categoryId: number) {
    //this.categoriesService.deleteFavouritesStatus(this.userId,categoryId)
    //.subscribe(fav => {
    //this.isDeletedFav = fav.isFav;
    this.isfavSaved = false;
    //27 Nov
    //this.retrieveUpdatedFavourites(categoryId);
    this._sharedService.getDefaultCategories().subscribe((myDefault) => {
      //start
      // array to contain all categories of passed parent categories
      let tempCategories: DefaultCategoriesModel[] = [];
      // array to contain all sub categories of passed parent categories' children
      let tempSubCategories: DefaultCategoriesModel[] = [];
      // array that would temporarily hold latest data for allCategories
      let tempallCategories: CategoryMasterModel[] = [];
      let tempCategoriesMaster: CategoryMasterModel[] = [];

      tempCategories = myDefault.filter((tc, tindex) => tc.parentCategory == categoryId);
      let tempArray: number[] = [];

      //retrieving indices of the elements that have same parent as passed to this method
      this.allCategories.forEach((allItem, allIndex) => {
        if (allItem.parentCategory == categoryId) {
          //tempArray.push(allIndex);
          tempArray.push(allItem.categoryId);
          tempCategoriesMaster.push(allItem);
        }
      });

      //retrieving indices of all sub categories that have above retrieved categories as parent
      for (var i = 0; i < tempCategories.length; i++) {
        this.allCategories.forEach((allItem, allIndex) => {
          if (allItem.parentCategory == tempCategories[i].categoryId) {
            //tempArray.push(allIndex);
            tempArray.push(allItem.categoryId);
            tempCategoriesMaster.push(allItem);
          }
        });
      }

      // in this temp variable push all elements of AllCategories except the ones that match indices collected in previous two steps.
      //This would create a list of all sub categories and categories other than that of current page elements
      for (var i = 0; i < this.allCategories.length; i++) {
        //if (tempArray.findIndex(p => p == i) == -1)
        //  tempallCategories.push(this.allCategories[i]);
        if (tempArray.findIndex(p => p == this.allCategories[i].categoryId) == -1)
          tempallCategories.push(this.allCategories[i]);
      }

      // Push all elements of this current page to tempAllCategories
      let k: number = tempCategories.length;
      for (var i = 0; i < tempCategories.length; i++) {

        tempallCategories.push(new CategoryMasterModel({
          categoryId: tempCategories[i].categoryId, isChecked: tempCategories[i].isChecked, parentCategory: tempCategories[i].parentCategory, name: tempCategories[i].name,
          children: tempCategoriesMaster[i].children, createdBy: tempCategoriesMaster[i].createdBy, createdDateTime: tempCategoriesMaster[i].createdDateTime,
          Icon: tempCategoriesMaster[i].Icon, isFav: tempCategoriesMaster[i].isFav, sortOrder: 0, status: tempCategoriesMaster[i].status
        }));
        tempSubCategories = myDefault.filter((tc, tindex) => tc.parentCategory == tempCategories[i].categoryId);

        //this.allCategories.forEach((allItem, allIndex) => {
        //  if (allItem.parentCategory == tempCategories[i].categoryId) {                     
        //    tempCategoriesMaster.push(allItem);
        //  }
        //});

        for (var j = 0; j < tempSubCategories.length; j++) {
          tempallCategories.push(new CategoryMasterModel({
            categoryId: tempSubCategories[j].categoryId, isChecked: tempSubCategories[j].isChecked, parentCategory: tempSubCategories[j].parentCategory, name: tempSubCategories[j].name,
            children: tempCategoriesMaster[j + k].children, createdBy: tempCategoriesMaster[j + k].createdBy, createdDateTime: tempCategoriesMaster[j + k].createdDateTime,
            Icon: tempCategoriesMaster[j + k].Icon, isFav: tempCategoriesMaster[j + k].isFav, sortOrder: 0, status: tempCategoriesMaster[j + k].status
          }));
        }
        k += tempSubCategories.length;
      }
      this.allCategories = [];
      this.allCategories = tempallCategories.filter(p => true);
      this.parentCategories = this.meetingReqCategories.categories.filter(c => c.isChecked == true),
        this.PopulateDetailsforSubcategories(categoryId);
      //this.getFavouritesStatus(categoryId),
      let myFavObj = new FavouritesStatus();
      myFavObj.isFav = false;
      myFavObj.parentCategory = categoryId;
      myFavObj.isNew = false;
      this.setFavouritesIcon(myFavObj.isFav);
      this._sharedService.setFavoritesStatus(myFavObj);
      this.favStatus = myFavObj;
      //  this.favStatus.isFav = false;
      //this.favStatus.parentCategory = categoryId;
      //this.favStatus.isNew = false;
      //this.setFavouritesIcon(this.favStatus.isFav);
      this.isDeletedFav = this.favStatus;
      this.parentCatID = categoryId;
      this.currCat = this.parentCategories.filter(i => i.categoryId == categoryId)[0].name;
      this.activeTab = this.currCat;
      //tempCategories.splice(0, tempCategories.length);
      //tempCategoriesMaster.splice(0, tempCategoriesMaster.length);
      //tempallCategories.splice(0, tempallCategories.length);
      //tempSubCategories.splice(0, tempSubCategories.length);
      //tempArray.splice(0, tempArray.length);
      console.log('deleting favorites for ' + categoryId);
      console.log('new length of allcategories' + this.allCategories.length);
      console.log('length of tempallCategories is ' + tempallCategories.length);
      //end
    })
    //}
    //);
  }

  additionalPptSelect(event: any) {
    console.log('select event' + event);
    if (!isNullOrUndefined(this.userNames))
      for (let k = 0; k < this.userNames.length; k++) {
        let index = this.userNames.findIndex(c => c == event);
        if (index == -1) {
          this.userNames.push(event);
        }
      }

    console.log('Add additional participant' + this.userNames);
  }

  onKeyUp(event: KeyboardEvent) {
    
    if (event.key == "Enter") {
      let found: boolean = false;
      let tokenInput = event.srcElement as any;
      //check for user name is in EVS domain
      for (let i = 0; i < this.evsDomains.length; i++) {
        if (tokenInput.value.toUpperCase().indexOf(this.evsDomains[i].toUpperCase()) != -1) {
          this.userNames.push(tokenInput.value);
          found = true;
        }
      }
      //check for user name is in client domain
      for (let j = 0; j < this.clientDomains.length; j++) {
        if (tokenInput.value.toUpperCase().indexOf(this.clientDomains[j].toUpperCase()) != -1) {
          this.userNames.push(tokenInput.value);
          found = true;
        }
      }
      //Display an error popup if email entered is an external email address
      if (tokenInput.value && found == false) {
        this.validUserDialog = false;
      }

      tokenInput.value = '';
    }
    console.log('user names:' + this.userNames);
  }

  onclickInternalAttendes() {
    
    //Get the internal attendes from multiselect list
    for (let i = 0; i < this.evsDomains.length; i++) {
      let internalAttendes = this.meetingReqCategories.attendes.filter(c => c.attendeEmail.indexOf(this.evsDomains[i]) > -1)
      if (!isNullOrUndefined(internalAttendes)) {
        for (let j = 0; j < internalAttendes.length; j++) {
          this.internalEVSAttendeesList.push(internalAttendes[j].attendeEmail);
        }
      }
    }
    //These will be selected attendes from the popup
    for (let k = 0; k < this.internalEVSAttendeesList.length; k++) {
      this.userNames.push(this.internalEVSAttendeesList[k]);
    }

  }

  onclickInvalidUser() {
    this.validUserDialog = true;
  }

  filterUsers(event) {
    
    var ad = JSON.stringify(this.additionalUsers);
    this.filteredUsers = [];
    for (let i = 0; i < this.additionalUsers.length; i++) {
      var user = this.additionalUsers[i];
      var email = user["email"];
      if (email.toLowerCase().indexOf(event.query.toLowerCase()) == 0) {
        this.filteredUsers.push(email);
      }

    }
    console.log('FILTERED USERS:' + this.filteredUsers);
  }

  createRequest() {
    try {
      if (!isNullOrUndefined(this.ccName1)) {
        this.display = false;
        let meetReq: RequestCategories[] = [];
        this.meetingRequestData.CompanyName = this.ccName1;
        this.meetingRequestData.MeetingSubject = this.meetingRequestData.MeetingSubject;
        this.meetingRequestData.MeetingStartTime = this.meetingRequestData.MeetingStartTime;
        this._sharedService.sendCategoriesRequest(this.meetingRequestData);
        this.router.navigate(['/request']);
      }
    }
    catch (error) {
      console.log(error);
    }
  }

  onGetDataByRange(date) {
    console.log("date--Data--" + date);
  }

  ongettime(time) {
    console.log("time-time data-" + time);
  }

  onAdditional() {
    this.isSubmitEnabled = true;
    this.isNextEnabled = false;
    //added to Disable Previous
    this.isPreviousEnabled = false
  }

  toggle(args: any) {

    var getSpanToHide = args.target.parentNode.parentNode.children[0];
    var getSpanToShow = args.target.parentNode.parentNode.children[1];
    var getClass = args.target.parentNode.parentNode.children[0].classList.contains("hide");
    if (!getClass) {
      this.renderer.addClass(getSpanToHide, "hide");
      this.renderer.removeClass(getSpanToShow, "hide");
    } else {
      this.renderer.removeClass(getSpanToHide, "hide");
      this.renderer.addClass(getSpanToShow, "hide");
    }
  }


  onTopClick() {
    var button = document.getElementById("slideTop");
    var container = document.getElementsByClassName("ui-scrollpanel-content")[0]; 
    this.sideScroll(container, 'top', 25, 100, 10);

  }
  onBottomClick() {
    var button = document.getElementById("slideBottom");
     var container = document.getElementsByClassName("ui-scrollpanel-content")[0];
    this.sideScroll(container, 'bottom', 25, 100, 10);

  }

sideScroll(element, direction, speed, distance, step) {
  let scrollAmount = 0;
  var slideTimer = setInterval(()=> {
    if (direction == 'top') {
      element.scrollTop -= step;
    } else {
      element.scrollTop += step;
    }
    scrollAmount += step;
    if (scrollAmount >= distance) {
      clearInterval(slideTimer);
    }
  }, speed);
}






  @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {    
    console.log("Processing beforeunload...");
    // Do more processing...
    event.returnValue = false;
  }
}


