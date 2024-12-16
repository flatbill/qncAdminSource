import {  Component, OnInit, Input, Output } from '@angular/core'
import {  EventEmitter } from '@angular/core'
import apiFauna from '../../../src/utils/apiFauna'
import apiSupabase from '../../../src/utils/apiSupabase'
import GoTrue from 'gotrue-js'
// import GoTrue from '../../../../gotrue-js'
// import { GoTrueClient } from '@supabase/gotrue-js'

@Component({
  selector: 'app-qncwws',
  templateUrl: './qncwws.component.html'
})
export class QncwwsComponent implements OnInit {
  //componentTitle = 'login or logout wws'
  msg1 = '???'
  constructor() {}
  @Input() authIn:any
  @Input() firstLoginIn:any
  @Input() faunaOrSupabaseIn:any
  @Output() proJumpOut        = new EventEmitter()
  @Output() teamMemberObjOut  = new EventEmitter()
  @Output() qncSetAuthOnOut   = new EventEmitter()
  passEnc = ''
  passDec = ''
  teamMemberUserId = ''
  teamMemberUserIdLowerCase = ''
  teamMemberPass   = ''
  teamMemberObj = new Object
  showdevNotes = false
  eyeToolTipText = ''
  passwordShown = 'no'
  supaKeyFlds = {}
  supaData = []
  faunaData = []
  teamMembersArray = []
  authGoTrue = new GoTrue(  {
  // authGoTrue = new GoTrueClient(  {
    
    APIUrl: "https://qnaadmin.flytechfree.com/.netlify/identity",
    audience: "",   setCookie: false })
   // https://gotruejs-playground.netlify.app/#log-in <-- learn here

  ngOnInit() {
    console.log('running wws ngOnInit =====')
    this.truncUrl() //remove any old querystring.
    // are you starting up or logging off?
    //console.log('firstLoginIn: ', this.firstLoginIn)
    window.scrollTo(0, 0)
    //this.teamMemberUserId = sessionStorage.getItem("ssUserId") //cursor woes
    let el = document.getElementById('teamMemberUserId') as HTMLElement
    el.focus
    // document.getElementById("teamMemberUserId").focus()  //hate typescript
    
    if (this.firstLoginIn == true) {
      this.msg1 = 'Welcome to Qna Admin.'
        + '\xa0' + '\xa0' + '\xa0' + '\xa0' + ' Please Login.'
   
    }
    if (this.firstLoginIn == false) {
      this.msg1 = 'You are now logging out...'
      this.goTrueSignOff()
      this.msg1 = 'You are now logged out.'
    } // end if firstLogIn false

  } // end ngOnInit

  goTrueSignOff(){
    console.log('running goTrueSignOff')
    let myUser:any =  this.authGoTrue.currentUser()
    // alert(typeof myUser)
    myUser
      .logout()  
      .then((response:any) => console.log("User logged out"))
      .catch((err:any) => {
        console.log("Failed to logout user: %o", err)
        throw err })
  }
  
  truncUrl(){
      console.log('running wws truncUrl')
      let myUrl  = new URL(window.location.origin) //.href)
      let urlParams = new URLSearchParams(myUrl.search)
      let myQid = urlParams.get('qid')
      let leftUrl = myUrl.toString().split("?")[0] //take off any querystring
      let myNewUrl = leftUrl + ''
      // history.pushState({}, null, myNewUrl) //hate typescript
      console.log( 'wws has set myNewUrl: ' , myNewUrl)
  }  // end truncUrl

  teamMemberUserIdChg(ev:any){ // he entered user id on the login screen.
    console.log('running wws teamMemberUserIdChg')
    this.teamMemberUserId =  ev.target.value
    this.teamMemberUserIdLowerCase = this.teamMemberUserId.toLocaleLowerCase()
    // he entered user id on the login screen
    //sessionStorage.setItem("ssUserId", ev.target.value) //cursor woes
  } // end teamMemberUserIdChg
 
  teamMemberPassChg(ev:any) {   // he entered pass on the login screen
    console.log('running wws passChg')
    this.teamMemberPass = ev.target.value
  } // end teamMemberPassChg

  doSign() { // launched from login button click
    console.log('^^^running wws doSign')
    this.msg1 = 'attempting login ...'
    if ( this.teamMemberUserId.length == 0 ) {
        this.msg1 = 'please enter your User Id.'
    } else {
        if (this.teamMemberPass.length == 0 ) {
          this.msg1 = 'please enter your password.'
        } else {
          this.goTrueSignOn() // dec 2022 has chaining
        }
    }
  } // end doSign

   goTrueSignOn(){
    console.log('running goTrueSignOn')
    this.authGoTrue.login(this.teamMemberUserId,this.teamMemberPass)
    .then(() => {  //done with login attempt, did not hit the catch
       this.msg1 = 'Login OK, looking up Team Member info...' 
       console.log(this.msg1 )
       if (this.faunaOrSupabaseIn == 'fauna') {
         this.launchReadFaunaTeamMember() } 
       if (this.faunaOrSupabaseIn == 'supabase') {
         this.supaKeyFlds = {'userId' : this.teamMemberUserIdLowerCase}
         this.launchReadSupabase('qtTeamMembers',this.supaKeyFlds) } 
     }) // end then
    .catch((err:any) => {
       let myErrDesc =JSON.stringify(err.json.error_description)
       myErrDesc = myErrDesc.replace('"','').replace('"','')
       this.msg1 = myErrDesc  
     } ) // end catch
     console.log('end goTrueSignon')
     // let myErr = '???'
 
 
  } // end goTrueSignOn
  // goTrue has .login and .catch -- tried to convert to async await,
  // but .catch is needed for invalid signon. For wider use catch, nice tutorial here:
  // https://wesbos.com/javascript/12-advanced-flow-control/71-async-await-error-handling

  async launchReadFaunaTeamMember(){
    console.log('running launchReadFaunaTeamMember') 
    let faunaRes = await apiFauna.qtReadTeamMembers(this.teamMemberUserIdLowerCase)
    this.faunaData = faunaRes.map((f:any) => f.data)
    this.teamMembersArray = this.faunaData
    console.log('list of faunaData teamMembers we just read:') // (likey just one)
    console.table(this.faunaData)
    this.teamMemberObj = this.faunaData[0]
    this.authIn = true 
    this.teamMemberObjOut.emit(this.teamMemberObj) 
    this.qncSetAuthOnOut.emit()
    this.proJumpOut.emit()
  }  // end launchReadFaunaTeamMember

  async launchReadSupabase(tbl:any,flds:any) {
    console.log(Date.now()/10000,'149 wws running launchReadSupabase...')
    console.table(flds)
    let supaRes = await apiSupabase.readSupabase(tbl,flds)
    console.log(Date.now()/10000,'done waiting for apiSupabase.  supaRes:')
    console.log(supaRes)  //supaRes is only a promise unless I await. 
                          //supaRes is null if fieldname is wrong.
                          //supaRes is an empty object if not found.
    this.supaData = supaRes.supabaseData
    this.teamMembersArray = this.supaData.slice()
    this.teamMemberObj = this.teamMembersArray[0]
    // console.log('162 wws teamMemberObj:')
    // console.table(this.teamMemberObj)
    this.authIn = true 
    this.teamMemberObjOut.emit(this.teamMemberObj) 
    this.qncSetAuthOnOut.emit()
    this.proJumpOut.emit()
    console.log(Date.now()/10000,'164 wws end of launchReadSupabase.')
  } // end launchReadSupabase

  togglePasswordEye(ev:any){
    let el = document.getElementById('password') as HTMLElement
    let elType = el.getAttribute('type') 
    if (elType == 'password') {
      el.setAttribute('type', 'text')
      this.passwordShown = 'yes'
    }else{
      el.setAttribute('type', 'password')
      this.passwordShown = 'no'
    } // end if
    // he clicked the eye, turn off the tooltip
    this.eyeToolTipText = '' 
  } // endtogglePasswordEye

  tooltipsy(ev:any){
    console.log('running tooltipsy') // launched from html mouseover, mouseout
    if (ev.type == 'mouseover'){
      if (this.passwordShown=='yes'){
        this.eyeToolTipText = ' <- hide password'
      }else{
        this.eyeToolTipText = ' <- show password'
      } // end inner if
    } // end outer if
    if (ev.type == 'mouseout'){
       this.eyeToolTipText = ''  
    } // end if
  } // end tooltipsy

} // end export QncwwsComponent
