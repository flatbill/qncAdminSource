import { HostListener, Component, OnInit } from '@angular/core'
import getEnvVars from '../../src/utils/getEnvVars'
import apiFauna from '../../src/utils/apiFauna'
import apiSupabase from '../../src/utils/apiSupabase'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['../styles.css']
})
export class AppComponent {
    @HostListener('document:keydown', ['$event']) 
    onKeydownHandler(event: KeyboardEvent) {
      if (event.key === "Escape") { this.escKeyWasHit() }
    } // end onKeydownHandler -- also see men component onKeydownHandler()
    faunaOrSupabase = ' ' // 'fauna' or 'supabase'. tells us where our data is hosted
    title = 'qna admin'

    public constructor() { }
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
    scoreboardsArray = []
    scoreboardRangesArray = []
    daQuestion = 'no Question yet'
    wwqdCaller = 'no wwqdCaller yet'
    qid = '?'  
    cust = '?'
    qncAuthorized = false
    menuButsAlive = false       // show buts on the menu component
    surveyMenuButsAlive = false // show buts for questions,rules, etc
    firstLogin = true
    teamMemberUserId     = ''      
    subscriberInternalId = ''
    dbReadCount = 0
    qidArray   = []
    usersArray = []
    scoresArray = []
    subscribersArray = []
    teamMembersArray = []
    subscriptionObj = {} //new Object
    teamMemberObj   = {} //new Object
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
    supaFlds = {}
    supaKeyFlds = {}
    supaEtlEnabled = false
    supaData = []
    faunaData = []
    answersArrayForEtl = [] // read fauna write supabase
    surveysArrayForEtl = [] // read fauna write supabase
  
    async ngOnInit()  {
      console.log('running app ngOnInit')
      // this.faunaOrSupabase = await getEnvVars.getFaunaOrSupabase()
      this.faunaOrSupabase =  'supabase' // billy get env
      console.log('84 app ngOnInit faunaOrSupabase ' + this.faunaOrSupabase)
    } // end ngInit 
  
    setQueryStringParms(){
        console.log('88 app.component running setQueryStringParms')
        console.log('88 app this.cust  , qid:')
        console.log(this.cust)
        console.log(this.qid)

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

        console.log('107 app setQueryStringParms this.cust , qid:')
        console.log(this.cust)
        console.log(this.qid)

        if(this.cust == '?'){this.cust = '2'}
        if(this.qid == '?'){this.qid = '1'}
    } // end setQueryStringParms
  
    setAuthOnFun(){    // get here from login screen
      console.log('running 158 app component setAuthOnFun')
      this.qncAuthorized = true
      this.menuButsAlive = true  //make menu alive
    } // end setAuthOnFun
  
    surveySelected(surveyNameParm:any){
      console.log('165 app running  surveySelected.surveyNameParm:')
      console.log(surveyNameParm)
      this.surveyName = surveyNameParm
      // get here from profile screen. user has selected a qid.
      //  pro already set querystring.
      // blank out arrays, prior to fetching data
      this.groupArray = []
      this.rulesArray = []  
      this.questArray = []     
      this.scoreboardsArray = []
      this.scoreboardRangesArray = []
      this.setQueryStringParms()  //set  cust & qid from querystring
      // read lotsa db tables cuz qid is now selected.
  
      if (this.faunaOrSupabase == 'fauna' ){
        this.readManyFaunaDbTables() 
      } // end if 
  
      if (this.faunaOrSupabase == 'supabase' ){
        this.readManySupabaseDbTables()  
      } // end if
    } // end surveySelected
  
    qidArrayWasBuilt(qidArrayParmIn:any) {
      console.log('running 193 app qidArrayWasBuilt')
      // get here from profile screen. 
      // profile screen looks up the subscriber's qids,
      // and has built the qidArray.
      // let's keep a copy of qidArray in app component,
      // just to carry it around once per login,
      // instead of re-reading the qidArray
      // every time he views the profile.
      this.qidArray = qidArrayParmIn
      console.log('199 app qidArrayWasBuilt. app qidArray: ')
      console.table(this.qidArray)
      // this.cust = this.qidArray[0].cust hate typescript
      // this.qid = this.qidArray[0].qid duznt work?
      // this.qid = this.qidArray[0]['qid']
      // this.cust = this.qidArray[0]['cust']
    } // end qidArrayWasBuilt
  
    subscriptionObjWasBuilt(subscriptObjParm:object) { // pro has built this
      console.log('running app subscriptionObjWasBuilt')
      this.subscriptionObj = subscriptObjParm
    } // end subscriptionObjWasBuilt
  
    teamMemberObjWasBuilt(teamMemberObjParm:object) { // wws has built this
      this.teamMemberObj = teamMemberObjParm
    }  // end teamMemberObjWasBuilt
  
    showQncFun(){ // called from html
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
  
    showWwqdFun(ev:any){
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
  
    showWwgdFun(ev:any){
      this.compTitle = 'Qna Group Detail' 
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
  
    showWwrdFun(ev:any){
      this.compTitle = 'Qna Rule Detail' 
      this.setAllShowCompFalse()
      this.showQncWwrd = true
    } // end showWwrdFun
  
    showWwiFun(ev:any){
      this.compTitle = 'Qna Invitations' 
      this.setAllShowCompFalse()
      this.showQncWwi = true
    } // end showWwiFun
    
    showWwuFun(ev:any){
      this.compTitle = 'Qna Participants' 
      this.setAllShowCompFalse()
      this.showQncWwu = true 
    } // end showWwuFun
  
    showWwsFun(ev:any){ // jumping to sign on screen.
      console.log('running showWwsFun')
      this.compTitle = 'Qna Admin Login' 
      this.qncAuthorized = false
      this.menuButsAlive = false
      this.surveyMenuButsAlive = false  
      this.groupArray = []
      this.rulesArray = []  
      this.questArray = []   
      this.scoreboardsArray = []
      this.scoreboardRangesArray = []
      this.daQuestion = 'no Question yet'
      this.wwqdCaller = 'no wwqdCaller yet'
      this.qid = '?'  
      this.cust = '?'
      // this.accumObj = {}
      this.teamMemberUserId     = ''      
      this.subscriberInternalId = ''
      this.dbReadCount = 0
      this.qidArray   = []
      this.usersArray   = []
      this.subscriptionObj = {}
      this.teamMemberObj = {}
      this.daScoreboardNbr = ''
      this.wwsrdCaller = 'no caller yet, sir.'
      this.firstLogin = false
      this.setAllShowCompFalse()
      this.showQncWws = true 
    } // end showWwsFun
  
    showProFun(){
      this.compTitle = 'Qna Profile' 
      //this.whichMenuOptionToHighlight = 'profile'
      this.setAllShowCompFalse()
      this.showQncPro = true 
    } // end showProFun
  
    showWwsrFun(){
      console.log('running app component showWwsrFun')
      this.compTitle = 'Qna Scoreboards' 
      if (this.showQncWwsrd) {
        // jumping from wwsrd to wwsr
        this.wwsrFilterReset = false
      } else {
        this.wwsrFilterReset = true
      }
      this.setAllShowCompFalse()
      this.showQncWwsr = true
    } // end showWwsrFun
  
    showWwsrdFun(ev:any){
      console.log('running showWwsrdFun')
      this.compTitle = 'Qna Scoreboard Detail' 
      this.setAllShowCompFalse()
      this.showQncWwsrd = true
    } // end showWwsrdFun
  
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
  
    setQuestionFromWwqFun(ev:any){
      console.log('running app setQuestionFromWwqFun')
      // user selected a question from wwq
      // pass it into daquestion
      // to get ready to call wwqd
      this.daQuestion = ev
      this.wwqdCaller = 'wwq'
    } // end setQuestionFromWwqFun
  
    setQuestionsFromWwqFun(ev:any){   // ev is from wwq
      console.log('running app setQuestionsFromWwqFun')
      this.questArray = ev
    } // end setQuestionsFromWwqFun
  
    setScoreboardNbrFromWwsrFun(ev:any){
      console.log('running app setScoreboardNbrFromWwsrFun')
      // user selected a scoreboard from wwsr
      // pass it into daScoreboard
      // to get ready to call wwsrd
      this.daScoreboardNbr = ev
      this.wwsrdCaller = 'wwsr'
    } // end setScoreboardNbrFromWwsrFun
  
    setScoreboardsFromWwsrFun(ev:any){
      console.log('running app setScoreboardsFromWwsrFun')
      // he is jumping from scoreboard list to scoreboard detail
      this.scoreboardsArray = ev 
    }  // end setScoreboardsFromWwsrFun
  
    setRuleNbrFromWwrFun(ev:any){
    // he is jumping from rule list to rule detail
      console.log('running app setRuleNbrFromWwrFun')
      this.daRuleNbr = ev 
      console.log('app 309 rule nbr:', this.daRuleNbr)
    }  // end setRuleNbrFromWwrFun
    
    setRulesFromWwrFun(ev:any){
      console.log('running app setRulesFromWwrFun')
      // he is jumping from rule list to rule detail
      this.rulesArray = ev 
    } // end setRulesFromWwrFun
  
    setGroupNbrFromWwgFun(ev:any){
      // he is jumping from rule list to rule detail
        console.log('running app setGroupNbrFromWwgFun')
        this.daGroupNbr = ev 
        console.log('app 319 group nbr:', this.daGroupNbr)
    } // end setGroupNbrFromWwgFun
      
    setGroupsFromWwgFun(ev:any){
        console.log('running app setRulesFromWwrFun')
        // he is jumping from group list to group detail
        this.groupArray = ev 
    }  // end setGroupsFromWwgFun
  
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
        if (this.showQncWws) {return} // he is in signon
        
        this.showProFun() //default
      } // end escKeyWasHit
    
    async readManyFaunaDbTables() {
      this.surveyMenuButsAlive = false  //set true after table reads
      this.loadingDataMsg = 'loading survey ...'
      this.loadingDataBusy = true
      await this.launchReadFaunaQuestions() 
      await this.launchReadFaunaRules() 
      await this.launchReadFaunaGroups()
      await this.launchReadFaunaScoreboards() 
      await this.launchReadFaunaRanges() 
      this.surveyMenuButsAlive = true  
      this.loadingDataMsg = ''
      this.loadingDataBusy = false
      console.log('done with readManyFaunaDbTables')
    } // end readManyFaunaDbTables
  
    async launchReadFaunaQuestions(){
      console.log('running launchReadFaunaQuestions') 
      let faunaRes = await apiFauna.qtReadQuestions(this.cust,this.qid)
      this.faunaData = faunaRes.map((f:any) => f.data)
      this.questArray = this.faunaData
      console.log('list of faunaData questions we just read:')
      console.table(this.faunaData) 
    } // end launchReadFaunaQuestions
  
    async launchReadFaunaRules(){
      console.log('running launchReadFaunaRules') 
      let faunaRes = await apiFauna.qtReadRules(this.cust,this.qid)
      this.faunaData = faunaRes.map((f:any) => f.data)
      this.rulesArray = this.faunaData
      console.log('list of faunaData rules we just read:')
      console.table(this.faunaData)
    } // end launchReadFaunaRules
  
    async launchReadFaunaGroups(){
      apiFauna.qtReadGroups(this.cust,this.qid)
      console.log('running launchReadFaunaGroups') 
      let faunaRes = await apiFauna.qtReadGroups(this.cust,this.qid)
      this.faunaData = faunaRes.map((f:any) => f.data)
      this.groupArray = this.faunaData
      console.log('list of faunaData groups we just read:')
      console.table(this.faunaData)
    } // end launchReadFaunaGroups
  
    async launchReadFaunaScoreboards(){
      apiFauna.qtReadScoreboards(this.cust,this.qid)
      console.log('running launchReadFaunaScoreboards') 
      let faunaRes = await apiFauna.qtReadScoreboards(this.cust,this.qid)
      this.faunaData = faunaRes.map((f:any) => f.data)
      this.scoreboardsArray = this.faunaData
      console.log('list of faunaData scoreboards we just read:')
      console.table(this.faunaData)
    }  // end launchReadFaunaScoreboards
  
    async launchReadFaunaRanges(){
      apiFauna.qtReadScoreboardRanges(this.cust,this.qid)
      console.log('running launchReadFaunaRanges') 
      let faunaRes = await apiFauna.qtReadScoreboardRanges(this.cust,this.qid)
      this.faunaData = faunaRes.map((f:any) => f.data)
      this.scoreboardRangesArray = this.faunaData
      console.log('list of faunaData ranges we just read:')
      console.table(this.faunaData)
    } // end launchReadFaunaRanges
  
    async readFaunaTablesForEtl(){
      console.log('running readFaunaTablesForEtl')
      // launch this function via an html button marked: readFaunaTablesForEtl
      // run this when you need to etl one of the tables 
      // that are not part of the mass read of different tables at startup.
      // await this.launchFaunaReadMultAnswers()  //one cust, one qid
      // await this.launchFaunaReadMultScores()   //one cust, one qid
      // await this.launchFaunaReadUsers()       //one cust, one qid
      // await this.launchFaunaReadMultSubscribers() // all 
      // await this.launchFaunaReadMultTeamMembers() // all
      // await this.launchFaunaReadMultSurveys()     // all
      this.supaEtlEnabled = false  // turn on the button to enable launchEtl
    } // end readFaunaTablesForEtl
  
    async launchFaunaReadMultAnswers(){
      console.log('running launchFaunaReadMultAnswers')
      let faunaRes = await apiFauna.qtReadMultAnswers(this.cust,this.qid)
      this.faunaData = faunaRes.map((f:any) => f.data)
      this.answersArrayForEtl = this.faunaData
      console.log('list of faunaData answers we just read:')
      console.table(this.faunaData)
    }  // end launchFaunaReadMultAnswers
  
    async launchFaunaReadMultScores(){
      console.log('running launchFaunaReadMultScores')
      let faunaRes = await apiFauna.qtReadMultScores(this.cust,this.qid)
      this.faunaData = faunaRes.map((f:any) => f.data)
      this.scoresArray = this.faunaData
      console.log('list of faunaData scores we just read:')
      console.table(this.faunaData)
    } // end launchFaunaReadMultScores
  
    async launchFaunaReadUsers() {
      console.log('running launchFaunaReadUsers')
      let faunaRes = await apiFauna.qtReadUsers(this.cust,this.qid)
      this.faunaData = faunaRes.map((f:any) => f.data)
      this.usersArray = this.faunaData
      console.log('list of faunaData users we just read:')
      console.table(this.faunaData)
    } // end launchFaunaReadUsers
  
    async launchFaunaReadMultSubscribers(){
      console.log('running launchFaunaReadMultSubscribers')
      let faunaRes = await apiFauna.qtReadMultSubscribers()
      this.faunaData = faunaRes.map((f:any) => f.data)
      this.subscribersArray = this.faunaData
      console.log('list of faunaData subscribers we just read:')
      console.table(this.faunaData)
    } // end launchFaunaReadMultSubscribers
  
    async launchFaunaReadMultTeamMembers(){
      console.log('running launchFaunaReadMultTeamMembers')
      let faunaRes = await apiFauna.qtReadMultTeamMembers()
      this.faunaData = faunaRes.map((f:any) => f.data)
      this.teamMembersArray = this.faunaData
      console.log('list of faunaData teamMembers we just read:')
      console.table(this.faunaData)
    }  // end launchFaunaReadMultTeamMembers
  
    async launchFaunaReadMultSurveys(){
      console.log('running launchFaunaReadMultSurveys')
      let faunaRes = await apiFauna.qtReadMultSurveys()
      this.faunaData = faunaRes.map((f:any) => f.data)
      this.surveysArrayForEtl = this.faunaData
      console.log('list of faunaData surveys we just read:')
      console.table(this.faunaData)
    } // endlaunchFaunaReadMultSurveys
  
    // sortGroupsByNbr(){ //billyfix
    //   // this.groupArray
    //   // .sort((a, b) => (Number(a.groupNbr)  > Number(b.groupNbr) ) 
    //   // ? 1 : (a.groupNbr == b.groupNbr ) 
    //   // ? ((a.groupName > b.groupName) ? 1 : -1) : -1 )
    // } // end sortGroupsByNbr
  
    // sortScoreboards(){
    //   console.log('billyfix 522 running sortScoreboards')
    //   // this.scoreboardsArray
    //   // .sort((a, b) => a.scoreboardName > b.scoreboardName 
    //   // ? 1 : (Number(a.scoreboardNbr) == Number(b.scoreboardNbr) ) 
    //   // ? (Number(a.scoreboardNbr) > Number(b.scoreboardNbr) ? 1 : -1) : -1 )
    // } // end sortScoreboards
  
    // sortScoreboardRanges(){
    //   console.log('billyfix 669 running sortScoreboardRanges')
    //   // this.scoreboardRangesArray
    //   // .sort((a, b) => (Number(a.scoreboardNbr)  > Number(b.scoreboardNbr) ) 
    //   // ? 1 : (Number(a.scoreboardNbr) == Number(b.scoreboardNbr) ) 
    //   // // ? ((a.rangeNbr > b.rangeNbr) ? 1 : -1) : -1 )
    //   // ? ((a.rangeNbr > b.rangeNbr) ? 1 : -1) : -1 )
    //   // console.table(this.scoreboardRangesArray)
    //   // console.log('853 sorted')
    // } // end sortScoreboardRanges
  
    ////////////////////////////////////////////////////////////
    async readManySupabaseDbTables(){
      console.log('193 running readManySupabaseDbTables')
      this.surveyMenuButsAlive = false  
      this.loadingDataMsg = 'loading survey...'
      this.loadingDataBusy = true
      this.supaKeyFlds = {"cust": this.cust, "qid": this.qid}
      await this.launchReadSupabase('qtQuestions',this.supaKeyFlds)
      await this.launchReadSupabase('qtRules',this.supaKeyFlds) 
      await this.launchReadSupabase('qtGroups',this.supaKeyFlds) 
      await this.launchReadSupabase('qtScoreboards',this.supaKeyFlds) 
      await this.launchReadSupabase('qtScoreboardRanges',this.supaKeyFlds) 
      this.surveyMenuButsAlive = true  
      this.loadingDataMsg = ''
      this.loadingDataBusy = false
      console.log('done with readManySupabaseDbTables')
    } // end readManySupabaseDbTables
  
    async launchReadSupabase(tbl:string,flds:object) {
      console.log(Date.now()/10000,'730 running launchReadSupabase. flds:')
      console.table(flds)
      let supaRes = await apiSupabase.readSupabase(tbl,flds)
      console.log(Date.now()/10000,'733 done waiting for apiSupabase.  supaRes:')
      console.log(supaRes)  //supaRes is only a promise unless I await. 
                            //supaRes is null if fieldname is wrong.
                            //supaRes is an empty object if not found.
      this.supaData = supaRes.supabaseData
      if (tbl == 'qtQuestions'){ this.questArray = this.supaData.slice()}
      if (tbl == 'qtRules')    { this.rulesArray = this.supaData.slice()}
      if (tbl == 'qtGroups')   { this.groupArray = this.supaData.slice()}
      if (tbl == 'qtScoreboards')      { this.scoreboardsArray = this.supaData.slice()}
      if (tbl == 'qtScoreboardRanges') { this.scoreboardRangesArray = this.supaData.slice()}
      console.log(Date.now()/10000,'741 end of launchReadSupabase.')
    } // end launchReadSupabase
    
    async launchAddSupabase(tbl:string,flds:object) {
      console.log('running launchAddSupabase.  flds:')
      console.table(flds)
      // this para works. appends more rows to supabase. 
      let supaRes = await apiSupabase.addSupabase(tbl,flds)
    }
  
    launchEtl(){
      console.log('running launchEtl')
      this.supaEtlEnabled = false // turn off button that enables launchEtl
      // 1 comment in/out the table reads in para readFaunaTablesForEtl
      // 2 review the live etlSupabase functions below (those not commented out)
      // 3 select a survey you want to etl to supabase
      // 4 hit button to read fauna tables into arrays 
      // 5 hit button to launch Etl  (run this func)
  
      // someday might want to zero load the tables before etl.
      // this would allow doing a fresh etl after day to day fauna work,
      // without having to delete-all via supabase table editor.
      // this.etlSupabaseQuestions() 
      // this.etlSupabaseRules()
      // this.etlSupabaseGroups()
      // this.etlSupabaseScoreboards()
      // this.etlSupabaseScoreboardRanges() 
      // =================================
      // this.etlSupabaseUsers()    // all participants for a cust qid
      // this.etlSupabaseAnswers()  // all participants' answers for a cust qid
      // this.etlSupabaseScores()   // all participants' scores for a cust qid
      // =================================
      // april 2023 probably want to run these three tables separately.
      // these tables are NOT keyed by cust + qid.
      // comment-out these tables after a separate etl.
      // this.etlSupabaseSubscribers() // all custs
      // this.etlSupabaseTeamMembers() // all custs
      // this.etlSupabaseSurveys()     // all custs
    } // end launchEtl
  
    etlSupabaseQuestions(){
      console.log('504 running etlSupabaseQuestions')
      for (let i = 0; i < this.questArray.length; i++) {
        this.supaFlds = this.questArray[i]
        this.launchAddSupabase('qtQuestions',this.supaFlds)
      } // end for
    } // end  etlSupabaseQuestions()
  
    etlSupabaseRules(){
      console.log('509 running etlSupabaseRules')
      for (let i = 0; i < this.rulesArray.length; i++) {
        this.supaFlds = this.rulesArray[i]
        this.launchAddSupabase('qtRules',this.supaFlds)
      } // end for
    } // end  etlSupabaseRules()
  
    etlSupabaseGroups(){
      console.log('518 running etlSupabaseGroups')
      for (let i = 0; i < this.groupArray.length; i++) {
        this.supaFlds = this.groupArray[i]
        this.launchAddSupabase('qtGroups',this.supaFlds)
      } // end for
    } // end etlSupabaseGroups
  
    etlSupabaseScoreboards(){
      console.log('518 running etlSupabaseScoreboards')
      for (let i = 0; i < this.scoreboardsArray.length; i++) {
        this.supaFlds = this.scoreboardsArray[i]
        this.launchAddSupabase('qtScoreboards',this.supaFlds)
      } // end for
    } // end etlSupabaseScoreboards
  
    etlSupabaseScoreboardRanges(){
      console.log('745 running etlSupabaseScoreboardRanges')
      for (let i = 0; i < this.scoreboardRangesArray.length; i++) {
        this.supaFlds = this.scoreboardRangesArray[i]
        this.launchAddSupabase('qtScoreboardRanges',this.supaFlds)
      } // end for
    }
  
    etlSupabaseAnswers(){
      console.log('822 running etlSupabaseAnswers')
      // we alread fetched all the fauna answers for cust qid, 
      // so now write answersArrayForEtl
      console.log('826 answersArrayForEtl:')
      console.table(this.answersArrayForEtl)
      for (let i = 0; i < this.answersArrayForEtl.length; i++) {
        this.supaFlds = this.answersArrayForEtl[i]
        this.launchAddSupabase('qtAnswers',this.supaFlds)
      } // end for
    } // end etlSupabaseAnswers
  
    etlSupabaseSurveys(){
      console.log('842 running etlSupabaseSurveys')
      for (let i = 0; i < this.surveysArrayForEtl.length; i++) {
        this.supaFlds = this.surveysArrayForEtl[i]
        this.launchAddSupabase('qtSurveys',this.supaFlds)
      } // end for
    } // end etlSupabaseSurveys
  
    etlSupabaseUsers(){
      console.log('890 running etlSupabaseUsers')
      for (let i = 0; i < this.usersArray.length; i++) {
        this.supaFlds = this.usersArray[i]
        this.launchAddSupabase('qtUsers',this.supaFlds)
      } // end for
    } // end etlSupabaseUsers
  
    etlSupabaseScores(){
      console.log('890 running etlSupabaseScores')
      for (let i = 0; i < this.scoresArray.length; i++) {
        this.supaFlds = this.scoresArray[i]
        this.launchAddSupabase('qtScores',this.supaFlds)
      } // end for
    } // end etlSupabaseScores
  
    etlSupabaseSubscribers(){
      console.log('969 running etlSupabaseSubscribers')
      for (let i = 0; i < this.subscribersArray.length; i++) {
        this.supaFlds = this.subscribersArray[i]
        this.launchAddSupabase('qtSubscribers',this.supaFlds)
      } // end for
    } // end etlSupabaseSubscribers
  
    etlSupabaseTeamMembers(){
      console.log('994 running etlSupabaseTeamMembers')
      for (let i = 0; i < this.teamMembersArray.length; i++) {
        this.supaFlds = this.teamMembersArray[i]
        this.launchAddSupabase('qtTeamMembers',this.supaFlds)
      } // end for
    } // end etlSupabaseTeamMembers
  
  } // end export AppComponent
  
  // these pgms leave off semicolons, but remember:
  // a) return  break, throw, continue <- dont split lines
  // b) never start a line with parentheses
  