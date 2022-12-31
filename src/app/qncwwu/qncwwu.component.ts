// @ts-nocheck // bypass typescript checker on this one file.
// needed cuz jsPDF invokes weird type checks on doc.text(bla,bla)

import { Component, OnInit, Input, 
  EventEmitter, Output } from '@angular/core' 
import apiFauna   from 'src/utils/apiFauna'
//import jsPDF from 'jspdf'
@Component({
  selector: 'app-qncwwu',
  templateUrl: './qncwwu.component.html'
})
export class QncwwuComponent implements OnInit {
  msg1 = '?'
  usersArray = []
  scoresArray = []
  answersArray = []
  scoreFileName = 'dascore.csv'
  scoresTxt = ''
  userId = ''
  firstName = ''
  lastName = ''
  userDateTime = ''
  downloadScoresCsvPending = false
  downloadAssRptPending = false
  lowScoreThresh = 0
  hiScoreThresh = 0
  scoreboardsArray = []
  assTxt = ''
  hisScore=0
  hisScoreStr=''
  assRptFileTxt = ''
  cellBrk =  "\n"+"\"" + "\n"
  verifyDelete = false
  deleteIx = -1
  deleteWhichParticipantFullUserId = ' ' 
  //utcOffset = new Date().getTimezoneOffset()  // in minutes
  constructor() {}
  @Input() custIn  
  @Input() qidIn  
  @Input() scoreboardsIn
  @Input() surveyNameIn

  ngOnInit(){
    console.log('running wwu ngOnInit===')
    console.log(this.surveyNameIn)
    this.scoreboardsArray = this.scoreboardsIn
    this.msg1 = 'loading participants...'
    this.launchQtReadUsers() // this get db users 

  } // end ngOnInit

  launchQtReadUsers() {
  console.log('running launchQtReadUsers') 
  apiFauna.qtReadUsers(this.custIn, this.qidIn)
    .then 
      (   (qtDbRtnObj) => 
        {
          console.log(' running .then of apiFauna.qtReadUsers') 
          this.buildListOfUsers(qtDbRtnObj)

        }
      )
      .catch(() => {  // apiFauna.qtReadUsers returned an error 
        console.log('apiFauna.qtReadUsers error. cust & qid:' 
        , this.custIn, ' ', this.qidIn )
      })
  } //end launchQtReadUsers

  buildListOfUsers(qtDbObj){
    for (let i = 0; i < qtDbObj.length; i++) {
      this.usersArray.push(qtDbObj[i].data)
      // read usersArray[i].userDateTime string, convert to local dateTime)
      let mydate = new Date(this.usersArray[i].userDateTime)
      this.usersArray[i].localUserDateTime = 
           mydate.toLocaleString().replace(',','')
    }

    this.usersArray
    .sort((a, b) => (a.accum > b.accum) ? 1 : -1 )
    this.msg1 = 'participant list'
  }  //end buildListOfUsers

  scoresCsvButClicked(ux){
    this.msg1 = 'building scores csv to download...'
    this.downloadScoresCsvPending = true
    this.buildAndDownload(ux)
  } // end dnLoadButClicked

  buildAndDownload(ux){
    // find score recs for usersArray[ux].userId 
    // read db for all the score recs and build a file
    this.userId = this.usersArray[ux].userId
    this.firstName = this.usersArray[ux].firstName
    this.lastName = this.usersArray[ux].lastName
    this.userDateTime =  this.usersArray[ux].userDateTime
    this.localUserDateTime = this.usersArray[ux].localUserDateTime
    this.scoreFileName = this.userId + '.csv'
    this.launchQtReadScores()
    // launchQtReadScores has async processing that does the download.
    // beware this is a whole slew of functions chained in async,
    // following  launchQtReadScores.
  }

 dnLoadTheFile(myFileName, txt) {
  // hacky way to  download, but it's common.
  // create an invisible screen element,
  // give it attributes, and fake click it.
  var elem = document.createElement('a')
  elem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt))
  elem.setAttribute('download', myFileName)
  elem.style.display = 'none'
  document.body.appendChild(elem)
  elem.click()
  document.body.removeChild(elem) 
  this.msg1 = 'file downloaded.'
}
 
launchQtReadScores()  {
  console.log('running launchQtReadScores') 
  apiFauna.qtReadScores(this.custIn, this.qidIn, this.userId)
    .then 
      (   (qtDbRtnObj) => 
        {
          console.log(' running .then of apiFauna.qtReadScores') 
          this.buildListOfScores(qtDbRtnObj)
          if (this.downloadAssRptPending) {
            this.buildRpt2()
          }
          if (this.downloadScoresCsvPending) {
            this.buildScoresCsv()
            this.launchQtReadAnswers() 
          }
        }
      )
      .catch(() => {  // apiFauna.qtReadScores returned an error 
        console.log('apiFauna.qtReadScores error. cust & qid & user' 
        , this.custIn, ' ', this.qidIn )
      }) 

} //end launchQtReadScores

launchQtMassDeleteAnswers(){
  console.log('running launchQtMassDeleteAnswers') 
  apiFauna.qtMassDeleteAnswers(this.custIn, this.qidIn, this.userId)
  .then 
      (   (qtDbRtnObj) => 
        {
          console.log(' running .then of apiFauna.qtMassDeleteAnswers') 
        }
      )
      .catch(() => {  // apiFauna.qtMassDeleteAnswers returned an error 
        console.log('apiFauna.qtMassDeleteAnswers error. cust & qid & user' 
        , this.custIn, ' ', this.qidIn,' ',this.userId )
      })
}

launchQtMassDeleteScores(){
  console.log('running launchQtMassDeleteScores') 
  apiFauna.qtMassDeleteScores(this.custIn, this.qidIn, this.userId)
  .then 
      (   (qtDbRtnObj) => 
        {
          console.log(' running .then of apiFauna.qtMassDeleteScores') 
        }
      )
      .catch(() => {  // apiFauna.launchQtMassDeleteScores returned an error 
        console.log('apiFauna.qtMassDeleteScores error. cust & qid & user' 
        , this.custIn, ' ', this.qidIn,' ',this.userId )
      })
}
launchQtDeleteParticipant(){
  console.log('running  wwu launchQtDeleteParticipant')
  console.log(this.custIn, this.qidIn, this.userId)
  apiFauna.qtDeleteParticipant(this.custIn, this.qidIn, this.userId)
  .then 
      (   (qtDbRtnObj) => 
        {
          console.log(' running .then of apiFauna.launchQtDeleteParticipant') 
        }
      )
  // return from this on-the-fly function is implied  
  .catch(() => {
    console.log('launchQtDeleteParticipant error. cust & qid & user:' 
    , this.custIn, ' ', this.qidIn,' ',this.userId ) 
  })
}  // end launchQtDeleteParticipant

buildListOfScores(qtDbObj){ 
  console.log('running buildListOfScores')
    // we have returned from the awaited promise of scores fetch.
    // dbRtnObj contains all the scores objects for this user+date.
    this.scoresArray = []
    for (let i = 0; i < qtDbObj.length; i++) {
      this.scoresArray.push(qtDbObj[i].data)
    }
    // console.log('149 scoresArray: ')
    // console.table(this.scoresArray)
    if (this.scoresArray.length == 0) {this.msg1 = 'no scores found.'}
    if (this.scoresArray.length > 0) {
      this.scoresArray
      .sort((a, b) => (a.accum > b.accum) ? 1 : -1 )
    } // end if
} // end buildListOfScores

buildScoresCsv(){
  console.log('running buildScoresCsv')
  this.scoresTxt = 
    this.firstName + ' ' + this.lastName
    + ',,, phone ext: '
    + this.scoresArray[0].quserId
      .substring(this.scoresArray[0].quserId.length - 4)
      //+ ', survey date/time: '
    + ',, ' + this.localUserDateTime
    + ',,,'
    + this.surveyNameIn
    +',,,'
    + 'Scores and Answers'
        //+ ',,,promo code?'
    + "\r\n"
    + "\r\n"

  this.scoresTxt = this.scoresTxt +
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
   this.scoresTxt = this.scoresTxt + rowX + "\r\n"
} // end for
} // end buildScoresCsv

launchQtReadAnswers() {
  console.log('running launchQtReadAnswers') 
  apiFauna.qtReadAnswers(this.custIn, this.qidIn, this.userId)
    .then 
      (   (qtDbRtnObj) => 
        {
          console.log('running .then of apiFauna.qtReadAnswers') 
          this.buildListOfAnswers(qtDbRtnObj)
        }
      )
      .catch(() => {  // apiFauna.qtReadAnswers returned an error 
        console.log('apiFauna.qtReadAnswers error. cust & qid & user: ' 
        , this.custIn, ' ', this.qidIn,' ',this.userId)
      })
} //end launchQtReadAnswers 

  buildListOfAnswers(qtDbObj){
    console.log('running buildListOfAnswers')
    // we have returned from the awaited promise of answers fetch.
    // dbRtnObj contains all the answer objects for this user+date.
    this.answersArray = [] // start out with a blank array
    for (let i = 0; i < qtDbObj.length; i++) {
      this.answersArray.push(qtDbObj[i].data)
    }
    this.answersArray
    .sort((a, b) => (Number(a.questNbr) > Number(b.questNbr)) ? 1 : -1 )
    this.buildAnswersCsv()  
    if (this.downloadScoresCsvPending){
      this.dnLoadTheFile(this.scoreFileName,this.scoresTxt)
      this.downloadScoresCsvPending = false

    } // end if
  } // end buildListOfAnswers

  buildAnswersCsv(){ // append answers into the scores csv file.
    this.scoresTxt = this.scoresTxt + "\r\n" + "\r\n"
    this.scoresTxt = this.scoresTxt + 'Quest Nbr, Answer, Time Gap , Question Text' + "\r\n"
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
      this.scoresTxt = this.scoresTxt + rowX + "\r\n"
    } // end for
  } // end buildAnswersCsv

  AssRptButClick(ux) {
    console.log('wwu running AssRptButClick')
    this.downloadAssRptPending = true
    this.userId = this.usersArray[ux].userId
    this.firstName = this.usersArray[ux].firstName
    this.lastName = this.usersArray[ux].lastName
    this.userDateTime =  this.usersArray[ux].userDateTime
    this.msg1 = 'building report for ' 
      + this.firstName + ' ' + this.lastName
      //this.launchQtreadScoreboards() // has chaining, sets scoresArray
      this.launchQtReadScores() // has chaining, sets scoresArray
  }  // end reportButClick

  delButClick(ux){
    console.log('running delButClick')
    this.deleteIx = ux
    this.deleteWhichParticipantFullUserId = this.usersArray[ux].userId
    this.verifyDelete=true
    this.msg1 = ''
  } // end delButClick

  proceedWithDelete(){
    console.log('running proceedWithDelete')
    this.deleteOneUsersScores(this.deleteIx)
    this.deleteOneUsersAnswers(this.deleteIx)
    this.deleteOneUsersParticipant(this.deleteIx)
    this.removeParticipantFromUserArray(this.deleteIx)
    this.verifyDelete=false
  } // end proceedWithDelete

  cancelDelete(){
    this.verifyDelete = false
    this.deleteIx = -1
  } // end cancelDelete

  deleteOneUsersAnswers(ux){
    console.log('running deleteOneUsersAnswers')
    this.userId = this.usersArray[ux].userId
    this.launchQtMassDeleteAnswers()
  }
  
  deleteOneUsersParticipant(ux){
    console.log('running deleteOneUsersParticipant')
    this.userId = this.usersArray[ux].userId
    this.launchQtDeleteParticipant()
  }

  removeParticipantFromUserArray(ux){
    console.log('running removeParticipantFromUserArray')
    this.usersArray.splice(ux,1) 
  }  // end removeParticipantFromUserArray

buildRpt2(){
  console.log('292 running buildRpt2')
  console.table(this.scoresArray)
  this.assRptFileTxt = 'Assessment Report ' +',,,'  
  + this.surveyNameIn + "\r\n"
  + this.firstName + ' ' + this.lastName
  + ',,,Participant: '
  + this.scoresArray[0].quserId + "\r\n" + "\r\n"
  + 'Scoreboard   ' 
  + ',,,'   
  + 'Score   ' + ','   
  + 'Range Text   ' + "\r\n"
  let scoresIx = 0
  for (let i=0;i<this.scoreboardsArray.length;i++){
    this.hisScore = 0
    this.hisScoreStr = ''
    this.assTxt = 'no score' // maybe overRidden below
    this.assRptFileTxt =  this.assRptFileTxt  
    + this.scoreboardsArray[i].scoreboardName + ',' 
    // doc.text(5,  this.row, this.scoreboardsArray[i].scoreboardName) 
    // lookup his score that matches current scoreboard:
    scoresIx = this.scoresArray
      .findIndex(s => s.accum.toLowerCase() == this.scoreboardsArray[i].scoreboardName.toLowerCase())
    if(scoresIx>-1){
      this.hisScore    = this.scoresArray[scoresIx].wscore 
      this.hisScoreStr = this.scoresArray[scoresIx].wscore.toString()
      this.setScoresArrayAssTxt(i,this.hisScore) 
    }
    this.assRptFileTxt =  this.assRptFileTxt  
    + ',,' + this.hisScoreStr + ','
    + this.assTxt + "\r\n"
  } // end for
  let rptName = 'Assessment Report ' + this.userId + '.csv'
  this.dnLoadTheFile(rptName,this.assRptFileTxt)
  this.downloadAssRptPending = false
  this.msg1 = 'built an assessment report for ' 
  + this.firstName + ' ' + this.lastName + '.'
  console.log('349 end buildRpt2')
} // end buildRpt2


setScoresArrayAssTxt(scoreboardIx,hisScore){
 console.log('running setScoresArrayAssTxt')
 this.assTxt = ' '
   // loop thru all ranges for the current scoreboards row:
   for (let j = 0; j < this.scoreboardsArray[scoreboardIx].ranges.length; j++) {
    // console.table(this.scoreboardsArray[scoreboardIx])
    if  (hisScore >= this.scoreboardsArray[scoreboardIx].ranges[j].rangeStart 
    &&   hisScore <= this.scoreboardsArray[scoreboardIx].ranges[j].rangeEnd  ) {
      //console.log('hitter 434')
      this.assTxt += '"'
      this.assTxt += 'weef'
      this.assTxt = this.scoreboardsArray[scoreboardIx].ranges[j].rangeTxt
      //this.assTxt += '"'

      j = 9999  // we have a hit.  exit the range check loop

    }  // end if
  }  // end for
} // end setScoresArrayAssTxt

deleteOneUsersScores(ux){
  console.log('running deleteOneUsersScores')
  this.userId = this.usersArray[ux].userId
  this.launchQtMassDeleteScores()
} // end deleteOneUsersScores

// scrollDude1() { //elegant, but not used.
//   let elem = document.getElementById('anchorName1')
//   elem.scrollIntoView()
// }

} // end export qncwwu
