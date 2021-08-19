import { Component, OnInit, Input, 
         EventEmitter, Output } from '@angular/core';
import api from 'src/utils/api'

@Component({
  selector: 'app-qncwwg',
  templateUrl: './qncwwg.component.html'
})
export class QncwwgComponent implements OnInit {
  constructor() {}
  @Input() subsetsQncWwg
  @Input() rulesIn  
  @Input() subsetIn
  @Input() questionsIn
  @Input() subsetsIn
  @Output() qncJumpOut  = new EventEmitter()
  @Output() wwqJumpOut  = new EventEmitter() 
  @Output() wwrJumpOut  = new EventEmitter() 
  @Output() wwgdJumpOut = new EventEmitter() 
  msg1 = '?'
  state = {buttonText: "Initial text" } 
  subsetArray = []

  ngOnInit() {
    this.buildSubsetArrayFromSubsetsIn()
    this.countQuestionsPerGroup()
    this.initStuff()
    this.msg1 = 'Groups shown.'
  } // end ngOnInit

  buildSubsetArrayFromSubsetsIn(){
    for( let i=0;i<this.subsetsIn.length;i++){
      this.subsetArray.push(
        { "subset" : this.subsetsIn[i]
         ,"qCount" :  0
        }
      )
  
    }
  }

  initStuff(){
    //console.log('running initStuff')
    //window.history.forward() //hack for browser back?
    // Tell your browser to quit this component on back button.
    // Update state, history, and user interface
   // Connect your button to the handler above to trigger on click
//this.but27 = document.querySelector("button")
// this.setEventListenerWithDelay()
this.setPopState() //billy learn and fix back button
    // this.initRulesArrayThisGroup()
    // if (this.rulesArrayThisGroup.length>0){
    //   console.log('there are rules')
    //   console.table(this.rulesArrayThisGroup)
    //   // this.anyRulesNo = false // tied to radio button
    //   // this.anyRulesYes = true // tied to radio button
    //   // this.newRuleButDisabledYn = false
    //   // this.wordsThatPrefaceRules = 
    //   //   'rule(s) that influence asking questions in group: ' 

    // }else{
    //   //console.log('there are no rules')
    //   // this.anyRulesNo = true // tied to radio button
    //   // this.anyRulesYes = false // tied to radio button
    // }

    // this.setCursorOnhtmlIdSubsetInputWithDelay()
    
    // if (this.subsetIn == 'NewGroupName1'){
    //   this.radioButsDisabledYn = true
    //   this.msg1 = 'first, rename this new group.'
    // }
    
  } // end initStuff

  detailButClicked(subset,sx){this.jumpToWwgd(subset,sx)}
  jumpToWwgd(subset,sx){this.wwgdJumpOut.emit()}
  jumpToWwr(){this.wwrJumpOut.emit()}
  jumpToWwq(){this.wwqJumpOut.emit()}
  jumpToQnc(){this.qncJumpOut.emit()}

  setPopState(){
    console.log('running wwg setPopState')
    window.onpopstate = function (ev) {  
      console.log('running window.onpopstate')
      //this.doneWwg() // ??billy?
    }
  } // end setPopState


  countQuestionsPerGroup(){
    let qCnt = 0
    for (let i = 0; i<this.subsetArray.length; i++){
      qCnt = this.questionsIn
      .filter(q => q.subset==this.subsetArray[i].subset).length
      this.subsetArray[i].qCount = qCnt
    } 
  } // end countQuestionsPerRule
  
} // end export class
