const mongoose = require('mongoose')
const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config({ path: './config.env'})
const Tours = require('./../../models/tourModel')

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)

mongoose.connect(DB, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
}).then(() => console.log('DB connection successful'))

// Read json file

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'))

// import data into database

const importData = async () => {
    try {
        await Tours.create(tours)
        console.log('Data successfully loaded')
    } catch (e) {
        console.log(e)
    }
    process.exit()
}

// delete all data from collection
const deleteData = async () => {
    try {
        await Tours.deleteMany()
        console.log('Data successfully deleted')
    } catch (e) {
        console.log(e)
    }
    process.exit()
}

if (process.argv[2] === '--import') {
    importData()
} else if (process.argv[2] === '--delete') {
    deleteData()
}


console.log(process.argv)
