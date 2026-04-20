const { Schema, model } = require('../connection');

const mySchema = new Schema({
      fullName: String,
      name: String,
      email: { type: String, required: true, unique: true },
      password: { type: String, required: false },
      provider: { type: String, default: 'local' },
      providerId: { type: String, default: '' },
      profileImage: { type: String, default: '' },
      createdAt: { type: Date, default: Date.now }
});

module.exports = model('user', mySchema);  //calling the model
