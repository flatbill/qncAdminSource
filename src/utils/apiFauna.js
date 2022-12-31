/* Api methods to call /functions */

const create = (data) => {
  return fetch('/.netlify/functions/todos-create', {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}

const readAll = () => {
  return fetch('/.netlify/functions/todos-read-all').then((response) => {
    return response.json()
  })
}

const update = (todoId, data) => {
  return fetch(`/.netlify/functions/todos-update/${todoId}`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}

const deleteTodo = (todoId) => {
  return fetch(`/.netlify/functions/todos-delete/${todoId}`, {
    method: 'POST',
  }).then(response => {
    return response.json()
  })
}

const batchDeleteTodo = (todoIds) => {
  return fetch(`/.netlify/functions/todos-delete-batch`, {
    body: JSON.stringify({
      ids: todoIds
    }),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}
// const qtRead01 = (todoId, data) => {
//   return fetch(`/.netlify/functions/qtRead01/${todoId}`, {
//     body: JSON.stringify(data),
//     //method: 'POST'
//   }).then(response => {
//     return response.json()
//   })
// }
// const qtRead02 = (todoId, data) => {
//   return fetch(`/.netlify/functions/qtRead02/${todoId}`, {
//     body: JSON.stringify(data),
//     //method: 'POST'
//   }).then(response => {
//     return response.json()
//   })
// }
// const qtRead03 = (faunaRecId, data) => {
//   //return fetch(`/.netlify/functions/qtRead03/${todoId}`, {
//     return fetch(`https://qncsurvey.netlify.app/.netlify/functions/qtRead03/${faunaRecId}`, {
//     body: JSON.stringify(data),
//     //method: 'POST'
//   }).then(response => {
//     return response.json()
//   })
// }

const qtWriteAnswer = (data) => {
  return fetch(`https://qncsurvey.netlify.app/.netlify/functions/qtWriteAnswer`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}

const qtWriteQuestion = (data) => {
  return fetch(`https://qncsurvey.netlify.app/.netlify/functions/qtWriteQuestion`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}

// const qtWriteSubset = (data) => {
//   return fetch(`https://qncsurvey.netlify.app/.netlify/functions/qtWriteSubset`, {
//     body: JSON.stringify(data),
//     method: 'POST'
//   }).then(response => {
//     return response.json()
//   })
// }

const qtDeleteQuestion = (data) => {
  return fetch(`https://qncsurvey.netlify.app/.netlify/functions/qtDeleteQuestion`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}

const qtUpdateQuestion = (data) => {
  return fetch(`https://qncsurvey.netlify.app/.netlify/functions/qtUpdateQuestion`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}

const qtUpdateRule = (data) => {
  return fetch(`https://qncsurvey.netlify.app/.netlify/functions/qtUpdateRule`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}

// const qtUpdateSubset = (data) => {
//   return fetch(`https://qncsurvey.netlify.app/.netlify/functions/qtUpdateSubset`, {
//     body: JSON.stringify(data),
//     method: 'POST'
//   }).then(response => {
//     return response.json()
//   })
// }

const qtDeleteRule = (data) => {
  return fetch(`https://qncsurvey.netlify.app/.netlify/functions/qtDeleteRule`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}

const qtReadQuestions = (custParmIn,qidParmIn) => {
  let myUrl =  'https://qncsurvey.netlify.app/.netlify/functions/qtReadQuestions'
  + '?cust=' + custParmIn
  + '&qid=' + qidParmIn
  return fetch(myUrl)
   .then((response) => {
    return response.json()
  })
}

// const qtReadSubsets = (custParmIn,qidParmIn) => {
//   let myUrl = 
//   'https://qncsurvey.netlify.app/.netlify/functions/qtReadSubsets'
//   +'?cust=' + custParmIn
//   +'&qid=' + qidParmIn
//   return fetch(myUrl)
//    .then((response) => {
//     return response.json()
//   })
// }

const qtReadRules= (custParmIn,qidParmIn) => {
  let myUrl = 
  'https://qncsurvey.netlify.app/.netlify/functions/qtReadRules'
  + '?cust=' + custParmIn
  + '&qid=' + qidParmIn
  return fetch(myUrl)
   .then((response) => {
     return response.json()
  })
}

const qtWriteScore = (data) => {
  return fetch(`https://qncsurvey.netlify.app/.netlify/functions/qtWriteScore`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}

const qtWriteRule = (data) => {
  return fetch(`https://qncsurvey.netlify.app/.netlify/functions/qtWriteRule`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}

const qtMassDeleteAnswers = (custParmIn,qidParmIn,userParmIn) => {
  //alert('api.js 194'+userParmIn)
  let myUrl = 
  'https://qncsurvey.netlify.app/.netlify/functions/qtMassDeleteAnswers'
  + '?cust=' + custParmIn
  + '&qid=' + qidParmIn
  + '&user=' + userParmIn
  return fetch(myUrl)
   .then((response) => {
     return response.json()
  })
}
const qtMassDeleteScores = (custParmIn,qidParmIn,userParmIn) => {
  let myUrl = 
  'https://qncsurvey.netlify.app/.netlify/functions/qtMassDeleteScores'
  + '?cust=' + custParmIn
  + '&qid=' + qidParmIn
  + '&user=' + userParmIn
  return fetch(myUrl)
   .then((response) => {
     return response.json()
  })
}
const qtMassDeleteQuestions = (custParmIn,qidParmIn) => {
  let myUrl = 
  'https://qncsurvey.netlify.app/.netlify/functions/qtMassDeleteQuestions'
  + '?cust=' + custParmIn
  + '&qid=' + qidParmIn
  return fetch(myUrl)
   .then((response) => {
     return response.json()
  })
}

const qtMassDeleteRules = (custParmIn,qidParmIn) => {
  let myUrl = 
  'https://qncsurvey.netlify.app/.netlify/functions/qtMassDeleteRules'
  + '?cust=' + custParmIn
  + '&qid=' + qidParmIn
  return fetch(myUrl)
   .then((response) => {
     return response.json()
  })
}

const qtReadScores = (custParmIn,qidParmIn,quserIdParmin,userDateTimeParmin) => {
  let myUrl =  'https://qncsurvey.netlify.app/.netlify/functions/qtReadScores'
  + '?cust=' + custParmIn
  + '&qid=' + qidParmIn
  + '&userId=' + quserIdParmin
  + '&userDateTime=' + userDateTimeParmin
  return fetch(myUrl)
   .then((response) => {
    return response.json()
  })
}

const qtReadAnswers = (custParmIn,qidParmIn,quserIdParmin,userDateTimeParmin) => {
  let myUrl =  'https://qncsurvey.netlify.app/.netlify/functions/qtReadAnswers'
  + '?cust=' + custParmIn
  + '&qid=' + qidParmIn
  + '&userId=' + quserIdParmin
  + '&userDateTime=' + userDateTimeParmin
  return fetch(myUrl)
   .then((response) => {
    return response.json()
  })
}

const qtReadInvitations = (custParmIn,qidParmIn) => {
  let myUrl =  'https://qncsurvey.netlify.app/.netlify/functions/qtReadInvitations'
  + '?cust=' + custParmIn
  + '&qid=' + qidParmIn
  return fetch(myUrl)
   .then((response) => {
    return response.json()
  })
}

const qtReadUsers = (custParmIn,qidParmIn) => {
  let myUrl =  'https://qncsurvey.netlify.app/.netlify/functions/qtReadUsers'
  + '?cust=' + custParmIn
  + '&qid=' + qidParmIn
  return fetch(myUrl)
   .then((response) => {
    return response.json()
  })
}

const qtReadSubscribers = (subscriberParmIn) => {
  let myUrl =  'https://qncsurvey.netlify.app/.netlify/functions/qtReadSubscribers'
  + '?subscriber=' + subscriberParmIn
  return fetch(myUrl)
   .then((response) => {
    return response.json()
  })
}

const qtReadTeamMembers = (teamMemberParmIn) => {
  let myUrl =  'https://qncsurvey.netlify.app/.netlify/functions/qtReadTeamMembers'
  + '?teamMember=' + teamMemberParmIn
  return fetch(myUrl)
   .then((response) => {
    return response.json()
  })
} 
const qtReadScoreboards = (custParmIn,qidParmIn) => {
  let myUrl =  'https://qncsurvey.netlify.app/.netlify/functions/qtReadScoreboards'
  + '?cust=' + custParmIn
  + '&qid=' + qidParmIn
  return fetch(myUrl)
   .then((response) => {
    return response.json()
  })
}

const qtUpdateScoreboard = (data) => {
  return fetch(`https://qncsurvey.netlify.app/.netlify/functions/qtUpdateScoreboard`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}
const qtDeleteScoreboard = (data) => {
  return fetch(`https://qncsurvey.netlify.app/.netlify/functions/qtDeleteScoreboard`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}
const qtAddScoreboard = (data) => {
  return fetch(`https://qncsurvey.netlify.app/.netlify/functions/qtAddScoreboard`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}
const qtAddParticipant = (data) => {
  return fetch(`https://qncsurvey.netlify.app/.netlify/functions/qtAddParticipant`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}
const qtUpdateParticipant = (data) => {
  return fetch(`https://qncsurvey.netlify.app/.netlify/functions/qtUpdateParticipant`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}

const qtReadUser = (custParmIn,qidParmIn,userParmIn) => {
  let myUrl =  'https://qncsurvey.netlify.app/.netlify/functions/qtReadUser'
  + '?cust=' + custParmIn
  + '&qid=' + qidParmIn
  + '&user=' + userParmIn
  return fetch(myUrl)
   .then((response) => {
    return response.json()
  })
}
const qtReadGroups = (custParmIn,qidParmIn) => {
  let myUrl =  'https://qncsurvey.netlify.app/.netlify/functions/qtReadGroups'
  + '?cust=' + custParmIn
  + '&qid=' + qidParmIn
  return fetch(myUrl)
   .then((response) => {
    return response.json()
  })
}

const qtAddGroup = (data) => {
  return fetch(`https://qncsurvey.netlify.app/.netlify/functions/qtAddGroup`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}

const qtUpdateGroup = (data) => {
  return fetch(`https://qncsurvey.netlify.app/.netlify/functions/qtUpdateGroup`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}
const qtDeleteGroup = (data) => {
  return fetch(`https://qncsurvey.netlify.app/.netlify/functions/qtDeleteGroup`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}
const qtDeleteParticipant = (custParmIn,qidParmIn,userParmIn) => {
  let myUrl = 
  'https://qncsurvey.netlify.app/.netlify/functions/qtDeleteParticipant'
  + '?cust=' + custParmIn
  + '&qid='  + qidParmIn
  + '&user=' + userParmIn
  return fetch(myUrl)
   .then((response) => {
     return response.json()
  })
} // end qtDeleteParticipant

const qtUpdateScore = (data) => {
  return fetch(`https://qncsurvey.netlify.app/.netlify/functions/qtUpdateScore`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}
const qtReadScore = (custParmIn,qidParmIn,userParmIn,scoreboardNameParmIn) => {
  let myUrl =  'https://qncsurvey.netlify.app/.netlify/functions/qtReadScore'
  + '?cust=' + custParmIn
  + '&qid=' + qidParmIn
  + '&user=' + userParmIn
  + '&scoreboardName=' + scoreboardNameParmIn
  return fetch(myUrl)
   .then((response) => {
    return response.json()
  })
}
const qtAddSurvey = (data) => {
  return fetch(`https://qncsurvey.netlify.app/.netlify/functions/qtAddSurvey`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}
const qtReadSurveys = (custParmIn) => {
  let myUrl =  'https://qncsurvey.netlify.app/.netlify/functions/qtReadSurveys'
  + '?cust=' + custParmIn
  return fetch(myUrl)
   .then((response) => {
    return response.json()
  })
}
const qtReadSurvey = (custParmIn,qidParmIn) => {
  let myUrl =  'https://qncsurvey.netlify.app/.netlify/functions/qtReadSurvey'
  + '?cust=' + custParmIn
  + '&qid=' + qidParmIn
  return fetch(myUrl)
   .then((response) => { return response.json() })
}
const qtUpdateSurvey = (data) => {
  return fetch(`https://qncsurvey.netlify.app/.netlify/functions/qtUpdateSurvey`, {
    body: JSON.stringify(data),
    method: 'POST'
  }).then(response => {
    return response.json()
  })
}

export default  {
  create: create,
  readAll: readAll,
  update: update,
  delete: deleteTodo,
  batchDelete: batchDeleteTodo,
  qtWriteQuestion: qtWriteQuestion,
  qtDeleteQuestion: qtDeleteQuestion,
  qtDeleteRule: qtDeleteRule,
  qtWriteAnswer: qtWriteAnswer,
  qtReadQuestions: qtReadQuestions,
  qtWriteScore: qtWriteScore,
  qtReadRules: qtReadRules,
  qtWriteRule: qtWriteRule,
  qtUpdateQuestion: qtUpdateQuestion,
  qtUpdateRule: qtUpdateRule,
  qtMassDeleteAnswers: qtMassDeleteAnswers,
  qtMassDeleteScores: qtMassDeleteScores,
  qtMassDeleteQuestions: qtMassDeleteQuestions,
  qtMassDeleteRules: qtMassDeleteRules,
  qtReadScores: qtReadScores,
  qtReadAnswers: qtReadAnswers,
  qtReadInvitations: qtReadInvitations,
  qtReadUsers: qtReadUsers,
  qtReadUser: qtReadUser,
  qtReadSubscribers: qtReadSubscribers,
  qtReadTeamMembers: qtReadTeamMembers,
  qtReadScoreboards: qtReadScoreboards,
  qtAddScoreboard: qtAddScoreboard,
  qtAddParticipant:qtAddParticipant,
  qtUpdateScoreboard: qtUpdateScoreboard,
  qtUpdateParticipant: qtUpdateParticipant,
  qtDeleteScoreboard: qtDeleteScoreboard,
  qtReadGroups: qtReadGroups,
  qtAddGroup: qtAddGroup,
  qtUpdateGroup: qtUpdateGroup,
  qtDeleteGroup: qtDeleteGroup,
  qtUpdateScore: qtUpdateScore,
  qtReadScore: qtReadScore,
  qtDeleteParticipant: qtDeleteParticipant,
  qtAddSurvey: qtAddSurvey,
  qtReadSurveys: qtReadSurveys,
  qtReadSurvey: qtReadSurvey,
  qtUpdateSurvey: qtUpdateSurvey

}

