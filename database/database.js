const mongoose = require('mongoose');
const dotenv = require('dotenv');
const {createProducts,createTagMetaData} = require('./CRUD/create.js')
const {dropCollections} = require('./CRUD/delete.js')

dotenv.config();

const ATLAS ={
    USERNAME: process.env.DB_USERNAME  || "",
    PASSWORD: process.env.DB_PASSWORD  || "",
    CLUSTER: process.env.CLUSTER  || "",
    DATABASE_NAME: 'vape-finder',
    PARAMS: '?retryWrites=true&w=majority',
}

const LOCAL ={
    DATABASE_DOMAIN: '127.0.0.1:27017',       
    DATABASE_NAME: 'vape_finder',     
}

const LOCAL_URI = `mongodb://${LOCAL.DATABASE_DOMAIN}/${LOCAL.DATABASE_NAME}`;  

const ATLAS_URI = `mongodb+srv://${ATLAS.USERNAME}:${ATLAS.PASSWORD}@${ATLAS.CLUSTER}/${ATLAS.DATABASE_NAME}${ATLAS.PARAMS}`

mongoose.set('strictQuery', true);

const connect = async (uri) => { await mongoose.connect(uri);}

const disconnect = async () => { await mongoose.connection.close(); }

module.exports = { connect, disconnect, LOCAL_URI, ATLAS_URI, createProducts,createTagMetaData,dropCollections }

