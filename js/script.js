// Laden der ToDo-Daten beim Start der Seite
window.onload = function () {
    loadTodos();
    loadDarkModeState();
    loadAndSetTodoTitle();
    loadEditImageState();
};


function checkDate() {
    const todoList = document.getElementById('todo-list');

    for (const todoItem of todoList.children) {
        const dueDateText = todoItem.querySelector('.todo-details span:nth-child(1)');
        const dueDate = parseFormattedDate(dueDateText.innerText.slice(4));

        // Neues Datum generieren und in das gleiche Format umwandeln
        const currentDate = new Date();
        const formattedCurrentDate = formatDate(currentDate);

        // Überprüfen, ob das Due-Datum gleich dem aktuellen Datum ist
        if (formatDate(dueDate) === formattedCurrentDate) {
            todoItem.style.backgroundColor = 'rgb(208, 210, 208)'; // Setzen Sie die Hintergrundfarbe zurück
            todoItem.style.color = 'black';

        // Überprüfen, ob das Due-Datum in der Vergangenheit liegt
        } else if (dueDate.getTime() < currentDate.getTime()) {
            todoItem.style.backgroundColor = 'rgb(230, 173, 173)';
            todoItem.style.color = 'black';

        // Überprüfen, ob das Due-Datum in der Vergangenheit liegt
        } else {
            todoItem.style.backgroundColor = 'rgb(173, 216, 230)';
            todoItem.style.color = 'black';
        }
    }
}

// Hilfsfunktion zum Parsen des Datums im Format "DD.MM.YYYY"
function parseFormattedDate(dateString) {
    const parts = dateString.split(".");
    if (parts.length === 3) {
        const year = parts[2];
        const month = parts[1] - 1; // Monate sind 0-basiert
        const day = parts[0];
        return new Date(year, month, day);
    }
    return new Date(); // Rückgabe des aktuellen Datums, wenn das Format ungültig ist
}

// Datum Sortier Button

function toggleSortierenDatum() {
    var sortOptions = document.getElementById("sortieren");
    sortOptions.style.display = (sortOptions.style.display === "block") ? "none" : "block";
  }

  function toggleSortierenDatumDelayed() {
    setTimeout(function() {
        toggleSortierenDatum();
    }, 800);
}


// Datum Sortier Funktion
function sortierenDatum() {
    var sortOptionElements = document.getElementsByName("sortOption");

    for (var i = 0; i < sortOptionElements.length; i++) {
        if (sortOptionElements[i].checked) {
            var selectedValue = sortOptionElements[i].value;
            sortTodos(selectedValue);
            break; // Brechen die Schleife ab, sobald eine Option gefunden wurde
        }
    }
}


// Funktion zum Sortieren der Todos nach Datum
function sortTodos(order) {
    const todoList = document.getElementById('todo-list');
    const todos = Array.from(todoList.children);

    todos.sort((a, b) => {
        const dateA = parseDueDate(a);
        const dateB = parseDueDate(b);

        if (order === "ascending") {
            return dateA - dateB;
        } else if (order === "descending") {
            return dateB - dateA;
        } else {
            // Wenn keine Sortierung ausgewählt ist oder "none" ausgewählt ist, keine Sortierung durchführen
            return 0;
        }
    });

    // Entfernen Sie alle Todos aus der Liste
    todos.forEach(todo => todoList.removeChild(todo));

    // Fügen Sie die sortierten Todos wieder zur Liste hinzu
    todos.forEach(todo => todoList.appendChild(todo));

    checkDate(); // Die Daten überprüfen und Farben zuweisen
    saveTodos(); // Aktualisierte ToDo-Daten speichern
}

// Hilfsfunktion zum Parsen des Due-Datums
function parseDueDate(todoItem) {
    const dueDateText = todoItem.querySelector('.todo-details span:nth-child(1)').innerText.slice(4);
    const dueDate = parseFormattedDate(dueDateText);
    return isValidDate(dueDate) ? dueDate : new Date(); // Standardmäßig das aktuelle Datum verwenden, wenn das Parsing fehlschlägt
}



// Darkmode Funktion
function darkmode() {
    var element = document.body;
    element.classList.toggle("dark-mode");

    // Speichern des Dark-Mode-Zustands im Cookie
    saveDarkModeState(element.classList.contains("dark-mode"));
}

// Funktion zum Speichern des Dark-Mode-Zustands im Cookie
function saveDarkModeState(isDarkMode) {
    const expirationDate = new Date();
    const expirationDays = 365; // Cookie-Ablaufzeit in Tagen

    expirationDate.setDate(expirationDate.getDate() + expirationDays);

    // Cookie mit dem Dark-Mode-Zustand erstellen
    document.cookie = `darkMode=${isDarkMode}; expires=${expirationDate.toUTCString()}; path=/`;
}

// Funktion zum Laden des Dark-Mode-Zustands aus dem Cookie
function loadDarkModeState() {
    // Cookie-Wert für 'darkMode' abrufen
    const darkModeCookie = getCookie('darkMode');

    // Dark-Mode-Zustand setzen, wenn der Cookie-Wert vorhanden ist
    if (darkModeCookie) {
        const isDarkMode = darkModeCookie === "true";
        document.body.classList.toggle("dark-mode", isDarkMode);
    }
}

// Diese Funktion wird aufgerufen, wenn der Benutzer eine Datei hochlädt
function uploadTodos() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt'; // Nur TXT-Dateien zulassen

    // Event-Listener für Änderungen am Dateiinput hinzufügen
    input.addEventListener('change', function (event) {
        const file = event.target.files[0];

        // FileReader zum Lesen des Dateiinhalts verwenden
        const reader = new FileReader();
        reader.onload = function (e) {
            const content = e.target.result;

            // Hier rufen Sie eine Funktion auf, um die Todos aus dem Textinhalt zu extrahieren
            if (validateTodoFile(content)) {
                // Zuerst alle vorhandenen Todos löschen
                deleteAllTodos();

                // Dann die Todos aus der Datei hinzufügen
                parseAndAddTodos(content);
            } else {
                errorAlert("⚠ ERROR ⚠ \n Die hochgeladene Datei ist ungültig.");
            }
        };

        // Datei als Text lesen
        reader.readAsText(file);
    });

    // Klicken Sie auf den Dateiinput, um die Datei auszuwählen
    input.click();
}

// Funktion zum Löschen aller Todos
function deleteAllTodos() {
    const todoList = document.getElementById('todo-list');
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }

    saveTodos();
}

// Funktion zur Überprüfung der Validität der Textdatei
function validateTodoFile(content) {
    // Überprüfen Sie hier, ob der Inhalt der Datei gültig ist.
    // In diesem Beispiel wird nur überprüft, ob der Inhalt dem erwarteten Regex-Muster entspricht.
    const regex = /ToDo: (.*?)\nBis: (.*?)\nKategorie: (.*?)\nPriorität: (.*?)\n\n/g;
    return regex.test(content);
}

// Funktion zur Anzeige einer Fehlermeldung
function errorAlert(message) {
    alert("Fehler: " + message);
}

// Funktion zum Extrahieren und Hinzufügen von Todos aus dem Textinhalt
function parseAndAddTodos(content) {
    const todoList = document.getElementById('todo-list');

    // Annahme: Die Struktur der Datei ist bekannt (ToDo: ... Bis: ... Kategorie: ... Priorität: ...)
    const regex = /ToDo: (.*?)\nBis: (.*?)\nKategorie: (.*?)\nPriorität: (.*?)\n\n/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
        const todoText = match[1];
        const dueDate = match[2];
        const category = match[3];
        const priority = match[4];

        // Fügen Sie die extrahierten Todos zur ToDo-Liste hinzu
        addTodoFromUpload(todoText, dueDate, category, priority);
    }

    checkDate();
}

// Funktion zum Hinzufügen eines Todos zur ToDo-Liste beim Hochladen
function addTodoFromUpload(todoText, dueDate, category, priority) {
    const todoList = document.getElementById('todo-list');
    const todoItem = document.createElement('li');
    todoItem.className = 'todo-item';

    // Ein Kontrollkästchen (Checkbox) wird erstellt und mit einer Funktion verknüpft, die das ToDo-Element durchstreicht, wenn es ausgewählt ist.
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.onchange = function () {
        todoItem.classList.toggle('completed', checkbox.checked);
        todoTextElement.classList.toggle('completed', checkbox.checked);
        detailsContainer.classList.toggle('completed', checkbox.checked);
        saveTodos(); // Aktualisierte ToDo-Daten speichern
    };

    // Ein Span-Element wird erstellt, um den Text des ToDo-Elements anzuzeigen.
    const todoTextElement = document.createElement('span');
    todoTextElement.innerText = todoText;

    // Ein Button zum Löschen des ToDo-Elements wird erstellt und gestaltet.
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = 'Löschen';
    deleteBtn.className = 'delete-btn';
    deleteBtn.onclick = function () {
        todoList.removeChild(todoItem);
        saveTodos(); // Aktualisierte ToDo-Daten speichern
    };

    // Ein Button zum Bearbeiten des ToDo-Elements wird erstellt und gestaltet.
    const editBtn = document.createElement('button');
    editBtn.innerHTML = 'Bearbeiten';
    editBtn.className = 'edit-btn';
    editBtn.onclick = function () {
        editTodo(todoItem);
    };

    // ... (weitere Elemente)

    // Neue Details hinzufügen
    const detailsContainer = document.createElement('div');
    detailsContainer.className = 'todo-details';

    const dueDateText = document.createElement('span');
    dueDateText.innerText = `Bis: ${dueDate}`;
    detailsContainer.appendChild(dueDateText);

    const categoryText = document.createElement('span');
    categoryText.innerText = `Kategorie: ${category}`;
    detailsContainer.appendChild(categoryText);

    const priorityText = document.createElement('span');
    priorityText.innerText = `Priorität: ${priority}`;
    detailsContainer.appendChild(priorityText);

    // Die verschiedenen erstellten Elemente werden dem ToDo-Element hinzugefügt.
    todoItem.appendChild(checkbox);
    todoItem.appendChild(todoTextElement);
    todoItem.appendChild(detailsContainer);
    todoItem.appendChild(deleteBtn);
    todoItem.appendChild(editBtn);

    // Das ToDo-Element wird der ToDo-Liste hinzugefügt.
    todoList.appendChild(todoItem);

    saveTodos(); // Speichern Sie die aktualisierten ToDo-Daten
}






    // Download Funktion
    function downloadTodos() {
    const todoList = document.getElementById('todo-list');
    
    // Erstellen der Text Datei
    let docContent = 'ToDo Liste:\n\n';
    
    for (const todoItem of todoList.children) {
        const todoText = todoItem.querySelector('span').innerText;
        const dueDate = todoItem.querySelector('.todo-details span:nth-child(1)').innerText.slice(4);
        const category = todoItem.querySelector('.todo-details span:nth-child(2)').innerText.slice(11);
        const priority = todoItem.querySelector('.todo-details span:nth-child(3)').innerText.slice(10);
    
        docContent += `ToDo: ${todoText}\nBis: ${dueDate}\nKategorie: ${category}\nPriorität: ${priority}\n\n`;
    }
    
    // Erstellen eines Blob mit dem Textinhalt
    const blob = new Blob([docContent], { type: 'text/plain' });
    
    // Erstellen eines Daten-URLs aus dem Blob
    const url = URL.createObjectURL(blob);
    
    // Erstellen eines versteckten Download-Links
    const a = document.createElement('a');
    a.href = url;
    a.download = 'todo_liste.txt';
    
    // Anhängen des Links an den DOM
    document.body.appendChild(a);
    
    // Klicken Sie auf den Link, um den Download zu starten
    a.click();
    
    // Entfernen Sie den Link aus dem DOM
    document.body.removeChild(a);
    
    // Freigabe des Daten-URLs
    URL.revokeObjectURL(url);
}
    



// Die Funktion 'addTodo' wird aufgerufen, wenn der "Hinzufügen"-Button geklickt wird.
function addTodo() {
    // Das Eingabefeld und die ToDo-Liste werden durch ihre IDs aus dem DOM abgerufen.
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const dueDateInput = document.getElementById('due-date');
    console.log(dueDateInput)
    const categoryInput = document.getElementById('category');
    const priorityInput = document.getElementById('priority');

    // Überprüfen, ob das Eingabefeld nicht leer ist (nach Trimmen von Leerzeichen).
    if (todoInput.value.trim() !== '') {
        // Ein neues Listenelement (ToDo-Element) wird erstellt und mit der Klasse 'todo-item' versehen.
        const todoItem = document.createElement('li');
        todoItem.className = 'todo-item';

        // Ein Kontrollkästchen (Checkbox) wird erstellt und mit einer Funktion verknüpft, die das ToDo-Element durchstreicht, wenn es ausgewählt ist.
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.onchange = function () {
            todoItem.classList.toggle('completed', checkbox.checked);
            todoText.classList.toggle('completed', checkbox.checked);
            detailsContainer.classList.toggle('completed', checkbox.checked);

            saveTodos(); // Aktualisierte ToDo-Daten speichern
        };

        // Ein Span-Element wird erstellt, um den Text des ToDo-Elements anzuzeigen.
        const todoText = document.createElement('span');
        todoText.innerText = todoInput.value;

        // Ein Button zum Löschen des ToDo-Elements wird erstellt und gestaltet.
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = 'Löschen';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = function () {
            todoList.removeChild(todoItem);
            saveTodos(); // Aktualisierte ToDo-Daten speichern
        };

        // Ein Button zum Bearbeiten des ToDo-Elements wird erstellt und gestaltet.
        const editBtn = document.createElement('button');
        editBtn.innerHTML = 'Bearbeiten';
        editBtn.className = 'edit-btn';
        editBtn.onclick = function () {
            editTodo(todoItem);
        };

        // Neue Details hinzufügen
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'todo-details';

        const dueDateText = document.createElement('span');
        console.log(dueDateText)
        const dueDate = new Date(dueDateInput.value);
        console.log(dueDate)
        const formattedDueDate = dueDateInput.value
        console.log(formattedDueDate)
        const formattedDate = convertDateFormat(formattedDueDate);
        console.log(formattedDate)
        dueDateText.innerText = `Bis: ${formattedDate}`;

        detailsContainer.appendChild(dueDateText);
        const categoryText = document.createElement('span');
        categoryText.innerText = `Kategorie: ${categoryInput.value}`;
        detailsContainer.appendChild(categoryText);

        const priorityText = document.createElement('span');
        priorityText.innerText = `Priorität: ${priorityInput.value}`;
        detailsContainer.appendChild(priorityText);

        // Die verschiedenen erstellten Elemente werden dem ToDo-Element hinzugefügt.
        todoItem.appendChild(checkbox);
        todoItem.appendChild(todoText);
        todoItem.appendChild(detailsContainer);
        todoItem.appendChild(deleteBtn);
        todoItem.appendChild(editBtn);

        // Das ToDo-Element wird der ToDo-Liste hinzugefügt.
        todoList.appendChild(todoItem);

        // Das Eingabefeld wird nach dem Hinzufügen zurückgesetzt.
        todoInput.value = '';
        dueDateInput.value = '';
        categoryInput.value = '';
        priorityInput.value = '';

        checkDate(dueDate); // Die Funktion checkDate ausführen

        saveTodos(); // Neue ToDo-Daten speichern        
    }
}

function convertDateFormat(inputDate) {
    const parts = inputDate.split("-");
    if (parts.length === 3) {
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        return `${day}.${month}.${year}`;
    }
    return "Ungültiges Datum";
}
// Die Funktion 'editTodo' wird aufgerufen, wenn der "Bearbeiten"-Button geklickt wird.
function editTodo(todoItem) {
    // ToDo-Element bearbeiten
    const todoText = todoItem.querySelector('span');
    const detailsContainer = todoItem.querySelector('.todo-details');
    const dueDateText = detailsContainer.querySelector('span:nth-child(1)');
    const categoryText = detailsContainer.querySelector('span:nth-child(2)');
    const priorityText = detailsContainer.querySelector('span:nth-child(3)');

    // Hier kannst du den Code ergänzen, um die verschiedenen Eigenschaften zu bearbeiten.

    // Beispiel: Text bearbeiten
    const newText = prompt('Neuer Text', todoText.innerText);
    if (newText !== null) {
        todoText.innerText = newText;
    }

    // Beispiel: Datum bearbeiten
    const newDueDate = prompt('Neues Datum (DD.MM.YYYY)', dueDateText.innerText.slice(4));
    console.log(newDueDate)
    const parsedDueDate = new Date(newDueDate);
    console.log(isValidDateFormat(newDueDate.trim()))
    const formattedDueDate = isValidDateFormat(newDueDate.trim()) ? dueDateText.innerText = `Bis: ${newDueDate.trim()}` : dueDateText.innerText = `Ungültiges Datum`;
    console.log(formattedDueDate)
    console.log(dueDateText)

    // Beispiel: Kategorie bearbeiten
    const newCategory = prompt('Neue Kategorie', categoryText.innerText.slice(11));
    if (newCategory !== null) {
        categoryText.innerText = `Kategorie: ${newCategory}`;
    }

    // Beispiel: Priorität bearbeiten
    const newPriority = prompt('Neue Priorität', priorityText.innerText.slice(10));
    if (newPriority !== null) {
        priorityText.innerText = `Priorität: ${newPriority}`;
    }

    saveTodos(); // Aktualisierte ToDo-Daten speichern

    checkDate(); // Die Daten checken und farbe geben

}

// Funktion zum Überprüfen, ob ein Datum gültig ist
function isValidDateFormat(dateString) {
    const datePattern = /^\d{2}\.\d{2}\.\d{4}$/;
    return datePattern.test(dateString);
}

// Funktion zum Formatieren des Datums im gewünschten Format "DD.MM.YYYY"
function formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Monate sind 0-basiert, daher +1
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

// Funktion zum Speichern der ToDo-Daten als Cookies
function saveTodos() {
    const todoList = document.getElementById('todo-list');
    const todos = [];

    // Durchlaufen der ToDo-Liste und Sammeln der ToDo-Texte und des Status
    for (const todoItem of todoList.children) {
        const todoText = todoItem.querySelector('span').innerText;
        const completed = todoItem.classList.contains('completed');
        const checkboxChecked = todoItem.querySelector('input[type="checkbox"]').checked;
        const dueDateText = todoItem.querySelector('.todo-details span:nth-child(1)').innerText.slice(4);
        const dueDate = parseFormattedDateForSave(dueDateText); // Datum im gewünschten Format parsen
        const category = todoItem.querySelector('.todo-details span:nth-child(2)').innerText.slice(11);
        const priority = todoItem.querySelector('.todo-details span:nth-child(3)').innerText.slice(10);

        todos.push({
            text: todoText,
            completed: completed,
            checkboxChecked: checkboxChecked,
            dueDate: dueDate,
            category: category,
            priority: priority
        });
    }

    // Konvertieren der ToDo-Daten in einen JSON-String
    const todosJSON = JSON.stringify(todos);

    // Speichern der ToDo-Daten als Cookie
    document.cookie = `todos=${todosJSON}`;
}

// Hilfsfunktion zum Parsen des Datums im Format "DD.MM.YYYY" für die Speicherung
function parseFormattedDateForSave(dateString) {
    const parts = dateString.split(".");
    if (parts.length === 3) {
        const day = parts[0];
        const month = parts[1];
        const year = parts[2];
        return `${day}.${month}.${year}`;
    }
    console.error("Ungültiges Datum:", dateString);
    return null; // Oder einen Indikator für ein ungültiges Datum zurückgeben
}


function loadTodos() {
    const todoList = document.getElementById('todo-list');

    // Abrufen des Cookie-Werts für 'todos'
    const todosCookie = getCookie('todos');

    if (todosCookie) {
        // Parsen des JSON-Strings und Wiederherstellen der ToDo-Liste
        const todos = JSON.parse(todosCookie);

        for (const todo of todos) {
            const todoItem = document.createElement('li');
            todoItem.className = 'todo-item';

            // Ein Kontrollkästchen (Checkbox) wird erstellt und mit einer Funktion verknüpft, die das ToDo-Element durchstreicht, wenn es ausgewählt ist.
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = todo.checkboxChecked;
            checkbox.onchange = function () {
                todoItem.classList.toggle('completed', checkbox.checked);
                todoText.classList.toggle('completed', checkbox.checked);
                detailsContainer.classList.toggle('completed', checkbox.checked);
                saveTodos(); // Aktualisierte ToDo-Daten speichern
            };

            // Ein Span-Element wird erstellt, um den Text des ToDo-Elements anzuzeigen.
            const todoText = document.createElement('span');
            todoText.innerText = todo.text;

            // Ein Button zum Löschen des ToDo-Elements wird erstellt und gestaltet.
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = 'Löschen';
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = function () {
                todoList.removeChild(todoItem);
                saveTodos(); // Aktualisierte ToDo-Daten speichern
            };

            // Ein Button zum Bearbeiten des ToDo-Elements wird erstellt und gestaltet.
            const editBtn = document.createElement('button');
            editBtn.innerHTML = 'Bearbeiten';
            editBtn.className = 'edit-btn';
            editBtn.onclick = function () {
                editTodo(todoItem);
            };

            // Neue Details hinzufügen
            const detailsContainer = document.createElement('div');
            detailsContainer.className = 'todo-details';

            const dueDateText = document.createElement('span');
            const dueDate = parseFormattedDate(todo.dueDate);
            const formattedDueDate = isValidDate(dueDate) ? formatDate(dueDate) : 'Ungültiges Datum';
            dueDateText.innerText = `Bis: ${formattedDueDate}`;
            detailsContainer.appendChild(dueDateText);

            const categoryText = document.createElement('span');
            categoryText.innerText = `Kategorie: ${todo.category}`;
            detailsContainer.appendChild(categoryText);

            const priorityText = document.createElement('span');
            priorityText.innerText = `Priorität: ${todo.priority}`;
            detailsContainer.appendChild(priorityText);

            // Die verschiedenen erstellten Elemente werden dem ToDo-Element hinzugefügt.
            todoItem.appendChild(checkbox);
            todoItem.appendChild(todoText);
            todoItem.appendChild(detailsContainer);
            todoItem.appendChild(deleteBtn);
            todoItem.appendChild(editBtn);

            if (todo.completed) {
                todoItem.classList.add('completed');
                todoText.classList.add('completed');
                detailsContainer.classList.add('completed');
            }

            // Das ToDo-Element wird der ToDo-Liste hinzugefügt.
            todoList.appendChild(todoItem);

            checkDate(dueDate); // Die Funktion checkDate ausführen
        }
    }
}

// Hilfsfunktion zum Parsen des Datums im Format "DD.MM.YYYY"
function parseFormattedDate(dateString) {
    const parts = dateString.split(".");
    if (parts.length === 3) {
        const year = parts[2];
        const month = parts[1] - 1; // Monate sind 0-basiert
        const day = parts[0];
        return new Date(year, month, day);
    }
    return new Date(); // Rückgabe des aktuellen Datums, wenn das Format ungültig ist
}



// Funktion zum Überprüfen, ob ein Datum gültig ist
function isValidDate(date) {
    return date instanceof Date && !isNaN(date);
}

// Hilfsfunktion zum Abrufen eines Cookies nach seinem Namen
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
