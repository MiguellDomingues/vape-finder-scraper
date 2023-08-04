

const tbvapes_config = {
  //PLATFORM: SHOPIFY
   domain:              'https://www.thunderbirdvapes.com',
   data_dir:            'thunderbirdvapes',
   raw_products_file:   'products',
  
   buckets:[
      {
          name: 'Juices',
          synonyms: ['E-Liquid'] 
      },
      {
          name: 'Coils',
          synonyms: ['coil','rda','atomizer','RPM 40 Pod','Ego 1 Coil 1.0 Ohm 5/Pk','Metal RDA Stand','Crown 5 Coil']
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
          synonyms: ['boxes', 'boxmod', 'box mod', 'mod', 'box', 'Aegis Legend 2 200W Mod']
      },
      {
          name: 'Batteries',
          synonyms: ['battery', 'batteries','18650','18650','Evod 650mAh Battery']
      },
      {
          name: 'Chargers',
          synonyms: ['charger','charging','lush q4 charger','evod usb charger','Intellicharger I4 V2 Li-Ion/Nimh','Battery Charger','Wall Adapter','Power Bank']
      },
      {
          name: 'Replacement Glass',
          synonyms: ['glass','replacement','pyrex','replacement glass','dotAIO V2 Replacement Tank']
      },
      {
          name: 'Accessories/Miscellaneous',
          synonyms: ['wire','drip tip','cotton','apparel','mod accessories','pens','wick','adapter',
          'screwdriver','tweezer','decorative ring','magnet connector','vaper twizer','diy tool kit','Clapton Coil Building Kit','Zipper Storage Bag','Mouthpiece Glass']
      }
    ],

    execute_scrape:         false,
    execute_inventory:      true
}


const surreyvapes_config = {
  //PLATFORM: BIGCOMMERCE
  domain:              'https://www.surreyvapes.com',
  data_dir:            'surreyvapes',
  raw_products_file:   'raw_products',
  buckets: [
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
],
   execute_scrape:             false,
   execute_inventory:          false
}

const ezvapes_config = {
  //domain_platform: woo-commerce
  domain:                    'https://ezvape.com',
  data_dir:                  'ezvape',
  log_file:                  'ezvape',
  utils:                     require("./utils.js"),

  //subscrapes
  fetch_products:{
    raw_products_file:        'raw_products',
    //
    exec_scrape:   false,
  },
  
  fetch_brand_ids:{
    brand_links_file:       'brand_links',
    b_product_ids_file:     'brand_product_ids',
    brands_subdir:          'brands' ,
    exec_scrape:   false,
  },
  
  fetch_category_ids:{
    category_links_file:       'category_links',
    c_product_ids_file:   'category_product_ids',
    categories_subdir:    'categories',
    exec_scrape: false,
  },
  ////////////////

  write_inventory:{
    inventory_file:           'ezvape',
    //move buckets to another file
    buckets: [
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
  ],
    exec_inventory:         true,
  },
}


const inventory_config = {
  log_file:                   'inventory',
  write_collections_JSON:     true, //write validated collections to JSON files
  write_local_db:             true, //true writes to local mongodb instance, false writes atlas instance, 
  execute_db_write:           true  //true  
}







Promise.all([
     // require("./scripts/ezvape")(ezvapes_config), 
     // require("./scripts/thunderbirdvapes")(tbvapes_config),
      require("./scripts/surreyvapes")(surreyvapes_config)
  ]).then( () => {
     // require("./scripts/inventory")(inventory_config)
  })


  /*
execute scraping scripts and write inventory json to db upon completion
- ezvape takes about 5 minutes to fully scrape
*/

//change each part in this:
/*

TODO:
- add these jsons to another file 
- (or should i just put them back as constants?)
- make utils a class; put in the logger/file names/paths etc?
  - make stuff a lot easier going forward i think
- create a analytics? type routine to analyze, missing fields, etc

(name){
  reads: [ arr of file names that read for this process INSTEAD OF SCRAPING]
  writes: [ arr of output files (if any)]

  ezvapes:{
    domain
    ....
    (name of read dir/defaults to read)
    (name of write dir/defaults to write)
    ....

    //CHECK FILE DEPENDENCIES BEFORE SCRAPING ANYTHING
    NEEDS TO ABORT IF IT DETECTS THAT FILES ARE MISSING OR SCRAPES THAT PRODUCE DEPENDENCY DATA ARE SET TO FALSE

    for each pipeline:
      - if execute is F:
        - add the read arr[] to dependencies set
      else
        - add writes arr[] to fufilled_dependencies set

     for each d in dependencies set:
      - does d exist in fufilled_dependencies?
          T: remove it from dependencies set <- a single file can fufull multiple dependencies (assuming its same file in same folder))
          F: does the file exist to be consumed?
            t: load it
            f: abort this scrape because were missing a file
      
    
    


    //THESE ARE PIPELINES 
    fetch_products:{
      exec = T/F <---- IF THIS IS FALSE, then scan for existence of file names in writes[] arr // those files are dependencies for any other processes after that need raw_products
       if it is true, then it outputs data for the writes 
      consumes/reads: [raw_products], <-- if exe is F, read this
      produces/writes:[brand_links, category_links, raw_products] <-- 
    }
    fetch_brand_ids:{
      //exec = T/F <-- needs to either open a brand_link file (so a previous fetch_products scape needed to have been done) OR fetch_products needs to be true
      reads[brand_links_file]
      writes[brand_product_ids]
    }
    fetch_caegory_ids:{
      T/F <-- needs to either open a category_link file (so a previous fetch_products scape needed to have been done) OR fetch_products needs to be true
      reads[cate_links_file]
      writes[cate_product_ids]
    }
    write_inventory:{
      reads[product_id, cate_product_ids_file, brand_product_ids_file]
      writes[inventory_file]
    }

  }
}
*/

//console.log(inventory_config)
//

//I HAVE AN API TO AN VPN
// CAN I GET A NEW IP FOR EVERY SCRAPE?
// CAN I PUT THE IMPORTS ONTO A LIST AND LOOP THE LIST, MAKING EACH A PROMISE?
/*
- STORE EACH IMPORT INTO A LIST AS AN INSTANCE:
const l = [
 
]
*/
//console.log("asdasdasds")


  /*
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
  */


  




    

     


