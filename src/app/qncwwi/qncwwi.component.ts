import { Component, OnInit, Input,  
  EventEmitter, Output } from '@angular/core'
import api from 'src/utils/api'

@Component({
  selector: 'app-qncwwi',
  templateUrl: './qncwwi.component.html'
})
export class QncwwiComponent implements OnInit {
  msg1 = '?'
  invitesArray = []
  constructor() {}
  @Input() InvitesIn
  @Input() custIn
  @Input() qidIn
  @Output() qncJumpOut = new EventEmitter()

  ngOnInit() {
    //this.initInvites()
    this.msg1 = 'loading invitations...'
    this.launchQtReadInvitations()
  }

  initInvites(){
    this.invitesArray  =
    [
      {
        cust: this.custIn,
        qid: this.qidIn,
        icode: "90210",
        ilink: "https://stupefied-elion-621b07.netlify.app/?qid=2&cust=1"
      }
    ]
  }
  detailButClicked(ix){
    this.msg1 = 'wwi detail button clicked...'
  }

  jumpToQnc(){this.qncJumpOut.emit()}
  showHideHelp(){}

  copyButClicked(ct) {
    this.copyText(ct)
  } 

  async  copyText(ct) {
    try {
      await navigator.clipboard.writeText(ct)
    } catch (err) {
      console.error('copyText Failed to copy: ', err)
    }
  }

  launchQtReadInvitations = () => {
  console.log('running LaunchQtReadInvitations') 
  api.qtReadInvitations(this.custIn, this.qidIn)
    .then 
      (   (qtDbRtnObj) => 
        {
          console.log(' running .then of api.qtReadInvitations') 
          this.buildListOfInvites(qtDbRtnObj)
        }
      )
      .catch(() => {  // api.qtReadInvitations returned an error 
        console.log('api.qtReadInvitations error. cust & qid' 
        , this.custIn, ' ', this.qidIn)
      })
  }

  buildListOfInvites(qtDbObj){ 
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
