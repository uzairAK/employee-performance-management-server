const router = require("express").Router();
const mongoose = require("mongoose");
var ObjectId = mongoose.Types.ObjectId;

const OngoingFeedback = require("../models/ongoing_feedback.modal");
const {PerformanceReviewCycle} = require("../models/employee_scores.modal");
const {
  Goal,
  GoalProgress,
  GoalReview,
} = require("../models/goal_managment.modal");

router.post("/feedbacks", (req, res) => {
    var from = req.body.from;
    var to = req.body.to;
    var org_id = req.body.org_id;
    // console.log(req.body);
  OngoingFeedback.aggregate([
    {
      '$match': {
          'org_id': String(org_id)
      }
    }, {
      '$match': {
        'entry_time': {
          // '$lte': datetime(2021, 8, 27, 5, 51, 39, tzinfo=timezone.utc).strftime('%a %b %d %Y %H:%M:%S %Z')
          '$lte': new Date(to)
        }, 
        'entry_time': {
            '$gte': new Date(from)
        }
      }
    }, {
      '$group': {
        '_id': {
          'reciever_one_id': '$reciever_one_id', 
          'level': '$level', 
          'org_id': '$org_id'
        }, 
        'reciever_one_id': {
          '$first': '$reciever_one_id'
        }, 
        'org_id': {
          '$first': '$org_id'
        }, 
        'level': {
          '$first': '$level'
        }, 
        'level_count': {
          '$sum': 1
        }
      }
    }, {
      '$group': {
        '_id': {
          'one_id': '$reciever_one_id', 
          'org_id': '$org_id'
        }, 
        'one_id': {
          '$first': '$reciever_one_id'
        }, 
        'org_id': {
          '$first': '$org_id'
        }, 
        'feedback': {
          '$push': {
            'level': '$level', 
            'level_count': '$level_count'
          }
        }, 
        'feedback_count': {
          '$sum': '$level_count'
        }
      }
    }
  ])
    .then((result) => {
      return res.json({ status: "success", data: result });
    })
    .catch((err) => {
      console.log(err);
      return res.json({ status: "fail", msg: "Server Error! cannot get data" });
    });
});

router.post("/goalsandcompetency", (req, res) => {
    var org_id = req.body.org_id;
    var id = req.body.id;
    console.log(req.body);
    PerformanceReviewCycle.aggregate([
    {
      '$match': {
        '$expr': {
            '$and': [
                {
                    '$eq': [
                        '$org_id', String(org_id)
                    ]
                }, {
                    '$eq': [
                        '$_id', ObjectId(id)
                    ]
                }
            ]
        }
      }
    }, {
      '$facet': {
        'competancies': [
          {
            '$lookup': {
              'from': 'employee_obtained_marks', 
              'let': {
                'id': '$_id', 
                'owner_id': '$owner_id', 
                'end_date': '$end_date', 
                'start_date': '$start_date', 
                'org_id': '$org_id',
                'reviewId': '$_id'
              }, 
              'pipeline': [
                {
                  '$unwind': {
                    'path': '$marks'
                  }
                }, {
                  '$lookup': {
                    'from': 'employee_questions', 
                    'let': {
                      'questionId': {
                        '$toObjectId': '$marks.question'
                      }, 
                      'marks': '$marks'
                    }, 
                    'pipeline': [
                      {
                        '$match': {
                          '$expr': {
                            '$eq': [
                              '$_id', '$$questionId'
                            ]
                          }
                        }
                      }, {
                        '$replaceRoot': {
                          'newRoot': {
                            '$mergeObjects': [
                              '$$marks', '$$ROOT'
                            ]
                          }
                        }
                      }
                    ], 
                    'as': 'employee_questions'
                  }
                }, {
                  '$group': {
                    '_id': '$_id', 
                    'one_id': {
                      '$first': '$one_id'
                    }, 
                    'org_id': {
                      '$first': '$org_id'
                    }, 
                    'entry_time': {
                      '$first': '$entry_time'
                    }, 
                    'review_cycle': {
                      '$first': '$review_cycle'
                    }, 
                    'employee_questions': {
                      '$push': {
                        '$arrayElemAt': [
                          '$employee_questions', 0
                        ]
                      }
                    }
                  }
                }, {
                  '$unwind': {
                    'path': '$employee_questions'
                  }
                }, {
                  '$group': {
                    '_id': '$_id', 
                    'one_id': {
                      '$first': '$one_id'
                    }, 
                    'org_id': {
                      '$first': '$org_id'
                    }, 
                    'review_cycle': {
                      '$first': '$review_cycle'
                    }, 
                    'entry_time': {
                      '$first': '$entry_time'
                    }, 
                    'employee_questions': {
                      '$push': '$employee_questions'
                    }, 
                    'sum': {
                      '$sum': {
                        '$toInt': '$employee_questions.obtained_marks'
                      }
                    }, 
                    'count': {
                      '$sum': 1
                    }
                  }
                }, {
                  '$addFields': {
                    'total_marks': {
                      '$ceil': {
                        '$divide': [
                          '$sum', '$count'
                        ]
                      }
                    }, 
                    'month': {
                      '$month': '$entry_time'
                    }, 
                    'isInTimeRangeEnd': {
                      '$lte': [
                        '$entry_time', '$$end_date'
                      ]
                    }, 
                    'isInTimeRangeStart': {
                      '$gte': [
                        '$entry_time', '$$start_date'
                      ]
                    }
                  }
                }, {
                  '$match': {
                    // 'isInTimeRangeEnd': true, 
                    // 'isInTimeRangeStart': true
                    '$expr': {
                      '$eq': [
                        {
                          '$toObjectId': ('$review_cycle')
                        }, '$$reviewId'
                      ]
                    }
                  }
                }
              ], 
              'as': 'competancies'
            }
          }
        ], 
        'goals': [
          {
            '$lookup': {
              'from': 'goals', 
              'let': {
                'org_id': '$org_id', 
                'end_date': '$end_date', 
                'start_date': '$start_date',
                'reviewId': '$_id'
              }, 
              'pipeline': [
                {
                  '$addFields': {
                    'isInTimeRangeEnd': {
                      '$lte': [
                        '$entry_time', '$$end_date'
                      ]
                    }, 
                    'isInTimeRangeStart': {
                      '$gte': [
                        '$entry_time', '$$start_date'
                      ]
                    }
                  }
                }, {
                  '$match': {
                    '$expr': {
                      '$eq': [
                        {
                          '$toObjectId': ('$review_cycle')
                        }, '$$reviewId'
                      ]
                    }
                    // $expr: {$eq: [{$toObjectId:('$review_cycle')}, "$$reviewId"]}
                    // 'isInTimeRangeEnd': true, 
                    // 'isInTimeRangeStart': true
                  }
                }, {
                  '$lookup': {
                    'from': 'goal_reviews', 
                    'localField': 'goal_review', 
                    'foreignField': '_id', 
                    'as': 'goal_review'
                  }
                }, {
                  '$unwind': {
                    'path': '$goal_review', 
                    // 'includeArrayIndex': 'goal_review_index', 
                    'preserveNullAndEmptyArrays': true
                  }
                }, {
                  '$addFields': {
                    'month': {
                      '$month': '$entry_time'
                    }
                  }
                }
              ], 
              'as': 'goals'
            }
          }
        ], 
        'feedbacks': [
          {
            '$lookup': {
              'from': 'ongoing_feedbacks', 
              'let': {
                'id': '$_id', 
                'end_date': '$end_date', 
                'start_date': '$start_date', 
                'org_id': '$org_id'
              }, 
              'pipeline': [
                {
                  '$addFields': {
                    'org_idParent': '$$org_id', 
                    'isInTimeRangeEnd': {
                      '$lte': [
                        '$entry_time', '$$end_date'
                      ]
                    }, 
                    'isInTimeRangeStart': {
                      '$gte': [
                        '$entry_time', '$$start_date'
                      ]
                    }
                  }
                }, {
                  '$match': {
                    '$expr': {
                      '$and': [
                        {
                          '$eq': [
                            '$$org_id', '$org_id'
                          ]
                        }, {
                          '$eq': [
                            '$isInTimeRangeEnd', true
                          ]
                        }, {
                          '$eq': [
                            '$isInTimeRangeStart', true
                          ]
                        }
                      ]
                    }
                  }
                }, {
                  '$group': {
                    '_id': {
                      'reciever_one_id': '$reciever_one_id', 
                      'level': '$level', 
                      'org_id': '$org_id'
                    }, 
                    'reciever_one_id': {
                      '$first': '$reciever_one_id'
                    }, 
                    'org_id': {
                      '$first': '$org_id'
                    }, 
                    'level': {
                      '$first': '$level'
                    }, 
                    'level_count': {
                      '$sum': 1
                    }
                  }
                }, {
                  '$group': {
                    '_id': {
                      'one_id': '$reciever_one_id', 
                      'org_id': '$org_id'
                    }, 
                    'one_id': {
                      '$first': '$reciever_one_id'
                    }, 
                    'org_id': {
                      '$first': '$org_id'
                    }, 
                    'feedback': {
                      '$push': {
                        'level': '$level', 
                        'level_count': '$level_count'
                      }
                    }
                  }
                }
              ], 
              'as': 'feedbacks'
            }
          }
        ]
      }
    }, {
      '$addFields': {
        'competancies_score': {
          '$map': {
            'input': '$competancies', 
            'as': 'competancy', 
            'in': {
              '$map': {
                'input': {
                  '$filter': {
                    'input': '$$competancy.competancies', 
                    'as': 'org_id', 
                    'cond': {
                      '$eq': [
                        '$$org_id.org_id', '$$competancy.org_id'
                      ]
                    }
                  }
                }, 
                'as': 'competence_score', 
                'in': {
                  '$mergeObjects': [
                    '$$competence_score', {
                      'review_cycle': '$$competancy._id', 
                      'competancy_rate': '$$competancy.competancy_rate', 
                      'totalScoreRateAggregated': {
                        '$multiply': [
                          {
                            '$divide': [
                              '$$competence_score.total_marks', 10
                            ]
                          }, '$$competancy.competancy_rate'
                        ]
                      }
                    }
                  ]
                }
              }
            }
          }
        }, 
        'goal_scores': {
          '$map': {
            'input': '$goals', 
            'as': 'goal', 
            'in': {
              '$map': {
                'input': {
                  '$filter': {
                    'input': '$$goal.goals', 
                    'as': 'org_id', 
                    'cond': {
                      '$eq': [
                        '$$org_id.org_id', '$$goal.org_id'
                      ]
                    }
                  }
                }, 
                'as': 'goal_score', 
                'in': {
                  '$mergeObjects': [
                    '$$goal_score', {
                      'review_cycle': '$$goal._id', 
                      'goal_rate': '$$goal.goal_rate', 
                      'rating': '$$goal_score.goal_review.rating', 
                      'totalGoalRateAggregated': {
                        '$multiply': [
                          {
                            '$divide': [
                              '$$goal_score.goal_review.rating', 10
                            ]
                          }, '$$goal.goal_rate'
                        ]
                      }
                    }
                  ]
                }
              }
            }
          }
        }, 
        'feedback_scores': {
          '$map': {
            'input': '$feedbacks', 
            'as': 'feedback', 
            'in': {
              '$map': {
                'input': {
                  '$filter': {
                    'input': '$$feedback.feedbacks', 
                    'as': 'org_id', 
                    'cond': {
                      '$eq': [
                        '$$org_id.org_id', '$$feedback.org_id'
                      ]
                    }
                  }
                }, 
                'as': 'feedback_score', 
                'in': {
                  '$mergeObjects': [
                    '$$feedback_score', {
                      'review_cycle': '$$feedback._id'
                    }
                  ]
                }
              }
            }
          }
        }
      }
    }, {
      '$facet': {
        'comp': [
          {
            '$unwind': {
              'path': '$competancies_score', 
              'preserveNullAndEmptyArrays': false
            }
          }, {
            '$unwind': {
              'path': '$competancies_score', 
              'preserveNullAndEmptyArrays': false
            }
          }, {
            '$group': {
              '_id': {
                'one_id': '$competancies_score.one_id',
                'review_cycle': '$competancies_score.review_cycle'
              }, 
              'total': {
                '$sum': 1
              }, 
              'total_competencies': {
                '$sum': 1
              }, 
              'totalScoreRateAggregated': {
                '$sum': '$competancies_score.totalScoreRateAggregated'
              }, 
              'org_id': {
                '$first': '$competancies_score.org_id'
              }, 
              'review_cycle': {
                '$first': '$competancies_score.review_cycle'
              }
            }
          }, {
            '$addFields': {
              'one_id': '$_id.one_id', 
              'totalScore': {
                '$divide': [
                  '$totalScoreRateAggregated', '$total'
                ]
              }
            }
          }
        ], 
        'goalEmpMapped': [
          {
            '$unwind': {
              'path': '$goal_scores', 
              'preserveNullAndEmptyArrays': true
            }
          }, {
            '$unwind': {
              'path': '$goal_scores', 
              'preserveNullAndEmptyArrays': true
            }
          }, {
            '$group': {
              '_id': {
                'one_id': '$goal_scores.owner_id',
                'review_cycle': '$goal_scores.review_cycle'
              }, 
              'total': {
                '$sum': 1
              }, 
              'total_goals': {
                '$sum': 1
              }, 
              'totalGoalRateAggregated': {
                '$sum': '$goal_scores.totalGoalRateAggregated'
              }, 
              'org_id': {
                '$first': '$goal_scores.org_id'
              }, 
              'review_cycle': {
                '$first': '$goal_scores.review_cycle'
              }
            }
          }, {
            '$addFields': {
              'one_id': '$_id.one_id', 
              'totalScore': {
                '$divide': [
                  '$totalGoalRateAggregated', '$total'
                ]
              }
            }
          }
        ], 
        'feedbackMapped': [
          {
            '$unwind': {
              'path': '$feedback_scores', 
              'preserveNullAndEmptyArrays': false
            }
          }, {
            '$unwind': {
              'path': '$feedback_scores', 
              'preserveNullAndEmptyArrays': false
            }
          }, {
            '$group': {
              '_id': {
                'one_id': '$feedback_scores.one_id', 
                'org_id': '$feedback_scores.org_id'
              }, 
              'org_id': {
                '$first': '$feedback_scores.org_id'
              }, 
              'one_id': {
                '$first': '$feedback_scores.one_id'
              }, 
              'review_cycle': {
                '$first': '$feedback_scores.review_cycle'
              }, 
              'feedback': {
                '$first': '$feedback_scores.feedback'
              }
            }
          }, {
            '$project': {
              '_id': 0
            }
          }
        ]
      }
    }, {
      '$project': {
        'allValues': {
          '$setUnion': [
            '$comp', '$goalEmpMapped'//, '$feedbackMapped'
          ]
        }
      }
    }, {
      '$unwind': {
        'path': '$allValues', 
        'preserveNullAndEmptyArrays': true
      }
    }, {
      '$group': {
        '_id': {
          'one_id': '$allValues.one_id', 
          'org_id': '$allValues.org_id',
          'review_cycle': '$allValues.review_cycle'
        }, 
        'one_id': {
          '$first': '$allValues.one_id'
        }, 
        'score': {
          '$sum': '$allValues.totalScore'
        }, 
        'competency_score': {
          '$sum': '$allValues.totalScoreRateAggregated'
        }, 
        'goal_score': {
          '$sum': '$allValues.totalGoalRateAggregated'
        }, 
        'total_goals': {
          '$sum': '$allValues.total_goals'
        }, 
        'total_competencies': {
          '$sum': '$allValues.total_competencies'
        }, 
        'feedback': {
          '$first': {
            '$cond': [
              {
                '$gt': [
                  '$allValues.feedback', null
                ]
              }, '$allValues.feedback', []
            ]
          }
        }, 
        'org_id': {
          '$first': '$allValues.org_id'
        }, 
        'review_cycle': {
          '$first': '$allValues.review_cycle'
        }
      }
    }
  ])
    .then((result) => {
      console.log(res)
      return res.json({ status: "success", data: result });
    })
    .catch((err) => {
      return res.json({ status: "fail", msg: "Server Error! cannot get data" });
    });
});

//create goal
router.post("/create-goal", (req, res) => {
  var body = req.body;
  const org_id = body.org_id;
  const title = body.goal_name;
  const description = body.description;
  const start_period = body.start_date;
  const end_period = body.due_date;
  const priority = body.priority;
  const reviewer_id = body.reviewer_id;
  const creater_id = body.creater_id;
  const owner_id = body.owner_id;
  const review_cycle = body.review_cycle;
  var inputs=[];
  owner_id.forEach((owner, i) => {
    var input = {
      owner_id: owner,
      org_id,
      title,
      description,
      start_period,
      end_period,
      priority,
      reviewer_id,
      creater_id,
      review_cycle,
    };
    inputs.push(input);
  })
  Goal.create(inputs,function (err, goal) {
    if (err)
      return res.json({ status: "fail", msg: "Server Error! cannot create" });
    return res.json({
      status: "success",
      msg: "Created successfully!",
      test: goal,
    });
  });
});

router.post("/totalScore", (req, res) => {
  var org_id = req.body.org_id;
  var id = req.body.id;
  var one_id= req.body.one_id;
  var aggregate = [
  {
    '$match': {
      '$expr': {
          '$and': [
              {
                  '$eq': [
                      '$org_id', String(org_id)
                  ]
              }, {
                  '$eq': [
                      '$_id', ObjectId(id)
                  ]
              }
          ]
      }
    }
  }, {
    '$facet': {
      'competancies': [
        {
          '$lookup': {
            'from': 'employee_obtained_marks', 
            'let': {
              'id': '$_id', 
              'owner_id': '$owner_id', 
              'end_date': '$end_date', 
              'start_date': '$start_date', 
              'org_id': '$org_id'
            }, 
            'pipeline': [
              {
                '$unwind': {
                  'path': '$marks'
                }
              }, {
                '$lookup': {
                  'from': 'employee_questions', 
                  'let': {
                    'questionId': {
                      '$toObjectId': '$marks.question'
                    }, 
                    'marks': '$marks'
                  }, 
                  'pipeline': [
                    {
                      '$match': {
                        '$expr': {
                          '$eq': [
                            '$_id', '$$questionId'
                          ]
                        }
                      }
                    }, {
                      '$replaceRoot': {
                        'newRoot': {
                          '$mergeObjects': [
                            '$$marks', '$$ROOT'
                          ]
                        }
                      }
                    }
                  ], 
                  'as': 'employee_questions'
                }
              }, {
                '$group': {
                  '_id': '$_id', 
                  'one_id': {
                    '$first': '$one_id'
                  }, 
                  'org_id': {
                    '$first': '$org_id'
                  }, 
                  'entry_time': {
                    '$first': '$entry_time'
                  }, 
                  'employee_questions': {
                    '$push': {
                      '$arrayElemAt': [
                        '$employee_questions', 0
                      ]
                    }
                  }
                }
              }, {
                '$unwind': {
                  'path': '$employee_questions'
                }
              }, {
                '$group': {
                  '_id': '$_id', 
                  'one_id': {
                    '$first': '$one_id'
                  }, 
                  'org_id': {
                    '$first': '$org_id'
                  }, 
                  'entry_time': {
                    '$first': '$entry_time'
                  }, 
                  'employee_questions': {
                    '$push': '$employee_questions'
                  }, 
                  'sum': {
                    '$sum': {
                      '$toInt': '$employee_questions.obtained_marks'
                    }
                  }, 
                  'count': {
                    '$sum': 1
                  }
                }
              }, {
                '$addFields': {
                  'total_marks': {
                    '$ceil': {
                      '$divide': [
                        '$sum', '$count'
                      ]
                    }
                  }, 
                  'month': {
                    '$month': '$entry_time'
                  }, 
                  'isInTimeRangeEnd': {
                    '$lte': [
                      '$entry_time', '$$end_date'
                    ]
                  }, 
                  'isInTimeRangeStart': {
                    '$gte': [
                      '$entry_time', '$$start_date'
                    ]
                  }
                }
              }, {
                '$match': {
                  'isInTimeRangeEnd': true, 
                  'isInTimeRangeStart': true
                }
              }
            ], 
            'as': 'competancies'
          }
        }
      ], 
      'goals': [
        {
          '$lookup': {
            'from': 'goals', 
            'let': {
              'org_id': '$org_id', 
              'end_date': '$end_date', 
              'start_date': '$start_date',
              'reviewId': "$_id"
            }, 
            'pipeline': [
              {
                '$addFields': {
                  'isInTimeRangeEnd': {
                    '$lte': [
                      '$entry_time', '$$end_date'
                    ]
                  }, 
                  'isInTimeRangeStart': {
                    '$gte': [
                      '$entry_time', '$$start_date'
                    ]
                  }
                }
              }, {
                '$match': {
                  '$expr': {
                    '$eq': [
                      {
                        '$toObjectId': ('$review_cycle')
                      }, '$$reviewId'
                    ]
                  }
                  // 'isInTimeRangeEnd': true, 
                  // 'isInTimeRangeStart': true
                }
              }, {
                '$lookup': {
                  'from': 'goal_reviews', 
                  'localField': 'goal_review', 
                  'foreignField': '_id', 
                  'as': 'goal_review'
                }
              }, {
                '$unwind': {
                  'path': '$goal_review', 
                  // 'includeArrayIndex': 'goal_review_index', 
                  'preserveNullAndEmptyArrays': true
                }
              }, {
                '$addFields': {
                  'month': {
                    '$month': '$entry_time'
                  }
                }
              }
            ], 
            'as': 'goals'
          }
        }
      ], 
      'feedbacks': [
        {
          '$lookup': {
            'from': 'ongoing_feedbacks', 
            'let': {
              'id': '$_id', 
              'end_date': '$end_date', 
              'start_date': '$start_date', 
              'org_id': '$org_id'
            }, 
            'pipeline': [
              {
                '$addFields': {
                  'org_idParent': '$$org_id', 
                  'isInTimeRangeEnd': {
                    '$lte': [
                      '$entry_time', '$$end_date'
                    ]
                  }, 
                  'isInTimeRangeStart': {
                    '$gte': [
                      '$entry_time', '$$start_date'
                    ]
                  }
                }
              }, {
                '$match': {
                  '$expr': {
                    '$and': [
                      {
                        '$eq': [
                          '$$org_id', '$org_id'
                        ]
                      }, {
                        '$eq': [
                          '$isInTimeRangeEnd', true
                        ]
                      }, {
                        '$eq': [
                          '$isInTimeRangeStart', true
                        ]
                      }
                    ]
                  }
                }
              }, {
                '$group': {
                  '_id': {
                    'reciever_one_id': '$reciever_one_id', 
                    'level': '$level', 
                    'org_id': '$org_id'
                  }, 
                  'reciever_one_id': {
                    '$first': '$reciever_one_id'
                  }, 
                  'org_id': {
                    '$first': '$org_id'
                  }, 
                  'level': {
                    '$first': '$level'
                  }, 
                  'level_count': {
                    '$sum': 1
                  }
                }
              }, {
                '$group': {
                  '_id': {
                    'one_id': '$reciever_one_id', 
                    'org_id': '$org_id'
                  }, 
                  'one_id': {
                    '$first': '$reciever_one_id'
                  }, 
                  'org_id': {
                    '$first': '$org_id'
                  }, 
                  'feedback': {
                    '$push': {
                      'level': '$level', 
                      'level_count': '$level_count'
                    }
                  }
                }
              }
            ], 
            'as': 'feedbacks'
          }
        }
      ]
    }
  }, {
    '$addFields': {
      'competancies_score': {
        '$map': {
          'input': '$competancies', 
          'as': 'competancy', 
          'in': {
            '$map': {
              'input': {
                '$filter': {
                  'input': '$$competancy.competancies', 
                  'as': 'org_id', 
                  'cond': {
                    '$eq': [
                      '$$org_id.org_id', '$$competancy.org_id'
                    ]
                  }
                }
              }, 
              'as': 'competence_score', 
              'in': {
                '$mergeObjects': [
                  '$$competence_score', {
                    'review_cycle': '$$competancy._id', 
                    'competancy_rate': '$$competancy.competancy_rate', 
                    'totalScoreRateAggregated': {
                      '$multiply': [
                        {
                          '$divide': [
                            '$$competence_score.total_marks', 10
                          ]
                        }, '$$competancy.competancy_rate'
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      }, 
      'goal_scores': {
        '$map': {
          'input': '$goals', 
          'as': 'goal', 
          'in': {
            '$map': {
              'input': {
                '$filter': {
                  'input': '$$goal.goals', 
                  'as': 'org_id', 
                  'cond': {
                    '$eq': [
                      '$$org_id.org_id', '$$goal.org_id'
                    ]
                  }
                }
              }, 
              'as': 'goal_score', 
              'in': {
                '$mergeObjects': [
                  '$$goal_score', {
                    'review_cycle': '$$goal._id', 
                    'goal_rate': '$$goal.goal_rate', 
                    'rating': '$$goal_score.goal_review.rating', 
                    'totalGoalRateAggregated': {
                      '$multiply': [
                        {
                          '$divide': [
                            '$$goal_score.goal_review.rating', 10
                          ]
                        }, '$$goal.goal_rate'
                      ]
                    }
                  }
                ]
              }
            }
          }
        }
      }, 
      'feedback_scores': {
        '$map': {
          'input': '$feedbacks', 
          'as': 'feedback', 
          'in': {
            '$map': {
              'input': {
                '$filter': {
                  'input': '$$feedback.feedbacks', 
                  'as': 'org_id', 
                  'cond': {
                    '$eq': [
                      '$$org_id.org_id', '$$feedback.org_id'
                    ]
                  }
                }
              }, 
              'as': 'feedback_score', 
              'in': {
                '$mergeObjects': [
                  '$$feedback_score', {
                    'review_cycle': '$$feedback._id'
                  }
                ]
              }
            }
          }
        }
      }
    }
  }, {
    '$facet': {
      'comp': [
        {
          '$unwind': {
            'path': '$competancies_score', 
            'preserveNullAndEmptyArrays': false
          }
        }, {
          '$unwind': {
            'path': '$competancies_score', 
            'preserveNullAndEmptyArrays': false
          }
        }, {
          '$group': {
            '_id': {
              'one_id': '$competancies_score.one_id'
            }, 
            'total': {
              '$sum': 1
            }, 
            'total_competencies': {
              '$sum': 1
            }, 
            'totalScoreRateAggregated': {
              '$sum': '$competancies_score.totalScoreRateAggregated'
            }, 
            'org_id': {
              '$first': '$competancies_score.org_id'
            }, 
            'review_cycle': {
              '$first': '$competancies_score.review_cycle'
            }
          }
        }, {
          '$addFields': {
            'one_id': '$_id.one_id', 
            'totalScore': {
              '$divide': [
                '$totalScoreRateAggregated', '$total'
              ]
            }
          }
        }
      ], 
      'goalEmpMapped': [
        {
          '$unwind': {
            'path': '$goal_scores', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$unwind': {
            'path': '$goal_scores', 
            'preserveNullAndEmptyArrays': true
          }
        }, {
          '$group': {
            '_id': {
              'one_id': '$goal_scores.owner_id'
            }, 
            'total': {
              '$sum': 1
            }, 
            'total_goals': {
              '$sum': 1
            }, 
            'totalScoreRateAggregated': {
              '$sum': '$goal_scores.totalGoalRateAggregated'
            }, 
            'org_id': {
              '$first': '$goal_scores.org_id'
            }, 
            'review_cycle': {
              '$first': '$goal_scores.review_cycle'
            }
          }
        }, {
          '$addFields': {
            'one_id': '$_id.one_id', 
            'totalScore': {
              '$divide': [
                '$totalScoreRateAggregated', '$total'
              ]
            }
          }
        }
      ], 
      'feedbackMapped': [
        {
          '$unwind': {
            'path': '$feedback_scores', 
            'preserveNullAndEmptyArrays': false
          }
        }, {
          '$unwind': {
            'path': '$feedback_scores', 
            'preserveNullAndEmptyArrays': false
          }
        }, {
          '$group': {
            '_id': {
              'one_id': '$feedback_scores.one_id', 
              'org_id': '$feedback_scores.org_id'
            }, 
            'org_id': {
              '$first': '$feedback_scores.org_id'
            }, 
            'one_id': {
              '$first': '$feedback_scores.one_id'
            }, 
            'review_cycle': {
              '$first': '$feedback_scores.review_cycle'
            }, 
            'feedback': {
              '$first': '$feedback_scores.feedback'
            }
          }
        }, {
          '$project': {
            '_id': 0
          }
        }
      ]
    }
  }, {
    '$project': {
      'allValues': {
        '$setUnion': [
          '$comp', '$goalEmpMapped', '$feedbackMapped'
        ]
      }
    }
  }, {
    '$unwind': {
      'path': '$allValues', 
      'preserveNullAndEmptyArrays': true
    }
  }, {
    '$group': {
      '_id': {
        'one_id': '$allValues.one_id', 
        'org_id': '$allValues.org_id'
      }, 
      'one_id': {
        '$first': '$allValues.one_id'
      }, 
      'score': {
        '$sum': '$allValues.totalScore'
      }, 
      'competency_score': {
        '$sum': '$allValues.totalScoreRateAggregated'
      }, 
      'goal_score': {
        '$sum': '$allValues.totalGoalRateAggregated'
      }, 
      'total_goals': {
        '$sum': '$allValues.total_goals'
      }, 
      'total_competencies': {
        '$sum': '$allValues.total_competencies'
      }, 
      'feedback': {
        '$first': {
          '$cond': [
            {
              '$gt': [
                '$allValues.feedback', null
              ]
            }, '$allValues.feedback', []
          ]
        }
      }, 
      'org_id': {
        '$first': '$allValues.org_id'
      }, 
      'review_cycle': {
        '$first': '$allValues.review_cycle'
      }
    }
  }
];
if (one_id) {
  aggregate.push({
    $match: {
      $expr: {
        $and: [
          {
            $eq: ["$one_id", String(one_id)],
          },
        ],
      },
    },
  });
}
  // console.log(req.body);
  PerformanceReviewCycle.aggregate(aggregate)
  .then((result) => {
    return res.json({ status: "success", data: result });
  })
  .catch((err) => {
    return res.json({ status: "fail", msg: "Server Error! cannot get data" });
  });
});



module.exports = router;
