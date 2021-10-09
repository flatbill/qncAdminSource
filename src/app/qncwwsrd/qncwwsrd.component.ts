import { Component, OnInit, Input } from '@angular/core'
import { EventEmitter, Output     } from '@angular/core'
import api from 'src/utils/api'

@Component({
  selector: 'app-qncwwsrd',
  templateUrl: './qncwwsrd.component.html'
})
export class QncwwsrdComponent implements OnInit {
  @Input() custIn
  @Input() qidIn
  @Input() scoreboardNbrIn
  @Input() scoreboardsIn
  @Output() wwsrJumpOut = new EventEmitter()

  msg1 = 'edit and save scoreboard details.'
  sx = -1
  pendingAddSx = -1
  scoreboardObj = {}  
  qtDbDataObj = {} 
  rangeTxtCols = 75
  rangeTxtRows = 3
  ngOnInit() {
    console.log('wwsrd init ===***')
    console.log(this.scoreboardNbrIn)
    console.table(this.scoreboardsIn)
    //console.log(this.scoreboardsIn[0].scoreboardNbr) blank scoreboardsIn?
    // if (this.scoreboardsIn2.length == 0) {
    //   this.scoreboardsIn2 = this.scoreboardsIn 
    // }  
    if (this.scoreboardNbrIn==-1){
      // no scoreboards exist. add a starter scoreboard.
      this.addButClick()
      this.sx = 0
      this.msg1 ='New starter scoreboard created. Ready for your changes.'
    } else {
      this.sx = this.scoreboardsIn
      .findIndex(s => s.scoreboardNbr == this.scoreboardNbrIn)
    }  
  } // end ngOnInit

  prevButClick(){
    // console.log('running prevButClick')
    this.msg1 = 'first scoreboard shown.'
    let loopSx = this.sx
    while (loopSx > 0) {
      loopSx = loopSx - 1
      if (this.scoreboardsIn[loopSx].sbFilterInOut == 'in') {
        this.sx = loopSx
        this.msg1 = 'previous scoreboard shown.'
        // this is a rec we want to show. sx is set.
        loopSx = 0 // lets exit the while loop
      }
    } // end while
  } // end prevButClick

  nextButClick(){
    this.msg1 = 'last scoreboard shown.'
    let loopSx = this.sx
    while (loopSx < this.scoreboardsIn.length-1) {
      loopSx = loopSx + 1
      if (this.scoreboardsIn[loopSx].sbFilterInOut == 'in') {
        this.sx = loopSx
        this.msg1 = 'next scoreboard shown.'
        // this is a rec we want to show. sx is set.
        loopSx = 9999 // lets exit the while loop
      }
    } // end while

  } // end nextButClick
  
  addButClick(){
    this.msg1 = 'edit this new scoreboard.'
    let newScoreboardNbr = '01'
    if (this.scoreboardsIn.length > 0) {
      //  set new scoreboard nbr to one bigger than max scoreboard nbr
      let scoreboardNbrMax = 
        Math.max.apply(Math, this.scoreboardsIn.map(function(s) { return s.scoreboardNbr }))
      newScoreboardNbr = (scoreboardNbrMax + 1).toString().padStart(2, '0')
    } // end if scoreboardsIn.length > 0
    let newScoreboardName = 'scoreboard' + newScoreboardNbr.substr(1, 1)    
    this.scoreboardsIn.push(
      {
       cust: this.custIn,
       qid: this.qidIn,
       scoreboardNbr: newScoreboardNbr,
       scoreboardName: newScoreboardName,
       scoreboardSeq: newScoreboardNbr,
       ranges: [
        {
         rangeName: 'low',
         rangeNbr: '1',
         rangeStart: '00',
         rangeEnd: '33',
         rangeTxt: 'text goes here'
        },
        {
          rangeName: 'medium',
          rangeNbr: '1',
          rangeStart: '34',
          rangeEnd: '66',
          rangeTxt: 'text goes here'
         },
         {
          rangeName: 'high',
          rangeNbr: '1',
          rangeStart: '67',
          rangeEnd: '99',
          rangeTxt: 'text goes here'
         }
       ]
      //  scoreboardNbr: newscoreboardNbr,
      }
    )
    this.sx = this.scoreboardsIn.length - 1
    this.pendingAddSx = this.sx // when he hits save, we use this.

    this.msg1 = 'adding scoreboard nbr: ' + this.scoreboardsIn[this.sx].scoreboardNbr
    this.saveScoreboard()
    this.msg1 ='New starter scoreboard created. Ready for your changes.'
    this.scoreboardsIn[this.sx].sbFilterInOut = 'in'
    console.log('121 added new scoreboard to scoreboardsIn')
  } // end addButClick

  delButClick(){
    // delete scoreboard from scoreboard array.
    // call database api
    // figure out sx of the on-screen scoreboard, 
    // and delete-splice it from array:
    let scoreboardNbrWork = this.scoreboardsIn[this.sx].scoreboardNbr  
    this.sx = this.scoreboardsIn
      .findIndex(q => q.scoreboardNbr == scoreboardNbrWork)
    //  delete the db scoreboard
    this.buildScoreboardObj()
    this.launchQtDeleteScoreboard()
    // remove the scoreboard from the array:
    this.scoreboardsIn.splice(this.sx,1) 
    // after he deletes a scoreboard, show adjacent scoreboard on screen.
    this.sx = this.sx + 1 
    if (this.sx > this.scoreboardsIn.length -1 ) {
       this.sx = this.scoreboardsIn.length -1  
     }
     this.msg1 = 'scoreboard ' + scoreboardNbrWork + ' deleted.'
    //billy, if he deleted all scoreboards, give alert and exit.
    if (this.scoreboardsIn.length==0){
      //billy, maybe tell him nicer, that we will jump to the list screen.
      alert('no scoreboards left. Leaving this screen.')
      this.wwsrJumpOut.emit()
    }

   } // end delButClick
 
  saveButClick(){
    // console.log('running saveButClick')
    // call the database api
    // we are working with one scoreboard.
    // if this is a newly added scoreboard,
    this.saveScoreboard()
  } // end saveButClick

  saveScoreboard(){
    console.log('running wwsrd saveScoreboard')
    this.buildScoreboardObj() // uses current sx
    if (this.pendingAddSx >= 0) {
      this.launchQtAddScoreboard()
      this.pendingAddSx = -1
    } else {
      //  this is a changed scoreboard:
      this.launchQtUpdateScoreboard()
    }
    if ( ! this.msg1.includes('scoreboard saved')) {
      this.msg1 = this.msg1 + ' scoreboard saved.'
    }
  } // end saveScoreboard

  buildScoreboardObj(){
    console.log('running buildScoreboardObj')
    // set sx before you get here (the scoreboard rec )
    // set rx before you get here (the ranges?  hmmm... )
    this.scoreboardObj = 
      {
        cust: this.custIn,
        qid: this.qidIn,
        scoreboardNbr: this.scoreboardsIn[this.sx].scoreboardNbr,
        scoreboardName: this.scoreboardsIn[this.sx].scoreboardName,
        scoreboardSeq: this.scoreboardsIn[this.sx].scoreboardSeq,
        ranges: this.scoreboardsIn[this.sx].ranges
      }
      console.table(this.scoreboardObj)

  } // end buildScoreboardObj

  appendRangeButClick(){
    console.log('running appendRangeButClick')
    this.appendRangeToScoreboard()
  }

  appendRangeToScoreboard(){
    console.log('running appendRangeToScoreboard')
    // he wants to append a range.
    //  we want to push a range object into the scoreboard's ranges.
    //  like ranges : [rangeObj,rangeObj,rangeObj] 
    // rangeObj is like {rangeNbr:3, rangeStart:11, rangeEnd:22}
    let rangeNbrMax = 
    Math.max.apply(Math, this.scoreboardsIn[this.sx].ranges.map(function(r) { return r.rangeNbr }))
    let newRangeNbr = (rangeNbrMax + 1).toString().padStart(2, '0')

    let rangeObj = {
      rangeNbr:  newRangeNbr, 
      rangeName:'newRange', 
      rangeStart:'00', 
      rangeEnd:  '99', 
      rangeTxt:  'new range text goes here.'
    }
   this.scoreboardsIn[this.sx].ranges.push(rangeObj)
   this.saveScoreboard()
   console.table(this.scoreboardsIn)
   console.log('wwsrd 177')
  } // end appendRangeToScoreboard

  delRangeButClick(rx){
    console.log('running delRangeButClick')
    console.table(this.scoreboardsIn[this.sx].ranges)
    this.scoreboardsIn[this.sx].ranges.splice(rx,1)
    this.saveScoreboard()

  }

  launchQtAddScoreboard(){
    console.log('running  wwsrd launchQtAddScoreboard')
    api.qtAddScoreboard(this.scoreboardObj)
    .then ((qtDbRtnObj) => { this.qtDbDataObj = qtDbRtnObj.data})
    // return from this on-the-fly function is implied  
    .catch(() => {
      console.log('launchQtAddScoreboard error. scoreboardObj:' +  this.scoreboardObj)
    })

  } // end launchQtAddScoreboard

  launchQtUpdateScoreboard(){
    console.log('running  wwsrd launchQtUpdateScoreboard')
    api.qtUpdateScoreboard(this.scoreboardObj)
    .then ((qtDbRtnObj) => {this.qtDbDataObj = qtDbRtnObj.data})
    // return from  on-the-fly function is implied. 
    .catch(() => {
      console.log('launchQtUpdateScoreboard error. scoreboardObj:', this.scoreboardObj )
    })
  
  } // end launchQtUpdateScoreboard

  launchQtDeleteScoreboard(){
    console.log('running  wwsrd launchQtDeleteScoreboard')
    api.qtDeleteScoreboard(this.scoreboardObj)
    .then ((qtDbRtnObj) => {this.qtDbDataObj = qtDbRtnObj.data})
    // return from this on-the-fly function is implied  
    .catch(() => {
      console.log('launchQtDeleteScoreboard error. scoreboardObj:' +  this.scoreboardObj)
    })
  } // end launchQtDeleteScoreboard

  scoreboardNameChg(newScoreboardName,sx){
    console.log('running scoreboardNameChg')
    this.msg1 = 'scoreboard name changed. '
    this.scoreboardsIn[sx].scoreboardName = newScoreboardName
    this.saveScoreboard()

  }

  scoreboardSeqChg(newScoreboardSeq,sx){
    console.log('running scoreboardSeqChg')
    this.msg1 = 'scoreboard seq changed. '
    this.scoreboardsIn[sx].scoreboardSeq = newScoreboardSeq
    this.saveScoreboard()
  }


  rangeNameChg(newRangeName,sx,rx){
    console.log('running rangeNameChg')
    this.msg1 = 'range name changed. '
    this.scoreboardsIn[sx].ranges[rx].rangeName = newRangeName
    this.saveScoreboard()
  }


 rangeStartChg(newRangeStart,sx,rx){
   // he changed the range start  
   console.log('running wwsrd rangeStartChg')
   this.msg1 = 'range start changed. '
   this.scoreboardsIn[sx].ranges[rx].rangeStart = newRangeStart
   this.saveScoreboard()
 }

 rangeEndChg(newRangeEnd,sx,rx){
  // he changed the range end  
  console.log('running wwsrd rangeEndChg')
  this.msg1 = 'range end changed. '
  this.scoreboardsIn[sx].ranges[rx].rangeEnd = newRangeEnd
  this.saveScoreboard()
}

rangeTxtChg(newRangeTxt,sx,rx){
  // he changed the range txt  
  console.log('running wwsrd rangeTxtChg')
  this.msg1 = 'range text changed. '
  this.scoreboardsIn[sx].ranges[rx].rangeTxt = newRangeTxt
  this.saveScoreboard()
}

} // end export
