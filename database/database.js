let mongoose = require('mongoose');

const ATLAS ={
    USERNAME: 'mdomingues1001',
    PASSWORD: '0CKYslzcFlvxkTrN',
    CLUSTER: 'cluster0.wp71sxq.mongodb.net',
    DATABASE_NAME: 'vape-finder',
    PARAMS: '?retryWrites=true&w=majority',
}

const LOCAL ={
    DATABASE_DOMAIN: '127.0.0.1:27017',       
    DATABASE_NAME: 'vape_finder',     
}

const getLocalURI = _ => `mongodb://${LOCAL.DATABASE_DOMAIN}/${LOCAL.DATABASE_NAME}`;  

const getAtlasURI = _ => `mongodb+srv://${ATLAS.USERNAME}:${ATLAS.PASSWORD}@${ATLAS.CLUSTER}/${ATLAS.DATABASE_NAME}${ATLAS.PARAMS}`


mongoose.set('strictQuery', true);


const connect = async () => { await mongoose.connect(getAtlasURI()); }

const disconnect = async () => { await mongoose.connection.close(); }

module.exports = { connect, disconnect }

/*


const LOCAL ={
    DATABASE_DOMAIN: '127.0.0.1:27017',       
    DATABASE_NAME: 'vape_finder',     
}

const getLocalURI = _ => `mongodb://${LOCAL.DATABASE_DOMAIN}/${LOCAL.DATABASE_NAME}`;  




const USERNAME = 'mdomingues1001'
const PASSWORD = '0CKYslzcFlvxkTrN'
const CLUSTER = 'cluster0.wp71sxq.mongodb.net'
const DATABASE_NAME     = 'vape-finder';
const PARAMS = '?retryWrites=true&w=majority'


const DATABASE_URI = `mongodb+srv://${USERNAME}:${PASSWORD}@${CLUSTER}/${DATABASE_NAME}${PARAMS}`
*/