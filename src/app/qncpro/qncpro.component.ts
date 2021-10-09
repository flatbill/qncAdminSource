import { Component, OnInit } from '@angular/core'
import { Input, Output }     from '@angular/core'
import {EventEmitter} from '@angular/core'
import api from 'src/utils/api'

// billy, adjust the read limit in app component.
// make sure ya dont have runaway reads like june23,
// but show user a message on profile screen
// when he hits the read limit.
// eventually set read limit to something bigger than 13.
// see app component readManyDbTables.

// billy, maybe rethink invite code.
// invitation model A is wedding invitation set.
// invitation model B is gift certificate.
// do ya really need an invitation screen?
// hey, how about used-up gift certificates?
// should the participants screen show which
// invite code he used?

//===========================================================
// - this profile page is about a subscriber & teamMember.
// - list of surveys for this subscriber.
 
// we get here to the profile page when he logs on as an admin.
// that means he entered a teamMember user id,
// ad we previously found him on the teamMember table.
// 
// app component keeps trak of teamMember table fields in teamMemberObj.
// app component keeps trak of subscriber table fields in subscriberObj.
// 
// subscriberInternalId is passed-into this pro component via its obj.
// we use subscriberInternalId as a key, to read subscriber table.
// we should hit a single subscription record, with info about this subscription.
// subscription table has multiple qid objects.
 
// there's something evil about just setting querystring,
// instead of the angular way of signaling app component with 
// cust and qid input and output.  oh well, its an evil world.

@Component({
  selector: 'app-qncpro',
  templateUrl: './qncpro.component.html'
})
export class QncproComponent implements OnInit {
  //constructor() {}
  //@Input() subscriberInternalIdIn // from app component subscriptionObj??
  @Input() custIn
  @Input() qidIn
  @Input() qidsArrayIn
  @Input() subscriptionObjIn
  @Input() teamMemberObjIn
  @Input() loadingDataBusyIn
  @Output() qidSelectOut = new EventEmitter()
  @Output() qidsArrayOut = new EventEmitter()
  @Output() subscriptionObjOut = new EventEmitter()
  @Output() teamMemberObjOut = new EventEmitter()
  msg1 = ''
  teamMemberUserId  = ''   
  teamMemberUserName = ''
  teamMemberSubscriberInternalId = ''
  subscriberUserId = ''
  subscriberUserName = ''
  subscriberPlan = ''
  subscriberPlanExpDate = new Date()
  subscriberPlanExpDateTxt = ''
  subscriberInternalId = ''
  qidsArray = []
  cust = ''
  qid = ''
  showdevNotes = false
  copyingTxt = false // remember when he copies invite text

  ngOnInit() { 
    console.log('---+++running pro ngOnInit')
    // console.table(this.qidsArray) 
    console.log(' pro init subObjIn:')
    console.table(this.subscriptionObjIn)
    //console.log(this.teamMemberSubscriberInternalId)
    this.qid = this.qidIn 
    this.cust = this.custIn
    this.qidsArray = this.qidsArrayIn
    // console.log('pro init teamMemberObjIn:')
    // console.table(this.teamMemberObjIn)

    if (Object.keys(this.teamMemberObjIn).length  > 0) {
      // console.log('86 pro init teamMemberObjIn > 0')
      // we are carrying around teamMember object
      // from prior runs of pro 
      this.teamMemberUserId  = this.teamMemberObjIn.userId
      this.teamMemberUserName = this.teamMemberObjIn.userName
      this.teamMemberSubscriberInternalId = this.teamMemberObjIn.subscriberInternalId
    } //else teamMember not valid? 

    if (Object.keys(this.subscriptionObjIn).length  > 0) {
      //console.log('95 pro init subscriptionObjIn > zero ')
      //console.table(this.subscriptionObjIn)

      // we are carrying around subscription object
      // from prior runs of pro.  
      this.subscriberUserName = this.subscriptionObjIn.userName
      this.subscriberUserId   = this.subscriptionObjIn.userId
      this.subscriberPlan     = this.subscriptionObjIn.plan
      this.subscriberPlanExpDateTxt = this.subscriptionObjIn.planExpDate
      this.subscriberInternalId = this.subscriptionObjIn.internalId
    }

    //console.log ('114 pro init sub internId save:',this.subscriberInternalIdSave)
    //console.log ('115 pro init sub internId     :',this.subscriberInternalId)
    
    if ( typeof this.subscriptionObjIn.internalId    == 'undefined' 
    ||   this.teamMemberObjIn.subscriberInternalId != this.subscriptionObjIn.internalId) {
      console.log('113 pro subscriber gonna launch launchQtReadSubscriber ...')
      this.launchQtReadSubscriber()  
    } // end if

  // if (this.teamMemberObjIn.subscriberInternalId !=
  //     this.subscriptionObjIn.internalId) {
  //     console.log('121 pro subscriber gonna launch launchQtReadSubscriber ...')
  //     this.launchQtReadSubscriber()  
  // }

  } // end ngOnInit

  qidMouseOver(ix) {
    if(this.loadingDataBusyIn) {return} //no surveys are clickable
    // mouseOver + mouseOut feels like a hack.
    // can we do a better bulma way to make rows selectable?
    let qlink = 'qlink-' + ix
    let el = document.getElementById(qlink)
    if (this.qidsArray[ix].qidStatus == 'active'
    && ! this.loadingDataBusyIn) {
      el.classList.remove("has-background-success-light")
      el.classList.add("is-clickable")
      el.classList.add("has-background-link-light")
      //el.classList.add("has-text-white") //duznt work?
      //el.removeAttribute("disabled")
    }
      
  }

  qidMouseOut(ix) {
    let qlink = 'qlink-' + ix
    let el = document.getElementById(qlink)
    el.classList.add("has-background-success-light")
    el.classList.remove("has-background-link-light")
    // el.classList.remove("has-text-white") // duznt work?
  }

  qidChosen(ix){
    console.log('running pro qidChosen')
    //loop all el.classList.remove("is-clickable") ??
    if ( this.loadingDataBusyIn) {return} //cant select right now cuz we r busy
    if ( this.copyingTxt == true){  // a hack, to prevent qidChosen 
      // when he is just copying text.  (return now!)
      // fix this hack someday, by changing
      // the survey list table html. but html tables are tricky.
      this.copyingTxt = false
      return
    } 

   if (this.qidsArray[ix].qid == this.qid){
      this.msg1='this survey is already selected.' 
      return
   }

    // this user has selected a qid from the screen list.
    // each qid has status of active/inactive.
    // only active qids are selectable on pro screen.
    // billy, this active/inactive thing is kinda confusing,
    // and the need is questionable.
    // the need might be OK if ya make all his surveys inactive
    // if he duznt pay the bill.
    // maybe make em all active by default, except for ed's.

    if (this.qidsArray[ix].qidStatus == 'active') {
      // change querystring:
      this.setQueryString(ix)
      this.msg1 = 'selected Survey: '
      + this.qidsArray[ix].qName
      // we put a green check on the survey row he selects.
      // keep the green check on, until he selects another.
      // control the html green check with this.qid and *ngIf
      this.qid = this.qidsArray[ix].qid
      this.qidSelectOut.emit(this.qidsArray[ix].qName) // send Qid Selected Signal to app component.
    } else {
      this.msg1 = 'this survey is inactive, and cannot be selected.'
    } // end if
  }  // end qidChosen

  setQueryString(ix){
  console.log('running pro setQueryString')
  let myUrl  = new URL(window.location.href)
  this.qid  = this.qidsArray[ix].qid
  let leftUrl = myUrl.toString().split("?")[0] //take off old querystring
  let myNewUrl = leftUrl       // + '?qid=4&cust=1'
    + '?qid='  + this.qid
    + '&cust=' + this.cust
  history.pushState({}, null, myNewUrl)
} // end setQueryString


  launchQtReadSubscriber() {
    console.log('running  pro launchQtReadSubscriber')
    //console.log('pro 211',this.teamMemberSubscriberInternalId)
    this.msg1 = 'loading subscriber info ...'
    api.qtReadSubscribers(this.teamMemberSubscriberInternalId)
      .then 
      (   (qtDbRtnObj) => 
        {
          console.log(' running .then of api.qtReadSubscribers') 
          this.buildSubscriptionInfo(qtDbRtnObj)
        }
      )
      .catch(() => {  // api.qtReadInvitations returned an error 
        console.log('api.qtReadSubscriber error. subscriberInternalId: ' 
        , this.subscriberInternalId)
      })
  } // end launchQtReadSubscriber
 
  buildSubscriptionInfo(qtDbObj){
    console.log('running  pro buildSubscriptionInfo')
    //console.table(qtDbObj[0].data)
    this.cust = qtDbObj[0].data.cust
    this.qid = '' // he has not selected a qid yet
    this.subscriberUserId = qtDbObj[0].data.userId
    this.subscriberUserName = qtDbObj[0].data.userName
    this.subscriberPlan = qtDbObj[0].data.plan
    let myDateString = qtDbObj[0].data.planExpDate + 'T00:00:00'
    // let myDateString =   '2040-12-31T00:00:00'
    this.subscriberPlanExpDate =  new Date(myDateString)
    this.subscriberPlanExpDateTxt = qtDbObj[0].data.planExpDate 
    this.subscriberInternalId = qtDbObj[0].data.internalId
    console.log('256 subscriber int:', this.subscriberInternalId)
    let d=new Date(Date.now())
    //console.log('+++++++++++++++++++++++++++++++++')
    //console.log(d.getTime())
    //console.log(this.subscriberPlanExpDate.getTime())
    if (d.getTime() < this.subscriberPlanExpDate.getTime() ){
      console.log('pro buildSubscription info, subscription not yet expired') 
    }
    if (d.getTime() > this.subscriberPlanExpDate.getTime() ){
      console.log('pro buildSubscription info, subscription is expired') 
    }
  
    console.table(qtDbObj[0].data.qids)
    this.qidsArray = []
    for (let i = 0; i < qtDbObj[0].data.qids.length; i++) {
      this.qidsArray.push(qtDbObj[0].data.qids[i])
      this.qidsArray[i].qidSelected = false
    } // end for data qids
    //console.log('pro qidsArray:')
    //console.table(this.qidsArray)
    // console.log(this.qidsArray[0].qName)
    this.msg1 = 'showing list of surveys for subscriber: '
    + this.subscriberUserName 
    + '. '  + '\xa0' + '\xa0' + '\xa0' + '\xa0' 
    + 'Click on a Survey.'
    this.qidsArrayOut.emit(this.qidsArray)
    this.subscriptionObjOut.emit(qtDbObj[0].data)
    //console.log ('288 pro buildSub internId     :',this.subscriberInternalId)
  } // end buildSubscriptionInfo 

  async  copyTxt(qidParm) {
    console.log('running pro copyTxt')
    this.msg1 = 'copying invitation text...'
    this.copyingTxt = true
    let myUrl = 'https://stupefied-elion-621b07.netlify.app/'
    + '?cust=' + this.cust   // we already loaded cust
    + '&qid=' + qidParm      // he is selecting this qid
    //console.log('pro copyTxt, qid:', qidParm )
    //console.log('pro copyTxt, cust:', this.cust )
    // billy, stick icode into the link url
    // ?? where should I store/retrive icode?
    // maybe the subscriber list of qids
    // where each qid has an icode.
    // think of wedding invitation sets,
    // dont do gift certificates yet?
    try {
      await navigator.clipboard.writeText(myUrl)
    } catch (err) {
      console.error('copyText Failed to copy: ', err)
    }
    this.msg1 = 'text copied to clipboard---> ' + myUrl
  }

} // end export QncproComponent
