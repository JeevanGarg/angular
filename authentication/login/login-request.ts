import { strictEqual } from 'assert';

export class LoginRequest {
    email: string;
    password: string

}

export class LoginModel {
         userId :string
         userName:string
         email:string
         accessToken:string
         expiresAt:string    
         issuedDate: number
         firstName: string
         lastName: string
         roleId: number;
         role: string;
         userCoverageMappings: UserCoverageMappingModel[];
}

export class UserModel {
        UserId :number
       FirstName: string
        LastName: string
        Phone:number 
        Email :string
        CoverageGroup :string
        Designation :string
        UserName :string
        Password :string
        RoleId: string
        accessToken: string
        expiresAt:string
       issuedDate: string
 
       
}
export class UserCoverageMappingModel {
         userId:number
         deliveryList:string
         coverageId:number
       
}

export class PushNotificationsSubscriptionModel {
  pushSubscription: PushSubscription;
  userId: number;
  subject: string;


}

