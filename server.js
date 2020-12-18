const mysql = require('mysql');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Veule0118!aries123',
    database: 'employee_trackerDB',
});

const runInquirer = () => {
    inquirer
        .prompt(
            {
                type: 'list',
                message: 'Which would you like to do?',
                choices: [
                    'Add Dept, Role, or Employee',
                    'Delete Dept, Role, or Employee',
                    'View Employee by Manager',
                    'View Salary Budget by Department',
                    'Exit'
                ],
                name: 'action'
            },
        ).then(({ action }) => {
            switch (action) {
                case 'Add Dept, Role, or Employee':
                    return addNew();
                case 'Delete Dept, Role, or Employee':
                    return deleteNew();
                case 'View Employee by Manager':
                    return viewByManager();
                case 'View Salary Budget by Department':
                    return viewBudget();
                case 'Exit':
                    connection.end();
            }
        });
};
const addNew = () => {
    inquirer
        .prompt(
            {
                type: 'list',
                message: 'Which would you like to add?',
                choices: [
                    'New Department',
                    'New Role',
                    'New Employee',
                    'Exit'
                ],
                name: 'action'
            },
        ).then(({ action }) => {
            switch (action) {
                case 'New Department':
                    return newDepartment();
                case 'New Role':
                    return newRole();
                case 'New Employee':
                    return newEmployee();
                case 'Exit':
                default:
                    connection.end();
            }
        })
}
//unfinished
const newDepartment = () => {
    inquirer
        .prompt(
            {
                message: "Enter new department name",
                name: "department"
            }
        ).then(({ department }) => {
            connection.query(
                'INSERT INTO department SET ?',
                {
                    name: department
                },
                (err, res) => {
                    if (err) throw err;
                    // having issues here

                    runInquirer()
                });
        });
};


const deleteNew = () => {
    inquirer
        .prompt(
            {
                message: "Enter song to search",
                name: "song"
            }
        ).then(({ song }) => {
            connection.query(
                'SELECT * FROM top5000 WHERE song=?', // '?' helps prevent SQL injection attacks
                [song],
                (err, res) => {
                    if (err) throw err;

                    res.forEach(({ song, position, artist, year }) => {
                        console.log(`${song}: Position: ${position} | Artist: ${artist} | ${year}`);
                    })
                    runInquirer();
                });
        })
}
const viewByManager = () => {
    connection.query(
        'SELECT artist FROM top5000 GROUP BY artist HAVING COUNT(*) > 1',
        (err, res) => {
            if (err) throw err;

            res.forEach(({ artist }) => {
                console.log(`${artist}`);
            })
            runInquirer()
        });
}
const viewBudget = () => {
    inquirer
        .prompt([
            {
                type: "input",
                message: "Enter a starting position",
                name: "start",
            },
            {
                type: "input",
                message: "Enter an ending position",
                name: "end",
            },

        ]).then(({ start, end }) => {

            connection.query(
                'SELECT * FROM top5000 WHERE position BETWEEN ? AND ?',
                [start, end],
                (err, res) => {
                    if (err) throw err;

                    res.forEach(({ position, artist, song, year }) => {
                        console.log(
                            `Position: ${position} | Artist: ${artist} | Song: ${song} | ${year}`
                        );
                    })
                    runInquirer()
                });
        })
}

connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    runInquirer();
});