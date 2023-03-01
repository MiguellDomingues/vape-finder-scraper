module.exports = (config) => {  

    const {
        domain, 
        data_dir,
        raw_products_file, 
        inventory_file, 
        log_file, 
        buckets, 
        utils, 
        execute_scrape, 
        execute_inventory} = config
 
    const log = utils.getLogger(log_file)
    const _data_dir = `${utils.ROOT_DATA_DIR}/${data_dir}`
    utils.createDirs([_data_dir])

    return new Promise( async (resolve) => {
        log.info("**************************executing " + domain + " process***********************************************")

        const time_start = Date.now()

        try{         
            const raw_products = execute_scrape ? await scrape(domain, _data_dir, raw_products_file, utils, log) : utils.readJSON(_data_dir, raw_products_file, log)
            const cleaned_products = clean(raw_products, domain, buckets, utils, log)
            execute_inventory && utils.writeJSON(utils.INVENTORIES_DIR, inventory_file, cleaned_products, log)
        }catch(err){
            log.error(err)
        }finally{
            const time_finish = Date.now()
            log.info("processed " +domain+ " execution in " + (time_finish - time_start)/1000 + " seconds")
            resolve() 
        }
    })
}

function clean(raw_products, domain, buckets, utils, log){

    let includes = [
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
    .map( (p)=>{
        p.product_type = p.product_type.split(" - ").join(",")
            return p
    })
    .filter(                                                                              
        (p)=> includes.filter( (tag) => p.product_type.includes(tag) ).length > 0 )
    .map( (p)=>{
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
        (p)=>{              // add product to 0 or more buckets, based on tags/synomyns within each bucket. print no bucket or multibucket matches to log
            p.buckets = utils.getProductBuckets(p.category, p.name, buckets)
            p.buckets.length > 1 && log.info(`multiple buckets: ${p.buckets} , ${p.name}, ${p.category}`)
            p.buckets.length === 0 && log.info(`no buckets: ${p.buckets} , ${p.name}, ${p.category}`)
            pb.putProductBuckets(p.buckets,p)
            pc.countProps(p)
            //console.log(p.buckets , p.name, p.category)
            return p})

    pb.printProductBuckets()
    pc.printPropsCount()
    log.info(`//////////finished cleaning: count: ${raw_products.length} ////////////////`)

    return raw_products
}

async function scrape(domain, dir, file_name, utils, logger){

    const start_page = 1
    const end_page = 6

    const subpath = 'products.json'
    const page_param = page => `page=${page}`
    const limit_param = 'limit=250'

    const urls = []

    //generate urls
    for(let page = start_page; page <= end_page; page++)
        urls.push(`${domain}/${subpath}?${limit_param}&${page_param(page)}`)

    //visit urls, process each url with scraper function, return array of array of products
    const products = (await utils.scrapePages(urls, json=>json["products"],logger)).flat()
    utils.writeJSON(dir, file_name, products, logger)
    return products
}


