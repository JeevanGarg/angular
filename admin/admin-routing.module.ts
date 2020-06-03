import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AuthGuard } from '../authentication/login/auth.guard';
import { ProfileRouteRequestComponent } from './profile-route-request/profile-route-request.component';

const adminRoutes: Routes = [
{ path: 'myProfile', component: UserProfileComponent, canActivate: [AuthGuard] }, 
{ path: 'profileSetting', component: AccountSettingsComponent, canActivate: [AuthGuard] },
{ path: 'profileRequest', component: ProfileRouteRequestComponent }
 ];

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(adminRoutes)],
  exports:[RouterModule]
})
export class AdminRoutingModule { }
