import { Component, OnInit, Input,  
         EventEmitter, Output } from '@angular/core'
import colSortFilt from '../../../src/utils/colSortFilt'

@Component({
  selector: 'app-qncwwq',
  templateUrl: './qncwwq.component.html'
})
export class QncwwqComponent implements OnInit {
  constructor() { }
  @Input() custIn:any
  @Input() qidIn:any
  @Input() questionsIn:any
  @Input() filterResetIn:any
  @Input() rulesIn:any
  @Input() groupsIn:any
  @Output() wwqdJumpOut = new EventEmitter()
  @Output() questionNbrOut = new EventEmitter()
  @Output() questionsOut = new EventEmitter()
  symArUp    = '\u{2191}'
  symArDn    = '\u{2193}'
  symFilt    = '\u{2207}'  
  colHeadSf = false
  msg1 = ''
  colSortByArray = []
  ngOnInit() {
    console.log('running wwq ngOnInit============')
    this.msg1 = 'question list '
    let x = colSortFilt.colSort(this.questionsIn,'questNbr','des','quest nbr')
    if (this.questionsIn.length == 0) {      
      this.msg1 = 'No questions exist. Click the add button.' }
    if (this.filterResetIn) { this.resetQuestionFilter() }
    this.setQuestionsGroupInfo()
    // this.sortQuestionsIn()
  }  //end ngOnInit

  setQuestionsGroupInfo(){
    console.log('running setQuestionsGroupInfo')
    let gx = -1
    for (let i = 0; i < this.questionsIn.length; i++) {
      this.questionsIn[i].groupRound = '1' //default
      // console.log(this.questionsIn[i].subset)
      gx = this.groupsIn //which round is this question's group in?
      .findIndex((g:any) => g.groupName 
                 == this.questionsIn[i].subset)
      if (gx > -1){
        this.questionsIn[i].groupRound = this.groupsIn[gx].seq }
    } //end for      
  } // end setQuestionsGroupInfo

//   sortQuestionsIn(){
//     console.log('running 49 wwq sortQuestionsIn')

// this.questionsIn.sort((a:any, b:any) => {
//   return a.groupRound.localeCompare(b.groupRound) 
//   // return a.questSeq.localeCompare(b.questSeq) //can't do two fields?
// })

//     // this.questionsIn.sort( function sorter (a:any,b:any) {
//     //   if (Number(a.groupRound) > b.groupRound))         { return 1  }
//     //   if (Number(a.groupRound) < Number(b.groupRound))  { return -1 }
//     //   if (a.groupRound    > b.groupRound )              { return 1  }
//     //   if (a.groupRound    < b.groupRound )              { return -1 }
//     //   if (Number(a.questSeq) > Number(b.questSeq))      { return 1  }
//     //   if (Number(a.questSeq) < Number(b.questSeq))      { return -1 }
//     //   if (a.questSeq > b.questSeq)                      { return 1  }
//     //   if (a.questSeq < b.questSeq)                      { return -1 }
//     //   return 0 //a & b are equal.
//     // })  //end sort
//   } // end sortQuestionsIn

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
    let colSortOut = colSortFilt.colSort(this.questionsIn,fieldName,ascDes,fieldMsg)
    this.questionsIn = colSortOut[0] // not really needed cuz shallow/deep copy rules
    this.msg1    = colSortOut[3]
  } // end colSort

  colFilt(fn:any,pt:any){ //parms fieldname and prompt text
    this.msg1 = ''
    // console.log('running colFilt ', fn, pt)
    let filtWord = prompt('Filter ' + pt)
    this.resetQuestionFilter()
    let colFiltOut = colSortFilt.colFilt(this.questionsIn,fn,pt,filtWord)
    // console.log(colFiltOut[0])
    this.questionsIn = colFiltOut[0] // probably cuz of shallow/deep copy.
    this.msg1 = colFiltOut[1]
  } // end colFilt 

  addButClick(){
    console.log('running wwq addButClick')
    this.questionNbrOut.emit(-1) //tell detail to add row
    this.wwqdJumpOut.emit()
  }

  detailButClick(qNbr:any){
    console.log('running wwq detailButClick:',qNbr)
    //  jump out of wwq and tell caller quests we are working on
    this.questionNbrOut.emit(qNbr) 
    this.questionsOut.emit(this.questionsIn) 
    this.wwqdJumpOut.emit()
  }

  resetQuestionFilter(){  
    for (let i = 0; i < this.questionsIn.length; i++) {
      this.questionsIn[i]['filterInOut'] = 'in'  
      // this.questionsIn[i].filterInOut = 'in'  
    } // end for
  } //end resetQuestionFilter

} // end export class