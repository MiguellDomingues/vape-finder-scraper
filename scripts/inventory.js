const fs = require('fs');
//const utils = require('../utils')
//const db = require('../database/database.js')
//const {connect, disconnect, LOCAL_URI, ATLAS_URI} = require('../database/database.js')
////const {createProducts,createTagMetaData} = require('../database/CRUD/create.js')
//const {dropCollections} = require('../database/CRUD/delete.js')
//const { Product } = require('../database/models.js')

//it's important that these strings dont change as the client uses them to set up UI
//i should probabley create a 'shared configs' collection allowing me to share constants configured here with the client 
//besides these keys, what else can be shared?
// the product/tagmetadata schema?
const TAG_METADATA_TYPE_NAMES = {
    CATEGORIES: "CATEGORIES",
    BRANDS:     "BRANDS",
    STORES:     "STORES"
}

module.exports = (config) => {

    const { db, log_file, utils, write_collections_JSON, write_local_db } = config

    const log = utils.getLogger(log_file)

    log.info("***************** reading JSON files in " + utils.INVENTORIES_DIR+" ********************")

    const getFileName = file => file.split('.')[0]
    const inventories_dir = fs.readdirSync(utils.INVENTORIES_DIR);

    if(inventories_dir.length < 1){ //if the inventories/ folder has no files, exit
        log.error(utils.INVENTORIES_DIR+ " has no files. aborting")
        return
    }

    log.info("************ files: "+ inventories_dir.map(f => `${getFileName(f)}.json`).join(',') + "********************")

    const products_documents = [] // products collection document

    // init buckets to generate tagmetadatas collection for categories/brands/stores 
    const categories_pbm = utils.initProductBucketMetrics(log)
    const brands_pbm = utils.initProductBucketMetrics(log)
    const stores_pbm = utils.initProductBucketMetrics(log)

    try{

    inventories_dir.forEach( (file)=>{ //for each JSON file in the /inventories directory
        
        const products = utils.readJSON(utils.INVENTORIES_DIR, getFileName(file), log) 
        log.info("/////////////////////////////"+getFileName(file)+ "///////////////////////////////////////")
        
        products.forEach( (p) => { //for each product...
            //map the product to a single category, brand, and store bucket

            if(p.buckets.length === 0){ // if the product does not have at least a single category tag, throw an error (mongodb will fail on the insertion anyways because categories:[..] is required)
                throw new Error("ERROR: product \"" +  p.name + "\" has no category buckets. reconfigure the "+getFileName(file)+" bucket obj and rerun the clean step to assign at least a single bucket to this product");
            }

            const product_categories = [p.buckets[0]] // only add the first entry of the bucket as a category; every product may only belong to a single category

            categories_pbm.putProductBuckets(product_categories, p) //add the category to the category bucket    

            if(p.brand){ //if product contains a brand, add to brand bucket.
                brands_pbm.putProductBuckets([p.brand], p)
            }
   
            stores_pbm.putProductBuckets([getFileName(file)], p)     //add the e-store/source to store bucket
            products_documents.push(convertToProductsDocument(p, product_categories, getFileName(file)))  //format objct to confirm to mongodb Product schema and add to product documents list
        })
        
        log.info("successfully converted all products into documents, bucketed the categories and brands")
    })

    log.info("/////////////////////////////summary of categories///////////////////////////////////////")
    categories_pbm.printProductBuckets(false, 'categories')
   // log.info("/////////////////////////////summary of brands///////////////////////////////////////")
   // brands_pbm.printProductBuckets(false, 'brands')
    log.info("/////////////////////////////summary of stores///////////////////////////////////////")
    stores_pbm.printProductBuckets(false, 'stores')

    const tag_metadatas_documents = [
        categories_pbm.generateTagMetaData(TAG_METADATA_TYPE_NAMES.CATEGORIES),
        brands_pbm.generateTagMetaData(TAG_METADATA_TYPE_NAMES.BRANDS),
        stores_pbm.generateTagMetaData(TAG_METADATA_TYPE_NAMES.STORES)
    ] // list of compound objects containing categories,brands,stores names and num of products for each

    log.info("successfully created tagmetadatas documents for " + TAG_METADATA_TYPE_NAMES.CATEGORIES + " " + TAG_METADATA_TYPE_NAMES.BRANDS + " " + TAG_METADATA_TYPE_NAMES.STORES)

    //note that db insertion WILL FAIL with a cryptic error message if the document does not match the schema
    // look up how to validate a document youre trying to insert with a schema in mongoose
    //do this with both products and tagmetadata collection
    // (this has already happened when one of the products did not get mapped to any category buckets) 
    
    //writeDB(products_documents, tag_metadatas_documents, db, write_local_db)

    }catch({message}){
        log.error(message)
        return
    }

}


/*
 map product object to a mongo document object that matches the Product schema
 input:
    product:    the original product object
    categories: arr of category string tags
    source:     the name of the e-store the product was scraped from
return:
    a normalized object ready for insertion into the products collection
*/
function convertToProductsDocument(product, categories, source){

    return {
        source:         source,                                 
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

async function writeDB(products, tag_mds, db, write_local_db){

    try {

        const connection_string = write_local_db ? db.LOCAL_URI : db.ATLAS_URI

        await db.connect(connection_string);  
        await db.dropCollections();
        const product_result = await db.createProducts(products)
        console.log("inserted products: ", product_result.length)
        const tag_md_result = await db.createTagMetaData(tag_mds)
        console.log("inserted tag_md: ", tag_md_result.length)
           
    } catch (err) {
        console.log(err);

    }
    finally {
      await db.disconnect();
    } 
}



/*
async function testingSortedPagination(){

    const limit = 20

        const search_params = {
            category:["Juices"],
            stores:[], 
            brands:[]
        }
     
        const sort_params = {
            sort_by:"DESC", //DESC
            Last_sorted_price: 26.99, 
            last_product_id: ["6404e3db900638a2ed04d6d6","6404e3db900638a2ed04d6d7",
            "6404e3db900638a2ed04d6e5","6404e3db900638a2ed04d6ef",
            "6404e3db900638a2ed04d705","6404e3db900638a2ed04d705","6404e3db900638a2ed04d708","6404e3db900638a2ed04d70b","6404e3db900638a2ed04d70c","6404e3db900638a2ed04d715"

        ]
        }

        const {query_str, sort_str} = buildQuery(search_params, sort_params )
        console.log(query_str)
        console.log(sort_str)
        const res = await fetchSortedProductsByCategoryBrandStore(query_str, sort_str, limit)
        console.log(res)
}


//i need to update this
function buildQuery( {category, stores, brands}, {sort_by, Last_sorted_price, last_product_id} ){

    const query_str = {}
  
    if(Last_sorted_price) query_str["price"] = sort_by === "ASC" ? { "$gte" : Last_sorted_price } : { "$lte" : Last_sorted_price }
    //if(last_product_id?.length > 0)     query_str["_id"] = { "$gt" : last_product_id }
    if(last_product_id?.length > 0)     query_str["_id"] = { "$nin" : [...last_product_id] }
    if(category.length > 0) query_str["categories"] = { "$in" : category }
    if(stores.length > 0)   query_str["source"] = { "$in" : stores}
    if(brands.length > 0)   query_str["brand"] = { "$in" : brands }

    const sort_str = {}

    sort_str["price"] = sort_by === "ASC" ? 1 : -1
    sort_str["_id"] = 1
    
    return { query_str, sort_str }
  }

async function fetchSortedProductsByCategoryBrandStore( query_str,sort_str, limit) {   
    return new Promise( (resolve, reject) => {       
        Product.find(query_str, { _id: 1, price: 1 } ).sort(sort_str).limit(limit)
            .then( (products) => { resolve(products)} )
            .catch( (err) =>  { reject(new Error("Query Error", { cause: err })) } )
    })  
 }

 */


























let vape_flavours = [
    'Arctic Jungle',
    'Black Cherry',
    'Tobacco',
    'Blue Cloud',
    'Blue Ice',
    'Blue Raspberry',
    'Blueberry',
    'Cherry Ice',
    'Vanilla Ice',
    'Custard',
    'Mint',
    'Fruit',
    'French Vanilla',
    'Grape',
    'Green Apple Grape',
    'Watermelon Strawberry Kiwi',
    'Cherry',
    'Goose Berry',
    'Honey Tobacco',
    'Grape',
    'Mango',
    'Menthol','Peach','Raspberry','Strawberry','Strawberry Coconut Pineapple','Watermelon','Peach']


    const tags = [
        'aio',
        'open-pod',
        'closed-pod',
        'fruit',
        'grape',
        'ice',
        'menthol',
        'pod',
        'relx',
        'melon',
        'lychee',
        'passionfruit',
        'pineapple',
        'plum',
        'berries',
        'mango',
        'strawberry',
        'tobacco',
        'banana',
        'berry',
        'blackberry',
        'canadian',
        'tropical',
        'kiwi',
        'salt-nic',
        'honeydew',
        'black-currant',
        'currant',
        'disposable',
        'watermelon',
        'cantaloupe',
        'guava',
        'passion-fruit',
        'drinks',
        'lemon',
        'lemonade',
        'candy',
        'apple',
        'energy',
        'blueberry',
        'blue-raspberry',
        'raspberry',
        'sour',
        'mint',
        'citrus',
        'peach',
        'dragon-fruit',
        'cola',
        'root-beer',
        'vanilla',
        '2ml',
        'type-c',
        'sarsaparilla',
        'soda',
        'stlth',
        'stlth-x',
        'freebase',
        'lime',
        'cream',
        'orange',
        'mentol',
        'spearmint',
        'sync-pod',
        'grapefruit',
        'juicy',
        'stlth-pod',
        'dessert',
        'milk',
        'chocolate',
        'cookie',
        'eliquid',
        'cactus',
        'aloe',
        'blackcurrant',
        'xros-pod',
        'bloodorange',
        'cereal',
        'pomegranate',
        'vype',
        'iced',
        'creamy',
        'aspire',
        'pod-system',
        '18650',
        'sub-ohm',
        'novo',
        'pods',
        'reusable',
        'smok',
        'cinnamon',
        'custard',
        'nuts',
        'caramel',
        'doughnut',
        'peacan',
        'mesh',
        'kola',
        'kola-nut',
        'cherry',
        'chew',
        'gum',
        'coffee',
        'flavorless',
        'bold',
        'pine',
        'wintergreen',
        'sweet',
        'earthy',
        'zesty',
        'floral',
        'coils',
        'rpm3',
        'battery',
        'flat-top',
        'mocha',
        'earl-grey',
        'hazelnut',
        'tea',
        'breakfast',
        'yogurt',
        'cigar',
        'cuban',
        'pistachio',
        'beverage',
        'butterscotch',
        'punch',
        'replacement',
        'replacement-tank',
        'mtl',
        'nautilus',
        'falcon',
        'glass',
        'tank',
        'papaya',
        'g2-pod',
        'koko',
        'cisoo',
        'herbs',
        'rose',
        'tapioca',
        'peppermint',
        'cocoa',
        'cranberry',
        'juul',
        '22q1',
        'nord',
        'melonwatermelon',
        'gummy',
        'jasmin',
        'taro',
        'tart',
        'drink',
        'nord-coil',
        'tpp',
        'gene-chip',
        'flexus',
        'almond',
        'flavourless',
        'plain',
        'charry',
        'kanthal',
        'mech',
        'vtc',
        'yuzy',
        'local',
        'cake',
        'cinamon',
        'fried',
        'savory',
        'pecan',
        'sat-nic',
        'geekvape',
        'charger',
        'lp2',
        'marshmallow',
        'cotton-candy',
        'maple',
        'dr-fog',
        'e-liquid',
        'earl-gray',
        'london-fog',
        'ultra-fog',
        'creamy-yogurt',
        'loch-ness',
        'peaches-and-cream',
        'creme-brulee',
        'da-vinci',
        'pecans',
        'big-foot',
        'mini-donuts',
        'root-beer-float',
        'anise',
        'licorice',
        'cucumber',
        'watermelon-ice',
        'uwell',
        'butter',
        'sugar',
        'low-mint',
        'red-bull',
        'fuji',
        'coconut',
        'ipx80',
        'rpm',
        'pineapple-ice',
        'koolada',
        'starter-kit',
        'pod-kit',
        'atlantis-coil',
        'coil',
        'blue',
        '12-monkeys',
        'circle-of-life',
        'ludou',
        'crown',
        'mixed-berry',
        'dragonfruit',
        'wick',
        'creamo',
        'pear',
        'pipe',
        'raisin',
        'rum',
        'external-battery',
        'fireluke-coil',
        'nfix',
        'aegis',
        'taifun',
        'ultem',
        'baby-beast',
        'nrg',
        'apricot',
        'pyrex',
        'rebuildable',
        'rta',
        'glass-section',
        'metal-cover',
        'clear',
        'bubble',
        'subohm',
        'davinci',
        'lithiumion',
        'miqro',
        'rechargeable',
        'replacement-glass',
        'cascade',
        'alcohol',
        'vaporesso',
        'box-mod',
        'notch',
        'single-coil',
        'stainless-steel',
        'low-profile',
        'squonk',
        'jelly',
        'cherry-blossom',
        'japanese',
        'ice-cream',
        'green-tea',
        'pink',
        'orion',
        'slatnic',
        'case',
        'portable',
        'cable',
        'usb',
        'dual',
        'mini-tank',
        'dna',
        'nut',
        'internal-battery',
        'troical',
        'pina-colada',
        'canteloup',
        'organic',
        'stone-fruit',
        'jack-fruit',
        'Box Mod',
        'wide-bore',
        'dl',
        'widebore',
        'cloud-beast-king',
        'Squonk',
        'spare-parts']
