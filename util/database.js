import { MongoClient } from 'mongodb'

const url = 'mongodb+srv://admin:dudwns123@cluster0.ywcipdn.mongodb.net/?appName=Cluster0'
let connectDB

if (process.env.NODE_ENV === 'development') {
    if (!global._mongo) {
        global._mongo = new MongoClient(url).connect()
    }
    connectDB = global._mongo
} else {
    connectDB = new MongoClient(url).connect()
}
export { connectDB }