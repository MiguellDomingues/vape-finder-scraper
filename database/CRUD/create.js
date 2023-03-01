const { Product,TagMetaData } = require('../models.js');

async function createProducts(products) {
    return new Promise( (resolve, reject) => {      
            Product.insertMany(products)
            .then( (result) => { resolve(result)} )
            .catch( (err) =>  { reject(new Error("Query Error", { cause: err })) } )           
    })
 }

 async function createTagMetaData(tmd) {
    return new Promise( (resolve, reject) => {     
            TagMetaData.insertMany(tmd)
            .then( (result) => { resolve(result)} )
            .catch( (err) =>  { reject(new Error("Query Error", { cause: err })) } )                
    })
 }

 module.exports = { createProducts, createTagMetaData }

