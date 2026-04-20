require('dotenv').config();
const mongoose = require('mongoose');

const url = process.env.MONGODB_URL || 'mongodb+srv://mukulsushant30:IxhnGNBNCbd60QXO@mycluster.1bhleez.mongodb.net/'


//asynchronous function - promise object

mongoose.connect(url)
.then((result) => {
   console.log('database connected')
    
}).catch((err) => {
    console.log(err)
    
});

console.log('task 1');
console.log('task 2');

module.exports = mongoose;

