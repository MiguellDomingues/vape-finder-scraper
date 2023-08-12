const cheerio = require("cheerio");
const utils =   require("../utils.js");

//domain_platform: woo-commerce
const domain =                   'https://ezvape.com'
const data_dir =                  'ezvape'
const _data_dir =                `${utils.ROOT_DATA_DIR}/${data_dir}`

const log_file =                  data_dir
const inventory_file =            data_dir

const raw_products_file =       'raw_products'

const brand_links_file =       'brand_links'
const b_product_ids_file =     'brand_product_ids'

const category_links_file =    'category_links'
const c_product_ids_file =     'category_product_ids'

const brands_subdir             = _data_dir
const categories_subdir         = _data_dir


const buckets = [
    {
        name: 'Juices',
        synonyms: ['e-juice', //surreyvapes
                  'ejuice',  //ezvape
                  'e-liquid'] //tbvapes
    },
    {
        name: 'Coils',
        synonyms: ['coil','rda','atomizer','RPM 40 Pod','Ego 1 Coil 1.0 Ohm 5/Pk','Metal RDA Stand','Crown 5 Coil','Notch Coil SS316L 0.35 ohm 10/Pk']
    },
    {
        name: 'Pods',
        synonyms: ['pod',]
    },
    {
        name: 'Tanks',
        synonyms: ['tank','clearomizer']
    },
    {
        name: 'Starter Kits',
        synonyms: ['starter', 'kit','disposable','disposables']
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
        synonyms: ['charger','charging','lush q4 charger','evod usb charger','Intellicharger I4 V2 Li-Ion/Nimh','Battery Charger','Wall Adapter','Power Bank']
    },
    {
        name: 'Replacement Glass',
        synonyms: ['glass','replacement','pyrex','replacement glass']
    },
    {
        name: 'Accessories/Miscellaneous',
        synonyms: ['wire','drip tip','cotton','apparel','mod accessories','pens','wick','adapter', '30 mL Unicorn Bottle',
        'screwdriver','tweezer','decorative ring','magnet connector','vaper twizer','diy tool kit','Clapton Coil Building Kit','Zipper Storage Bag','Mouthpiece Glass']
    },      
]


module.exports = (config) => {

    const {
       exec_scrape_products__category_brand_links,    
       exec_scrape_brand_ids,
       exec_scrape_category_ids,
       exec_inventory,
    } = config

    const log = utils.getLogger(log_file)

    utils.createDirs([_data_dir,brands_subdir,categories_subdir])

    return new Promise( async (resolve) => {
        const time_start = Date.now()
        log.info("**************************executing " +domain+ " process***********************************************")

        try{
            
            /* /////////////////stage 1//////////////////////
                a) scrape the product id/img/price/names of all products from a single endpoint
                b) scrape the category subdomain links off the sidebar (PRODUCT CATEGORIES)
                c) scrape the brand subdomain links off the sidebar (FILTER BY MANUFACTURER)
                d) write results to files (overwrites existing)
            */
            const { products, brands, categories } = await (async function(){
                if(exec_scrape_products__category_brand_links){

                    const {products, brands, categories } = await scrapeProductsAndBrandCategoryLinks(domain, utils, log)  
                    utils.writeJSON(_data_dir, raw_products_file, products, log)  
                    utils.writeJSON(brands_subdir, brand_links_file, brands, log)
                    utils.writeJSON(categories_subdir, category_links_file, categories, log)
                    return {products, brands, categories }
                }

                const products = utils.readJSON(_data_dir, raw_products_file, log)
                const brands = utils.readJSON(brands_subdir, brand_links_file, log)
                const categories = utils.readJSON(categories_subdir, category_links_file, log)
                return { products, 
                    brands, 
                    categories }
            })()
            
            
            /* /////////////////stage 2a//////////////////////
              using the category subdomain links scraped from stage 1, visit each link and scrape the product ids associated with each
            */
            const product_ids_by_category = await (async function(){

                if(exec_scrape_category_ids){
                    const product_ids_by_category = await getProductIdsByCategory(categories, domain, utils, log)    
                    utils.writeJSON(categories_subdir, c_product_ids_file, product_ids_by_category, log)
                    return product_ids_by_category     
                }else{
                    return utils.readJSON(categories_subdir, c_product_ids_file, log)
                }          
            })()

            /* /////////////////stage 2b//////////////////////
              using the brands subdomain links scraped from stage 1, visit each link and scrape the product ids associated with each
            */
            const product_ids_by_brand = await (async function(){

                if(exec_scrape_brand_ids){
                    const product_ids_by_brand = await getProductIdsByBrand(brands, domain, utils, log) 
                    utils.writeJSON(brands_subdir, b_product_ids_file, product_ids_by_brand, log)
                    return product_ids_by_brand     
                }else{
                    return utils.readJSON(brands_subdir, b_product_ids_file, log)
                }          
            })()

            /* /////////////////stage 3//////////////////////
              merge the categories and brands by product id (from stage 2) into each product scraped from stage 1
            */
            const categorized_branded_products = categorizeBrandProducts(products, product_ids_by_brand, product_ids_by_category, log)
            const cleaned_products             = clean(categorized_branded_products, buckets, utils, log)

            //write_inventory.exec_inventory && utils.writeJSON(utils.INVENTORIES_DIR, inventory_file, cleaned_products, log)
            exec_inventory && utils.writeJSON(utils.INVENTORIES_DIR, inventory_file, cleaned_products, log)
        }
        catch(err){
            console.log(err)
            log.error(err)
        }
        finally{
            const time_finish = Date.now()
            log.info("processed " +domain+ " execution in " +  (time_finish - time_start)/1000 + " seconds")    
            resolve()  
        }
    })
}


async function scrapeProductsAndBrandCategoryLinks(domain, utils, logger){

     function scrapeProductsBrandsCategories(html){

                function scrapeBrands(html){
            
                    const $ = cheerio.load(html);
                
                    const brands = []
                
                    $("#kapee-product-brand-2 .kapee_product_brands").children().each( (idx,el) => {
                
                    if(idx !== 0){
                            brands.push({
                                brand: $(el).find("a").text(),
                                link: $(el).find("a").attr("href").split("/")[4]
                            })                 
                        }      
                    })
                
                    return brands
                }
                
                function scrapeProductInfo(html){
                
                    const $ = cheerio.load(html);
                
                    const products_by_id = []
                
                    $("#primary .products").children().each( (idx,el) => {
                
                        const id =  $(el).find(".product-wrapper .product-info .product-price-buttons .product-buttons-variations .cart-button a").attr("data-product_id") ;
                        const img = $(el).find(".product-wrapper .product-image a img").attr('src') ;
                        const src = $(el).find(".product-wrapper a").attr('href') ;
                        const title = $(el).find(".product-wrapper .product-info .product-title-rating a").text()
                        const price =  $(el).find(".product-wrapper .product-info .product-price-buttons .product-price .price .amount bdi").first().text()
                
                        products_by_id.push({
                            id: id,
                            src: src,
                            title: title,
                            img: img,
                            price: price
                        })
                    })
                
                    return products_by_id
                
                }
                
                function scrapeCategories(html){
                
                    /*
                    const $ = cheerio.load(html);
                
                    const categories = []
                
                    $("#woocommerce_product_categories-4 .product-categories").children().each( (idx,el) => {
                
                    categories.push({
                                category: $(el).find("a").filter( (index) => index === 0 ).text(),
                                link: $(el).find("a").attr("href").split("/")[4]
                        })                          
                    })
                    */
                
                    //get the nested sub-categories within each category
                    function scrapeSubcategories(category, link, slice_index, element){
                    
                        const appended_category = category + $(element).find("a").filter( (index) => index === 0 ).text() + "/"
                        const appended_link = link + $(element).find(">a").attr("href").split("/").slice(slice_index).join("/") 
                        categories.push({category: appended_category,link: appended_link}) //TODO: remove the hanging "/" on the last appended string
                    
                        $(element).find("> .children").children().each( (idx, _el) => scrapeSubcategories(appended_category, appended_link, slice_index+1, _el))           
                    }
                    
                    const $ = cheerio.load(html);
                    const categories = []
                    
                    $("#woocommerce_product_categories-4 .product-categories").children().each( (idx,el) => scrapeSubcategories("", "/", 4, el))
                    
                
                    
                
                    return categories
                }
                
            
                const items = {}
            
                items.products = scrapeProductInfo(html)
                items.brands = scrapeBrands(html)
                items.categories = scrapeCategories(html)
            
                return items
    }

    const subpath = 'shop/'
    const param = 'per_page=1000'
    const urls = [`${domain}/${subpath}?${param}`]

    const json = await utils.scrapePages(urls, scrapeProductsBrandsCategories, logger)
    return json[0]
}

function scrapeProductIds(html){

    const $ = cheerio.load(html);

    const product_ids = []

    $("#primary .products").children().each( (idx,el) => {
        const id =  $(el).find(".product-wrapper .product-info .product-price-buttons .product-buttons-variations .cart-button a").attr("data-product_id") ; 
        product_ids.push(id)
    })

    return product_ids
}

function categorizeBrandProducts(products, brand_product_ids, category_product_ids, log)
{
    log.info("**** adding brands and categories to products ****")

    const products_by_id = {}

    products.forEach( product=> products_by_id[product.id] = { name: product.title, img: product.img, price: product.price, src: product.src })

    Object.keys(brand_product_ids).forEach( key => 
        brand_product_ids[key].forEach( id =>
            products_by_id[id] ? products_by_id[id].brand = key : undefined))

    Object.keys(category_product_ids).forEach( key => 
        category_product_ids[key].forEach( id => 
            products_by_id[id] ?  products_by_id[id].category =  key : undefined))

    const merged_products = []

    Object.keys(products_by_id).forEach( (key)=>{
        const product = products_by_id[key]
        merged_products.push( {id: key, ...product} )
    })

    return merged_products
}

async function getProductIdsByBrand(brand_links,domain, utils, log){

    if(brand_links === undefined || brand_links.length === 0)
        throw new Error("brand_links can not be undefined or an empty arr")

    const subpath = 'brand'
    const param = `per_page=300`
    const urls = brand_links.map( brands => `${domain}/${subpath}/${brands.link}?${param}`)

    const product_ids_by_brand = {}
    const product_ids = await utils.scrapePages(urls, scrapeProductIds, log)
    product_ids.forEach( (product_ids, idx) => product_ids_by_brand[brand_links[idx].brand] = product_ids)

    return product_ids_by_brand
}

async function getProductIdsByCategory(category_links,domain, utils, log){

    if(category_links === undefined || category_links.length === 0)
        throw new Error("category_links can not be undefined or an empty arr")

    subpath = 'buy-vapes-online'
    param = `per_page=300`
    urls = category_links.map( categories => `${domain}/${subpath}${categories.link}?${param}`)

    const product_ids_by_category = {}
    const product_ids = await utils.scrapePages(urls, scrapeProductIds, log)
    product_ids.forEach( (product_ids, idx) => product_ids_by_category[category_links[idx].category] = product_ids)

    return product_ids_by_category
}

function clean(raw_products, buckets, utils, log){

    let includes = [
        'eJuice',
        'Vape Kits',
        'Tanks & Rebuildables',
        'Pods & Coils',
        'E-Juice',
        'Box Mods',
        'Accessories',]

    log.info(`//////////cleaning raw products: count: ${raw_products.length}////////////////`)
    const pb = utils.initProductBucketMetrics(log)
    const pc = utils.propsCount(log)

    raw_products = raw_products
    .filter( 
        p => p.price && p.price.trim() != "")     /// remove products which have no price
    .map( 
        p => {p.price = p.price.replace("$", "") ///  remove '$' from price string
        return p})
    .filter(                                                                             
        (p) => 'category' in p )                // remove products which have no category
    .map( product => {
           product.category = product.category.split("/")   //remove tailing '/'
           product.category.pop()
           product.category = product.category.join(",")
        return product})
    .filter(                                                                              
        (p)=> includes.filter( (tag) => p.category.includes(tag) ).length > 0 ) // remove products that are not part of specific categories
    .map( 
        (p)=>{              // add product to 0 or more buckets, based on tags/synomyns within each bucket. print no bucket or multibucket matches to log
            p.buckets = utils.getProductBuckets(p.category, p.name, buckets)
            p.buckets.length > 1 && log.info(`multiple buckets: ${p.buckets} , ${p.name}, ${p.category}`)
            p.buckets.length === 0 && log.error(`no buckets: ${p.buckets} , ${p.name}, ${p.category}`)
            pb.putProductBuckets(p.buckets,p)
            pc.countProps(p)
           // console.log(p.buckets , p.name, p.category)
    return p})

    pb.printProductBuckets()
    pc.printPropsCount()
    log.info(`//////////finished cleaning: count: ${raw_products.length} ////////////////`)

    return raw_products
}




/*

const html = fs.readFileSync('test.html', {encoding:'utf8', flag:'r'})
function f1(html){

  function scrapeSubcategories(category, link, slice_index, element){
    
    const appended_category = category + $(element).find("a").filter( (index) => index === 0 ).text() + "/"
    const appended_link = link + $(element).find(">a").attr("href").split("/").slice(slice_index).join("/") 
    categories.push({category: appended_category,link: appended_link})

    $(element).find("> .children").children().each( (idx, _el) => scrapeSubcategories(appended_category, appended_link, slice_index+1, _el))           
  }

  const $ = cheerio.load(html);
  const categories = []

  $(".product-categories").children().each( (idx,el) => scrapeSubcategories("", "/", 4, el))

  console.log(categories)
}




  function f2(html){

  const $ = cheerio.load(html);

  const categories = []

  $(".product-categories").children().each( (idx,el) => {

    const category = $(el).find("a").filter( (index) => index === 0 ).text()
    const link = $(el).find("a").attr("href").split("/")[4]
    const subcategories = []

    function scrapeSubcategories(category, link, slice_index, element){
      $(element).find("> .children").children().each( (idx, _el) => { 
          const appended_category = category + "/" + $(_el).find("a").filter( (index) => index === 0 ).text() 
          const appended_link = link+ "/" + $(_el).find(">a").attr("href").split("/").slice(slice_index).join("/")
          subcategories.push({category: appended_category,link: appended_link})
          scrapeSubcategories(appended_category, appended_link, ++slice_index, _el)
      })   
    }

    scrapeSubcategories(category, link, 4, el)

    categories.push({
      category: category,
      link: link,
      subcategories: subcategories
    })         
  })

  let x = 0

  categories.forEach( (a)=>{
    x = x + a.subcategories.length
  })

  console.log( x + categories.length)

}

f1(html)

*/
