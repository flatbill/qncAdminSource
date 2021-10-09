import { Component, OnInit, Input } from '@angular/core'
import { EventEmitter, Output     } from '@angular/core'
import api from 'src/utils/api'
// questionsIn came from parent.
// lets work on this screen with questionsIn.
//  
// add & delete hit both questionsIn and the database.
// changes hit questionsIn, but wont hit database until he saves.
// billy , should we auto save when he changes aca?
// i mean, it looks like an add/delete to the user, not a change.

@Component({
  selector: 'app-qncwwqd',
  templateUrl: './qncwwqd.component.html'
})
export class QncwwqdComponent implements OnInit {
  constructor() { }
  @Input() custIn
  @Input() qidIn
  @Input() questionNbrIn
  @Input() questionsIn  // questions list
  @Input() rulesIn  
  @Input() subsetsIn  
  @Output() wwqJumpOut = new EventEmitter()
  msg1 = 'edit question details.'
  qx = -1
  rulesArrayThisSubset = []
  fullRuleWords = '(none)'
  todaysDate = new Date().toJSON().split("T")[0]
  questObj = {}
  qtDbDataObj = {} 
  pendingAddQx = -1
  rangeTxtCols = 72
  rangeTxtRows = 4

  ngOnInit() {
    //this.chkSubsetAccumMatch(this.questionsIn[this.qx].subset)
    // if (this.questionsIn.length == 0){
    //   // first time he has jumped into this screen.
    //   this.questionsIn = this.questionsIn }

    if (this.questionNbrIn==-1){
      // no questions exist. add a starter question.
      this.addButClick()
      this.qx = 0
      this.msg1 ='New starter question created. Ready for your changes.'
    } else {
      this.findQuestIx()
    }  
    console.log('wwqd 42 this.qx:')
    console.log(this.qx)
    console.table(this.questionsIn)
  } // end ngOnInit

  // prevButClick(){
  //   this.msg1 = 'first question shown.'
  //   if(this.qx == 0) { return} 
  //   this.qx = this.qx - 1 
  //   this.msg1 = 'previous question shown.'
  //   this.chkSubsetAccumMatch(this.questionsIn[this.qx].subset)
  // }

  prevButClick(){
    // console.log('running prevButClick')
    this.msg1 = 'first question shown.'
    let loopQx = this.qx
    while (loopQx > 0) {
      loopQx = loopQx - 1
      if (this.questionsIn[loopQx].qFilterInOut == 'in') {
        this.qx = loopQx
        this.msg1 = 'previous question shown.'
        // this is a rec we want to show. qx is set.
        loopQx = 0 // lets exit the while loop
      }
    } // end while
  } // end prevButClick

  // nextButClick(){
  //   this.msg1 = 'last question shown.'
  //   if(this.qx == this.questionsIn.length-1) { return} //no more next
  //   this.qx = this.qx + 1 
  //   this.msg1 = 'next question shown.'
  //   this.chkSubsetAccumMatch(this.questionsIn[this.qx].subset)
  // }

  nextButClick(){
    this.msg1 = 'last question shown.'
    let loopQx = this.qx
    while (loopQx < this.questionsIn.length-1) {
      loopQx = loopQx + 1
      if (this.questionsIn[loopQx].qFilterInOut == 'in') {
        this.qx = loopQx
        this.msg1 = 'next question shown.'
        // this is a rec we want to show. qx is set.
        loopQx = 9999 // lets exit the while loop
      }
    } // end while
  } // end nextButClick

  addButClick(){
    this.msg1 = 'edit this new question.'
    let newQuestNbr = '001'
    if (this.questionsIn.length > 0) {
      //  set new quest nbr to one bigger than max quest nbr
      let questNbrMax = 
        Math.max.apply(Math, this.questionsIn.map(function(q) { return q.questNbr }))
      newQuestNbr = (questNbrMax + 1).toString().padStart(3, '0')
    } // end if questionsIn.length > 0

    let ranSeq = 
      (Math.floor(Math.random() * Math.floor(9999))).toString()

    this.questionsIn.push(
      {
       cust: this.custIn,
       qid: this.qidIn,
       questNbr: newQuestNbr,
       questSeq: ranSeq,
       questTxt: "new question text",
       preQuest: "new pre-question text",
       aca: ["answer choice text"],
       acaPointVals: [0],
       accum: ["scoreboard1"],
       subset: 'group1'
      }
    )
    console.log('wwqd 95 questionIn:')
    console.table(this.questionsIn)
    this.qx = this.questionsIn.length - 1
    // questionsIn has one more question than the db.
    this.pendingAddQx = this.qx // when he hits save, we use this.
    this.msg1 = 'adding question nbr: ' + this.questionsIn[this.qx].questNbr
    this.saveQuestion() //auto save
    // this.msg1 = 'added question nbr: ' 
    //   + this.questionsIn[this.qx].questNbr
    //   + ' Edit and save this question. '
    this.msg1 ='New starter question created. Ready for your changes.'
    this.questionsIn[this.qx].qFilterInOut = 'in'
    // billy also add subset to subSetsIn if needed
    //alert('added new question to questionsIn with subset: group1')
  } // end addButClick

  saveButClick(){
    // console.log('running saveButClick')
    // call the database api
    // we are working with one question.
    // if this is a newly added question,
    // he may have also added a new subset
    // think about accum too.
    // accums are data-on-the-fly, but
    // is there a fauna accum table?
    // if so, we might have to add a new accum. 
    this.msg1 = ''
    this.saveQuestion()
  } // end saveButClick

  saveQuestion(){
    this.msg1 = this.msg1 + ' question saved.'
    // console.log('running wwqd saveQuestion')
    this.buildQuestionObj() // uses current qx
    if (this.pendingAddQx >= 0) {
      this.launchQtAddQuestion()
      this.pendingAddQx = -1
    } else {
      //  this is a changed question:
      this.launchQtUpdateQuestion()
    }
  }

  delButClick(){
   // delete question from question array.
   // call database api
   // figure out qx of the on-screen question, 
   // and delete-splice it from array:
   let questNbrWork = this.questionsIn[this.qx].questNbr  
   this.qx = this.questionsIn
     .findIndex(q => q.questNbr == questNbrWork)
   // delete old subset from subsetsIn if this is last quest of subset:
   // is it weird though, what if we just left the old subset hanging?
   // i mean, he has a hanging subset when he 'adds a new group'
   // on the other screen.
   this.chkDelSubsetForSubsets(this.questionsIn[this.qx].subset) 
   //  delete the db question
   this.buildQuestionObj()
   this.launchQtDeleteQuestion()
   // delete the array question:
   this.questionsIn.splice(this.qx,1) 
   // after he deletes a quest, show adjacent question on screen.
   this.qx = this.qx + 1 
   if(this.qx > this.questionsIn.length -1 ) {
      this.qx = this.questionsIn.length -1  
    }
    this.msg1 = 'question ' + questNbrWork + ' deleted.'
    if (this.questionsIn.length==0){
      //billy, maybe tell him nicer, that we will jump to the list screen.
      alert('no questions left. Leaving this screen.')
      this.jumpToWwq()
    }
  } // end delButClick

  ranSeqButClick(qx){
   this.msg1 = 'question sequence randomized. '
   this.questionsIn[qx].questSeq =
     (Math.floor(Math.random() * Math.floor(9999))).toString()
     this.saveQuestion()
  }

  questTxtChg(newQuestTxt,qx){
    console.log('running questTxtChg to ',newQuestTxt)
    this.msg1 = 'question text changed. '
    this.questionsIn[qx].questTxt = newQuestTxt
    this.saveQuestion()
    // console.table(this.questionsIn)
    // think about subset stuff too.
  } // end questTxtChg

  questSeqChg(newQuestSeq,qx){
    this.msg1 = 'question sequence changed. '
    this.questionsIn[qx].questSeq = newQuestSeq
    this.saveQuestion()
  } // end questSeqChg

  subsetChg(newSubset,qx){
    this.msg1 = 'group changed. '

    // he changed the subset on the screen.  now its complicated.  
    // a. we assume he is changing the subset this question belongs to.
    // b. we assume he is NOT renaming the old subset to a new name.
    // if a rule already exist for the old name, we dont care.
    // if a rule already exist for the new name, let's show it.
    // if a rule does not exist for the new name, show blank
 
    // change rulesIn.subset to newly changed subset (not wanted)
    //this.setSubsetForRules(this.questionsIn[qx].subset,ev.target.value)

    // add new subset to subsetsIn if its not there already:
    this.setSubsetForSubsets(newSubset)

    // delete old subset from subsetsIn if no questions any more:
    this.chkDelSubsetForSubsets(this.questionsIn[qx].subset)
    this.questionsIn[qx].subset = newSubset
    this.saveQuestion()
    this.chkSubsetAccumMatch(this.questionsIn[qx].subset)
  } // end subsetChg

  preQuestChg(newPreQuest,qx){
    this.msg1 = 'pre-question changed. '
    this.questionsIn[qx].preQuest = newPreQuest
    this.saveQuestion()
  } // end preQuestChg
  
  questAcaChg(newAca,qx,ax){
    this.msg1 = 'answer choice changed. '
    this.questionsIn[qx].aca[ax] = newAca
    this.saveQuestion()
  } // end questAcaChg

  questAccumChg(newScoreboard,qx,accumNbr) {
    console.log('running questAccumChg')
    this.msg1 = 'scoreboard changed. '
    newScoreboard = newScoreboard.trim()
    if (newScoreboard.length == 0) {
      this.questionsIn[qx].accum.splice(accumNbr,1) //delete accum
    } else { 
      this.questionsIn[qx].accum[accumNbr] = newScoreboard
    }
    this.saveQuestion()
  } // end questAccumChg

  questAcaPointValChg(newAcaPoints,qx,ax){
    this.msg1 = 'point value changed. '
    if (Number(newAcaPoints) > -1 
    &&  Number(newAcaPoints) <= 99999) {
      // he entered a nice number
      this.questionsIn[qx].acaPointVals[ax] = newAcaPoints
      // html input formats PointVal field as a string,
      // so parseInt the pointval into a number.
      if (typeof(newAcaPoints) == 'string') {
        this.questionsIn[qx].acaPointVals[ax] = parseInt(newAcaPoints)
      }
    } else {
      // billy, duznt work?
      this.msg1 = 'you entered a wrong value into Points.'
    }
    this.saveQuestion()
  } // end questAcaPointValChg

  acaFrameChg(newAcaFrame,qx){
    this.msg1 = 'answer choice frame changed. '
    this.questionsIn[qx].acaFrame = newAcaFrame.split(",")
    this.saveQuestion()
  }

  setSubsetForRules(subsetOld,subsetNew){
    console.log('running setSubsetForRules')
    // console.log(subsetOld,subsetNew)
    // find rules with the old subset, change subset to new subset.
    // this works, but isnt wanted, 
    // cuz it impliies he is changing the old subset into the new subset.
    for (let i = 0; i < this.rulesIn.length; i++) { 
      if(this.rulesIn[i].subset == subsetOld) {        
        this.rulesIn[i].subset = subsetNew
      } // end if
    } // end for
  } // end setSubsetForRules

  setSubsetForSubsets(subsetNew){
    console.log('running setSubsetForSubsets:', subsetNew)
    // look for the new subset in subsetsIn,
    // if not found, push new subset to subsetsIn.
    let subsetFoundYn = 'n'
    for (let i = 0; i < this.subsetsIn.length; i++) { 
      if(this.subsetsIn[i] == subsetNew) {   
        // console.log(' we found a subset match for: ', subsetNew)     
        subsetFoundYn = 'y'
        break
      } // end if
    } // end for 
    if (subsetFoundYn == 'n'){
      // console.log('213 pushing into subsetsIn: ', subsetNew)
      this.subsetsIn.push(subsetNew)
    }  // end if
    // billy, maybe add the new subset to the db.
  } // end setSubsetForSubsets

  chkDelSubsetForSubsets(subsetOld){
    // console.log('running chkDelSubsetForSubsets',subsetOld)
    // check if we have deleted all questions for a subset.
    // if so, delete the subset.
    let countQuestForOldSubset = 0
    for (let i = 0; i < this.questionsIn.length; i++) { 
      if (this.questionsIn[i].subset == subsetOld) {        
        countQuestForOldSubset = countQuestForOldSubset + 1
      } // end if
    } // end for
    if (countQuestForOldSubset == 1) {
      // we deleted the last question in the old subset
      // console.log('hey, lets splice out from subsetsIn')
      // console.table(this.subsetsIn)
      for (let i = 0; i < this.subsetsIn.length; i++) { 
        if (this.subsetsIn[i] == subsetOld ) {
          this.subsetsIn.splice(i,1) } //delete old subset
          // console.log('delete old subset from subsetsIn: ',subsetOld)
          break
      } // end for
    } // end if count
  } // end chkDelSubsetForSubsets

  findQuestIx(){
    this.qx = this.questionsIn
    .findIndex(q => q.questNbr == this.questionNbrIn)
  } // end findQuestIx

  chkSubsetAccumMatch(subsetParmIn){ 
    //set fullRuleWords like 'accum1 > 13'
    // console.log('running chkSubsetAccumMatch',  subsetParmIn)
    let subsetTempVarr = subsetParmIn, //clever way to pass into .filter
        rulesTempArray = this.rulesIn
        .filter(function(r){ return r.subset == subsetTempVarr })  
    this.rulesArrayThisSubset = rulesTempArray 
    // console.table(this.rulesArrayThisSubset)
    if (this.rulesArrayThisSubset.length > 0) {
      this.fullRuleWords = this.rulesArrayThisSubset[0].accum + ' '
      + this.rulesArrayThisSubset[0].oper + ' '
      + this.rulesArrayThisSubset[0].thresh
      // console.log('247 hit set fullRuleWords to a real rule ', this.fullRuleWords)
    } else {
      this.fullRuleWords = '(none)'
      // console.log('251 hit set fullRuleWords to blank ')
    }

  } // end chkSubsetAccumMatch
  
  addAnswerChoice(){
    console.log('running addAnswerChoice')
    // append into question.aca array and append into question.acaPoints
    this.msg1 = 'edit this new answer choice.'
    this.questionsIn[this.qx].aca.push('newChoice')
    this.questionsIn[this.qx].acaPointVals.push(0)
    this.saveQuestion() // 

    let elId: HTMLInputElement = 
      document.getElementById('htmlIdBottomOfPage') as HTMLInputElement
    elId.scrollIntoView();
  }

  setAnswerChoice13(){
    console.log('running setAnswerChoice13')
    // append into question.aca array and append into question.acaPoints
    this.msg1 = 'answer choices set to 1-3. '
    this.questionsIn[this.qx].aca = []
    this.questionsIn[this.qx].aca[0] = '1'
    this.questionsIn[this.qx].aca[1] = '2'
    this.questionsIn[this.qx].aca[2] = '3'
    this.questionsIn[this.qx].acaPointVals   = []
    this.questionsIn[this.qx].acaPointVals[0] = 1
    this.questionsIn[this.qx].acaPointVals[1] = 2
    this.questionsIn[this.qx].acaPointVals[2] = 3
    this.saveQuestion() // 
    let elId: HTMLInputElement = 
      document.getElementById('htmlIdBottomOfPage') as HTMLInputElement
    elId.scrollIntoView();
  }

  setAnswerChoice15(){
    console.log('running setAnswerChoice15')
    // append into question.aca array and append into question.acaPoints
    this.msg1 = 'answer choices set to 1-5. '
    this.questionsIn[this.qx].aca = []
    this.questionsIn[this.qx].aca[0] = '1'
    this.questionsIn[this.qx].aca[1] = '2'
    this.questionsIn[this.qx].aca[2] = '3'
    this.questionsIn[this.qx].aca[3] = '4'
    this.questionsIn[this.qx].aca[4] = '5'
    this.questionsIn[this.qx].acaPointVals   = []
    this.questionsIn[this.qx].acaPointVals[0] = 1
    this.questionsIn[this.qx].acaPointVals[1] = 2
    this.questionsIn[this.qx].acaPointVals[2] = 3
    this.questionsIn[this.qx].acaPointVals[3] = 4
    this.questionsIn[this.qx].acaPointVals[4] = 5
    this.saveQuestion() // 
    let elId: HTMLInputElement = 
      document.getElementById('htmlIdBottomOfPage') as HTMLInputElement
    elId.scrollIntoView();
  }

  setAnswerChoice18(){
    console.log('running setAnswerChoice18')
    // append into question.aca array and append into question.acaPoints
    this.msg1 = 'answer choices set to 1-8. '
    this.questionsIn[this.qx].aca = []
    this.questionsIn[this.qx].aca[0] = '1'
    this.questionsIn[this.qx].aca[1] = '2'
    this.questionsIn[this.qx].aca[2] = '3'
    this.questionsIn[this.qx].aca[3] = '4'
    this.questionsIn[this.qx].aca[4] = '5'
    this.questionsIn[this.qx].aca[5] = '6'
    this.questionsIn[this.qx].aca[6] = '7'
    this.questionsIn[this.qx].aca[7] = '8'
    this.questionsIn[this.qx].acaPointVals   = []
    this.questionsIn[this.qx].acaPointVals[0] = 1
    this.questionsIn[this.qx].acaPointVals[1] = 2
    this.questionsIn[this.qx].acaPointVals[2] = 3
    this.questionsIn[this.qx].acaPointVals[3] = 4
    this.questionsIn[this.qx].acaPointVals[4] = 5
    this.questionsIn[this.qx].acaPointVals[5] = 6
    this.questionsIn[this.qx].acaPointVals[6] = 7
    this.questionsIn[this.qx].acaPointVals[7] = 8
    this.saveQuestion() // 
    let elId: HTMLInputElement = 
      document.getElementById('htmlIdBottomOfPage') as HTMLInputElement
    elId.scrollIntoView();
  }

  delAnswerChoice(ax){
    console.log('running delChoice. qx: ',this.qx,'ax: ',ax)
    // delete-splice from the aca from this question
    this.questionsIn[this.qx].aca.splice(ax,1)
    this.questionsIn[this.qx].acaPointVals.splice(ax,1)    
    this.saveQuestion() // 
  }

  jumpToWwq(){
    console.log('running jumpToWwq in wwqd component')
    this.wwqJumpOut.emit()
  } // end jumpToWwq
  
  buildQuestionObj(){
    this.questObj = 
    {
      cust: this.custIn,
      qid: this.qidIn,
      questNbr: this.questionsIn[this.qx].questNbr,
      questSeq: this.questionsIn[this.qx].questSeq,
      questTxt: this.questionsIn[this.qx].questTxt,
      preQuest: this.questionsIn[this.qx].preQuest,
      aca:      this.questionsIn[this.qx].aca,
      acaPointVals: this.questionsIn[this.qx].acaPointVals,
      accum:   this.questionsIn[this.qx].accum,
      subset:  this.questionsIn[this.qx].subset,
      acaFrame:  this.questionsIn[this.qx].acaFrame
    }
    // console.table(this.questObj)
  }

  launchQtAddQuestion() {
    console.log('running  wwqd launchQtAddQuestion')
    api.qtWriteQuestion(this.questObj)
    .then ((qtDbRtnObj) => { this.qtDbDataObj = qtDbRtnObj.data})
    // return from this on-the-fly function is implied  
    .catch(() => {
      console.log('launchQtAddQuestion error. questObj:' +  this.questObj)
    })
  } //end launchQtAddQuestion
   
  launchQtDeleteQuestion() {
    console.log('running  wwqd launchQtDeleteQuestion')
    api.qtDeleteQuestion(this.questObj)
    .then ((qtDbRtnObj) => {this.qtDbDataObj = qtDbRtnObj.data})
    // return from this on-the-fly function is implied  
    .catch(() => {
      console.log('launchQtDeleteQuestion error. questObj:' +  this.questObj)
    })
  } //end launchQtDeleteQuestion
 
  launchQtUpdateQuestion() {
  console.log('running  wwqd launchQtUpdateQuestion')
  api.qtUpdateQuestion(this.questObj)
  .then ((qtDbRtnObj) => {this.qtDbDataObj = qtDbRtnObj.data})
  // return from  on-the-fly function is implied. 
  .catch(() => {
    console.log('launchQtUpdateQuestion error. questObj:', this.questObj )
  })
  } //end launchQtUpdateQuestion
 
} // end class QncwwqdComponent