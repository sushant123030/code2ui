const { Schema, model, Types } = require('../connection');


const projectSchema = new Schema({

    
    user: {
        type: Types.ObjectId, 
        ref: 'user',       
        required: true
    },

  
    title: {
        type: String,
        default: 'Untitled Project',
        trim: true,
        maxlength: 100 
    },
    
    
    prompt: {
        type: String,
        default: '',
    },
    
    code: {
        type: String,
        default: 'Write Code Here...',
    },
    
    description: {
        type: String,
        maxlength: 500,
        default: 'No description provided.'
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    
  
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = model('project', projectSchema);