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

//note that 'required: true' is only for the KEY
const productSchema = new mongoose.Schema({
    source:         { type: String, required: true },
    source_id:      { type: String, required: true },
    source_url:     { type: String, required: true },
    last_updated:   { type: String, required: true },
    categories:     { 
        type: [String], 
        enum: Object.values(BUCKETS),
        required: true,
        validate: {
            validator: function (categories) {
              return categories.length >= 1 && !categories.includes(null); 
            },
            message: 'categories array must have a minimum of 1 element and not include nulls.',
        }
    },
    price:          { type: Number, required: true },
    name:           { type: String, required: true },
    img_src:          String,
    info_url:       { type: String, required: true },
    brand:            String,
    category_str:   { type: String, required: true },

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

