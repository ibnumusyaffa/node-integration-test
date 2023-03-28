const { User } = require('../models');
exports.detail = async (req, res) => {
  let user = await User.findOne();
  // console.log(user);
  
  return res.send({
    message: 'test',
    data: user,
  });
};
