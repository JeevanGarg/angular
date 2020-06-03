import { Component, OnInit, ChangeDetectorRef, Input, EventEmitter, Output, SimpleChanges, OnChanges } from '@angular/core';
import { RequestService } from '../services/request.service';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { SharedService } from '../services/shared.service';
import { MeetingsService } from '../services/meetings.service';
import { RequestModel } from '../models/usercategory';
import { SlimScrollEvent, ISlimScrollOptions } from 'ngx-slimscroll';




@Component({
  selector: 'app-download',
  templateUrl: './download.component.html',
  styleUrls: ['./download.component.css']
})
export class DownloadComponent implements OnInit,OnChanges {
  @Input() request: RequestModel;
  @Input() downloadFiles: any[];
  @Input() openDownload: boolean;
  //@Input() textareaDisabled: boolean;
  @Input() comments: string;
  hgt: string;

  @Output() displayChange = new EventEmitter();
  userId: string;
  downloadforfiles: any;
  viewdownload: boolean;
  opts: ISlimScrollOptions;
  scrollEvents: EventEmitter<SlimScrollEvent>;


  constructor(private _rservice: RequestService, private _router: Router, private sanitizer: DomSanitizer, private datepipe: DatePipe,
    private _sharedService: SharedService,
    private meetingsService: MeetingsService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    
    this.userId = localStorage.getItem('user_id');
    if (this.downloadFiles != null || this.downloadFiles != undefined) {

    }
    
   // this.openDownload = true;
  }

  ngOnDestroy() {
    //   this.displayChange.unsubscribe();
  }

  close() {
    this.displayChange.emit(false);
   // this.openDownload = false;
    
     
  }

  onDownloadAllfor() {
    if (this.downloadFiles.length != 0) {
      for (let i = 0; i < this.downloadFiles.length; i++) {
        let filename = this.downloadFiles[i];
        this.onDownload(filename.fileName);
      }
    }
    else {
      console.log("ondownload all not working")
    }

  }

  ngOnChanges(changes: SimpleChanges): void {
    this.cd.detectChanges();
    
  }

  onDownload(filename: any) {
    
   // this.openDownload = true;
    let postData = {
      filename: filename,
      meetingId: this.request.meetingId,
      requestId: this.request.requestId
    };

    this._rservice.getdownload(postData).subscribe(response => {
      let contentType: any = "application/octet-stream";
      let FileName = filename;
      const _data = new Blob([response], { type: contentType });
      if (window.navigator && window.navigator.msSaveBlob) {
        window.navigator.msSaveBlob(_data, FileName);
      }
      else {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(_data);
        a.download = FileName;
        // start download
        a.click();
      }
    });

  }

}
