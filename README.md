# employee-performance-management-server

This is microservice app developed for another backend.
This app maintains the scores of employees rated by HR, along with their ids.
The ```controllers/updateCollections.js``` must be run on `cronjob` to execute the aggregation on mongo database daily, where it retrieves the review dates matching with a current date to score them and store it in database.