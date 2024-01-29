import mongoose, { Schema } from 'mongoose';

const blogSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  subTitle: {
    type: String,
    required: true,
    trim: true,
  },
  imageUrl: {
    type: String,
  },
  blogContent: {
    type: String,
    required: true,
    trim: true,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Post-save hook to update the associated user's blogs array
blogSchema.post('save', async function (doc) {
  try {
    const user = await mongoose.model('User').findByIdAndUpdate(doc.author, {
      $addToSet: { blogs: doc._id },
    });

    if (!user) {
      throw new Error('User not found');
    }
  } catch (error) {
    console.error('Error updating user blogs array:', error.message);
  }
});

export const Blog = mongoose.model('Blog', blogSchema);
