/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  // Similar to issue tracker project
  app.route('/api/books')
     .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) throw err
        db.collection('test').find().toArray((err,result)=>{  //All
          if (err) throw err
          res.send(result)
        });
      });
    })

    .post(function (req, res){
      var title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (title == '' | title == undefined){
        res.send('missing title')
      } else {
        MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
          if (err) throw err
          db.collection('test').insertOne({
            title,
            comments: [],
            "commentcount": 0
          },(err,doc)=>{
            if (err) throw err
            const display = {title:doc.ops[0].title, comments:doc.ops[0].comments, _id:doc.ops[0]._id}
            res.json(display)
          });
        });
      }
    })

    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) throw err
        db.collection('test').remove(
          //When removing multiple documents, the remove operation may interleave with 
          //other read and/or write operations to the collection.
          // deleteMany can be used instead of remove
          {},
          (err,doc)=>{
            if (err) throw err
            // console.log('complete delete successful')
            res.send('complete delete successful')
        });
      });
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookId = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) throw err
        db.collection('test').findOne({_id:ObjectId(bookId)},(err,result)=>{
          if (err) throw err
          if (result == null){
            res.send('invalid book id')
          } else {
            //const display = (({_id,title,comments})=>({_id,title,comments}))(result)
            // console.log('Get book record:', display)
            const display = {_id:result._id, title:result.title, comments:result.comments}
            //console.log(result);
            res.json(display)
          }
        });
      });
    })

    .post(function(req, res){
      var bookId = req.params.id;
      var comment = req.body.comment;
      //json res format same as .get

      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) throw err
        db.collection('test').findAndModify(
          {_id:ObjectId(bookId)},
          //{},
          {},
          { $push: {comments:comment},
            $inc: {commentcount: 1}
          },
          {new:true}, //returns the modified document rather than the original
          (err,result)=>{
            if (err) throw err
            if (result.value == null) {  //If the query does not match a document to remove, findAndModify() returns null.
              res.send('invalid book id')
            } else {
              //const display = (({_id,title,comments})=>({_id,title,comments}))(result.value)
              const display = {_id:result.value._id, title:result.value.title, comments:result.value.comments}
              //console.log('Updated book record:', display)
              //console.log(result)
              res.json(display)
            }
        });
      });
    })

    .delete(function(req, res){
      var bookId = req.params.id;
      //if successful response will be 'delete successful'
      MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {
        if (err) throw err
        db.collection('test').findAndModify(
          {_id:ObjectId(bookId)},
          {}, //removed one {}
          {remove:true}, //Must specify either the remove or the update field.
          (err,doc)=>{
            if (err) throw err
            if (doc.value == null){ //If the query does not match a document to remove, findAndModify() returns null.
              res.send('invalid book id')
            } else {
              // console.log('delete successful')
              res.send('delete successful')
            }
        });
      });
    });

};
