import { Component, OnInit, Input } from '@angular/core'
import { EventEmitter, Output     } from '@angular/core'
import apiFauna from 'src/utils/apiFauna'

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

  msg1 = 'edit scoreboard details.'
  sx = -1
  pendingAddSx = -1
  scoreboardObj = {}  
  qtDbDataObj = {} 
  rangeTxtCols = 75
  rangeTxtRows = 3
  verifyDelete = false
  fieldsDisabled = false
  someFieldWasChanged = false
  rangerArray = []
  ngOnInit() {
    console.log('running wwsrd ngOnInit')
    console.log('scoreboardsIn at ngOnit wwsrd:')
    console.table(this.scoreboardsIn)
    if (this.scoreboardNbrIn==-1){
      // no scoreboards exist. add a starter scoreboard.
      this.addButClick()
      this.sx = 0
      this.msg1 ='New starter scoreboard created. Ready for your changes.'
    // } else {
    }  
    this.sx = this.scoreboardsIn
    .findIndex(s => s.scoreboardNbr == this.scoreboardNbrIn)

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
    let newScoreboardNbr = '1'
    if (this.scoreboardsIn.length > 0) {
      //  set new scoreboard nbr to one bigger than max scoreboard nbr
      let scoreboardNbrMax = 
        Math.max.apply(Math, this.scoreboardsIn.map(function(s) { return s.scoreboardNbr }))
      newScoreboardNbr = (scoreboardNbrMax + 1).toString() //.padStart(3, '0')
    } // end if scoreboardsIn.length > 0
    let newScoreboardName = 'sb' + newScoreboardNbr //.padStart(3, '0')
    let newScoreboardSeq  = newScoreboardNbr 
    // what scoreboard sequence is for: reports list scoreboards in sequence.
    this.setRanges(
      this.scoreboardsIn[0].qCnt,
      this.scoreboardsIn[0].maxPoints) //billy
    this.scoreboardsIn.push(
      {
       cust: this.custIn,
       qid: this.qidIn,
       scoreboardNbr: newScoreboardNbr,
       scoreboardName: newScoreboardName,
       scoreboardSeq: newScoreboardSeq,
       ranges: this.rangerArray
      //  ranges: [
      //   {
      //    rangeName: 'low',
      //    rangeNbr: '1',
      //    rangeStart: '00',
      //    rangeEnd: '33',
      //    rangeTxt: 'low '
      //   },
      //   {
      //     rangeName: 'medium',
      //     rangeNbr: '2',
      //     rangeStart: '34',
      //     rangeEnd: '66',
      //     rangeTxt: 'med'
      //    },
      //    {
      //     rangeName: 'high',
      //     rangeNbr: '3',
      //     rangeStart: '67',
      //     rangeEnd: '999',
      //     rangeTxt: 'high'
      //    },
      //    {
      //     rangeName: 'higher',
      //     rangeNbr: '3',
      //     rangeStart: '67',
      //     rangeEnd: '999',
      //     rangeTxt: 'high'
      //    }
      //  ]
      //  scoreboardNbr: newscoreboardNbr,
      }
    )
    this.sx = this.scoreboardsIn.length - 1
    this.pendingAddSx = this.sx // when he hits save, we use this.

    this.msg1 = 'adding scoreboard nbr: ' + this.scoreboardsIn[this.sx].scoreboardNbr
    this.saveScoreboard()
    this.msg1 ='New starter scoreboard created. Ready for your changes.'
    this.scoreboardsIn[this.sx].sbFilterInOut = 'in'
    this.scoreboardNbrIn = newScoreboardNbr
    console.log('121 added new scoreboard to scoreboardsIn')
  } // end addButClick

  delButClick(){
    this.msg1=''
    this.verifyDelete=true
    this.fieldsDisabled = true
  } // end delButClick

  proceedWithDelete(){
    this.msg1 = 'deleting...'
    this.verifyDelete=false
    this.fieldsDisabled = false
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
   } // end proceedWithDelete

  cancelDelete(){
    this.verifyDelete = false
    this.fieldsDisabled = false
  } // end cancelDelete

  saveButClick(){ //not used. instead, we autosave.
    // console.log('running saveButClick')
    // call the database api
    // we are working with one scoreboard.
    // if this is a newly added scoreboard,
    this.saveScoreboard()
  } // end saveButClick

  saveScoreboard(){
    console.log('running wwsrd saveScoreboard')
    this.someFieldWasChanged = true  
    this.buildScoreboardObj() // uses current sx
    if (this.pendingAddSx >= 0) {
      this.launchQtAddScoreboard()
      this.pendingAddSx = -1
    } else {
      //  this is a changed scoreboard:
      this.launchQtUpdateScoreboard()
    }
    if ( ! this.msg1.includes('scoreboard autosaved')) {
      this.msg1 = this.msg1 + ' scoreboard autosaved.'
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
    apiFauna.qtAddScoreboard(this.scoreboardObj)
    .then ((qtDbRtnObj) => { this.qtDbDataObj = qtDbRtnObj.data})
    // return from this on-the-fly function is implied  
    .catch(() => {
      console.log('launchQtAddScoreboard error. scoreboardObj:' +  this.scoreboardObj)
    })

  } // end launchQtAddScoreboard

  launchQtUpdateScoreboard(){
    console.log('running  wwsrd launchQtUpdateScoreboard')
    apiFauna.qtUpdateScoreboard(this.scoreboardObj)
    .then ((qtDbRtnObj) => {this.qtDbDataObj = qtDbRtnObj.data})
    // return from  on-the-fly function is implied. 
    .catch(() => {
      console.log('launchQtUpdateScoreboard error. scoreboardObj:', this.scoreboardObj )
    })
  
  } // end launchQtUpdateScoreboard

  launchQtDeleteScoreboard(){
    console.log('running  wwsrd launchQtDeleteScoreboard')
    apiFauna.qtDeleteScoreboard(this.scoreboardObj)
    .then ((qtDbRtnObj) => {this.qtDbDataObj = qtDbRtnObj.data})
    // return from this on-the-fly function is implied  
    .catch(() => {
      console.log('launchQtDeleteScoreboard error. scoreboardObj:' +  this.scoreboardObj)
    })
  } // end launchQtDeleteScoreboard

  scoreboardNameChg(newScoreboardName,sx){
    console.log('running scoreboardNameChg')
    this.msg1 = 'scoreboard name changed. '
    this.scoreboardsIn[sx].scoreboardName = newScoreboardName.trim()
    this.saveScoreboard()

  }

  scoreboardSeqChg(newScoreboardSeq,sx){
    console.log('running scoreboardSeqChg')
    this.msg1 = 'scoreboard seq changed. '
    this.scoreboardsIn[sx].scoreboardSeq = newScoreboardSeq.trim()
    this.saveScoreboard()
  }


  rangeNameChg(newRangeName,sx,rx){
    console.log('running rangeNameChg')
    this.msg1 = 'range name changed. '
    this.scoreboardsIn[sx].ranges[rx].rangeName = newRangeName.trim()
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
  this.scoreboardsIn[sx].ranges[rx].rangeTxt = newRangeTxt.trim()
  this.saveScoreboard()
}

handleBlur(inputFieldNameParmIn){
  console.log('running handleBlur')
  // lotsa work just to reset msg1 when he exits a field (blur)
  if (this.someFieldWasChanged) {
    this.someFieldWasChanged = false
    return // dont run any blur logic, cuz he changed an input field.
  } else {
    this.msg1 = 'edit scoreboard details.' //this.msg1 + ' and blur occurred'
  }
  this.someFieldWasChanged = false
} // end handleBlur

// handleBlur(htmlInputFieldDomObjParmIn){
//   learn about html dom for input fields
//   if(htmlInputFieldDomObjParmIn.name.length > 0){alert('wingo')}
//   if(htmlInputFieldDomObjParmIn.id.length > 0){alert('wingo2')}
//   console.log('332 htmlInputFieldParmIn:')
//   console.table(htmlInputFieldDomObjParmIn)
//   //console.table(Object.keys(htmlInputFieldDomObjParmIn)) //useless?
//   }


setRanges(questCount,biggestChoice){
  // selzer Dec 2022 automatically compute ranges,
// based on the questions that are already setup
// how many questions add to this scoreboard?
// if he hits the biggest choice, how many points is this?
// (assume all questions have the same biggest choice)
//..
// do we have access to the question list?
// ..
questCount = 10 // temp, kill later
biggestChoice = 8 // temp, kill later
let maxPoints = questCount * biggestChoice
// count questions for this scoreboard
// look thru all questions, find biggestChoice
let vlBottom = 0   
let vlTop    = maxPoints * .25             //20
let qlBottom = maxPoints * .25 + .001            //around 20 
let qlTop    = maxPoints * .3125           //25
let rlBottom = maxPoints * .3125   + .001       //around 25
let rlTop    = maxPoints * .4375          //35
let mlBottom = maxPoints * .4375          //35
let mlTop    = maxPoints * .5     - .001        //around 40
let mllBottom = maxPoints * .5            //40
let mllTop    = maxPoints * .5625    -.001     // around 45
let emBottom = maxPoints  *.5625          //45
let emTop     = maxPoints *.5625          //45
let mlhBottom = maxPoints *.5625  + .001   // around 45
let mlhTop   = maxPoints - (maxPoints * .375)         //50
let mhBottom = maxPoints - (maxPoints * .375) + .001  //around 50
let mhTop    = maxPoints - (maxPoints * .3125)           //55
let rhBottom =  maxPoints - (maxPoints * .3125) +.001    //around 55
let rhTop    = maxPoints - (maxPoints * .1875)         //65 
let qhBottom = maxPoints - (maxPoints * .1875) + .001  //around 65
let qhTop    = maxPoints - (maxPoints * .125)  -.001   //around 70
let vhBottom = maxPoints - (maxPoints * .125)          // 70 
let vhTop    = maxPoints

// console.log('vl range: ',vlBottom,vlTop)
// console.log('ql range: ',qlBottom,qlTop)
// console.log('rl range: ',rlBottom,rlTop)
console.log('mlh range: ',mlhBottom,mlhTop)
// console.log('em range: ',emBottom,emTop)
this.rangerArray = [
       {
         rangeName: 'very low',
         rangeNbr: '1',
         rangeStart: '00',
         rangeEnd: vlTop.toString(),
         rangeTxt: 'very low'
        },{
          rangeName: 'quite low',
          rangeNbr: '1',
          rangeStart: qlBottom.toString(),
          rangeEnd: qlTop.toString(),
          rangeTxt: 'quite low'
         },{
          rangeName: 'reasonably low',
          rangeNbr: '1',
          rangeStart: rlBottom.toString(),
          rangeEnd: rlTop.toString(),
          rangeTxt: 'reasonably low'
         },{
          rangeName: 'middle low',
          rangeNbr: '1',
          rangeStart: mlBottom.toString(),
          rangeEnd: mlTop.toString(),
          rangeTxt: 'middle low'
         },{
          rangeName: 'middle leaning low',
          rangeNbr: '1',
          rangeStart: mllBottom.toString(),
          rangeEnd: mllTop.toString(),
          rangeTxt: 'middle leaning low'
         },{
          rangeName: 'exact middle',
          rangeNbr: '1',
          rangeStart: emBottom.toString(),
          rangeEnd: emTop.toString(),
          rangeTxt: 'exact middle'
         },{
          rangeName: 'middle leaning high',
          rangeNbr: '1',
          rangeStart: mlhBottom.toString(),
          rangeEnd: mlhTop.toString(),
          rangeTxt: 'middle leaning high'
         },{
          rangeName: 'middle high',
          rangeNbr: '1',
          rangeStart: mhBottom.toString(),
          rangeEnd: mhTop.toString(),
          rangeTxt: 'middle high'
          },{
          rangeName: 'reasonably high',
          rangeNbr: '1',
          rangeStart: rhBottom.toString(),
          rangeEnd: rhTop.toString(),
          rangeTxt: 'reasonably high'
         },{
          rangeName: 'quite high',
          rangeNbr: '1',
          rangeStart: qhBottom.toString(),
          rangeEnd: qhTop.toString(),
          rangeTxt: 'quite high'
         },{
          rangeName: 'very high',
          rangeNbr: '1',
          rangeStart: vhBottom.toString(),
          rangeEnd: vhTop.toString(),
          rangeTxt: 'very high'
         }
] // end of rangerArray
// alert(this.rangerArray.length)
} // end fun setRanges

} // end export
