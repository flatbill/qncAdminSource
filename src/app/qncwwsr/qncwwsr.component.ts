import { Component, OnInit, Input} from '@angular/core'  
import { EventEmitter, Output } from '@angular/core' 
import apiFauna from 'src/utils/apiFauna'

@Component({
  selector: 'app-qncwwsr',
  templateUrl: './qncwwsr.component.html'
})
export class QncwwsrComponent implements OnInit {
    rulesArray = []
    msg1 = '?'
    @Input() custIn  
    @Input() qidIn
    @Input() scoreboardsIn
    @Input() filterResetIn
    @Input() questionsIn
    @Output() scoreboardNbrOut = new EventEmitter() 
    @Output() scoreboardsOut = new EventEmitter() 
    @Output() wwsrdJumpOut = new EventEmitter() 
    colHeadSf = false
    // scoreboardsArray = []
    //tempSrArray = []
    colSortByArray = []
    symArUp    = '\u{2191}'
    symArDn    = '\u{2193}'
    symFilt    = '\u{2207}'  
    addButOn = true
  
    ngOnInit() {
      console.log('running wwsr ngOnInit')
      this.msg1 = 'scoreboard list '
      if (this.scoreboardsIn.length == 0) {
        this.msg1 = 'No scoreboards exist. Click the add button.'
      }
  
      if (this.filterResetIn) {
        this.resetScoreboardFilter()
      }
      console.log('questionsIn:')
      console.table(this.questionsIn)
      this.countQuestionsPerScoreboard()
      console.log('scoreboardsIn:')      
      console.table(this.scoreboardsIn)


    } // end ngOnInit

    detailButClicked(scoreboardNbrParmIn) { 
      console.log('running wwsr detailButClicked:',scoreboardNbrParmIn)
      //  jump out of wwsr and tell caller what we were working on
      this.scoreboardNbrOut.emit(scoreboardNbrParmIn) 
      this.scoreboardsOut.emit(this.scoreboardsIn)
      this.wwsrdJumpOut.emit()   
    }

    colHeadClicked(c){
      // hide/show sort & filter icons in  table header  
      if (this.colHeadSf == true ) {
        this.colHeadSf = false
      } else {
        this.colHeadSf = true
        this.msg1 = 'click an icon to sort or filter.'
      } // end if
    } // end colHeadClicked

    colSort(fieldName,ascDes,fieldMsg){
      this.msg1 = 'scoreboards sorted by' //append list of fields to msg1
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
        this.msg1 = this.msg1 + ' ' + this.colSortByArray[i].sortField + commaOrPeriod
      }
      
      this.scoreboardsIn.sort((a, b) => { 
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
  

    // colSortOld(fieldName,ascDes){
    //   this.msg1 = 'scoreboards sorted by' //append list of fields to msg1
    //   let commaOrPeriod = ','
    //   this.colSortByArray.push( {sortField: fieldName , ascOrDes: ascDes} )
    //   if (this.colSortByArray.length>3){ this.colSortByArray.splice(0,1) }
   
    //   for (let i = this.colSortByArray.length-1; i >= 0; i--) {
    //     if(i==0){commaOrPeriod='.'}
    //     this.msg1 = this.msg1 + ' ' + this.colSortByArray[i].sortField + commaOrPeriod
    //   }
      
    //   this.scoreboardsIn.sort((a, b) => { 
    //     let retval      = 666  // set retval to 0, -1, +1
    //     let neg1OrPos1  = 666 // set neg1OrPos1 to -1 or +1
    //     let mySortField = '??'
    //     for (let i = this.colSortByArray.length-1; i >= 0; i--) {
    //       retval = 0
    //       mySortField = this.colSortByArray[i].sortField
    //       if (this.colSortByArray[i].ascOrDes == 'des' )
    //         {neg1OrPos1 = -1} else {neg1OrPos1 = +1}   
    //       // -------------------------------------------- 
    //       for (let [prop, objVal] of Object.entries(a)) {
    //         if (prop === mySortField) {
    //           if (a[prop].toString().padStart(4,'0') > b[prop].toString().padStart(4,'0')) { retval= -1 * neg1OrPos1}
    //           if (a[prop].toString().padStart(4,'0') < b[prop].toString().padStart(4,'0')) { retval= +1 * neg1OrPos1}
    //           if (retval !== 0) {break} // exit inner for loop early
    //         } // end if prop == mySortField
    //       } // end for loop
    //       // --------------------------------------------- 
    //     if (retval !== 0) {break} // exit outer for loop early
    //   } // end outer for loop
    //   return retval // is now 0 or -1 or +1
    // }) // end inline function
    // } // end colSort
  
    colFilt(fn,pt){ //parms fieldname and prompt text
      console.log('running colFilt ', fn, pt)
      let filtWord = prompt('Filter ' + pt)
      if (filtWord == null || filtWord == "") {
        // User cancelled the prompt.
        this.msg1 = 'filter reset. '
        this.resetScoreboardFilter()
      } else {
        // this.colFiltPartB(fn, filtWord) // set tempSrArray array
        this.colFiltPartBB(fn, filtWord) // set filterInOut
        // this.scoreboardsArray = this.tempSrArray // billy temp.  need array strategy.
        this.msg1 = 'Scoreboard list filtered.'
      }
    } // end colFilt 
 
    colFiltPartBB(fn,fw){ // field name, filter word
      console.log('running colFiltPartBB',fn,fw)
      for (let i = 0; i < this.scoreboardsIn.length; i++) {
        this.scoreboardsIn[i]['sbFilterInOut'] = 'out' //default out
        if (typeof(this.scoreboardsIn[i][fn]) == 'string') {
          if (this.scoreboardsIn[i][fn].includes(fw)) {
            this.scoreboardsIn[i]['sbFilterInOut'] = 'in'
          } else {
            if (typeof(this.scoreboardsIn[i][fn]) == 'object') { 
              for (let j = 0; j < this.scoreboardsIn[i][fn].length; j++) {
                if(this.scoreboardsIn[i][fn][j].includes(fw) ) { // partial match OK
                  this.scoreboardsIn[i]['sbFilterInOut'] = 'in'
                } 
              }
            }  
          }  // end if  
        } // end if typeof
      } // end for
      console.table(this.scoreboardsIn)
    } // end colFiltPartBB

    addButClicked(){
      console.log('running addButClicked')
      this.scoreboardNbrOut.emit(-1) //-1  no questions yet
      this.wwsrdJumpOut.emit()
    }
  
    resetScoreboardFilter() {    
      //this.msg1 = 'Filter is reset.'  
      for (let i = 0; i < this.scoreboardsIn.length; i++) {
        this.scoreboardsIn[i]['sbFilterInOut'] = 'in'  
      }
    } // end resetScoreboardFilter

    countQuestionsPerScoreboard(){
      console.log('running wwg countQuestionsPerScoreboard')
      // for each scoreboard, find all questions that add to this scoreboard.
      // for each question that adds to this scoreboard,
      // look thru the question's accum array.
      // for each question's accum, find the max val that can be added.
      let qCnt = 0
      let biggestNbr = 0
      let maxPoints = 0
      for (let i = 0; i<this.scoreboardsIn.length; i++){
        qCnt = 0
        maxPoints = 0
        biggestNbr = 0
        for (let j = 0; j<this.questionsIn.length; j++){
          for (let k = 0; k<this.questionsIn[j].accum.length; k++){
            if (this.questionsIn[j].accum[k] == this.scoreboardsIn[i].scoreboardName){
              qCnt = qCnt + 1
              // max is complicated.  sheesh.
              biggestNbr = Math.max.apply(Math, this.questionsIn[j].acaPointVals)
              maxPoints = maxPoints + biggestNbr
            } // end if
          } // end inner for
        } // end middle for
        this.scoreboardsIn[i].qCnt = qCnt
        this.scoreboardsIn[i].maxPoints = maxPoints
      } // end outer for
      // console.log('bottom of countQuestionsPerScoreboard')
      // console.table(this.scoreboardsIn)
    } // end fun countQuestionsPerScoreboard

} // end export component