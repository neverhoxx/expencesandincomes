let expenses = [];
let currentUser = localStorage.getItem('userId');

if (!currentUser) {
    currentUser = prompt("Enter your name:");
    localStorage.setItem('userId', currentUser);
}

document.getElementById('username-display').textContent = currentUser;

async function loadExpenses() {

    const response = await fetch('https://kool.krister.ee/chat/ykExspenses');
    const allExpenses = await response.json();
    expenses = allExpenses.filter(exp => exp.userId === currentUser);
    renderExpenses();

}

function renderExpenses() {
    const container = document.getElementById('expenses-list');
    container.innerHTML = '';

    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

    sortedExpenses.forEach(expense => {
        const item = document.createElement('div');
        item.className = `expense-item ${expense.type}`;
        item.innerHTML = `
            <span class="amount">${expense.amount} €</span>
            <span class="description">${expense.description}</span>
            <span class="date">${formatDate(expense.date)}</span>
            <button onclick="deleteExpense(${expense.id})">Delete</button>
        `;
        container.appendChild(item);
    });

    updateBalance();
}

function formatDate(dateString) {
    const options = { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('et-ET', options);
}

function updateBalance() {
    const balance = expenses.reduce((sum, exp) => {
        return exp.type === 'income' ? sum + exp.amount : sum - exp.amount;
    }, 0);
    document.getElementById('balance').textContent = `Balance: ${balance.toFixed(2)}€`;
}

async function addExpense(amount, description, type) {
    const newExpense = {
        amount: parseFloat(amount),
        description,
        type,
        date: new Date().toISOString(),
        userId: currentUser
    };


    const response = await fetch("https://kool.krister.ee/chat/ykExspenses", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newExpense)
    });

    if (response.headers.get("content-length") !== "0") {
        const savedExpense = await response.json();
        expenses.push(savedExpense);
    } else {
        expenses.push(newExpense);
    }

    renderExpenses();

}


async function deleteExpense(id) {

    await fetch(`https://kool.krister.ee/chat/ykExspenses/${id}`, {
        method: 'DELETE'
    });

    expenses = expenses.filter(exp => exp.id !== id);
    renderExpenses();

}

function switchAccount() {
    const newName = prompt("Enter new user name:");
    if (newName) {
        localStorage.setItem('userId', newName);
        location.reload();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadExpenses();

    document.getElementById('expense-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const amount = e.target.amount.value;
        const description = e.target.description.value;
        const type = e.target.type.value;

        if (amount && description) {
            addExpense(amount, description, type);
            e.target.reset();
        }
    });
});
