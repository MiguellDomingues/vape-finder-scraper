const { Product, TagMetaData } = require('../models.js');
let db = require('../database.js')

async function fetchSampleProducts() {   
    return new Promise( (resolve, reject) => {
        db.connect().then( ()=>{
            Product.
            aggregate([ { $sample: { size: 11 } }, { $project: { __v: 0} } ])
                .then( (products) => { resolve(products)} )
                .catch( (err) =>  { reject(new Error("Query Error", { cause: err })) } )
                .finally( ()=> { db.disconnect()} )

        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
 }

 async function fetchProductsByCategoryBrandStore( query_str ) {   
    return new Promise( (resolve, reject) => {
        db.connect().then( ()=>{

            /*
            const a ={
            }

            a["product_info.price"] = 1
            Product.find(query_str).sort(a).limit(11)
            */
             
            Product.find(query_str).limit(11)
                .then( (products) => { resolve(products)} )
                .catch( (err) =>  { reject(new Error("Query Error", { cause: err })) } )
                .finally( ()=> { db.disconnect()} )

        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
 }

 async function fetchTagMetaData() {   
    return new Promise( (resolve, reject) => {
        db.connect().then( ()=>{
            TagMetaData.
            aggregate([ { $project: { __v: 0} } ])
                .then( (tmd) => { resolve(tmd)} )
                .catch( (err) =>  { reject(new Error("Query Error", { cause: err })) } )
                .finally( ()=> { db.disconnect()} )

        }).catch( (err)=> { reject(new Error("Database connection Error", { cause: err }) ) });
    })
 }



 module.exports = { fetchSampleProducts, fetchProductsByCategoryBrandStore, fetchTagMetaData }

