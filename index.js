"use strict";
var MongoClient = require("mongodb").MongoClient;
MongoClient.connect(
  "mongodb://127.0.0.1:27017/accounting",
  function (err, connection) {
    var collection = connection.collection("customers");

    var doFind = function (callback) {
      var stream = collection.find({}, { sort: "_id" }).stream();
      // stream object which emits data and end events, among others.
      stream.on("data", function (document) {
        console.dir(document);
      });

      stream.on("end", function () {
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
      // updates properties and
      collection.update(
        { n: /^#/ },
        { $mul: { v: 2 } },
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
