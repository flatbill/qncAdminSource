import {  Component, OnInit, Input, Output } from '@angular/core'
import {  EventEmitter } from '@angular/core'
import api from 'src/utils/api'

@Component({
  selector: 'app-qncwws',
  templateUrl: './qncwws.component.html'
})
export class QncwwsComponent implements OnInit {
  //componentTitle = 'login or logout wws'
  msg1 = '???'
  constructor() {}
  @Input() authIn
  @Input() firstLoginIn
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
  ngOnInit() {
    console.log('running wws ngOnInit =====')
    this.truncUrl() //remove any old querystring.
    // are you starting up or logging off?
    //console.log('firstLoginIn: ', this.firstLoginIn)
    window.scrollTo(0, 0)
    //this.teamMemberUserId = sessionStorage.getItem("ssUserId") //cursor woes
    document.getElementById("teamMemberUserId").focus()  
    
    if (this.firstLoginIn == true) {
      this.msg1 = 'Welcome to Qnc.'
        + '\xa0' + '\xa0' + '\xa0' + '\xa0' + ' Please Login.'
    }
    if (this.firstLoginIn == false) {
      this.msg1 = 'You are now logged out.'
      // billy, fix bug where logout still remembers subscriber.
      // maybe see logout menu button??
      // hint ... url gets reset to leftUrl somewhere?
      //teamMemberObj = {} // duznt reset anything
      //this.teamMemberObjOut.emit(this.teamMemberObj) 
      //this.truncUrl() //remove querystring.
    }
  } // end ngOnInit

  truncUrl(){
      console.log('running wws truncUrl')
      let myUrl  = new URL(window.location.href)
      let urlParams = new URLSearchParams(myUrl.search);
      let myQid = urlParams.get('qid')
      let leftUrl = myUrl.toString().split("?")[0] //take off any querystring
      let myNewUrl = leftUrl + ''
      history.pushState({}, null, myNewUrl)
      console.log( 'wws has set myNewUrl: ' , myNewUrl)
  }  // end truncUrl

  teamMemberUserIdChg(ev){ // he entered user id on the login screen.
    console.log('running wws teamMemberUserIdChg')
    this.teamMemberUserId =  ev.target.value
    this.teamMemberUserIdLowerCase = this.teamMemberUserId.toLocaleLowerCase()
    // he entered user id on the login screen
    //sessionStorage.setItem("ssUserId", ev.target.value) //cursor woes
  } // end teamMemberUserIdChg
 
  teamMemberPassChg(ev) {   // he entered pass on the login screen
    console.log('running wws passChg')
    this.teamMemberPass = ev.target.value
  } // end teamMemberPassChg

  doSign() {
    console.log('^^^running wws doSign')
    this.msg1 = 'attempting login ...'
    if ( this.teamMemberUserId.length == 0 ) {
        this.msg1 = 'please enter your User Id.'
    } else {
        if (this.teamMemberPass.length == 0 ) {
          this.msg1 = 'please enter your password.'
        } else {
          this.launchQtReadTeamMember()  // has chaining to other funcs
        }
    }
    // this.authIn = true
    // this.msg1 = 'fake login complete. '
    // // tell app component we are now authorized.
    // // app component will then do auth stuff.
    // this.qncSetAuthOnOut.emit()
    // this.proJumpOut.emit()
  } // end doSign

  enc(passParm) {
    console.log('running enc')
    let myChar = 's'
    // billy, maybe put this string into fauna, as the decoder key:
    let a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890`~!@#$%^&*()-_=+[{]}\|;:,<.>/?'
    let j = 0
    let k = ''
    let n = ''
    for (let i = 0; i < passParm.length; i++) {
      j = i + 1
      myChar = passParm.substring(i, j);
      //k = a.indexOf(myChar)
      k = a.indexOf(myChar).toString().padStart(2, '0')
      n = n + k
    } // end for
    this.passEnc = n
    //console.log('passEnc:', this.passEnc)
  } // end enc

  dec(passParm) {
    //console.log('running dec')
    let positionNbr = 0
    let a = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz1234567890`~!@#$%^&*()-_=+[{]}\|;:,<.>/?'
    let k = ''
    let n = ''
    for (let i = 0; i < passParm.length; i += 2) {
      positionNbr = parseInt(passParm.slice(i, i + 2))
      k = a.slice(positionNbr, positionNbr + 1)
      n = n + k
    } // end for
    this.passDec = n
    //console.log('passDec:', this.passDec)
  } // end dec

  valTeamMemberUserLogin(){
    console.log('=== running valTeamMemberUserLogin')
    //this.enc(this.teamMemberPass)
    if(this.passDec != this.teamMemberPass){
      this.msg1 = 'you entered an invalid password.'
      return
    }
    this.authIn = true
    //this.showSignHtml = false
    //this.componentTitle = 'wws login/logout'
    this.msg1 = 'fake login complete. '
    // tell app component we are now authorized.
    // app component will then do auth stuff.
    this.qncSetAuthOnOut.emit()
    this.proJumpOut.emit()
    this.teamMemberObjOut.emit(this.teamMemberObj) 

  } // end valTeamMemberUserLogin

  launchQtReadTeamMember(){
    console.log('running wws launchQtReadTeamMember')
    this.msg1 = 'loading team member info ...'
    api.qtReadTeamMembers(this.teamMemberUserIdLowerCase)
      .then 
      (   (qtDbRtnObj) => 
        {
          console.log(' running .then of api.qtReadTeamMembers')
          this.buildTeamMemberObj(qtDbRtnObj)
          //console.table(qtDbRtnObj)
          this.valTeamMemberUserLogin() 
        }
      )
      .catch(() => {  // api.qtReadTeamMember returned an error 
        console.log('api.qtReadTeamMembers error. team member user id: ' 
        , this.teamMemberUserId)
        this.teamMemberNotFound()
      })
  
  } // end launchQtReadTeamMember

  buildTeamMemberObj(qtDbObj){
    console.log('running wws buildTeamMemberObj')
    this.teamMemberObj = qtDbObj[0].data
    //console.log('wws 218')
    //console.table(this.teamMemberObj)
    //console.log(this.teamMemberObj['pass'])
    this.dec(this.teamMemberObj['pass']) // sets this.passDec
    // this.teamMemberUserName = qtDbObj[0].data.userName
    // this.teamMemberSubscriberInternalId = qtDbObj[0].data.subscriberInternalId
  }  // end buildTeamMemberObj

  teamMemberNotFound(){
    this.msg1 = 'you entered an invalid User Id.'
  } // end teamMemberNotFound

} // end export QncwwsComponent
