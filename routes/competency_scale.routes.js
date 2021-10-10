const router = require("express").Router();
const { Question, Employee } = require("../models/competency.modal");
var ObjectId = require("mongoose").Types.ObjectId;
//create new question

// const org_id = '1';
// const department_id = '1';
// const branch = '1';
// var question_title = ["q1"];

router.post("/create-question", (req, res) => {
  const org_id = req.body.org_id;
  const department_id = req.body.department_id;
  const branch = req.body.branch;
  const employee = req.body.employee;
  const question_title = req.body.question_title;
  const assignedTo = req.body.assignedTo;
  const review_cycle = ObjectId(req.body.review_cycle);
  var inputs = [];
  question_title.forEach((q, i) => {
    var input = {
      question_title: q,
      org_id,
      department_id,
      branch,
      employee,
      assignedTo,
      review_cycle
    };
    inputs.push(input);
  });

  // const newQuestion = new Question({
  //   org_id,
  //   department_id,
  //   question_title,
  //   branch
  // });
  // res.json({inputs, msg: "Created successfully!" });
  Question.create(inputs, (err, result) => {
    if (err)
      return res.json({ status: "fail", msg: "Server Error! cannot create" });
    return res.json({ status: "success", msg: "Created successfully!" });
    // console.log(result);
  });
});

//update question
// router.post("/update-question", (req, res) => {
//   const _id = req.body._id;
//   const org_id = req.body.org_id;
//   const department_id = req.body.department_id;
//   const question_title = req.body.question_title;
//   Question.findOneAndUpdate(
//     {
//       _id,
//     },
//     {
//       org_id,
//       department_id,
//       question_title,
//     },
//     (err, doc) => {
//       if (err)
//         return res.json({ status: "fail", msg: "Server Error! cannot update" });
//       return res.json({ status: "success", msg: "Updated successfully!" });
//     }
//   );
// });

//delete question
// router.post("/delete-question", (req, res) => {
//   const _id = req.body._id;
//   Question.deleteOne(
//     {
//       _id,
//     },
//     (err) => {
//       if (err)
//         return res.json({ status: "fail", msg: "Server Error! cannot delete" });
//       return res.json({ status: "success", msg: "Deleted successfully!" });
//     }
//   );
// });

//get guestions by department id and org id
// router.post("/get-questions", (req, res) => {
//   const org_id = req.body.org_id;
//   const department_id = req.body.department_id;
//   Question.find({ org_id, department_id }, (err, result) => {
//     if (err)
//       return res.json({
//         status: "fail",
//         msg: "Server Error! cannot get questions",
//       });
//     return res.json({ status: "success", data: result });
//   });
// });

//get guestions and check wheather it is reviewed or not
router.post("/get-employee-questions", (req, res) => {
  console.log("/get-employee-questions", req.body);
  // return res.json(req.body);
  const org_id = req.body.org_id;
  const branch = req.body.branch;
  const department_id = req.body.department_id;
  const one_id = req.body.one_id;
  const start_date = req.body.start_date;
  const end_date = req.body.end_date;
  const review_cycle = req.body.review_cycle;
  // console.log(ObjectId(review_cycle));
  Employee.findOne({
    one_id: one_id,
    review_cycle: ObjectId(review_cycle)
    // entry_time: { $gt: start_date, $lt: end_date },
  })
    .populate("marks.question")
    .then((result, err) => {
      console.log("result :" + result);
      // console.log("err" + err);
      if (err)
        return res.json({
          status: "fail",
          msg: "Server Error! cannot get employee",
        });
      if (result == null) {
        // console.log("Null");
        var query = {
          org_id: org_id,
          review_cycle: ObjectId(review_cycle)
          // entry_time: { $gt: start_date, $lt: end_date },
        };
        // department_id == "null"
        //   ? (query["branch"] = branch)
        //   : (query["department_id"] = department_id);
        department_id && department_id != "null"
          ? (query["department_id"] = department_id)
          : null;
          branch && branch != "null"
          ? (query["branch"] = branch)
          : null;
          // one_id && one_id != "null"
          // ? (query["employee"] = one_id)
          // : null;
          console.log(query);
        Question.find(query, (err, questions) => {
          // console.log("questions");
          // console.log(questions);
          var processed_questions = [];
          questions.forEach((item) => {
            // console.log(item.employee+"  eeee   "+one_id)
            if (item.employee && item.employee != "null") {
              if (item.employee == one_id) {
                console.log("In if");
                processed_questions.push(item);
              }
            }else{
              console.log("In else");
              processed_questions.push(item);
            }
          });
          if (err) {
            return res.json({
              status: "fail",
              msg: "Server Error! cannot get questions",
              err: err,
            });
          } else {
            console.log(processed_questions);
            return res.json({
              status: "success",
              data: processed_questions,
              comp_submited: false,
            });
          }
        });
      } else {
        return res.json({
          status: "success",
          data: result,
          comp_submited: true,
        });
      }
    });
});
//-------------------------------------------- Employee area ----------------------------------------
// //create new question
// router.post("/create-employee", (req, res) => {
//   const one_id = req.body.one_id;
//   const newEmployee = new Employee();
//   newEmployee.one_id = one_id;
//   newEmployee.save((err, result) => {
//     if (err)
//       return res.json({ status: "fail", msg: "Server Error! cannot create" });
//     return res.json({ status: "success", msg: "Created successfully!" });
//   });
// });

//create new question
router.post("/add-marks", (req, res) => {
  const one_id = req.body.one_id;
  const org_id = req.body.org_id;
  const competency_with_rating = req.body.competency_with_rating;
  Employee.find({ one_id: one_id })
    .then((result) => {
      if (result.length == 0) {
        const newEmployee = new Employee();
        newEmployee.one_id = one_id;
        newEmployee.org_id = org_id;
        newEmployee.marks = competency_with_rating;
        newEmployee.save((err, result) => {
          if (err) {
            return res.json({
              status: "fail",
              msg: "Server Error! cannot create",
            });
          } else {
            return res.json({
              status: "success",
              msg: "Created successfully!",
            });
          }
        });
      } else {
        Employee.findOneAndUpdate(
          { one_id: one_id },
          {
            $set: { marks: competency_with_rating },
          },
          (err, doc) => {
            if (err) {
              return res.json({
                status: "fail",
                msg: "Server Error! cannot create",
              });
            } else {
              return res.json({
                status: "success",
                msg: "Created successfully!",
              });
            }
          }
        );
      }
    })
    .catch((err) => {
      return res.json({
        status: "fail",
        msg: "Server Error! cannot create",
        err: err,
      });
    });
});

//get employee's question
router.get("/get-employee-marks/:one_id", (req, res) => {
  const one_id = req.params.one_id;
  Employee.findOne({ one_id: one_id })
    .populate("marks.question")
    .then((result, err) => {
      console.log(result);
      if (err) {
        return res.json({
          status: "fail",
          msg: "Server Error! cannot get employee",
        });
      } else {
        return res.json({ status: "success", data: result });
      }
    });
});
module.exports = router;
