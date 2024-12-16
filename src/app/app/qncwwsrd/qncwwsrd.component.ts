import { Component, OnInit, Input } from '@angular/core'
import { EventEmitter, Output     } from '@angular/core'
import apiFauna    from '../../../src/utils/apiFauna'
import apiSupabase from '../../../src/utils/apiSupabase'
import colSortFilt from '../../utils/colSortFilt'

@Component({
  selector: 'app-qncwwsrd',
  templateUrl: './qncwwsrd.component.html'
})
export class QncwwsrdComponent implements OnInit {
  @Input() custIn:any
  @Input() qidIn:any
  @Input() scoreboardNbrIn:any
  @Input() scoreboardsIn:any
  @Input() scoreboardRangesIn:any
  @Input() faunaOrSupabaseIn:any
  @Output() wwsrJumpOut = new EventEmitter()
  msg1 = 'edit scoreboard.'
  sx = -1
  scoreboardObj =     {
    id: 0 ,
    cust: '?',
    qid: '?',
    scoreboardNbr: '?',
    scoreboardName: '?',
    scoreboardSeq:  '?',
    filterInOut: '?'
  }
  rangeObj = {
    'id' : 0,
    'cust'       : '?',
    'qid'        : '?',
    'scoreboardNbr' : '?',
    'rangeNbr'   :'?',
    'rangeName'  :'?',
    'rangeStart' : '?',
    'rangeEnd'   : '?',
    'rangeTxt'   : '?'
  }  
  rangeTxtCols = 75
  rangeTxtRows = 3
  verifyDelete = false
  fieldsDisabled = false
  someFieldWasChanged = false
  rangeArray = [
    {
      'id' : 0 ,
      'scoreboardNbr' : '?',
      'rangeNbr'   :'?',
      'rangeName'  :'?',
      'rangeStart' : '?',
      'rangeEnd'   : '?',
      'rangeTxt'   : '?'
    }  ]
  supaFlds = {}

  // about supaRes and supResOnAdd  ( i hate typescript)
  // read,chg,del functions on netlify return 'data'  so they use supaRes
  // add function on netlify returns 'supabaseData' so it uses supaResOnAdd
  // in other words, I coded the functions differently. My Bad.
  //let { data } = await supabaseClient  ---- all functions do this.
  // let supabaseData = data //stupid add function does this.
  // see netlify functions in the netlify deploy area of playground.
  // source code for netlify functions were also downloaded Oct2024.
  // someday, make functions consistent.
  //  maybe move them to funcs.flyTechFree.com


  supaRes =  {
    "data": [
      {
        "id": 1,
        "name": "Afghanistan"
      },
      {
        "id": 2,
        "name": "Albania"
      },
      {
        "id": 3,
        "name": "Algeria"
      }
    ],
    "status": 200,
    "statusText": "OK"
  }
  supaResOnAdd = {
    "supabaseData": [
      {
        "id": 1,
        "name": "Afghanistan"
      },
      {
        "id": 2,
        "name": "Albania"
      },
      {
        "id": 3,
        "name": "Algeria"
      }
    ],
    "status": 200,
    "statusText": "OK"
  } 
  // supaDataArray =  [
  //   {
  //     "id": 1,
  //     "name": "Afghanistan"
  //   },
  //   {
  //     "id": 2,
  //     "name": "Albania"
  //   },
  //   {
  //     "id": 3,
  //     "name": "Algeria"
  //   }
  // ]

  faunaDataObj = {}


  colSort(fieldName:any,ascDes:any,fieldMsg:any){
    let colSortOut = colSortFilt.colSort(this.rangeArray,fieldName,ascDes,fieldMsg)
    this.rangeArray = colSortOut[0] // not really needed cuz shallow/deep copy rules
    this.msg1    = colSortOut[3]
  } // end colSort

  ngOnInit() {
    console.log('running wwsrd ngOnInit')
    this.sx = this.scoreboardsIn.length - 1
    if (this.scoreboardNbrIn==-1){ //he clicked add New on prior screen
      this.addButClick()
    } else {
      this.sx = this.scoreboardsIn
      .findIndex((s:any) => s.scoreboardNbr == this.scoreboardNbrIn)
      this.rangeArray = this.scoreboardRangesIn
      .filter((r:any) => r.scoreboardNbr == this.scoreboardNbrIn)
      if(this.rangeArray.length>0){
        this.colSort('rangeStart','des','Range Start') //sorts rangeArray
      }//end if
    } // end if
  } // end ngOnInit

  prevButClick(){
    console.log('running prevButClick')
    this.msg1 = 'first scoreboard shown.' //might be overwritten below
    let loopSx = this.sx
    while (loopSx > 0) {
      loopSx = loopSx - 1
      if (this.scoreboardsIn[loopSx].filterInOut == 'in') {
        this.sx = loopSx
        this.msg1 = 'previous scoreboard shown.'
        // this is a rec we want to show. sx is set.
        this.rangeArray = this.scoreboardRangesIn
        .filter((r:any) => r.scoreboardNbr == this.scoreboardsIn[this.sx].scoreboardNbr)
        loopSx = 0 // exit the while loop
      } // end if filter
    } // end while loopSx
  } // end prevButClick

  nextButClick(){
    console.log('running nextButClick')
    this.msg1 = 'last scoreboard shown.' //might be overwritten below
    let loopSx = this.sx
    while (loopSx < this.scoreboardsIn.length-1) {
      loopSx = loopSx + 1
      if (this.scoreboardsIn[loopSx].filterInOut == 'in') {
        this.sx = loopSx
        this.msg1 = 'next scoreboard shown.'
        // this is a rec we want to show. sx is set.
        this.rangeArray = this.scoreboardRangesIn
        .filter((r:any) => r.scoreboardNbr == this.scoreboardsIn[this.sx].scoreboardNbr)
        loopSx = 9999 // exit the while loop
      } // end if filter
    } // end while loopSx
  } // end nextButClick
  
  async addButClick(){
    console.log('running addButClick')
    this.fieldsDisabled = true
    this.msg1 = 'adding a scoreboard ...'
    let newScoreboardNbr = '01' // might be overwritten below
    if (this.scoreboardsIn.length > 0) {
      //  set new scoreboard nbr to one bigger than max scoreboard nbr
      let scoreboardNbrMax = 
        Math.max.apply(Math, this.scoreboardsIn.map(function(s:any) { return s.scoreboardNbr }))
      newScoreboardNbr = (scoreboardNbrMax + 1).toString().padStart(2, '0')
    } // end if scoreboardsIn.length > 0
    let newScoreboardName = 'sb' + newScoreboardNbr
    let newScoreboardSeq  = newScoreboardNbr // why seq? assess report shows scoreboards in sequence.
    // someday setDefaultRanges here
    // 1 add a scoreboard row to the scoreboardsIn array,
    // 2 then add a rec to the db. 
    // 3 after db add, set scoreboardsIn[sx].id from supaData
    this.scoreboardObj =  { // new scoreboard. same obj for fauna,supabase.
      id:  0,
      cust: this.custIn,
      qid: this.qidIn,
      scoreboardNbr: newScoreboardNbr,
      scoreboardName: newScoreboardName,
      filterInOut: 'in',
      scoreboardSeq: newScoreboardSeq // seq might be an extra unused field
    } // end set scoreboardObj 
    this.scoreboardsIn.push(this.scoreboardObj) 
    this.sx = this.scoreboardsIn.length -1 
    console.log('104 adding a new scoreboard')
    if (this.faunaOrSupabaseIn=='fauna'){
      this.launchAddFaunaScoreboard()}
    if (this.faunaOrSupabaseIn=='supabase'){
      this.supaFlds = this.scoreboardObj
      await this.launchAddSupabase('qtScoreboards',this.supaFlds)
        // id from supabase add. wait for launchAddSupabase to finish.
      this.scoreboardsIn[this.sx].id = this.supaResOnAdd.supabaseData[0].id
    } // end if supabase

    this.scoreboardNbrIn = newScoreboardNbr
    this.rangeArray = []   // show blank ranges for the newly added scoreboard:
    this.msg1 = 'scoreboard added.'
    this.fieldsDisabled = false
    console.table(this.scoreboardsIn)
  } // end addButClick

  delButClick(){
    this.msg1=''
    this.verifyDelete = true
    this.fieldsDisabled = true
    window.scrollTo(0, 0) // 'are you sure?' shows at the top
  } // end delButClick

  proceedWithDelete(){
    console.log('running proceedWithDelete')
    this.msg1 = 'deleting...'
    this.verifyDelete = false
    this.fieldsDisabled = false
    // notice no await here, cuz we don't use anything from supabase response.
    // 1 for the scoreboard we are deleting, kill all ranges from two range arrays & db
    // 2 delete the scoreboard rec from the db
    // 3 remove scoreboard from scoreboardsIn array.
    // 4 re-position scoreboardsIn to show an adjacent scoreboard on-screen
    // 5 re-establish rangeArray for the adjacent scoreboard.

    // remember the scoreboard we are deleting:
    let scoreboardNbrWork = this.scoreboardsIn[this.sx].scoreboardNbr  
    
    // kill all the ranges for this scoreboard: 
    let rl = this.rangeArray.length
    for (let i=rl-1; i>=0; i--){
      console.log('152 deleting a range')
      this.delRange(i)
    } // end for

    //  delete the db scoreboard 
    this.buildScoreboardObj(this.sx)
    if (this.faunaOrSupabaseIn == 'fauna'){
      this.launchDeleteFaunaScoreboard()
    }
    if (this.faunaOrSupabaseIn == 'supabase'){
      this.supaFlds = this.scoreboardObj
      this.launchDelSupabase('qtScoreboards',this.supaFlds)
      // this.launchDelSupabase('qtScoreboardRanges',this.supaFlds)
    }

    // remove the scoreboard from the scoreboardsIn array:
    this.scoreboardsIn.splice(this.sx,1) 

    // after he deletes a scoreboard, show adjacent scoreboard on screen.
    //sx is all set, cuz splice was done.
    if (this.sx > this.scoreboardsIn.length -1 ) { // he deleted last rec.
       this.sx = this.scoreboardsIn.length -1  
     } // end 
     
     if (this.scoreboardsIn.length==0){
      //billy, maybe tell him nicer, that we will jump to the list screen.
      alert('no scoreboards left. Leaving this screen.')
      this.wwsrJumpOut.emit()
    } // end if, no scoreboards left
    // show ranges for the newly shown adjacent scoreboard
    this.rangeArray = this.scoreboardRangesIn
    .filter((r:any) => r.scoreboardNbr == this.scoreboardsIn[this.sx].scoreboardNbr)
    this.msg1 = 'scoreboard ' + scoreboardNbrWork + ' deleted.'
   } // end proceedWithDelete

  cancelDelete(){
    this.verifyDelete = false
    this.fieldsDisabled = false
  } // end cancelDelete

  saveScoreboard(sx:any){ // only for a chg to an existing rec
    console.log('running wwsrd saveScoreboard')
    this.msg1 = 'saving...'
    this.someFieldWasChanged = true  
    this.buildScoreboardObj(sx) 
    if (this.faunaOrSupabaseIn=='fauna'){
        this.launchUpdateFaunaScoreboard()
    }
    if (this.faunaOrSupabaseIn=='supabase'){
      this.supaFlds = this.scoreboardObj
      this.launchChgSupabase('qtScoreboards',this.supaFlds)
    }
    this.msg1 = 'scoreboard saved.'
  } // end saveScoreboard

  saveRange(rx:any){
    console.log('231 running saveRange')
    this.buildRangeObj(rx) 
    if (this.faunaOrSupabaseIn=='fauna'){
      this.launchUpdateFaunaScoreboardRange()}
    if (this.faunaOrSupabaseIn=='supabase'){
      this.supaFlds = this.rangeObj
      this.launchChgSupabase('qtScoreboardRanges',this.supaFlds)}
    // a range is uniquely identified by 
    // cust + qid + scoreboardNbr + rangeNbr
    this.someFieldWasChanged = true  
    this.msg1 = 'scoreboard range saved.'
    console.log('306 rangeArray:')
    console.table(this.rangeArray)
  } // end saveRange

  buildScoreboardObj(i:any){
  console.log('running buildScoreboardObj')
  this.scoreboardObj = 
    {
      id: this.scoreboardsIn[i].id,
      cust: this.custIn,
      qid: this.qidIn,
      scoreboardNbr: this.scoreboardsIn[i].scoreboardNbr,
      scoreboardName: this.scoreboardsIn[i].scoreboardName,
      scoreboardSeq: this.scoreboardsIn[i].scoreboardSeq,
      filterInOut: 'in'
    }
    if (this.faunaOrSupabaseIn == 'supabase'){
      this.scoreboardObj['id'] = this.scoreboardsIn[this.sx]['id']
    } // end if
    console.table(this.scoreboardObj)
  } // end buildScoreboardObj

  buildRangeObj(rx:any){
    console.log('running buildRangeObj')
    console.table(this.rangeArray)
    if (this.faunaOrSupabaseIn == 'supabase'){
      this.rangeObj = 
      {
        id: this.rangeArray[rx].id,
        cust: this.custIn,
        qid: this.qidIn,
        scoreboardNbr: this.rangeArray[rx].scoreboardNbr,
        rangeNbr: this.rangeArray[rx].rangeNbr,
        rangeName: this.rangeArray[rx].rangeName,
        rangeStart: this.rangeArray[rx].rangeStart,
        rangeEnd:  this.rangeArray[rx].rangeEnd,
        rangeTxt:  this.rangeArray[rx].rangeTxt
        }
    } // end if

    if (this.faunaOrSupabaseIn == 'fauna'){
      this.rangeObj = 
      {
        id: this.rangeArray[rx].id,
        cust: this.custIn,
        qid: this.qidIn,
        scoreboardNbr: this.scoreboardsIn[this.sx].scoreboardNbr,
        rangeNbr: this.rangeArray[rx].rangeNbr,
        rangeName: this.rangeArray[rx].rangeName,
        rangeStart: this.rangeArray[rx].rangeStart,
        rangeEnd:  this.rangeArray[rx].rangeEnd,
        rangeTxt:  this.rangeArray[rx].rangeTxt
        }

    } // end if

      // default rangeObj values from screen display. 
      // one of these values will change after calling this func.

  } // end buildRangeObj

 async addRangeButClick(){
    console.log('running addRangeButClick')
    // he wants to add a range.
    //  we want to push a range object into scoreboardRanges table.
    // set max:
    let newRangeNbr = '01'
    if (this.rangeArray.length > 0) {
      let rangeNbrMax = 
        Math.max.apply(Math, this.rangeArray.map(function(r:any) { return r.rangeNbr }))

        newRangeNbr = (rangeNbrMax + 1).toString().padStart(2, '0')
    }
     this.rangeObj = {
        id: 0,
      cust: this.custIn,
       qid: this.qidIn,
      scoreboardNbr: this.scoreboardsIn[this.sx].scoreboardNbr,
      rangeNbr:  newRangeNbr, 
      rangeName:'range' + newRangeNbr, 
      rangeStart:'0', 
      rangeEnd:  '999', 
      rangeTxt:  'the meaning of this range is _____.'
    }

    if (this.faunaOrSupabaseIn=='fauna'){
      this.launchAddFaunaScoreboardRange()}
    if (this.faunaOrSupabaseIn=='supabase'){
      this.supaFlds = this.rangeObj
      await this.launchAddSupabase('qtScoreboardRanges',this.supaFlds)
      // id from supabase. Wait for launchAddSupabase to finish,
      // let myId:number = 0 // set from supabase add
      //     myId = this.supaDataArray[0].id
      //     this.rangeObj =
      //     Object.defineProperty(this.rangeObj, "id", {value: myId})         
          // this.scoreboardRangesIn[this.rx] = this.rangeObj
    } // end if supabase
      this.rangeObj.id = this.supaResOnAdd.supabaseData[0].id

      this.scoreboardRangesIn.push(this.rangeObj)
      this.rangeArray.push(this.rangeObj)
      this.msg1 = 'range added.'
  } // end addRangeButClick

  delRangeButClick(rx:any){
    console.log('running delRangeButClick')
    this.delRange(rx)
  }  // end delRangeButClick

  delRange(rx:any){
    console.log('running delRange')
    // console.log(this.rangeArray[rx].id)
    this.buildRangeObj(rx)
    if (this.faunaOrSupabaseIn=='fauna'){
      this.launchDeleteFaunaScoreboardRange()}
    if (this.faunaOrSupabaseIn=='supabase'){
      this.supaFlds = this.rangeObj
      this.launchDelSupabase('qtScoreboardRanges',this.supaFlds)}
    let rrx = this.scoreboardRangesIn
     .findIndex((rr:any) => rr.scoreboardNbr == this.scoreboardNbrIn
      && rr.rangeNbr == this.rangeArray[rx].rangeNbr)
    this.scoreboardRangesIn.splice(rrx,1)  
    // console.log('293 scoreboardRangesIn:')
    // console.table(this.scoreboardRangesIn)
    this.rangeArray.splice(rx,1) //removes one row from rangeArray
    this.msg1 = 'range deleted.'
  } //end delRange

  async launchAddFaunaScoreboard(){
    console.log('running  wwsrd launchAddScoreboard')
    let faunaRes = await apiFauna.qtAddScoreboard(this.scoreboardObj)
    this.faunaDataObj = faunaRes.data
    console.log('faunaDataObj scoreboard we just added:') 
    console.table(this.faunaDataObj)
  } // end launchAddFaunaScoreboard

  async launchUpdateFaunaScoreboard(){
    console.log('running  wwsrd launchUpdateFaunaScoreboard')
    let faunaRes = await apiFauna.qtUpdateScoreboard(this.scoreboardObj)
    this.faunaDataObj = faunaRes.data
    console.log('faunaDataObj scoreboard we just updated:') 
    console.table(this.faunaDataObj)
  } // end launchUpdateFaunaScoreboard

  async launchDeleteFaunaScoreboard(){
    console.log('running  wwsrd launchDeleteFaunaScoreboard')
    let faunaRes = await apiFauna.qtDeleteScoreboard(this.scoreboardObj)
    this.faunaDataObj = faunaRes.data
    console.log('faunaDataObj scoreboard we just deleted:') 
    console.table(this.faunaDataObj)
  } // end launchDeleteFaunaScoreboard

  async launchAddFaunaScoreboardRange(){
    console.log('running  wwsrd launchAddFaunaScoreboardRange')
    let faunaRes = await apiFauna.qtAddScoreboardRange(this.rangeObj)
    this.faunaDataObj = faunaRes.data
    console.log('faunaDataObj range we just added:') 
    console.table(this.faunaDataObj)
  } // end launchAddFaunaScoreboardRange

  async launchUpdateFaunaScoreboardRange(){
    console.log('running  wwsrd launchUpdateScoreboardRange')
    let faunaRes = await apiFauna.qtUpdateScoreboardRange(this.rangeObj)
    this.faunaDataObj = faunaRes.data
    console.log('faunaDataObj range we just updated:') 
    console.table(this.faunaDataObj)
  } // end launchUpdateScoreboardRange

  async launchDeleteFaunaScoreboardRange(){
    console.log('running  wwsrd launchDeleteScoreboardRange')
    let faunaRes = await apiFauna.qtDeleteScoreboardRange(this.rangeObj)
    this.faunaDataObj = faunaRes.data
    console.log('faunaDataObj range we just deleted:') 
    console.table(this.faunaDataObj)
  } // end launchDeleteFaunaScoreboardRange

  async launchAddSupabase(tbl:any,flds:any) {
    console.log('running launchAddSupabase.  flds:')
    this.supaResOnAdd = await apiSupabase.addSupabase(tbl,flds)
    // supaResOnAdd has mult components, one is a supabaseData array.
    // the first entry in the supabaseData array is the object.
    // we want this data cuz it has the new id.
  } // end launchAddSupabase

  async launchDelSupabase(tbl:any,flds:any) {
    console.log('running launchDelSupabase.  flds:')
    console.table(flds)
    this.supaRes = await apiSupabase.delSupabase(tbl,flds)
  } // end launchDelSupabase

  async launchChgSupabase(tbl:any,flds:any) {
    console.log('running launchChgSupabase.  flds:')
    console.table(flds)
    this.supaRes = await apiSupabase.chgSupabase(tbl,flds)
  }  // end launchChgSupabase

  scoreboardNameChg(newScoreboardName:any,sx:any){
    console.log('running scoreboardNameChg')
    this.msg1 = 'scoreboard name changed. '
    this.scoreboardsIn[sx].scoreboardName = newScoreboardName.trim()
    this.saveScoreboard(sx)
  } // end scoreboardNameChg

  scoreboardSeqChg(newScoreboardSeq:any,sx:any){
    console.log('running scoreboardSeqChg')
    this.msg1 = 'scoreboard seq changed. '
    this.scoreboardsIn[sx].scoreboardSeq = newScoreboardSeq.trim()
    this.saveScoreboard(sx)
  } // end scoreboardSeqChg

  rangeNameChg(newRangeName:any,rx:any){
    console.log('running rangeNameChg')
    this.msg1 = 'range name changed. '
    this.rangeArray[rx].rangeName = newRangeName.trim() 
    this.saveRange(rx)
  } // end rangeNameChg

  rangeStartChg(newRangeStart:any,rx:any){
     // he changed the range start  
     console.log('running wwsrd rangeStartChg')
     this.msg1 = 'range start changed. '
     this.rangeArray[rx].rangeStart = newRangeStart.trim() 
     this.saveRange(rx)
  } // end rangeStartChg

   rangeEndChg(newRangeEnd:any,rx:any){
    // he changed the range end  
    console.log('running wwsrd rangeEndChg')
    this.msg1 = 'range end changed. '
    this.rangeArray[rx].rangeEnd = newRangeEnd.trim() 
    this.saveRange(rx)
   } // end rangeEndChg

  rangeTxtChg(newRangeTxt:any,rx:any){
    // he changed the range txt . 
    // Oct2024 kill commas cuz later csv duznt like em.
    let newerRangeTxt =newRangeTxt.replaceAll(',','-')
    console.log('running wwsrd rangeTxtChg')
    this.msg1 = 'range text changed. '
    this.rangeArray[rx].rangeTxt = newerRangeTxt.trim() 
    this.saveRange(rx)
  } // end rangeTxtChg

  handleBlur(inputFieldNameParmIn:any){
    console.log('running handleBlur')
    // lotsa work just to set msg1 when he exits a field (blur)
    if (this.someFieldWasChanged) {
      this.someFieldWasChanged = false
    } else {
      this.msg1 = 'edit scoreboard.' 
    }
    this.someFieldWasChanged = false
  } // end handleBlur

  setDefaultRanges(questCount:any,biggestChoice:any){
  // selzer Dec 2022 automatically compute ranges,
  // based on the questions that are already setup
  // how many questions add to this scoreboard?
  // if he hits the biggest choice, how many points is this?
  // (assume all questions have the same biggest choice)
  // assume he will first setup questions,
  // then setup scoreboards for these questions,
  // then setup ranges for the scoreboards.
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
this.rangeArray = [
       {
        id: 0,
        scoreboardNbr: this.scoreboardsIn[this.sx].scoreboardNbr,
        rangeName: 'very low',
        rangeNbr: '01',
         rangeStart: '00',
         rangeEnd: vlTop.toString(),
         rangeTxt: 'very low'
        },{
          id: 0,
          scoreboardNbr: this.scoreboardsIn[this.sx].scoreboardNbr,
          rangeName: 'quite low',
          rangeNbr: '02',
          rangeStart: qlBottom.toString(),
          rangeEnd: qlTop.toString(),
          rangeTxt: 'quite low'
         },{
          id: 0,
          scoreboardNbr: this.scoreboardsIn[this.sx].scoreboardNbr,
          rangeName: 'reasonably low',
          rangeNbr: '03',
          rangeStart: rlBottom.toString(),
          rangeEnd: rlTop.toString(),
          rangeTxt: 'reasonably low'
         },{
          id: 0,
          scoreboardNbr: this.scoreboardsIn[this.sx].scoreboardNbr,
          rangeName: 'middle low',
          rangeNbr: '04',
          rangeStart: mlBottom.toString(),
          rangeEnd: mlTop.toString(),
          rangeTxt: 'middle low'
         },{
          id: 0,
          scoreboardNbr: this.scoreboardsIn[this.sx].scoreboardNbr,
          rangeName: 'middle leaning low',
          rangeNbr: '05',
          rangeStart: mllBottom.toString(),
          rangeEnd: mllTop.toString(),
          rangeTxt: 'middle leaning low'
         },{
          id: 0,
          scoreboardNbr: this.scoreboardsIn[this.sx].scoreboardNbr,
          rangeName: 'exact middle',
          rangeNbr: '06',
          rangeStart: emBottom.toString(),
          rangeEnd: emTop.toString(),
          rangeTxt: 'exact middle'
         },{
          id:0,
          scoreboardNbr: this.scoreboardsIn[this.sx].scoreboardNbr,
          rangeName: 'middle leaning high',
          rangeNbr: '07',
          rangeStart: mlhBottom.toString(),
          rangeEnd: mlhTop.toString(),
          rangeTxt: 'middle leaning high'
         },{
          id:0,
          scoreboardNbr: this.scoreboardsIn[this.sx].scoreboardNbr,
          rangeName: 'middle high',
          rangeNbr: '08',
          rangeStart: mhBottom.toString(),
          rangeEnd: mhTop.toString(),
          rangeTxt: 'middle high'
        },{
          id:0,
          scoreboardNbr: this.scoreboardsIn[this.sx].scoreboardNbr,
          rangeName: 'reasonably high',
          rangeNbr: '09',
          rangeStart: rhBottom.toString(),
          rangeEnd: rhTop.toString(),
          rangeTxt: 'reasonably high'
         },{
          id:0,
          scoreboardNbr: this.scoreboardsIn[this.sx].scoreboardNbr,
          rangeName: 'quite high',
          rangeNbr: '10',
          rangeStart: qhBottom.toString(),
          rangeEnd: qhTop.toString(),
          rangeTxt: 'quite high'
         },{
          id:0,
          scoreboardNbr: this.scoreboardsIn[this.sx].scoreboardNbr,
          rangeName: 'very high',
          rangeNbr: '11',
          rangeStart: vhBottom.toString(),
          rangeEnd: vhTop.toString(),
          rangeTxt: 'very high'
         }
         //billy, now ya have to create range recs in the database.
] // end of rangeArray
  } // end fun setDefaultRanges

} // end export