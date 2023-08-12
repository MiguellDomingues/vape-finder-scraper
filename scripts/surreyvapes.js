const cheerio = require("cheerio");
const utils = require("../utils.js");

const domain =              'https://www.surreyvapes.com'
const data_dir =            'surreyvapes'
const raw_products_file=    'raw_products'
const buckets = [
  {
      name: 'Juices',
      synonyms: ['e-juice', //surreyvapes
                 'ejuice',  //ezvape
                 'e-liquid'] //tbvapes
  },
  {
      name: 'Coils',
      synonyms: ['coil','rda','atomizer']
  },
  {
      name: 'Pods',
      synonyms: ['pod','Mevol X Pods','Mevol X Device']
  },
  {
      name: 'Tanks',
      synonyms: ['tank','clearomizer']
  },
  {
      name: 'Starter Kits',
      synonyms: ['starter', 'kit','disposable','GCORE MODELX','Icon Bar Hybrid']
  },
  {
      name: 'Mods',
      synonyms: ['boxes', 'boxmod', 'box mod', 'mod', 'box']
  },
  {
      name: 'Batteries',
      synonyms: ['battery', 'batteries','18650']
  },
  {
      name: 'Chargers',
      synonyms: ['charger','charging']
  },
  {
      name: 'Replacement Glass',
      synonyms: ['glass','replacement','pyrex','replacement glass']
  },
  {
      name: 'Accessories/Miscellaneous',
      synonyms: ['wire','drip tip','cotton','apparel','mod accessories','pens','wick','adapter','screwdriver','tweezer','decorative ring','magnet connector','vaper twizer']
  },      
]

module.exports = (config) => {

    const { execute_scrape, execute_inventory} = config

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

            const cleaned_products = clean(raw_products, buckets, log)      
            
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
generates a list of URLS and defines a webscraping function 
*/
async function scrape(domain, log){

    /* webscraping function */
    function scrapeProductInfo(html) {

        const $ = cheerio.load(html);
        
        const products = []
      
        $(".productGrid li").each((idx, el) => {
      
          const selector = $(el).children("article")
      
          const product = {
              id:         selector.attr('data-entity-id').trim(),
              src:        $(el).find("a").attr('href'),
              name:       selector.attr('data-name').trim(),
              category:   selector.attr('data-product-category').replace(/\s+/g, '').split(',')[2],
              price:      selector.attr('data-product-price').trim(),
              brand:      selector.attr('data-product-brand').trim(),
              img:        $(el).find("img").attr('data-src')
          }
      
          products.push(product)
      
        });
          
        return products
      }

    const start_page = 1
    const end_page = 5
    
    const subpath = 'products'
    const page_param = (page)=>`page=${page}`
    const limit_param = 'limit=250'
    
    const urls = []
    
    //generate urls
     for(let page = start_page; page <= end_page; page++)
        urls.push(`${domain}/${subpath}?${limit_param}&${page_param(page)}`)
            
    //visit urls, process each url with scraper function, return array of products
    const raw_products = (await utils.scrapePages(urls, scrapeProductInfo,log)).flat()
    return raw_products
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
function clean(raw_products, buckets, log){

    // remove non-vape products, such as rolling-papers, vaporizers, lighters, butane, etc
    // this is acquired from analysis of categories
    let includes = [
        'Accessories,510ThreadBatteries',
        'Accessories,Batteries&Chargers',
        'E-Cigs',
        'E-Juice',]

    let ignore = [
        'Rockit Cruiser']

    const pb = utils.initProductBucketMetrics(log)
    const pc = utils.propsCount(log)

    log.info(`//////////cleaning raw products: count: ${raw_products.length}////////////////`)

    raw_products = raw_products
    .filter(                    
        (p) =>              // remove no-category products
            p.category) 
    .map( (p)=>{            // turn PRODUCTS/a/b/c... into a,b,c             
        let arr = p.category.split("/")
        if(arr[0] === 'PRODUCTS') arr.shift()
        let str = arr.join(",")
        p.category = str
        return p })
    .filter(                                                                            
        (p)=>               // only include products that matches at least one of the strings in the includes arr   
            includes.filter( (tag) => p.category.includes(tag) ).length > 0  )
    .filter(                                                                            
        (p)=>               // ignore products with a name that matches least one of the strings in the ignore arr   
            ignore.filter( (tag) => p.name.includes(tag) ).length === 0  ) 
    .map(                           
        (p) => {            // if the item has no brand or a default brand, extract the first word from the name string and set it as the brand
            p.brand = (p.brand === '' || p.brand.includes("The Best Vape Store In Surrey") ) ? p.name.split(" ")[0] : p.brand
            return p})
    .map( 
        (p)=>{              // add product to 0 or more buckets, based on tags/synomyns within each bucket. print no bucket or multibucket matches to log
            p.buckets = utils.getProductBuckets(p.category, p.name, buckets)
            p.buckets.length > 1 && log.info(`multiple buckets: ${p.buckets} , ${p.name}, ${p.category}`)
            p.buckets.length === 0 && log.info(`multiple buckets: ${p.buckets} , ${p.name}, ${p.category}`)
            pb.putProductBuckets(p.buckets,p)
            pc.countProps(p)
            //console.log(p.buckets , p.name, p.category)
            return p})

            pb.printProductBuckets()
            pc.printPropsCount()
            log.info(`//////////finished cleaning: count: ${raw_products.length} ////////////////`)   

    return raw_products 
}



