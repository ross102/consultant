const express = require('express');
const router = express.Router({ mergeParams: true });
const Post = require('../models/post');
const Comment = require('../models/comment');


// /post/:id/comments
router.get('/', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        res.render('comment/comments', { post });
    } catch(error) {
        console.log(error)
    }
})
// /post/:id/comments
router.post('/', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
        req.body.comment.author = req.user._id
        const newComments = await Comment.create(req.body.comment)
        post.comments.push(newComments);
        post.save()
        res.redirect('/post/' + post.id)
    } catch (error) {
        console.log(error)
    }
})
// /post/:id/comments/:id
router.delete('/:comment_id', async (req, res) => {
    try {
        await Comment.findByIdAndRemove(req.params.comment_id);
        req.flash("success", "deleted")
        res.redirect('/post' + req.params.id)
    } catch (error) {
        console.log(error)
    }
       await Comment.findByIdAndRemove(req.params.comment_id);

})

module.exports = router;