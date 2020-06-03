import { Component, OnInit, TemplateRef, AfterContentChecked, Renderer2, ViewChild, ViewChildren, Output, EventEmitter, AfterViewChecked, ChangeDetectorRef, ElementRef, DoCheck } from '@angular/core';
import { MeetingsService } from '../shared/services/meetings.service';
import { Meetings, Attendes } from '../shared/models/meetings';
import { DatePipe } from '@angular/common';
import { MeetingDate } from '../shared/models/meetingDate';
import { meetingRequest } from '../shared/models/meetingRequest';
import { Router, ActivatedRoute } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { strictEqual } from 'assert';
import { formattedError } from '@angular/compiler';
import { LoginModel } from '../authentication/login/login-request';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { BrowserModule } from '@angular/platform-browser';
import { isNullOrUndefined, isNull } from 'util';
import { error, dashCaseToCamelCase } from '@angular/compiler/src/util';
import { SharedService } from '../shared/services/shared.service';
import { CategoryMasterModel, RequestCategories, RequestModel, ExternalAttendesModel } from '../shared/models/usercategory';
import { DialogModule } from 'primeng/dialog';
import { SlickCarouselComponent } from 'ngx-slick-carousel';
import { NgxUiLoaderService } from 'ngx-ui-loader'; 
import { ISlimScrollOptions, SlimScrollEvent } from 'ngx-slimscroll';
import { ConfirmationService } from 'primeng/api';
import { environment } from '../../environments/environment.prod';


@Component({
  selector: 'app-meetings',
  templateUrl: './meetings.component.html',
  styleUrls: ['./meetings.component.css']
})
export class MeetingsComponent implements OnInit,AfterViewChecked {
  private modalRef: TemplateRef<any>;
  minDateRange: Date;
  maxDateRange: Date;
  meetingsList: Meetings[]=[];
  numberOfDays: number = 31;
  meetingsDate: MeetingDate[] = [];
  selDate: number;
    meetingsSearch: number[] = [];
    selectedMeeting = <Meetings>{};
    displayCancel: boolean = false;
  name: any="";
  reqClass: string;
  requestCategories: CategoryMasterModel[] = [];
  isRangeValid: boolean = true;
  activeSlide: any;
  meetingSelSlide: any;
  iscompanyValid: boolean = false;;
  appointmentRequest: LoginModel;
  records: number = 0;
  mData: string = '';
  userId: string = '';
  email: string = '';
  meetMonth: string;
  meetYear: string;
  meetDay: string;
  cancelled: string;
  selectedVal: string = '';
  currentRoute: string = '';
  currentDate = new Date();
  currentYear: number;
  selectedDate: any;
  rangeDate: any;
  meetingsCount: number = 0;
  meetingSub: string;
  meetingId: string;
  meetingSelDate: any;
  meetingUser: string;
  yearRange: any;
  ccName1: string = '';
  companyName: string = '';
  display: boolean = false;
  minDateValue: any;
  maxDateValue: any;
  nextMonth: string[] = [];
  nextDates: Date[] = [];
  isDateRange: boolean = false;
  viewName: string = '';
  meetingRequestData = <RequestCategories>{};
  requestModel = <RequestModel>{};
    currentmeetingRequestData = <RequestCategories>{};
    downloadFilesNames: any[] = [];
  calendarDates: string[] = [];
  datesWithMeetings: string[] = [];
    //Configurations for slide config
    slideConfig = {
    slidesToShow: 31,
    slidesToScroll: 1,
    arrows: false,
    infinite: false,
    swipeToSlide: true,
    touchThreshold: 10,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 15,
          slidesToScroll: 3,
          infinite: true,
          dots: false
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 10,
          slidesToScroll: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 8,
          slidesToScroll: 1
        }
      }

    ]
    };

    @ViewChildren('myVar') createdItems;
  selectedDateOnCalendar: any;  
  searchingRecords: boolean = false;
  deadlineThreshold: number;


  constructor(private meetingsService: MeetingsService, private datepipe: DatePipe, private renderer: Renderer2,
      private router: Router, private cookie: CookieService, private _sharedService: SharedService, private cdRef: ChangeDetectorRef,
      private ngxService: NgxUiLoaderService, private confirmationService: ConfirmationService,private route:ActivatedRoute) {
  }

  ngOnInit() {
    this.deadlineThreshold = environment.deadlineThreshold;    
      this.userId = localStorage.getItem('user_id');
      this.email = localStorage.getItem('email');
      this.getNextmonth();
      this.currentDate = new Date();
      var yesterdayDate = new Date();
      yesterdayDate.setDate(this.currentDate.getDate() - 1);
    this.calculateDate(yesterdayDate);    
    this.searchingRecords = true;    
    this.ngxService.startBackground();    
      this.assignMeetingData(this.meetingsDate[1].meetingFullDate);    
    this.getDatesWithMeetings(this.meetingsDate[0].meetingFullDate, this.meetingsDate[this.meetingsDate.length-1].meetingFullDate);
     // let yearToday = new Date("YYYY");
     // let maxYear = new Date(yearToday.getFullYear() + 50);    
    let minYear;
    if (this.currentDate.getMonth() < 4) {
      minYear = this.currentDate.getFullYear() - 1;
    }
    else {
      minYear = this.currentDate.getFullYear();
    }
    //let maxYear = this.currentDate.getFullYear() + 20;
    let maxYear;
    if (this.currentDate.getMonth() > 9) {
      maxYear = this.currentDate.getFullYear() + 1;
    }
    else {
      maxYear = this.currentDate.getFullYear();
    }
    this.yearRange = minYear + ": " + maxYear;    

      //this.yearRange = '2019: 2040';
      this.meetingRequestData.categories = [];
     // this.meetingRequestData.Title = "";
    //Not retrieving categories as they are retrieved at the time of raise request/edit request on step 1
    //this.meetingsService.getRequestsCategories().subscribe
    //  (
    //  data => {
    //    this.requestCategories = data;
    //  },
    //  );
    //let currentSlide = document.querySelector('.slick-current');    
    //if (currentSlide!= null) {      
    //    currentSlide.classList.remove('slick-current');
    //}
      this.currentYear = yesterdayDate.getFullYear();
      this.records = 0;
      this.minDateRange = new Date();
    this.minDateRange.setMonth(this.currentDate.getMonth() - 3);
    this.maxDateRange = new Date();
    this.maxDateRange.setMonth(this.currentDate.getMonth() + 3);
    //Retrieve default categories on load of meetings page, this will be utilized during request creation thats why storing it to shared service
    this.meetingsService.getDefaultCategories().subscribe(o => { this._sharedService.setDefaultCategories(o); });
    // setting user selections in step 2 to null. This is done so that data is not retained beyond request-creation/modification flow 
    this._sharedService.setUserSelections(null);
    // setting user's input in step 3 to null
    this._sharedService.setStep3Data(null);
    // setting user's visited categories to null
    this._sharedService.setUserVisitedCategories(null);
    this.selectedDateOnCalendar = this.meetingsDate[1].meetingFullDate;
    this.route.url.subscribe(url => { this.currentRoute = url[0].path });
    localStorage.setItem('currentroute', this.currentRoute);

  }
  ngAfterViewInit() {    
    this.records = this.createdItems.toArray().length;    
    let currentSlide = document.querySelector('.slick-current');    
    if (currentSlide != null) {          
      currentSlide.classList.remove('slick-current');
      }      
        let currSlide = document.getElementById(this.meetingsDate[1].meetingFullDate);
        currSlide.classList.add('slick-current');        
    }

  slickInit(event: any) {

  }
  addCompanyName(event: any) {
    if (!isNullOrUndefined(event.target.value)) {
      this.iscompanyValid = true;
    }
    else { this.iscompanyValid = false;}
  }

  ngAfterViewChecked() {    
    this.records = this.createdItems.toArray().length;
      this.cdRef.detectChanges();
    if (this.viewName == 'Current') {
        // not using querySelectorAll as iterating over the records using foreach caused error in IE
        let currentSlide = document.querySelector('.slick-current');
        if (currentSlide != null) {
          currentSlide.classList.remove('slick-current');
        }
        let currSlide = document.getElementById(this.meetingsDate[1].meetingFullDate);
        currSlide.classList.add('slick-current');    
                
    }
    //console.log("ngAfterViewChecked meeting list=" + JSON.stringify(this.meetingsList));

    
  }
  

  
    getNextmonth() {
        try {
            
            this.isDateRange = false;
            this.nextMonth.push('Current');
            for (let i = 0; i < 3; i++) {
                let nextDate = new Date();
                let today = new Date();
                let j = i + 1;
                nextDate.setMonth(today.getMonth() + j, 21);
                this.nextDates[j] = nextDate;
                //this.nextMonth.push(this.datepipe.transform(nextDate, 'LLL'));
                this.selectedVal = i == 0 ? 'Current' : ' ';
              this.currentYear = i == 0 ? today.getFullYear() : this.nextDates[i].getFullYear();
              this.nextMonth.push(this.datepipe.transform(nextDate, 'LLL') + ' ' + this.currentYear);
            }
        }
        catch (error) {
            //error.status = 500;
            //this.errorHandler.handleError(error);
        }
    }
  
  onselectionChanged(event: any) {
    let elerangeCalendar = document.getElementById("rangeCalendar");
    let eledayCalendar = document.getElementById("dayCalendar");
    let eletabCalendar = document.getElementById("daytabCalendar"); 
    if (event.target.value == "day") {
      this.rangeDate = null;
      this.isDateRange = false;
      this.records = 0;
        this.isRangeValid = true;
        //let currentSlide = document.querySelector('.slick-current');
        //if (currentSlide !=null) {
        //    currentSlide.classList.remove('slick-current');
        //}
        var yesterdayDate = new Date();
        this.meetingsDate = [];
        this.meetingsList = [];
        yesterdayDate.setDate(this.currentDate.getDate() - 1);
        this.calculateDate(yesterdayDate);
        this.assignMeetingData(this.meetingsDate[1].meetingFullDate,true);
        this.viewName='Current';
    }
    else {
      this.meetingsList = [];
      this.meetingSelDate = null;
      this.isDateRange = true;
      this.records = 0;
      this.isRangeValid = true;
    }
  }

    onSelMonth(event: any) {
        try {
            this.meetingsList = [];
            this.isDateRange = false;
            this.records = 0;
            let tmpDateFirst;
            let firstDay;
            let lastDay;
            let currElement = '';
            //let currentSlide = document.querySelector('.slick-current');
            //if (currentSlide != null) {
            //    currentSlide.classList.remove('slick-current');
            //}
          if (event.target.value.trim() == 'Current') {            
                let today = new Date();            
            var yesterdayDate = new Date();            
            yesterdayDate.setDate(today.getDate() - 1);            
            firstDay = yesterdayDate;            
            let edate = new Date();            
            edate.setDate(yesterdayDate.getDate() + 31)            
            lastDay = edate.getDate();           
            tmpDateFirst = this.datepipe.transform(today, 'MMM-dd-yyyy')            
            this.slideConfig.slidesToShow = 31;            
            this.numberOfDays = 31;
              this.currentYear = yesterdayDate.getFullYear();
            this.viewName = 'Current';

            }
            else {                            
              //var index = !isNullOrUndefined(event.target.value) ? this.nextMonth.indexOf(event.target.value) : -1;
              var index = -1;
              this.nextMonth.forEach((p, ind) => { if (p.toLowerCase().trim() == event.target.value.toLowerCase().trim()) { index = ind; return; } });
              this.currentYear = this.nextDates[index].getFullYear();              
              firstDay = new Date(this.nextDates[index].getFullYear(), this.nextDates[index].getMonth(), 1);              
              lastDay = new Date(this.currentYear, this.nextDates[index].getMonth() + 1, 0).getDate();              
              tmpDateFirst = this.datepipe.transform(firstDay, 'MMM-dd-yyyy')              
              this.slideConfig.slidesToShow = lastDay;              
              this.numberOfDays = lastDay;              
              this.viewName = 'Month';              
            }
            this.meetingsDate = [];
            this.meetingsList = [];
            //Call the function to set calendar tabs again here on selection of month
            this.calculateDate(firstDay);

            this.assignMeetingData(tmpDateFirst,true);
          if (event.target.value.trim() == 'Current') {              
            currElement = this.meetingsDate[1].meetingFullDate;
            this.selectedDateOnCalendar = this.meetingsDate[1].meetingFullDate;            
            }
          else {
            currElement = this.meetingsDate[0].meetingFullDate;            
            this.selectedDateOnCalendar = this.meetingsDate[0].meetingFullDate;}
            //let currSlide = document.getElementById(currElement);
            //currSlide.classList.add('slick-current');
          this.getDatesWithMeetings(this.meetingsDate[0].meetingFullDate, this.meetingsDate[this.meetingsDate.length - 1].meetingFullDate);
        }
        catch (error) {}
    
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

    createRequest(attendee: Attendes[], hostAttendees: Attendes[], optAttendees: Attendes[]) {
    
    try {
      if (!isNullOrUndefined(this.meetingsList)) {
          this.display = false;
          this.meetingRequestData.CompanyName = this.ccName1;
          this.meetingRequestData.MeetingId =parseInt(this.meetingId);
          this.meetingRequestData.MeetingSubject = this.meetingSub;
          this.meetingRequestData.MeetingStartTime = this.meetingSelDate;
          this.meetingRequestData.requestId = 0;

        //Added this to fix issue of user id being 0 while fetching favourites - Siddhartha
        this.meetingRequestData.userId = parseInt(this.userId);
        this.meetingRequestData.isEditRequest = false;
        this.meetingRequestData.categories = this.requestCategories;
          let allAttendess: Attendes[] = [];
          //Logic to add all the attendes to meeting request data so as to pass on for step 1 and step 3
          for (let i = 0; i < attendee.length; i++) {
              allAttendess.push(attendee[i]);
          }
          //Get and add all host attendees
          for (let j = 0; j < hostAttendees.length; j++) {
              allAttendess.push(hostAttendees[j]);
          }
          //Get and add all optional  attendees
          for (let k = 0; k < optAttendees.length; k++) {
              allAttendess.push(optAttendees[k]);
          }
        this.meetingRequestData.attendes = allAttendess;
        
        this._sharedService.sendCategoriesRequest(this.meetingRequestData);        
        localStorage.setItem('step1Data', JSON.stringify(this.meetingRequestData));        
          this.router.navigate(['/requestCategories', 'create']);

          
      }
      
    }
    catch (error) {
      console.log(error);
    }
  }

   
    checkValue(event: any, category: string) {
        
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
        }
        else {
            categoryIndex = this.requestCategories.findIndex(c => c.name == category);
            this.requestCategories[categoryIndex].isChecked = status;
            this.meetingRequestData.categories.push(this.requestCategories[categoryIndex]);
        }        
    }
  toggle_attendees(args: any) {
    var getSpanToHide = args.target.parentNode.children[1];
    if (args.target.parentNode.className == "attendies_drop")
      getSpanToHide = args.target.parentNode.parentNode.children[1];
    var getClass = getSpanToHide.classList.contains("hide");
    if (!getClass) {
      this.renderer.addClass(getSpanToHide, "hide");
    } else {
      this.renderer.removeClass(getSpanToHide, "hide");
    }
    let attendiesIcon = document.querySelector('.att-arrow');
    if (attendiesIcon.classList.contains('fa-caret-down')) {
      attendiesIcon.classList.remove('fa-caret-down');
      attendiesIcon.classList.add('fa-caret-up');
    }
    else
    {
      attendiesIcon.classList.remove('fa-caret-up');
      attendiesIcon.classList.add('fa-caret-down');
    }
    args.stopImmediatePropagation();
  }

    calculateDate(cDate: Date) {
      this.meetingsDate = [];
      this.calendarDates.splice(0, this.calendarDates.length);
    for (let dayCount = 0; dayCount < this.numberOfDays; dayCount++) {
      var eDate = new Date(cDate);
      eDate.setDate(eDate.getDate() + dayCount)
      let meeting = new MeetingDate();
      //meeting.meetingFullDate = this.datepipe.transform(eDate, 'dd-MM-yyyy');
      //modified to change meeting dates on home screen to local time      
      meeting.meetingFullDate = this.datepipe.transform(eDate, 'EEE MMM dd yyyy 00:00:00');
      var meetingDate = new Date(meeting.meetingFullDate);      
      meeting.meetingFullDate = meetingDate.toUTCString();      
      meeting.meetingMonth = this.datepipe.transform(eDate, 'LLL');
      meeting.meetingDate = eDate.getDate();
      meeting.meetingDay = this.datepipe.transform(eDate, 'EEE');
      meeting.isSelected = false;
      this.meetingsDate.push(meeting);
      
      this.calendarDates.push(meeting.meetingMonth + '-' + meeting.meetingDate + '-' + meeting.meetingDay); 
    }      
  }

  OnClick(meetDate: MeetingDate, index: number) {    
    //this.name = "";
    this.searchingRecords = true;
      this.meetingsList.splice(0, this.meetingsList.length);
        let val = meetDate.meetingFullDate;
        this.appointmentRequest = new LoginModel();
    //let currentSlide = document.querySelectorAll('.slick-current');    
        //currentSlide.forEach(e => {
            //e.classList.remove('slick-current');
        //});
      this.ngxService.startBackground();
        this.assignMeetingData(meetDate.meetingFullDate,true);
        this.meetingsDate[index].isSelected = true;
        this.activeSlide = meetDate.meetingDate;
        this.viewName = 'Click';
        //let currSlide = document.getElementById(this.meetingsDate[index].meetingFullDate);
    //currSlide.classList.add('slick-current');
    
      this.selectedDateOnCalendar = meetDate.meetingFullDate;
    }

  breakpoint(event: any) { }
    afterChange(event: any) {

    }
  beforeChange(event: any) { }

  onGetDataByRange() {
    
    this.meetingsList = [];
    if (isNullOrUndefined(this.rangeDate[0]) || isNullOrUndefined(this.rangeDate[1])) {
      this.isRangeValid = false;
      this.rangeDate = null;
    }
    else {
      this.isRangeValid = true;
      
      //modified to change date range to local time, end date is last second of end date and start date is first second of start date      
      //using a new variable to fix date range calendar lock issue changed from rangeDate to rangeDateToSplit
      var rangeDateToSplit = this.rangeDate + '';
      var splitDates = rangeDateToSplit.split(",");
      var startDate = new Date(this.datepipe.transform(splitDates[0], 'EEE MMM dd yyyy 00:00:00')).toUTCString();
      var endDate = new Date(this.datepipe.transform(splitDates[1], 'EEE MMM dd yyyy 23:59:59')).toUTCString();      
      this.meetingsService.getMeetingsByRange(this.email, startDate,endDate,this.name,0).subscribe
        (
          data => {
            this.meetingsList = data;
            this.meetingsList.forEach((ditem, ind) => {
              this.meetingsList[ind].startTime = this.datepipe.transform(ditem.startTime, 'EEE MMM dd yyyy H:mm:ss UTC');
              this.meetingsList[ind].endTime = this.datepipe.transform(ditem.endTime, 'EEE MMM dd yyyy H:mm:ss UTC');
            });
            this.records = data.length;
          }
        );
    }

  }

  onCancelMeeting(id: any, subject: any, selDate: any) {
    this.meetingSub = subject;
      this.meetingId = id;
      let message: string = '';
      message ='Are you sure you want to remove '+ this.meetingSub + ' from here ?'
    //modified to save time component in the meeting time. Added UTC as time is in UTC format on this page, on doing new Date() it wil be converted to corresponding local time (will be utilized in Raising Requet)
    //this.meetingSelDate = this.datepipe.transform(selDate, 'dd-MM-yyyy');
      this.meetingSelDate = this.datepipe.transform(selDate, 'EEE MMM dd yyyy H:mm:ss UTC');
      //this.displayCancel = true;
      this.confirmationService.confirm({
          message: message,
          header: 'Remove Meeting',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
              this.cancelMeetingsById(id,this.meetingSelDate);
          },
          reject: () => {

          }
      });
    }
   

  getRaiseRequestData(meeting: Meetings, attendee: Attendes[], hostAttendees: Attendes[], optAttendees: Attendes[]) {
    
      this.meetingId = meeting.id.toString();
  //     meeting.status = 'REQUEST PENDING';
        //modified to save time component in the meeting time. Added UTC as time is in UTC format on this page, on doing new Date() it wil be converted to corresponding local time (will be utilized in Raising Requet)
        //this.meetingSelDate = this.datepipe.transform(selDate, 'dd-MM-yyyy');    
    //this.meetingSelDate = this.datepipe.transform(meeting.startTime, 'EEE MMM dd yyyy H:mm:ss UTC');    
    this.meetingSelDate = meeting.startTime;
        this.meetingSub = meeting.subject;
        if (meeting.status.toUpperCase() == 'RAISE') {
          //   this.display = true;
            this.createRequest(attendee, hostAttendees, optAttendees);
            //Commented by Pooja as the below lines for routing will be inside above function
          //this.meetingRequestData.attendes;
          //this.router.navigate(['/requestCategories','create']);
        }
        if (meeting.status.toUpperCase() == 'PENDING') {
            this.display = false;
            this.getRequestIDforMeeting(meeting.id);
        }
        if (meeting.status.toUpperCase() == 'CLOSED') {
            //send the meetingObject to shared service , so that it can be fetched on Request closed component
            this._sharedService.sendMeetingDetailsClosedRequest(meeting)
            //Route to closed request page
          if (!isNullOrUndefined(meeting)) {
            localStorage.setItem("mdetails", meeting.id.toString());
            this.router.navigate(['/requestClose']);
          }
          
        }
    }

    getRequestIDforMeeting(meetingId: number) {
        this.meetingsService.getRequestforMeetingId(meetingId).subscribe
            (
                data => {
                  this.requestModel = data,                    
                    this.requestModel.raisedOn = new Date(this.datepipe.transform(this.requestModel.raisedOn, 'EEE MMM dd yyyy H:mm:ss UTC')),                  
                    this.requestModel.deadline = new Date(this.datepipe.transform(this.requestModel.deadline, 'EEE MMM dd yyyy H:mm:ss UTC')),                                      
                    this._sharedService.sendRequestItemTodetails(this.requestModel);
                if (!isNullOrUndefined(this.requestModel)) {
                       localStorage.setItem("rid", this.requestModel.requestId.toString());
                        this.router.navigate(['/requestDetails']);
                    }
                }
            );
    }

    assignMeetingData(args: any,isDateClicked:boolean=false,fromScroll:boolean=false) {
        //this.meetingsList = [];
        //this.meetingsService.getMeetingsById(this.email, args).subscribe
        //    (
        //        data => {
        //            this.meetingsList = data;
        //            this.records = data.length;
        //        }

        //    );
      console.log('getting next x meetings');
      this.meetingsService.getNextXMeetingsById(this.email, args, this.name, fromScroll ? this.meetingsList[this.meetingsList.length - 1].id : 0).subscribe
        (
        data => {          
          if (isDateClicked) {
            this.meetingsList = data;
            this.meetingsList.forEach((ditem,ind) => {
              this.meetingsList[ind].startTime = this.datepipe.transform(ditem.startTime, 'EEE MMM dd yyyy H:mm:ss UTC');
              this.meetingsList[ind].endTime = this.datepipe.transform(ditem.endTime, 'EEE MMM dd yyyy H:mm:ss UTC');
            });
            this.records = data.length;
          }
          else {            
            data.forEach((ditem) => {            
            if (this.meetingsList.findIndex((p) => p.id == ditem.id) == -1) {
              this.meetingsList.push(ditem);
              this.meetingsList[this.meetingsList.length - 1].startTime = this.datepipe.transform(ditem.startTime, 'EEE MMM dd yyyy H:mm:ss UTC');
              this.meetingsList[this.meetingsList.length - 1].endTime = this.datepipe.transform(ditem.endTime, 'EEE MMM dd yyyy H:mm:ss UTC');
              this.records += 1;
              }
            });
          }
          //this.meetingsList = data;
          //this.records += data.length;
          this.ngxService.stopBackground();
          this.searchingRecords = false;
          //if (!isDateClicked) {                      
          //  //this.datesWithMeetings.splice(0, this.datesWithMeetings.length);            
          //  this.meetingsList.forEach((k) => {
          //    var eDate = new Date(k.startTime);
          //    var temp = this.datepipe.transform(eDate, 'LLL') + '-' + eDate.getDate() + '-' + this.datepipe.transform(eDate, 'EEE');
          //    if(this.datesWithMeetings.indexOf(temp)==-1)
          //    this.datesWithMeetings.push(this.datepipe.transform(eDate, 'LLL') + '-' + eDate.getDate() + '-' + this.datepipe.transform(eDate, 'EEE'));              
          //  });
          //}
        }

        );
      //if (this.viewName == 'Current') {          
           // let currSlide = document.getElementById(this.meetingsDate[1].meetingFullDate);
        //currSlide.classList.add('slick-current');
        
      //}      
      console.log("amd-meeting list=" + JSON.stringify(this.meetingsList));
      this.currentDate = new Date();      
      this.currentDate.setHours(this.currentDate.getHours() + this.deadlineThreshold);
      
    }

  


  cancelMeetingsById(meetingId: any, meetingDate: any) {      
    console.log('Cancel meetings' + meetingId);
    this.meetingsService.cancelMeetingsById(this.meetingId).subscribe
      (
        data => {
          this.cancelled = data;
        }
      );
      

   // if (this.isDateRange) { this.onGetDataByRange(); }
    //else { this.assignMeetingData(this.meetingSelDate);}
      let filter = this.meetingsList.findIndex(c => c.id == meetingId);
    this.meetingsList.splice(filter, 1);
    this.currentDate = new Date();
  }

  onScroll() {    
    this.ngxService.startBackground();
    if (this.isDateRange && this.isRangeValid) {      
      this.getNextMeetingsByRange(false,true);      
    }
    else
      this.assignMeetingData(this.datepipe.transform(this.meetingsList[this.meetingsList.length - 1].startTime, 'EEE MMM dd yyyy H:mm:ss'),false,true);
  }

  searchMeetings() {
    this.searchingRecords = true;
    this.meetingsList.splice(0, this.meetingsList.length);
    this.ngxService.startBackground();
    if (this.isDateRange && this.isRangeValid) {
      this.getNextMeetingsByRange(true);
    }
    else
    this.assignMeetingData(this.selectedDateOnCalendar,true);    
  }

  getNextMeetingsByRange(fromSearch:boolean=false,fromScroll:boolean=false) {
    var rangeDateToSplit = this.rangeDate + '';
    var splitDates = rangeDateToSplit.split(",");
    let startDate:any='';// = '';
    if (fromSearch) { startDate = this.datepipe.transform(splitDates[0], 'EEE MMM dd yyyy 00:00:00'); }
    else { startDate = this.datepipe.transform(this.meetingsList[this.meetingsList.length - 1].startTime, 'EEE MMM dd yyyy H:mm:ss'); }
    
    var endDate = this.datepipe.transform(splitDates[1], 'EEE MMM dd yyyy 23:59:59');
    this.meetingsService.getMeetingsByRange(this.email, startDate, endDate, this.name, fromScroll?this.meetingsList[this.meetingsList.length - 1].id:0).subscribe
      (          
      data => {
        if (fromSearch) {
          this.meetingsList = data;
          this.meetingsList.forEach((ditem, ind) => {
            this.meetingsList[ind].startTime = this.datepipe.transform(ditem.startTime, 'EEE MMM dd yyyy H:mm:ss UTC');
            this.meetingsList[ind].endTime = this.datepipe.transform(ditem.endTime, 'EEE MMM dd yyyy H:mm:ss UTC');
          });
          this.records = data.length;
        }
        else {
          data.forEach((ditem) => {
            if (this.meetingsList.findIndex((p) => p.id == ditem.id) == -1) {
              this.meetingsList.push(ditem);
              this.meetingsList[this.meetingsList.length - 1].startTime = this.datepipe.transform(ditem.startTime, 'EEE MMM dd yyyy H:mm:ss UTC');
              this.meetingsList[this.meetingsList.length - 1].endTime = this.datepipe.transform(ditem.endTime, 'EEE MMM dd yyyy H:mm:ss UTC');
              this.records += 1;
            }
          });
        }    
        //this.meetingsList = data;
        //this.records += data.length;
        this.ngxService.stopBackground();
        this.searchingRecords = false;      
    });
  }

  getDatesWithMeetings(startDate, endDate) {    
    this.meetingsService.getDatesWithMeetings(this.email, startDate, endDate).subscribe(op => {
      op.forEach((k) => {
        var utcDate=this.datepipe.transform(k, 'EEE MMM dd yyyy H:mm:ss UTC');
        var eDate = new Date(utcDate);        
        var temp = this.datepipe.transform(eDate, 'LLL') + '-' + eDate.getDate() + '-' + this.datepipe.transform(eDate, 'EEE');
        if (this.datesWithMeetings.indexOf(temp) == -1)
          this.datesWithMeetings.push(this.datepipe.transform(eDate, 'LLL') + '-' + eDate.getDate() + '-' + this.datepipe.transform(eDate, 'EEE'));
      });
    });
  }
}

