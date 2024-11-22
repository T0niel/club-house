function getCreateClub(req, res){
    res.render('homepage', {user: req.user, showModal: true})
}

module.exports = {
    getCreateClub
}