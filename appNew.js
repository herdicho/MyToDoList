const todoListController = (function(){
    
    const TodoItem = function(id, value, type) {
        this.id = id;
        this.value = value;
        this.type = type;
    };
    
    const data = {
        allTodoList: {
            uncomplete: [],
            complete: []
        },
        totals: {
            uncomplete: 0,
            complete: 0
        }
    };

    function getIndeksIdItem(todoItem) {
        // get ID todo item dan pisahkan menjadi 2 bagian (complete/uncomplete dan ID)
        const splitID = todoItem.id.split('-');
        const type = splitID[0];
        const ID = parseInt(splitID[1]);

        // buat array baru yang berisi ID berdasar tipe (complete/uncomplete)
        const ids = data.allTodoList[type].map(function(current) {
            return current.id;
        });

        return [ids.indexOf(ID), type];
    }
    
    return {
        addNewTodoItem: function(input, type='uncomplete') {
            var newItem, ID;
            
            // Create new ID untuk data struktur
            if (data.allTodoList[type].length > 0) {
                ID = data.allTodoList[type][data.allTodoList[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // Create new item todo list
            newItem = new TodoItem(ID, input, type);
            
            // Tambah item ke data struktur
            data.allTodoList[type].push(newItem);

            // Save data object ke local storage 
            localStorage.setItem('item', JSON.stringify(data));
            
            // Return the new item to do list
            return newItem;
        },

        deleteTodoListItem: todoItem => {
            // cari indeks dan type todolist item yang ingin dihapus
            const [index, type] = getIndeksIdItem(todoItem)

            // hapus item dari data struktur
            if (index !== -1) {
                data.allTodoList[type].splice(index, 1);
            }

            // Save data object ke local storage 
            localStorage.setItem('item', JSON.stringify(data));
        },

        getValueData: todoItem => {
            // cari indeks dan type todolist item yang ingin dicari nilai nya
            const [index, type] = getIndeksIdItem(todoItem)

            return data.allTodoList[type][index].value;
        },

        checkData: () => console.log(data),

        getLocalStorageItem: () => JSON.parse(localStorage.getItem('item')),

        clearLocalStorage: () => localStorage.clear()
    }

})();

const UIController = (function() {

    var DOMstrings = {
        inputForm: '.todo-input',
        inputButton: '.fa-plus-circle',
        uncompleteList: '.todo-uncomplete-list',
        completeList: '.todo-complete-list',
    };

    return {
        getDOMstrings: () => DOMstrings,
        
        getInput: () => document.querySelector(DOMstrings.inputForm).value,
        
        addNewTodoItem: function(obj) {
            var html, newHtml, element;
            // Create HTML string dengan placeholder
            
            if (obj.type === 'uncomplete') {
                element = DOMstrings.uncompleteList;
                
                html = `<div class="todo" id="uncomplete-%id%"> <span class="todo-item">%value%</span> <i class="fas fa-check-double"></i> <i class="fas fa-trash-alt"></i> </div>`;
            } else if (obj.type === 'complete') {
                element = DOMstrings.completeList;
                
                html = '<div class="todo" id="complete-%id%"> <span class="todo-item">%value%</span> <i class="fas fa-trash-alt"></i> </div>';
            }
            
            // Ubah placeholder dengan data sebenarnya
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%value%', obj.value);
            
            // Insert new HTML
            if (obj.type === 'uncomplete')
                document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            if (obj.type === 'complete')
                document.querySelector(element).insertAdjacentHTML('afterbegin', newHtml);
        },

        clearFields: () => document.querySelector(DOMstrings.inputForm).value = '',

        deleteTodoListItem: (todoItem) => {
            todoItem.classList.add('remove');
            setTimeout(function(){ 
                todoItem.remove(); 
            }, 600);
        }
    };


})();

const controller = (function(todoListCtrl, UICtrl) {

    const setupEventListeners = function() {
        const DOM = UICtrl.getDOMstrings();
        
        document.querySelector(DOM.inputButton).addEventListener('click', addTodoList);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                event.preventDefault();
                addTodoList();
            }
        });
        
        document.querySelector(DOM.completeList).addEventListener('click', action);
        document.querySelector(DOM.uncompleteList).addEventListener('click', action);
          
    };

    const loadLocalStorage = function() {
        // get local storage item dari controller
        const localStorageItem = todoListCtrl.getLocalStorageItem()

        if (localStorageItem !== null) {
            // add local storage item ke struktur todolist controller
            localStorageItem.allTodoList.uncomplete.forEach(cur => {
                todoListCtrl.addNewTodoItem(cur.value, cur.type);
            })

            localStorageItem.allTodoList.complete.forEach(cur => {
                todoListCtrl.addNewTodoItem(cur.value, cur.type);
            })

            // add local storage item ke UI
            localStorageItem.allTodoList.uncomplete.forEach(cur => {
                UICtrl.addNewTodoItem(cur);
            });

            localStorageItem.allTodoList.complete.forEach(cur => {
                UICtrl.addNewTodoItem(cur);
            });
        }
    }

    const addTodoList = function() {
        var input, newTodoItem;
        
        // get input dari user
        input = UICtrl.getInput();      
        
        if (input !== "") {
            // add the item ke todolist controller
            newTodoItem = todoListCtrl.addNewTodoItem(input);
            
            // add the item ke UI
            UICtrl.addNewTodoItem(newTodoItem);

            // clear input fields
            UICtrl.clearFields();
        }
    };

    const action = function(event) {
        const todoItem = event.target.parentElement;

        // ketika klik trash button maka panggil fungsi delete item
        if (event.target.classList[1] === 'fa-trash-alt') {
            // delete dari struktur data
            todoListCtrl.deleteTodoListItem(todoItem);
            
            // delete dari UI
            UICtrl.deleteTodoListItem(todoItem);
        }

        // ketika klik finish button maka panggil fungsi finish item
        if (event.target.classList[1] === 'fa-check-double') {
            // pindah dari struktur data uncomplete ke complete
            const value = todoListCtrl.getValueData(todoItem);
            todoListCtrl.deleteTodoListItem(todoItem);
            UICtrl.deleteTodoListItem(todoItem);
            
            // pindah dari container UI uncomplete ke complete
            const newTodoItem = todoListCtrl.addNewTodoItem(value, "complete");
            UICtrl.addNewTodoItem(newTodoItem);

        }
    }

    return {
        init: function() {
            console.log('To Do List has started. :)');
            loadLocalStorage();
            setupEventListeners();
        },
    };

})(todoListController, UIController);

controller.init();