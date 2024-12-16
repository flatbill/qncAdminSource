import { Component, OnInit, Input} from '@angular/core'  
import { EventEmitter, Output } from '@angular/core' 
import colSortFilt from '../../utils/colSortFilt'

@Component({
  selector: 'app-qncwwsr',
  templateUrl: './qncwwsr.component.html'
})
export class QncwwsrComponent implements OnInit {
    rulesArray = []
    msg1 = '?'
    @Input() custIn:any
    @Input() qidIn:any
    @Input() scoreboardsIn:any
    @Input() scoreboardRangesIn:any
    @Input() filterResetIn:any
    @Input() questionsIn:any
    @Output() scoreboardNbrOut = new EventEmitter() 
    @Output() scoreboardsOut = new EventEmitter() 
    @Output() scoreboardRangesOut = new EventEmitter() 
    @Output() wwsrdJumpOut = new EventEmitter() 
    colHeadSf = false
    colSortByArray = []
    symArUp    = '\u{2191}'
    symArDn    = '\u{2193}'
    symFilt    = '\u{2207}'  
    ngOnInit() {
      console.log('running wwsr ngOnInit')
      let x = colSortFilt.colSort(this.scoreboardsIn,'scoreboardNbr','des','scoreboar nbr')
          x = colSortFilt.colSort(this.scoreboardRangesIn,'rangeNbr','des','range nbr')
      this.msg1 = 'scoreboard list '
      if (this.scoreboardsIn.length == 0) {
        this.msg1 = "No scoreboards exist. Click the 'add new' button." }
      if (this.filterResetIn) {
        this.resetScoreboardFilter() }
      this.countQuestionsPerScoreboard()
      this.countRanges() // hack to keep track of range counts on-screen
    } // end ngOnInit

    detailButClick(scoreboardNbrParmIn:any) { 
      console.log('running wwsr detailButClick:',scoreboardNbrParmIn)
      //  jump out of wwsr and tell caller what we were working on
      this.scoreboardNbrOut.emit(scoreboardNbrParmIn) 
      this.scoreboardsOut.emit(this.scoreboardsIn)
      this.scoreboardRangesOut.emit(this.scoreboardRangesIn)
      this.wwsrdJumpOut.emit()   
    }

    colHeadClick(c:any){
      // hide/show sort & filter icons in  table header  
      if (this.colHeadSf == true ) {
        this.colHeadSf = false
        if (this.msg1 =='click an icon to sort or filter.') {this.msg1=''}
      } else {
        this.colHeadSf = true
        this.msg1 = 'click an icon to sort or filter.'
      } // end if
    } // end colHeadClick

    colSort(fieldName:any,ascDes:any,fieldMsg:any){
      let colSortOut = colSortFilt.colSort(this.scoreboardsIn,fieldName,ascDes,fieldMsg)
      this.scoreboardsIn = colSortOut[0] // not really needed cuz shallow/deep copy rules
      this.msg1    = colSortOut[3]
    } // end colSort

    colFilt(fn:any,pt:any){ //parms fieldname and prompt text
      console.log('running colFilt ', fn, pt)
      let filtWord = prompt('Filter ' + pt)
      this.resetScoreboardFilter()
      let colFiltOut = colSortFilt.colFilt(this.scoreboardsIn,fn,pt,filtWord)
      this.scoreboardsIn = colFiltOut[0] // not really needed cuz shallow/deep copy rules
      this.msg1 = colFiltOut[1]
    } // end colFilt 

    addButClick(){
      console.log('running addButClick')
      this.scoreboardNbrOut.emit(-1) //-1  no questions yet
      this.wwsrdJumpOut.emit()
    }
  
    resetScoreboardFilter() {    
      //this.msg1 = 'Filter is reset.'  
      for (let i = 0; i < this.scoreboardsIn.length; i++) {
        this.scoreboardsIn[i]['filterInOut'] = 'in'  
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
        this.scoreboardsIn[i].qCnt = qCnt.toString()
        this.scoreboardsIn[i].maxPoints = maxPoints.toString()
      } // end outer for
    } // end fun countQuestionsPerScoreboard

    countRanges(){
      let priorScoreboardNbr = 'none'
      let rangeCount = 1
      for (let i = 0; i<this.scoreboardRangesIn.length; i++){
        if (this.scoreboardRangesIn[i].scoreboardNbr == priorScoreboardNbr){
          rangeCount = rangeCount + 1
        } else { // new scoreboard nbr
          priorScoreboardNbr = this.scoreboardRangesIn[i].scoreboardNbr
          rangeCount = 1
        }
        this.scoreboardRangesIn[i]['rCnt'] = rangeCount
      } // end for
    } 
} // end export component