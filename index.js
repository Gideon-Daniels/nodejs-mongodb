"use strict";
var MongoClient = require("mongodb").MongoClient;
MongoClient.connect(
  "mongodb://127.0.0.1:27017/accounting",
  function (err, connection) {
    var collection = connection.collection("customers");

    var doFind = function (callback) {
      collection
        .find(
          {
            n: /^#1/,
          },
          {
            sort: [
              ["v", "asc"],
              ["n", "desc"],
            ],
          }
        )
        .toArray(function (err, documents) {
          console.log(documents);
          callback();
        });
    };

    var doInsert = function (i) {
      if (i < 20) {
        var value = Math.floor(Math.random() * 10);
        collection.insert({ n: "#" + i, v: value }, function (err, count) {
          doInsert(i + 1);
        });
      } else {
        console.log();
        console.log("Inserted", i, "documents:");
        doFind(function () {
          doUpdate();
        });
      }
    };
    var doUpdate = function () {
      collection.update(
        { n: "#20" },
        { $set: { n: "20", v: 1 } },
        { multi: true },
        function (err, count) {
          console.log();
          console.log("Updated", "documents:");
          doFind(function () {
            collection.remove({}, function () {
              connection.close();
            });
          });
        }
      );
    };
    doInsert(0);
  }
);
