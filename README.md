# vape-finder-scraper

## Description

A collection of web scraping scripts to discover content for the [BC Vape Finder](https://github.com/MiguellDomingues/vape-finder-client/) project

## Purpose

I developed this project to explore a practical application of web scraping, the ETL process. Tasks include:

- Implementing scripts of varying complexity to crawl, scrape, clean and categorize product data from 3 different e-commerce websites into JSON files with a common structure
- Validating products against a predefined schema and inserting them into a mongodb collection

## How To Use

Requires Node.js and Git
```
# Clone this repository
$ git clone https://github.com/MiguellDomingues/vape-finder-scraper

# Go into the repository dir
$ cd vape-finder-scraper

# Install dependencies
$ npm install

# Run the app
$ node init
```

### Configuration

Control which scripts will run on each execution by commenting or uncommenting the corresponding ```require(..)(..)``` statement in ```init.js```

~~~
Promise.all([                                                 //web scrapers for each of the target websites
      require("./scripts/ezvape")(ezvapes_config), 
      require("./scripts/thunderbirdvapes")(tbvapes_config),
      require("./scripts/surreyvapes")(surreyvapes_config)
  ]).then( () => {
      require("./scripts/inventory")(inventory_config)        //read JSON files in scraper/inventory. runs after the all above scripts have completed
  })
~~~

Each script is passed in a config object containing flags to control behaviors:

```
const tbvapes_config = {
  //run the web scraping function and save results to scraper/thunderbirdvapes/products.JSON 
  execute_scrape:             true,

  //read products.JSON , clean the scraped products , save to scraper/inventory/thunderbirdvapes.JSON     
  execute_inventory:          true     
}
```

```
const surreyvapes_config = {
  //run the web scraping function and save results to scraper/surreyvapes/products.JSON
  execute_scrape:             true,

  //read products.JSON, clean the scraped products and save to scraper/inventory/surreyvapes.JSON    
  execute_inventory:          true     
}
```

```
const ezvapes_config = {
  //run the web scraping function to generate 3 files in scraper/ezvapes: products.JSON, brand_links.JSON, category_links.JSON
  exec_scrape_products__category_brand_links:   true,
  
  //read brand_links.JSON, run the web scraping function to generate brand_ids.JSON
  exec_scrape_brand_ids:                        true,
  
  //read category_links.JSON, run the web scraping function to generate category_ids.JSON
  exec_scrape_category_ids:                     true,
  
  //read products.JSON, brand_ids.JSON, category_ids.JSON, adds category, brand to product, clean and save to scraper/inventory/ezvapes.JSON  
  exec_inventory:                               true,
}
```

```
const inventory_config = {
  //write validated collections to JSON files in database/collections/(timestamp) dir 
  write_collections_JSON:     true,
  //true writes to local mongodb instance, false writes atlas instance,  
  write_local_db:             true,
   //true writes/overwrites collections in db specified in above flag 
  execute_db_write:           true 
}
```




## Implementation Overview

![Untitled Diagram drawio (2)](https://github.com/MiguellDomingues/vape-finder-scraper/assets/42451135/e83e4d7c-37f6-48ae-b64b-6fb1ea735932)



### Data Extraction

Data extraction for thunderbirdvapes and surreyvapes is the most straightforward:

```
peudocode:
const urls = [


]
```



thunderbirdvapes, surreyvapes

### Transformation

The goal of each script is to produce a list of objects with the shape:

```
{
  id:         String,
  src:        URL,
  name:       String,
  category:   String,
  price:      Double,
  brand:      String,
  img:        URL,
  buckets:    Array[String]
}
```

Each script implements its own cleaning function 

### thunderbirdvapes,surreyvapes

This section will provide an overview of the _data extraction_, _cleaning_ and _loading_ implementations

_Scrape Target_           | _E-Commerce Platform_ | _Scraping Complexity_
:-------------------------:|:-------------------------: | :-------------------------:
https://thunderbirdvapes.com | Shopify | Lowest
https://surreyvapes.com | BigCommerce | Medium
https://ezvape.com | WooCommerce | Highest









### Data Loading
![Untitled Diagram-Page-2 drawio](https://github.com/MiguellDomingues/vape-finder-scraper/assets/42451135/0e8684e9-f157-406e-8fe0-1cecedc51c1d)


# Data Extraction

_Website_           | _E-Commerece Platform_ | _Scraping Complexity_
:-------------------------:|:-------------------------: | :-------------------------:
https://thunderbirdvapes.com | Shopify | Lowest
https://surreyvapes.com | BigCommerce | Medium
https://ezvape.com | WooCommerce | Highest


## Output Structure

database/
├── configs
│   ├── plist
│   │   └── com.apple.Terminal.plist
│   ├── sublime_2
│   │   └── ...
│   └── sublime_3
│       └── ...
├── dotfiles
│   ├── .bash_profile
│   ├── .bashrc
│   ├── .gitconfig
│   ├── .pypirc
│   ├── ...
│   ├── .shallow-backup
│   ├── .ssh/
│   │   └── known_hosts
│   ├── .vim/
│   └── .zshrc
├── fonts
│   ├── AllerDisplay.ttf
│   ├── Aller_Bd.ttf
│   ├── ...
│   ├── Ubuntu Mono derivative Powerline Italic.ttf
│   └── Ubuntu Mono derivative Powerline.ttf
└── packages
    ├── brew-cask_list.txt
    ├── brew_list.txt
    ├── cargo_list.txt
    ├── gem_list.txt
    ├── installed_apps_list.txt
    ├── npm_list.txt
    ├── macports_list.txt
    ├── pip_list.txt
    └── sublime3_list.txt

### thunderbirdvapes

This site is the least complex of the scrapes 

   

- https://thunderbirdvapes.com
- https://ezvape.com
- https://surreyvapes.com


