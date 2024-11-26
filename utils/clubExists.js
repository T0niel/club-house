const { getClubByName } = require('../db/queries/clubQueries');

module.exports = async function clubExists(name) {
  const club = await getClubByName(name.trim());
  return !!club;
};
