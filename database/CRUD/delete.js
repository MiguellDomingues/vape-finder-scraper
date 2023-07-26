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

 module.exports = { deleteProducts, deleteTagMetaData }