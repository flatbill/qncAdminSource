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
  // @Output() wwqJumpOut = new EventEmitter() 
  @Output() qncJumpOut = new EventEmitter() 
  // @Output() wwgJumpOut = new EventEmitter() 
  @Output() wwrdJumpOut = new EventEmitter() 


  ngOnInit() {
    //console.table(this.rulesIn)
    this.rulesArray = this.rulesIn
    if (this.rulesArray.length == 0){
      this.msg1 = 'No rules exist yet for this survey.'
    } else {
      this.msg1 = 'Rules Shown.'

      this.countQuestionsPerRule()
    }
  }

  jumpToQnc(){ this.qncJumpOut.emit() }
  // jumpToWwq(){ this.wwqJumpOut.emit() }
  // jumpToWwg(){ this.wwgJumpOut.emit() }
  jumpToWwrd(rule,rx){ this.wwrdJumpOut.emit() }
  showHideHelp(){}
  doneWwr(){}

  detailButClicked(rule,rx){
    this.jumpToWwrd(rule,rx)
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
