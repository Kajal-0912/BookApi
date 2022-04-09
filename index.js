require("dotenv").config();

//Framework
const express = require("express");
const mongoose = require('mongoose');


//database
const database = require("./database/index");

//Models
const BookModel = require("./database/book");
const AuthorModel = require("./database/author");
const PublicationModel = require("./database/publication");

//Initialize express
const Bookish = express();


//Configurations
Bookish.use(express.json());

//Establish database connections
mongoose.connect(process.env.MONGO_URL)
.then(()=>console.log("connection established!"));



/*
Route                       /
Description                 get all books
Access                      Public
Parameters                  none
Method                      GET
*/

Bookish.get("/", async (req, res) => {
    //changes
    const getAllBooks = await BookModel.find();
    return res.json({books : getAllBooks});
});


/*
Route                       /is
Description                 get specific books based on ISBN
Access                      Public
Parameters                  isbn
Method                      GET
*/
Bookish.get("/is/:isbn", async(req, res) => {

    const getSpecificBook = await BookModel.findOne({ISBN : req.params.isbn});
    //const getSpecificBook = database.books.filter((book) => book.ISBN === req.params.isbn);

    if(!getSpecificBook){
        return res.json({
            error : `No book found for this ISBN of ${req.params.isbn}`,
        })
    }

    return res.json({book : getSpecificBook});
});



/*
Route                       /category
Description                 get specific books based on a category
Access                      Public
Parameters                  category
Method                      GET
*/
Bookish.get("/c/:category",async (req,res) => {

    const getSpecificBooks = await BookModel.findOne({category : req.params.category});
   // const getSpecificBooks = database.books.filter((book) => book.category.includes(req.params.category));

    if(!getSpecificBooks){
        return res.json({
            error : `No book found for the category of ${req.params.category}`,
        })
    }

    return res.json({book : getSpecificBooks});
});



/*
Route                       /author
Description                 get all authors
Access                      Public
Parameters                  none
Method                      GET
*/


Bookish.get("/author", async(req, res) => {
    //changes

    const getAllAuthors = await AuthorModel.find();
    return res.json({authors : getAllAuthors});
});



/*
Route                       /author
Description                 get list of authors based on book's isbn
Access                      Public
Parameters                  isbn of book
Method                      GET
*/

Bookish.get("/author/:isbn",(req,res) => {
    const getSpecificAuthors = database.authors.filter((author) => author.books.includes(req.params.isbn)
    );

    if(getSpecificAuthors.length === 0){
        return res.json({
            error : `No author found for the book ${req.params.isbn}`,
        });
    }

    return res.json({authors : getSpecificAuthors});

});



/*
Route                       /publications
Description                 get all publications
Access                      Public
Parameters                  none
Method                      GET
*/
Bookish.get("/publications", (req, res) => {
    //changes
    return res.json({publications : database.publications});
});

//POST

/*
Route                       /book/new
Description                 add new books
Access                      Public
Parameters                  none
Method                      post
*/

Bookish.post("/book/new",async(req,res) => {
    //body
    const {newBook} = req.body;

   // database.books.push(newBook);
   const addNewBook = BookModel.create(newBook);

    return res.json({books : addNewBook, message : "book was added!"});
});


/*
Route                       /author/new
Description                 add new author
Access                      Public
Parameters                  none
Method                      post
*/
Bookish.post("/author/new",async(req,res) => {
    //body
    const {newAuthor} = req.body;

    //database.authors.push(newAuthor);

    const addNewAuthor = AuthorModel.create(newAuthor);

    return res.json({ message : "Author was added!"});
});




//PUT
/*
Route                       /book/update
Description                 update title of book
Access                      Public
Parameters                  isbn
Method                      put
*/

Bookish.put("/book/update/:isbn",async(req,res) => {

    const updatedBook = await BookModel.findOneAndUpdate({ISBN : req.params.isbn,}, {title : req.body.bookTitle,},{new: true,});
    //map or forEach 
   // database.books.forEach((book)=>{
    //    if(book.ISBN === req.params.isbn){
   //         book.title = req.body.bookTitle;
    //        return;
    //    }
   // });

    return res.json({books : updatedBook});
});

/*
Route                       /book/author/update
Description                 update/add a new author
Access                      Public
Parameters                  isbn
Method                      put
*/
Bookish.put("/book/author/update/:isbn",async(req,res) => {
   //update the book database

   const updatedBook = await BookModel.findOneAndUpdate({
       ISBN : req.params.isbn,
   },{
        $addToSet : {
            authors : req.body.newAuthor,
        },
   },{
       new : true,
   },
   );
   // database.books.forEach((book)=>{
   //     if(book.ISBN === req.params.isbn)
  //          return book.authors.push(req.body.newAuthor);
  //  });

   //update the author database

   const updatedAuthor = await AuthorModel.findOneAndUpdate({
    id : req.body.newAuthor,
},{
     $addToSet : {
         books : req.params.isbn,
     },
},{
    new : true,
},
);

  // database.authors.forEach((author) => {
   //    if(author.id === req.body.newAuthor)
  //          return author.books.push(req.params.isbn);
  // });
    return res.json({books : updatedBook, authors : updatedAuthor, message : "New author was added!"});

});

/*
Route                       /publication/update/book
Description                 update/add a new book to publication
Access                      Public
Parameters                  isbn
Method                      put
*/

Bookish.put("/publication/update/book/:isbn",(req,res)=>{
        //update the publication database
        database.publications.forEach((publication)=>{
            if(publication.id === req.body.pubId){
                return publication.books.push(req.params.isbn);
            }
        });

        //update the book database
        database.books.forEach((book)=>{
            if(book.ISBN === req.params.isbn){
                book.publication = req.body.pubId;
                return;
            }
        });

        return res.json({books : database.books, publications : database.publications, message: "Successfully updated publication",});
});

/*
Route                       /book/delete
Description                 delete a book
Access                      Public
Parameters                  isbn
Method                      delete
*/
Bookish.delete("/book/delete/:isbn",async(req,res)=>{

    const updatedBookDatabase = await BookModel.findOneAndDelete({
        ISBN : req.params.isbn,
    });

   // const updatedBookDatabase = database.books.filter((book)=>book.ISBN !== req.params.isbn);

   // database.books = updatedBookDatabase;
    return res.json({books: updatedBookDatabase });
});



/*
Route                       /book/delete/author
Description                 delete an author from a book
Access                      Public
Parameters                  isbn, author id
Method                      delete
*/

Bookish.delete("/book/delete/author/:isbn/:authorId",async(req,res)=>{
   //update the book database

   const updatedBook = await BookModel.findOneAndUpdate({
       ISBN : req.params.isbn,
   },
   {
       $pull: {
           authors : parseInt(req.params.authorId),
       },
   },{
       new: true,
   });
  // database.books.forEach((book)=>{
    //   if(book.ISBN === req.params.isbn){
   //        const newAuthorList = book.authors.filter((author) => author !== parseInt(req.params.authorId)
  //         );
   //        book.authors = newAuthorList;
  //         return ;
  //     }
 //  });


   //update the author database


   const updatedAuthor = await AuthorModel.findOneAndUpdate({
     id : parseInt(req.params.authorId),

   },
   {
        $pull : {
            books: req.params.isbn,
        },
   },
   {
       new: true
   });
  // database.authors.forEach((author)=>{
   // if(author.id === parseInt(req.params.authorId)){
      //  const newBooksList = author.books.filter((book) => book !== req.params.isbn
      //  );
      //  author.books = newBooksList;
      //  return ;
   // }
    //});


    
    


    return res.json({book: updatedBook, author : updatedAuthor, message: "Author was Deleted!"})


});



/*
Route                       /publication/delete/book
Description                 delete a book from publication
Access                      Public
Parameters                  isbn, publication id
Method                      delete
*/

Bookish.delete("/publication/delete/book/:isbn/:pubId",(req,res)=>{
    //update the publication database
    database.publications.forEach((publication)=>{
        if(publication.id === parseInt(req.params.pubId)){
            const newBooksList = publication.books.filter((book) => book !== req.params.isbn
            );
            publication.books = newBooksList;
            return ;
        }
    });



    //update the book database
   database.books.forEach((book)=>{
    if(book.ISBN === req.params.isbn){
        book.publication = 0; //no publication available
        return;
      
    }
});
 
 
    
 
     return res.json({book: database.books, publications : database.publications})
 
 
 });
 





Bookish.listen(3000,()=> console.log("Server running!!😎"));


//talk to mongodb so that mongodb understands => *******
//talk to us so that we understand => JavaScript


//mongoose

