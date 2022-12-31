import { Component, OnInit, Input } from '@angular/core'
import { EventEmitter, Output     } from '@angular/core'
import apiFauna from 'src/utils/apiFauna'

@Component({
  selector: 'app-qncwwgd',
  templateUrl: './qncwwgd.component.html' 
})
export class QncwwgdComponent implements OnInit {
  // constructor() { }
  @Input() custIn
  @Input() qidIn
  @Input() groupNbrIn
  @Input() groupsIn  
  @Output() wwgJumpOut = new EventEmitter()
  constructor(){}
  msg1 = 'edit group details.'
  // symArUp    = '\u{2191}'
  // symArDn    = '\u{2193}'
  // symFilt    = '\u{2207}'  
  // colHeadSf = false
  // colSortByArray = []
  gx = -1
  groupObj = {}
  qtDbDataObj = {} 
  pendingAddGx = -1
  verifyDelete = false
  fieldsDisabled = false
  someFieldWasChanged = false
  ngOnInit() {
    console.log('running wwgd ngOnInit')
    //console.table(this.groupsIn)
    //console.log('groupNbrIn:',this.groupNbrIn)
    if (this.groupNbrIn==-1){
      // he clicked add on the list screen.
      this.addButClick()
      this.gx = 0
      this.msg1 ='New starter group created. Ready for your changes.'
    }  // end if
    this.findGroupIx() 

  } // end ngOnInit

  findGroupIx(){
    this.gx = this.groupsIn
    .findIndex(g => g.groupNbr == this.groupNbrIn)
  }

  prevButClick(){
    console.log('running prevButClick')
    this.msg1 = 'first group shown.'
    let loopGx = this.gx
    while (loopGx > 0) {
      loopGx = loopGx - 1
      if (this.groupsIn[loopGx].gFilterInOut == 'in') {
        this.gx = loopGx
        this.msg1 = 'previous group shown.'
        // this is a rec we want to show. gx is set.
        loopGx = 0 // lets exit the while loop
      }
    } // end while
  } // end prevButClick

  nextButClick(){
    this.msg1 = 'last group shown.'
    let loopGx = this.gx
    while (loopGx < this.groupsIn.length-1) {
      loopGx = loopGx + 1
      if (this.groupsIn[loopGx].gFilterInOut == 'in') {
        this.gx = loopGx
        this.msg1 = 'next group shown.'
        // this is a rec we want to show. gx is set.
        loopGx = 9999 // lets exit the while loop
      }
    } // end while
  } // end nextButClick

  addButClick(){
    console.log('running wwgd addButClick')
    this.msg1 = 'edit this new group.'
    let newGroupNbr = '1'
    if (this.groupsIn.length > 0) {
      //  set new group nbr to one bigger than max group nbr
      let groupNbrMax = 
        Math.max.apply(Math, this.groupsIn.map(function(g) { return g.groupNbr }))
        newGroupNbr = (groupNbrMax + 1).toString() //.padStart(3, '0')
        console.log('new group nbr:',newGroupNbr)
    } //end if
    let newSeq = '1'
    let newGroupName = 'groupMain'
    if ( this.groupsIn.findIndex(g => g.groupName == 'groupMain') > -1 ){
      // group name: groupMain already exists.
      newGroupName ='group'  + newGroupNbr //.padStart(3, '0')
      newSeq = '1' // Dec 2021 set default to all the same seq: 1
    } // end if


    this.groupsIn.push(
      {
        cust: this.custIn,
        qid: this.qidIn,
        groupNbr: newGroupNbr,
        groupName: newGroupName,
        seq: newSeq
      }
      ) // end push
      this.gx = this.groupsIn.length - 1
      this.pendingAddGx = this.gx // when he hits save, we use this.
      this.msg1 = 'adding group nbr: ' + this.groupsIn[this.gx].groupNbr
      this.saveGroup() //auto save
      this.msg1 ='New starter group created. Ready for your changes.'
      this.groupsIn[this.gx].gFilterInOut = 'in'
      this.groupNbrIn = newGroupNbr  
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
    .filter(g => g.groupName==this.groupsIn[this.gx].groupName).length
    
    if (grpCount==1){
      // this is the only group rec with this groupName
      if (this.groupsIn[this.gx].qCount > 0 ){
        this.msg1='cannot delete group: ' 
        + this.groupsIn[this.gx].groupName
        + '. There are questions that belong to this group.'
        return
      } // end if
      if (this.groupsIn[this.gx].groupName=='groupMain'){
        this.msg1='cannot delete group:  groupMain.'
        return
      } // end 
    }
    this.msg1=''
    this.verifyDelete=true
    this.fieldsDisabled = true
  } // end delButClick

  proceedWithDelete(){
    console.log('running proceedWithDelete')
    this.msg1 = 'deleting...'
    // delete group from group array.
    // call database api
    // figure out gx of the on-screen group, 
    // and delete-splice it from array:
    this.verifyDelete=false
    this.fieldsDisabled = false
    let groupNbrWork = this.groupsIn[this.gx].groupNbr  
    this.gx = this.groupsIn
      .findIndex(q => q.groupNbr == groupNbrWork)
    //  delete the db group
    this.buildGroupObj()
    this.launchQtDeleteGroup()
    // delete the array group:
    this.groupsIn.splice(this.gx,1) 
    // after he deletes a group, show adjacent group on screen.
    this.gx = this.gx + 1 
    if (this.gx > this.groupsIn.length -1 ) {
       this.gx = this.groupsIn.length -1  
     }
     this.msg1 = 'group ' + groupNbrWork + ' deleted.'
     if (this.groupsIn.length==0){
       //billy, maybe tell him nicer, that we will jump to the list screen.
       alert('no groups left. Leaving this screen.')
       this.wwgJumpOut.emit()
     }
  } // end proceedWithDelete

  cancelDelete(){
     this.verifyDelete = false
     this.fieldsDisabled = false
  } // end cancelDelete

  saveButClick(){
    console.log('running saveButClick')
    this.msg1 = ''
    this.saveGroup()
  } // end saveButClick

  saveGroup(){
    console.log('running wwgd saveGroup')
    this.someFieldWasChanged = true  
    this.msg1 = this.msg1 + ' group autosaved.'
    this.buildGroupObj() // uses current gx  billy fix
    if (this.pendingAddGx >= 0) {
      this.launchQtAddGroup()
      this.pendingAddGx = -1
    } else {
      //  this is a changed group:
      this.launchQtUpdateGroup()
    }
  }

  buildGroupObj(){
    this.groupObj = 
    {
      cust: this.custIn,
      qid: this.qidIn,
      groupNbr:    this.groupsIn[this.gx].groupNbr,
      groupName:   this.groupsIn[this.gx].groupName,
      seq:         this.groupsIn[this.gx].seq
    }
  }

  groupNameChg(newGroupName,gx)  {
    console.log('running groupNameChg to ',newGroupName)
    // dec 2022 don't let him change the group to a name that already exists.
    let ix = this.groupsIn.findIndex(g=> g.groupName == newGroupName.trim())
    console.table(this.groupsIn)
    let el = document.getElementById('groupName')
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

  groupSeqChg(newSeq,gx)  {
    console.log('running groupSeqChg to ',newSeq)
    this.msg1 = 'sequence changed. '
    this.groupsIn[gx].seq = newSeq.trim()
    this.saveGroup()
  } // end groupSeqChg

launchQtAddGroup(){
  console.log('running wwgd launchQtAddGroup')
  apiFauna.qtAddGroup(this.groupObj)
  .then ((qtDbRtnObj) => { this.qtDbDataObj = qtDbRtnObj.data})
  // return from this on-the-fly function is implied  
  .catch(() => {
    console.log('launchQtAddGroup error. groupObj:' +  this.groupObj)
  })
} // end launchQtAddGroup

launchQtDeleteGroup(){
  console.log('running  wwgd launchQtDeleteGroup')
  apiFauna.qtDeleteGroup(this.groupObj)
  .then ((qtDbRtnObj) => {this.qtDbDataObj = qtDbRtnObj.data})
  // return from this on-the-fly function is implied  
  .catch(() => {
    console.log('launchQtDeleteGroup error. groupObj:' +  this.groupObj)
  })

}  // end launchQtDeleteGroup

launchQtUpdateGroup(){
  console.log('running  wwrd launchQtUpdateGroup')
  apiFauna.qtUpdateGroup(this.groupObj)
  .then ((qtDbRtnObj) => {this.qtDbDataObj = qtDbRtnObj.data})
  // return from  on-the-fly function is implied. 
  .catch(() => {
    console.log('launchQtUpdateGroup error. groupObj:', this.groupObj )
  })

} // end launchQtUpdateGroup

handleBlur(inputFieldNameParmIn){
  console.log('252 running handleBlur')
  // lotsa work just to reset msg1 when he exits a field (blur)
  if (this.someFieldWasChanged) {
    this.someFieldWasChanged = false
    return // dont run any blur logic, cuz he changed an input field.
  } else {
    console.log('258')
    if( this.msg1.length==0){
      this.msg1 = 'edit group details.' //this.msg1 + ' and blur occurred'
    }
  }
  this.someFieldWasChanged = false
} // end handleBlur

} // end export component
