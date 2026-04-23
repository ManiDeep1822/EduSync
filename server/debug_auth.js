const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkUser() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: 'admin@schedulai.com' });
  if (!user) {
    console.log('User not found!');
  } else {
    console.log('User found:', user.email);
    const isMatch = await user.comparePassword('Admin@1234');
    console.log('Password match Admin@1234:', isMatch);
  }
  process.exit();
}

checkUser();
