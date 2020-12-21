// requiring dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
const chalk = require('chalk');

// creates connection
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Veule0118!aries123',
    database: 'employee_trackerDB',
});

// --------------------------------------------------------------------------------> Initial Prompts
const runInquirer = () => {
    console.log(chalk.white('---------------------------------------------------------------------------------'))
    console.log(chalk.blue('Employee ') + chalk.red('Tracker'));
    console.log(chalk.white('---------------------------------------------------------------------------------'))
    inquirer
        .prompt(
            {
                type: 'list',
                message: 'Which would you like to do?',
                choices: [
                    'View Employees, Roles, or Departments',
                    'Add Employees, Roles, or Departments',
                    'Remove Employees, Roles, or Departments',
                    'Update Employees, Roles, or Departments',
                    'Exit'
                ],
                name: 'action'
            },
        ).then(({ action }) => {
            switch (action) {
                case 'View Employees, Roles, or Departments':
                    return view();
                case 'Add Employees, Roles, or Departments':
                    return add();
                case 'Remove Employees, Roles, or Departments':
                    return remove();
                case 'Update Employees, Roles, or Departments':
                    return update();
                case 'Exit':
                    connection.end();
            }
        });
};
// ----------------------------------------------------------> READ Actions
const view = () => {
    inquirer
        .prompt({
            type: 'rawlist',
            message: 'Which would you like to view?',
            choices: ['employee', 'role', 'department'],
            name: 'selection'
        }
        ).then(({ selection }) => {
            console.log(chalk.blue.bgYellow.bold(`Viewing all ${selection}s:`));
            connection.query(
                `SELECT * FROM ${selection}`, (err, data) => {
                    if (err) throw err;
                    console.table(data);
                }
            )

        }).then(() => {
            runInquirer();
            //     inquirer.prompt(
            //         {
            //             type: 'confirm',
            //             message: "View another department, role, or employee?",
            //             name: "viewAnother"
            //         }
            //     ).then(({ viewAnother }) => {
            //         switch (viewAnother) {
            //             case true:
            //                 view();
            //             case false:
            //                 runInquirer();
            //         }
            //     })
        })

}

// ----------------------------------------------------------> UPDATE Actions
const update = () => {

}

// ----------------------------------------------------------> DELETE Actions
const remove = () => {
    inquirer.prompt(
        {
            type: 'list',
            message: 'Which would you like to remove?',
            choices: ['employee', 'role', 'department'],
            name: 'selection'
        }
    ).then(({ selection }) => {
        console.log(chalk.red(`Delete a ${selection}:`));
        connection.query(
            `SELECT * FROM ${selection};`, (err, data) => {
                inquirer
                    .prompt(
                        {
                            type: 'list',
                            message: `Enter the item # of the ${selection} you wish to delete.`,
                            choices() {
                                const deptArray = [];
                                data.forEach(({ name }) => {
                                    deptArray.push(name);
                                }

                                );
                                return deptArray;
                            },
                            name: "deletedSelection",
                        }
                    ).then(({ deletedSelection }) => {
                        connection.query(`DELETE FROM ${deletedSelection} WHERE ?`,
                            {
                                name: deletedSelection
                            },
                            (err, res) => {
                                if (err) throw err;
                                console.log(chalk.greenBright(` You have successfully deleted the ${deletedSelection} ${selection}.`))
                                inquirer.prompt(
                                    {
                                        type: 'confirm',
                                        message: "Delete another department, role, or employee?",
                                        name: "deleteAnother"
                                    }
                                ).then(({ deleteAnother }) => {
                                    switch (deleteAnother) {
                                        case true:
                                            remove();
                                        case false:
                                        default:
                                            runInquirer();
                                    }
                                })

                            })
                    }
                    )
            })
    })
}

// ----------------------------------------------------------> CREATE Actions
const add = () => {
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
// ----------------------------------> Add Department
const newDepartment = () => {
    inquirer
        .prompt(
            {
                message: "Enter new department name",
                name: "department"
            }
        ).then(({ department }) => {
            connection.query(
                `INSERT INTO department SET ?`,
                {
                    name: department
                },
                (err, res) => {
                    if (err) throw err;
                    console.log(`${res.affectedRows} department inserted!\n`);
                });
        })
        .then(() => {
            connection.query(`SELECT * FROM department`, (err, res) => {
                if (err) throw err;
                console.log(res);
                runInquirer();
            })
        });
};
// ----------------------------------> Add Role
const newRole = () => {
    connection.query(
        'SELECT * FROM department', (err, data) => {
            inquirer
                .prompt([
                    {
                        type: "input",
                        message: "Enter new role name",
                        name: "title"
                    },
                    {
                        type: "input",
                        message: "Enter salary for this role",
                        name: "salary"
                    },
                    {
                        type: "rawlist",
                        message: "Enter the department id for this role",
                        choices() {
                            const deptArray = [];
                            data.forEach((department) => {
                                deptArray.push(department);
                            })
                            return deptArray;
                        },
                        name: "department_id"
                    },
                ]).then(({ title, salary, department_id }) => {
                    console.log(department_id)
                    connection.query(`SELECT id FROM department WHERE name=?`,
                        [department_id],
                        (err, res) => {
                            if (err) throw err;
                            console.log(res[0].id)
                            const deptNumber = res[0].id;
                            connection.query(
                                'INSERT INTO role SET ?',
                                {
                                    title: title,
                                    salary: salary,
                                    department_id: deptNumber
                                },
                                (err, res) => {
                                    if (err) throw err;
                                    console.log(`${res.affectedRows} role inserted!\n`);
                                    // return res
                                    connection.query('SELECT * FROM role', (err, res) => {
                                        if (err) throw err;
                                        console.log(res);
                                        runInquirer();
                                    })
                                });
                        })
                })
        }
    )
}
// ----------------------------------> Add Employee
const newEmployee = () => {
    connection.query(
        'SELECT employee.id, employee.first_name, employee.last_name, employee.role_id, role.id, role.title, role.department_id FROM employee LEFT JOIN role ON (employee.role_id = role.id) ORDER BY employee.role_id', (err, data) => {
            inquirer
                .prompt([
                    {
                        type: "input",
                        message: "Enter new employee first name",
                        name: "first_name"
                    },
                    {
                        type: "input",
                        message: "Enter new employee last name",
                        name: "last_name"
                    },
                    {
                        type: "rawlist",
                        message: "Select a Manager for this employee ",
                        // choices: ["Senior Management", "Business Development", "Engineering", "Administration"],

                        choices() {
                            const managerArray = [];
                            data.forEach((employee) => {
                                console.log(employee.first_name + employee.last_name)
                                managerArray.push(employee.first_name + " " + employee.last_name);
                            })
                            return managerArray;
                        },
                        name: "manager_id"
                    },
                    {
                        type: "rawlist",
                        message: "Select a role for this employee ",
                        choices() {
                            const deptArray = [];
                            data.forEach((title) => {
                                // console.log(title.title)
                                deptArray.push(title.title);
                            })
                            return deptArray;
                        },
                        name: "role_id"
                    },
                ]).then(({ first_name, last_name, role_id, manager_id }) => {
                    console.log(manager_id)
                    console.log(manager_id.split(" "))
                    connection.query(`SELECT id FROM role WHERE title=?`,
                        [role_id],
                        (err, res) => {
                            if (err) throw err;
                            console.log(res[0].id)
                            const roleNumber = res[0].id;
                            connection.query(`SELECT id FROM employee WHERE first_name=? AND last_name=?`,
                                [manager_id[0], manager_id[1]],
                                (err, res) => {
                                    if (err) throw err;
                                    console.log(res[0])
                                    const managerNumber = res[0];
                                    connection.query(
                                        'INSERT INTO employee SET ?',
                                        {
                                            first_name: first_name,
                                            last_name: last_name,
                                            role_id: roleNumber,
                                            manager_id: managerNumber
                                        },
                                        (err, res) => {
                                            if (err) throw err;
                                            console.log(`${res.affectedRows} employee inserted!\n`);
                                            // return res
                                            connection.query('SELECT * FROM employee', (err, res) => {
                                                if (err) throw err;
                                                console.table(res);
                                                runInquirer();
                                            })
                                        });
                                })
                        })
                }
                )
        }
    )
}

//incomplete
// ----------------------------------------------------------> View by Manager Actions (READ)
const viewByManager = () => {
    console.log(chalk.red("View Employees by Manager is under maintenance"));
    runInquirer();
}
//incomplete
// ----------------------------------------------------------> View Budget Actions (READ)
const viewBudget = () => {
    console.log(chalk.red("View Budget by Department is under maintenance"));
    runInquirer();
};
// asynchronous operation that connects to the database
connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    runInquirer();
});