import { asyncHandler } from "../utils/asyncHandler.js";
import { APIErrors } from "../utils/apiError.js";
import { Blog } from "../models/blog.model.js";
import { APIResponse } from "../utils/apiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    const response = await Blog.find().populate("author", ["username"]);
    console.log(response);
    return res
      .status(200)
      .json(
        new APIResponse(200, response, "All the blogs fetched successfully.")
      );
  } catch (err) {
    throw new APIErrors(500, "Something went wrong please try again!");
  }
});

const createPost = asyncHandler(async (req, res) => {
  try {
    const { title, subTitle, blogContent } = req.body;

    const file = req.file;

    if (
      [title, subTitle, blogContent].some((field) => {
        return field?.trim() === "";
      })
    ) {
      throw new APIErrors(400, "All fields are required.");
    }

    const blogLocalPath = file.path;

    if (!blogLocalPath) {
      throw new APIErrors(400, "Blog image is required.");
    }

    const blogImage = await uploadOnCloudinary(blogLocalPath);

    if (!blogImage) {
      throw new APIErrors(400, "Blog Image file is required.");
    }

    const blog = await Blog.create({
      title,
      subTitle,
      imageUrl: blogImage?.url || "",
      blogContent,
      author: req.user?._id,
    });

    const isBlogCreated = await Blog.findById(blog?._id);

    if (!isBlogCreated) {
      throw new APIErrors(500, "Something went wrong while creating the blog.");
    }

    return res
      .status(201)
      .json(new APIResponse(200, isBlogCreated, "Blog Successfully Created."));
  } catch (error) {
    throw new APIErrors(500, "Something went wrong");
  }
});

const getSinglePost = asyncHandler(async (req, res) => {
  try {
    const response = await Blog.findById(req.params.id).populate("author", [
      "username",
    ]);
    return res
      .status(200)
      .json(new APIResponse(200, response, "Blog fetched successfully."));
  } catch (err) {
    throw new APIErrors(500, "Something went wrong please try again!");
  }
});

const editPost = asyncHandler(async (req, res) => {
  try {
    const { title, subTitle, blogContent } = req.body;
    const file = req?.file;

    if ([title, subTitle, blogContent].some((field) => field?.trim() === "")) {
      throw new APIErrors(400, "All fields are required.");
    }

    const blog = await Blog.findById(req.params.id);

    if (!blog) {
      throw new APIErrors(400, "Blog does not exist.");
    }

    if (blog.author.toString() !== req.user._id.toString()) {
      throw new APIErrors(403, "You are not authorized to edit this blog post.");
    }

    let updateFields = {
      title,
      subTitle,
      blogContent,
    };

    if (file && file.url) {
      const blogLocalPath = file.path;

      if (!blogLocalPath) {
        throw new APIErrors(400, "Blog image is required.");
      }

      const blogImage = await uploadOnCloudinary(blogLocalPath);

      if (!blogImage) {
        throw new APIErrors(400, "Blog Image file is required.");
      }

      updateFields.imageUrl = blogImage.url;
    }

    const updatedBlog = await Blog.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true });

    if (!updatedBlog) {
      throw new APIErrors(500, "Something went wrong while updating the blog.");
    }

    const isBlogUpdated = await Blog.findById(updatedBlog._id).populate("author", ["username"]);

    if (!isBlogUpdated) {
      throw new APIErrors(500, "Something went wrong while updating the blog.");
    }

    return res.status(200).json(new APIResponse(200, isBlogUpdated, "Blog Successfully Updated."));
  } catch (error) {
    throw new APIErrors(500, "Something went wrong");
  }
});



const deletePost = asyncHandler(async (req, res) => {
  try {
    const blog = Blog.findById(req.params.id)
    console.log("\n\n\n\n", blog, "\n\n\n\n")
  
    if(!blog){
      throw new APIErrors(400, 'Blog does not exist!')
    }
  
    await blog.deleteOne();
  
    return res
    .status(200)
    .json(
      new APIResponse(200, {}, "Blog deleted.")
    )
  } catch (error) {
    throw new APIErrors(500, 'Something went wrong while delete the blog! Please Try Again!')
  }

})

export { getAllBlogs, createPost, getSinglePost, editPost, deletePost };
