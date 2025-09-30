const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Đăng ký user mới
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password required" });
  }
  if (!isValid(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }
  users.push({ username, password });
  return res.status(200).json({ message: "User successfully registered. Now you can login" });
});

// Lấy danh sách tất cả sách
public_users.get('/', async function (req, res) {
  try {
    const data = await Promise.resolve(books);
    res.status(200).json(data);
  } catch {
    res.status(500).json({message: "Error fetching books"});
  }
});

// Lấy chi tiết sách theo ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Lấy sách theo author
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const filteredBooks = Object.values(books).filter(book => book.author === author);
    if (filteredBooks.length > 0) res.status(200).json(filteredBooks);
    else res.status(404).json({message: "No books found for this author"});
  } catch {
    res.status(500).json({message: "Error fetching books"});
  }
});

// Lấy sách theo title
public_users.get('/title/:title', async function (req, res) {
  try {
    const title = req.params.title;
    const filteredBooks = Object.values(books).filter(book => book.title === title);
    if (filteredBooks.length > 0) res.status(200).json(filteredBooks);
    else res.status(404).json({message: "No books found with this title"});
  } catch {
    res.status(500).json({message: "Error fetching books"});
  }
});

// Lấy review của sách theo ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
  try {
    const isbn = req.params.isbn;
    const book = await Promise.resolve(books[isbn]);
    if (book) res.status(200).json(book);
    else res.status(404).json({message: "Book not found"});
  } catch {
    res.status(500).json({message: "Error fetching book"});
  }
});

module.exports.general = public_users;