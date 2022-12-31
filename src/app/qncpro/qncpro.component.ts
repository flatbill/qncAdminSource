// import { asLiteral } from '@angular/compiler/src/render3/view/util'
import { Component, OnInit } from '@angular/core'
import { Input, Output }     from '@angular/core'
import {EventEmitter} from '@angular/core'
import apiFauna from 'src/utils/apiFauna'

// billy, adjust the read limit in app component.
// make sure ya dont have runaway reads like june23,
// but show user a message on profile screen
// when he hits the read limit.
// eventually set read limit to something bigger than 13.
// see app component readManyDbTables.

// billy, maybe rethink invite code and promo.
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
// cust and qid input and output.  oh well, it's an evil world.

@Component({
  selector: 'app-qncpro',
  templateUrl: './qncpro.component.html'
})
export class QncproComponent implements OnInit {
  //constructor() {}
  //@Input() subscriberInternalIdIn // from app component subscriptionObj??
  @Input() custIn
  @Input() qidIn
  @Input() qidArrayIn
  @Input() subscriptionObjIn
  @Input() teamMemberObjIn
  @Input() loadingDataBusyIn
  @Output() surveySelectOut = new EventEmitter()
  @Output() qidArrayOut = new EventEmitter()
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
  qidArray = []
  cust = ''
  qid = ''
  showdevNotes = false
  copyingTxt = false // remember when he copies invite text
  surveyObj = {} 
  qtDbDataObj = {} 

  ngOnInit() { 
    console.log('---+++running pro ngOnInit')
    this.msg1 = 'Qna List'
    // console.table(this.qidArray) 
    console.log(' pro init subObjIn:')
    console.table(this.subscriptionObjIn)
    //console.log(this.teamMemberSubscriberInternalId)
    this.qid = this.qidIn 
    this.cust = this.custIn
    //this.qidConvert() // 1time feb2022
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
    }  //end if

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

    if (typeof this.qidArrayIn == 'undefined') {
      this.qidArray = []
    } else {
      this.qidArray = this.qidArrayIn
    } // end if

  } // end ngOnInit

  qidMouseOver(ix) {
    if(this.loadingDataBusyIn) {return} //no surveys are clickable
    // mouseOver + mouseOut feels like a hack.
    // can we do a better bulma way to make rows selectable?
    let qlink = 'qlink-' + ix
    let el = document.getElementById(qlink)
    if (this.qidArray[ix].surveyStatus == 'active'
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

   if (this.qidArray[ix].qid == this.qid){
      this.msg1='this Qna is already selected.' 
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

    if (this.qidArray[ix].surveyStatus == 'active') {
      // change querystring:
      this.setQueryString(ix)
      this.msg1 = 'selected Qna: '
      + this.qidArray[ix].surveyName
      // we put a green check on the survey row he selects.
      // keep the green check on, until he selects another.
      // control the html green check with this.qid and *ngIf
      this.qid = this.qidArray[ix].qid
      // tell app component which Qid Selected:
      this.surveySelectOut.emit(this.qidArray[ix].surveyName) 
    } else {
      this.msg1 = 'this Qna is inactive, and cannot be selected.'
    } // end if

    // Mar2022 set surveyObj to test updateSurvey fauna function
    // this.surveyObj = this.surveysArray[ix]


    // dec 2021 temp. hard code promo:
    // if (this.qidArray[ix].surveyName == 'Digital Couch Survey'){}
    // if (this.qidArray[ix].surveyName == 'forest city Survey'){}

  }  // end qidChosen

  setQueryString(ix){
  console.log('running pro setQueryString')
  let myUrl  = new URL(window.location.href)
  this.qid  = this.qidArray[ix].qid
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
    apiFauna.qtReadSubscribers(this.teamMemberSubscriberInternalId)
      .then 
      (   (qtDbRtnObj) => 
        {
          console.log(' running .then of apiFauna.qtReadSubscribers') 
          this.buildSubscriptionInfo(qtDbRtnObj)
          this.launchQtReadSurveys()
        }
      )
      .catch(() => {  // apiFauna.qtReadInvitations returned an error 
        console.log('apiFauna.qtReadSubscriber error. subscriberInternalId: ' 
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
  

    this.msg1 = 'showing list of surveys for subscriber: '
    + this.subscriberUserName 
    + '. '  + '\xa0' + '\xa0' + '\xa0' + '\xa0' 
    + 'Click on a Survey.'
    this.subscriptionObjOut.emit(qtDbObj[0].data)
    //console.log ('288 pro buildSub internId     :',this.subscriberInternalId)
  } // end buildSubscriptionInfo 

  launchQtReadSurveys(){
    console.log('running  pro launchQtReadSurveys')
    this.msg1 = 'loading surveys info ...'
    apiFauna.qtReadSurveys(this.cust)
      .then((qtDbRtnObj) =>   {
          console.log(' running .then of apiFauna.qtReadSurveys') 
          this.buildSurveysInfo(qtDbRtnObj)
          this.sortSurveyArraybyNbr()
      }) // end then
      .catch(() => {  // api returned an error 
        console.log('apiFauna.qtReadSurveys error. cust: ' 
        , this.cust)
      }) // end catch
  } // end launchQtReadSurveys

  buildSurveysInfo(qtDbObj){
    // qtDbObj is a list of surveys from the data table.
    console.log('running buildSurveysInfo')
    console.log('294-0 qtDbObj:')
    console.table(qtDbObj)
    console.log('294a')
    console.table(qtDbObj[0].data)
    console.log('294b')
    console.log('299 surveys array')
    for (let i = 0; i < qtDbObj.length; i++) {
      console.log('300a')
      this.qidArray.push(qtDbObj[i].data)
      this.qidArray[i].surveySelected = false
      console.log('300b')
    } // end for
    console.log('pro 294c qidArray:')
    console.table(this.qidArray)
    this.qidArrayOut.emit(this.qidArray)
    // console.log('313 surveys Array:')
    // console.table(this.surveysArray)
    this.msg1 = 'Qna list'
  }
  
  sortSurveyArraybyNbr(){
    console.log('running sortSurveyArraybyNbr')
    this.qidArray
    .sort((a, b) => (Number(a.qid) > Number(b.qid) ) 
    ? 1 : (a.qid  == b.qid ) 
    ? ((a.qid > b.qid) ? 1 : -1) : -1 )
  } // end sortSurveyArraybyNbr

  setIcode(ix){
    let icodeN = Math.floor((Math.random() * 10000) + 1000)
    this.qidArray[ix].icode = icodeN.toString()
    this.launchQtUpdateSurvey(ix)
  }

  launchQtUpdateSurvey(ix){
    console.log('running  pro launchQtUpdateSurvey')
    // Mar2022 this func maybe should be in some other component
    this.msg1 = 'updating survey info ...'
    this.copyingTxt = true // a hack to prevent qidChosen again
    this.surveyObj['cust']   = this.cust
    this.surveyObj['qid']   = this.qidArray[ix].qid
    this.surveyObj['surveyName'] = this.qidArray[ix].surveyName
    this.surveyObj['surveyStatus'] = this.qidArray[ix].surveyStatus
    this.surveyObj['icode'] = this.qidArray[ix].icode
    apiFauna.qtUpdateSurvey(this.surveyObj)
      .then((qtDbRtnObj) => {
        console.log(' 342 pro running .then of apiFauna.qtUpdateSurvey') 
        this.msg1 = 'updated Qna info.  ' 
        + 'Please copy invitation link to paste into invitation emails.'
      }) // end then
      .catch(() => {  // api returned an error 
        console.log('apiFauna.qtUpdateSurvey error. surveyObj: ' )
        console.table(this.surveyObj)
      }) // end catch
  } // end launchQtUpdateSurvey


  async  copyTxt(ix) {
    console.log('running pro copyTxt')
    this.msg1 = 'copying invitation text...'
    this.copyingTxt = true
    let myUrl = 'https://qna.flyTechFree.com/' // april 2022
    + '?cust=' + this.cust                  // we already loaded cust
    + '&qid=' + this.qidArray[ix].qid      // he is selecting this qid
    + '&icode=' + this.qidArray[ix].icode  //  invite code
    + '&promo=' + 'promo711'  //  temp promo
    //console.log('pro copyTxt, qid:', qidParm )
    //console.log('pro copyTxt, cust:', this.cust )
    try {
      await navigator.clipboard.writeText(myUrl)
    } catch (err) {
      console.error('copyText Failed to copy: ', err)
    }
    this.msg1 = 'text copied to clipboard---> ' + myUrl
  }
  testArray(){
    let vinny =
    []

  } // end testArray

  // qidConvert(){
  // Feb 2022 one time conversion to qtSurvey table
  //   console.log('running qidConvert ')
  //   // incoming this.qidArray() has one row per survey.
  //   for (let i = 0; i < this.qidArray.length; i++) {
  //     this.surveyObj['cust']   = this.cust
  //     this.surveyObj['qid']   = this.qidArray[i].qid
  //     this.surveyObj['surveyName'] = this.qidArray[i].qName
  //     this.surveyObj['surveyStatus'] = this.qidArray[i].qidStatus
  //     console.log('294')
  //     console.table(this.surveyObj)
  //     this.qidConvertAddSurveyRec()
  //   } // end for
  // } // end qidConvert

  // qidConvertAddSurveyRec() {
  //   console.log('running qidConvertWriteSurveyRec')
  //   apiFauna.qtAddSurvey(this.surveyObj) 
  //   .then ((qtDbRtnObj) => { this.qtDbDataObj = qtDbRtnObj.data})
  //   .catch(() => {
  //     console.log('qidConvertAddSurveyRec error. surveyObj:' 
  //     +  this.surveyObj)
  //   })

  // } // end qidConvertWriteSurveyRec

} // end export QncproComponent
