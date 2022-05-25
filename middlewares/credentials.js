import AllowedOrigins from '../config/allowedOrigins'

const credentials = (req, res, next) => {
    const origin = req.headers.origin;
    if (AllowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Credentials', true);
    }
    next();
}

module.exports = credentials
