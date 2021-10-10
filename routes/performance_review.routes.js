const router = require("express").Router();
var path = require("path");
var logError = require("munshi");
const { body, validationResult } = require("express-validator");
const inputValidation = require("../inputValidations/review_cycle");
// var munshiDataSystemLogs = {
//   origin_trace : {FilePath: path.join("/", path.basename(__dirname) ), FileName: path.basename(__filename), TechLog: ""},
//   other_data: {},
//   nonblocking: 1,
//   one_id: "000000",
//   app_id: "10",
//   case: "SYSTEM_LOGS",
//   error_code: 0,
//   error_title: "",
// }

// console.log("In");
// console.log(path.dirname(__dirname));
// console.log(path.basename(__dirname));
// console.log(path.resolve(__dirname));
const { PerformanceReviewCycle } = require("../models/employee_scores.modal");

router.get("/", (req, res) => {
  return res.json("Hello mazhar");
});

//create
router.post(
  "/create_performance_cycle",
  inputValidation.validate("create_review_cycle"),
  (req, res) => {
    var body = req.body;
    var k = {
      review_day: body.review_day,
      start_date: body.start_date,
      end_date: body.end_date,
      competancy_rate: body.competancy_rate,
      goal_rate: body.goal_rate,
      org_id: body.org_id,
      branch: body.branch,
      department: body.department,
      employee: body.employee,
      name: body.name,
      assigned_to: body.assigned_to,
    };
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: "fail",
        msg: "Server Error! cannot create",
        errors: errors.array(),
      });
    }
    var cycle = new PerformanceReviewCycle(k);
    cycle.save(function (err, result) {
      if (err) {
        console.log(err);
        res.json({ status: "fail", msg: "Server Error! cannot create" });
        logError({
          origin_trace: {
            FilePath: path.join("/", path.basename(__dirname)),
            FileName: path.basename(__filename),
            TechLog: "",
          },
          other_data: {},
          nonblocking: 1,
          one_id: "000000",
          app_id: "10",
          case: "SYSTEM_LOGS",
          error_code: 0,
          error_title: "Performance creation failed",
        });
        return;
      }
      return res.json({ status: "success", msg: "Created successfully!" });
    });
  }
);

//update
router.post(
  "/update_performance_cycle",
  inputValidation.validate("update_review_cycle"),
  (req, res) => {
    var body = req.body;

    var k = {
      review_day: body.review_day,
      start_date: body.start_date,
      end_date: body.end_date,
      competancy_rate: body.competancy_rate,
      goal_rate: body.goal_rate,
      org_id: body.org_id,
      branch: body.branch,
      department: body.department,
      employee: body.employee,
      name: body.name,
      assigned_to: body.assigned_to,
    };
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: "fail",
        msg: "Server Error! cannot create",
        errors: errors.array(),
      });
    }
    PerformanceReviewCycle.findOneAndUpdate(
      { _id: body.id },
      k,
      { upsert: true },
      function (err, doc) {
        if (err) {
          console.log(err);
          return res.json({
            status: "fail",
            msg: "Server Error! cannot create",
          });
        }
        return res.json({ status: "success", msg: "Updated successfully!" });
      }
    );
  }
);

//delete
router.get("/delete_performance_cycle/:id", (req, res) => {
  PerformanceReviewCycle.findOneAndDelete(
    { _id: req.params.id },
    function (err, doc) {
      if (err) {
        console.log(err);
        return res.json({ status: "fail", msg: "Server Error! cannot create" });
      }
      return res.json({ status: "success", msg: "Deleted successfully!" });
    }
  );
});

//get review cycles
router.get("/performance_cycles/:org_id", (req, res) => {
  var org_id = req.params.org_id;
  PerformanceReviewCycle.aggregate(
    [
      {
        $match: {
          org_id: String(org_id),
        },
      },
      {
        $lookup: {
          from: "employee_scores",
          localField: "_id",
          foreignField: "review_cycle",
          as: "calculatedOn",
        },
      },
      {
        $addFields: {
          count: {
            $size: "$calculatedOn",
          },
        },
      },
    ],
    (err, cycles) => {
      res.json(cycles);
    }
  );
});

//get review cycles for employee and manager flow
router.post("/performance_cycles", (req, res) => {
  var org_id = req.body.org_id;
  var department_id = req.body.department_id;
  var branch = req.body.branch;
  var owner_id = req.body.owner_id;
  PerformanceReviewCycle.aggregate(
    [
      {
        $match: {
          org_id: String(org_id),
        },
      },
      {
        $lookup: {
          from: "employee_scores",
          localField: "_id",
          foreignField: "review_cycle",
          as: "calculatedOn",
        },
      },
      {
        $addFields: {
          count: {
            $size: "$calculatedOn",
          },
        },
      },
    ],
    (err, cycles) => {
      console.log(cycles);
      var processed_cycles = [];
      cycles.forEach((item) => {
        if (item.branch == "null") {
          processed_cycles.push(item);
        } else if (item.branch == branch && item.department == "null") {
          processed_cycles.push(item);
        } else if (
          item.branch == branch &&
          item.department == department_id &&
          item.employee == "null"
        ) {
          processed_cycles.push(item);
        } else if (
          item.branch == branch &&
          item.department == department_id &&
          item.employee == owner_id
        ) {
          processed_cycles.push(item);
        }
      });
      console.log(processed_cycles);
      res.json(processed_cycles);
    }
  );
});

module.exports = router;
