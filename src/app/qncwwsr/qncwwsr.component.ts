import { Component, OnInit, Input} from '@angular/core'  
import { EventEmitter, Output } from '@angular/core' 
import api from 'src/utils/api'

@Component({
  selector: 'app-qncwwsr',
  templateUrl: './qncwwsr.component.html'
})
export class QncwwsrComponent implements OnInit {
    rulesArray = []
    msg1 = '?'
    @Input() custIn  
    @Input() qidIn
    @Output() wwsrdJumpOut = new EventEmitter() 
  
    ngOnInit() {
      this.msg1 = 'msg1: init wwsr '
      + this.custIn
      + this.qidIn
    }

    //billy, list sr array.
    // probably want to populate sr array in app comp,
    // then pass it in.
    // add button to jump to detail screen.
    jumpToWwsrd(sr,rx){ this.wwsrdJumpOut.emit() }
  
    detailButClicked(sr,rx){
      this.jumpToWwsrd(sr,rx)
    }
  
} // end export component