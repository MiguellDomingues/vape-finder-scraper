const fs    = require('fs');
const db    = require('../database/database.js')
const utils = require("../utils.js")

//it's important that these strings dont change as the client uses them to set up UI
//i should probabley create a 'shared configs' collection allowing me to share constants configured here with the client 
//besides these keys, what else can be shared?
// the product/tagmetadata schema?
const TAG_METADATA_TYPE_NAMES = {
    CATEGORIES: "CATEGORIES",
    BRANDS:     "BRANDS",
    STORES:     "STORES"
}

const getFileName = file => file.split('.')[0]

module.exports = (config) => {

    const { log_file, write_collections_JSON, write_local_db, execute_db_write } = config

    const log = utils.getLogger(log_file)

    log.info("***************** reading JSON files in " + utils.INVENTORIES_DIR+" ********************")

    const inventories_dir = fs.readdirSync(utils.INVENTORIES_DIR); //read the inventory files in the pointed to dir

    if(inventories_dir.length < 1){ //if the pointed to dir has no files, exit
        log.error(utils.INVENTORIES_DIR+ " has no files. aborting")
        return
    }

    log.info("************ files: "+ inventories_dir.map(f => `${getFileName(f)}.json`).join(',') + "********************")

    try{
        const tag_metadatas_documents = createTagMetaDatasCollection(inventories_dir, log)
        const products_documents = createProductsCollection(inventories_dir, log)

        if(write_collections_JSON){ //create JSON backups of the created collections
            writeCollectionsToFile(products_documents, tag_metadatas_documents, log)
        }

        if(execute_db_write){ //overwrite local or atlas db
            writeDB(products_documents, tag_metadatas_documents, write_local_db, log)
        }

    }catch(err){
        log.error(err.message)
    }
}

//create a list of validated Product objects from json files in the source_dir
//throws an error if any products dont match the Schema OR contain an empty "buckets" arr
function createProductsCollection(source_dir, log){

    //map product info, categories and source to a Product document
    function convertToProductsDocument(product, categories, source){

        return {
            source:         source,                                 //the tag that gives the product visibility in Store searches
            source_id:      product.id,                             //the products ID scraped from the e-store                     
            source_url:     `https://${source}.com`,                //the URL of the e-store the product was scraped from (as is, this is redundent)
            last_updated:   new Date().toISOString().slice(0, 10),  //todays date
            categories:     [...categories],                        //the tags that give the product visibility in Category searches
            name:            product.name,                          //name of the product 
            info_url:        product.src,                           //product URL on the source e-store
            img_src:         product.img,                           //direct product image source TODO: need a process that fetches product images and saves them locally
            price:           product.price,                         //product price
            brand:           product.brand,                         //the tag that gives the product visibility in Brand searches
            category_str:    product.category                       //the category info that the product was originally scraped with
        }  
    }

    const products_documents = []

    log.info("/////////////////////////////creating products collection///////////////////////////////////////")

    source_dir.forEach( (file)=>{ //for each JSON file in the /inventories directory
            
        const products = utils.readJSON(utils.INVENTORIES_DIR, getFileName(file), log) 
        //log.info("reading: "+getFileName(file))
        
        products.forEach( (p) => { //for each product...

            if(p.buckets.length === 0){ // if the product does not have at least a single category tag, throw an error
                throw new Error("ERROR: product \"" +  p.name + "\" has no category buckets. reconfigure the "+getFileName(file)+" bucket obj and rerun the clean step to assign at least a single bucket to this product");
            }

            const product_categories = [p.buckets[0]] // only add the first entry of the bucket as a category; every product may only belong to a single category
            const product_document = convertToProductsDocument(p, product_categories, getFileName(file))

            const error = db.validateProduct(product_document) //validate product against the Product Schema

            if(error){
                throw new Error(error._message + " in " + getFileName(file) + " product name: " + p.name);
            }

            products_documents.push(convertToProductsDocument(p, product_categories, getFileName(file)))  //format objct to confirm to mongodb Product schema and add to product documents list
        })
    })

    log.info("successfully created, validated product documents")

    return products_documents

}

//create a list of validated TagMetaDatas objects from json files in the source_dir
//throws an error if any products dont match the Schema OR contain an empty "buckets" arr
function createTagMetaDatasCollection(source_dir, log){

    const categories_pbm = utils.initProductBucketMetrics(log)
    const brands_pbm = utils.initProductBucketMetrics(log)
    const stores_pbm = utils.initProductBucketMetrics(log)

    log.info("/////////////////////////////creating tagmetadatas collection///////////////////////////////////////")

    source_dir.forEach( (file)=>{ //for each JSON file in the /inventories directory
            
        const products = utils.readJSON(utils.INVENTORIES_DIR, getFileName(file), log) 
    
        products.forEach( (p) => { //add each products category, brand and store to respective tag buckets

            if(p.buckets.length === 0){ // if the product does not have at least a single category tag, throw an error
                throw new Error("ERROR: product \"" +  p.name + "\" has no category buckets. reconfigure the "+getFileName(file)+" bucket obj and rerun the clean step to assign at least a single bucket to this product");
            }

            const product_categories = [p.buckets[0]] // only add the first entry of the bucket as a category; every product may only belong to a single category

            categories_pbm.putProductBuckets(product_categories, p) //add the category to the category bucket    

            if(p.brand){ //if product contains a brand, add to brand bucket.
                brands_pbm.putProductBuckets([p.brand], p)
            }

            stores_pbm.putProductBuckets([getFileName(file)], p)     //add the e-store/source to store bucket
        })
    })

    log.info("summary of category tags")
    categories_pbm.printProductBuckets(false, 'categories')
    log.info("summary of brand tags")
     brands_pbm.printProductBuckets(false, 'brands')
    log.info("summary of store tags")
    stores_pbm.printProductBuckets(false, 'stores')

    const tag_metadatas_documents = [
        categories_pbm.generateTagMetaData(TAG_METADATA_TYPE_NAMES.CATEGORIES),
        brands_pbm.generateTagMetaData(TAG_METADATA_TYPE_NAMES.BRANDS),
        stores_pbm.generateTagMetaData(TAG_METADATA_TYPE_NAMES.STORES)
    ] // list of compound objects containing categories,brands,stores type_names, tags and count of products for each tag

    tag_metadatas_documents.forEach( (tmd_doc)=>{
        const error = db.validateTagMetaData(tmd_doc)
        if(error){
            throw new Error(error._message + " in document " + tmd_doc.type_name);
        }
    })

    log.info("successfully created, validated tagmetadatas documents for type_name: " + TAG_METADATA_TYPE_NAMES.CATEGORIES + " " + TAG_METADATA_TYPE_NAMES.BRANDS + " " + TAG_METADATA_TYPE_NAMES.STORES)

    return tag_metadatas_documents
}

/*
write the products, tagmetadatas collections as JSON into a new directory with Y/M/D/H/M/S as the name
*/
function writeCollectionsToFile(products, tag_mds, log){

    function generateDirName(){
        const today = new Date()
        return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()};${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}`
    }

    const dir = utils.COLLECTIONS_DIR+`/${generateDirName()}`

    log.info("/////////////////////////////writing collections to JSON//////////////////////////")

    fs.mkdirSync(dir, { recursive: true })

    utils.writeJSON(dir, 'products', products, log)
    utils.writeJSON(dir, 'tagmetadatas', tag_mds, log)
}

//replaces the products, tagmetadatas collections in the local or atlas mongodb instance
async function writeDB(products, tag_mds, write_local_db, log){

    try {
        log.info("//////////////////////////writing " + (write_local_db ? "Local" : "Atlas") + " db///////////////////////////////////////")

        const connection_string = write_local_db ? db.LOCAL_URI : db.ATLAS_URI

        await db.connect(connection_string);  
        await db.dropCollections(log);
        const product_result = await db.createProducts(products)
        log.info("inserted products: " + product_result.length)
        const tag_md_result = await db.createTagMetaData(tag_mds)
        log.info("inserted tagmetadata: " + tag_md_result.length)
           
    } catch (err) {
        log.info("error writing to db: "+err);
    }
    finally {
      await db.disconnect();
    } 
}

