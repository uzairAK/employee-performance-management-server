const { body } = require("express-validator");
exports.validate = (method) => {
  switch (method) {
    case "create_feedback": {
      return [
        body("sender_id", "Sender id is required").not().isEmpty().trim(),
        body("reciever_one_id", "Reciever one id is required")
          .not()
          .isEmpty()
          .trim(),
        body("org_id", "Org id is required").not().isEmpty().trim(),
        body("level", "Level is required").not().isEmpty().trim(),
        body("comment", "Comment is required").not().isEmpty().trim(),
      ];
    }
    case "update_feedback": {
       return [
         body("sender_id", "Sender id is required").not().isEmpty().trim(),
         body("reciever_one_id", "Reciever one id is required")
           .not()
           .isEmpty()
           .trim(),
         body("org_id", "Org id is required").not().isEmpty().trim(),
         body("level", "Level is required").not().isEmpty().trim(),
         body("comment", "Comment is required").not().isEmpty().trim(),
       ];
    }
  }
};
