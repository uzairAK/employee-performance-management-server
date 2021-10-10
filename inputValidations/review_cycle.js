const { body } = require('express-validator')
exports.validate = (method) => {
  switch (method) {
    case "create_review_cycle": {
      return [
        body("review_day", "Initiation date is required").not().isEmpty().trim(),
        body("start_date", "Start date is required").not().isEmpty().trim(),
        body("end_date", "End date is required").not().isEmpty().trim(),
        body("competancy_rate", "Competancy rate is required")
          .not()
          .isEmpty()
          .trim(),
        body("org_id", "Org rate is required").not().isEmpty().trim(),
        // body("branch", "Review day is required").not().isEmpty().trim(),
        body("department", "Branch is required").not().isEmpty().trim(),
        body("employee", "Employee is required").not().isEmpty().trim(),
        body("name", "Name of cycle is required").not().isEmpty().trim(),
        body("assigned_to", "Assigned to is required").not().isEmpty().trim(),
      ];
    }
    case "update_review_cycle": {
      return [
        body("review_day", "Initiation date  is required")
          .not()
          .isEmpty()
          .trim(),
        body("start_date", "Start date is required").not().isEmpty().trim(),
        body("end_date", "End date is required").not().isEmpty().trim(),
        body("competancy_rate", "Competancy rate is required")
          .not()
          .isEmpty()
          .trim(),
        body("org_id", "Org rate is required").not().isEmpty().trim(),
        body("branch", "Review day is required").not().isEmpty().trim(),
        body("department", "Branch is required").not().isEmpty().trim(),
        body("employee", "Employee is required").not().isEmpty().trim(),
        body("name", "Name of cycle is required").not().isEmpty().trim(),
        body("assigned_to", "Assigned to is required").not().isEmpty().trim(),
      ];
    }
  }
}