const books = [];
const RENDER_EVENT = "render-book";
const SAVED_EVENT = "saved-book";
const STORAGE_KEY = "BOOK_APPS";
document.addEventListener("DOMContentLoaded", function () {
    if (isStorageExist()) {
        loadDataFromStorage();
        const uncompletedBOOKList = document.getElementById("books");
        uncompletedBOOKList.innerHTML = "";

        const completedBOOKList = document.getElementById("completed-books");
        completedBOOKList.innerHTML = "";

        for (const bookItem of books) {
            const bookElement = makeBook(bookItem);
            if (!bookItem.isCompleted) uncompletedBOOKList.append(bookElement);
            else completedBOOKList.append(bookElement);
        }
    }

    const submitForm = document.getElementById("form");
    submitForm.addEventListener("submit", function (event) {
        event.preventDefault();
        addBook();
    });

    const cariForm = document.getElementById("cari");
    cariForm.addEventListener("submit", function (event) {
        event.preventDefault();
        const inputSearch = document.getElementById("search");
        const HasilCari = searchBooks(inputSearch.value);
        const uncompletedBOOKList = document.getElementById("books");
        uncompletedBOOKList.innerHTML = "";

        const completedBOOKList = document.getElementById("completed-books");
        completedBOOKList.innerHTML = "";

        for (const bookItem of HasilCari) {
            const bookElement = makeBook(bookItem);
            if (!bookItem.isCompleted) uncompletedBOOKList.append(bookElement);
            else completedBOOKList.append(bookElement);
        }
    });

    document.addEventListener(RENDER_EVENT, function () {
        const uncompletedBOOKList = document.getElementById("books");
        uncompletedBOOKList.innerHTML = "";

        for (const bookItem of books) {
            const bookElement = makeBook(bookItem);
            uncompletedBOOKList.append(bookElement);
        }
    });

    function isStorageExist() /* boolean */ {
        if (typeof Storage === undefined) {
            alert("Browser kamu tidak mendukung local storage");
            return false;
        }
        return true;
    }
    function loadDataFromStorage() {
        const serializedData = localStorage.getItem(STORAGE_KEY);
        let data = JSON.parse(serializedData);

        if (data !== null) {
            for (const book of data) {
                books.push(book);
            }
        }

        document.dispatchEvent(new Event(RENDER_EVENT));
    }
    function saveData() {
        if (isStorageExist()) {
            const parsed = JSON.stringify(books);
            localStorage.setItem(STORAGE_KEY, parsed);
            document.dispatchEvent(new Event(SAVED_EVENT));
        }
    }
    function searchBooks(searchText) {
        const searchResult = [];
        for (const book of books) {
            if (book.title.toLowerCase().includes(searchText.toLowerCase())) {
                searchResult.push(book);
            }
        }
        if (searchResult.length === 0) {
            alert("Tidak ditemukan");
        }
        return searchResult;
    }

    function addBook() {
        const title = document.getElementById("title").value;
        const author = document.getElementById("author").value;
        const year = document.getElementById("year").value;

        const generatedID = generateId();
        const bookObject = generateBookObject(
            generatedID,
            title,
            author,
            year,
            false
        );

        books.push(bookObject);

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
        alert("Buku berhasil ditambahkan");
    }

    function generateId() {
        return +new Date();
    }

    function generateBookObject(id, title, author, year, isCompleted) {
        return {
            id,
            title,
            author,
            year,
            isCompleted,
        };
    }

    function makeBook(bookObject) {
        const textTitle = document.createElement("h2");
        textTitle.innerText = bookObject.title;

        const textAuthor = document.createElement("p");
        textAuthor.innerText = bookObject.author;

        const textYear = document.createElement("p");
        textYear.innerText = bookObject.year;

        const textContainer = document.createElement("div");
        textContainer.classList.add("inner");
        textContainer.append(textTitle, textAuthor, textYear);

        const container = document.createElement("div");
        container.classList.add("item", "shadow");
        container.append(textContainer);
        container.setAttribute("id", `book-${bookObject.id}`);
        function findBook(bookId) {
            for (const bookItem of books) {
                if (bookItem.id === bookId) {
                    return bookItem;
                }
            }
            return null;
        }
        function addBookToCompleted(bookId) {
            const bookTarget = findBook(bookId);

            if (bookTarget == null) return;

            bookTarget.isCompleted = true;
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
            alert("Buku berhasil ditambahkan ke daftar yang sudah selesai");
        }
        function findBookIndex(bookId) {
            for (const index in books) {
                if (books[index].id === bookId) {
                    return index;
                }
            }

            return -1;
        }
        function removeBookFromCompleted(bookId) {
            const bookTarget = findBookIndex(bookId);

            if (bookTarget === -1) return;

            books.splice(bookTarget, 1);
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
            alert("Buku berhasil dihapus");
        }

        function undoBookFromCompleted(bookId) {
            const bookTarget = findBook(bookId);

            if (bookTarget == null) return;

            bookTarget.isCompleted = false;
            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
            alert("Buku berhasil dikembalikan");
        }

        function editBook(bookId) {
            const bookTarget = findBook(bookId);

            if (bookTarget == null) return;

            const editTitle = prompt("Edit Title", bookTarget.title);
            const editAuthor = prompt("Edit Author", bookTarget.author);
            const editYear = prompt("Edit Year", bookTarget.year);

            bookTarget.title = editTitle;
            bookTarget.author = editAuthor;
            bookTarget.year = editYear;

            document.dispatchEvent(new Event(RENDER_EVENT));
            saveData();
            alert("Buku berhasil diedit");
        }

        if (bookObject.isCompleted) {
            const undoButton = document.createElement("button");
            undoButton.classList.add("undo-button");

            undoButton.addEventListener("click", function () {
                undoBookFromCompleted(bookObject.id);
            });

            const trashButton = document.createElement("button");
            trashButton.classList.add("trash-button");

            trashButton.addEventListener("click", function () {
                removeBookFromCompleted(bookObject.id);
            });

            const editButton = document.createElement("button");
            editButton.classList.add("edit-button");

            editButton.addEventListener("click", function () {
                editBook(bookObject.id);
            });

            container.append(trashButton, editButton, undoButton);
        } else {
            const trashButton = document.createElement("button");
            trashButton.classList.add("trash-button");
            trashButton.addEventListener("click", function () {
                removeBookFromCompleted(bookObject.id);
            });

            const checkButton = document.createElement("button");
            checkButton.classList.add("check-button");

            checkButton.addEventListener("click", function () {
                addBookToCompleted(bookObject.id);
            });

            const editButton = document.createElement("button");
            editButton.classList.add("edit-button");

            editButton.addEventListener("click", function () {
                editBook(bookObject.id);
            });

            container.append(trashButton, editButton, checkButton);
        }
        return container;
    }

    document.addEventListener(RENDER_EVENT, function () {
        const uncompletedBOOKList = document.getElementById("books");
        uncompletedBOOKList.innerHTML = "";

        const completedBOOKList = document.getElementById("completed-books");
        completedBOOKList.innerHTML = "";

        for (const bookItem of books) {
            const bookElement = makeBook(bookItem);
            if (!bookItem.isCompleted) uncompletedBOOKList.append(bookElement);
            else completedBOOKList.append(bookElement);
        }
    });
});
