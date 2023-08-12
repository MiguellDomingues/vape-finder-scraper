# vape-finder-scraper

## Description

A collection of web scraping scripts to facilitate content discovery for the [BC Vape Finder](https://github.com/MiguellDomingues/vape-finder-client/) project

## How To Use

Requires Node.js and Git.
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

On first run, dirs will be created in the proj root that contain output/input files:

```
scraper/
├── inventory/
│   └── surreyvapes.JSON
│   └── ...
├── logs/
│   └── surreyvapes.log
│   └── ...
├── raw_pages/  
│   └── surreyvapes/
│             └── products.JSON
│   └── ...../
│             └── products.JSON
```

### Configuration

Control which scripts will run on each execution by commenting or uncommenting the corresponding ```require(..)(..)``` statement in ```init.js```

~~~
Promise.all([
      //web scrapers for each of the target websites
      require("./scripts/ezvape")(ezvapes_config), 
      require("./scripts/thunderbirdvapes")(tbvapes_config),
      require("./scripts/surreyvapes")(surreyvapes_config)
  ]).then( () => {
      //write to database. read JSON files in scraper/inventory. runs after the all above scripts have completed
      require("./scripts/inventory")(inventory_config)        
  })
~~~

Each script is passed in a config object containing control flags:

```
const tbvapes_config = {
  //      run the web scraping function
  //      save results to scraper/thunderbirdvapes/products.JSON 
  execute_scrape:     true,

  //      read products.JSON , clean the scraped products
  //      save to scraper/inventory/thunderbirdvapes.JSON     
  execute_inventory:  true     
}
```

```
const surreyvapes_config = {
  //       run the web scraping function
  //       save results to scraper/surreyvapes/products.JSON
  execute_scrape:      true,

  //      read products.JSON, clean the scraped products
  //      save to scraper/inventory/surreyvapes.JSON    
  execute_inventory:   true     
}
```

```
const ezvapes_config = {
  //      run the web scraping function to generate 3 files in scraper/ezvapes
  //      products.JSON, brand_links.JSON, category_links.JSON
  exec_scrape_products__category_brand_links:   true,
  
  //      read brand_links.JSON to generate crawlable links
  //      run the web scraping function to generate brand_ids.JSON
  exec_scrape_brand_ids:                        true,
  
  //      read category_links.JSON to generate crawlable links,
  //      run the web scraping function to generate category_ids.JSON
  exec_scrape_category_ids:                     true,
  
  //      read products.JSON, brand_ids.JSON, category_ids.JSON,
  //      add brand, category to matching products
  //      clean the scraped products, save to scraper/inventory/ezvapes.JSON  
  exec_inventory:                               true,
}
```

```
const inventory_config = {
  //write collections to database/collections/(timestamp).JSON
  write_collections_JSON:  true,

  //true writes to local mongodb instance, false writes atlas instance,  
  write_local_db:          true,

   //true writes/overwrites collections in db
  execute_db_write:        true 
}
```

## Libraries

- [axios](https://github.com/axios/axios)
- [cheerio](https://github.com/cheeriojs/cheerio)
- [mongoose](https://github.com/Automattic/mongoose)
- [winston](https://github.com/winstonjs/winston)

## Potential Improvements

- Instead of cleaning data manually with code, we could pass raw scrapes to data cleaning tools (or a web service such as https://trudo.ai)
- E-juices could have flavours as a sub-category 
- Clean up the brand names (GCORE, G-CORE, GCore should all be 'Gcore')
- Save and self-host scraped images to minimize bandwidth usage for original image providers





