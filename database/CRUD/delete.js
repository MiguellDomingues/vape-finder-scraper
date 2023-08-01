let mongoose = require('mongoose');

 async function dropCollections(log) {
    (await mongoose.connection.db.listCollections().toArray())                                            // get the collections
            .map(collection => collection.name)                                                           // convert the collection names to an array of strings
                .forEach( async (collection) => { await mongoose.connection.db.dropCollection(collection) // drop each collection
                    .then( (result) => { log.info("dropped collection "+ collection)} )}) 
 }

 module.exports = { dropCollections }
