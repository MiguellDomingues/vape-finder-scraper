const utils = require("../utils.js")

//driver function
module.exports = (config) => {  

    const {
        domain, 
        data_dir,
        raw_products_file, 
        buckets, 
        execute_scrape, 
        execute_inventory} = config

    const cleaned_products_file = data_dir     
    const log_file =              data_dir
 
    const log = utils.getLogger(log_file)
    const _data_dir = `${utils.ROOT_DATA_DIR}/${data_dir}`
    utils.createDirs([_data_dir])

    return new Promise( async (resolve) => {
        log.info("**************************executing " + domain + " process***********************************************")

        const time_start = Date.now()

        try{
            
            let raw_products
                                                                                    //get raw products by either......
            if(execute_scrape){ 
                raw_products = await scrape(domain, log)                            //scraping the domain
                utils.writeJSON(_data_dir, raw_products_file, raw_products, log)    //.. then writing results to a file
            }else{
                raw_products = utils.readJSON(_data_dir, raw_products_file, log)    //.. or reading the raw products from a previous scrape
            }

            const cleaned_products = clean(raw_products, domain, buckets, log)      
            
            if(execute_inventory){                                                  //write the cleaned products to the /inventory folder, overwriting the current file
                utils.writeJSON(utils.INVENTORIES_DIR, cleaned_products_file, cleaned_products, log)
            }

        }catch(err){
            log.error(err)
        }finally{
            const time_finish = Date.now()
            log.info("processed " +domain+ " execution in " + (time_finish - time_start)/1000 + " seconds")
            resolve() 
        }
    })
}

/*
filter and transform the raw products so it conforms to a common data format:
{
    id:       Str        
    name:     Str      
    src:      URL         
    brand:    Str      
    category: Str      
    img:      URL      
    price:    Double
    buckets: [Str,..] 
}
*/
function clean(raw_products, domain, buckets, log){

    let includes = [ //product_type: inclusions
        'E-Liquid',
        'Hardware',
        'Wicks & Wire', 
        'Replacement Glass', 
        'Pods',
        'Open System',
        'Closed System',
        'Coils',
        'Chargers', 
        'Batteries',]

    log.info(`//////////cleaning raw products: count: ${raw_products.length}////////////////`)
    const pb = utils.initProductBucketMetrics(log)
    const pc = utils.propsCount(log)

    raw_products = raw_products
    .map( (p)=>{ //transform product_type "A - B - C ..." to "A,B,C..."
        p.product_type = p.product_type.split(" - ").join(",")
            return p
    })
    .filter(     //ignore any products with a product_type not included in the 'includes' array                                                                      
        (p)=> includes.filter( (tag) => p.product_type.includes(tag) ).length > 0 )
    .map( (p)=>{ //generate a new product object with a common data format  
        return {
            id:             p.id,  
            name:           p.title,
            src:            `${domain}/products/${p.handle}`,    
            brand:          p.vendor,
            category:       p.product_type,
            img:            p.images && p.images.length > 0 ? p.images[0].src : null,
            price:          p.variants && p.variants.length > 0 ? p.variants[0].price : null
        }
    })
    .map( 
        (p)=>{ // add product to 0 or more buckets, based on tags/synomyns within each bucket. print no bucket or multibucket matches to log
            p.buckets = utils.getProductBuckets(p.category, p.name, buckets)
            p.buckets.length > 1 && log.info(`multiple buckets: ${p.buckets} , ${p.name}, ${p.category}`)
            p.buckets.length === 0 && log.info(`no buckets: ${p.buckets} , ${p.name}, ${p.category}`)
            pb.putProductBuckets(p.buckets,p)
            pc.countProps(p)
            return p})

    pb.printProductBuckets()
    pc.printPropsCount()
    log.info(`//////////finished cleaning: count: ${raw_products.length} ////////////////`)

    return raw_products
}

/*
generate a list of URLS and pass them to the scrapePages function. 
since thunderbirdvapes uses shopify as it's ecommerce platform, it is easy:
https://www.thunderbirdvapes.com/products.json -> { products: [ {p1}, {p2,...} ] }
*/
async function scrape(domain, logger){

    const start_page = 1
    const end_page = 6

    const subpath = 'products.json'
    const page_param = page => `page=${page}`
    const limit_param = 'limit=250'

    const urls = []

    //generate urls
    for(let page = start_page; page <= end_page; page++)
        urls.push(`${domain}/${subpath}?${limit_param}&${page_param(page)}`)

    //visit urls, process each url with scraper function, return array of array of products, flatten to a single array  
    const products = (await utils.scrapePages(urls, json=>json["products"],logger)).flat()
    return products
}


