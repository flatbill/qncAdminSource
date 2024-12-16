import { Component, OnInit, Input, 
         EventEmitter, Output } from '@angular/core'
import colSortFilt from '../../utils/colSortFilt'
@Component({
  selector: 'app-qncwwg',
  templateUrl: './qncwwg.component.html'
})
export class QncwwgComponent implements OnInit {
  constructor() {}
  @Input() groupNbrIn:any
  @Input() questionsIn:any // needed for qCount
  @Input() groupsIn:any
  @Input() filterResetIn:any
  @Output() groupsOut = new EventEmitter() 
  @Output() groupNbrOut = new EventEmitter() 
  @Output() wwgdJumpOut = new EventEmitter() 
  msg1 = ''
  symArUp    = '\u{2191}'
  symArDn    = '\u{2193}'
  symFilt    = '\u{2207}'  
  colHeadSf = false
  colSortByArray = []

  ngOnInit() {
    console.log('wwg 26 ngOnInit')
    this.msg1 = 'group list'
    let x = colSortFilt.colSort(this.groupsIn,'groupNbr','des','group nbr')
    this.countQuestionsPerGroup()
    if (this.groupsIn.length == 0) {
      this.msg1 = "No groups exist. Click the 'add new' button." }
    if (this.filterResetIn) {  
      this.resetGroupsFilter() }
  } // end ngOnInit

  colHeadclick(c:any){
    // hide/show sort & filter icons in the table header (lower part)
    if (this.colHeadSf == true ) {
      this.colHeadSf = false
      if (this.msg1 =='click an icon to sort or filter.') {this.msg1=''}
    } else {
      this.colHeadSf = true
      this.msg1 = 'click an icon to sort or filter.'
    }
  }// end colHeadclick

  colSort(fieldName:any,ascDes:any,fieldMsg:any){
    // billy fix
    let colSortOut = colSortFilt.colSort(this.groupsIn,fieldName,ascDes,fieldMsg)
    // this.groupsIn = colSortOut[0] // not really needed cuz shallow/deep copy rules
    // this.msg1    = colSortOut[3]
  } // end colSort

  colFilt(fn:any,pt:any){ //parms fieldname and prompt text
    console.log('running colFilt ', fn, pt)
    let filtWord = prompt('Filter ' + pt)
    this.resetGroupsFilter()
    let colFiltOut = colSortFilt.colFilt(this.groupsIn,fn,pt,filtWord)
    this.groupsIn = colFiltOut[0] // not really needed cuz shallow/deep copy rules
    this.msg1 = colFiltOut[1]
  } // end colFilt 

  addButclick(){ // jump to detail and add a new rec
    console.log('running wwg addButclick')
    this.groupNbrOut.emit(-1) //  -1 means add new rec
    this.wwgdJumpOut.emit() // jump to wwgd
  } // end addButclick
  
  detailButclick(groupNbrParmIn:any,gx:any){
    this.wwgdJumpOut.emit()
    this.groupsOut.emit(this.groupsIn) 
    this.groupNbrOut.emit(groupNbrParmIn) 
  }

  // setPopState(){
  //   console.log('running wwg setPopState')
  //   window.onpopstate = function (ev) {  
  //     console.log('running window.onpopstate')
  //     //this.doneWwg() // ??billy?
  //   }
  // } // end setPopState

  countQuestionsPerGroup(){
    console.log('running wwg countQuestionsPerGroup')
    let qCnt = 0
    for (let i = 0; i<this.groupsIn.length; i++){
      qCnt = this.questionsIn
      .filter((q:any) => q.subset.toLowerCase().trim() == this.groupsIn[i].groupName.toLowerCase().trim())
      .length
      // billy, change q.subset to q.groupName after ya fix questions
      this.groupsIn[i].qCount = qCnt.toString()
       //qCnt.toString().padStart(3,'0')
    } // end  for
  } // end countQuestionsPerGroup

  resetGroupsFilter() {    
    //this.msg1 = 'Filter is reset.'  
    for (let i = 0; i < this.groupsIn.length; i++) {
      this.groupsIn[i]['filterInOut'] = 'in'  
    }
  } // end resetGroupsFilter

} // end export class