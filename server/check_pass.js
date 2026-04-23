const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function checkPass() {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email: 'admin@schedulai.com' });
  if (user) {
    const isMatch = await user.comparePassword('Admin@1234');
    console.log('Password check for Admin@1234:', isMatch);
  } else {
    console.log('User not found');
  }
  process.exit();
}

checkPass();
