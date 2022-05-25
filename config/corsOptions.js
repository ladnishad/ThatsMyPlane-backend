import AllowedOrigins from './allowedOrigins'

const CorsOptions = {
    origin: (origin, callback) => {
        if (AllowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    optionsSuccessStatus: 200
}

export default CorsOptions
