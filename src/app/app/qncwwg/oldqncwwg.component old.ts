// import { getParseErrors } from '@angular/compiler';
// import { not } from '@angular/compiler/src/output/output_ast';
import { Component, OnInit, Input, 
         EventEmitter, Output } from '@angular/core';
import apiFauna from 'src/utils/api'

@Component({
  selector: 'app-qncwwg',
  templateUrl: './qncwwg.component.html'
})
export class QncwwgComponent implements OnInit {
  constructor() {}
  // @Input('showQncWwg') showQncWwgName: boolean
  @Input() subsetsQncWwg
  @Input() rulesIn  
  @Input() subsetIn
  @Input() questionsIn
  @Output() qncJumpOut = new EventEmitter()
  @Output() rulesQncWwgOut = new EventEmitter() 
  @Output() wwqJumpOut = new EventEmitter() 
  @Output() wwrJumpOut = new EventEmitter() 
  @Output() wwgdJumpOut = new EventEmitter() 
  msg1 = 'add or delete rules for this group.'
  hisChosenRule = '?-?'
  anyRulesYes = false // tied to radio button
  anyRulesNo = true // tied to radio button
  rulesArrayThisGroup = []
  newRuleButDisabledYn = true
  radioButsDisabledYn = false
  newAccumName = 'newScoreboard00'
  wordsThatPrefaceRules = 'no rules (always ask questions in)'
  showDeleteRulesButTf = false
  ruleRowHead ='rule:'
  ruleRowThatWasBlurred = -1
  newRuleClicked = false
  state = {buttonText: "Initial text" } 
  ruleObj = {}
  rx = -1
      // rx should be rulesIn index
    // tx should be the rulesArrayThisGroup index
    // in html and component, change occurrences to tx 
  cust = '1' // where are we gonna get this from?
  qid = '2' // where are we gonna get this from?
  // (Event)  billy, (Event) parm is used for various qt functions,
  //          but it ain't really used.  maybe kill (Event) and (ev) 
  //          from these calls.
  // i think there are two flavors of events:
  // browser events, that chrome controls.  read those events in .ts 
  // node.js events, that server-to-server calls controls. event handler.
  //
  // billy, fix the back button somehow.
  //but27 = document.querySelector("button")
  ngOnInit() {
    //alert('just starting wwg')
    // console.log('rulesIn at ngInit:')
    // console.table(this.rulesIn)
    // console.log('subsetIn at ngInit:',this.subsetIn)
    this.initStuff()
    //this.setCursorOnhtmlIdSubsetInput()
  } // end ngOnInit

  initStuff(){
    //console.log('running initStuff')
    //window.history.forward() //hack for browser back?
    // Tell your browser to quit this component on back button.
    // Update state, history, and user interface
   // Connect your button to the handler above to trigger on click
//this.but27 = document.querySelector("button")
this.setEventListenerWithDelay()
this.setPopState() //billy learn and fix back button
    this.render27() 
    this.initRulesArrayThisGroup()
    if (this.rulesArrayThisGroup.length>0){
      console.log('there are rules')
      console.table(this.rulesArrayThisGroup)
      this.anyRulesNo = false // tied to radio button
      this.anyRulesYes = true // tied to radio button
      this.newRuleButDisabledYn = false
      this.wordsThatPrefaceRules = 
        'rule(s) that influence asking questions in group: ' 

    }else{
      //console.log('there are no rules')
      this.anyRulesNo = true // tied to radio button
      this.anyRulesYes = false // tied to radio button
    }

    this.setCursorOnhtmlIdSubsetInputWithDelay()
    
    if (this.subsetIn == 'NewGroupName1'){
      this.radioButsDisabledYn = true
      this.msg1 = 'first, rename this new group.'
    }
    
  } // end initStuff

  render27() {
    console.log('running wwg render27')
    this.meow = 'meowmeow'
    console.log(this.meow)
  // Change the look of your app based on state
  // this.but27.innerText = this.state.buttonText
  } // end render27

  async setEventListenerWithDelay()  {
    // hack to wait for a bit before setting handler
    await new Promise(resolve => setTimeout(()=>resolve(), 500))
    .then(()=>this.setEventHandler());
  } // end setEventListenerWithDelay

  setEventHandler(){
    console.log('running setEventHandler')
    //this.but27.addEventListener("click", this.handleButtonClick);
  } // end setEventHandler

  handleButtonClick() { 
    console.log('handleButtonClick')
    //this.but27.innerText = "I clicked the button!"
    window.history.pushState(this.state, null, "");
    this.render27();
  } // end handleButtonClick

  setPopState(){
    console.log('running setPopState')
    window.onpopstate = function (ev) {  
      console.log('running window.onpopstate')
      //this.doneWwg() // ??billy?
    }
  } // end setPopState

  async setCursorOnhtmlIdSubsetInputWithDelay() {
    // hack to wait for a bit before setting cursor
    await new Promise(resolve => setTimeout(()=>resolve(), 100))
    .then(()=>this.setCursorOnhtmlIdSubsetInput());
} // end setCursorOnhtmlIdSubsetInputWithDelay

  setCursorOnhtmlIdSubsetInput(){
    console.log('running setCursorOnhtmlIdSubsetInput')
    let el: HTMLInputElement = 
        document.getElementById('htmlIdSubsetInput') as HTMLInputElement
    el.classList.remove('is-info')
    el.classList.add('has-background-info-light')
    el.focus()

    if(this.subsetIn == 'NewGroupName1') {
      el.select() //  select all text. needs a delay to work.
      this.radioButsDisabledYn = true
    }
  } // end setCursorOnhtmlIdSubsetInput

  subsetFocused(){
    console.log('running subsetFocused')
    let el: HTMLInputElement = 
      document.getElementById('htmlIdSubsetInput') as HTMLInputElement
    el.classList.remove('is-info')
    el.classList.add('has-background-info-light')
    this.ruleChkBlur()
  } // end subsetFocused

  subsetBlurred(){
    console.log('running  subsetBlurred')
    let elId: HTMLInputElement = 
      document.getElementById('htmlIdSubsetInput') as HTMLInputElement
    elId.classList.add('is-info')
    elId.classList.remove('has-background-info-light')
  } // end subsetBlurred

  subsetChanged(ev){
    // he typed a new name for renaming a group 
    console.log('running subsetChanged')
    this.msg1 = 'subset renamed.'

    let subsetWas = this.subsetIn
    this.subsetIn = ev.target.value
    if (subsetWas == 'NewGroupName1'){
      // insert new group  into subsetIn array
      this.subsetsQncWwg.push(this.subsetIn)
      // billy, bug where you can create bad rules for NewGroupName1?
    }else{ 
      //rename existing subset in the array
      this.subsetsQncWwg[this.subsetsQncWwg.indexOf(subsetWas)] = this.subsetIn
      this.changeRulesForThisGroupToNewGroupName(subsetWas)
      this.changeQuestionsForThisGroupToNewGroupName(subsetWas)
    }
    this.radioButsDisabledYn = false //was disabled to force him to rename subset
  } // end subsetChanged

  newRuleClick(){ 
    // alert('running newRuleClick in qncwwg.' + "\r\n"
    // + ' creates a new rule, let him fill it in.'+ "\r\n"
    // + ' enables a SAVE button.'+ "\r\n"
    // + ' this new rule will be for one subset.'+ "\r\n"
    // + ' the subset might be recently created by newSubsetClick.'+ "\r\n"
    // )
    this.newRuleClicked = true
    this.ruleChkBlur()
    this.newRuleButDisabledYn = true //dont let him add another new rule yet.
    this.setNewAccumName()
    this.rulesIn.push(
      { 'cust': '1'
       ,'qid' : '2'
       ,"subset" : this.subsetIn
       ,"accum" :  this.newAccumName
       ,"oper" : ">"
       ,"thresh" : 0
      }
    )
    this.rx = this.rulesIn.length - 1
    console.log('--------------------rx: ', this.rx)
    this.buildRuleObj()
    this.launchQtWriteRule()
    this.rulesArrayThisGroup.push(this.rulesIn[this.rx])
    let tx = this.rulesArrayThisGroup.length - 1
    this.setRuleRowForEditWithDelay(tx) // hack to force delay
  }  // end newRuleClick
  
  setNewAccumName666(){
    for (let i = 0; i < this.rulesArrayThisGroup.length; i++) { 
      if(this.rulesArrayThisGroup[i].subset == this.subsetIn
      && this.rulesArrayThisGroup[i].accum ==  this.newAccumName) 
      {  
         let cci = parseInt(this.newAccumName.substring(12, 13)) + 1
         let ccs = '0' + cci.toString()
         this.newAccumName = 'newScoreboard' + ccs }
    }
  } // end setNewAccumName666 


  //===
  setNewAccumName(){
    let tx = this.rulesArrayThisGroup
    .findIndex(r => r.subset == this.subsetIn 
                 && r.accum == this.newAccumName)
    let cci = parseInt(this.newAccumName.substring(14, 15)) + 1
    let ccs = '0' + cci.toString()
    this.newAccumName = 'newScoreboard' + ccs 
  } // end setNewAccumName
  //===

  ruleClick(r,tx){
    //console.log('running ruleClick')
    this.ruleChkBlur()
    //accum is like a key to the rule rec.
    // get here if he clicked an existing rule,
    // or he is trying to add a new rule.
    //  might be a rules record,
    //  might be a literal 'new'.
    if (typeof(r) == 'object') {
      this.hisChosenRule = r.accum
      //alert('hisChosenRule'+this.hisChosenRule)
    }
    if (typeof(r) == 'string') {
      this.hisChosenRule = 'new'
    }
    this.setRuleRowForEdit(tx)
  } // end ruleClick

  ruleSaveClick(txParmIn){
    console.log('running ruleSaveClick, tx is:',txParmIn)
    // after successful save (.then) we want to show the checkmark:
    let elId = 'saveCheckMark' + txParmIn
    let el = document.getElementById(elId) as HTMLInputElement
    if (el) {  el.classList.remove("is-invisible") }
    this.newRuleButDisabledYn = false
    this.setRuleRowForNoEdit(txParmIn)
    //alert()
  } // end ruleSaveClick

  ruleSaveToArrays(){
    // billy, save is done elsewhere?

  }

  ruleSaveToDb(){
    this.rx = 666
    this.buildRuleObj()
    this.launchQtWriteRule()

  }

  ruleChkBlur(){
    // get here when ya click something.
    // if he blurred out of a rule,
    // then we already set ruleRowThatWasBlurred.
    // check it here, and set rule for noEdit.
    console.log('ruleChkBlur:', this.ruleRowThatWasBlurred)
    if (this.ruleRowThatWasBlurred > -1) {
      this.setRuleRowForNoEdit(this.ruleRowThatWasBlurred)
    }
    this.ruleRowThatWasBlurred = -1
  } // end ruleChkBlur

  ruleDeleteClick(txParmIn){
    console.log('running ruleDeleteClick')
    this.ruleChkBlur()
    let accumThisGroup = this.rulesArrayThisGroup[txParmIn].accum
    this.rulesArrayThisGroup.splice(txParmIn,1) //delete rule from rulesArrayThisGroup
    for (let i = 0; i < this.rulesIn.length; i++) { 
      if(this.rulesIn[i].subset == this.subsetIn
      && this.rulesIn[i].accum == accumThisGroup) 
      { 
        // delete rule from db:
        // billy launchQtDeleteRule fails on fetch? 
        this.rx = i
        this.buildRuleObj()
        this.launchQtDeleteRule(Event)
        //
        this.rulesIn.splice(i,1) //delete rule from rulesIn
      } //end if
  
    } // end for
    this.newRuleButDisabledYn = false
    this.ruleCountCheck()
  } // end ruleDeleteClick

  chkDeleteAllRules(yesNo){
    if (yesNo == 'yes') {
      this.deleteAllRules()
      this.setRadioWithDelay('always') //hack wake up
    }else{
      this.setRadioWithDelay('sometimes') //hack wake up
    }
    this.showDeleteRulesButTf = false
    this.ruleChkBlur()
  } // end chkDeleteAllRules

  deleteAllRules(){
    console.log('running deleteAllRules')
    this.rulesArrayThisGroup = []
    // now delete all rules for this subset in rulesIn
    let subsetTempVar = this.subsetIn,
       rulesTempArray = this.rulesIn
         .filter(function(r){
           return r.subset != subsetTempVar
         }) // end .filter
    this.rulesIn = rulesTempArray
  } // end deleteAllRules

  ruleCountCheck(){
    //alert('running ruleCountCheck')
    let c = this.rulesArrayThisGroup.length
    if (c > 0){
    }else{
    }
  } // end ruleCountCheck

  showHideHelp(){
    alert(
    'running showHideHelp in qncwwg.component.ts'+ "\r\n"
+ ' we are working with a specific group'+ "\r\n"
+ ' we want to tie the group to scoreboard(s)'+ "\r\n"
+ ' we want to see the group+scoreboard relationship'+ "\r\n"
+ ' we want to edit the rule (scoreboard-oper-thresh)'+ "\r\n"
+ ' we want him to notice that this controls'+ "\r\n"
+ ' whether this specific group of questions will be asked (rule).'+ "\r\n"
+ ' Capabilities:'+ "\r\n"
+ '  add a new rule. (and give it a name)'+ "\r\n"
+ '    delete a new rule.'+ "\r\n"
+ '    edit a rule. '+ "\r\n"
+ '  save subset info to database.'+ "\r\n"
+ '  save rule info to database.'+ "\r\n"
    )
    this.ruleChkBlur()
  } // end showHideHelp

  initRulesArrayThisGroup(){
    //alert('running initRulesArrayThisGroup')
    if (typeof(this.rulesIn) == 'string'){
      // rulesIn is text like 'NewGroupName1' 
    }else{
      // rulesIn is an array that may contain rules
      // clever way to pass subsetTempVar into .filter  (comma!)
      let subsetTempVar = this.subsetIn,
         rulesTempArray = this.rulesIn
         .filter(function(r){
           return r.subset == subsetTempVar
         }) // end .filter
      //rulesTempArray might have rules now, might be empty or undefined.
      if(typeof rulesTempArray == 'undefined'){
        this.rulesArrayThisGroup = []
        //alert('rules array is undefined')
      }else{
        this.rulesArrayThisGroup = rulesTempArray
      } // end if typeof
    }
  } // end initRulesArrayThisGroup

  changeRulesForThisGroupToNewGroupName(subsetWas){
    console.log('running wwg changeRulesForThisGroupToNewGroupName')
    // get here cuz he renamed a group.
    // look for any rules for the old group name.
    // if found, then rename the subset name to the new name.
    if(this.rulesArrayThisGroup.length > 0){
      //alert('yes, we have rules for that old subset')
      // replace all rulesIn with new name.
      for (let i = 0; i < this.rulesIn.length; i++) { 
        this.rulesIn[i].subset = this.subsetIn
        // console.log(this.rulesIn[i].subset)   
        // console.log(this.rulesIn[i].accum) 
      } // end for
    } // end if ruleArray length

    this.initRulesArrayThisGroup() //re-establish rulesArrayThisGroup

  } // end changeRulesForThisGroupToNewGroupName

  changeQuestionsForThisGroupToNewGroupName(subsetWas){
    console.log('running wwg  changeQuestionsForThisGroupToNewGroupName')
    // get here cuz he renamed a group.
    // look for  questions for the old group name.
    // if found, then rename the subset name to the new name.
    if(this.questionsIn.length > 0){ 
      //alert('yes, we have questions for that old subset')
      // replace all questions with new name.
      for (let i = 0; i < this.questionsIn.length; i++) { 
        if(this.questionsIn[i].subset==subsetWas){
          this.questionsIn[i].subset = this.subsetIn
          console.log('quest subset change to:',this.questionsIn[i].subset)
        }   
      } // end for
    } // end if questionsIn length

    this.initRulesArrayThisGroup() //re-establish rulesArrayThisGroup

  } // end changeQuestionsForThisGroupToNewGroupName

  radioButHit(rHit){
    console.log('running radioButHit ' +rHit)
    this.ruleChkBlur()
    if (rHit == 'noRules') {
      this.newRuleButDisabledYn = true
      this.setRadio('always')
      if(this.rulesArrayThisGroup.length>0){
        this.wordsThatPrefaceRules = 'rules for '
      }else{
        this.wordsThatPrefaceRules = 'no rules (always ask questions for)'
      }
      if (this.rulesArrayThisGroup.length>0){
        this.showDeleteRulesButTf = true
      }
    }
    
    if (rHit == 'yesRules') {
      this.newRuleButDisabledYn = false
      this.showDeleteRulesButTf = false
      this.setRadio('sometimes')

      if(this.rulesArrayThisGroup.length > 0){
        this.wordsThatPrefaceRules = 
          "here are conditional rules that influence asking "
      }else{
        this.wordsThatPrefaceRules = 
        "let's setup conditional rules that influence asking "

      }
    }
  } // end radioButHit

  radioAnyRulesFocused(){
    console.log('running radioAnyRulesFocused')
    this.ruleChkBlur()
  } // end radioAnyRulesFocused

  radioAnyRulesBlurred(){
    //console.log('running radioAnyRulesBlurred')
    this.showDeleteRulesButTf = false
  } // end radioAnyRulesBlurred

  async setRadioWithDelay(sometimesOrAlways)  {
    // hack to wait for a bit before setting radio
    await new Promise(resolve => setTimeout(()=>resolve(), 100))
    .then(()=>this.setRadio(sometimesOrAlways));
  } // end setRadioWithDelay

  setRadio(sometimesOrAlways){
    console.log('running setRadio to' + sometimesOrAlways)
    //let elId1 = 'htmlIdCheckboxNoRules'
    let el1: HTMLInputElement = 
      document.getElementById('htmlIdCheckboxNoRules') as HTMLInputElement
    //let elId2 = 'htmlIdCheckboxYesRules'
    let el2: HTMLInputElement = 
      document.getElementById('htmlIdCheckboxYesRules') as HTMLInputElement

    if(sometimesOrAlways == 'sometimes'){
      this.anyRulesNo = false 
      this.anyRulesYes = true
      el1.checked=false 
      el2.checked=true 
    }else{
      this.anyRulesNo = true 
      this.anyRulesYes = false
      el1.checked=true 
      el2.checked=false 
    }
  } // end setRadio

  async setRuleRowForEditWithDelay(rx) {
    // hack to wait a bit before calling setRuleRowForEdit
    await new Promise(resolve => setTimeout(()=>resolve(), 100))
    .then(()=>this.setRuleRowForEdit(rx))
  } // end setRuleRowForEditWithDelay

  setRuleRowForEdit(rx){
    console.log('running setRuleRowForEdit')
    // make a rule row appear edit-able by removing is-info class.
    let elId = 'accum' + rx
    let el: HTMLInputElement = 
    document.getElementById(elId) as HTMLInputElement
    if (el) {  el.classList.remove("is-info") }
    elId = 'oper' + rx
    el = document.getElementById(elId) as HTMLInputElement
    if (el) {  el.classList.remove("is-info") }
    elId = 'thresh' + rx
    el = document.getElementById(elId)as HTMLInputElement
    if (el) {  el.classList.remove("is-info") }

    elId = 'saveRuleBut' + rx
    el = document.getElementById(elId) as HTMLInputElement
    if (el) {  el.disabled = false     }

    elId = 'saveCheckMark' + rx
    el = document.getElementById(elId) as HTMLInputElement
    if (el) {  el.classList.add("is-invisible") }

    if (this.newRuleClicked) {
      // when adding a new rule, put the cursor in accum rx
      elId = 'accum' + rx
      el = document.getElementById(elId) as HTMLInputElement
      el.focus()
      this.newRuleClicked = false //reset
    }
    // duznt work:
    this.anyRulesNo = false //tied to radio button
    this.anyRulesYes = true //tied to radio button
    this.showDeleteRulesButTf = false
    //this.radioSet('sometimes')
    // alert('done setRuleRowForEdit ')

  } // end   setRuleRowForEdit 

  ruleBlur(rx){
    console.log('he blurred a rule row  '+ rx)
    //this.setRuleRowForNoEdit(rx)
    this.ruleRowThatWasBlurred = rx
  } // end ruleBlur

   setRuleRowForNoEdit(rx){
    console.log('running setRuleRowForNoEdit')
    // make it look like the rule row is not editable.
    let elId = 'accum' + rx
    let el: HTMLInputElement = 
    document.getElementById(elId) as HTMLInputElement
    if (el) {  el.classList.add("is-info") }
    elId = 'oper' + rx
    el = document.getElementById(elId) as HTMLInputElement
    if (el) {  el.classList.add("is-info") }
    elId = 'thresh' + rx
    el = document.getElementById(elId) as HTMLInputElement
    if (el) {  el.classList.add("is-info") }

    elId = 'saveRuleBut' + rx
    //alert('ready to check elId:'+ elId )
    el = document.getElementById(elId) as HTMLInputElement
    if (el) { 
      //alert('ready to disable el for'+ elId)
      el.disabled = true   
    }  

   } // end setRuleRowForNoEdit

  accumChange(ev,rx){
   //alert('running accumChange on ' +rx)
   let oldAccum = this.rulesArrayThisGroup[rx].accum
   let newAccum = ev.target.value
   this.rulesArrayThisGroup[rx].accum = newAccum
   this.updateRulesIn(oldAccum,newAccum,rx)  
  } // end accumChange

  operChange(ev,rx){
    //alert('running operChange on ' +rx)
    let newOper = ev.target.value
    let oldAccum = this.rulesArrayThisGroup[rx].accum
    let newAccum = this.rulesArrayThisGroup[rx].accum
    this.rulesArrayThisGroup[rx].oper = newOper
    this.updateRulesIn(oldAccum,newAccum,rx)
  } // end operChange

  threshChange(ev,rx){
    //alert('running threshChange on ' +rx)
    let newThresh = ev.target.value
    let oldAccum = this.rulesArrayThisGroup[rx].accum
    let newAccum = this.rulesArrayThisGroup[rx].accum
    this.rulesArrayThisGroup[rx].thresh = newThresh
    this.updateRulesIn(oldAccum,newAccum,rx)
  } // end threshChange

  updateRulesIn(oldAccum,newAccum,rx){
    console.log('runnnnnnnnnnnning updateRulesIn')
    this.deleteOldRuleAddNewRule(oldAccum,newAccum)  // work with db
    for (let i = 0; i < this.rulesIn.length; i++) { 
      if(this.rulesIn[i].subset == this.subsetIn
      && this.rulesIn[i].accum == oldAccum) 
        { 
          //alert('gonna replace some rulesIn fields')
          //alert('replacing existing accum: ' + this.rulesIn[i].accum)
          this.rulesIn[i].accum = newAccum
          this.rulesIn[i].thresh = this.rulesArrayThisGroup[rx].thresh
          this.rulesIn[i].oper = this.rulesArrayThisGroup[rx].oper
        } //end if
    } // end for
  }  // end updateRulesIn

  deleteOldRuleAddNewRule(oldAccum,newAccum){
    this.rx = this.rulesIn
    .findIndex(r => r.subset == this.subsetIn && r.accum == oldAccum)
    console.log('running deleteOldRuleAddNewRule--- old rx: ', this.rx)
    // billy get organized on what rx means at various times.
    // rx should be the rulesIn index, 
    // rt should be the rulesArrayThisGroup index
    this.buildRuleObj()
    this.launchQtDeleteRule(Event)
    // insert into db for newAccum:
    this.rx = this.rulesIn
    .findIndex(r => r.subset == this.subsetIn && r.accum == newAccum)
    console.log('running deleteOldRuleAddNewRule--- new rx: ', this.rx)
    this.buildRuleObj()
    this.launchQtWriteRule() 
  }

  jumpToWwq(){this.wwqJumpOut.emit()}
  jumpToWwr(){this.wwrJumpOut.emit()}
  
  jumpToQnc(){
    console.log('doneWwg')
    this.doneQncWwgOut.emit()
    this.rulesQncWwgOut.emit(this.rulesIn)
  } // end jumpToQnc

  buildRuleObj(){
    this.ruleObj = 
    {
      cust: this.cust,
      qid: this.qid,
      subset: this.rulesIn[this.rx].subset,
      accum: this.rulesIn[this.rx].accum,
      oper: this.rulesIn[this.rx].oper,
      thresh: this.rulesIn[this.rx].thresh
    }
    console.table(this.ruleObj)
  }

launchQtWriteRule = () => {
  console.log('running launchQtWriteRule')
  apiFauna.qtWriteRule(this.ruleObj)
  .then 
      (   (qtDbRtnObj) => 
        {
          console.log(' running .then of apiFauna.qtWriteRule') 
          // this.buildRulesArray(qtDbRtnObj) 
        }
      )
      .catch(() => {  // apiFauna.qtWriteRule returned an error 
        console.log('apiFauna.qtWriteRule error.' )
      })
} //end LaunchQtWriteRule

launchQtDeleteRule = (ev) => {
  console.log('running launchQtDeleteRule')
  apiFauna.qtDeleteRule(this.ruleObj)
  .then 
      (   (qtDbRtnObj) => 
        {
          console.log(' running .then of apiFauna.launchQtDeleteRule') 
          // this.buildRulesArray(qtDbRtnObj) 
        }
      )
      .catch((ev) => {  // apiFauna.qtWriteRule returned an error 
        console.log('apiFauna.launchQtDeleteRule error.' + ev)
      })
} //end LaunchQtWriteRule


} // end export class
