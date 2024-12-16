import { Component, OnInit, Input } from '@angular/core'
import { EventEmitter, Output     } from '@angular/core'
import apiFauna from '../../../src/utils/apiFauna'
import apiSupabase from '../../../src/utils/apiSupabase'


@Component({
  selector: 'app-qncwwrd',
  templateUrl: './qncwwrd.component.html'
})
export class QncwwrdComponent implements OnInit {
  constructor() { }
  @Input() custIn:any
  @Input() qidIn:any
  @Input() ruleNbrIn:any
  @Input() rulesIn:any  
  @Input() groupsIn:any  
  @Input() scoreboardsIn:any
  @Input() questionsIn:any
  @Input() faunaOrSupabaseIn:any

  @Output() wwrJumpOut = new EventEmitter()
  msg1 = 'edit rule details.'
  rx = -1
  gx = -1
  ruleObj = {
    cust: '?',
     qid: '?',
     ruleNbr: '=0=',
      accum:  '=0=', 
      oper:   '>',
      thresh: 0,
      subset: '===',
      id: 0
  }
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
  supaFlds = {}
  // about supaRes and supResOnAdd  ( i hate typescript)
  // read,chg,del functions on netlify return 'data'  so they use supaRes
  // add function on netlify returns 'supabaseData' so it uses supaResOnAdd
  // in other words, I coded the functions differently. My Bad.
  //let { data } = await supabaseClient  ---- all functions do this.
  // let supabaseData = data //stupid add function does this.
  // see netlify functions in the netlify deploy area of playground.
  // source code for netlify functions were also downloaded Oct2024.
  // someday, make functions consistent.
  //  maybe move them to funcs.flyTechFree.com

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
  supaResOnAdd = {
    "supabaseData": [
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

  // supaDataArray =  [
  //   {
  //     "id": 1,
  //     "name": "Afghanistan"
  //   },
  //   {
  //     "id": 2,
  //     "name": "Albania"
  //   },
  //   {
  //     "id": 3,
  //     "name": "Algeria"
  //   }
  // ]
 
   

 
  // supaDataObj = {}

  // faunaDataObj = {}

  ngOnInit() {
    console.log('running wwrd ngOnInit')
    if (this.ruleNbrIn==-1) { // he clicked add new on list screen.
      this.addButClick()    
    } else {
       this.rx = this.rulesIn.findIndex((r:any) => r.ruleNbr == this.ruleNbrIn)
      this.setRuleInfo()
      this.setGroupInfo()
      this.fieldValidations()  
    }
  } // end ngOnInit

  findRuleIx(){
  } // end findRuleIx

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
      .filter((q:any) => q.subset.toLowerCase().trim() == this.groupsIn[i].groupName.toLowerCase().trim())
      .length
      this.groupsIn[i].qCount = qCnt
    } // end for
    
    this.gx = this.groupsIn.findIndex((g:any) => g.groupName == this.rulesIn[this.rx].subset)
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
    this.msg1 = 'first rule shown.' //might be overwritten below
    let loopRx = this.rx
    while (loopRx > 0) {
      loopRx = loopRx - 1
      if (this.rulesIn[loopRx].filterInOut == 'in') {
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
      if (this.rulesIn[loopRx].filterInOut == 'in') {
        this.rx = loopRx
        this.msg1 = 'next rule shown.'
        // this is a rec we want to show. rx is set.
        loopRx = 9999 // lets exit the while loop
      } // end if
    } // end while
    this.setRuleInfo()
    this.setGroupInfo()
    this.fieldValidations()
  } // end nextButClick


  fieldValidations(){
    let x = this.validateScoreboard(this.rulesIn[this.rx].accum)
    let y = this.validateGroup(this.rulesIn[this.rx].subset)
  }

  saveRule(){
    console.log('140 wwrd running  saveRule')
    this.msg1 = 'saving rule...'
    this.buildRuleObj() 
    if ( this.faunaOrSupabaseIn == 'fauna') {
      this.launchFaunaUpdateRule() }
    if ( this.faunaOrSupabaseIn == 'supabase') {
      this.supaFlds = this.ruleObj
      this.launchChgSupabase('qtRules',this.supaFlds)   
    }
    this.msg1 = 'rule saved.'
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
      subset:      this.rulesIn[this.rx].subset,
      id:          this.rulesIn[this.rx].id
  }
    // if (this.faunaOrSupabaseIn == 'supabase'){
    //   this.ruleObj['id'] = this.rulesIn[this.rx].id
    // } // end if supabase

    console.table(this.ruleObj)
  }  // end buildRuleObj

  async addButClick(){
    console.log('running wwrd addButClick')
    this.fieldsDisabled = true
    this.msg1 = 'adding a rule...'
    this.fieldsDisabled = true
    let newRuleNbr = '01'
    if (this.rulesIn.length > 0) {
      //  set new rule nbr to one bigger than max rule nbr
      let ruleNbrMax = 
        Math.max.apply(Math, this.rulesIn.map(function(r:any) { return r.ruleNbr }))
        newRuleNbr = (ruleNbrMax + 1).toString()  
    } //end if
    let newRuleScoreboardName = 'sb01'
    let newRuleGroupName = 'grp01'
    this.ruleObj = {
      cust: this.custIn,
      qid: this.qidIn,
      ruleNbr: newRuleNbr,
      accum:   newRuleScoreboardName,
      oper: 'greater than',
      thresh: 0,
      subset: newRuleGroupName,
      id: 0

    } // end set ruleObj

    this.rulesIn.push(this.ruleObj) 
    console.log('wwrd 151 rulesIn:')
    console.table(this.rulesIn)
    this.rx = this.rulesIn.length - 1
    if (this.faunaOrSupabaseIn=='fauna'){
      this.launchFaunaAddRule()}
    if (this.faunaOrSupabaseIn=='supabase'){
      this.supaFlds = this.ruleObj
      await this.launchAddSupabase('qtRules',this.supaFlds)
      // id is from supabase. wait for launchAddSupabase to finish.
      this.rulesIn[this.rx].id = this.supaResOnAdd.supabaseData[0].id
    } // end if 
    this.rulesIn[this.rx].filterInOut = 'in'
    this.ruleNbrIn = newRuleNbr
    this.fieldValidations()  // reset any prior rec fields marked as invalid.
    this.msg1 = 'new rule added.'
    this.fieldsDisabled = false
  } // end addButClick

  delButClick(){
    this.msg1=''
    this.verifyDelete = true
    this.fieldsDisabled = true
  } // end delButClick

  proceedWithDelete(){
    console.log('running proceedWithDelete')
    this.msg1 = 'deleting...'
    this.verifyDelete=false
    this.fieldsDisabled = false
    let ruleNbrWork = this.rulesIn[this.rx].ruleNbr  
    // this.rx = this.rulesIn.findIndex(q => q.ruleNbr == ruleNbrWork)
    this.buildRuleObj()
    this.ruleObj.id = this.rulesIn[this.rx].id //oct2024
    //  delete the db rule
    if (this.faunaOrSupabaseIn == 'fauna'){
      this.launchFaunaDeleteRule()
    } // end if fauna
    if (this.faunaOrSupabaseIn == 'supabase'){
      this.supaFlds = this.ruleObj
      console.log('287 rule obj:')
      console.table(this.ruleObj)
      this.launchDelSupabase('qtRules',this.supaFlds)    
    } // end if supabase

    // remove the rule from the rules array:
    this.rulesIn.splice(this.rx,1) 
    // after he deletes a rule, show adjacent rule on screen.
    // rx is almost set cuz splice was done.
    if (this.rx > this.rulesIn.length -1 ) {
       this.rx = this.rulesIn.length -1  
     }
    console.table(this.rulesIn)
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

  ruleScoreboardChg(newScoreboard:any,rx:any)  {
    console.log('running ruleScoreboardChg to ',newScoreboard)
    let validScoreboard = this.validateScoreboard(newScoreboard)
    if (!validScoreboard) { return  }

    this.rulesIn[rx].accum = newScoreboard.trim()
    this.saveRule()
  } // end ruleScoreboardChg

  ruleOperChg(newOper:any,rx:any) {
    console.log('running ruleOperChg to ', newOper)
    let validOper = this.validateOper(newOper)
    if (!validOper) {
      this.msg1 = 'oper invalid. '
      return 
    }
    
    this.rulesIn[rx].oper = newOper.trim()
    this.saveRule()

  }

  validateScoreboard(newScoreboard:any){
    console.log('running validateScoreboard')
    let el  = document.getElementById('ruleScoreboard') as HTMLElement 
    el.classList.remove('has-background-warning')

    if (newScoreboard.trim().length<1 ){ 
      el.classList.add('has-background-warning')
      this.msg1="Invalid Scoreboard.  Can't be blank."
      return false
    } // end if

    let position = 
    this.scoreboardsIn.map(function(s:any) { return s.scoreboardName })
    .indexOf(newScoreboard)
    if (position <0 ){  
      el.classList.add('has-background-warning')
      this.msg1="Invalid Scoreboard.  Not in scoreboard list."
      return false
    } // end if

    return true // fall here when all scoreboard validations are OK
  } // end validateScoreboard

  validateOper(newOper:any){
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

  validateThresh(newThresh:any){
    console.log('running validateThresh')
    let el = document.getElementById('ruleThresh') as HTMLElement 
    el.classList.remove('has-background-warning')

    if (Number(newThresh) >=0 && newThresh.trim().length>0 ){ 
      return true
    } else {
      el.classList.add('has-background-warning')
      this.msg1 = 'threshold invalid. Must be 0-99999'
      return false
    } // end if
  } // end validateThresh

  validateGroup(newGroup:any){
    console.log('running validateGroup')
    let  el = document.getElementById('ruleGroup') as HTMLElement 
    el.classList.remove('has-background-warning')

    if (newGroup.trim().length<1 ){ 
      el.classList.add('has-background-warning')
      this.msg1="Invalid Group.  Can't be blank."
      return false
    } // end if

    let position = 
    this.groupsIn.map(function(s:any) { return s.groupName })
    .indexOf(newGroup)
    if (position <0 ){  
      el.classList.add('has-background-warning')
      this.msg1="Invalid Group.  Not in group list."
      return false
    } // end if

    return true // fall here when all group validations are OK
  } // end validateScoreboard

  screenFieldGotFocus(focusFieldParmIn:any){
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

   screenFieldLostFocus(whichField:any,ev:any){
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

  operButClick(ruleOperParmIn:any,rx:any){
    console.log('running operButClick')
    console.log(ruleOperParmIn)
    this.ruleOperChg(ruleOperParmIn,rx)
  } //operButClick

  scoreboardChosen(newScoreboard:any,rx:any){
    console.log('running scoreboardChosen')
    this.showScoreboardList = false
    this.ruleScoreboardChg(newScoreboard,rx)
  } // end scoreboardChosen

  groupChosen(newGroup:any,rx:any){
    console.log('running groupChosen')
    this.showGroupList = false
    this.ruleGroupChg(newGroup,rx)
    this.setGroupInfo()
  } // end groupChosen

  ruleThreshChg(newThresh:any,rx:any) {
    console.log('running ruleThreshChg to ', newThresh)
    let validThresh = this.validateThresh(newThresh)
    if (!validThresh) {
      return 
    }

    this.rulesIn[rx].thresh = newThresh.trim()
    this.saveRule()
  }

  ruleGroupChg(newGroup:any,rx:any) {
    console.log('running ruleGroupChg to ',newGroup)
    let validGroup = this.validateGroup(newGroup)
    if (!validGroup) {
      return 
    }
    this.rulesIn[rx].subset = newGroup.trim()
    this.saveRule()
  }

  launchFaunaAddRule(){
    console.log('running  wwrd launchFaunaAddRule')
    apiFauna.qtWriteRule(this.ruleObj)
    .then ((qtDbRtnObj) => { this.qtDbDataObj = qtDbRtnObj.data})
    // return from this on-the-fly function is implied  
    .catch(() => {
      console.log('launchFaunaAddRule error. ruleObj:' +  this.ruleObj)
    })
  } // end launchFaunaAddRule

  launchFaunaDeleteRule(){
    console.log('running  wwrd launchFaunaDeleteRule')
    apiFauna.qtDeleteRule(this.ruleObj)
    .then ((qtDbRtnObj) => {this.qtDbDataObj = qtDbRtnObj.data})
    // return from this on-the-fly function is implied  
    .catch(() => {
      console.log('launchFaunaDeleteRule error. ruleObj:' +  this.ruleObj)
    })
  }  // end launchFaunaDeleteRule

  launchFaunaUpdateRule(){
    console.log('running  wwrd launchFaunaUpdateRule')
    apiFauna.qtUpdateRule(this.ruleObj)
    .then ((qtDbRtnObj) => {this.qtDbDataObj = qtDbRtnObj.data})
    .catch(() => {
      console.log('launchFaunaUpdateRule error. ruleObj:', this.ruleObj )
    })
  
  } //  end launchFaunaUpdateRule

  async launchAddSupabase(tbl:any,flds:any) {
    console.log('running launchAddSupabase.  flds:')
    console.table(flds)
    this.supaResOnAdd = await apiSupabase.addSupabase(tbl,flds)
    // this.supaDataArray = this.supaResOnAdd.supabaseData    
    // supaRes has mult components, one is a supabaseData array.
    // the first entry in the supabaseData array is the object.
    // we want this data cuz it has the new id.
  } // end launchAddSupabase

  async launchDelSupabase(tbl:any,flds:any) {
    console.log('running launchDelSupabase.  flds:')
    console.table(flds)
    this.supaRes = await apiSupabase.delSupabase(tbl,flds)
  } // end launchDelSupabase

  async launchChgSupabase(tbl:any,flds:any) {
    console.log('running launchChgSupabase.  flds:')
    console.table(flds)
    this.supaRes = await apiSupabase.chgSupabase(tbl,flds)
  }  // end launchChgSupabase

} // end export class