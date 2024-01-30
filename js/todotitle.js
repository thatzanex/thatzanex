// Beim Laden der Seite Funktion ausführen
window.onload = function() {
    loadAndSetTodoTitle();
    loadDarkModeState();
    loadTodos();
    loadEditImageState();
}

// Funktion zum Bearbeiten des ToDo-Listennamens und Anzeigen des Popups
function editTitle() {
    // Anzeigen des Popup
    openTitleEditPopup();
    toggleSortierenDatumCheck();
}

// Funktion zum Anzeigen des Popup zum Bearbeiten des Titels
function openTitleEditPopup() {
    // Setze den aktuellen Titelwert im Popup
    document.getElementById('newTitle').value = document.getElementById('todo-title').innerText;

    // Öffne das Popup
    document.getElementById('editTitlePopup').style.display = 'block';
}

// Funktion zum Übernehmen der Änderungen am Titel und Schließen des Popups
function applyTitleChanges() {
    const newTitle = document.getElementById('newTitle').value;

    // Überprüfen, ob der neue Titel nicht leer ist
    if (newTitle.trim() !== "") {
        // ToDo-Listennamen aktualisieren
        document.getElementById('todo-title').innerText = newTitle;

        // ToDo-Listennamen in Cookie speichern
        document.cookie = "todoTitle=" + encodeURIComponent(newTitle) + "; expires=Thu, 31 Dec 2037 12:00:00 UTC; path=/";

        // Schließe das Popup
        closeTitleEditPopup();
    } else {
        alert("Ungültiger ToDo-Listennamen. Bitte versuchen Sie es erneut.");
    }
}

// Funktion zum Schließen des Popup zum Bearbeiten des Titels
function closeTitleEditPopup() {
    document.getElementById('editTitlePopup').style.display = 'none';
}


// Funktion zum Laden des ToDo-Listennamens aus dem Cookie
function loadTodoTitle() {
    var decodedCookie = decodeURIComponent(document.cookie);
    var cookieArray = decodedCookie.split(';');
    
    for(var i = 0; i < cookieArray.length; i++) {
        var cookiePart = cookieArray[i];
        
        while (cookiePart.charAt(0) == ' ') {
            cookiePart = cookiePart.substring(1);
        }
        
        if (cookiePart.indexOf('todoTitle=') == 0) {
            return cookiePart.substring('todoTitle='.length, cookiePart.length);
        }
    }
    
    return null;
}
 

// Funktion zum Laden und Setzen des ToDo-Listennamens aus dem Cookie
function loadAndSetTodoTitle() {
    var savedTitle = loadTodoTitle();
    if (savedTitle !== null) {
        document.getElementById('todo-title').innerText = savedTitle;
    }
}


// Ändern des Bildes bei Darkmode
function toggleEditImageSrc() {
    var editImage = document.getElementById('edit-name-img');

    if (editImage.src.includes('edit-tool.png')) {
        // Wenn die aktuelle Quelle edit-tool.png ist, ändere sie zu edit-tool-white.png
        editImage.src = '/assests/edit-tool-white.png';
    } else {
        // Andernfalls ändere sie zu edit-tool.png
        editImage.src = '/assests/edit-tool.png';
    }

    saveEditImageState();
}


// Funktion zum Speichern des Edit-Image-Zustands in einem Cookie
function saveEditImageState() {
    var editImage = document.getElementById('edit-name-img');
    var isWhite = editImage.src.includes('edit-tool-white.png');
    
    // Edit-Image-Zustand in Cookie speichern
    document.cookie = "editImageState=" + (isWhite ? 'white' : 'normal') + "; expires=Thu, 31 Dec 2037 12:00:00 UTC; path=/";
}

// Funktion zum Laden und Setzen des Edit-Image-Zustands aus dem Cookie
function loadEditImageState() {
    var decodedCookie = decodeURIComponent(document.cookie);
    var cookieArray = decodedCookie.split(';');
    
    for(var i = 0; i < cookieArray.length; i++) {
        var cookiePart = cookieArray[i];
        
        while (cookiePart.charAt(0) == ' ') {
            cookiePart = cookiePart.substring(1);
        }
        
        if (cookiePart.indexOf('editImageState=') == 0) {
            var state = cookiePart.substring('editImageState='.length, cookiePart.length);
            
            // Edit-Image-Zustand wiederherstellen
            var editImage = document.getElementById('edit-name-img');
            editImage.src = '/assests/edit-tool' + (state === 'white' ? '-white.png' : '.png');
            
            return;
        }
    }
}
