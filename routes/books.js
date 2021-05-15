const express = require('express');
const router = express.Router();
const Book = require('../models/book');
const Author = require('../models/author');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadPath = path.join('public',Book.coverImageBasePath);
//Allowed mime types
const imageMimeTypes = ['image/jpeg','image/png','image/jpg','images/gif'];
const upload = multer({
    dest: uploadPath,
    fileFilter: (req,file,callback)=>{
        callback(null,imageMimeTypes.includes(file.mimetype));
    }
});


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
router.post('/', upload.single('cover'),(req,res)=>{
    const fileName = req.file != null ? req.file.filename : null;
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date(req.body.publishDate),
        pageCount: req.body.pageCount,
        coverImageName: fileName,
        descripition: req.body.description
    });

    book.save((err)=>{
        if(err){
            if(book.coverImageName != null){
                removeBookCover(book.coverImageName)
            }
            renderNewPage(res,book,true);
        }else{
            res.redirect('/books');
        }
    });
});

function removeBookCover(fileName){
    fs.unlink(path.join(uploadPath,fileName),err=>{
        if(err)console.error(err);
    })
}

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

module.exports = router;
//Regular Expression is the way to search through a string of text.
//Expersion : /cat/(flags)
//text: the fat cat ran downw the street.
//flags: i-case insensitive,g-global
// Experssion: /e+/g   