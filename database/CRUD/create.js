const { Product } = require('../models.js');
const { TagMetaData } = require('../models.js');
let db = require('../database.js')

async function createProducts(products) {
    return new Promise( (resolve, reject) => {
         db.connect().then( ()=>{
            Product.insertMany(products)
            .then( (result) => { resolve(result)} )
            .catch( (err) =>  { reject(new Error("Query Error", { cause: err })) } )
            .finally( ()=> { db.disconnect()} )
    
        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
 }

 async function createTagMetaData(tmd) {
    return new Promise( (resolve, reject) => {
         db.connect().then( ()=>{
            TagMetaData.insertMany(tmd)
            .then( (result) => { resolve(result)} )
            .catch( (err) =>  { reject(new Error("Query Error", { cause: err })) } )
            .finally( ()=> { db.disconnect()} )
    
        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
 }

 module.exports = { createProducts, createTagMetaData }

