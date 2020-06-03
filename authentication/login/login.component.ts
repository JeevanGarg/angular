import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment.prod';
import { LoginRequest,  LoginModel } from './login-request';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { isNullOrUndefined } from 'util';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrService } from 'ngx-toastr';
import { MessageService } from 'primeng/api';
import { UsersService } from '../../shared/services/users.service';
import { ResetService } from '../../shared/services/resetpassword.service';
import { SwPush } from '@angular/service-worker';
import { NotificationService } from '../../notification/notification.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';



@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  loginRequest: LoginRequest;
  userModel: LoginModel;
  remme_passValue: string;
  isvalidRemMe: boolean = false;
  display: boolean = false;
  msgs: Message[] = [];
  invalidUser: boolean = false;
  evsDomain: string = '';
  clientDomain: string = '';
    isinvalidEmail: boolean = false;
    roleName: string = '';
    encrypted: string = '';
  decrypted: string = '';
  private _subscription: PushSubscription;
  public operationName: string;
  baseUrl: string = 'https://vaptapps.evalueserve.com/PushNotificationsAPI/'
  private httpOptions: any;

  constructor(private authService: AuthService, private router: Router, private cookie: CookieService, private toastr: ToastrService,
    private messageService: MessageService, private userservice: UsersService,
    private resetService: ResetService, private swPush: SwPush, private notification: NotificationService, private httpClient: HttpClient) {
    this.evsDomain = environment.evsDomain;
    this.clientDomain = environment.clientDomain;

  }

  ngOnInit() {
    this.loginForm = new FormGroup(
      {
        'email': new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')]),
        'password': new FormControl('', Validators.required),
        'rememberMe': new FormControl('')
      })
    this.loginForm.controls['rememberMe'].setValue(false);
    if (this.cookie.check("email")) {
        this.getPasswordFromStorage();
      }
     
  }

  ngAfterViewInit() {
   
  }

 
//  ValidateAddress(control: AbstractControl) {
//    let evsDomain = environment.evsDomain;
//    let clientDomain = environment.clientDomain;
//    if (control.value != null) {
//      if (!control.value.endsWith(evsDomain) || !control.value.endsWith(clientDomain)) {
//        return { validUrl: true };
//      }
//      else {
//        return {
//          validUrl: false
//        };
//      }
//    }
  
//}

onemailChange(event: any) {
    this.invalidUser = false;
    this.loginForm.controls['password'].setValue('');
    this.loginForm.controls['rememberMe'].setValue(false);
    let tmpMail = !isNullOrUndefined(event.target.value) ? event.target.value.split("@") : null;
    let emailAddress = tmpMail[1];
     this.isinvalidEmail = false;
  
      if (this.cookie.check("email")) {
        if (event.target.value == this.cookie.get("email")) {
          this.getPasswordFromStorage();
        }
      }
    }
    
  
  

  get email() { return this.loginForm.get('email'); }

  get password() { return this.loginForm.get('password'); }

  get rememberMe() { return this.loginForm.get('rememberMe'); }


  get loginValue() {
    return this.loginForm.value;
  }


  getPasswordFromStorage() {
        this.invalidUser = false;
        let result: boolean = this.authService.GetRememberMeExpiry();
        if (result) {
          this.loginForm.controls['email'].setValue(this.cookie.get("email"));
          this.isvalidRemMe = true;
        
        }
        else {
            this.isvalidRemMe = false;
            this.loginForm.controls['email'].setValue('');
            this.loginForm.controls['password'].setValue('');
            this.loginForm.controls['rememberMe'].setValue(false);
        }

        if (this.isvalidRemMe) {
          var decodedCred = this.cookie.check('rem_me_credential') ? decodeURIComponent(this.cookie.get("rem_me_credential")) : '';
          //var decryptPwd = this.resetService.decryptUsingAES256(this.cookie.get("rem_me_credential"));
          var decryptPwd = this.resetService.decryptUsingAES256(decodedCred);
          if (decryptPwd.length > 0) {
            decryptPwd = decryptPwd[0] == '"' && decryptPwd[decryptPwd.length - 1] == '"' ? decryptPwd.substr(1, decryptPwd.length - 2) : decryptPwd;
          }
          this.loginForm.controls['password'].setValue(decryptPwd);
            //this.authService.getPassword(this.cookie.get("email"))
            //    .subscribe((response) => {
            //        this.remme_passValue = response,
            //            console.log('pass is' + response),
            //            this.loginForm.controls['password'].setValue(this.remme_passValue);
            //        console.log('Rec pass val' + this.remme_passValue);
            //    });
            this.loginForm.controls['rememberMe'].setValue(true);
        }
    }

    sendResetPassword() {
        this.router.navigate(['/forgot']);
    }


    onSubmit() {
        
    this.loginRequest = new LoginRequest();
    this.loginRequest.email = this.email.value;
      this.loginRequest.password = this.password.value;      
    if (!isNullOrUndefined(this.email.value) && !isNullOrUndefined(this.password.value)) {
    this.authService.loginPost(this.loginRequest)
    .subscribe((response) => {
      this.userModel = response;
      
      
        if (this.userModel == null) {
            this.invalidUser = true;
            this.isinvalidEmail = false;
            this.msgs = [];
            this.loginForm.controls['password'].setValue('');
            this.loginForm.controls['email'].setValue('');
            this.loginForm.controls['rememberMe'].setValue(false);
        }
        else {
            
          this.invalidUser = false;          
            this.authService.setSession(this.userModel, this.rememberMe.value, this.loginRequest.password);
            sessionStorage.setItem('email', this.email.value);
            if (this.userModel.role == 'Analyst' || this.userModel.role == 'Admin') {
                this.router.navigate(['/requestView']);
            }
            else {
              this.router.navigate(['/meetings']);
              this.subscribe();

            }
        }

    });
}
  }
  private subscribe() {
    
    this.httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      observe: 'events'
    };

    
    // Retrieve public VAPID key from the server
    this.notification.getPublicKey().subscribe(P => {

      // Request subscription with the service worker
      this.swPush.requestSubscription({
        serverPublicKey: P.publicKey
      })
        // Distribute subscription to the server
        .then(subscription => this.notification.postDataToServer(subscription,this.userModel).subscribe(
          () => {
            console.log('Notifications subscribed success');
            this.SendNotifications();
          },
          error => console.error(error)
        ))
        .catch(error => {
          console.error(error)
          
        });
    },
      error => console.error(error));
  }


  unsubscribe(endpoint) {
    this.swPush.unsubscribe()
      .then(() => this.httpClient.delete(this.baseUrl + 'api/PushSubscriptions/' + encodeURIComponent(endpoint)).subscribe(() => { },
        error => console.error(error)
      ))
      .catch(error => console.error(error));

  }

  SendNotifications() {
      
   // this.notification.getNotification().subscribe();
    this.swPush.notificationClicks.subscribe(notpayload => {
      console.log(
        'Action: ' + notpayload.action +
        'Notification data: ' + notpayload.notification.data +
        'Notification data.url: ' + notpayload.notification.data.url +
        'Notification data.body: ' + notpayload.notification.body
      );
      window.open(notpayload.notification.data.url, "_blank");
    });
  }

}
