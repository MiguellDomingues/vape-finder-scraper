# vape-finder-scraper

## Description

Content discovery for the [BC Vape Finder](https://github.com/MiguellDomingues/vape-finder-client/) project

## Purpose

I developed this project to explore a practical application of web scraping, the ETL process. Tasks include:

- Implementing scripts of varying complexity to crawl, scrape, clean and categorize product data from 3 different e-commerce websites into JSON files with a common structure
- Validating products against a predefined schema and inserting them into a mongodb collection

## How To Use

```
# Clone this repository
$ git clone https://github.com/MiguellDomingues/vape-finder-scraper

# Go into the repository
$ cd vape-finder-scraper

# Install dependencies
$ npm install

# Run the app
$ node init
```

### Configurations




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



### thunderbirdvapes

This site is the least complex of the scrapes 

   

- https://thunderbirdvapes.com
- https://ezvape.com
- https://surreyvapes.com


