let mongoose = require('mongoose');

const DATABASE_DOMAIN   = '127.0.0.1:27017';          
const DATABASE_NAME     = 'vape_finder';     

const DATABASE_URI      = `mongodb://${DATABASE_DOMAIN}/${DATABASE_NAME}`;

mongoose.set('strictQuery', true);

const connect = async () => {  return await mongoose.connect(DATABASE_URI); }

const disconnect = async () => { await mongoose.connection.close(); }

const ObjectId = (id) => { return new mongoose.Types.ObjectId(id) }

module.exports = { connect, disconnect, ObjectId }