import { Component, OnInit, Input,  
  EventEmitter, Output } from '@angular/core'
import apiFauna from '../../../src/utils/apiFauna'

@Component({
  selector: 'app-qncwwi',
  templateUrl: './qncwwi.component.html'
})
export class QncwwiComponent implements OnInit {
  msg1 = '?'
  invitesArray =    
  [
    {
      cust: '?',
      qid: '?',
      icode: "90210",
      ilink: "https://qncsurvey.netlify.app/?qid=2&cust=1"
    }
  ]

  constructor() {}
  @Input() InvitesIn:any
  @Input() custIn:any
  @Input() qidIn:any
  @Output() qncJumpOut = new EventEmitter()

  ngOnInit() {
    //this.initInvites()
    this.msg1 = 'loading invitations...'
    alert('wwi 22 running invitations')
    this.launchQtReadInvitations()
  }

  initInvites(){
    this.invitesArray  =
    [
      {
        cust: this.custIn,
        qid:  this.qidIn,
        icode: "90210",
        ilink: "https://qncsurvey.netlify.app/?qid=2&cust=1"
      }
    ]
  }
  detailButClick(ix:any){
    this.msg1 = 'wwi detail button clicked...'
  }

  jumpToQnc(){this.qncJumpOut.emit()}
  showHideHelp(){}

  copyButClick(ct:any) {
    this.copyText(ct)
  } 

  async  copyText(ct:any) {
    try {
      await navigator.clipboard.writeText(ct)
    } catch (err) {
      console.error('copyText Failed to copy: ', err)
    }
  }

  launchQtReadInvitations = () => {
  console.log('running LaunchQtReadInvitations') 
  apiFauna.qtReadInvitations(this.custIn, this.qidIn)
    .then 
      (   (qtDbRtnObj) => 
        {
          console.log(' running .then of apiFauna.qtReadInvitations') 
          this.buildListOfInvites(qtDbRtnObj)
        }
      )
      .catch(() => {  // apiFauna.qtReadInvitations returned an error 
        console.log('apiFauna.qtReadInvitations error. cust & qid' 
        , this.custIn, ' ', this.qidIn)
      })
  }

  buildListOfInvites(qtDbObj:any){ 
    console.log('running buildListOfInvites')
    // we have returned from the awaited promise of invitations fetch.
    // dbRtnObj contains all the invitations objects for this user+date.
    // console.log('here is qtDbObj:')
    // console.table(qtDbObj)
    this.invitesArray = []
    for (let i = 0; i < qtDbObj.length; i++) {
      this.invitesArray.push(qtDbObj[i].data)
    }
    console.log('invitesArray:')
    console.table(this.invitesArray)
    this.invitesArray
    .sort((a, b) => (a.qid > b.qid) ? 1 : -1 )
    this.msg1 = 'invitations shown.'
  }

} // end export
