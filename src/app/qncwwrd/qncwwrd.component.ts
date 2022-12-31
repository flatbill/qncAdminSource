import { Component, OnInit, Input } from '@angular/core'
import { EventEmitter, Output     } from '@angular/core'
import apiFauna from 'src/utils/apiFauna'

@Component({
  selector: 'app-qncwwrd',
  templateUrl: './qncwwrd.component.html'
})
export class QncwwrdComponent implements OnInit {
  constructor() { }
  @Input() custIn
  @Input() qidIn
  @Input() ruleNbrIn
  @Input() rulesIn  
  @Input() groupsIn  
  @Input() scoreboardsIn
  @Input() questionsIn

  @Output() wwrJumpOut = new EventEmitter()
  msg1 = 'edit rule details.'
  rx = -1
  gx = -1
  ruleObj = {}
  qtDbDataObj = {} 
  pendingAddRx = -1
  symDropDown    = '\u{25BC}'  
  verifyDelete = false
  fieldsDisabled = false
  operArray = [
    'less than'
    ,'equal to'
    ,'greater than'
  ]
  showScoreboardList = false
  showGroupList = false
  groupRound = '?'
  groupQuestCount = '?'
  wordAnswerOrAnswers = 'answers'
  wordQuestionOrQuestions = 'questions'
  wordsAboutGroup = 'group words'
  ngOnInit() {
    console.log('running wwrd ngOnInit')
    if (this.ruleNbrIn==-1){ // he clicked add new on list screen.
      this.addButClick()
      this.rx = 0
    }  
    this.findRuleIx()
    this.setRuleInfo()
    this.setGroupInfo()
    this.fieldValidations()
  } // end ngOnInit


  findRuleIx(){
    console.log('running findRuleIx')
    this.rx = this.rulesIn
    .findIndex(r => r.ruleNbr == this.ruleNbrIn)
  }

  setRuleInfo(){
    console.log('running setRuleInfo')
    // this is part of the info about this rule.  see html.
    if (this.rulesIn[this.rx].questCount==1) {
      this.wordAnswerOrAnswers = 'answer'
      this.wordQuestionOrQuestions = 'question adds'
    } else {
      this.wordAnswerOrAnswers = 'answers'
      this.wordQuestionOrQuestions = 'questions add'
    }  // end if
  } // end setRuleInfo

  setGroupInfo(){
    console.log('running setGroupInfo')
        // count questions per group:
        let qCnt = 0
        for (let i = 0; i<this.groupsIn.length; i++){
           qCnt = this.questionsIn
            .filter(q => q.subset.toLowerCase().trim() == this.groupsIn[i].groupName.toLowerCase().trim())
            .length
          this.groupsIn[i].qCount = qCnt
        } // end for
        console.log('90')
        console.table(this.groupsIn)
    
    this.gx = this.groupsIn
    .findIndex(g => g.groupName == this.rulesIn[this.rx].subset)
    if (this.gx > -1) {
      this.groupRound = this.groupsIn[this.gx].seq
      this.groupQuestCount = this.groupsIn[this.gx].qCount 
      this.wordsAboutGroup = ' questions and is in round '

    } else {
      this.groupRound = ''
      this.groupQuestCount = '0'
      this.wordsAboutGroup = ' questions. This group does not exist'
    }
  } // end setGroupInfo

  prevButClick(){
    console.log('running prevButClick')
    this.msg1 = 'first rule shown.'
    let loopRx = this.rx
    while (loopRx > 0) {
      loopRx = loopRx - 1
      if (this.rulesIn[loopRx].rFilterInOut == 'in') {
        this.rx = loopRx
        this.msg1 = 'previous rule shown.'
        // this is a rec we want to show. rx is set.
        loopRx = 0 // lets exit the while loop
      }
    } // end while
    this.setRuleInfo()
    this.setGroupInfo()
    this.fieldValidations()
  } // end prevButClick

  nextButClick(){
    this.msg1 = 'last rule shown.'
    let loopRx = this.rx
    while (loopRx < this.rulesIn.length-1) {
      loopRx = loopRx + 1
      if (this.rulesIn[loopRx].rFilterInOut == 'in') {
        this.rx = loopRx
        this.msg1 = 'next rule shown.'
        // this is a rec we want to show. rx is set.
        loopRx = 9999 // lets exit the while loop
      }
    } // end while
    this.setRuleInfo()
    this.setGroupInfo()
    this.fieldValidations()
  } // end nextButClick

  // saveButClick(){
  //   console.log('running saveButClick')
  //   this.msg1 = ''
  //   this.saveRule('misc')
  // } // end saveButClick

  fieldValidations(){
    let x = this.validateScoreboard(this.rulesIn[this.rx].accum)
    let y = this.validateGroup(this.rulesIn[this.rx].subset)
  }

  saveRule(parmIn){
    console.log('7777777 running wwrd saveRule')

    if (parmIn=='add'){
      this.msg1 = 'New starter rule created. Ready for your changes.'
    } else {
      if (this.msg1.includes('autosaved')
      && this.msg1.includes(parmIn) ){
           this.msg1 = this.msg1 + '.' // autosaved same field again.
      }  else {
           this.msg1 = parmIn + ' changed. rule autosaved.'
      } // end inner if
    } // end outer if


    this.buildRuleObj() // uses current rx  billy fix
    if (this.pendingAddRx >= 0) {
      this.launchQtAddRule()
      this.pendingAddRx = -1
    } else {
      //  this is a changed rule:
      this.launchQtUpdateRule()
    }

  }  // end saveRule

  buildRuleObj(){
    this.ruleObj = 
    {
      cust: this.custIn,
      qid: this.qidIn,
      ruleNbr:    this.rulesIn[this.rx].ruleNbr,
      accum:      this.rulesIn[this.rx].accum,
      oper:       this.rulesIn[this.rx].oper,
      thresh:     this.rulesIn[this.rx].thresh,
      subset:     this.rulesIn[this.rx].subset
    }
    console.table(this.ruleObj)
  }

  addButClick(){
    console.log('running wwrd addButClick')
    this.msg1 = 'edit this new rule.'
    let newRuleNbr = '1'
    if (this.rulesIn.length > 0) {
      //  set new rule nbr to one bigger than max rule nbr
      let ruleNbrMax = 
        Math.max.apply(Math, this.rulesIn.map(function(r) { return r.ruleNbr }))
        newRuleNbr = (ruleNbrMax + 1).toString()  
    } //end if
    let newRuleScoreboardName = 'scoreboard1'
    let newRuleGroupName = 'group1'
    this.rulesIn.push(
      {
        cust: this.custIn,
        qid: this.qidIn,
        ruleNbr: newRuleNbr,
        accum:   newRuleScoreboardName,
        oper: 'greater than',
        thresh: 0,
        subset: newRuleGroupName
      }
      ) // end push
      console.log('wwrd 151 rulesIn:')
      console.table(this.rulesIn)
      this.rx = this.rulesIn.length - 1
      this.pendingAddRx = this.rx // when he hits save, we use this.
      this.saveRule('add') //auto save
      this.rulesIn[this.rx].rFilterInOut = 'in'
      this.ruleNbrIn = newRuleNbr
      this.fieldValidations()  // reset any prior rec fields marked as invalid.
      console.log('159 end of addButClick')
  } // end addButClick

  delButClick(){
    this.msg1=''
    this.verifyDelete = true
    this.fieldsDisabled = true
  } // end delButClick

  proceedWithDelete(){
    // delete rule from rule array.
    // call database api
    // figure out rx of the on-screen rule, 
    // and delete-splice it from array:
    this.msg1 = 'deleting...'
    this.verifyDelete=false
    this.fieldsDisabled = false
    let ruleNbrWork = this.rulesIn[this.rx].ruleNbr  
    this.rx = this.rulesIn
      .findIndex(q => q.ruleNbr == ruleNbrWork)
    //  delete the db rule
    this.buildRuleObj()
    this.launchQtDeleteRule()
    // delete the array rule:
    this.rulesIn.splice(this.rx,1) 
    // after he deletes a rule, show adjacent rule on screen.
    this.rx = this.rx + 1 
    if (this.rx > this.rulesIn.length -1 ) {
       this.rx = this.rulesIn.length -1  
     }
     this.msg1 = 'rule ' + ruleNbrWork + ' deleted.'
     if (this.rulesIn.length==0){
       //billy, maybe tell him nicer, that we will jump to the list screen.
       alert('no rules left. Leaving this screen.')
       this.wwrJumpOut.emit()
     }
   } // end proceedWithDelete

   cancelDelete(){
    this.verifyDelete = false
    this.fieldsDisabled = false
   } // end cancelDelete

  ruleScoreboardChg(newScoreboard,rx)  {
    console.log('running ruleScoreboardChg to ',newScoreboard)
    let validScoreboard = this.validateScoreboard(newScoreboard)
    if (!validScoreboard) {
      return 
    }

    this.rulesIn[rx].accum = newScoreboard.trim()
    this.saveRule('scoreboard')
  } // end ruleScoreboardChg

  ruleOperChg(newOper,rx) {
    console.log('running ruleOperChg to ', newOper)
    let validOper = this.validateOper(newOper)
    if (!validOper) {
      this.msg1 = 'oper invalid. '
      return 
    }
    
    this.rulesIn[rx].oper = newOper.trim()
    this.saveRule('oper')

  }

    validateScoreboard(newScoreboard){
    console.log('running validateScoreboard')
    let el = document.getElementById('ruleScoreboard')
    el.classList.remove('has-background-warning')

    if (newScoreboard.trim().length<1 ){ 
      el.classList.add('has-background-warning')
      this.msg1="Invalid Scoreboard.  Can't be blank."
      return false
    } // end if

    let position = 
    this.scoreboardsIn.map(function(s) { return s.scoreboardName })
    .indexOf(newScoreboard)
    if (position <0 ){  
      el.classList.add('has-background-warning')
      this.msg1="Invalid Scoreboard.  Not in scoreboard list."
      return false
    } // end if

    return true // fall here when all scoreboard validations are OK
  } // end validateScoreboard

  validateOper(newOper){
    console.log('running validateOper')
    let position = 
    this.operArray.map(function(a) { return a })
    .indexOf(newOper)
  if (position > -1){  
      return true
    } else {
      return false
    }
        // if (newOper == 'less than'
    // ||  newOper == 'less than or equal'
    // ||  newOper == 'equals'
    // ||  newOper == 'greater than'
    // ||  newOper == 'greater than or equal') {

  } // end validateOper

  validateThresh(newThresh){
    console.log('running validateThresh')
    let el = document.getElementById('ruleThresh')
    el.classList.remove('has-background-warning')

    if (Number(newThresh) >=0 && newThresh.trim().length>0 ){ 
      return true
    } else {
      el.classList.add('has-background-warning')
      this.msg1 = 'threshold invalid. Must be 0-99999'
      return false
    } // end if
  } // end validateThresh

  validateGroup(newGroup){
    console.log('running validateGroup')
    let el = document.getElementById('ruleGroup')
    el.classList.remove('has-background-warning')

    if (newGroup.trim().length<1 ){ 
      el.classList.add('has-background-warning')
      this.msg1="Invalid Group.  Can't be blank."
      return false
    } // end if

    let position = 
    this.groupsIn.map(function(s) { return s.groupName })
    .indexOf(newGroup)
    if (position <0 ){  
      el.classList.add('has-background-warning')
      this.msg1="Invalid Group.  Not in group list."
      return false
    } // end if

    return true // fall here when all group validations are OK
  } // end validateScoreboard

  screenFieldGotFocus(focusFieldParmIn){
    console.log('running screenFieldGotFocus',focusFieldParmIn)
    if (focusFieldParmIn == 'ruleScoreboard' || focusFieldParmIn == 'scoreboardListItem' ){
      this.showScoreboardList = true
    } else {
      this.showScoreboardList = false
    }  //end if

    if (focusFieldParmIn == 'ruleGroup' || focusFieldParmIn == 'groupListItem' ){
      this.showGroupList = true
    } else {
      this.showGroupList = false
    }  //end if

   } // end screenFieldGotFocus

   screenFieldLostFocus(whichField,ev){
     console.log('running screenFieldLostFocus',whichField)

     if (ev.relatedTarget == null){ // he is moving cursor off fields
      this.showScoreboardList = false
      this.showGroupList = false
     } // end if

    if (ev.relatedTarget != null
    && !ev.relatedTarget.id.includes('scoreboardListItem')) {
      // he is moving to a different input field
      this.showScoreboardList = false
    } // end if

    if (ev.relatedTarget != null
    && !ev.relatedTarget.id.includes('groupListItem')) {
        // he is moving to a different input field
        this.showGroupList = false
    }
  
   } // end screenFieldLostFocus


  operButClick(ruleOperParmIn,rx){
    console.log('running operButClick')
    console.log(ruleOperParmIn)
    this.ruleOperChg(ruleOperParmIn,rx)
  } //operButClick

  scoreboardChosen(newScoreboard,rx){
    console.log('running scoreboardChosen')
    this.showScoreboardList = false
    this.ruleScoreboardChg(newScoreboard,rx)
  } // end scoreboardChosen

  groupChosen(newGroup,rx){
    console.log('running groupChosen')
    this.showGroupList = false
    this.ruleGroupChg(newGroup,rx)
    this.setGroupInfo()
  } // end groupChosen


  ruleThreshChg(newThresh,rx) {
    console.log('running ruleThreshChg to ', newThresh)
    let validThresh = this.validateThresh(newThresh)
    if (!validThresh) {
      return 
    }

    this.rulesIn[rx].thresh = newThresh.trim()
    this.saveRule('threshold')
  }

  ruleGroupChg(newGroup,rx) {
    console.log('running ruleGroupChg to ',newGroup)
    let validGroup = this.validateGroup(newGroup)
    if (!validGroup) {
      return 
    }
    this.rulesIn[rx].subset = newGroup.trim()
    this.saveRule('group')
  }

  launchQtAddRule(){
    console.log('running  wwrd launchQtAddRule')
    apiFauna.qtWriteRule(this.ruleObj)
    .then ((qtDbRtnObj) => { this.qtDbDataObj = qtDbRtnObj.data})
    // return from this on-the-fly function is implied  
    .catch(() => {
      console.log('launchQtAddRule error. ruleObj:' +  this.ruleObj)
    })

  } // end launchQtAddRule

  launchQtDeleteRule(){
    console.log('running  wwrd launchQtDeleteRule')
    apiFauna.qtDeleteRule(this.ruleObj)
    .then ((qtDbRtnObj) => {this.qtDbDataObj = qtDbRtnObj.data})
    // return from this on-the-fly function is implied  
    .catch(() => {
      console.log('launchQtDeleteRule error. ruleObj:' +  this.ruleObj)
    })

  }  // end launchQtDeleteRule

  launchQtUpdateRule(){
    console.log('running  wwrd launchQtUpdateRule')
    apiFauna.qtUpdateRule(this.ruleObj)
    .then ((qtDbRtnObj) => {this.qtDbDataObj = qtDbRtnObj.data})
    // return from  on-the-fly function is implied. 
    .catch(() => {
      console.log('launchQtUpdateRule error. ruleObj:', this.ruleObj )
    })
  
  }
}
