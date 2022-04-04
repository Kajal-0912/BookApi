
//Framework
const express = require("express");

//database
const database = require("./database/index");

//Initialize express
const Bookish = express();


//Configurations
Bookish.use(express.json());

/*
Route                       /
Description                 get all books
Access                      Public
Parameters                  none
Method                      GET
*/

Bookish.get("/", (req, res) => {
    //changes
    return res.json({books : database.books});
});


/*
Route                       /is
Description                 get specific books based on ISBN
Access                      Public
Parameters                  isbn
Method                      GET
*/
Bookish.get("/is/:isbn", (req, res) => {
    const getSpecificBook = database.books.filter((book) => book.ISBN === req.params.isbn);

    if(getSpecificBook.length === 0){
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
Bookish.get("/c/:category",(req,res)=>{
    const getSpecificBooks = database.books.filter((book) => book.category.includes(req.params.category));

    if(getSpecificBooks.length === 0){
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


Bookish.get("/author", (req, res) => {
    //changes
    return res.json({authors : database.authors});
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

Bookish.post("/book/new",(req,res) => {
    //body
    const {newBook} = req.body;

    database.books.push(newBook);

    return res.json({books : database.books, message : "book was added!"});
});


/*
Route                       /author/new
Description                 add new author
Access                      Public
Parameters                  none
Method                      post
*/
Bookish.post("/author/new",(req,res) => {
    //body
    const {newAuthor} = req.body;

    database.authors.push(newAuthor);

    return res.json({authors : database.authors, message : "Author was added!"});
});




//PUT
/*
Route                       /book/update/:title
Description                 update title of book
Access                      Public
Parameters                  isbn
Method                      put
*/

Bookish.put("/book/update/:isbn",(req,res) => {
    //map or forEach 
    database.books.forEach((book)=>{
        if(book.ISBN === req.params.isbn){
            book.title = req.body.bookTitle;
            return;
        }
    });

    return res.json({books : database.books});
});

/*
Route                       /book/author/update
Description                 update/add a new author
Access                      Public
Parameters                  isbn
Method                      put
*/
Bookish.put("/book/author/update/:isbn",(req,res) => {
   //update the book database
    database.books.forEach((book)=>{
        if(book.ISBN === req.params.isbn)
            return book.authors.push(req.body.newAuthor);
    });

   //update the author database
   database.authors.forEach((author) => {
       if(author.id === req.body.newAuthor)
            return author.books.push(req.params.isbn);
   });
    return res.json({books : database.books, authors : database.authors, message : "New author was added!"});

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
Bookish.delete("/book/delete/:isbn",(req,res)=>{
    const updatedBookDatabase = database.books.filter((book)=>book.ISBN !== req.params.isbn);

    database.books = updatedBookDatabase;
    return res.json({books: database.books });
});



/*
Route                       /book/delete/author
Description                 delete an author from a book
Access                      Public
Parameters                  isbn, author id
Method                      delete
*/

Bookish.delete("/book/delete/author/:isbn/:authorId",(req,res)=>{
   //update the book database
   database.books.forEach((book)=>{
       if(book.ISBN === req.params.isbn){
           const newAuthorList = book.authors.filter((author) => author !== parseInt(req.params.authorId)
           );
           book.authors = newAuthorList;
           return ;
       }
   });


   //update the author database
   database.authors.forEach((author)=>{
    if(author.id === parseInt(req.params.authorId)){
        const newBooksList = author.books.filter((book) => book !== req.params.isbn
        );
        author.books = newBooksList;
        return ;
    }
});


    
    


    return res.json({book: database.books, publications : database.publications, message: "Author was Deleted!"})


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
