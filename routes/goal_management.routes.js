const router = require("express").Router();

const {
  Goal,
  GoalProgress,
  GoalReview,
} = require("../models/goal_managment.modal");
const { body, validationResult } = require("express-validator");
const inputValidation = require("../inputValidations/goal");
//create goal
router.post(
  "/create-goal",
  inputValidation.validate("create_goal"),
  (req, res) => {
    var body = req.body;
    console.log(body);
    const title = body.goal_name;
    const description = body.description;
    const start_period = body.start_date;
    const end_period = body.due_date;
    const priority = body.priority;
    const reviewer_id = body.reviewer_id;
    const creater_id = body.creater_id;
    const owner_id = body.owner_id;
    const org_id = body.org_id;
    const review_cycle = body.review_cycle;

    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: "fail",
        msg: "Server Error! cannot create",
        errors: errors.array(),
      });
    }

    const newGoal = new Goal({
      title,
      description,
      start_period,
      end_period,
      priority,
      reviewer_id,
      creater_id,
      owner_id,
      org_id,
      review_cycle,
    });
    newGoal.save(function (err, goal) {
      if (err)
        return res.json({ status: "fail", msg: "Server Error! cannot create" });

      return res.json({
        status: "success",
        msg: "Created successfully!",
        data: goal,
      });
    });
  }
);

//Update goal
router.post(
  "/update-goal",
  inputValidation.validate("update_goal"),
  (req, res) => {
 

    var body = req.body;
    console.log(body);
    const goal_id = body.goal_id;
    const title = body.title;
    const description = body.description;
    const start_period = body.start_period;
    const end_period = body.end_period;
    const priority = body.priority;

   const errors = validationResult(req);
   console.log(errors);
   if (!errors.isEmpty()) {
     return res.status(422).json({
       status: "fail",
       msg: "Server Error! cannot update",
       errors: errors.array(),
     });
   }


    Goal.findOneAndUpdate(
      {
        _id: goal_id,
      },
      {
        title,
        description,
        start_period,
        end_period,
        priority,
      },
      (err, doc) => {
        if (err) {
          return res.json({
            status: "fail",
            msg: "Server Error! cannot delete",
          });
        } else {
          return res.json({ status: "success", msg: "Updated successfully!" });
        }
      }
    );
  }
);

//Delete goal
router.post("/delete-goal", (req, res) => {
  const goal_id = req.body.goal_id;
  Goal.deleteOne(
    {
      _id: goal_id,
    },
    (err) => {
      if (err)
        return res.json({ status: "fail", msg: "Server Error! cannot delete" });
      GoalProgress.deleteMany(
        {
          goal: goal_id,
        },
        (err) => {
          if (err)
            return res.json({
              status: "fail",
              msg: "Server Error! cannot delete",
            });
          GoalReview.deleteOne(
            {
              goal: goal_id,
            },
            (err) => {
              if (err)
                return res.json({
                  status: "fail",
                  msg: "Server Error! cannot delete",
                });
              return res.json({
                status: "success",
                msg: "Deleted successfully!",
              });
            }
          );
        }
      );
    }
  );
});
//get all goals of single person
router.post("/get-goals", (req, res) => {
  var review_cycle = req.body.review_cycle;
  var type = req.body.type;
  var id = req.body.id.toString();
  var review_cycle_id = req.body.review_cycle_id;
  var query = {};
  query[type] = id;
  // review_cycle_id

  Goal.find({ ...query, review_cycle: review_cycle_id })
    .populate("goal_progresses")
    .populate("goal_review")
    .then((result) => {
      // console.log(result);
      res.json(result);
    })
    .catch((err) => {
      console.log(err);
      res.json("error in get goals");
    });
});

// get single goal data by id
router.get("/get-goal/:goal_id", (req, res) => {
  const goal_id = req.params.goal_id;
  Goal.find(
    { _id: goal_id },
    "end_period priority start_period title description"
  )
    .then((result) => {
      return res.json({
        status: "success",
        data: result,
      });
    })
    .catch((err) => {
      return res.json({
        status: "fail",
        msg: "Server Error! cannot get goal",
        err: err,
      });
    });
});

//-------------------------------------------- progress area started-----------------------------------------------
//create progress
router.post(
  "/create-progress",
  inputValidation.validate("create_progress"),
  (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: "fail",
        msg: "Server Error! cannot create",
        errors: errors.array(),
      });
    }

    var body = req.body;
    // console.log(body);
    const comment = body.comment;
    const progress = parseInt(body.progress);
    const goal_id = body.goal_id;
    const newProgress = new GoalProgress({
      comment: comment,
      progress: progress,
      goal: goal_id,
    });
    newProgress.save(function (err, progress) {
      if (err)
        return res.json({
          status: "fail",
          msg: "Server Error! cannot create",
        });
      Goal.findByIdAndUpdate(
        goal_id,
        { $push: { goal_progresses: progress._id } },
        { new: true, upsert: true },
        function (err, savedGoal) {
          if (err)
            return res.json({
              status: "fail",
              msg: "Server Error! cannot create",
            });
          return res.json({
            status: "success",
            msg: "Created successfully!",
          });
        }
      );
    });
  }
);

//update progress
router.post(
  "/update-progress",
  inputValidation.validate("update_progress"),
  (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: "fail",
        msg: "Server Error! cannot update",
        errors: errors.array(),
      });
    }

    var body = req.body;
    // console.log(body);
    const progress_id = body.progress_id;
    const comment = body.comment;
    const progress = body.progress;

    GoalProgress.findOneAndUpdate(
      {
        _id: progress_id,
      },
      {
        comment: comment,
        progress: progress,
      },
      (err, doc) => {
        if (err)
          return res.json({
            status: "fail",
            msg: "Server Error! cannot update",
          });
        return res.json({
          status: "success",
          msg: "Updated successfully!",
        });
      }
    );
  }
);

//delete progress
router.post("/delete-progress", (req, res) => {
  const progress_id = req.body.progress_id;
  GoalProgress.findOneAndDelete(
    {
      _id: progress_id,
    },
    (err, doc) => {
      if (err)
        return res.json({
          status: "fail",
          msg: "Server Error! cannot delete",
        });
      Goal.findOneAndUpdate(
        {
          _id: doc.goal,
        },
        { $pull: { goal_progresses: doc._id } },
        (err, doc) => {
          if (err)
            return res.json({
              status: "fail",
              msg: "Server Error! cannot delete!",
            });
          return res.json({
            status: "success",
            msg: "Deleted successfully!",
          });
        }
      );
    }
  );
});

//get progresses by goal id
router.get("/get-progresses/:goal_id", (req, res) => {
  const goal_id = req.params.goal_id;
  GoalProgress.find({ goal: goal_id })
    .then((result) => {
      return res.json({
        status: "success",
        data: result,
      });
    })
    .catch((err) => {
      return res.json({
        status: "fail",
        msg: "Server Error! cannot get progress",
        err: err,
      });
    });
});

//get all progresses
router.get("/get-all-progress", (req, res) => {
  GoalProgress.find({})
    .then((result) => {
      return res.json({
        status: "success",
        data: result,
      });
    })
    .catch((err) => {
      return res.json({
        status: "fail",
        msg: "Server Error! cannot get all progresses",
      });
    });
});

//----------------------------------------- Review area started ---------------------------------------
//create review rating
router.post(
  "/create-rating",
  inputValidation.validate("create_rating"),
  async (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: "fail",
        msg: "Server Error! cannot create",
        errors: errors.array(),
      });
    }

    var data = req.body.data;
    console.log(data);
    data.forEach((element) => {
      var id = element.rated_goal_id;
      // res.json(parseFloat(element.rating));rem
      //   cons ole.log(parseInt(element.rating))

      Goal.findOne({ _id: id })
        .then((result) => {
          if (result.goal_review == undefined) {
            console.log("if block");
            const newReview = new GoalReview({
              rating: parseInt(element.rated_goal_rating),
              goal: element.rated_goal_id,
            });

            newReview.save(async function (err, review) {
              if (err) {
                return res.json({
                  status: "fail",
                  msg: "Server Error! cannot create",
                  review: "",
                });
              } else {
                Goal.updateOne(
                  { _id: id },
                  { goal_review: review._id },
                  async function (err, savedGoal) {
                    console.log(savedGoal);
                    if (err) {
                      return res.json({
                        status: "fail",
                        msg: "Server Error! cannot create",
                        review: "",
                      });
                    }
                  }
                );
              }
            });
          } else {
            console.log("else block");
            console.log(element.rated_goal_id);
            GoalReview.findOneAndUpdate(
              { goal: element.rated_goal_id },
              { rating: parseInt(element.rated_goal_rating) },
              function (err, savedGoal) {
                if (err) {
                  return res.json({
                    status: "fail",
                    msg: "Server Error! cannot create",
                    review: "",
                  });
                }
              }
            );
          }
        })
        .catch((err) => {
          return res.json({
            status: "success",
            msg: err,
          });
        });
    });

    return res.json({
      status: "success",
      msg: "Reviewed successfully!",
    });
  }
);

//create review comment
router.post(
  "/create-comment",
  inputValidation.validate("create_goal_comment"),
  (req, res) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: "fail",
        msg: "Server Error! cannot create",
        errors: errors.array(),
      });
    }
    var body = req.body;
    console.log(body);
    const comment = body.comment;
    const goal_id = body.goal_id;

    Goal.findOne({ _id: goal_id })
      .then((result) => {
        console.log(result);
        console.log(result.goal_review);
        if (result.goal_review == undefined) {
          console.log("if block");
          const newReview = new GoalReview({
            comment: comment,
            goal: result._id,
          });
          newReview.save(function (err, review) {
            if (err)
              return res.json({
                status: "fail",
                msg: "Server Error! cannot create",
                review: "",
              });
            Goal.findOneAndUpdate(
              { _id: goal_id },
              { goal_review: review._id },
              function (err, savedGoal) {
                console.log("Reviews");
                if (err) {
                  console.log("err");
                  return res.json({
                    status: "fail",
                    msg: "Server Error! cannot create",
                    review: review,
                  });
                }
 console.log("success");
                return res.json({
                  status: "success",
                  msg: "Created successfully!",
                  review: review,
                });
              }
            );
          });
        } else {
          console.log("else block");
          GoalReview.findOneAndUpdate(
            { goal: goal_id },
            { comment: comment },
            function (err, savedGoal) {
              return res.json({
                status: "success",
                msg: "Created successfully!",
                review: savedGoal,
              });
            }
          );
        }
      })
      .catch((err) => {
        return res.json({
          status: "success",
          msg: err,
        });
      });
  }
);

//create review
router.post("/create-review", (req, res) => {
  var body = req.body;
  // console.log(body);
  const comment = body.comment;
  const rating = body.rating;
  const goal_id = body.goal_id;

  const newReview = new GoalReview({
    comment: comment,
    rating: rating,
    goal: goal_id,
  });
  newReview.save(function (err, review) {
    if (err)
      return res.json({
        status: "fail",
        msg: "Server Error! cannot create",
      });
    Goal.findByIdAndUpdate(
      goal_id,
      { goal_review: review._id },
      function (err, savedGoal) {
        if (err)
          return res.json({
            status: "fail",
            msg: "Server Error! cannot create",
          });
        return res.json({
          status: "success",
          msg: "Created successfully!",
        });
      }
    );
  });
});

//update review
router.post("/update-review", (req, res) => {
  var body = req.body;
  const review_id = body.review_id;
  const comment = body.comment;
  const rating = body.rating;
  Model.findOneAndUpdate(
    {
      _id: review_id,
    },
    {
      comment: comment,
      rating: rating,
    },
    (err, doc) => {
      if (err)
        return res.json({
          status: "fail",
          msg: "Server Error! cannot update",
        });
      return res.json({
        status: "success",
        msg: "Updated successfully!",
      });
    }
  );
});

//delete review
router.post("/delete-review", (req, res) => {
  const review_id = req.body.review_id;
  GoalReview.findOneAndDelete(
    {
      _id: review_id,
    },
    (err, doc) => {
      if (err)
        return res.json({
          status: "fail",
          msg: "Server Error! cannot delete",
        });
      Goal.findOneAndUpdate(
        {
          _id: doc.goal,
        },
        { goal_review: undefined },
        (err, doc) => {
          if (err)
            return res.json({
              status: "fail",
              msg: "Server Error! cannot delete",
            });
          return res.json({
            status: "success",
            msg: "Deleted successfully!",
          });
        }
      );
    }
  );
});

//get review by goal id
router.get("/get-review/:goal_id", (req, res) => {
  const goal_id = req.params.goal_id;
  GoalReview.find({ goal: goal_id })
    .then((result) => {
      return res.json({
        status: "success",
        data: result,
      });
    })
    .catch((err) => {
      return res.json({
        status: "success",
        msg: "Server Error! cannot get review by goal id",
      });
    });
});

//get all reviews
router.get("/get-all-reviews", (req, res) => {
  GoalReview.find({})
    .then((result) => {
      res.json(result);
    })
    .catch((err) => {
      res.json("error in get all reviews");
    });
});

module.exports = router;
