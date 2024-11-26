const { getAllClubsInfo } = require('../db/queries/clubQueries');

async function getAllClubsPage(req, res){
    const clubs = await getAllClubsInfo();
    res.render('clubs', {clubs, header: 'Manage all the clubs'});
}

module.exports = {
    getAllClubsPage
}