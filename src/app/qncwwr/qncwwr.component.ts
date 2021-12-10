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
  @Input() filterResetIn
  @Output() ruleNbrOut = new EventEmitter() 
  @Output() wwrdJumpOut = new EventEmitter() 
  symArUp    = '\u{2191}'
  symArDn    = '\u{2193}'
  symFilt    = '\u{2207}'  
  colHeadSf = false
  rFilterInOut = 'in'
  colSortByArray = []
  addButOn = true   // controls jump to det screen

  ngOnInit() {
    console.log('running wwr ngOnInit')
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
      this.msg1 = 'rule list'
      this.countQuestionsPerRule()
    }
    console.table(this.rulesIn)
    
    if (this.rulesIn.length == 0) {
      this.msg1 = 'No rules exist. Click the add button.'
    }

    if (this.filterResetIn) {
      this.resetRuleFilter()
    }

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

  colHeadClicked(c){
    // hide/show sort & filter icons in the table header (lower part)
    if (this.colHeadSf == true ) {
      this.colHeadSf = false
    } else {
      this.colHeadSf = true
      this.msg1 = 'click an icon to sort or filter.'
    }
  }// end colHeadClicked

  colSort(fieldName,ascDes,fieldMsg){
    this.msg1 = 'rules sorted by' //append list of fields to msg1
    let commaOrPeriod = ','
    this.colSortByArray.push( {sortField: fieldName , ascOrDes: ascDes, fieldMsg: fieldMsg} )
    if ( this.colSortByArray.length == 2  && this.colSortByArray[1].sortField == this.colSortByArray[0].sortField ) {this.colSortByArray.splice(0,1)}
    if ( this.colSortByArray.length == 3  && this.colSortByArray[2].sortField == this.colSortByArray[0].sortField ) {this.colSortByArray.splice(0,1)}
    if ( this.colSortByArray.length == 3  && this.colSortByArray[2].sortField == this.colSortByArray[1].sortField ) {this.colSortByArray.splice(1,1)}
    if ( this.colSortByArray.length == 4  && this.colSortByArray[3].sortField == this.colSortByArray[2].sortField ) {this.colSortByArray.splice(2,1)}
    if ( this.colSortByArray.length == 4  && this.colSortByArray[3].sortField == this.colSortByArray[1].sortField ) {this.colSortByArray.splice(1,1)}
    // if ( this.colSortByArray.length == 4  && this.colSortByArray[3].sortField == this.colSortByArray[0].sortField ) {this.colSortByArray.splice(0,1)}
    if (this.colSortByArray.length>3){ this.colSortByArray.splice(0,1) }

    for (let i = this.colSortByArray.length-1; i >= 0; i--) {
      if(i==0){commaOrPeriod='.'}
      this.msg1 = this.msg1 + ' ' + this.colSortByArray[i].fieldMsg + commaOrPeriod
    }
    
    this.rulesIn.sort((a, b) => { 
      let retval      = 666  // set retval to 0, -1, +1
      let neg1OrPos1  = 666 // set neg1OrPos1 to -1 or +1
      let mySortField = '??'
      for (let i = this.colSortByArray.length-1; i >= 0; i--) {
        retval = 0
        mySortField = this.colSortByArray[i].sortField  
        if (this.colSortByArray[i].ascOrDes == 'des' )
          {neg1OrPos1 = -1} else {neg1OrPos1 = +1}   
        // -------------------------------------------- 
        for (let [prop, objVal] of Object.entries(a)) {
          if (prop === mySortField) {
            if (Number(a[prop]) && Number(b[prop]) ){ // comparing nbrs
              if (Number(a[prop]) > Number(b[prop])) { retval= -1 * neg1OrPos1}
              if (Number(a[prop]) < Number(b[prop])) { retval= +1 * neg1OrPos1}
            } else { // comparing a pair where at least one is not number
              if (a[prop] > b[prop]) { retval= -1 * neg1OrPos1}
              if (a[prop] < b[prop]) { retval= +1 * neg1OrPos1}
            } // end if Number
            if (retval !== 0) {break} // exit inner for loop early
          } // end if prop == mySortField
        } // end for loop
        // --------------------------------------------- 
      if (retval !== 0) {break} // exit outer for loop early
    } // end outer for loop
    return retval // is now 0 or -1 or +1
  }) // end inline function
  } // end colSort

  colFilt(fn,pt){ //parms fieldname and prompt text
    console.log('running colFilt ', fn, pt)
    let filtWord = prompt('Filter ' + pt)
    if (filtWord == null || filtWord == "") {
      // User cancelled the prompt.
      this.msg1 = 'filter reset. '
      this.resetRuleFilter()
    } else {
      // this.colFiltPartB(fn, filtWord)  
      this.colFiltPartBB(fn, filtWord)  
      // this.questArray = this.questArray3 // billy temp.  need array strategy.
      this.msg1 = 'rule list filtered.'
    }
  } // end colFilt 

colFiltPartBB(fn,fw){ // field name, filter word
  console.log('running colFiltPartBB',fn,fw)
  for (let i = 0; i < this.rulesIn.length; i++) {
    this.rulesIn[i]['rFilterInOut'] = 'out' //default out
    if (typeof(this.rulesIn[i][fn]) == 'string') {
      if (this.rulesIn[i][fn].includes(fw)) {
        this.rulesIn[i]['rFilterInOut'] = 'in'
      } else {
        if (typeof(this.rulesIn[i][fn]) == 'object') { 
          for (let j = 0; j < this.rulesIn[i][fn].length; j++) {
            if(this.rulesIn[i][fn][j].includes(fw) ) { // partial match OK
              this.rulesIn[i]['rFilterInOut'] = 'in'
            } 
          }
        }  
      }  // end if  
    } // end if typeof
  } // end for
  console.table(this.rulesIn)
} // end colFiltPartBB

addButClicked(){
  console.log('running wwr addButClicked')
  this.ruleNbrOut.emit(-1) //-1  no rules yet
  this.wwrdJumpOut.emit()
}


  showHideHelp(){}
  doneWwr(){}

  detailButClicked(ruleNbrParmIn){
    console.log('running wwr detailButClicked:',ruleNbrParmIn)
    //  jump out of wwsr and tell caller what we were working on
    this.ruleNbrOut.emit(ruleNbrParmIn) 
    this.wwrdJumpOut.emit()   
  }

  countQuestionsPerRule(){
    console.log('running countQuestionsPerRule')
    let qCnt = 0
    for (let i = 0; i<this.rulesArray.length; i++){
      qCnt = 0
      //=== mostly works, duznt catch case misMatch
      for (let j = 0; j<this.questionsIn.length; j++) {
        for(let k = 0; k<this.questionsIn[j].accum.length; k++) {
          if (this.questionsIn[j].accum[k] == this.rulesArray[i].accum) {
            qCnt = qCnt + 1
          } // end if
        } //end inner for
      } // end middle for
      //===
      this.rulesArray[i].questCount = qCnt.toString().padStart(3,'0') 
    }  // end outer for
  } // end countQuestionsPerRule

  resetRuleFilter(){  
    console.log('running resetRuleFilter')    
    for (let i = 0; i < this.rulesIn.length; i++) {
      this.rulesIn[i]['rFilterInOut'] = 'in'  
    }
    // this.colSortByArray = []
  }

} // end of export component
