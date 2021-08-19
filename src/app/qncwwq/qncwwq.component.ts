import { Component, OnInit, Input,  
         EventEmitter, Output } from '@angular/core'
import api from 'src/utils/api'
// billy bug, mar1. filter scoreboard by 'm'
// jump to wwqd.  shows more questions on wwqd than wwq.
@Component({
  selector: 'app-qncwwq',
  templateUrl: './qncwwq.component.html'
})
export class QncwwqComponent implements OnInit {
  constructor() { }
  @Input() custIn
  @Input() qidIn
  @Input() questionsIn
  @Input() questionsIn2
  @Input() rulesIn
  @Output() qncJumpOut = new EventEmitter()
  @Output() wwqdJumpOut = new EventEmitter()
  //@Output() wwgJumpOut = new EventEmitter()
  //@Output() wwrJumpOut = new EventEmitter()
  @Output() wwqQuestOut = new EventEmitter()
  @Output() wwqQuestArray2Out = new EventEmitter()
 
  questArray2 = []
  questArray3 = [] 
  rulesArrayThisSubset = []
  questArrayMingo = [] // temp test, get questions from faunaDb
  symArUp    = '\u{2191}'
  symArDn    = '\u{2193}'
  symFilt    = '\u{2207}'  
  colHeadSf = false
  msg1 = '?.'
  colSortByArray = []
  ngOnInit() {
    //this.msg1 = 'loading Questions...'
    this.msg1 = 'Questions shown.'
    console.log('running wwq ngOnInit============')
    //console.table(this.questionsIn)
    //console.table(this.questionsIn2)
    if (this.questionsIn2.length > 0) {
      this.questArray2 = this.questionsIn2
    } else {
      this.questArray2 = this.questionsIn
    }
    console.log('cust:',this.custIn)
    console.log('qid:',this.qidIn)
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
    
    this.questArray2.sort((a, b) => { 
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
            if (a[prop] > b[prop]) { retval= -1 * neg1OrPos1}
            if (a[prop] < b[prop]) { retval= +1 * neg1OrPos1}
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
      this.rq()
    } else {
      this.colFiltPartB(fn, filtWord) // set questions3 array
      this.questArray2 = this.questArray3 // billy temp.  need array strategy.
      this.msg1 = 'question list filtered.'
    }
  } // end colFilt 

  colFiltPartB(fn,fw){ // field name, filter word
  console.log('running colFiltPartB',fn,fw)
  this.questArray3 = this.questionsIn2.filter(function(q){
    if (typeof(q[fn]) == 'string') {
      //return q[fn] == fw       // compare exact value not wanted
      return q[fn].includes(fw)  // compare partial value OK
    } // end if typeof string
    if (typeof(q[fn]) == 'object') { //  q-field is an object
      for (let i = 0; i < q[fn].length; i++) {
          if(q[fn][i].includes(fw) ) { // partial match OK
            return true
          }
      }
      return false // got here after comparing everything. 
    }  
  }) // end .filter 

  } // end colFiltPartB

  detailButClicked(q){
    console.log('running wwq detailButClicked:',q)
     //  jump out of wwq and tell caller quests we are working on
    this.wwqQuestOut.emit(q) 
    this.wwqQuestArray2Out.emit(this.questArray2)
    this.wwqdJumpOut.emit()
  }

  jumpToQnc(){
    console.table(this.questArray2)
    console.log('running jumpToQnc')
    this.wwqQuestArray2Out.emit(this.questArray2)
    this.qncJumpOut.emit()
  }

  //jumpToWwg() {this.wwgJumpOut.emit()}
  //jumpToWwr() {this.wwrJumpOut.emit()}


  launchQtReadQuestions = (ev) => {
    // billy, this is never called?
    // already have questions in arrays?
    console.log('running launchQtReadQuestions')
    api.qtReadQuestions(this.custIn,this.qidIn)
    .then 
        (   (qtDbRtnObj) => 
          {
            console.log(' running .then of api.qtReadQuestions') 
            console.table(qtDbRtnObj)
            this.buildQuestArray(qtDbRtnObj) 
          }
        )
        .catch((ev) => {  // api.qtReadQuestions returned an error 
          console.log('api.qtReadQuestions error.' + ev)
        })
  } //end LaunchQtReadQuestions

  launchQtReadRules = (ev) => {
    console.log('running launchQtReadRules')
    api.qtReadRules(this.custIn,this.qidIn)
    .then 
        (   (qtDbRtnObj) => 
          {
            console.log(' running .then of api.qtReadRules') 
            this.buildQuestArray(qtDbRtnObj) 
          }
        )
        .catch((ev) => {  // api.qtReadRules returned an error 
          console.log('api.qtReadRules error.' + ev)
        })
  } //end LaunchQtReadRules 

  buildQuestArray(dbObj){
    // billy, why is this thing run twice from .then's?
    console.log('running wwq buildQuestArray')
    // strip off fauna wrapper stuff from , yield a quest array
    // take qtDbObj from database and write to mingo array.
    // get here after .then of reading db,so qtDbObj is ready to use.
    this.questArrayMingo.length = 0 //blank out array, then load it
    for (let i = 0; i < dbObj.length; i++) {
      this.questArrayMingo.push(dbObj[i].data)
    } 
    console.table(this.questArrayMingo)
  }

  rq(){     //reset question arrays
    this.questArray2  = this.questionsIn  
    this.questArray3  = this.questionsIn  
    this.questionsIn2 = this.questionsIn
    this.msg1 = 'Filter is reset.'
    this.colSortByArray = []
  }

  testClunk(){
    let obj1 = {  
    fruit: 'banana',
    color: 'yellow'
    }
    // the array should be sorted first, like
    Object.entries(obj1).sort((a, b) => b[0].localeCompare(a[0]))
    for (let [obj1KeyName, obj1Value] of Object.entries(obj1)) {
      console.log(`${obj1KeyName}: ${obj1Value}`) 
      console.log(obj1KeyName) // 'fruit'
      console.log(obj1Value)   // 'banana'
    }
  } //end testClunk

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

// colFilt and colSort apply to the higher level arrays
// that contain a list-of-questions.
// questionsIn is the bigger list, unsorted, unfiltered, passed into wwq.
// questionsIn2 is a sorted and filterd shadow of questionsIn. 
// questionsIn & questionsIn2 are  passed between components.
// we also have shadow-of-a-shadow questArray2 and questArray3.
// questArray2 is like a temp shadow of questionsIn, used on screen.
// questArray3 is like a temp shadow of questArray2 for filtering.
// interface between wwq component and wwqd component relies on questArray2.
// now why we need so many arrays?  what about questArray3 ?
// --- wq reset questions button overlays all arrays from questionsIn
// --
// Mar 2021 we might need a better parent/shadow array strategy.
// questionsIn should be left pristine.
// questionsIn2 should be a sorted/filter shadow of questionsIn
// questArray2 and questArray3 are temp local shadows, that
// that provide for easy sort/filter.
// 
// questArray3 is perhaps the filtered version of questarray2,
// where we dont have to sort again.  
// maybe questArray3 would be better as a temp var.
// see which other components use the arrays.
// maybe we need to explain the array-passing for components,
// that is controlled by app.component.
// we also need to explain the output arrays, like:
// wwqQuestOut wwqQuestArray2Out    
