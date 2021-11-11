import { Component, OnInit, Input } from '@angular/core'
import { EventEmitter, Output     } from '@angular/core'
import api from 'src/utils/api'

@Component({
  selector: 'app-qncwwrd',
  templateUrl: './qncwwrd.component.html'
})
export class QncwwrdComponent implements OnInit {
  constructor() { }
  @Input() custIn
  @Input() qidIn
  @Input() ruleNbrIn
  @Input() rulesIn  
  @Output() wwrJumpOut = new EventEmitter()
  msg1 = 'edit rule details.'
  rx = -1
  ruleObj = {}
  qtDbDataObj = {} 
  pendingAddRx = -1
  symDropDown    = '\u{25BC}'  


  ngOnInit() {
    // // billy temp:
    // for (let i = 0; i < this.rulesIn.length; i++) {
    //   if (!this.rulesIn[i].hasOwnProperty('ruleNbr')) {
    //     this.rulesIn[i]['ruleNbr'] = this.fixRuleNbr()
    //   } else {
    //     if (this.rulesIn[i]['ruleNbr'] == '3377' ){
    //       // billy this.rulesIn[i]['ruleNbr'] = this.fixRuleNbr()
    //     } // end if
    //   } // end if
    // } // end for
    // // end billy temp
    
    console.log('running wwrd ngOnInit')
    console.log(this.custIn,this.qidIn)
    console.log(this.ruleNbrIn)
    console.table(this.rulesIn)
    console.log('42 ready to check ruleNbr')
    if (this.ruleNbrIn==-1){
      // no rule rec exists. add a starter rule.
      console.log('45 ready to run addButClick')
      this.addButClick()
      this.rx = 0
      this.msg1 ='New starter rule created. Ready for your changes.'
    } else {
      this.findRuleIx()
    }  

  } // end ngOnInit

  // fixRuleNbr() { //temp billy
  //   let ruleNbrMax = '001'
  //   ruleNbrMax = 
  //     Math.max.apply(Math, 
  //                    this.rulesIn.map(function(r) { return r.ruleNbr }))
  //   return (ruleNbrMax + 1).toString().padStart(3, '0')
     
  // } //end fixRuleNbr 

  findRuleIx(){
    this.rx = this.rulesIn
    .findIndex(r => r.ruleNbr == this.ruleNbrIn)
  }

  prevButClick(){
    console.log('running prevButClick')
    this.msg1 = 'first rule shown.'
    let loopRx = this.rx
    while (loopRx > 0) {
      loopRx = loopRx - 1
      if (this.rulesIn[loopRx].rFilterInOut == 'in') {
        this.rx = loopRx
        this.msg1 = 'previous rule shown.'
        // this is a rec we want to show. rx is set.
        loopRx = 0 // lets exit the while loop
      }
    } // end while
  } // end prevButClick

  nextButClick(){
    this.msg1 = 'last rule shown.'
    let loopRx = this.rx
    while (loopRx < this.rulesIn.length-1) {
      loopRx = loopRx + 1
      if (this.rulesIn[loopRx].rFilterInOut == 'in') {
        this.rx = loopRx
        this.msg1 = 'next rule shown.'
        // this is a rec we want to show. rx is set.
        loopRx = 9999 // lets exit the while loop
      }
    } // end while
  } // end nextButClick

  saveButClick(){
    console.log('running saveButClick')
    this.msg1 = ''
    this.saveRule()
  } // end saveButClick

  saveRule(){
    console.log('running wwrd saveRule')
    this.msg1 = this.msg1 + ' rule saved.'
    this.buildRuleObj() // uses current rx  billy fix
    if (this.pendingAddRx >= 0) {
      this.launchQtAddRule()
      this.pendingAddRx = -1
    } else {
      //  this is a changed rule:
      this.launchQtUpdateRule()
    }
  }

  buildRuleObj(){
    this.ruleObj = 
    {
      cust: this.custIn,
      qid: this.qidIn,
      ruleNbr:    this.rulesIn[this.rx].ruleNbr,
      accum:      this.rulesIn[this.rx].accum,
      oper:       this.rulesIn[this.rx].oper,
      thresh:     this.rulesIn[this.rx].thresh,
      subset:     this.rulesIn[this.rx].subset
    }
    console.table(this.ruleObj)
  }

  addButClick(){
    console.log('running wwrd addButClick')
    this.msg1 = 'edit this new rule.'
    let newRuleNbr = '001'
    if (this.rulesIn.length > 0) {
      //  set new rule nbr to one bigger than max rule nbr
      let ruleNbrMax = 
        Math.max.apply(Math, this.rulesIn.map(function(r) { return r.ruleNbr }))
        newRuleNbr = (ruleNbrMax + 1).toString().padStart(3, '0')
      //alert('new rule nbr: '+ newRuleNbr)
    } //end if
    let newRuleScoreboardName = 'sb001'
    let newRuleGroupName = 'grp001'
    this.rulesIn.push(
      {
        cust: this.custIn,
        qid: this.qidIn,
        ruleNbr: newRuleNbr,
        accum:   newRuleScoreboardName,
        oper: '>',
        thresh: 0,
        subset: newRuleGroupName
      }
      ) // end push
      console.log('wwrd 151 rulesIn:')
      console.table(this.rulesIn)
      this.rx = this.rulesIn.length - 1
      this.pendingAddRx = this.rx // when he hits save, we use this.
      this.msg1 = 'adding rule nbr: ' + this.rulesIn[this.rx].ruleNbr
      this.saveRule() //auto save
      this.msg1 ='New starter rule created. Ready for your changes.'
      this.rulesIn[this.rx].rFilterInOut = 'in'
      console.log('159 end of addButClick')
  } // end addButClick

  delButClick(){
    // delete rule from rule array.
    // call database api
    // figure out rx of the on-screen rule, 
    // and delete-splice it from array:
    let ruleNbrWork = this.rulesIn[this.rx].ruleNbr  
    this.rx = this.rulesIn
      .findIndex(q => q.ruleNbr == ruleNbrWork)
    //  delete the db rule
    this.buildRuleObj()
    this.launchQtDeleteRule()
    // delete the array rule:
    this.rulesIn.splice(this.rx,1) 
    // after he deletes a rule, show adjacent rule on screen.
    this.rx = this.rx + 1 
    if (this.rx > this.rulesIn.length -1 ) {
       this.rx = this.rulesIn.length -1  
     }
     this.msg1 = 'rule ' + ruleNbrWork + ' deleted.'
     if (this.rulesIn.length==0){
       //billy, maybe tell him nicer, that we will jump to the list screen.
       alert('no rules left. Leaving this screen.')
       this.wwrJumpOut.emit()
     }
   } // end delButClick
 
  ruleScoreboardChg(newScoreboard,rx)  {
    console.log('running ruleScoreboardChg to ',newScoreboard)
    this.msg1 = 'scoreboard changed. '
    this.rulesIn[rx].accum = newScoreboard.trim()
    this.saveRule()
  } // end ruleScoreboardChg

  ruleOperChg(newOper,rx) {
    console.log('running ruleOperChg to ', newOper)
    this.msg1 = 'oper changed. '
    this.rulesIn[rx].oper = newOper.trim()
    this.saveRule()
  }

  ruleThreshChg(newThresh,rx) {
    console.log('running ruleThreshChg to ', newThresh)
    this.msg1 = 'threshold changed. '
    this.rulesIn[rx].thresh = newThresh.trim()
    this.saveRule()
  }

  ruleGroupChg(newGroup,rx) {
    console.log('running ruleGroupChg to ',newGroup)
    this.msg1 = 'group changed. '
    this.rulesIn[rx].subset = newGroup.trim()
    this.saveRule()
  }

  launchQtAddRule(){
    console.log('running  wwrd launchQtAddRule')
    //this.ruleObj['ruleNbr'] = '001'
    api.qtWriteRule(this.ruleObj)
    .then ((qtDbRtnObj) => { this.qtDbDataObj = qtDbRtnObj.data})
    // return from this on-the-fly function is implied  
    .catch(() => {
      console.log('launchQtAddRule error. ruleObj:' +  this.ruleObj)
    })

  } // end launchQtAddRule

  launchQtDeleteRule(){
    console.log('running  wwrd launchQtDeleteRule')
    api.qtDeleteRule(this.ruleObj)
    .then ((qtDbRtnObj) => {this.qtDbDataObj = qtDbRtnObj.data})
    // return from this on-the-fly function is implied  
    .catch(() => {
      console.log('launchQtDeleteRule error. ruleObj:' +  this.ruleObj)
    })

  }  // end launchQtDeleteRule

  launchQtUpdateRule(){
    console.log('running  wwrd launchQtUpdateRule')
    api.qtUpdateRule(this.ruleObj)
    .then ((qtDbRtnObj) => {this.qtDbDataObj = qtDbRtnObj.data})
    // return from  on-the-fly function is implied. 
    .catch(() => {
      console.log('launchQtUpdateRule error. ruleObj:', this.ruleObj )
    })
  
  }
}
