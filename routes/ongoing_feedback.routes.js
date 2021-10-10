const router = require("express").Router();
const OngoingFeedback = require("../models/ongoing_feedback.modal");
const { body, validationResult } = require("express-validator");
const inputValidation = require("../inputValidations/ongoing_feedback");
// create new ongoing feedback
router.post(
  "/create",
  inputValidation.validate("create_feedback"),
  (req, res) => {
    var body = req.body;
    const sender_id = body.sender_id;
    const reciever_one_id = body.reciever_one_id;
    const org_id = body.org_id;
    const level = body.level;
    const comment = body.comment;

    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: "fail",
        msg: "Server Error! cannot create",
        errors: errors.array(),
      });
    }
    
    const new_ongoing_feedback = new OngoingFeedback({
      sender_id,
      reciever_one_id,
      org_id,
      level,
      comment,
    });
    new_ongoing_feedback.save((err, result) => {
      if (err)
        return res.json({ status: "fail", msg: "Server Error! cannot create" });
      return res.json({ status: "success", msg: "Created successfully" });
    });
  }
);

// update ongoing feedback
router.post(
  "/update",
  inputValidation.validate("update_feedback"),
  (req, res) => {
    var body = req.body;
    console.log(body);
    const _id = body._id;
    const sender_id = body.sender_id;
    const reciever_one_id = body.reciever_one_id;
    const org_id = body.org_id;
    const level = body.level;
    const comment = body.comment;
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        status: "fail",
        msg: "Server Error! cannot create",
        errors: errors.array(),
      });
    }

    OngoingFeedback.findOneAndUpdate(
      {
        _id: _id,
      },
      { sender_id, reciever_one_id, org_id, level, comment },
      (err, doc) => {
        if (err)
          return res.json({
            status: "fail",
            msg: "Server Error! cannot update",
          });
        return res.json({ status: "success", msg: "Updated successfully" });
      }
    );
  }
);

//  delete ongoing feedback
router.post("/delete", (req, res) => {
  const _id = req.body._id;
  OngoingFeedback.deleteOne(
    {
      _id: _id,
    },
    (err) => {
      if (err)
        return res.json({ status: "fail", msg: "Server Error! cannot delete" });
      return res.json({ status: "success", msg: "Deleted successfully" });
    }
  );
});

//get feedbacks with comments
router.get("/feedbacks/:reciever_one_id", (req, res) => {
  var reciever_one_id = req.params.reciever_one_id;
  OngoingFeedback.find({ reciever_one_id })
    .then((result) => {
      return res.json({ status: "success", data: result });
    })
    .catch((err) => {
      return res.json({ status: "fail", msg: "Server Error! cannot get data" });
    });
});

//get only feedback thumbs
router.get("/total-user-feedbacks/:reciever_one_id", (req, res) => {
  var reciever_one_id = req.params.reciever_one_id;
  OngoingFeedback.aggregate([
    { $match: { reciever_one_id: reciever_one_id } },
    { $group: { _id: "$level", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ])
    .then((result) => {
      return res.json({ status: "success", data: result });
    })
    .catch((err) => {
      return res.json({ status: "fail", msg: "Server Error! cannot get data" });
    });
});
module.exports = router;
