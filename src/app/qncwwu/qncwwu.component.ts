// @ts-nocheck // bypass typescript checker on this one file.
// needed cuz jsPDF invokes weird type checks on doc.text(bla,bla)

// billy, how can we cut down on reads to qtUsers ?
// maybe max out on 25 reads, 
// and build fauna pagination?

import { Component, OnInit, Input, 
  EventEmitter, Output } from '@angular/core' 
import api   from 'src/utils/api'
import jsPDF from 'jspdf'
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
  row=5
  c=5
  rowsUsed = 1
  assMaxxWidthPx= 95 // how many ?pixels? will assTxt take?
  downloadCsvPending = false
  downloadRptPending = false
  lowScoreThresh = 0
  hiScoreThresh = 0
  scoreboardsArray = []
  assTxt = ''
  hisScore=0
  hisScoreStr=''

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
  api.qtReadUsers(this.custIn, this.qidIn)
    .then 
      (   (qtDbRtnObj) => 
        {
          console.log(' running .then of api.qtReadUsers') 
          this.buildListOfUsers(qtDbRtnObj)
        }
      )
      .catch(() => {  // api.qtReadUsers returned an error 
        console.log('api.qtReadUsers error. cust & qid:' 
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
    this.msg1 = 'Participants shown.'
  }  //end buildListOfUsers

  dnLoadButClicked(ux){
    this.msg1 = 'building a file to download...'
    this.downloadCsvPending = true
    this.buildAndDownload(ux)
  } // end dnLoadButClicked

  buildAndDownload(ux){
    // find score recs for usersArray[ux].userId 
    // read db for all the score recs and build a file
    this.userId = this.usersArray[ux].userId
    this.firstName = this.usersArray[ux].firstName
    this.lastName = this.usersArray[ux].lastName
    this.userDateTime =  this.usersArray[ux].userDateTime
    this.scoreFileName = this.userId + '.csv'
    this.launchQtReadScores()
    // launchQtReadScores has async processing that does the download.
    // beware this is a whole slew of functions chained in async,
    // following  launchQtReadScores.
  }

 dnLoadScoreFile(dnScoreFileName, txt) {
  var elem = document.createElement('a')
  elem.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(txt))
  elem.setAttribute('download', dnScoreFileName)
  elem.style.display = 'none'
  document.body.appendChild(elem)
  elem.click()
  document.body.removeChild(elem) 
  this.msg1 = 'file downloaded.'
  this.downloadCsvPending = false
}
 
launchQtReadScores()  {
  console.log('running launchQtReadScores') 
  api.qtReadScores(this.custIn, this.qidIn, this.userId)
    .then 
      (   (qtDbRtnObj) => 
        {
          console.log(' running .then of api.qtReadScores') 
          this.buildListOfScores(qtDbRtnObj)
          if (this.downloadRptPending) {
            this.buildRpt()
          }
          if (this.downloadCsvPending) {
            this.buildScoresCsv()
            this.launchQtReadAnswers() 
          }
        }
      )
      .catch(() => {  // api.qtReadScores returned an error 
        console.log('api.qtReadScores error. cust & qid & user' 
        , this.custIn, ' ', this.qidIn )
      }) 

} //end launchQtReadScores

buildListOfScores(qtDbObj){ 
  console.log('running buildListOfScores')
    // we have returned from the awaited promise of scores fetch.
    // dbRtnObj contains all the scores objects for this user+date.
    this.scoresArray = []
    for (let i = 0; i < qtDbObj.length; i++) {
      this.scoresArray.push(qtDbObj[i].data)
    }
    // console.table(this.scoresArray)
    if (this.scoresArray.length == 0) {this.msg1 = 'no scores found.'}
    if (this.scoresArray.length > 0) {
      this.scoresArray
      .sort((a, b) => (a.accum > b.accum) ? 1 : -1 )
    } // end if
} // end buildListOfScores

buildScoresCsv(){
  console.log('running buildScoresCsv')
  this.scoresTxt = this.firstName + ' ' + this.lastName
    + ',,, Participant: '
    + this.scoresArray[0].quserId + "\r\n"
  this.scoresTxt = this.scoresTxt +
  'Scoreboard,Score,Wscore,Quest Cnt,Time Gap' + "\r\n"
//let csvContent = "data:text/csv;charset=utf-8,"
let rowX = ''
for (let i = 0; i < this.scoresArray.length; i++) {
  rowX = 
     this.scoresArray[i].accum + ',' 
   + this.scoresArray[i].score + ',' 
   + this.scoresArray[i].wscore + ',' 
   + this.scoresArray[i].questCnt + ',' 
   + this.scoresArray[i].timeGap
   this.scoresTxt = this.scoresTxt + rowX + "\r\n"
} // end for
} // end buildScoresCsv

launchQtReadAnswers() {
  console.log('running launchQtReadAnswers') 
  api.qtReadAnswers(this.custIn, this.qidIn, this.userId)
    .then 
      (   (qtDbRtnObj) => 
        {
          console.log('running .then of api.qtReadAnswers') 
          this.buildListOfAnswers(qtDbRtnObj)
        }
      )
      .catch(() => {  // api.qtReadAnswers returned an error 
        console.log('api.qtReadAnswers error. cust & qid & user: ' 
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
    .sort((a, b) => (a.questNbr > b.questNbr) ? 1 : -1 )
    this.buildAnswersCsv()  
    if (this.downloadCsvPending){
      this.dnLoadScoreFile(this.scoreFileName,this.scoresTxt)
    } // end if
  } // end buildListOfAnswers

  buildAnswersCsv(){ // append answers into the scores csv file.
    this.scoresTxt = this.scoresTxt + "\r\n" + "\r\n"
    this.scoresTxt = this.scoresTxt + 'Quest Nbr, Answer, Time Gap' + "\r\n"
    let rowX = ''
    for (let i = 0; i < this.answersArray.length; i++) {
      rowX = 
         this.answersArray[i].questNbr + ',' 
       + this.answersArray[i].answerPoints + ',' 
       + this.answersArray[i].timeGap   
      this.scoresTxt = this.scoresTxt + rowX + "\r\n"
    } // end for
  } // end buildAnswersCsv

  reportButClick(ux) {
    console.log('wwu running reportButClick')
    this.downloadRptPending = true
    this.userId = this.usersArray[ux].userId
    this.firstName = this.usersArray[ux].firstName
    this.lastName = this.usersArray[ux].lastName
    this.userDateTime =  this.usersArray[ux].userDateTime
    this.msg1 = 'building report for ' 
      + this.firstName + ' ' + this.lastName
      //this.launchQtreadScoreboards() // has chaining, sets scoresArray
      this.launchQtReadScores() // has chaining, sets scoresArray
  }  // end reportButClick

  rowInc(){ // increment row for jsPdf
    console.log('running rowInc. rowsUsed:', this.rowsUsed)
    this.row = this.row + (5 * this.rowsUsed )
   } // end rowInc
 

buildRpt(){
  console.log('running buildRpt')
  let doc = new jsPDF('p', 'mm', 'a4')
  this.row = 5
  this.c = 5
  doc.setFontSize(10) // doc.text(col,row,myText)
  doc.text(  5 , this.row, this.surveyNameIn)  
  doc.text( 60 , this.row, this.firstName + ' ' + this.lastName)  
  //doc.line(x-from,y-from,x-to,y-to)
  doc.line(5,7,161,7)
  this.row = 13
  doc.setFont("helvetica")
  doc.text(5,  this.row, 'Scoreboard') 
  doc.text(50, this.row,   'Score')  
  this.row = 19 // start report detail line
  doc.setFont("courier")

  let scoresIx = 0
  for (let i=0;i<this.scoreboardsArray.length;i++){
    this.hisScore = 0
    this.hisScoreStr = ''
    this.assTxt = 'no score' // maybe overRidden below
    doc.text(5,  this.row, this.scoreboardsArray[i].scoreboardName) 
    // lookup his score that matches current scoreboard:
    scoresIx = this.scoresArray
      .findIndex(s => s.accum == this.scoreboardsArray[i].scoreboardName)
    if(scoresIx>-1){
      this.hisScore    = this.scoresArray[scoresIx].wscore 
      this.hisScoreStr = this.scoresArray[scoresIx].wscore.toString()
      this.setScoresArrayAssTxt(i,this.hisScore) 
    }
    doc.text(50, this.row, this.hisScoreStr)

    doc.text  (60, 
      this.row,  
      this.assTxt,
      { maxWidth: this.assMaxxWidthPx }) 

    this.rowInc() // increment row for next row.
  } // end for

  let rptName = this.userId + '.pdf'
  doc.save(rptName) 
  this.downloadRptPending = false
  this.msg1 = 'built an assessment report for ' 
  + this.firstName + ' ' + this.lastName + '.'

} // end buildRpt


setScoresArrayAssTxt(scoreboardIx,hisScore){
 console.log('running setScoresArrayAssTxt')
 this.assTxt = ' '
   // loop thru all ranges for the current scoreboards row:
   for (let j = 0; j < this.scoreboardsArray[scoreboardIx].ranges.length; j++) {
    // console.table(this.scoreboardsArray[scoreboardIx])
    if  (hisScore >= this.scoreboardsArray[scoreboardIx].ranges[j].rangeStart 
    &&   hisScore <= this.scoreboardsArray[scoreboardIx].ranges[j].rangeEnd  ) {
      //console.log('hitter 434')
      this.assTxt = this.scoreboardsArray[scoreboardIx].ranges[j].rangeTxt
      // billy, figure out rowsUsed.  duznt work right all the time.
      this.rowsUsed = Math.ceil(this.assTxt.length / this.assMaxxWidthPx * 2) + 1

      j = 9999  // we have a hit.  exit the range check loop

    }  // end if
  }  // end for
} // end setScoresArrayAssTxt

} // end export qncwwu
