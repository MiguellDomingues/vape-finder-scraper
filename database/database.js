let mongoose = require('mongoose');

const USERNAME = 'mdomingues1001'
const PASSWORD = '0CKYslzcFlvxkTrN'
const CLUSTER = 'cluster0.wp71sxq.mongodb.net'
const DATABASE_NAME     = 'vape-finder';
const PARAMS = '?retryWrites=true&w=majority'

const DATABASE_URI = `mongodb+srv://${USERNAME}:${PASSWORD}@${CLUSTER}/${DATABASE_NAME}${PARAMS}`
mongoose.set('strictQuery', true);


const connect = async () => {  await mongoose.connect(DATABASE_URI); }

const disconnect = async () => { await mongoose.connection.close(); }

module.exports = { connect, disconnect }