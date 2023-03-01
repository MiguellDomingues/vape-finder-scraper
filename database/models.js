const mongoose = require('mongoose');

const BUCKETS = [
    'Juices',
    'Coils',
    'Pods',
    'Tanks',
    'Starter Kits',
    'Mods',
    'Batteries',
    'Chargers',
    'Replacement Glass',
    'Accessories/Miscellaneous',
 ] 

const productSchema = new mongoose.Schema({
    source:         { type: String, required: true },
    source_id:      { type: String, required: true },
    source_url:     { type: String, required: true },
    last_updated:   { type: String, required: true },
    categories:     { type: [String], enum: Object.values(BUCKETS) },

    product_info:{
        name:               { type: String, required: true },
        img_src:            String,
        info_url:           { type: String, required: true },
        price:              { type: Number, required: true },
        brand:              String,
        category_str:           { type: String, required: true },   
    } 
});

const tagMetaData = new mongoose.Schema({
    type_name:        { type: String, required: true }, //categories, brands, stores, flavors  
    tags:             { type: [{
                            tag_name:          { type: String, required: true }, 
                            product_count:     { type: Number, required: true }
                      }], required: true},

    
});

module.exports = {
    Product:     mongoose.models.Product || mongoose.model('Product', productSchema),
    TagMetaData: mongoose.models.TagMetaData || mongoose.model('TagMetaData', tagMetaData),
  }

