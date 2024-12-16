import { Component, OnInit, Input, 
  EventEmitter, Output } from '@angular/core' 
import colSortFilt from '../../utils/colSortFilt'

@Component({
  selector: 'app-qncwwr',
  templateUrl: './qncwwr.component.html' 
})
export class QncwwrComponent implements OnInit {
  // rulesArray = []
  msg1 = '?'
  constructor() { }
  @Input() rulesIn:any
  @Input() questionsIn:any
  @Input() subsetsIn:any
  @Input() filterResetIn:any
  @Output() ruleNbrOut = new EventEmitter() 
  @Output() wwrdJumpOut = new EventEmitter() 
  symArUp    = '\u{2191}'
  symArDn    = '\u{2193}'
  symFilt    = '\u{2207}'  
  colHeadSf = false
  filterInOut = 'in'
  colSortByArray = []

  ngOnInit() {
    console.log('running wwr ngOnInit')
    let x = colSortFilt.colSort(this.rulesIn,'ruleNbr','des','rule nbr')
    if (this.rulesIn.length == 0){
      this.msg1 = 'No rules exist yet for this Qna.'
    } else {
      this.msg1 = 'rule list'
      this.countQuestionsPerRule()
    }
    
    if (this.rulesIn.length == 0) {
      this.msg1 = 'No rules exist. Click the add button.'
    }

    if (this.filterResetIn) {
      this.resetRuleFilter()
    }

  } // end ngInit

  colHeadClick(c:any){
    // hide/show sort & filter icons in the table header (lower part)
    if (this.colHeadSf == true ) {
      this.colHeadSf = false
      if (this.msg1 =='click an icon to sort or filter.') {this.msg1=''}
    } else {
      this.colHeadSf = true
      this.msg1 = 'click an icon to sort or filter.'
    }
  }// end colHeadClick

  colSort(fieldName:any,ascDes:any,fieldMsg:any){
    let colSortOut = colSortFilt.colSort(this.rulesIn,fieldName,ascDes,fieldMsg)
    this.rulesIn = colSortOut[0] // not really needed cuz shallow/deep copy rules
    this.msg1    = colSortOut[3]
  } // end colSort

  colFilt(fn:any,pt:any){ //parms fieldname and prompt text
    console.log('running colFilt ', fn, pt)
    let filtWord = prompt('Filter ' + pt)
    this.resetRuleFilter()
    let colFiltOut = colSortFilt.colFilt(this.rulesIn,fn,pt,filtWord)
    this.rulesIn = colFiltOut[0] // not really needed cuz shallow/deep copy rules
    this.msg1   = colFiltOut[1]
  } // end colFilt 

  addButClick(){
    console.log('running wwr addButClick')
    this.ruleNbrOut.emit(-1) //-1  no rules yet
    this.wwrdJumpOut.emit()
  }  // end addButClick

  showHideHelp(){}
  doneWwr(){}

  detailButClick(ruleNbrParmIn:any){
    console.log('running wwr detailButClick:',ruleNbrParmIn)
    //  jump out of wwsr and tell caller what we were working on
    this.ruleNbrOut.emit(ruleNbrParmIn) 
    this.wwrdJumpOut.emit()   
  }

  countQuestionsPerRule(){
    console.log('running countQuestionsPerRule')
    let qCnt = 0
    for (let i = 0; i<this.rulesIn.length; i++){
      qCnt = 0
      //=== mostly works, duznt catch case misMatch
      for (let j = 0; j<this.questionsIn.length; j++) {
        for(let k = 0; k<this.questionsIn[j].accum.length; k++) {
          if (this.questionsIn[j].accum[k] == this.rulesIn[i].accum) {
            qCnt = qCnt + 1
          } // end if
        } //end inner for
      } // end middle for
      //===
      this.rulesIn[i].questCount = qCnt.toString() //.padStart(3,'0') 
    }  // end outer for
  } // end countQuestionsPerRule

  resetRuleFilter(){  
    console.log('running resetRuleFilter')    
    for (let i = 0; i < this.rulesIn.length; i++) {
      this.rulesIn[i]['filterInOut'] = 'in'  
    }
  } // end resetRuleFilter

} // end of export component