
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

const tbvapes_config = {
   domain:              'https://www.thunderbirdvapes.com',
   data_dir:            'thunderbirdvapes',
   raw_products_file:   'products',
   inventory_file:      'thunderbirdvapes',
   log_file:            'thunderbirdvapes',
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
    utils:                      require("./utils.js"),
    execute_scrape:             false,
    execute_inventory:          false
}

const surreyvapes_config = {
  domain:              'https://www.surreyvapes.com',
  data_dir:            'surreyvapes',
  raw_products_file:   'raw_products',
  inventory_file:      'surreyvapes',
  log_file:            'surreyvapes',
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
        synonyms: ['pod',]
    },
    {
        name: 'Tanks',
        synonyms: ['tank','clearomizer']
    },
    {
        name: 'Starter Kits',
        synonyms: ['starter', 'kit','disposable']
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
   utils:                      require("./utils.js"),
   execute_scrape:             false,
   execute_inventory:          false
}

const ezvapes_config = {
  domain:                    'https://ezvape.com',
  data_dir:                  'ezvape',
  log_file:                  'ezvape',
  utils:                     require("./utils.js"),

  fetch_products:{
    raw_products_file:        'raw_products',
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

  write_inventory:{
    inventory_file:           'ezvape',
    buckets: [
      {
          name: 'Juices',
          synonyms: ['e-juice', //surreyvapes
                    'ejuice',  //ezvape
                    'e-liquid'] //tbvapes
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
          synonyms: ['wire','drip tip','cotton','apparel','mod accessories','pens','wick','adapter',
          'screwdriver','tweezer','decorative ring','magnet connector','vaper twizer','diy tool kit','Clapton Coil Building Kit','Zipper Storage Bag','Mouthpiece Glass']
      },      
  ],
    exec_inventory:         false,
  },
}





Promise.all([
      //require("./scripts/ezvape")(ezvapes_config), 
      //require("./scripts/thunderbirdvapes")(tbvapes_config),
     // require("./scripts/surreyvapes")(surreyvapes_config)
  ]).then( () => {
      require("./scripts/inventory")
  })

  //mongodb+srv://mdomingues1001:<password>@cluster0.wp71sxq.mongodb.net/?retryWrites=true&w=majority

  /*
const USERNAME = 'mdomingues1001'
const PASSWORD = '0CKYslzcFlvxkTrN'
const CLUSTER = 'cluster0.wp71sxq.mongodb.net'

//const DATABASE_DOMAIN   = 'mdomingues1001:0CKYslzcFlvxkTrN@cluster0.wp71sxq.mongodb.net'    
const DATABASE_NAME     = 'vape-finder';
const PARAMS = '?retryWrites=true&w=majority'

const DATABASE_URI      = `mongodb+srv://${USERNAME}:${PASSWORD}@${CLUSTER}/${DATABASE_NAME}${PARAMS}`

const { Product } = require('./database/models.js');

let mongoose = require('mongoose');
mongoose.set('strictQuery', true);


 const products = [
  {
  source:"ezvape",
source_id:"2525",
source_url:"https://ezvape.com",
last_updated:"2023-02-14",
categories:["Replacement Glass"],
product_info:{
  name:"TFV8 Baby Replacement Glass",
  img_src:"https://ezvape.com/wp-content/uploads/2021/02/smok-tfv8-baby-replace",
  info_url:"https://ezvape.com/product/tfv8-baby-replacement-glass/",
  price:4.99,
  brand:"Smok",
  category_str:"Tanks & Rebuildables,Replacement Glass",}
 }
]

async function con(){

  
  try {
    await mongoose.connect(DATABASE_URI);
    console.log("Connected correctly to server");
    const result = await Product.insertMany(products)
    console.log("inserted: ", result)
    
} catch (err) {
    console.log(err.stack);
}
finally {
  await mongoose.connection.close();
}



}

  
//con()

*/

    

  




    

     


