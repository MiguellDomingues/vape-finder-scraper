const fs = require("fs");
const axios = require("axios");

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;

//dir paths to store files
const ROOT              = 'scraper'
const ROOT_DATA_DIR     = `${ROOT}/raw_pages`
const INVENTORIES_DIR   = `${ROOT}/inventories`
const LOGS_DIR          = `${ROOT}/logs`

const DATABASE_ROOT = 'database'
const COLLECTIONS_DIR =`${DATABASE_ROOT}/collections`

const REQUEST_TIME_OUT   = 2500 //time in ms between requests

createDirs([ROOT_DATA_DIR, INVENTORIES_DIR, LOGS_DIR, COLLECTIONS_DIR])

//create new directories, if they do not exist 
//input: [ "dir_path1", "dir_path2", ...]
function createDirs(dirs){
    dirs.forEach( dir => !fs.existsSync(dir) && fs.mkdirSync(dir, { recursive: true }) )
}
/*
write json object to a JSON file and log results. if the file already exists, it is overwritten
- dir:       String path to write
- file_name: String name of the file
- json:      [ {..}, {..},..] or {k1:[..], k2:[...],...}
- logger:    instance of a winston logger object
*/
function writeJSON(dir, file_name, json, logger){
    //TODO check for empty json
    const path = `${dir}/${file_name}.json`
    fs.writeFileSync(path, JSON.stringify(json, null, 2) );

    if(!json.length && Object.keys(json).length){ // if json is an object of string keys and array values:
        let items = 0
        Object.keys(json).forEach( key => items = items + json[key].length )
        logger.info("read " + Object.keys(json).length + " keys with "+ items +" items from " + file_name )
    }else if(json.length && Object.keys(json).length){  //if json is an array
        logger.info("wrote " + json.length + " items into " + path);
    }else{
        logger.info("error writing json items into " + path);
    }

}

/*
read a JSON file and log results
- dir:       String path to write
- file_name: String name of the file
- logger:    instance of a winston logger object
return:      
- an object of the form: [ {..}, {..},..] or {k1:[..], k2:[...],...}
*/
function readJSON(dir, file_name, logger){
    const path = `${dir}/${file_name}.json`
    const json = JSON.parse(fs.readFileSync(path, {encoding:'utf8', flag:'r'}))
    if(!json.length && Object.keys(json).length){
        let items = 0
        Object.keys(json).forEach( key => items = items + json[key].length )
        logger.info("read " + Object.keys(json).length + " keys with "+ items +" items from " + file_name )
    }else if(json.length && Object.keys(json).length){
        logger.info("read "+ json.length+ " items from "+ path);
    }else{
        logger.info("error reading json items from " +file_name);
    }

    return json
}

/*
instantiates a closure which configures and returns a winston logging object
*/
function getLogger(log_file_name){

    const myFormat = printf(({ message, timestamp }) => {
        return `${timestamp} ${message}`;
    });

    return (function (){
        return createLogger({
            format: combine(
              timestamp(),
              myFormat
            ),
            transports: 
            [
                new transports.Console(),
                new transports.File({ filename: `${LOGS_DIR}/${log_file_name}.log`,}),
            ]
        });
    })()
}

/*
instantiates and returns a closure which provides an interface for associating string keys with an array of product objects
used for analysis of scraped data and generating tags

putProductBuckets(buckets,v):   add a single product v to entries in the hashmap with the same key as 'bucket'
generateTagMetaData(type_name): create a tagmetasdatas document object containing an array count for each key in the hashmap
printProductBuckets:            log the contents of the hashmap: either key->array count OR key->contents of objects in array
*/
function initProductBucketMetrics(_logger){
        
    //like an instance of the class
    return (function (_logger){
        // the public variables
        const m = new Map() //hashmap of product objs->[{..},{..}, ...] 
        const logger = _logger

        return {
            putProductBuckets: function (buckets,v) {
                buckets.forEach( (k)=>{
                    const arr = m.has(k) ? m.get(k) : []
                    arr.push(v)
                    m.set(k, arr) })
            },
            generateTagMetaData: function (type_name){
                const tag_md = { type_name, tags: [] } 
                for (let [k, v] of m) tag_md.tags.push({ tag_name: k, product_count: v.length})              
                return tag_md
            },     
            printProductBuckets: function (print_buckets = false, bucket_name = 'buckets'){ 
                let sorted = [], p_count = 0, b_count = 0
                m.forEach( (v,k) => sorted.push(k) );
                sorted.sort().forEach( k => {
                    logger.info( k + " : " + m.get(k).length)
                    print_buckets && m.get(k).forEach( p => logger.info(`   ${p.name} : ${p.category}`))
                    p_count = p_count + m.get(k).length
                    b_count++
                })
                logger.info(`${p_count} products have been mapped across ${b_count} ${bucket_name}`)
            },
        }
    })(_logger)
}

/*
instantiates and returns closure which provides an interface for counting common props across multiple product objects
used for analysis/logging of scraped data

countProps(p):      count the props on a product object 
printPropsCount:    log the counted props 
*/
function propsCount(_log){
    return (function (_log){
        // the public variables
        let id_c = 0, src_c = 0, brand_c = 0, category_c = 0, img_c = 0, price_c = 0
        const log = _log
        
        return {
            countProps: function (p) {
                if( ('id' in p) && p.id)             id_c++
                if( ('src' in p) && p.src)           src_c++
                if( ('brand' in p) && p.brand)       brand_c++
                if( ('category' in p) && p.category) category_c++
                if( ('img' in p) && p.img)           img_c++
                if( ('price' in p) && p.price)       price_c++                      
            },
            printPropsCount: function (){ 
                log.info(`products with id ${id_c}`)
                log.info(`products with src ${src_c}`)
                log.info(`products with brand ${brand_c}`)
                log.info(`products with category ${category_c}`)
                log.info(`products with img ${img_c}`)
                log.info(`products with price ${price_c}`)                 
            },
        }
    })(_log)
}

/*
determines the categories of a product by scanning the scraped name, category and comparing it against the bucket object
-category_str: raw category string 
-name_str:     raw product name string
-buckets:      obj of the form [{bucketname:Str, synonyms:[Str1, Str2...]}, {},...]
returns:
-an array of bucketnames sorted by highest->lowest matches between the bucketname synomyns and the name/category strings
*/
function getProductBuckets(category_str, name_str, buckets){

    /*
    calculate the bucket points for each bucket by scanning the product category/name strs for keywords
    return an object of the form { "bucketname1":{points: int}, "bucketname2":{points: int}, ... }
    */
    const bucket_points = ( (category_str, name_str) =>{
        category_str = category_str.toLowerCase()
        name_str = name_str.toLowerCase()

        //count the occurances of src string inside the trgt string
        const countMatches = (trgt, src) => {
            const result = trgt.match(new RegExp(src, 'g'))
            return result ? result.length : 0
        }

        /*
        const countPositionalMatches = (trgt, src)=>{
        let position_points = 0
        trgt.split(',').forEach( (word, idx )=> position_points = position_points + word.includes(src) ? ++idx : 0)
        return position_points
      }
        */

        const bucket_points = {}

        buckets.forEach( (bucket)=>{
            bucket_points[bucket.name] = { points: 0}
            bucket.synonyms.forEach( (synonym)=>{
                synonym = synonym.toLowerCase()
                let points = bucket_points[bucket.name].points
                points = points + countMatches(category_str, synonym) + countMatches(name_str, synonym)
                bucket_points[bucket.name].points = points
            })
        })

        return bucket_points
    })(category_str, name_str)

    /*
    return [0-n] max score bucket name(s)
    if multiple buckets were tied for max score, return those bucket names
    if all the scores were 0, returns an empty arr    
    */
    const max_points_buckets = ( (bp)=>{
        const non_zero_points = Object.keys(bp).filter( k => bp[k].points > 0)                                                
        const sorted_by_max_points = non_zero_points.sort( (lhs, rhs)=> bp[rhs].points - bp[lhs].points)
        const max_points_bucket = sorted_by_max_points.shift()
        return max_points_bucket ? [max_points_bucket, ...sorted_by_max_points.filter( k => bp[k].points === bp[max_points_bucket].points )] : []
    })(bucket_points)

    return max_points_buckets
}

/*
execute the provided scraper function on each url, appending each result to a list

-urls:     [url1, url2,....],                    list of URLs to scrape
-scraper:  Function(String)                      callback that converts raw html (or json) into a list of product objects OR an object of keys
-limit:    Int,                                  maximum allowable URLs allowed to be scraped

return: [ [{prod1}, {prod2},..],..] OR [{key1:.., key2:.., key3:..,..}]
*/
async function scrapePages(urls, scraper, logger, limit = 300){
    return new Promise( async (resolve, reject) => {
        try{               
                const time_start = Date.now()
                const scraped_pages = []                                                                    //to store output from each scraped url
                let page_count = 0                                                                          

                for (const url of urls){                                                                    //for each url string
                    try{
                        const { data } = await axios.get(url)                                               //fetch html/json and execute scaper callback
                        const scraped_json = scraper(data)

                        if(scraped_json.length === 0){                                                      //if the scraper function fails, abort the entire scrape
                            logger.info(`scrape on ${url} failed to return any data. aborting` )
                            break
                        }
                         
                        if(scraped_json.length)                                                             //inspect the data returned from the scraper function
                            logger.info("scraped "+ scraped_json.length + " items from "+ url)              // it can be a list of objects or an object with keys
                        else if(Object.keys(scraped_json).length)
                            logger.info("scraped "+ Object.keys(scraped_json).length + " keys from "+ url)
                                          
                        scraped_pages.push(scraped_json)
                        await (() => new Promise(resolve => setTimeout(resolve, REQUEST_TIME_OUT)))()       //force a delay between each callout
                
                        if(++page_count === limit){                                                         //abort the rest of the scrape if the page limit is reached
                            logger.info(`limit of ${limit} callouts reached. aborting` )
                            break
                        }

                    }catch(err){
                        logger.info(err + "error scraping "+ url)
                        break
                    }           
                }
      
                const time_finish = Date.now()
                logger.info("completed scrape in " + (time_finish - time_start)/1000 + " seconds")
                logger.info("pages: " + scraped_pages.length + "/" + urls.length)
                resolve(scraped_pages)

        }catch(err){
            reject(err)   //this is never executed because the inner try/catch will catch all the errors
        }
    })
}

module.exports = { 
    writeJSON, 
    readJSON, 
    getLogger, 
    scrapePages, 
    createDirs, 
    initProductBucketMetrics, 
    getProductBuckets, 
    propsCount,  
    ROOT_DATA_DIR, 
    INVENTORIES_DIR,
    COLLECTIONS_DIR 
}