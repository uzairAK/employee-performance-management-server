const { body } = require("express-validator");
exports.validate = (method) => {
  switch (method) {
    case "create_goal": {
      return [
        body("goal_name", "Goal name is required").not().isEmpty().trim(),
        body("description", "Description is required").not().isEmpty().trim(),
        body("start_date", "Start date is required").not().isEmpty().trim(),
        body("due_date", "Due date is required").not().isEmpty().trim(),
        body("priority", "Priority is required").not().isEmpty().trim(),
        body("reviewer_id", "Reviewer id is required").not().isEmpty().trim(),
        body("creater_id", "Creater id is required").not().isEmpty().trim(),
        body("owner_id", "Owner id is required").not().isEmpty().trim(),
        body("org_id", "Org id is required").not().isEmpty().trim(),
        body("review_cycle", "Review cycle is required").not().isEmpty().trim(),
      ];
    }
    case "update_goal": {
      return [
        body("title", "Goal name is required").not().isEmpty().trim(),
        body("description", "Description is required").not().isEmpty().trim(),
        body("start_period", "Start date is required").not().isEmpty().trim(),
        body("end_period", "Due date is required").not().isEmpty().trim(),
        body("priority", "Priority is required").not().isEmpty().trim(),
        body("goal_id", "Goal id is required").not().isEmpty().trim(),

      ];
    }
    case "create_progress": {
      return [
        body("comment", "Comment is required").not().isEmpty().trim(),
        body("progress", "Progress is required").not().isEmpty().trim(),
        body("goal_id", "Goal id is required").not().isEmpty().trim(),
      ];
    }
    case "update_progress": {
      return [
        body("comment", "Comment is required").not().isEmpty().trim(),
        body("progress", "Progress is required").not().isEmpty().trim(),
        body("goal_id", "Goal id is required").not().isEmpty().trim(),
      ];
    }
    case "create_rating": {
      return [
        body("data").custom((value, { req }) => {
          if (value.length == 0) {
            throw new Error("rating is required");
          }
          return true;
        }),
      ];
    }
    case "create_goal_comment": {
      return [
        body("comment", "Comment is required").not().isEmpty().trim(),
        body("goal_id", "Goal id is required").not().isEmpty().trim(),
      ];
    }
  }
};
