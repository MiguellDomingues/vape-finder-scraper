const fs = require('fs');
const utils = require('../utils')

const {createProducts,createTagMetaData} = require('../../database/create/createProducts.js')

const LOG_FILE_NAME  = 'inventory'

const log = utils.getLogger(LOG_FILE_NAME)

module.exports = ( () => {

    log.info("***************** reading JSON files in " + utils.INVENTORIES_DIR+" ********************")

    const getFileName = file => file.split('.')[0]
    const inventories_dir = fs.readdirSync(utils.INVENTORIES_DIR);

    if(inventories_dir.length < 1){
        log.error(utils.INVENTORIES_DIR+ " has no files. aborting")
        return
    }

    log.info("************ files: "+ inventories_dir.map(f => `${getFileName(f)}.json`).join(',') + "********************")

    const normalized_products = []

    const pbm = utils.initProductBucketMetrics(log)
    const _pbm = utils.initProductBucketMetrics(log)
    const __pbm = utils.initProductBucketMetrics(log)

    inventories_dir.forEach( (file)=>{
        
        const products = utils.readJSON(utils.INVENTORIES_DIR, getFileName(file), log)
        log.info("/////////////////////////////"+ getFileName(file)+ "///////////////////////////////////////")

        products.forEach( (p) => {
            pbm.putProductBuckets([p.buckets[0]], p)            //add the first element of the buckets arr to bucket
            p.brand && _pbm.putProductBuckets([p.brand], p)     //add the brand to bucket
            __pbm.putProductBuckets([getFileName(file)], p)     //add the store to bucket
            normalized_products.push(normalize(p, [p.buckets[0]], getFileName(file)))
        })  
    })

    pbm.printProductBuckets()
    _pbm.printProductBuckets(false, 'brands')
    __pbm.printProductBuckets(false, 'stores')

    const tag_mds = []

    tag_mds.push(pbm.generateTagMetaData("CATEGORIES"))
    tag_mds.push(_pbm.generateTagMetaData("BRANDS"))
    tag_mds.push(__pbm.generateTagMetaData("STORES"))

/*
  
    createTagMetaData(tag_mds).then((db_result)=>{
        log.info("INSERTED " + db_result.length + " RECORDS INTO TAGMETADATA COLLECTION")
    }).catch((err)=>{
        log.error("err from database")
        console.log(err)
        log.error(err)
    })  
*/
 
    createProducts(normalized_products).then((db_result)=>{
        log.info("INSERTED " + db_result.length + " RECORDS INTO PRODUCTS COLLECTION")
    }).catch((err)=>{
        log.error("err from database")
        console.log(err)
        log.error(err)
    })  
 
     
})()

function normalize(product, categories, source){

    return {
        source:         source,
        source_id:      product.id,                 
        source_url:     `https://${source}.com`,    
        last_updated:   new Date().toISOString().slice(0, 10),
        categories:     [...categories],
        product_info:{
            name:               product.name,      
            info_url:           product.src,         
            img_src:            product.img,                //TODO: need a process that fetches product images and saves them locally
            price:              product.price,              
            brand:              product.brand,              
            category_str:       product.category           
        }
    }  
}


























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
