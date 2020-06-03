import { Component, OnInit } from '@angular/core';
import { NotificationSettings, NotificationFrequency, NotificationEmailType, NotificationMeetingType, NotificationFrequencyType, KeyValuePair } from '../../shared/models/NotificationSettings';
import { NotificationSettingsService } from '../../shared/services/notification-settings.service';
import { DatePipe } from '@angular/common';
import { ToastrService, Toast } from 'ngx-toastr';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-account-settings',
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.css']
})
export class AccountSettingsComponent implements OnInit {
  userId: string;
  myNotificationSettingsData: NotificationSettings;
  myNotificationFrequency: NotificationFrequency[] = [];
  myNotificationFrequencyOrg: NotificationFrequency[] = [];
  myNotificationEmailType: NotificationEmailType[] = [];
  myNotificationMeetingType: NotificationMeetingType[] = [];
  daysOfWeek: KeyValuePair[] = [];
  datesOfMonth: KeyValuePair[] = [];
  timeOfDay: KeyValuePair[] = [];
  meetingType = NotificationFrequencyType;
  myNotificationToEdit: NotificationSettings;
  errorMessage: string = '';
  statusMessage: string = '';
  currentRoute: string = '';
  constructor(private myNotificationService: NotificationSettingsService, private toastr: ToastrService, private datepipe: DatePipe, private route: ActivatedRoute,
    private router: Router) { }

  ngOnInit() {
    this.loadStaticData();
    this.userId = localStorage.getItem('user_id');
    this.myNotificationService.getNotificationSetting(this.userId).subscribe(o => {
      this.myNotificationSettingsData = o;
      
      this.myNotificationSettingsData.notificationHour = +this.datepipe.transform(this.myNotificationSettingsData.settingHours, 'H');
      
      this.myNotificationToEdit = JSON.parse(JSON.stringify(this.myNotificationSettingsData));
      this.myNotificationService.getNotificationOptions().subscribe(p => {
        this.myNotificationFrequencyOrg = p.frequency;
        this.myNotificationEmailType = p.emailType;
        this.myNotificationMeetingType = p.meetingType;
        this.myNotificationFrequency = this.myNotificationFrequencyOrg.filter(nfo => nfo.emailType == this.myNotificationSettingsData.settingType);
        
      });
    })

    this.route.url.subscribe(url => { this.currentRoute = url[0].path });
    localStorage.setItem('currentroute', this.currentRoute);
    this.statusMessage = '';
  }
  loadStaticData() {
    
    this.daysOfWeek.push({ id: 1, title: 'Sunday' });
    this.daysOfWeek.push({ id: 2, title: 'Monday' });
    this.daysOfWeek.push({ id: 3, title: 'Tuesday' });
    this.daysOfWeek.push({ id: 4, title: 'Wednesday' });
    this.daysOfWeek.push({ id: 5, title: 'Thursday' });
    this.daysOfWeek.push({ id: 6, title: 'Friday' });
    this.daysOfWeek.push({ id: 7, title: 'Saturday' });
    
    this.datesOfMonth.push({ id: 1, title: '01' });
    this.datesOfMonth.push({ id: 2, title: '02' });
    this.datesOfMonth.push({ id: 3, title: '03' });
    this.datesOfMonth.push({ id: 4, title: '04' });
    this.datesOfMonth.push({ id: 5, title: '05' });
    this.datesOfMonth.push({ id: 6, title: '06' });
    this.datesOfMonth.push({ id: 7, title: '07' });
    this.datesOfMonth.push({ id: 8, title: '08' });
    this.datesOfMonth.push({ id: 9, title: '09' });
    this.datesOfMonth.push({ id: 10, title: '10' });
    this.datesOfMonth.push({ id: 11, title: '11' });
    this.datesOfMonth.push({ id: 12, title: '12' });
    this.datesOfMonth.push({ id: 13, title: '13' });
    this.datesOfMonth.push({ id: 14, title: '14' });
    this.datesOfMonth.push({ id: 15, title: '15' });
    this.datesOfMonth.push({ id: 16, title: '16' });
    this.datesOfMonth.push({ id: 17, title: '17' });
    this.datesOfMonth.push({ id: 18, title: '18' });
    this.datesOfMonth.push({ id: 19, title: '19' });
    this.datesOfMonth.push({ id: 20, title: '20' });
    this.datesOfMonth.push({ id: 21, title: '21' });
    this.datesOfMonth.push({ id: 22, title: '22' });
    this.datesOfMonth.push({ id: 23, title: '23' });
    this.datesOfMonth.push({ id: 24, title: '24' });
    this.datesOfMonth.push({ id: 25, title: '25' });
    this.datesOfMonth.push({ id: 26, title: '26' });
    this.datesOfMonth.push({ id: 27, title: '27' });
    this.datesOfMonth.push({ id: 28, title: '28' });
    this.datesOfMonth.push({ id: 29, title: '29' });
    this.datesOfMonth.push({ id: 30, title: '30' });
    this.datesOfMonth.push({ id: 31, title: '31' });
    
    this.timeOfDay.push({ id: 0, title: '00:00' });
    this.timeOfDay.push({ id: 1, title: '01:00' });
    this.timeOfDay.push({ id: 2, title: '02:00' });
    this.timeOfDay.push({ id: 3, title: '03:00' });
    this.timeOfDay.push({ id: 4, title: '04:00' });
    this.timeOfDay.push({ id: 5, title: '05:00' });
    this.timeOfDay.push({ id: 6, title: '06:00' });
    this.timeOfDay.push({ id: 7, title: '07:00' });
    this.timeOfDay.push({ id: 8, title: '08:00' });
    this.timeOfDay.push({ id: 9, title: '09:00' });
    this.timeOfDay.push({ id: 10, title: '10:00' });
    this.timeOfDay.push({ id: 11, title: '11:00' });
    this.timeOfDay.push({ id: 12, title: '12:00' });
    this.timeOfDay.push({ id: 13, title: '13:00' });
    this.timeOfDay.push({ id: 14, title: '14:00' });
    this.timeOfDay.push({ id: 15, title: '15:00' });
    this.timeOfDay.push({ id: 16, title: '16:00' });
    this.timeOfDay.push({ id: 17, title: '17:00' });
    this.timeOfDay.push({ id: 18, title: '18:00' });
    this.timeOfDay.push({ id: 19, title: '19:00' });
    this.timeOfDay.push({ id: 20, title: '20:00' });
    this.timeOfDay.push({ id: 21, title: '21:00' });
    this.timeOfDay.push({ id: 22, title: '22:00' });
    this.timeOfDay.push({ id: 23, title: '23:00' });    
  }
  
  SaveNotification() {
    
    this.statusMessage = '';
    if (this.myNotificationSettingsData.frequencyId == this.meetingType.Daily) {
      this.myNotificationSettingsData.settingDate = null;
      this.myNotificationSettingsData.settingDay = null;
    }
    else if (this.myNotificationSettingsData.frequencyId == this.meetingType.Weekly) {
      this.myNotificationSettingsData.settingDate = null;
      if (this.myNotificationSettingsData.settingDay == null) {
        this.errorMessage = 'Please select a day for sending reminders';
        return;
      }
    }
    else if (this.myNotificationSettingsData.frequencyId == this.meetingType.Monthly) {
      this.myNotificationSettingsData.settingDay = null;
      if (this.myNotificationSettingsData.settingDate == null) {
        this.errorMessage = 'Please select a date for sending reminders';
        return;
      }
    }
    else if (this.myNotificationSettingsData.frequencyId > this.meetingType.Monthly) {
      this.myNotificationSettingsData.settingDate = null;
      this.myNotificationSettingsData.settingDay = null;
      this.myNotificationSettingsData.notificationHour = 0;
      this.myNotificationSettingsData.settingHours = new Date();
    }
    this.errorMessage = '';
    this.statusMessage = '';
    this.myNotificationService.updateNotificationSetting(this.myNotificationSettingsData).subscribe(o => {
      if (o.status) {
        this.statusMessage = o.errorMessage,
        this.myNotificationToEdit = JSON.parse(JSON.stringify(this.myNotificationSettingsData));
        this.toastr.success(this.statusMessage, "Notification Settings");
        
      }
      else {
        this.statusMessage = 'Error in Saving',
        this.toastr.success(this.statusMessage, "Notification Settings");
      }
    });
  }
  CancelChanges() {
    this.errorMessage = '';
    this.statusMessage = '';
    this.myNotificationSettingsData = JSON.parse(JSON.stringify(this.myNotificationToEdit));
    this.router.navigate(['/meetings']);
  }

  onDropDownSelection() {
    this.errorMessage = '';
    this.statusMessage = '';
  }
  onSettingTypeChange() {    
    this.errorMessage = '';
    this.statusMessage = '';
    this.myNotificationFrequency = this.myNotificationFrequencyOrg.filter(nfo => nfo.emailType == this.myNotificationSettingsData.settingType);
    this.myNotificationSettingsData.frequencyId = this.myNotificationSettingsData.settingType == 1 ? this.meetingType.Daily : this.meetingType.Twelve;
    this.myNotificationSettingsData.notificationHour = this.myNotificationSettingsData.settingType == 1 ? 0 : null;
    this.myNotificationSettingsData.settingDate = null;
    this.myNotificationSettingsData.settingDay = null;
  }
}
