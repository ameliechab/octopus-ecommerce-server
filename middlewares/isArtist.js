const isArtist = (req, res, next) => {
    // check if the current user is artist or not
    const isArtist = req.currentUser.isArtist;
    if (isArtist === true) {
        return next();
    } else {
        return res.status(404).render('not-found'); 
    };
};

module.exports = isArtist;