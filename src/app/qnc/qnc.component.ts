import {Component, OnInit, Input, Output} from '@angular/core'
import {EventEmitter} from '@angular/core'
@Component({
  selector: 'app-qnc',
  templateUrl: './qnc.component.html'
})
export class QncComponent implements OnInit {
  constructor() {} 
  @Input() showQnc
  @Input() subsetsIn
  @Input() questionsIn
  @Output() subsetsOut = new EventEmitter()
  // @Output() wwgJumpOut = new EventEmitter()
  // @Output() wwqJumpOut = new EventEmitter()
  // @Output() wwrJumpOut = new EventEmitter()
  // @Output() wwiJumpOut = new EventEmitter()
  // @Output() wwqdJumpOut = new EventEmitter()
  // @Output() wwuJumpOut  = new EventEmitter()
  // @Output() wwsJumpOut  = new EventEmitter()
  @Output() qncQuestOut = new EventEmitter()
  state = { wingoFango: false }
  subsetArray = []
  questArray = []
  rulesArray = []
  // qCountArray = [3,1,1,2,2]
  // hisChosenSubset = '?'
  // hisChosenSubsetIx = -1
  // hisEnteredSubset = '?'
  // hisChosenQuest = '?'
  // saveSubsetHtmlId  =  '?'
  // expandedSubset = '?'
  // expandedSubsetHtmlId = '?'
  
  ngOnInit() {
    alert('hey mookey, you are running qnc component ngOnInit')
    console.log('running ngOnit qnc comp 35')
    console.table(this.questionsIn)

    //window.history.pushState(this.state, null, "") //billy fix
    this.subsetArray = this.subsetsIn
    this.questArray = this.questionsIn
  }
  
  // jumpToWwg(){ this.wwgJumpOut.emit()}  
  // jumpToWwq(){ this.wwqJumpOut.emit()} 
  // jumpToWwr(){ this.wwrJumpOut.emit()} 
  // jumpToWwi(){ this.wwiJumpOut.emit()} 
  // jumpToWwu(){ this.wwuJumpOut.emit()} 
  // jumpToWws(){ this.wwsJumpOut.emit()} 
  
  showHideHelp(){
    alert('running showHideHelp in qnc.component.ts' + "\r\n"
    +' home screen for admin'      + "\r\n"
    )
  }

} //end qnc component class
