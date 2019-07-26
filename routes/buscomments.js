const express = require('express');
const router = express.Router({ mergeParams: true });
const PostBus = require('../models/postBus');
const Buscomment = require('../models/buscomment');


// /postBus/:id/comments
router.get('/', async (req, res) => {
    try {
        const post = await PostBus.findById(req.params.id)
        res.render('comment/buscomments', { post });
    } catch(error) {
      res.status(400).send('something went wrong')
    }
})
// /postBus/:id/comments
router.post('/', async (req, res) => {
    try {
        const post = await PostBus.findById(req.params.id)
        req.body.comment.author = req.user._id
        const newComments = await Buscomment.create(req.body.comment)
        post.comments.push(newComments);
        post.save()
        res.redirect('/postBus/' + post.id)
    } catch (error) {
        console.log(error)
    }
})
// /postBus/:id/comments/:id
router.delete('/:comment_id', async (req, res) => {
    try {
        await Buscomment.findByIdAndRemove(req.params.comment_id);
        req.flash("success", "deleted")
        res.redirect('/postBus' + req.params.id)
    } catch (error) {
        res.status(400).send('something went wrong');
    }
       await Buscomment.findByIdAndRemove(req.params.comment_id);

})

module.exports = router;