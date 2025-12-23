import mongoose from 'mongoose';
import dotenv from "dotenv";

dotenv.config();

const mongoDBUri = process.env.MONGODB;

const connectWithDataBase = async () => {
    await mongoose.connect(mongoDBUri).then(() => {
        console.log("Connected to database");
    }).catch((error) => {
        console.log("Error Connectiong to Database", error);
    });
};

export default connectWithDataBase;

