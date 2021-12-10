import { Component, OnInit, Input } from '@angular/core'
import { EventEmitter, Output     } from '@angular/core'
import api from 'src/utils/api'

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
    let newGroupNbr = '001'
    if (this.groupsIn.length > 0) {
      //  set new group nbr to one bigger than max group nbr
      let groupNbrMax = 
        Math.max.apply(Math, this.groupsIn.map(function(g) { return g.groupNbr }))
        newGroupNbr = (groupNbrMax + 1).toString().padStart(3, '0')
        console.log('new group nbr:',newGroupNbr)
    } //end if
    let newSeq = '1'
    let newGroupName = 'main'
    if ( this.groupsIn.findIndex(g => g.groupName == 'main') > -1 ){
      // group name: main already exists.
      newGroupName ="grp" + newGroupNbr
      newSeq = '2'
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
    this.msg1 = this.msg1 + ' group saved.'
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
  api.qtAddGroup(this.groupObj)
  .then ((qtDbRtnObj) => { this.qtDbDataObj = qtDbRtnObj.data})
  // return from this on-the-fly function is implied  
  .catch(() => {
    console.log('launchQtAddGroup error. groupObj:' +  this.groupObj)
  })
} // end launchQtAddGroup

launchQtDeleteGroup(){
  console.log('running  wwgd launchQtDeleteGroup')
  api.qtDeleteGroup(this.groupObj)
  .then ((qtDbRtnObj) => {this.qtDbDataObj = qtDbRtnObj.data})
  // return from this on-the-fly function is implied  
  .catch(() => {
    console.log('launchQtDeleteGroup error. groupObj:' +  this.groupObj)
  })

}  // end launchQtDeleteGroup

launchQtUpdateGroup(){
  console.log('running  wwrd launchQtUpdateGroup')
  api.qtUpdateGroup(this.groupObj)
  .then ((qtDbRtnObj) => {this.qtDbDataObj = qtDbRtnObj.data})
  // return from  on-the-fly function is implied. 
  .catch(() => {
    console.log('launchQtUpdateGroup error. groupObj:', this.groupObj )
  })

} // end launchQtUpdateGroup

} // end export component
