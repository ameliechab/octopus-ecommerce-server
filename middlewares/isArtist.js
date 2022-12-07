const isArtist = (req, res, next) => {
    
    const isArtist = req.currentUser.isArtist;
    if (isArtist === true) {
        return next();
    } else {
        return res.status(404).render('not-found'); 
    };
};

module.exports = isArtist;