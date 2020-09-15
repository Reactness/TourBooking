const express = require('express')
const morgan = require('morgan')
const tourRouter = require('./routes/tourRoutes.js')
const userRouter = require('./routes/userRoutes.js')
const AppError = require('./utils/appError')
const globalErrorHandler = require('./controllers/errorController')

const app = express();

// 1) Middleware
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'))

}
app.use(express.json())
app.use(express.static(`${__dirname}/public`))


// 3) Routes

app.use('/api/v1/tours', tourRouter)
app.use('/api/v1/users', userRouter)

app.all('*', (req, res, next) => {
    next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404))
})


app.use(globalErrorHandler)

module.exports = app