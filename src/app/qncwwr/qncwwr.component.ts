import { Component, OnInit, Input, 
  EventEmitter, Output } from '@angular/core' 
import api from 'src/utils/api'


@Component({
  selector: 'app-qncwwr',
  templateUrl: './qncwwr.component.html' 
})
export class QncwwrComponent implements OnInit {
  rulesArray = []
  msg1 = '?'
  constructor() { }
  @Input() rulesIn  
  @Input() questionsIn
  @Input() subsetsIn
  //@Output() qncJumpOut = new EventEmitter() 
  @Output() ruleNbrOut = new EventEmitter() 
  @Output() wwrdJumpOut = new EventEmitter() 
  

  ngOnInit() {
    //console.table(this.rulesIn)

    // billy temp fixRuleNbr
    for (let i = 0; i < this.rulesIn.length; i++) {
      if (!this.rulesIn[i].hasOwnProperty('ruleNbr')) {
        this.rulesIn[i]['ruleNbr'] = this.fixRuleNbr()
      } // end if 
    } // end for
  
    this.rulesArray = this.rulesIn
    if (this.rulesArray.length == 0){
      this.msg1 = 'No rules exist yet for this survey.'
    } else {
      this.msg1 = 'Rules Shown.'
      this.countQuestionsPerRule()
    }
    // billy kill:
    // for (let i = 0; i < this.rulesArray.length; i++) {
    //   if (!this.rulesIn[i].hasOwnProperty('ruleNbr')) {
    //     this.rulesArray[i]['ruleNbr'] = '3377'
    //   } // end if
    // } // end for
  } // end ngInit

  fixRuleNbr() { //temp billy when rulearray entries dont yet have a ruleNbr
    console.log('running wwr fixRuleNbr')
    let ruleNbrMax = 0
    for (let i = 0; i<this.rulesIn.length; i++) {
      if (this.rulesIn[i].hasOwnProperty('ruleNbr')){
         if ( parseInt(this.rulesIn[i].ruleNbr) > ruleNbrMax)
           ruleNbrMax =  parseInt(this.rulesIn[i].ruleNbr)
      }
    }
    return (ruleNbrMax + 1).toString().padStart(3, '0')
  } //end fixRuleNbr 


  showHideHelp(){}
  doneWwr(){}

  detailButClicked(ruleNbrParmIn){
    console.log('running wwr detailButClicked:',ruleNbrParmIn)
    //  jump out of wwsr and tell caller what we were working on
    this.ruleNbrOut.emit(ruleNbrParmIn) 
    this.wwrdJumpOut.emit()   
  }

  countQuestionsPerRule(){
    let qCnt = 0
    for (let i = 0; i<this.rulesArray.length; i++){
      this.rulesArray[i].questCount = i * 11
      qCnt = this.questionsIn.filter(x => x.subset==this.rulesArray[i].subset).length
      this.rulesArray[i].questCount = qCnt
    } 
  } // end countQuestionsPerRule
} // end of export component
