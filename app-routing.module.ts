import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MeetingsComponent } from './meetings/meetings.component';
import { LoginComponent } from './authentication/login/login.component';
import { AuthGuard } from './authentication/login/auth.guard';
import { RequestViewComponent } from './request/request-view/request-view.component';
import { RegisterComponent } from './authentication/register/register.component';
import { ManageusersComponent} from './manageusers/manageusers.component'
import { ForgotPasswordComponent } from './authentication/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './shared/resetpassword/reset-password.component';



const routes: Routes = [
    { path: 'meetings', component: MeetingsComponent,canActivate:[AuthGuard]},
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'forgot', component: ForgotPasswordComponent },
    { path: 'reset', component: ResetPasswordComponent },
    { path: 'request', loadChildren: () => import('./request/request.module').then(m => m.RequestModule), canActivate: [AuthGuard] },
    { path: 'admin', loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule) },  
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'manageUsers', component: ManageusersComponent, canActivate: [AuthGuard] },
    { path: '**', redirectTo: '' },
   
 ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
