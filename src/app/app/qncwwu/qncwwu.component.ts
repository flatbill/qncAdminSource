// @ts-nochecky // typescript checker on this one file.
// change to nochecky to not bypass type (nochecky means ACTIVATE type checker )
// needed cuz jsPDF invokes weird type checks on doc.text(bla,bla)
import { Component, OnInit, Input, 
  EventEmitter, Output } from '@angular/core' 
import apiFauna   from '../../../src/utils/apiFauna'
import apiSupabase from '../../../src/utils/apiSupabase'
//import jsPDF from 'jspdf'
@Component({
  selector: 'app-qncwwu',
  templateUrl: './qncwwu.component.html'
})
export class QncwwuComponent implements OnInit {
  msg1 = 'participant list'
  usersArray = [{
    'id': 0,
    'qUserId': '?',
    'firstName' : '?',
    'lastName' : '?',
    'userDateTime' : '?',
    'localUserDateTime' : '?',
    'status' : '?',
    'answerCnt' : '?'
}]
  scoresArray = [{
    'id': 0,
    'cust':'?',
    'qid':'?',
    'testDate':'?',
    'accum': 0,
    'score':0,
    'wscore':0,
    'questCnt':0,
    'qUserId':'?',
    'timeGap':0
  }]
  answersArray = [{
    'id': 0,
    'cust': '?',
    'qid': '?',
    'qUserId': '?',
    'questNbr': '?',
    'answerDate': '?',
    'answer': '?',
    'answerPoints': 0,
    'timeGap': 0,
    'accum': '?',
    'addPointStatus': '?',
    'questTxt': '?'
  }]
  myFileName = 'someFileName.csv'
  myTxt = ''
  qUserId = ''
  firstName = ''
  lastName = ''
  userDateTime = ''
  lowScoreThresh = 0
  hiScoreThresh = 0
  assTxt = ''
  hisScore=0
  hisScoreStr=''
  cellBrk =  "\n"+"\"" + "\n"
  verifyDelete = false
  deleteIx = -1
  // myLocalDateTime:string   =  '' //new Date('December 17, 2022 03:24:00').toString
  // supaFlds = {}
  supaFldsCustQid = {}
  supaFldsCustQidUser = {}
  supaData = []
  faunaData = []
  userToDelete = ' '
  constructor() {}
  @Input() custIn:any
  @Input() qidIn:any  
  @Input() scoreboardsIn:any
  @Input() scoreboardRangesIn:any
  @Input() surveyNameIn:any
  @Input() xxAnswersIn:any //  part of one-time delete of stray answers.
  @Input() faunaOrSupabaseIn:any
  async ngOnInit(){
    console.log('running wwu ngOnInit===')
    this.msg1 = 'loading participants...'
    if (this.faunaOrSupabaseIn ==  'fauna') {
      await this.launchReadFaunaUsers() // get db users (participants).
      this.buildListOfUsers(this.faunaData) 
    }   
    if (this.faunaOrSupabaseIn ==  'supabase') {
      this.supaFldsCustQid = {"cust": this.custIn, "qid": this.qidIn}
      await this.launchReadSupabase('qtUsers',this.supaFldsCustQid) 
      this.buildListOfUsers(this.supaData)
    }
  } // end ngOnInit

  buildListOfUsers(rawList:any){
    console.log('running buildListOfUsers')
    // rawList is fauna or supabase array
    // lets build the user array from that.
    this.usersArray = rawList

    // this.usersArray = qtDbObj.slice()
    // for (let i = 0; i < this.usersArray.length; i++) {
    //   // read usersArray[i].userDateTime string, convert to local dateTime)
    //   let mydate = new Date(this.usersArray[i].userDateTime)
    //   this.usersArray[i]['localUserDateTime'] = mydate.toLocaleString().replace(',','')
    //   // hack July2023 fauna has userId , supabase has qUserId
    //   // if ( this.usersArray[i]['qUserId'] == undefined 
    //   // &&   this.usersArray[i]['userId']  != undefined){ // copy userId to qUserId
    //   //   this.usersArray[i]['qUserId'] = this.usersArray[i]['userId']
    //   // } // end if 
    //   // if ( this.usersArray[i]['userId'] == undefined 
    //   // &&   this.usersArray[i]['qUserId']  != undefined){ // copy qUserId to userId
    //   //   this.usersArray[i]['userId'] = this.usersArray[i]['qUserId']
    //   // } // end if

    // } //end for
    this.usersArray.sort((a, b) => (a.userDateTime > b.userDateTime) ? -1 : +1 )
    this.msg1 = 'participant list'
    console.log('end of buildListOfUsers.  usersArray:')
    console.table(this.usersArray)
  }  //end buildListOfUsers

  async scoresCsvButClick(ux:any){ 
    this.msg1 = 'building scores csv to download...'
    this.qUserId = this.usersArray[ux].qUserId
    this.firstName = this.usersArray[ux].firstName
    this.lastName = this.usersArray[ux].lastName
    this.userDateTime =  this.usersArray[ux].userDateTime
    // this.myLocalDateTime = this.usersArray[ux]['localUserDateTime'] //.localUserDateTime
    this.myFileName = this.qUserId + '.csv'
    this.supaFldsCustQidUser = {"cust": this.custIn, "qid": this.qidIn, "qUserId" : this.qUserId}

    if (this.faunaOrSupabaseIn == 'supabase') {
      await this.launchReadSupabase('qtScores', this.supaFldsCustQidUser ) 
      this.scoresArray = this.supaData
      await this.launchReadSupabase('qtAnswers',this.supaFldsCustQidUser) 
      this.answersArray = this.supaData
    }
    if (this.faunaOrSupabaseIn == 'fauna') {
      await this.launchReadFaunaScores()
      this.scoresArray = this.faunaData
      await this.launchReadFaunaAnswers()
      this.answersArray = this.faunaData
    }
    this.buildScoresCsv()
    this.dnLoadTheFile(this.myFileName,this.myTxt)
  } // end scoresCsvButClick

  buildScoresCsv(){
    console.log('running buildScoresCsv')
    // this.scoresArray.sort((a, b) => (a.accum.toLowerCase() > b.accum.toLowerCase()) ? +1 : -1 )
    this.scoresArray.sort((a, b) => (a.accum> b.accum) ? +1 : -1 )
    this.answersArray.sort((a, b) => (Number(a.questNbr) > Number(b.questNbr)) ? +1 : -1 )
    console.table(this.scoresArray)
    console.table(this.answersArray)
    if (this.scoresArray.length == 0) {
      this.msg1 = 'no scores for this user. '  }
    if (this.answersArray.length == 0) {
      this.msg1 = 'no answers for this user. ' }
    this.myTxt = 
    this.firstName + ' ' + this.lastName
      + ',,, phone ext: '
      + this.qUserId.substring(this.qUserId.length - 4)
      // + ',, ' + this.myLocalDateTime
      + ',,,'
      + this.surveyNameIn
      +',,,'
      + 'Scores and Answers'
        //+ ',,,promo code?'
      + "\r\n"
      + "\r\n"

    this.myTxt = this.myTxt +
    // 'Scoreboard,Score,Wscore,Quest Cnt,Time Gap' + "\r\n"
    'Scoreboard,,Score,Quest Cnt,Time Gap' + "\r\n"
    //let csvContent = "data:text/csv;charset=utf-8,"

     let rowX = ''
     for (let i = 0; i < this.scoresArray.length; i++) {
      rowX = 
       this.scoresArray[i].accum + ',,' 
      // + this.scoresArray[i].score + ',' 
      + this.scoresArray[i].wscore + ',' 
      + this.scoresArray[i].questCnt + ',' 
      + this.scoresArray[i].timeGap
       this.myTxt = this.myTxt + rowX + "\r\n"
     } // end for

     // done putting scores into csv, now put answers into csv:
     this.myTxt = this.myTxt + "\r\n" + "\r\n"
     this.myTxt = this.myTxt + 'Quest Nbr, Answer, Time Gap , Question Text' + "\r\n"
     rowX = ''
     for (let i = 0; i < this.answersArray.length; i++) {
       //  Apr2022 if questTxt not defined, then set it to blank.
       // let dbq = '"' // adjust more chars in csv?
       //adjQuestTxt = dbq + adjQuestTxt + dbq // adds extra dbl quotes.
       if (this.answersArray[i].questTxt === undefined) {this.answersArray[i].questTxt=''}
       let adjQuestTxt = this.answersArray[i].questTxt.replaceAll(',' , ' ')
       adjQuestTxt = adjQuestTxt.replaceAll('=' , '-') //some csv readers hate eq sign.
       adjQuestTxt = adjQuestTxt.replaceAll(/(\r\n|\r|\n)/g , '')
       rowX = 
          this.answersArray[i].questNbr + ',' 
        + this.answersArray[i].answerPoints + ',' 
        + this.answersArray[i].timeGap   + ','
        + adjQuestTxt
       this.myTxt = this.myTxt + rowX + "\r\n"
     } // end for
  } // end buildScoresCsv

  async assCsvButClick(ux:any) {  
    console.log('wwu running assCsvButClick')
    this.msg1 = 'building assessment csv to download...'
    this.qUserId = this.usersArray[ux].qUserId
    this.firstName = this.usersArray[ux].firstName
    this.lastName = this.usersArray[ux].lastName
    this.userDateTime =  this.usersArray[ux].userDateTime
    // this.myLocalDateTime = this.usersArray[ux]['localUserDateTime'] 
    this.myFileName = this.qUserId + '.csv'
    this.supaFldsCustQidUser = {"cust": this.custIn, "qid": this.qidIn, "qUserId" : this.qUserId}

    if (this.faunaOrSupabaseIn == 'fauna') {
      await this.launchReadFaunaScores()
      this.scoresArray = this.faunaData
      await this.launchReadFaunaAnswers()
      this.answersArray = this.faunaData
    }

    if (this.faunaOrSupabaseIn == 'supabase') {
      await this.launchReadSupabase('qtScores',this.supaFldsCustQidUser ) 
      this.scoresArray = this.supaData
      await this.launchReadSupabase('qtAnswers',this.supaFldsCustQidUser) 
      this.answersArray = this.supaData
    }
    console.log('scoreboardsIn:')
    console.table (this.scoreboardsIn)
    this.buildAssCsv()  
    this.dnLoadTheFile(this.myFileName,this.myTxt)
  }  // end assCsvButClick

  buildAssCsv(){
    console.log('292 running buildAssCsv')
    this.scoreboardsIn.sort((a:any, b:any) => (a.scoreboardName.toLowerCase() > b.scoreboardName.toLowerCase()) ? +1 : -1 )
    this.myTxt = 'Assessment Report ' +',,,'  
    + this.surveyNameIn + "\r\n"
    + this.firstName + ' ' + this.lastName
    + ',,,Participant: '
    + this.qUserId + "\r\n" + "\r\n"
    + 'Scoreboard   ' 
    + ',,,'   
    + 'Score   ' + ','   
    + 'Range Text   ' + "\r\n"
    let scoresIx = 0
    for (let i=0;i<this.scoreboardsIn.length;i++){
      this.hisScore = 0
      this.hisScoreStr = ''
      this.assTxt = ''
      this.myTxt =  this.myTxt  
      + this.scoreboardsIn[i].scoreboardName + ',' 
      // lookup his score that matches current scoreboard:
      scoresIx = this.scoresArray
      .findIndex((s:any) => s.accum.toLowerCase() == this.scoreboardsIn[i].scoreboardName.toLowerCase())
      if(scoresIx>-1){ // we found scoreboardName in the scoresArray
        this.hisScore    = this.scoresArray[scoresIx].wscore 
        this.hisScoreStr = this.scoresArray[scoresIx].wscore.toString()
        this.setScoresArrayAssTxt(this.scoresArray[scoresIx].accum,this.hisScore) 
      }
      this.myTxt =  this.myTxt  
      + ',,' + this.hisScoreStr + ','
      + this.assTxt + "\r\n"
    } // end for
    let rptName = 'Assessment Report ' + this.qUserId + '.csv'
    this.msg1 = 'built an assessment report for ' 
    + this.firstName + ' ' + this.lastName + '.'
    console.log('349 end buildAssCsv')
  } // end buildAssCsv

  setScoresArrayAssTxt(accum:any,hisScore:any){
    console.log('running setScoresArrayAssTxt')
    // find the range that matches hisScore.  set assTxt.
    let sx = this.scoreboardsIn
    .findIndex( (s:any) => s.scoreboardName.toLowerCase() == accum.toLowerCase())
    if (sx >= 0) { // we found accum in scoreboardsArray
      for (let i = 0; i < this.scoreboardRangesIn.length; i++) {
        if (hisScore >= this.scoreboardRangesIn[i].rangeStart 
        && hisScore <= this.scoreboardRangesIn[i].rangeEnd  
        && this.scoreboardsIn[sx].scoreboardNbr == this.scoreboardRangesIn[i].scoreboardNbr){
          this.assTxt = this.scoreboardRangesIn[i].rangeTxt
          i = 9999 //exit this loop
        } // end if
      } // end for
    } // end if
  } // end setScoresArrayAssTxt

  dnLoadTheFile(myFileName:any, txt:any) {
    console.log('running dnLoadTheFile')
    // hacky way to  download, but it's common.
    // create an invisible screen element,
    // give it attributes, and fake click it.
    let elem = document.createElement('a') as HTMLElement
    elem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt))
    elem.setAttribute('download', myFileName)
    elem.style.display = 'none'
    document.body.appendChild(elem)
    elem.click()
    document.body.removeChild(elem) 
    if (this.msg1.includes('...')){
      this.msg1 = 'file downloaded.'
    } else {
      this.msg1 += ' file downloaded.'
    }
  } // end dnLoadTheFile

  async launchReadMultFaunaScores(){
    // console.log('running launchReadMultFaunaScores')
    // // test this someday.
    // let faunaRes  = await apiFauna.qtReadMultScores(this.custIn, this.qidIn)
    // this.faunaData = []
    // for ( let i = 0; i < faunaRes.length; i++) {
    // this.faunaData.push(faunaRes[i].data)
    // } //end for
    // console.log('list of faunaData scores we just read:')
    // console.table(this.faunaData)
  } // end launchReadMultFaunaScores

  async launchReadFaunaUsers() {
    console.log('running launchReadFaunaUsers') 
    let faunaRes = await apiFauna.qtReadUsers(this.custIn, this.qidIn)
    this.faunaData = faunaRes.map((f:any) => f.data)

    console.table(faunaRes)
    // this.faunaData = []
    // for ( let i = 0; i < faunaRes.length; i++) {
    //   this.faunaData.push(faunaRes[i].data)
    // } //end for
    console.log('list of faunaData users we just read:')
    console.table(this.faunaData)
  } //end launchReadFaunaUsers
  
  async launchReadFaunaAnswers() {
    console.log('running launchReadFaunaAnswers') 
    let faunaRes = await apiFauna.qtReadAnswers(this.custIn, this.qidIn,this.qUserId,'dummyDateTime')
    // console.table(faunaRes)
    this.faunaData = faunaRes.map((f:any) => f.data)

  //   this.faunaData = []
  //  for ( let i = 0; i < faunaRes.length; i++) {
  //    this.faunaData.push(faunaRes[i].data)
  //  }
   console.log('list of faunaData answers we just read:')
   console.table(this.faunaData)
  } //end launchReadFaunaAnswers 

  async launchReadFaunaScores()  {
    console.log('running launchReadFaunaScores') 
    let faunaRes = await apiFauna.qtReadScores(this.custIn, this.qidIn,this.qUserId,'dummyDate')
    this.faunaData = faunaRes.map((f:any) => f.data)

  //   this.faunaData = []
  //  for ( let i = 0; i < faunaRes.length; i++) {
  //    this.faunaData.push(faunaRes[i].data)
  //  }
   console.log('list of faunaData scores we just read:')
   console.table(this.faunaData)

  } //end launchReadFaunaScores

  async launchDelAllFaunaAnswersForOneUser(){
    console.log('running launchDeleteAllFaunaAnswersForOneUser') 
    let faunaRes = await apiFauna.qtMassDeleteAnswers(this.custIn, this.qidIn, this.qUserId)
    this.faunaData = faunaRes.map((f:any) => f.data)

    // this.faunaData = [] 
    // for ( let i = 0; i < faunaRes.length; i++) {
    //   this.faunaData.push(faunaRes[i].data)   
    // }  // end for
    console.log('list of faunaData answers we just deleted:')
    console.table(this.faunaData)
  }  // end launchDelAllFaunaAnswersForOneUser

  async launchDelAllFaunaScoresForOneUser(){
    console.log('running launchDeleteAllFaunaScoresForOneUser') 
    let faunaRes = await apiFauna.qtMassDeleteScores(this.custIn, this.qidIn, this.qUserId)
    this.faunaData = faunaRes.map((f:any) => f.data)

    // this.faunaData = []
    // for ( let i = 0; i < faunaRes.length; i++) {
    //   this.faunaData.push(faunaRes[i].data)
    // }
    console.log('list of faunaData scores we just deleted:')
    console.table(this.faunaData)
  }  // end launchDelAllFaunaScoresForOneUser

  async launchDelFaunaParticipant(){
  console.log('running  wwu launchDeleteParticipant')
  console.log(this.custIn, this.qidIn, this.qUserId)
  let faunaRes = await apiFauna.qtDeleteParticipant(this.custIn, this.qidIn, this.qUserId)
  this.faunaData = faunaRes.map((f:any) => f.data)

  // this.faunaData = []
  // for ( let i = 0; i < faunaRes.length; i++) {
  //   this.faunaData.push(faunaRes[i].data)
  // }
  console.log('faunaData participant we just deleted:')
  console.table(this.faunaData)
}  // end launchDelParticipant

  buildAnswersCsv(){ // append answers into the scores csv file.
    this.myTxt = this.myTxt + "\r\n" + "\r\n"
    this.myTxt = this.myTxt + 'Quest Nbr, Answer, Time Gap , Question Text' + "\r\n"
    let rowX = ''
    for (let i = 0; i < this.answersArray.length; i++) {
      //  Apr2022 if questTxt not defined, then set it to blank.
      if (this.answersArray[i].questTxt === undefined) {this.answersArray[i].questTxt=''}
      let adjQuestTxt = this.answersArray[i].questTxt.replaceAll(',' , ' ')
      adjQuestTxt = adjQuestTxt.replaceAll(/(\r\n|\r|\n)/g , '')
      rowX = 
         this.answersArray[i].questNbr + ',' 
       + this.answersArray[i].answerPoints + ',' 
       + this.answersArray[i].timeGap   + ','
       + adjQuestTxt
      this.myTxt = this.myTxt + rowX + "\r\n"
    } // end for
  } // end buildAnswersCsv
  
  delButClick(ix:any){
    console.log('running delButClick')
    this.deleteIx = ix
    this.userToDelete = this.usersArray[ix].qUserId
    this.verifyDelete = true
    this.msg1 = 'confirm delete'
  } // end delButClick

  proceedWithDelClick(){
    console.log('running proceedWithDelClick')
    this.supaFldsCustQidUser = {"cust": this.custIn, "qid": this.qidIn, "qUserId" : this.userToDelete}
    this.msg1 = 'deleting...'
    this.delOneUsersScores(this.deleteIx)
    this.delOneUsersAnswers(this.deleteIx)
    this.delOneUsersParticipant(this.deleteIx)
    this.usersArray.splice(this.deleteIx,1) //removes particpant from array
    this.verifyDelete=false
    this.msg1 = 'deleted participant: '+ this.userToDelete
  } // end proceedWithDelClick

  cancelDelClick(){
    this.verifyDelete = false
    this.deleteIx = -1
    this.msg1 = 'delete cancelled.'
  } // end cancelDelClick
  
  delOneUsersParticipant(ux:any){
    console.log('running deleteOneUsersParticipant')
    this.qUserId = this.usersArray[ux].qUserId
    if (this.faunaOrSupabaseIn == 'fauna') {
      this.launchDelFaunaParticipant()   
    } // end if fauna
    if (this.faunaOrSupabaseIn=='supabase') {
      this.launchDelSupabaseMulti('qtUsers',this.supaFldsCustQidUser)
      console.table(this.supaData)
     } // end if supabase
    } // end delOneUsersParticipant

  delOneUsersScores(ux:any){
    console.log('running delOneUsersScores')
    this.qUserId = this.usersArray[ux].qUserId
    if (this.faunaOrSupabaseIn == 'fauna')        {
      this.launchDelAllFaunaScoresForOneUser()  }
    if (this.faunaOrSupabaseIn == 'supabase') {
      this.launchDelSupabaseMulti('qtScores',this.supaFldsCustQidUser)
    } 
  } // end delOneUsersScores

  delOneUsersAnswers(ux:any){
    console.log('running delOneUsersAnswers')
    this.qUserId = this.usersArray[ux].qUserId
    if (this.faunaOrSupabaseIn == 'fauna')        {
      this.launchDelAllFaunaAnswersForOneUser() }
    if (this.faunaOrSupabaseIn == 'supabase') {
      this.launchDelSupabaseMulti('qtAnswers',this.supaFldsCustQidUser)
    } // end if supabase
  } // end delOneUsersAnswers

async launchReadSupabase(tbl:any,flds:any){
  console.log(Date.now()/10000,'500 running launchReadSupabase...')
  console.table(flds)
  let supaRes = await apiSupabase.readSupabase(tbl,flds)
  console.log(Date.now()/10000,'503 done waiting for apiSupabase.  supaRes:')
  console.log(supaRes)  //supaRes is only a promise unless I await. 
                        //supaRes is null if fieldname is wrong.
                        //supaRes is an empty object if no data found.
                        //supaRes.supaData is null if no data found.
  this.supaData = supaRes.supabaseData
  if (this.supaData === null) {this.supaData = []}
  console.log(Date.now()/10000,'509 end of launchReadSupabase.')
} // end launchReadSupabase

async launchDelSupabaseMulti(tbl:any,flds:any){
  console.log('running launchDelSupabaseMulti.  flds:')
  console.table(flds)
  let supaRes = await apiSupabase.delSupabaseMulti(tbl,flds)
  this.supaData = supaRes.supabaseData
  if (this.supaData === null) {this.supaData = []}
}  // end launchDelSupabase 

// scrollDude1() { //elegant, but not used.
//   let elem = document.getElementById('anchorName1')
//   elem.scrollIntoView()
// }

} // end export qncwwu