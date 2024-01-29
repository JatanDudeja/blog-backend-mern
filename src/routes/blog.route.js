import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { getAllBlogs, createPost, getSinglePost, editPost, deletePost } from "../controllers/blog.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();


router.route("/allBlogs").get(getAllBlogs)

router.route("/create-post").post(verifyJWT, upload.single('file'), createPost);
router.route("/post/:id").get(verifyJWT, getSinglePost);
router.route("/edit-post/:id").patch(verifyJWT, upload.single('file'), editPost);
router.route("/delete-post/:id").delete(verifyJWT, deletePost);

export default router
