function log(req, res, next){
    console.log("Autetication...");
    next();
}

module.exports = log;