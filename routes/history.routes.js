const router = require("express").Router();

const {EmployeeScore} = require("../models/employee_scores.modal");

router.post("/get-history", (req, res) => {
    var org_id = req.body.org_id;
    var one_id = req.body.one_id;
    console.log(req.body);
//   var reciever_one_id = req.params.reciever_one_id;
  EmployeeScore.aggregate([
    {
      '$match': {
        'org_id': String(org_id), 
        'one_id': String(one_id)
      }
    }, {
      '$lookup': {
        'from': 'performance_review_cycles', 
        'localField': 'review_cycle', 
        'foreignField': '_id', 
        'as': 'review_cycle'
      }
    }, {
      '$unwind': {
        'path': '$review_cycle', 
        'preserveNullAndEmptyArrays': false
      }
    }, {
      '$group': {
        '_id': '$review_cycle._id', 
        'name': {
          '$first': '$review_cycle.name'
        }, 
        'review_day': {
          '$first': '$review_cycle.review_day'
        }, 
        'start_date': {
          '$first': '$review_cycle.start_date'
        }, 
        'end_date': {
          '$first': '$review_cycle.end_date'
        }, 
        'competancy_rate': {
          '$first': '$review_cycle.competancy_rate'
        }, 
        'goal_rate': {
          '$first': '$review_cycle.goal_rate'
        }, 
        'entry_time': {
          '$first': '$review_cycle.entry_time'
        }, 
        'org_id': {
          '$first': '$review_cycle.org_id'
        }, 
        'employee_scores': {
          '$push': '$$ROOT'
        }
      }
    }
  ])
    .then((result) => {
        console.log(result);
      return res.json({ status: "success", data: result });
    })
    .catch((err) => {
      return res.json({ status: "fail", msg: "Server Error! cannot get data" });
    });
});
module.exports = router;


// [
//   {
//       '$match': {
//         'owner_id': String(owner_id)
//       }
//     },
//   {
//     '$lookup': {
//       'from': 'employee_obtained_marks', 
//       'let': {
//         'id': '$_id', 
//         'owner_id': '$owner_id'
//       }, 
//       'pipeline': [
//         {
//           '$unwind': {
//             'path': '$marks'
//           }
//         }, {
//           '$lookup': {
//             'from': 'employee_questions', 
//             'let': {
//               'questionId': {
//                 '$toObjectId': '$marks.question'
//               }, 
//               'marks': '$marks'
//             }, 
//             'pipeline': [
//               {
//                 '$match': {
//                   '$expr': {
//                     '$eq': [
//                       '$_id', '$$questionId'
//                     ]
//                   }
//                 }
//               }, {
//                 '$replaceRoot': {
//                   'newRoot': {
//                     '$mergeObjects': [
//                       '$$marks', '$$ROOT'
//                     ]
//                   }
//                 }
//               }
//             ], 
//             'as': 'employee_questions'
//           }
//         }, {
//           '$group': {
//             '_id': '$_id', 
//             'one_id': {
//               '$first': '$one_id'
//             }, 
//             'entry_time': {
//               '$first': '$entry_time'
//             }, 
//             'employee_questions': {
//               '$push': {
//                 '$arrayElemAt': [
//                   '$employee_questions', 0
//                 ]
//               }
//             }
//           }
//         }, {
//           '$unwind': {
//             'path': '$employee_questions'
//           }
//         }, {
//           '$group': {
//             '_id': '$_id', 
//             'one_id': {
//               '$first': '$one_id'
//             }, 
//             'entry_time': {
//               '$first': '$entry_time'
//             }, 
//             'employee_questions': {
//               '$push': '$employee_questions'
//             }, 
//             'sum': {
//               '$sum': {
//                 '$toInt': '$employee_questions.obtained_marks'
//               }
//             }, 
//             'count': {
//               '$sum': 1
//             }
//           }
//         }, {
//           '$addFields': {
//             'total_marks': {
//               '$ceil': {
//                 '$divide': [
//                   '$sum', '$count'
//                 ]
//               }
//             }, 
//             'month': {
//               '$month': '$entry_time'
//             }
//           }
//         }, {
//           '$match': {
//             '$expr': {
//               '$eq': [
//                 '$one_id', '$$owner_id'
//               ]
//             }
//           }
//         }
//       ], 
//       'as': 'competancies'
//     }
//   }, {
//     '$lookup': {
//       'from': 'goal_reviews', 
//       'localField': 'goal_review', 
//       'foreignField': '_id', 
//       'as': 'goal_review'
//     }
//   }, {
//     '$match': {
//       '$expr': {
//         '$in': [
//           {
//             '$month': '$entry_time'
//           }, '$competancies.month'
//         ]
//       }
//     }
//   }, {
//     '$addFields': {
//       'competancy': {
//         '$arrayElemAt': [
//           '$competancies', 0
//         ]
//       }, 
//       'goal_review': {
//         '$arrayElemAt': [
//           '$goal_review', 0
//         ]
//       }
//     }
//   }, {
//     '$addFields': {
//       'total_marks': {
//         '$divide': [
//           {
//             '$sum': [
//               '$goal_review.rating', '$competancy.total_marks'
//             ]
//           }, 2
//         ]
//       }
//     }
//   }, {
//     '$addFields': {
//       'competancy_rate': 50, 
//       'goal_rate': 50, 
//       'month': {
//         '$month': '$entry_time'
//       }, 
//       'percentage': {
//         '$multiply': [
//           {
//             '$divide': [
//               '$total_marks', 10
//             ]
//           }, 100
//         ]
//       }
//     }
//   }, {
//     '$lookup': {
//       'from': 'ongoing_feedbacks', 
//       'let': {
//         'owner_id': '$owner_id', 
//         'month': '$month'
//       }, 
//       'pipeline': [
//         {
//           '$addFields': {
//             'month': {
//               '$month': '$entry_time'
//             }
//           }
//         }, {
//           '$match': {
//             '$expr': {
//               '$eq': [
//                 '$reciever_one_id', '$$owner_id'
//               ]
//             }
//           }
//         }, {
//           '$match': {
//             '$expr': {
//               '$eq': [
//                 '$month', '$$month'
//               ]
//             }
//           }
//         }, {
//           '$group': {
//             '_id': '$level', 
//             'level': {
//               '$first': '$level'
//             }, 
//             'level_count': {
//               '$sum': '$level'
//             }
//           }
//         }
//       ], 
//       'as': 'ongoing_feedback'
//     }
//   }
// ]