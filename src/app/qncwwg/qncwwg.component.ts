import { Component, OnInit, Input, 
         EventEmitter, Output } from '@angular/core';
import api from 'src/utils/api'

@Component({
  selector: 'app-qncwwg',
  templateUrl: './qncwwg.component.html'
})
export class QncwwgComponent implements OnInit {
  constructor() {}
  @Input() groupNbrIn
  @Input() questionsIn // needed for qCount
  @Input() groupsIn
  @Input() filterResetIn
  @Output() groupsOut = new EventEmitter() 
  @Output() groupNbrOut = new EventEmitter() 
  @Output() wwgdJumpOut = new EventEmitter() 
  msg1 = ''
  addButOn = false   // controls add button 
  symArUp    = '\u{2191}'
  symArDn    = '\u{2193}'
  symFilt    = '\u{2207}'  
  colHeadSf = false
  colSortByArray = []

  ngOnInit() {
    this.msg1 = 'Groups shown.'
    //this.buildGroupArrayFromGroupsIn()
    this.countQuestionsPerGroup()
    if (this.groupsIn.length == 0) {
      // no groups yet, so show add button
      this.addButOn = true
      this.msg1 = 'No groups exist. Click the add button.'
    }

    if (this.filterResetIn) { //billy needs test
      this.resetGroupsFilter()  
    }
  } // end ngOnInit

  // buildGroupArrayFromGroupsIn(){
  //   for( let i=0;i<this.groupsIn.length;i++){
  //     this.groupArray.push(
  //       { "group" : this.groupsIn[i]
  //        ,"qCount" :  0
  //       }
  //     )
  
  //   }
  // }


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
    this.msg1 = 'groups sorted by' //append list of fields to msg1
    let commaOrPeriod = ','
    this.colSortByArray.push( {sortField: fieldName , ascOrDes: ascDes} )
    if (this.colSortByArray.length>3){ this.colSortByArray.splice(0,1) }
 
    for (let i = this.colSortByArray.length-1; i >= 0; i--) {
      if(i==0){commaOrPeriod='.'}
      this.msg1 = this.msg1 + ' ' + this.colSortByArray[i].sortField + commaOrPeriod
    }
    
    this.groupsIn.sort((a, b) => { 
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


  // colSort(fieldName,ascDes){
  //   this.msg1 = 'groups sorted by' //append list of fields to msg1
  //   let commaOrPeriod = ','
  //   this.colSortByArray.push( {sortField: fieldName , ascOrDes: ascDes} )
  //   if (this.colSortByArray.length>3){ this.colSortByArray.splice(0,1) }
 
  //   for (let i = this.colSortByArray.length-1; i >= 0; i--) {
  //     if(i==0){commaOrPeriod='.'}
  //     this.msg1 = this.msg1 + ' ' + this.colSortByArray[i].sortField + commaOrPeriod
  //   }
    
  //   this.groupsIn.sort((a, b) => { 
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
  //           if (Number(a[prop]) && Number(b[prop]) ){ // comparing nbrs
  //             if (a[prop].toString().padStart(4,'0') 
  //             > b[prop].toString().padStart(4,'0')) { retval= -1 * neg1OrPos1}
  //             if (a[prop].toString().padStart(4,'0') 
  //             < b[prop].toString().padStart(4,'0')) { retval= +1 * neg1OrPos1}
  //           } else { // comparing a pair where at least one is not number
  //               if (a[prop] > b[prop]) { retval= -1 * neg1OrPos1}
  //               if (a[prop] < b[prop]) { retval= +1 * neg1OrPos1}
  //           } // end if Number
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
      this.resetGroupsFilter()
    } else {
      this.colFiltPartBB(fn, filtWord)  
      this.msg1 = 'group list filtered.'
    }
  } // end colFilt 

  colFiltPartBB(fn,fw){ // field name, filter word
    console.log('running colFiltPartBB',fn,fw)
    for (let i = 0; i < this.groupsIn.length; i++) {
      this.groupsIn[i]['gFilterInOut'] = 'out' //default out
      if (typeof(this.groupsIn[i][fn]) == 'string') {
        console.log('122 filter by string')
        if (this.groupsIn[i][fn].includes(fw)) {
          this.groupsIn[i]['gFilterInOut'] = 'in'
        } else {
          if (typeof(this.groupsIn[i][fn]) == 'object') { 
            console.log('127 filter by obj')
            for (let j = 0; j < this.groupsIn[i][fn].length; j++) {
              if(this.groupsIn[i][fn][j].includes(fw) ) { // partial match OK
                this.groupsIn[i]['gFilterInOut'] = 'in'
              } 
            }
          }  
        }  // end if  
      } // end if typeof
    } // end for
    console.table(this.groupsIn)
  } // end colFiltPartBB


  addButClicked(){
    console.log('running wwg addButClicked')
    this.groupNbrOut.emit(-1) //-1  no groups yet
    this.wwgdJumpOut.emit()
  } // end addButClicked
  
  detailButClicked(groupNbrParmIn,gx){
    this.wwgdJumpOut.emit()
    this.groupsOut.emit(this.groupsIn) 
    this.groupNbrOut.emit(groupNbrParmIn) 
  }

  setPopState(){
    console.log('running wwg setPopState')
    window.onpopstate = function (ev) {  
      console.log('running window.onpopstate')
      //this.doneWwg() // ??billy?
    }
  } // end setPopState


  countQuestionsPerGroup(){
    console.log('running wwg countQuestionsPerGroup')
    console.table(this.questionsIn)
    console.table(this.groupsIn)
    let qCnt = 0
    for (let i = 0; i<this.groupsIn.length; i++){
      qCnt = this.questionsIn
      .filter(q => q.subset.toLowerCase().trim() == this.groupsIn[i].groupName.toLowerCase().trim())
      .length
      // billy, change q.subset to q.groupName after ya fix questions
      this.groupsIn[i].qCount = qCnt.toString().padStart(3,'0')
    } // end  for
    // console.table(this.groupsIn)
  } // end countQuestionsPerGroup

  resetGroupsFilter() {    
    //this.msg1 = 'Filter is reset.'  
    for (let i = 0; i < this.groupsIn.length; i++) {
      this.groupsIn[i]['gFilterInOut'] = 'in'  
    }
  } // end resetGroupsFilter

} // end export class
