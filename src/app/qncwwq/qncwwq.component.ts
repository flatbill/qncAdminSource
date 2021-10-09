import { Component, OnInit, Input,  
         EventEmitter, Output } from '@angular/core'
import api from 'src/utils/api'
@Component({
  selector: 'app-qncwwq',
  templateUrl: './qncwwq.component.html'
})
export class QncwwqComponent implements OnInit {
  constructor() { }
  @Input() custIn
  @Input() qidIn
  @Input() questionsIn
  @Input() filterResetIn
  @Input() rulesIn
  @Output() wwqdJumpOut = new EventEmitter()
  @Output() questionNbrOut = new EventEmitter()
  @Output() questionsOut = new EventEmitter()
  symArUp    = '\u{2191}'
  symArDn    = '\u{2193}'
  symFilt    = '\u{2207}'  
  colHeadSf = false
  msg1 = '?.'
  colSortByArray = []
  addButOn = false   // controls add button 
  ngOnInit() {
    console.log('running wwq ngOnInit============')
    this.msg1 = 'question list '
    console.table(this.questionsIn)
    
    if (this.questionsIn.length == 0) {
      // no questions yet, so show add button
      this.addButOn = true
      this.msg1 = 'No questions exist. Click the add button.'
    }

    if (this.filterResetIn) {
      this.resetQuestionFilter()
    }
  }  //end ngOnInit

  colHeadClicked(c){
    // hide/show sort & filter icons in the table header (lower part)
    if (this.colHeadSf == true ) {
      this.colHeadSf = false
    } else {
      this.colHeadSf = true
      this.msg1 = 'click an icon to sort or filter.'
    }
  }// end colHeadClicked

  colSort(fieldName,ascDes){
    this.msg1 = 'questions sorted by' //append list of fields to msg1
    let commaOrPeriod = ','
    this.colSortByArray.push( {sortField: fieldName , ascOrDes: ascDes} )
    if (this.colSortByArray.length>3){ this.colSortByArray.splice(0,1) }
 
    for (let i = this.colSortByArray.length-1; i >= 0; i--) {
      if(i==0){commaOrPeriod='.'}
      this.msg1 = this.msg1 + ' ' + this.colSortByArray[i].sortField + commaOrPeriod
    }
    
    this.questionsIn.sort((a, b) => { 
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
            // console.log(a[prop].toString().padStart(4,'0'))
            // console.log(b[prop].toString().padStart(4,'0'))
            if (a[prop].toString().padStart(4,'0') 
               > b[prop].toString().padStart(4,'0')) { retval= -1 * neg1OrPos1}
            if (a[prop].toString().padStart(4,'0') 
               < b[prop].toString().padStart(4,'0')) { retval= +1 * neg1OrPos1}
            // if (a[prop] > b[prop]) { retval= -1 * neg1OrPos1}
            // if (a[prop] < b[prop]) { retval= +1 * neg1OrPos1}
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
      this.msg1 = 'filter cancelled. '
      this.resetQuestionFilter()
    } else {
      // this.colFiltPartB(fn, filtWord)  
      this.colFiltPartBB(fn, filtWord)  
      // this.questArray = this.questArray3 // billy temp.  need array strategy.
      this.msg1 = 'question list filtered.'
    }
  } // end colFilt 

  // colFiltPartB(fn,fw){ // field name, filter word
  // console.log('running colFiltPartB',fn,fw)
  // this.questArray3 = this.questionsIn.filter(function(q){
  //   if (typeof(q[fn]) == 'string') {
  //     //return q[fn] == fw       // compare exact value not wanted
  //     return q[fn].includes(fw)  // compare partial value OK
  //   } // end if typeof string
  //   if (typeof(q[fn]) == 'object') { //  q-field is an object
  //     for (let i = 0; i < q[fn].length; i++) {
  //         if(q[fn][i].includes(fw) ) { // partial match OK
  //           return true
  //         }
  //     }
  //     return false // got here after comparing everything. 
  //   }  
  // }) // end .filter 
  // } // end colFiltPartB
 
colFiltPartBB(fn,fw){ // field name, filter word
  console.log('running colFiltPartBB',fn,fw)
  for (let i = 0; i < this.questionsIn.length; i++) {
    this.questionsIn[i]['qFilterInOut'] = 'out' //default out
    if (typeof(this.questionsIn[i][fn]) == 'string') {
      if (this.questionsIn[i][fn].includes(fw)) {
        this.questionsIn[i]['qFilterInOut'] = 'in'
      } else {
        if (typeof(this.questionsIn[i][fn]) == 'object') { 
          for (let j = 0; j < this.questionsIn[i][fn].length; j++) {
            if(this.questionsIn[i][fn][j].includes(fw) ) { // partial match OK
              this.questionsIn[i]['qFilterInOut'] = 'in'
            } 
          }
        }  
      }  // end if  
    } // end if typeof
  } // end for
  console.table(this.questionsIn)
} // end colFiltPartBB
 
  addButClicked(){
    console.log('running addButClicked')
    this.questionNbrOut.emit(-1) //-1  no questions yet
    this.wwqdJumpOut.emit()
  }

  detailButClicked(qNbr){
    console.log('running wwq detailButClicked:',qNbr)
    //  jump out of wwq and tell caller quests we are working on
    this.questionNbrOut.emit(qNbr) 
    this.questionsOut.emit(this.questionsIn) 
    // this.questionsOut2.emit(this.questArray)
    this.wwqdJumpOut.emit()
  }

  // jumpToQnc(){
  //   console.table(this.questArray2)
  //   console.log('running jumpToQnc')
  //   this.wwqQuestArray2Out.emit(this.questArray2)
  //   this.qncJumpOut.emit()
  // }

  resetQuestionFilter(){  
    // console.log('running resetQuestionFilter')    
    // this.questArray2  = this.questionsIn  
    // this.questArray3  = this.questionsIn  
    // this.questionsIn2 = this.questionsIn
    //this.msg1 = 'Filter is reset.'
    for (let i = 0; i < this.questionsIn.length; i++) {
      this.questionsIn[i]['qFilterInOut'] = 'in'  
    }
    // this.colSortByArray = []
  }

} // end export class

// about sort & filter Mar1 2021
// wwq is a column list of questions.
// html shows 3 icons for each column header.
// icons for sort des, sort asc, filter.
// html calls functions for these icons, with parms.
// colSort function is controlled by an array of sortFields.
// colSortByArray is this list of sort fields.
// when a user clicks on a sort icon,
// we push a sortfields row into colSortByArray
// one of these parms is the sortField, which must be the real field name.
// colSort reads the sortfields in colSortByArray
// and then sorts on muliple fields, using javascript .sort
// because colSort uses an appended-to array of sortFields,
// each append adds another layer of sorting.  (another sortField)
// So, colSort uses his prior icon clicks as secondary sort fields.
// colSort is only 25 lines of code, and can be re-used in other projects.
// ---
// when a user clicks on a col heading filter icon, call colFilt function.
// html that calls colFlit must pass-in the filter field name.
// colFilt prompts for filter criteria, captures user input into filtWord.
// colFiltB then filters on filtWord, using javascript .filter
// ColFilt overlays the prior filter with a new filer.
// ---