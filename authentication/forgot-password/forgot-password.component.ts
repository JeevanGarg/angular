import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { isNullOrUndefined } from 'util';
import { Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ResetService } from '../../shared/services/resetpassword.service';
import { ResetPwdResponse } from 'src/app/shared/models/user';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent implements OnInit {
    forgotPassword: FormGroup;
    isvalid: boolean = true;
    resetLink = <ResetPwdResponse>{};
    message: string = '';
    isvalidUser: boolean = true;
     errMsg: string = '';

    constructor(private router: Router, private resetservice: ResetService, private toastr: ToastrService, private cd:ChangeDetectorRef) {
       
    }

    ngOnInit() {
        this.forgotPassword = new FormGroup(
            {
            'email': new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')])
            })
       
    }

    get email() { return this.forgotPassword.get('email'); }
    sendResetLinkEmail() {
       

        this.resetservice.generateResetLink(this.email.value).subscribe
            (
                data => {
                    this.resetLink = data,
                        this.isvalid = this.resetLink.isReset,
                        this.message = this.resetLink.errorMessage,
                         this.getStatusMessages();
                    
                }
            );
    }

    getStatusMessages() {
      this.toastr.clear();
        if (this.resetLink.isReset) 
        {
            this.toastr.success('Reset link has been sent sucessfully to the email', 'Forgot password');
            let sendBtnclick = document.querySelector('.hide');
            if (sendBtnclick.classList.contains('hide')) {
                sendBtnclick.classList.remove('hide');
                sendBtnclick.classList.add('show');
            }
            let sendBtnclick1 = document.querySelector('.forgotSuccessMsgHead.show');
            if (sendBtnclick1.classList.contains('show')) {
                sendBtnclick1.classList.remove('show');
                sendBtnclick1.classList.add('hide');
            }
        }  
          
        else {
          this.errMsg = this.resetLink.errorMessage;
          this.isvalidUser = false;
            //this.toastr.error(message, 'Forgot password');
           
        }
    }

    
    gobackLogin() {
        this.router.navigate(['/login']);
        
    }
}
