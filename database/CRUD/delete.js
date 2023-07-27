let mongoose = require('mongoose');

 async function dropCollections() {
    (await mongoose.connection.db.listCollections().toArray())                                            // get the collections
            .map(collection => collection.name)                                                           // convert the collection names to strings
                .forEach( async (collection) => { await mongoose.connection.db.dropCollection(collection) // drop each collection
                    .then( (result) => { console.log("dropped collection ", collection)} )}) 
 }

 module.exports = { dropCollections }

 /*
const { Product,TagMetaData } = require('../models.js');

async function deleteProducts() {
    return new Promise( (resolve, reject) => {      
            Product.collection.drop()
            .then( (result) => { resolve(result)} )
            .catch( (err) =>  { reject(new Error("Query Error", { cause: err })) } )           
    })
 }

 async function deleteTagMetaData() {
    return new Promise( (resolve, reject) => {     
            TagMetaData.collection.drop()
            .then( (result) => { resolve(result)} )
            .catch( (err) =>  { reject(new Error("Query Error", { cause: err })) } )                
    })
 }

  module.exports = { deleteProducts, deleteTagMetaData, dropCollections }
 */