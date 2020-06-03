import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { HttpModule } from '@angular/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MeetingsService } from './shared/services/meetings.service';
import { RouterModule } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { LoginComponent } from './authentication/login/login.component';
import { AuthInterceptor } from './authentication/login/auth.interceptor';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from './authentication/login/auth.service';
import { Ng2SearchPipeModule } from 'ng2-search-filter';
import { CalendarModule } from 'primeng/calendar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { UserCategoriesService } from './shared/services/usercategory.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { SharedService } from './shared/services/shared.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PasswordModule, InputTextModule, PanelModule, DialogModule, MultiSelectModule} from 'primeng/primeng';
import { MeetingsComponent } from './meetings/meetings.component';
import { ToastrModule } from 'ngx-toastr';
import { RequestModule } from './request/request.module';
import { MessagesModule } from 'primeng/messages';
import { MessageModule } from 'primeng/message';
import { MessageService } from 'primeng/api';
//import { EditorModule } from 'primeng/editor';
import { SlickCarouselModule } from 'ngx-slick-carousel';
import { RegisterComponent } from './authentication/register/register.component';
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
//import { UserProfileComponent } from './admin/user-profile/user-profile.component';
import { SharedModuleModule } from '../app/shared/shared-module/shared-module.module';
import { UploadComponent } from '../app/shared/upload/upload.component';
import { ManageusersComponent } from './manageusers/manageusers.component';
import { ResetService } from '../app/shared/services/resetpassword.service';
import { ResetPasswordComponent } from './shared/resetpassword/reset-password.component';
//import { InfiniteScrollModule } from 'ngx-infinite-scroll';
//import { NgxUiLoaderModule } from 'ngx-ui-loader';
import { crypto } from 'crypto-js';
import { AdminModule } from '../app/admin/admin.module';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { NotificationComponent } from './notification/notification.component';

@NgModule({
  imports: [
    BrowserModule, ReactiveFormsModule, RouterModule, DragDropModule, ConfirmDialogModule, RequestModule, AdminModule,
    AppRoutingModule, BrowserAnimationsModule, HttpModule, FormsModule, HttpClientModule, Ng2SearchPipeModule, CalendarModule,
    ToggleButtonModule, PasswordModule, AutoCompleteModule,
    InputTextModule, PanelModule, DialogModule, MultiSelectModule, MessageModule, MessagesModule, SlickCarouselModule,
    ServiceWorkerModule.register('./ngsw-worker.js', { enabled: environment.production }),
    SharedModuleModule.forRoot()
    
  ],
  declarations: [
    AppComponent, LoginComponent, MeetingsComponent, RegisterComponent, ForgotPasswordComponent, RegisterComponent, ManageusersComponent, ResetPasswordComponent,
     NotificationComponent

  ],

 
 providers: [UserCategoriesService, MeetingsService, ConfirmationService, ResetService, DatePipe,  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }, CookieService,
        SharedService, MessageService],
  bootstrap: [AppComponent],
  entryComponents: []

  
})
export class AppModule {
  
}

