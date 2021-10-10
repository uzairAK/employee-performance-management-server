var axios = require("axios");
var path = require("path");
var FormData = require("form-data");
function sendErrorToMunshi(data) {
    var form = new FormData();
    // var origin_trace = JSON.stringify({FilePath: "testing/somewhere", FileName: "testingname.js", TechLog: ""});
    // var other_data = JSON.stringify({testing: "Yes"});
    form.append("nonblocking", data.nonblocking);
    form.append("app_id", data.app_id); //10
    form.append("one_id", data.one_id);
    form.append("case", data.case);
    form.append("error_code", data.error_code);
    form.append("error_title", data.error_title);
    form.append("origin_trace", JSON.stringify(data.origin_trace));
    form.append("other_data", JSON.stringify(data.other_data));
    form.append("hash", "2vUUP8tw6cbyUJFrQZYvkQsPf4fqMy");
    axios
      .post(
        "http://172.18.0.37/munshi/service_api/record",
        form,
        { headers: form.getHeaders() }
      )
      .then((response) => {
        if (response.status == 200) console.log("Error logged");
      })
      .catch((err) => {
        console.log("error :");
        console.log(err);
      });
    
  }

  module.exports = sendErrorToMunshi;