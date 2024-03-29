import {  HostListener, Component } from '@angular/core'
import apiFauna from 'src/utils/apiFauna'
//import GoTrue from 'gotrue-js'
import { Title } from '@angular/platform-browser'
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  @HostListener('document:keydown', ['$event']) 
  onKeydownHandler(event: KeyboardEvent) {
    if (event.key === "Escape") { this.escKeyWasHit() }
  } // end onKeydownHandler
  public constructor(private titleService: Title) { }
  compTitle = 'Admin Login'
  loadingDataMsg = ''
  loadingDataBusy = false
  showQnc = false  
  showQncWwq = false
  showQncWwqd = false
  showQncWwg = false
  showQncWwgd = false
  showQncWwr = false  
  showQncWwrd = false 
  showQncWwi = false
  showQncWwu = false
  showQncWws = true         // start with a login
  showQncConv = false       // set this true for ed338 conversion
  showQncMen = true         // jun2021 menu always true
  showQncPro = false        // profile
  showQncWwsr = false       // scoreboards
  showQncWwsrd = false      // scoreboards detail
  showAppComponent = false  // set this true for debugging
  groupArray = []
  rulesArray = []  
  questArray = []     // master list of questions
  accumArray = []
  scoreboardsArray = []

  daQuestion = 'no Question yet'
  wwqdCaller = 'no wwqdCaller yet'
  qid = '?'  
  cust = '?'
  accumObj = {}
  qncAuthorized = false
  menuButsAlive = false       // show buts on the menu component
  surveyMenuButsAlive = false // show buts for questions,rules, etc
  firstLogin = true
  teamMemberUserId     = ''      
  subscriberInternalId = ''
  dbReadCount = 0
  qidArray   = []
  subscriptionObj = new Object
  teamMemberObj   = new Object
  daScoreboardNbr = ''
  wwsrdCaller = 'no caller yet.'
  wwsrFilterReset = true
  wwqFilterReset = true
  wwrFilterReset = true
  wwgFilterReset = true
  surveyName = ''
  daRuleNbr = ''
  daGroupNbr = ''
  msg1 = '???'
  //whichMenuOptionToHighlight = ''
  ngOnInit()  {
    this.titleService.setTitle('Qna Admin')
    // this.goTrueConfirmBullshit()
    //this.goTrueSignOnBullshit()
    // alert('bottom of ngOnInit')
  } // end ngInit
  // goTrueAuthBullshit(){
  // }
  // goTrueConfirmBullshit(){
  //   let token = '1234'
  //   let authz = new GoTrue()
  //   .confirm(token, true)
  //   .then((response) => {
  //     console.log('Confirmation email sent', JSON.stringify({ response }))
  //   })
  //   .catch((error) => {
  //     console.log(error)
  //   });
  // }

  // goTrueSignOnBullshit(){
  //   alert('ready to try gotrue...')
  //    let authy = new GoTrue(  {
  //     //APIUrl: "https://clever-williams-469dd0.netlify.com/.netlify/identity",
  //       APIUrl: "https://qnaadmin.flytechfree.com/.netlify/identity",
  //     //APIUrl: "https://clever-payne-2da709.netlify.app/.netlify/identity",
  //     audience: "",   setCookie: false })
  //     //
  //     let myErr = '???'
  //     //let email = this.teamMemberUserId
  //     let email = 'billselzer@gmail.com'
  //     let password = 'forgot'
  //     authy
  //     .login(email, password)

  //     .then(() => {  //done with login attempt? 
  //       console.log('we hit .then of login attempt ' ) })

  //     .catch((err) => {
  //     myErr =`Failed :( ${JSON.stringify(err)}`
  //     console.log(myErr) }
  //     ) // end of catch
  // } // end of goTrueSignOnBullshit

  setQueryStringParms(){
      console.log('running setQueryStringParms')
      let locSearchResult = new URLSearchParams(location.search)
      let locSearchResultCust  = locSearchResult.get('cust')
      let locSearchResultQid   = locSearchResult.get('qid')
      let locSearchResultIcode = locSearchResult.get('icode')
       if (locSearchResultCust != null) {
        this.cust = locSearchResultCust
      }
      if (locSearchResultQid != null) {
        this.qid = locSearchResultQid
      }
      // if (locSearchResultIcode != null) {
      //   this.icode = locSearchResultIcode
      // }
      // when no querystring, set default  qid 4  billyFix
      // not a great idea when we get more.
      if(this.cust == '?'){this.cust = '1'}
      if(this.qid == '?'){this.qid = '4'}
      //if(this.icode == '?'){this.icode = '90210'}
      console.log('this.cust is: ',this.cust)
      console.log('this.qid is: ',this.qid)
      //console.log('this.icode is: ',this.icode)
  }

  setAuthOnFun(){
    // get here from login screen
    console.log('running app component setAuthOnFun')
    this.qncAuthorized = true
    this.menuButsAlive = true  //make menu alive
  }

  surveySelected(surveyNameParm){
    console.log('app running  surveySelected')
    console.log(surveyNameParm)
    this.surveyName = surveyNameParm
    // get here from profile screen. user has selected a qid.
    //  pro already set querystring.
    // blank out arrays, prior to fetching data
    this.groupArray = []
    this.rulesArray = []  
    this.questArray = []     // master list of questions
    // this.questArray2 = []    // filtered list of questions
    this.accumArray = []
    this.scoreboardsArray = []
    // this.scoreboardsArray2 = []
  
    this.setQueryStringParms()  //set  cust & qid from querystring
    // console.log(this.cust)
    // console.log(this.qid)
    //this.surveyMenuButsAlive = true  //make survey buts alive
    // read lotsa db tables cuz qid is now selected.
    this.readManyDbTables()   
  }

  qidArrayWasBuilt(qidArrayParm) {
    console.log('running app qidArrayWasBuilt')
    // get here from profile screen. 
    // profile screen looks up the subscriber's qids,
    // and has built the qidArray.
    // let's keep a copy of qidArray in app component,
    // just to carry it around once per login,
    // instead of re-reading the qidArray
    // every time he views the profile.
    this.qidArray = qidArrayParm
    console.log('app qidArray: ')
    console.table(this.qidArray)
  }

  subscriptionObjWasBuilt(subscriptObjParm) { // pro has built this
    console.log('running app subscriptionObjWasBuilt')
    this.subscriptionObj = subscriptObjParm
  } 

  teamMemberObjWasBuilt(teamMemberObjParm) { // wws has built this
    this.teamMemberObj = teamMemberObjParm
  } 

  showQncFun(){
    this.setAllShowCompFalse()
    this.showQnc = true
  } //end showQncFun
  showWwqFun(){
    this.compTitle = 'Qna Questions'
    if (this.showQncWwqd) {
      // jumping from wwqd to wwq
      this.wwqFilterReset = false
    } else {
      this.wwqFilterReset = true
    }
    this.setAllShowCompFalse() 
    this.showQncWwq = true
  } // end showWwqFun
  showWwqdFun(ev){
    this.compTitle = 'Qna Question Detail' 
    this.setAllShowCompFalse()
    this.showQncWwqd = true 
  } // end showWwqdFun
  showWwgFun(){
    this.compTitle = 'Qna Groups' 
    if (this.showQncWwgd) {
      // jumping from wwgd to wwg
      this.wwgFilterReset = false
    } else {
      this.wwgFilterReset = true
    }

    this.setAllShowCompFalse()
    this.showQncWwg = true
  } // end showWwgFun
  showWwgdFun(ev){
    this.compTitle = 'Qna Group Details' 
    this.setAllShowCompFalse()
    this.showQncWwgd = true 
  } // end showWwgdFun
  showWwrFun(){
    this.compTitle = 'Qna Rules' 
    if (this.showQncWwrd) {
      // jumping from wwrd to wwr
      this.wwrFilterReset = false
    } else {
      this.wwrFilterReset = true
    }
    this.setAllShowCompFalse()
    this.showQncWwr = true
  } // end showWwrFun
  showWwrdFun(ev){
    this.compTitle = 'Qna Rule Details' 
    this.setAllShowCompFalse()
    this.showQncWwrd = true
  } // end showWwrdFun
  showWwiFun(ev){
    this.compTitle = 'Qna Invitations' 
    this.setAllShowCompFalse()
    this.showQncWwi = true
  } // end showWwiFun
  showWwuFun(ev){
    this.compTitle = 'Qna Participants' 
    this.setAllShowCompFalse()
    this.showQncWwu = true 
  } // end showWwuFun
  showWwsFun(ev){ // jumping to sign on screen.
    console.log('running showWwsFun')
    this.compTitle = 'Qna Admin Login' 
    this.qncAuthorized = false
    this.menuButsAlive = false
    this.surveyMenuButsAlive = false  
    this.groupArray = []
    this.rulesArray = []  
    this.questArray = []     
    this.accumArray = []
    this.daQuestion = 'no Question yet'
    this.wwqdCaller = 'no wwqdCaller yet'
    this.qid = '?'  
    this.cust = '?'
    this.accumObj = {}
    this.teamMemberUserId     = ''      
    this.subscriberInternalId = ''
    this.dbReadCount = 0
    this.qidArray   = []
    this.subscriptionObj = {}
    this.teamMemberObj = {}
    this.scoreboardsArray = []
    // this.scoreboardsArray2 = []
    this.daScoreboardNbr = ''
    this.wwsrdCaller = 'no caller yet, sir.'
    this.firstLogin = false
    this.setAllShowCompFalse()
    this.showQncWws = true 
  } // end showWwsFun
  showProFun(){
    //alert('239 showProFun')
    this.compTitle = 'Qna Profile' 
    //this.whichMenuOptionToHighlight = 'profile'
    this.setAllShowCompFalse()
    this.showQncPro = true 
  } // end showProFun

  showWwsrFun(){
    console.log('running showWwsrFun')
    this.compTitle = 'Qna Scoreboards' 
    if (this.showQncWwsrd) {
      // jumping from wwsrd to wwsr
      this.wwsrFilterReset = false
    } else {
      this.wwsrFilterReset = true
    }
    this.setAllShowCompFalse()
    this.showQncWwsr = true
  }

  showWwsrdFun(ev){
    console.log('running showWwsrdFun')
    this.compTitle = 'Qna Scoreboard Detail' 
    this.setAllShowCompFalse()
    this.showQncWwsrd = true
  }


  setAllShowCompFalse(){
    this.showQnc    = false
    this.showQncWwg = false
    this.showQncWwgd = false
    this.showQncWwq = false
    this.showQncWwqd = false
    this.showQncWwr = false
    this.showQncWwrd = false
    this.showQncWwi = false
    this.showQncWwu = false
    this.showQncWws = false
    this.showQncPro = false
    this.showQncWwsr = false
    this.showQncWwsrd = false
    this.showQncConv = false
  } // end setAllShowCompFalse

  setQuestionFromWwqFun(ev){
    console.log('running app setQuestionFromWwqFun')
    // user selected a question from wwq
    // pass it into daquestion
    // to get ready to call wwqd
    this.daQuestion = ev
    this.wwqdCaller = 'wwq'
  }

  setQuestionsFromWwqFun(ev){   // ev is from wwq
    console.log('running app setQuestionsFromWwqFun')
    this.questArray = ev
  }


  setScoreboardNbrFromWwsrFun(ev){
    console.log('running app setScoreboardNbrFromWwsrFun')
    // user selected a scoreboard from wwsr
    // pass it into daScoreboard
    // to get ready to call wwsrd
    this.daScoreboardNbr = ev
    this.wwsrdCaller = 'wwsr'
  }

  setScoreboardsFromWwsrFun(ev){
    console.log('running app setScoreboardsFromWwsrFun')
    // he is jumping from scoreboard list to scoreboard detail
    this.scoreboardsArray = ev 
  }

  setRuleNbrFromWwrFun(ev){
  // he is jumping from rule list to rule detail
    console.log('running app setRuleNbrFromWwrFun')
    this.daRuleNbr = ev 
    console.log('app 309 rule nbr:', this.daRuleNbr)
  }
  
  setRulesFromWwrFun(ev){
    console.log('running app setRulesFromWwrFun')
    // he is jumping from rule list to rule detail
    this.rulesArray = ev 
  }

  setGroupNbrFromWwgFun(ev){
    // he is jumping from rule list to rule detail
      console.log('running app setGroupNbrFromWwgFun')
      this.daGroupNbr = ev 
      console.log('app 319 group nbr:', this.daGroupNbr)
  }
    
  setGroupsFromWwgFun(ev){
      console.log('running app setRulesFromWwrFun')
      // he is jumping from group list to group detail
      this.groupArray = ev 
  }

  escKeyWasHit(){ 
      console.log('running app escKeyWasHit') 
      if (this.showQncWwqd) {  // he was in wwqd
        this.showWwqFun()
        return
      }
      if (this.showQncWwgd) { // he was in wwgd
        this.showWwgFun()
        return
      }
      if (this.showQncWwrd) { // he was in wwrd
        this.showWwrFun()
        return
      }
      if (this.showQncWwsrd) { // he was in wwsrd
        this.showWwsrFun()
        return
      }
      if (this.showQncWws) {return}

      // default jump to pro
      this.showProFun()
     // alert('i wanna turn menu pro green, man.')
  } // end escKeyWasHit
  
  // sortQuestArray(){
  //   console.log('running app sortQuestArray')
  //   //console.log(a[prop].toString().padStart(4,'0'))
  //   this.questArray
  //   // .sort((a, b) => (Number(a.questNbr)  > Number(b.questNbr) ) 
  //   // ? 1 : (a.questNbr  == b.questNbr ) 
  //   // ? ((a.questSeq > b.questSeq) ? 1 : -1) : -1 )
  //   console.log('app 372 questArray:')
  //   console.table(this.questArray)
  //    .sort((a, b) => (Number(a.subset)  > Number(b.subset) ) 
  //    ? 1 : (a.subset  == b.subset ) 
  //    ? ((a.groupRound > b.groupRound) ? 1 : -1) : -1 )
 
  // } // end sortQuestArray

  readManyDbTables() {
    console.log('running app readManyDbTables. read count:',this.dbReadCount)
    this.surveyMenuButsAlive = false  //go true after table reads
    this.loadingDataMsg = '... loading survey data ...'
    this.loadingDataBusy = true
    if (this.dbReadCount >= 13) {   // hit read limit
      // why are we doing this limit?  well,
      // he has chose a different survey 13 times.
      // or you have some runaway program code.
      // a user can just start a new browser tab, 
      // if he hits this limit.
      console.log('** app readManyDbTables -- read limit exceeded.')
      return
    }
    this.dbReadCount=this.dbReadCount + 1
    this.launchReadQuestions() // has chaining to read other tables!
  }

  launchReadQuestions () {
  apiFauna.qtReadQuestions(this.cust,this.qid)
      .then 
      (   (qtDbRtnObj) => 
        {
          console.log(' running .then of qtReadQuestions') 
          // console.log('custAndQid:',this.cust,this.qid)
          // console.table(qtDbRtnObj)
          this.loadQuestionsFromDbToQuestArray(qtDbRtnObj)
          //this.sortQuestArray()  billy feb11 2022
          this.buildListOfAccumsFromQuestArray()
          this.launchQtReadRules() 
        }
      )
      .catch(() => {  // apiFauna.qtReadQuestions returned an error 
        console.log('apiFauna.qtReadQuestions error.' )
      })
  }  // end launchReadAllDbTables
 
  loadQuestionsFromDbToQuestArray(qtDbObj){
    console.log('running loadQuestionsFromDbToQuestArray')
    // input is qtDbObj from database and output allQuestions array.
    // get here from .then of reading quest table,
    // so qtDbObj is ready to use.
    this.questArray = [] //blank out array, then load it
    for (let i = 0; i < qtDbObj.length; i++) {
      this.questArray.push(qtDbObj[i].data)
    }
  }  // end loadQuestionsFromDbToQuestArray
 
  launchQtReadRules() {
  console.log('running LaunchQtReadRules')
  apiFauna.qtReadRules(this.cust,this.qid)
    .then 
      (   (qtDbRtnObj) => 
        {
          console.log(' running .then of apiFauna.qtReadRules') 
          this.buildListOfRules(qtDbRtnObj)
          this.launchQtReadGroups()
        }
      )
      .catch(() => {  // apiFauna.qtReadRules returned an error 
        console.log('apiFauna.qtReadRules error. cust & qid:' , this.cust, ' ', this.qid)
      })

  } //end launchQtReadRules

  buildListOfRules(qtDbObj){
    console.log('running app buildListOfRules')
    this.rulesArray = []
    for (let i = 0; i < qtDbObj.length; i++) {
      this.rulesArray.push(qtDbObj[i].data)
    } // end for
    //console.table(this.rulesArray)
  } // end buildListOfRules

 launchQtReadGroups() {
  console.log('running launchQtReadGroups')
  console.log('custAndQid:',this.cust,this.qid)
  apiFauna.qtReadGroups(this.cust,this.qid)
    .then 
      (   (qtDbRtnObj) => 
        {
          console.log(' running .then of apiFauna.qtReadGroups') 
          this.buildListOfGroups(qtDbRtnObj)
          this.launchQtReadScoreboards() //chaining

        }
      )
      .catch(() => {  // apiFauna.qtReadGroups returned an error 
        console.log('apiFauna.qtReadGroups error. cust & qid:' , this.cust, ' ', this.qid)
      })
  } //end launchQtReadGroups

  buildListOfGroups(qtDbObj){
    console.log('running app buildListOfGroups')
    this.groupArray = []
    for (let i = 0; i < qtDbObj.length; i++) {
          this.groupArray.push(qtDbObj[i].data)
    } // end for
    this.sortGroupsByNbr()  
}  // end buildListOfGroups

  buildListOfAccumsFromQuestArray(){
  console.log('running app buildListOfAccumsFromQuestArray')
  this.accumArray = []
  // read all questions array, find the unique accumulators.
  // push a newly discovered accum into accumArray.
  for (let i = 0; i < this.questArray.length; i++) {
    // this question has an array of accumulators.
    for (let j = 0; j < this.questArray[i].accum.length; j++) {
      // find the accum in accumArray. if not found, add it.
      let position = 
        this.accumArray.map(function(a) { return a.accum })
        .indexOf(this.questArray[i].accum[j])
      if (position < 0){
          this.accumObj = { 
            'accum': this.questArray[i].accum[j],
            'accumFedByQuests' : ['001','002','003']
          }
        this.accumArray.push(this.accumObj)
      }
    }
  }
  console.log('done buiding accumArray:',this.accumArray)
  }  // end buildListOfAccumsFromQuestArray

  launchQtReadScoreboards() {
    console.log('running launchQtReadScoreboards 449')
    // alert(this.cust)
    // alert(this.qid)
    apiFauna.qtReadScoreboards(this.cust,this.qid)
      .then 
        (   (qtDbRtnObj) => 
          {
            console.log(' running .then of apiFauna.qtReadScoreboards') 
            this.buildListOfScoreboards(qtDbRtnObj)
            // done with  table reads,  set some menu buts alive.
            this.surveyMenuButsAlive = true  
            this.loadingDataMsg = ''
            this.loadingDataBusy = false

          }
        )
        .catch(() => {  // apiFauna.qtScoreboards returned an error 
          console.log('apiFauna.qtScoreboards error. cust & qid:' , this.cust, ' ', this.qid)
        })
  
    } //end launchQtReadScoreboards

  buildListOfScoreboards(qtDbObj) {
    console.log('running buildListOfScoreboards')
    this.scoreboardsArray = []
    // this.scoreboardsArray2 = []
      for (let i = 0; i < qtDbObj.length; i++) {
          this.scoreboardsArray.push(qtDbObj[i].data)
          // console.log('app 433 pushed into scoreboardsArray2')
      } // end for
      this.sortScoreboardsByNbr()
      // console.table(this.scoreboardsArray2)
      //console.table(this.scoreboardsArray)
      //console.log('app 462 end of buildListOfScoreboards')
  }

  sortGroupsByNbr(){
    this.groupArray
    .sort((a, b) => (Number(a.groupNbr)  > Number(b.groupNbr) ) 
    ? 1 : (a.groupNbr == b.groupNbr ) 
    ? ((a.groupName > b.groupName) ? 1 : -1) : -1 )
  }

  sortScoreboardsByNbr(){
    //console.log('522 running sortScoreboardsByNbr')
    this.scoreboardsArray
    .sort((a, b) => (Number(a.scoreboardNbr)  > Number(b.scoreboardNbr) ) 
    ? 1 : (a.scoreboardNbr == b.scoreboardNbr ) 
    ? ((a.scoreboardName > b.scoreboardName) ? 1 : -1) : -1 )
  }

} // end export AppComponent

// these pgms leave off semicolons, but remember:
// return  break, throw, continue - dont split lines
// never start a line with parentheses