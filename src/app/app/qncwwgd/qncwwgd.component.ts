import { Component, OnInit, Input } from '@angular/core'
import { EventEmitter, Output     } from '@angular/core'
import apiFauna from '../../../src/utils/apiFauna'
import apiSupabase from '../../../src/utils/apiSupabase'
// import apiSupabase from '../../../src/utils/apiSupabase'


@Component({
  selector: 'app-qncwwgd',
  templateUrl: './qncwwgd.component.html' 
})
export class QncwwgdComponent implements OnInit {
  // constructor() { }
  @Input() custIn:any
  @Input() qidIn:any
  @Input() groupNbrIn:any
  @Input() groupsIn:any
  @Input() faunaOrSupabaseIn:any
  @Output() wwgJumpOut = new EventEmitter()
  constructor(){}
  msg1 = 'edit group.'
  gx = -1
  groupObj = {
    cust: '?',
    qid: '?',
    groupNbr: '?',
    groupName: '?',
    seq: '?',
    filterInOut: 'in',
    id : 0
  }
  // qtDbDataObj = {} 
  verifyDelete = false
  fieldsDisabled = false
  someFieldWasChanged = false
  seqErr = ''
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
  //     {
  //       "id": 1,
  //       "name": "Afghanistan"
  //     },
  //     {
  //       "id": 2,
  //       "name": "Albania"
  //     },
  //     {
  //       "id": 3,
  //       "name": "Algeria"
  //     }
  //   ]
  faunaDataObj = {}

  ngOnInit() {
    console.log('running wwgd ngOnInit')
    console.log('faunaOrSupabase: ',this.faunaOrSupabaseIn)
    if (this.groupNbrIn==-1){  //he clicked add New on prior screen
      this.addButClick()
    } else {
      this.gx = this.groupsIn.findIndex((g:any) => g.groupNbr == this.groupNbrIn)
    }  // end if
  } // end ngOnInit


  prevButClick(){
    console.log('running prevButClick')
    console.table(this.groupsIn)
    this.msg1 = 'first group shown.'
    let loopGx = this.gx
    while (loopGx > 0) {
      loopGx = loopGx - 1
      if (this.groupsIn[loopGx].filterInOut == 'in') {
        console.log('63')
        this.gx = loopGx
        this.msg1 = 'previous group shown.'
        // this is a rec we want to show. gx is set.
        loopGx = 0 // lets exit the while loop
      }
    } // end while
  } // end prevButClick

  nextButClick(){
    this.msg1 = 'last group shown.'
    console.log('groupsIn:')
    console.table(this.groupsIn)
    let loopGx = this.gx
    while (loopGx < this.groupsIn.length-1) {
      loopGx = loopGx + 1
      if (this.groupsIn[loopGx].filterInOut == 'in') {
        this.gx = loopGx
        this.msg1 = 'next group shown.'
        // this is a rec we want to show. gx is set.
        loopGx = 9999 // lets exit the while loop
      }
    } // end while
  } // end nextButClick

  async addButClick(){
    console.log('running wwgd addButClick')
    this.fieldsDisabled = true
    this.msg1 = 'adding a group...'
    let newGroupNbr = '01'
    if (this.groupsIn.length > 0) {
      //  set new group nbr to one bigger than max group nbr
      let groupNbrMax = 
        Math.max.apply(Math, this.groupsIn.map(function(g:any) { return g.groupNbr }))
        newGroupNbr = (groupNbrMax + 1).toString().padStart(2, '0')
        console.log('new group nbr:',newGroupNbr)
    } //end if
    let newSeq = '1'
    let newGroupName = 'grpMain'
    if ( this.groupsIn.findIndex((g:any) => g.groupName == 'grpMain') > -1 ){
      // group name:  already exists.
      newGroupName ='grp'  + newGroupNbr //.padStart(3, '0')
      newSeq = '1' // Dec 2021 set default to all the same seq: 1
    } // end if

    // 1 add a group row to the group array,
    // 2 then add a rec to the db. 
    // 3 after db add, set group[gx].id from supa Data 

    this.groupObj = { // new group. same obj for fauna,supabase.
        cust: this.custIn,
        qid: this.qidIn,
        groupNbr: newGroupNbr,
        groupName: newGroupName,
        seq: newSeq,
        filterInOut: 'in',
        id: 0
    } // end set groupObj 
    this.groupsIn.push(this.groupObj) 
      this.gx = this.groupsIn.length - 1
      if (this.faunaOrSupabaseIn=='fauna'){
        this.launchAddFaunaGroup()}
      if (this.faunaOrSupabaseIn=='supabase'){
        this.supaFlds = this.groupObj
        await this.launchAddSupabase('qtGroups',this.supaFlds)
        // id from supabase add. wait for launchAddSupabase to finish.
        this.groupsIn[this.gx].id = this.supaResOnAdd.supabaseData[0].id
      } // end if supabase
      this.msg1 = 'added group nbr: ' + this.groupsIn[this.gx].groupNbr
      this.groupNbrIn = newGroupNbr  
      this.fieldsDisabled = false
  } // end addButClick

  delButClick(){
    // dec 2022 cant delete if groupMain, or if any questions
    // already add to this scoreboard.
    // though, we let him delete dups -- all but the last rec.
    
    // if (this.groupsIn[this.gx].groupName=='groupMain'){
    //   this.msg1='cannot delete group:  groupMain.'
    //   return
    // } // end 
    // console.log('123')
    // console.table(this.groupsIn)
    // console.log(this.gx)
    // console.log(this.groupsIn[this.gx].qCount)
    // console.log('127 group name:' )
    // console.log(this.groupsIn[this.gx].groupName)
    let grpCount = this.groupsIn
    .filter((g:any) => g.groupName.toLowerCase()==this.groupsIn[this.gx].groupName.toLowerCase()).length
    
    if (grpCount==1){
      // this is the only group rec with this groupName
      if (this.groupsIn[this.gx].qCount > 0 ){
        this.msg1='cannot delete group: ' 
        + this.groupsIn[this.gx].groupName
        + '. There are questions that belong to this group.'
        // console.table(this.groupsIn)
        return
      } // end if
      // if (this.groupsIn[this.gx].groupName=='groupMain'){
      //   this.msg1='cannot delete group:  groupMain.'
      //   return
      // } // end 
    }
    this.msg1=''
    this.verifyDelete=true
    this.fieldsDisabled = true
  } // end delButClick

  proceedWithDelete(){
    console.log('running proceedWithDelete')
    this.msg1 = 'deleting...'
    // notice no await here, cuz we don't use anything from supabase response.
    // 2 delete the group rec from the db
    // 3 remove group from groupIn array.
    // 4 re-position groupIn to show an adjacent group on-screen

    this.verifyDelete=false
    this.fieldsDisabled = false
    let groupNbrWork = this.groupsIn[this.gx].groupNbr  // remember group
    //  delete the db group
    this.buildGroupObj()
    if (this.faunaOrSupabaseIn == 'fauna'){
      this.launchDelFaunaGroup()}
    if (this.faunaOrSupabaseIn == 'supabase'){
      this.supaFlds = this.groupObj
      this.launchDelSupabase('qtGroups',this.supaFlds)}

    // remove the group from the groupsIn array:
    this.groupsIn.splice(this.gx,1) 
    // after he dels a group, show adjacent group on screen.
    //gx is all set, cuz splice was done.
    if (this.gx > this.groupsIn.length -1 ) { // he deleted last rec.
      this.gx = this.groupsIn.length -1  
    } // end if
    this.msg1 = 'group ' + groupNbrWork + ' deleted.'
    if (this.groupsIn.length==0){
      //billy, maybe tell him nicer, that we will jump to the list screen.
      alert('no groups left. Leaving this screen.')
      this.wwgJumpOut.emit()
     } // end if, no groups left
  } // end proceedWithDelete

  cancelDelete(){
     this.verifyDelete = false
     this.fieldsDisabled = false
  } // end cancelDelete

  saveGroup(){
    console.log('running wwgd saveGroup')
    this.someFieldWasChanged = true  
    this.buildGroupObj() // uses current gx  
    if (this.faunaOrSupabaseIn=='fauna'){
      this.launchUpdateFaunaGroup()}
    if (this.faunaOrSupabaseIn=='supabase'){
      this.supaFlds = this.groupObj
      this.launchChgSupabase('qtGroups',this.supaFlds)}
    this.msg1 = 'group saved.'
  }  //end saveGroup   

  buildGroupObj(){
    this.groupObj = 
      {
        cust: this.custIn,
        qid: this.qidIn,
        groupNbr:    this.groupsIn[this.gx].groupNbr,
        groupName:   this.groupsIn[this.gx].groupName,
        seq:         this.groupsIn[this.gx].seq,
        filterInOut: 'in',
        id:          this.groupsIn[this.gx].id
      }
      console.log('303 id:')
      console.log(this.groupsIn[this.gx].id)

    if (this.faunaOrSupabaseIn == 'supabase'){
      // this.groupObj['id'] = this.groupsIn[this.gx].id
    } // end if supabase
  } // end buildGroupObj
  groupNameChg(newGroupName:string,gx:number)  {
    console.log('running groupNameChg to ',newGroupName)
    // dec 2022 don't let him change the group to a name that already exists.
    let ix = this.groupsIn.findIndex((g:any)=> g.groupName == newGroupName.trim())
    let el = document.getElementById('groupName') as HTMLElement
    el.classList.remove("has-background-warning")
    if (ix > -1){
      el.classList.add('has-background-warning')
      this.msg1 = 'cannot change to a group that already exists.'
      return
    }
    this.msg1 = 'group changed. '
    this.groupsIn[gx].groupName = newGroupName.trim()
    this.saveGroup()
  } // end groupNameChg

  groupRndChg(newSeq:any,gx:number)  {
    console.log('running groupRndChg to ',newSeq)
    // we started calling sequence 'a round'.  like a boxing round.
    if (this.seqErr.length>0){
      return // seqErr was already set. dont do update.
    } 
    // handleRndInput() did most editing, but it only does 1 chr at a time.
    if (newSeq.length == 1  && newSeq == '.') {
      this.seqErr = 'You must have a number to go with this decimal.'
      return
    }
    //weird case, strip off last period left hanging by handleRndInput()
    if (newSeq.length > 0  && newSeq.slice(-1) === '.') {
      newSeq = newSeq.slice(0, -1)
    }
  
    this.msg1 = 'round changed. '
    this.groupsIn[gx].seq = newSeq.trim()
    this.saveGroup()
  } // end groupRndChg

  handleRndInput(ev:any){
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
        this.seqErr = 'Round cannot contain non-numeric characters. ' 
        return
      }// end if   
    }// end for
     
    if (ev.target.value.length<1) {
      this.seqErr = 'Round cannot be blank.'
      this.msg1 = 'Round error. '
      return
    }


  }

  async launchAddFaunaGroup(){
    console.log('running wwgd launchAddFaunaGroup')
    let faunaRes = await apiFauna.qtAddGroup(this.groupObj)
    this.faunaDataObj = faunaRes.data
    console.log('faunaDataObj group we just added:') 
    console.table(this.faunaDataObj)
  } // end launchAddFaunaGroup

  async launchDelFaunaGroup(){
    console.log('running  wwgd launchQtDeleteFaunaGroup')
    let faunaRes = await apiFauna.qtDeleteGroup(this.groupObj)
    this.faunaDataObj = faunaRes.data
    console.log('faunaDataObj group we just deleted:') 
    console.table(this.faunaDataObj)
  }  // end launchDelFaunaGroup

  async launchUpdateFaunaGroup(){
    console.log('running  wwrd launchUpdateFaunaGroup')
    let faunaRes = await apiFauna.qtUpdateGroup(this.groupObj)
    this.faunaDataObj = faunaRes.data
    console.log('faunaDataObj group we just updated:') 
    console.table(this.faunaDataObj)
  } // end launchUpdateFaunaGroup

  async launchAddSupabase(tbl:any,flds:any) {
    console.log('wwgd 357 running launchAddSupabase.  flds:')
    console.table(flds)
    this.supaResOnAdd = await apiSupabase.addSupabase(tbl,flds)
    // supaResOnAdd has mult parts, one is a supabaseData array.
    // the first entry in the supabaseData array is the added object.
    // we want this data cuz it has the new id.
  } // end launchAddSupabase

  async launchDelSupabase(tbl:string,flds:object) {
    console.log('running launchDelSupabase.  flds:')
    console.table(flds)
    this.supaRes = await apiSupabase.delSupabase(tbl,flds)
  } // end launchDelSupabase

  async launchChgSupabase(tbl:string,flds:object) {
    console.log('running launchChgSupabase.  flds:')
    // console.table(flds)
    this.supaRes = await apiSupabase.chgSupabase(tbl,flds)
  }  // end launchChgSupabase

  handleBlur(inputFieldNameParmIn:any){
    console.log('running handleBlur')
    // lotsa work just to set msg1 when he exits a field (blur)
    if (this.someFieldWasChanged) {
      this.someFieldWasChanged = false
    } else {
      if( this.msg1.length==0){
      this.msg1 = 'edit group.' 
      }
    }
    this.someFieldWasChanged = false
  } // end handleBlur

} // end export component
