// import { asLiteral } from '@angular/compiler/src/render3/view/util'
import { Component, OnInit } from '@angular/core'
import { Input, Output }     from '@angular/core'
import {EventEmitter} from '@angular/core'
import apiSupabase from '../../../src/utils/apiSupabase'
import apiFauna    from '../../../src/utils/apiFauna'
// import { max } from 'rxjs'
// import apiSupabase from '../../../src/utils/apiSupabase'

// make sure ya dont have runaway reads like june23,
// but show user a message on profile screen
// when he hits a read limit.
// eventually set read limit to something.
// see app component readManyDbTables.

// billy, maybe rethink invite code and promo.
// invitation model A is wedding invitation set.
// promo model B is gift certificate.
// do ya really need an invitation screen?
// hey, how about used-up gift certificates? (promo expired?)

// billy, you are not consistent with obj and arrays for
// subscription info, subscriber, subscription array.
// the new convention is to make subscribersIn an array
// (even though it will likely be only subscriber).
// then build a subscriberObj from the array.
// why do this?  consistence, or fix whats not broken?
// ... same with teamMember?
//===========================================================
// - this profile page is about a subscriber & teamMember.
// - and list of surveys for this subscriber. (qidArrayIn)
 
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

  // @Input() inputFromParent:any = '??zz??'
  @Input() subscriberInternalIdIn:any // from app component subscriptionObj??
  @Input() custIn:any
  @Input() qidIn:any
  @Input() qidArrayIn:any
  @Input() subscriptionObjIn:any
  @Input() teamMemberObjIn:any
  @Input() loadingDataBusyIn:any
  @Input() faunaOrSupabaseIn:any
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
  // qidArray = []
  cust = ''
  qid = ''
  showdevNotes = false
  copyingTxt = false // remember when he copies invite text
  surveyObj = {
    "cust": '1',
    "qid": '1',
    "surveyName": '-?-',
    "surveyStatus": 'active',
    'icode': '90210',
    'id': '0'
  } 
  qtDbDataObj = {} 
  supaFlds = {}
  supaRes =  {
    "data": [
      {
        "id": 1,
        "name": "Afghanistan"
      },
      {
        "id": 2,
        "name": "Albania"
      },
      {
        "id": 3,
        "name": "Algeria"
      }
    ],
    "status": 200,
    "statusText": "OK"
  }

  supaDataArray = []
  faunaData = []
  subscriptionsArray:any = []

  supaKeyFlds = {}

  async ngOnInit() { 
    console.log('96 running pro ngOnInit')
    // console.log(this.qidArrayIn)    
    this.msg1 = 'Qna List'
    // console.table(this.qidArray) 
    console.log(' 99 pro init subscriptionObjIn:')
    console.table(this.subscriptionObjIn)
    //console.log(this.teamMemberSubscriberInternalId)
    this.qid = this.qidIn 
    this.cust = this.custIn
    // console.log('129 pro qid & Cust:' )
    // console.log(this.qidIn )
    // console.log(this.custIn )
    if (Object.keys(this.teamMemberObjIn).length  > 0) {
      // console.log('86 pro init teamMemberObjIn > 0')
      // we are carrying around teamMember object
      // from prior runs of pro 
      this.teamMemberUserId  = this.teamMemberObjIn.userId
      this.teamMemberUserName = this.teamMemberObjIn.userName
      this.teamMemberSubscriberInternalId = this.teamMemberObjIn.subscriberInternalId
    } //end if 

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

      if (this.qidIn == '?' ) { // first time in
        if (this.faunaOrSupabaseIn == 'fauna') {
          await this.launchReadFaunaSubscribers()
          await this.buildSubscriptionInfo()
          await this.launchReadFaunaSurveys()
          this.sortSurveyArraybyQid()
        } // end if
        if (this.faunaOrSupabaseIn == 'supabase') {
          this.supaKeyFlds = {"internalId": this.teamMemberSubscriberInternalId}
          await this.launchReadSupabase('qtSubscribers',this.supaKeyFlds)
          await this.buildSubscriptionInfo()
          this.supaKeyFlds = {"cust": this.cust} 
          await this.launchReadSupabase('qtSurveys',this.supaKeyFlds)
          this.sortSurveyArraybyQid()
        } // end if
        this.qidChosen(0) // default to the first qid
        this.qidArrayOut.emit(this.qidArrayIn)

      } // end if
      let el = document.getElementById("profile") as HTMLElement //oct2024
      el.classList.add("has-background-primary")

  } // end ngOnInit

  qidMouseOver(ix:any) {
    if(this.loadingDataBusyIn) {return} //no surveys are clickable
    // mouseOver + mouseOut feels like a hack.
    // can we do a better bulma way to make rows selectable?
    let qlink = 'qlink-' + ix
    let el = document.getElementById(qlink) as HTMLElement
    if (this.qidArrayIn[ix].surveyStatus == 'active'
    && ! this.loadingDataBusyIn) {
      el.classList.remove("has-background-success-light")
      el.classList.add("is-clickable")
      el.classList.add("has-background-link-light")
      //el.classList.add("has-text-white") //duznt work?
      //el.removeAttribute("disabled")
    }
      
  } // end qidMouseOver

  qidMouseOut(ix:any) {
    let qlink = 'qlink-' + ix
    let el = document.getElementById(qlink) as HTMLElement
    el.classList.add("has-background-success-light")
    el.classList.remove("has-background-link-light")
    // el.classList.remove("has-text-white") // duznt work?
  } // end qidMouseOut

  qidChosen(ix:any){
    console.log('201 running pro qidChosen')
    //loop all el.classList.remove("is-clickable") ??
    if ( this.loadingDataBusyIn) {return} //cant select right now cuz we r busy
    if ( this.copyingTxt == true){  // a hack, to prevent qidChosen 
      // when he is just copying text.  (return now!)
      // fix this hack someday, by changing
      // the survey list table html. but html tables are tricky.
      this.copyingTxt = false
      return
    } 

   if (this.qidArrayIn[ix].qid == this.qid){
      // this.msg1='this Qna is already selected.' 
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

    if (this.qidArrayIn[ix].surveyStatus == 'active') {
      // change querystring:
      this.setQueryString(ix)
      this.msg1 = 'selected Qna: '
      + this.qidArrayIn[ix].surveyName
      // we put a green check on the survey row he selects.
      // keep the green check on, until he selects another.
      // control the html green check with this.qid and *ngIf
      this.qid = this.qidArrayIn[ix].qid
      // tell app component which Qid Selected:
      this.surveySelectOut.emit(this.qidArrayIn[ix].surveyName) 
    } else {
      this.msg1 = 'this Qna is inactive, and cannot be selected.'
    } // end if

    // Mar2022 set surveyObj to test updateSurvey fauna function
    // this.surveyObj = this.surveysArray[ix]


    // dec 2021 temp. hard code promo:
    // if (this.qidArray[ix].surveyName == 'Digital Couch Survey'){}
    // if (this.qidArray[ix].surveyName == 'forest city Survey'){}

  }  // end qidChosen

  setQueryString(ix:any){
  console.log('260 running pro setQueryString')
  let myUrl  = new URL(window.location.href)
  this.qid  = this.qidArrayIn[ix].qid
  let leftUrl = myUrl.toString().split("?")[0] //take off old querystring
  let myNewUrl = leftUrl       // + '?qid=4&cust=1'
    + '?qid='  + this.qid
    + '&cust=' + this.cust
    history.pushState({}, '', myNewUrl) //oct2024 2nd parm must be string.
} // end setQueryString
 
  async launchReadFaunaSubscribers(){
    console.log('running launchReadFaunaSubscribers') 
    let faunaRes = await apiFauna.qtReadSubscribers(this.teamMemberSubscriberInternalId)
    this.faunaData = faunaRes.map((f:any) => f.data)
    this.subscriptionsArray = this.faunaData
    console.log('list of faunaData subscribers we just read:') // (likey just one)
    console.table(this.faunaData)
  } // end launchReadFaunaSubscribers

  async launchReadFaunaSurveys(){
    console.log('running launchReadFaunaSurveys') 
    let faunaRes = await apiFauna.qtReadSurveys(this.cust)
    this.faunaData = faunaRes.map((f:any) => f.data)
    this.qidArrayIn = this.faunaData
    console.log('list of faunaData surveys we just read:')
    console.table(this.faunaData)
  } // end launchReadFaunaSurveys

  async launchReadSupabase(tbl:string,flds:object) {
    console.log(Date.now()/10000,'282 running  pro launchReadSupabase...')
    let supaRes = await apiSupabase.readSupabase(tbl,flds)
    console.log(Date.now()/10000,'284 done pro waiting for apiSupabase.  supaRes:')
    console.log(supaRes)  //supaRes is only a promise unless I await. 
                          //supaRes is null if fieldname is wrong.
                          //supaRes is an empty object if not found.
    this.supaDataArray = supaRes.supabaseData
    if (this.supaDataArray.length == 0 ) {
      console.log('pro 290 supaRes.data is null for:  ' + tbl + flds)
    }
    // billy, checking for null is not great error handling.
    if (tbl == 'qtSubscribers'){ this.subscriptionsArray = this.supaDataArray.slice()}
    if (tbl == 'qtSurveys')    { this.qidArrayIn = this.supaDataArray.slice()}
    console.log(Date.now()/10000,'end pro launchReadSupabase.')
  } // end launchReadSupabase

  async launchChgSupabase(tbl:string,flds:object) {
    console.log('running launchChgSupabase.')
    this.supaRes = await apiSupabase.chgSupabase(tbl,flds)
  }  // end launchChgSupabase

  buildSubscriptionInfo(){
    console.log('running  pro buildSubscriptionInfo')
    // subscriptionsArray has already been built.
    // there is likely only one rec in subscriptionsArray.
    let si = this.subscriptionsArray[0]
    this.cust = si.cust
    this.subscriberUserId   = si.userId
    this.subscriberUserName = si.userName
    this.subscriberPlan     = si.plan
    let myDateString        = si.planExpDate + 'T00:00:00'
    // let myDateString =   '2040-12-31T00:00:00'
    this.subscriberPlanExpDate =  new Date(myDateString)
    this.subscriberPlanExpDateTxt = si.planExpDate 
    this.subscriberInternalId = si.internalId
    console.log('317 subscriber int:', this.subscriberInternalId)
    let d=new Date(Date.now())
    if (d.getTime() < this.subscriberPlanExpDate.getTime() ){
      console.log('pro buildSubscription info, subscription not yet expired') 
    }
    if (d.getTime() > this.subscriberPlanExpDate.getTime() ){
      console.log('pro buildSubscription info, subscription is expired') 
    }
    this.subscriptionObjOut.emit(this.subscriptionsArray[0])
  } // end buildSubscriptionInfo
  
  sortSurveyArraybyQid(){
    console.log('329 pro running sortSurveyArraybyNbr')
    // console.table(this.qidArrayIn)
    function myCompareFun(a:any, b:any) {
      const fldA = a.qid 
      const fldB = b.qid 
      let comparisonOneNegOne = 0
      if (fldA > fldB) {comparisonOneNegOne = 1} 
      else if (fldA < fldB) {comparisonOneNegOne = -1 }
      return comparisonOneNegOne
    }// end myCompareFun
    this.qidArrayIn.sort(myCompareFun)
  }// end sortSurveyArraybyQid
  
  setIcode(ix:any){
    let d = new Date();
    let newIcode:string = String(d.getTime()).substring(8, 12)
    this.qidArrayIn[ix].icode = newIcode
    this.launchQtUpdateSurvey(ix)
  } // end setIcode

  launchQtUpdateSurvey(ix:any){
    console.log('350 pro running  pro launchQtUpdateSurvey')
    // Mar2022 this func maybe should be in some other component
    this.msg1 = 'updating survey info ...'
    this.copyingTxt = true // a hack to prevent qidChosen again
    this.surveyObj['cust']   = this.cust
    this.surveyObj['qid']   = this.qidArrayIn[ix].qid
    this.surveyObj['surveyName'] = this.qidArrayIn[ix].surveyName
    this.surveyObj['surveyStatus'] = this.qidArrayIn[ix].surveyStatus
    this.surveyObj['icode'] = this.qidArrayIn[ix].icode
    this.surveyObj['id'] = this.qidArrayIn[ix].id
    if(this.faunaOrSupabaseIn=='fauna'){
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

    }// end if
    if(this.faunaOrSupabaseIn=='supabase'){
      this.supaFlds = this.surveyObj
      this.launchChgSupabase('qtSurveys',this.supaFlds)
    }// end if

  } // end launchQtUpdateSurvey

  async copyTxt(ix:any) {
    console.log('running pro copyTxt')
    // console.log(ix)
    this.msg1 = 'copying invitation text...'
    this.copyingTxt = true
    let myUrl = 'https://qna.flyTechFree.com/' // april 2022
    + '?cust=' + this.cust                  // we already loaded cust
    + '&qid=' + this.qidArrayIn[ix].qid      // he is selecting this qid
    + '&icode=' + this.qidArrayIn[ix].icode  //  invite code
    + '&promo=' + 'promo711'  //  temp promo
    try {
      await navigator.clipboard.writeText(myUrl)
    } catch (err) {
      console.error('copyText Failed to copy: ', err)
    }
    this.msg1 = 'text copied to clipboard---> ' + myUrl
  } // end copyTxt

} // end export QncproComponent
