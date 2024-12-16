import { Component, OnInit, Input} from '@angular/core'
import { EventEmitter, Output             }  from '@angular/core'
import apiFauna    from '../../../src/utils/apiFauna'
import apiSupabase from '../../../src/utils/apiSupabase'
// import signal      from '@angular/core' //duznt work by itself.
// import { ChangeDetectorRef }  from '@angular/core'

@Component({
  selector: 'app-qncwwqd',
  templateUrl: './qncwwqd.component.html'
})
export class QncwwqdComponent implements OnInit {
  constructor() { }
  // constructor(private cdr: ChangeDetectorRef) { } //duznt work
  @Input() custIn:any
  @Input() qidIn:any
  @Input() questionNbrIn:any
  @Input() questionsIn:any  // questions list
  @Input() rulesIn:any
  @Input() subsetsIn:any 
  @Input() faunaOrSupabaseIn:any
  @Output() wwqJumpOut = new EventEmitter()
  msg1 = 'edit question.'
  qx = -1
  rulesArrayThisSubset = [
    {
    'accum': '?',
    'oper': '?',
    'thresh': '?'
    }
  ]
  fullRuleWords = '(none)'
  // todaysDate = new Date().toJSON().split("T")[0]
  questObj = {}
  qtDbDataObj = {} 
  rangeTxtCols = 72
  rangeTxtRows = 4
  verifyDelete = false
  fieldsDisabled = false
  seqErr = ''   

  //ang bug signal - no call sig unless import is combined for @angular/core
  // mingo = signal<string>('0')
  someFieldWasChanged = false
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

  supaRes = {
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

  // supaDataObj = {'id':0}
  supaDataArray =  [
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
  ]

  faunaDataObj = {}

  ngOnInit() {
    if (this.questionNbrIn==-1){  //he clicked add New on prior screen
      this.addButClick()
    } else {
      this.qx = this.questionsIn.findIndex((q:any) => q.questNbr == this.questionNbrIn)
    } // end else if
    this.chkSubsetAccumMatch(this.questionsIn[this.qx].subset)

  } // end ngOnInit


  
  prevButClick(){
    // console.log('running prevButClick')
    if(this.seqErr > ''){return}  //he can't leave cuz he has an error
    this.msg1 = 'first question shown.'
    let loopQx = this.qx
    while (loopQx > 0) {
      loopQx = loopQx - 1
      if (this.questionsIn[loopQx].filterInOut == 'in') {
        this.qx = loopQx
        this.msg1 = 'previous question shown.'
        // this is a rec we want to show. qx is set.
        this.chkSubsetAccumMatch(this.questionsIn[this.qx].subset)
        loopQx = 0 // lets exit the while loop
      }
    } // end while
  } // end prevButClick

  nextButClick(){
    if(this.seqErr > ''){return}  //he can't leave cuz he has an error
    this.msg1 = 'last question shown.'      
     this.seqErr = '' //default
    let loopQx = this.qx
    while (loopQx < this.questionsIn.length-1) {
      loopQx = loopQx + 1
      if (this.questionsIn[loopQx].filterInOut == 'in') {
        this.qx = loopQx
        this.msg1 = 'next question shown.'
        // this is a rec we want to show. qx is set.
        this.chkSubsetAccumMatch(this.questionsIn[this.qx].subset)
        loopQx = 9999 // lets exit the while loop
      }
    } // end while
  } // end nextButClick

  async addButClick(){
    console.log('running wwqd addButClick')
    if(this.seqErr > ''){return}  //he can't leave cuz he has an error
    this.fieldsDisabled = true
    this.msg1 = 'adding a question...'
    this.seqErr = '' //default
    let newQuestNbr = '01'
    if (this.questionsIn.length > 0) {
      //  set new quest nbr to one bigger than max quest nbr
      let questNbrMax = 
        Math.max.apply(Math, this.questionsIn.map(function(q:any) { return q.questNbr }))
      newQuestNbr = (questNbrMax + 1).toString().padStart(2, '0')
    } // end if questionsIn.length > 0
    let newSeq = '' + newQuestNbr
    // 1 add a question row to the questionsIn array,
    // 2 then add a rec to the db. 
    // 3 after db add, set questionsIn[gx].id from supaDataObj
    this.questObj =
    {
      cust: this.custIn,
      qid: this.qidIn,
      questNbr: newQuestNbr,
      questSeq: newSeq,
      questTxt: "new question text",
      preQuest: "new pre-question text",
      aca: ["continue"],
      acaPointVals: [0],
      acaFrame: [],
      accum: ["sbMisc"],
      subset: 'grpMain',
      filterInOut: 'in',
      id: 0
     }
    this.questionsIn.push( this.questObj )
    console.log('wwqd 109 questionIn:')
    console.table(this.questionsIn)
    this.qx = this.questionsIn.length - 1
    this.chkSubsetAccumMatch(this.questionsIn[this.qx].subset)

    if (this.faunaOrSupabaseIn=='fauna'){
      this.launchAddFaunaQuestion()}
    if (this.faunaOrSupabaseIn=='supabase'){
      this.supaFlds = this.questObj
      await this.launchAddSupabase('qtQuestions',this.supaFlds)
        // id from supabase add. wait for launchAddSupabase to finish.
        this.questionsIn[this.qx].id = this.supaResOnAdd.supabaseData[0].id
    } // end if supabase

    this.msg1 = 'added question nbr: ' + this.questionsIn[this.qx].questNbr
    this.questionNbrIn =  newQuestNbr
    this.fieldsDisabled = false
    // // questionsIn has one more question than the db.
    // this.msg1 = 'adding question nbr: ' + this.questionsIn[this.qx].questNbr
    // this.saveQuestion() //auto save
    // this.msg1 ='New starter question created. Ready for your changes.'
    // this.questionsIn[this.qx].filterInOut = 'in'
    // billy also add subset to subSetsIn if needed
    //alert('added new question to questionsIn with subset: group1')
  } // end addButClick

  delButClick(){
    if(this.seqErr > ''){return}  //he can't leave cuz he has an error
    this.msg1=''
    this.verifyDelete=true
    this.fieldsDisabled = true
  } // end delButClick

  proceedWithDelete(){
    console.log('running proceedWithDelete')
    this.msg1 = 'deleting...'
    // notice no await here, cuz we don't use anything from supabase response.
    // 2 delete the  rec from the db
    // 3 remove question from questionIn array.
    // 4 re-position questionIn to show an adjacent question on-screen

    this.verifyDelete=false
    this.fieldsDisabled = false
     let questNbrWork = this.questionsIn[this.qx].questNbr  
     this.qx = this.questionsIn
     .findIndex((q:any) => q.questNbr == questNbrWork)   
     //  delete the db question
     this.buildQuestObj()
     if (this.faunaOrSupabaseIn == 'fauna'){
       this.launchDeleteFaunaQuestion()}
     if (this.faunaOrSupabaseIn == 'supabase'){
       this.supaFlds = this.questObj
       this.launchDelSupabase('qtQuestions',this.supaFlds)}
 
     // remove the question from the questionsIn array:
     this.questionsIn.splice(this.qx,1) 
    // after he deletes a question, show adjacent group on screen.
    // gx is all set, cuz splice was done.

    if (this.qx > this.questionsIn.length -1 ) { // he deleted last rec.
      this.qx = this.questionsIn.length -1  
    } // end if
    this.msg1 = 'question ' + questNbrWork + ' deleted.'
    if (this.questionsIn.length==0){
      //billy, maybe tell him nicer, that we will jump to the list screen.
      alert('no questions left. Leaving this screen.')
      this.wwqJumpOut.emit()
     } // end if, no questions left



   // delete old subset from subsetsIn if this is last quest of subset:
   // is it weird though, what if we just left the old subset hanging?
   // i mean, he has a hanging subset when he 'adds a new group'
   // on the other screen.
   //this.chkDelSubsetForSubsets(this.questionsIn[this.qx].subset) 
   //  delete the db question
  //  this.buildQuestionObj()

  //  this.launchQtDeleteQuestion()
  //  // delete the array question:
  //  this.questionsIn.splice(this.qx,1) 
  //  // after he deletes a quest, show adjacent question on screen.
  //  this.qx = this.qx + 1 
  //  if(this.qx > this.questionsIn.length -1 ) {
  //     this.qx = this.questionsIn.length -1  
  //   }
  //   this.msg1 = 'question ' + questNbrWork + ' deleted.'
  //   if (this.questionsIn.length==0){
  //     //billy, maybe tell him nicer, that we will jump to the list screen.
  //     alert('no questions left. Leaving this screen.')
  //     this.jumpToWwq()
  //   }
  } // end proceedWithDelete

  cancelDelete(){
    this.verifyDelete = false
    this.fieldsDisabled = false
  } // end cancelDelete

  saveQuestion(){
    console.log('running wwqd saveQuestion')
    this.someFieldWasChanged = true  
    this.msg1 = 'saving...'
    this.buildQuestObj() // uses current qx
    if (this.faunaOrSupabaseIn=='fauna'){
      this.launchUpdateFaunaQuestion()}
    if (this.faunaOrSupabaseIn=='supabase'){
      this.supaFlds = this.questObj
      this.launchChgSupabase('qtQuestions',this.supaFlds)}
    this.msg1 = 'question changed.'
  } // end saveQuestion

  buildQuestObj(){
    console.log('291 running wwqd buildQuestObj ')
    this.questObj = 
    {
      cust: this.custIn,
      qid: this.qidIn,
      questNbr: this.questionsIn[this.qx].questNbr,
      questSeq: this.questionsIn[this.qx].questSeq,
      questTxt: this.questionsIn[this.qx].questTxt,
      preQuest: this.questionsIn[this.qx].preQuest,
      subset:  this.questionsIn[this.qx].subset,
      id:      this.questionsIn[this.qx].id,      
      aca:          '[' + this.questionsIn[this.qx].aca + ']',
      acaPointVals: '[' + this.questionsIn[this.qx].acaPointVals + ']',
      accum:        '[' + this.questionsIn[this.qx].accum+ ']',
      acaFrame:     '[' + this.questionsIn[this.qx].acaFrame + ']'
    }
    // console.log('311 wwqd questObj:')
    // console.table(this.questObj)
    // beware, someday get fauna working & fauna duznt like array brackets?
    // if (this.faunaOrSupabaseIn == 'supabase'){
    //   this.questObj['id']           = this.questionsIn[this.qx]['id']
    //   this.questObj['aca']          = '['  + this.questObj['aca']          + ']'
    //   this.questObj['acaPointVals'] = '['  + this.questObj['acaPointVals'] + ']'
    //   this.questObj['accum']        = '['  + this.questObj['accum']        + ']'
    //   this.questObj['acaFrame']     = '['  + this.questObj['acaFrame']     + ']'
    // } // end if
  } // end buildQuestObj

  ranSeqButClick(qx:any){
   this.msg1 = 'question sequence randomized. '
   this.seqErr = '' 
   let ms = new Date().getMilliseconds()
   this.questionsIn[qx].questSeq =
   (Math.floor(Math.random() * Math.floor(ms))).toString()
   this.saveQuestion()
  }

  questTxtChg(newQuestTxt:any,qx:any){
    console.log('running questTxtChg to ',newQuestTxt)
    this.msg1 = 'question text changed. '
    this.questionsIn[qx].questTxt = newQuestTxt
    this.saveQuestion()
  } // end questTxtChg

  questSeqChg(newQuestSeq:any,qx:any){
    console.log('running questSeqChg') //see html seqErr, handleSeqInput()
    if (this.seqErr.length>0){
      return // seqErr was already set. dont do update.
    } 
    // handleSeqInput() did most editing, but it only does 1 chr at a time.
    if (newQuestSeq.length == 1  && newQuestSeq == '.') {
      this.seqErr = 'You must have a number to go with this decimal.'
      return
    }
      //weird case, strip off last period left hanging by handleSeqInput()
    if (newQuestSeq.length > 0  && newQuestSeq.slice(-1) === '.') {
      newQuestSeq = newQuestSeq.slice(0, -1)
    }

    this.msg1 = 'question sequence changed. ' 
    this.questionsIn[this.qx].questSeq  = newQuestSeq
    this.saveQuestion()
  } // end questSeqChg

  handleSeqInput(ev:any){
    console.log('127 running handleSeqInput')
    // sheesh, lotsa work just to prevent bad input & give nice errmsg.
    this.seqErr = '' // set default to no-error.
    ev.target.value = ev.target.value.trim() //gets rid of lead/trail space

    //nicely gets rid of extra periods:
    let ar = ev.target.value.split(".") //.filter((x:any)=>x!='')
    console.table(ar)
    if(ar.length== 1){ev.target.value=ar[0]}   
    if(ar.length>  1){ev.target.value=ar[0]+ '.' + ar[1]}
    // weird case:
    // if he types a period that's fine, we expect another char later.
    // but if he leaves a period on the end, we clean it in questSeqChg()

    let listOfNumbers = '0123456789.'
    let oneChar='?'
    for (let i=0; i < ev.target.value.length; i++){
      oneChar = ev.target.value.substring(i,i+1)
      if (!listOfNumbers.includes(oneChar)){
        this.seqErr = 'sequence cannot contain non-numeric characters. ' 
        return
      }// end if   
    }// end for
     
    if (ev.target.value.length<1) {
      this.seqErr = 'sequence cannot be blank.'
      this.msg1 = 'sequence error. '
      return
    }

  } // end handleSeqInput


  subsetChg(newSubset:any,qx:any){
    this.msg1 = 'group changed. '

    // he changed the subset on the screen.  now its complicated.  
    // a. we assume he is changing the subset this question belongs to.
    // b. we assume he is NOT renaming the old subset to a new name.
    // if a rule already exist for the old name, we dont care.
    // if a rule already exist for the new name, let's show it.
    // if a rule does not exist for the new name, show blank
 
    // change rulesIn.subset to newly changed subset (not wanted)
    //this.setSubsetForRules(this.questionsIn[qx].subset,ev.target.value)

    // add new subset to subsetsIn if its not there already:
    //this.setSubsetForSubsets(newSubset)

    // delete old subset from subsetsIn if no questions any more:
    //this.chkDelSubsetForSubsets(this.questionsIn[qx].subset)
    this.questionsIn[qx].subset = newSubset.trim()
    this.saveQuestion()
    this.chkSubsetAccumMatch(this.questionsIn[qx].subset)
  } // end subsetChg

  preQuestChg(newPreQuest:any,qx:any){
    this.msg1 = 'pre-question changed. '
    this.questionsIn[qx].preQuest = newPreQuest.trim()
    this.saveQuestion()
  } // end preQuestChg
  
  questAcaChg(newAca:any,qx:any,ax:any){
    let newerAca = newAca.replaceAll(",", "-") 
    // Oct2024 kill commas.  they are tricky.
    this.msg1 = 'answer choice changed. '
    this.questionsIn[qx].aca[ax] = newerAca
    this.saveQuestion()
  } // end questAcaChg

  questAccumChg(newScoreboard:any,qx:any,accumNbr:any) {
    console.log('running questAccumChg')
    this.msg1 = 'scoreboard changed. '
    newScoreboard = newScoreboard.trim()
    if (newScoreboard.length == 0) {
      this.questionsIn[qx].accum.splice(accumNbr,1) //delete accum
    } else { 
      this.questionsIn[qx].accum[accumNbr] = newScoreboard
    }
    this.saveQuestion()
  } // end questAccumChg

  questAcaPointValChg(newAcaPoints:any,qx:any,ax:any){
    this.msg1 = 'point value changed. '
    if (Number(newAcaPoints) > -1 
    &&  Number(newAcaPoints) <= 99999) {
      // he entered a nice number
      this.questionsIn[qx].acaPointVals[ax] = newAcaPoints
      // html input formats PointVal field as a string,
      // so parseInt the pointval into a number.
      if (typeof(newAcaPoints) == 'string') {
        this.questionsIn[qx].acaPointVals[ax] = parseInt(newAcaPoints)
      }
    } else {
      // billy, duznt work?
      this.msg1 = 'you entered a wrong value into Points.'
    }
    this.saveQuestion()
  } // end questAcaPointValChg

  acaFrameChg(newAcaFrame:any,qx:any){
    if(newAcaFrame.length<1){newAcaFrame=' '}
    this.msg1 = 'answer choice frame changed. '
    this.questionsIn[qx].acaFrame = newAcaFrame.split(",")
    this.saveQuestion()
  }

  findQuestIx(){
    this.qx = this.questionsIn
    .findIndex((q:any) => q.questNbr == this.questionNbrIn)
  } // end findQuestIx

  chkSubsetAccumMatch(subsetParmIn:any){ 
    console.log('running chkSubsetAccumMatch')
    // console.log('wwqd 422 subsetParmIn:' + subsetParmIn)
    // console.log('rulesIn: ')
    // console.table(this.rulesIn)
    //set fullRuleWords like 'accum1 > 13'
    let  rulesTempArray = this.rulesIn
    // .filter(function(r:any)  {   r.subset == subsetTempVarr  }) //end inline function 
    .filter(chkSubset)
    function chkSubset(s:any){return s.subset == subsetParmIn }
    // console.log('432 done filter: rulesTempArray ')
    // console.table(rulesTempArray)
    this.rulesArrayThisSubset = rulesTempArray
    // console.table(this.rulesArrayThisSubset)
    if (this.rulesArrayThisSubset.length > 0) {
      this.fullRuleWords = this.rulesArrayThisSubset[0].accum + ' '
      + this.rulesArrayThisSubset[0].oper + ' '
      + this.rulesArrayThisSubset[0].thresh
      console.log('247 hit set fullRuleWords to a real rule: ', this.fullRuleWords)
    } else {
      this.fullRuleWords = '(none)'
      console.log('251 set fullRuleWords to (none) ')
    }// end else

  } // end chkSubsetAccumMatch
  
  addAnswerChoice(){
    console.log('running addAnswerChoice')
    // append into question.aca array and append into question.acaPoints
    this.msg1 = 'edit this new answer choice.'
    this.questionsIn[this.qx].aca.push('newChoice')
    this.questionsIn[this.qx].acaPointVals.push(0)
    this.saveQuestion() // 

    let elId: HTMLInputElement = 
      document.getElementById('htmlIdBottomOfPage') as HTMLInputElement
    elId.scrollIntoView();
  }

  setAnswerChoice13(){
    console.log('running setAnswerChoice13')
    // append into question.aca array and append into question.acaPoints
    this.msg1 = 'answer choices set to 1-3. '
    this.questionsIn[this.qx].aca = []
    this.questionsIn[this.qx].aca[0] = '1'
    this.questionsIn[this.qx].aca[1] = '2'
    this.questionsIn[this.qx].aca[2] = '3'
    this.questionsIn[this.qx].acaPointVals   = []
    this.questionsIn[this.qx].acaPointVals[0] = 1
    this.questionsIn[this.qx].acaPointVals[1] = 2
    this.questionsIn[this.qx].acaPointVals[2] = 3
    this.saveQuestion() // 
    let elId: HTMLInputElement = 
      document.getElementById('htmlIdBottomOfPage') as HTMLInputElement
    elId.scrollIntoView();
  }

  setAnswerChoice15(){
    console.log('running setAnswerChoice15')
    // append into question.aca array and append into question.acaPoints
    this.msg1 = 'answer choices set to 1-5. '
    this.questionsIn[this.qx].aca = []
    this.questionsIn[this.qx].aca[0] = '1'
    this.questionsIn[this.qx].aca[1] = '2'
    this.questionsIn[this.qx].aca[2] = '3'
    this.questionsIn[this.qx].aca[3] = '4'
    this.questionsIn[this.qx].aca[4] = '5'
    this.questionsIn[this.qx].acaPointVals   = []
    this.questionsIn[this.qx].acaPointVals[0] = 1
    this.questionsIn[this.qx].acaPointVals[1] = 2
    this.questionsIn[this.qx].acaPointVals[2] = 3
    this.questionsIn[this.qx].acaPointVals[3] = 4
    this.questionsIn[this.qx].acaPointVals[4] = 5
    this.saveQuestion() // 
    let elId: HTMLInputElement = 
      document.getElementById('htmlIdBottomOfPage') as HTMLInputElement
    elId.scrollIntoView();
  }

  setAnswerChoice18(){
    console.log('running setAnswerChoice18')
    // append into question.aca array and append into question.acaPoints
    this.msg1 = 'answer choices set to 1-8. '
    this.questionsIn[this.qx].aca = []
    this.questionsIn[this.qx].aca[0] = '1'
    this.questionsIn[this.qx].aca[1] = '2'
    this.questionsIn[this.qx].aca[2] = '3'
    this.questionsIn[this.qx].aca[3] = '4'
    this.questionsIn[this.qx].aca[4] = '5'
    this.questionsIn[this.qx].aca[5] = '6'
    this.questionsIn[this.qx].aca[6] = '7'
    this.questionsIn[this.qx].aca[7] = '8'
    this.questionsIn[this.qx].acaPointVals   = []
    this.questionsIn[this.qx].acaPointVals[0] = 1
    this.questionsIn[this.qx].acaPointVals[1] = 2
    this.questionsIn[this.qx].acaPointVals[2] = 3
    this.questionsIn[this.qx].acaPointVals[3] = 4
    this.questionsIn[this.qx].acaPointVals[4] = 5
    this.questionsIn[this.qx].acaPointVals[5] = 6
    this.questionsIn[this.qx].acaPointVals[6] = 7
    this.questionsIn[this.qx].acaPointVals[7] = 8
    this.saveQuestion() // 
    let elId: HTMLInputElement = 
      document.getElementById('htmlIdBottomOfPage') as HTMLInputElement
    elId.scrollIntoView();
  }

  delAnswerChoice(ax:any){
    console.log('running delChoice. qx: ',this.qx,'ax: ',ax)
    // delete-splice from the aca from this question
    this.questionsIn[this.qx].aca.splice(ax,1)
    this.questionsIn[this.qx].acaPointVals.splice(ax,1)    
    this.saveQuestion() // 
  }

  async launchAddFaunaQuestion() {
    console.log('running  wwqd launchQtAddFaunaQuestion')
    let faunaRes = await apiFauna.qtWriteQuestion(this.questObj)
    this.faunaDataObj = faunaRes.data
    console.log('faunaDataObj question we just added:') 
    console.table(this.faunaDataObj)
  } //end launchQtAddFaunaQuestion
   
  async launchDeleteFaunaQuestion() {
    console.log('running  wwqd launchQtDeleteFaunaQuestion')
    let faunaRes = await apiFauna.qtDeleteQuestion(this.questObj)
    this.faunaDataObj = faunaRes.data
    console.log('faunaDataObj question we just deleted:') 
    console.table(this.faunaDataObj)
  } //end launchQtDeleteFaunaQuestion
 
  async launchUpdateFaunaQuestion() {
    console.log('running  wwqd launchUpdateFaunaQuestion')
    let faunaRes = await apiFauna.qtUpdateQuestion(this.questObj)
    this.faunaDataObj = faunaRes.data
    console.log('faunaDataObj question we just updated:') 
    console.table(this.faunaDataObj)
  } //end launchUpdateFaunaQuestion

  async launchAddSupabase(tbl:any,flds:any) {
    console.log('wwqd 560 running launchAddSupabase.  flds:')
    console.table(flds)
    this.supaResOnAdd = await apiSupabase.addSupabase(tbl,flds)
    // supaRes has mult components, one is a supabaseData array.
  // the first entry in the supabaseData array is the added object.
  // we want this data cuz it has the new id.
  } // end launchAddSupabase

  async launchDelSupabase(tbl:any,flds:any) {
    console.log('running launchDelSupabase. flds:')
    console.table(flds)
    this.supaRes = await apiSupabase.delSupabase(tbl,flds)
  } // end launchDelSupabase

  async launchChgSupabase(tbl:any,flds:any) {
    console.log('running launchChgSupabase.  flds:')
    console.log(tbl)
    console.table(flds)
    this.supaRes = await apiSupabase.chgSupabase(tbl,flds)
  }  // end launchChgSupabase

  handleBlur(ev:any){
    console.log('running handleBlur')
    // lotsa work just to set msg1 when he exits a field (blur)
    if (this.someFieldWasChanged) {
      this.someFieldWasChanged = false
    } else {
      this.msg1 = 'edit question'
    }
    this.someFieldWasChanged = false
  } // end handleBlur

} // end class QncwwqdComponent

