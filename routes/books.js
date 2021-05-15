const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');

//Allowed mime types
 const imageMimeTypes = ['image/jpeg','image/png','image/jpg','images/gif'];


//All Authors
router.get('/',async (req,res)=>{
    let query = Book.find();
    if(req.query.title != null && req.query.title != ''){
        query = query.regex('title',new RegExp(req.query.title,'i'))
    }
    if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishDate',req.query.publishedBefore);
    }
    if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishDate',req.query.publishedAfter);
    }
    try{
        const books = await query.exec();
        res.render('books/index',{
            books: books,
            searchOptions: req.query
        })
    }catch{
        res.redirect('/');
    }
});

//New author
router.get('/new', (req,res)=>{
    renderNewPage(res,new Book());
});

//Create New Author
router.post('/',(req,res)=>{
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        descripition: req.body.description
    });
    saveCover(book,req.body.cover);

    book.save((err)=>{
        if(err){
            renderNewPage(res,book,true);
        }else{
            res.redirect('/books');
        }
    });
});


function renderNewPage(res,book,hasError = false){
    
    Author.find({},function(err,authors){
        if(err){
            res.redirect('/books');
        }else{
            const params ={
                book: book,
                authors: authors 
            }
            if(hasError)params.errorMessage ='Error Creating New Book';
            res.render('books/new',params);
        }

     });
    
}
function saveCover(book, coverEncoded) {
    if (coverEncoded == null) return
    const cover = JSON.parse(coverEncoded)
    if (cover != null && imageMimeTypes.includes(cover.type)) {
      book.coverImage = new Buffer.from(cover.data, 'base64')
      book.coverImageType = cover.type
    }
  }
module.exports = router;
