# vape-finder-scraper

## Description

A collection of web scraping scripts to facilitate content discovery for the [BC Vape Finder](https://github.com/MiguellDomingues/vape-finder-client/) project

## Purpose

I developed this project to explore a practical application of web scraping and the ETL process. Tasks include:

- Implementing scripts to crawl, scrape, clean and categorize product data from 3 different e-commerce websites into JSON files with a common structure
- Validating product data against a predefined schema and inserting them into a cloud-hosted mongodb instance

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

On first run, this creates a series of dirs in the proj root that will contain output/input files:

```
scraper/
├── inventory/
│   └── surreyvapes.JSON
│   └── ...
├── logs /
│   └── surreyvapes.log
│   └── ...
├── raw_pages/  
│   └── surreyvapes
│             └── products.JSON
│   └── .....
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
  //write validated collections to JSON files in database/collections/(timestamp) dir 
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

- Instead of cleaning data manually with code, we could convert the scrape output to .csv and pass those files to data cleaning tools
- Clean up the brand names (GCORE, G-CORE, GCore should all be 'Gcore')
- E-juices could have flavours as a sub-category
- Save and self-host all scraped images to cut down on bandwidth usagerather then directly hitting 
- Use [puppeteer](https://github.com/puppeteer/puppeteer) to access to browser cache and save the product images during each url scrape; this would eliminate the bandwidth usage  





