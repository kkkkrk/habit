import { MongoClient } from 'mongodb'
import mongoose from 'mongoose'

const url = 'mongodb+srv://admin:dudwns123@cluster0.ywcipdn.mongodb.net/?appName=Cluster0'

// ── 네이티브 MongoClient 연결 (raw 쿼리용) ──────────────────────────
let connectDB

if (process.env.NODE_ENV === 'development') {
    if (!global._mongo) {
        global._mongo = new MongoClient(url).connect()
    }
    connectDB = global._mongo
} else {
    connectDB = new MongoClient(url).connect()
}

// ── Mongoose 연결 (Mongoose 모델용) ────────────────────────────────
async function connectMongoose() {
    if (mongoose.connection.readyState >= 1) return  // 이미 연결됨
    return mongoose.connect(url)
}

export { connectDB, connectMongoose }