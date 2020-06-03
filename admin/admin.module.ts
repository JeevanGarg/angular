import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { SharedModuleModule } from '../shared/shared-module/shared-module.module';
import { AccountSettingsComponent } from './account-settings/account-settings.component';
import { AdminRoutingModule } from '../admin/admin-routing.module';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MultiSelectModule } from 'primeng/primeng';
import { ProfileRouteRequestComponent } from './profile-route-request/profile-route-request.component';

@NgModule({
  declarations: [UserProfileComponent, AccountSettingsComponent, ProfileRouteRequestComponent],
  imports: [
    RouterModule, CommonModule, AdminRoutingModule, SharedModuleModule, FormsModule, MultiSelectModule
  ]
})
export class AdminModule { }
