// requiring dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
const chalk = require('chalk');
const logo = require('asciiart-logo');
const config = require('./package.json');
console.log(logo(config).render());

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
    console.log(chalk.blueBright('---------------------------------------------------------------------------------'))

    console.log(chalk.blueBright('---------------------------------------------------------------------------------'))
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
    console.log(chalk.blueBright('---------------------------------------------------------------------------------'))
    console.log(chalk.redBright('View Employees, Roles, or Departments'))
    console.log(chalk.blueBright('---------------------------------------------------------------------------------'))
    inquirer
        .prompt({
            type: 'rawlist',
            message: 'Which would you like to view?',
            choices: ['employee', 'role', 'department'],
            name: 'selection'
        }
        ).then(({ selection }) => {
            console.log(chalk.blueBright.bold(`Viewing all ${selection}s:`));
            connection.query(
                `SELECT * FROM ${selection}`, (err, data) => {
                    if (err) throw err;
                    console.table(data);
                    runInquirer();
                }

            )
        })

}

// ----------------------------------------------------------> UPDATE Actions
const update = () => {
    console.log(chalk.blueBright('---------------------------------------------------------------------------------'))
    console.log(chalk.redBright('Update Employee'))
    console.log(chalk.blueBright('---------------------------------------------------------------------------------'))
    let roleArray = [];
    connection.query(
        'SELECT * FROM role', (err, data) => {
            roleArray = [...new Set(data.map(e => e.title))]
            console.log(roleArray)
            return roleArray;
        }
    )

    connection.query(
        'SELECT * FROM employee', (err, data) => {
            inquirer
                .prompt([
                    {
                        type: "rawlist",
                        message: "Select an employee to update",
                        choices() {
                            const employeeArray = [];
                            data.forEach((employee) => {
                                employeeArray.push(employee.first_name + " " + employee.last_name);
                            })
                            return employeeArray;
                        },
                        name: "employee",
                    },
                    {
                        type: "rawlist",
                        message: "Select new role for employee",
                        choices: roleArray,
                        name: "role_id"
                    },
                    {
                        type: "rawlist",
                        message: "Select new manager for employee",
                        choices() {
                            const employeeArray = [];
                            data.forEach((employee) => {
                                employeeArray.push(employee.first_name + " " + employee.last_name);
                            })
                            return employeeArray;
                        },
                        name: "manager"
                    }
                ])
                .then(({ employee, role_id, manager }) => {
                    console.log(employee, role_id)
                    console.log(manager.split(" "))
                    let employeeNames = employee.split(' ');
                    let managerName = manager.split(' ');
                    connection.query(`SELECT id FROM role WHERE title=?`,
                        [role_id],
                        (err, res) => {
                            if (err) throw err;
                            console.log('employee first = ' + employeeNames[0] + ' || employee last = ' + employeeNames[1])
                            const roleNumber = res[0].id;
                            connection.query(
                                'SELECT id FROM employee WHERE ? AND ?',
                                [
                                    {
                                        first_name: managerName[0],
                                    },
                                    {
                                        last_name: managerName[1],
                                    },

                                ],
                                (err, res) => {
                                    if (err) throw err;

                                    connection.query(`UPDATE employee SET ? WHERE ? AND ?;`,
                                        [
                                            {
                                                role_id: roleNumber,
                                            },
                                            {
                                                first_name: employeeNames[0],
                                            },
                                            {
                                                last_name: employeeNames[1],
                                            }
                                        ],
                                        (err, res) => {
                                            if (err) throw err;


                                            connection.query('SELECT * FROM employee', (err, res) => {
                                                if (err) throw err;
                                                console.table(res);
                                                runInquirer();
                                            })

                                        }
                                    )
                                })
                        }
                    )
                }
                )

        }
    )
}

// ----------------------------------------------------------> DELETE Actions
const remove = () => {
    console.log(chalk.blueBright('---------------------------------------------------------------------------------'))
    console.log(chalk.redBright('Remove Employee, Role or Department'))
    console.log(chalk.blueBright('---------------------------------------------------------------------------------'))
    inquirer.prompt(
        {
            type: 'rawlist',
            message: 'Which would you like to remove?',
            choices: ['employee', 'role', 'department'],
            name: 'selection'
        }
    ).then(({ selection }) => {
        console.log(chalk.red(`Delete ${selection}:`));
        connection.query(
            `SELECT * FROM ${selection}`, (err, data) => {
                inquirer
                    .prompt([
                        {
                            type: 'rawlist',
                            message: `Select the item you wish to delete.`,
                            choices() {
                                const deptArray = [];
                                data.forEach(({ name }) => {
                                    deptArray.push(name);
                                }

                                );
                                return deptArray;
                            },
                            name: "deletedSelection"
                        }
                    ])
                    .then(({ deletedSelection }) => {
                        connection.query(`DELETE FROM ${selection} WHERE ?`,
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
                    ).catch(err => {
                        throw err;
                    })
            }
        )
    }
    )
}

// ----------------------------------------------------------> CREATE Actions
const add = () => {
    console.log(chalk.blueBright('---------------------------------------------------------------------------------'))
    console.log(chalk.redBright('Add Employee, Role or Department'))
    console.log(chalk.blueBright('---------------------------------------------------------------------------------'))
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
    console.log(chalk.blueBright('---------------------------------------------------------------------------------'))
    console.log(chalk.redBright('Add New Department'))
    console.log(chalk.blueBright('---------------------------------------------------------------------------------'))
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
                    console.log(chalk.greenBright`${res.affectedRows} department inserted!\n`);
                });
        })
        .then(() => {
            connection.query(`SELECT * FROM department`, (err, res) => {
                if (err) throw err;
                console.table(res);
                runInquirer();
            })
        });
};
// ----------------------------------> Add Role
const newRole = () => {
    console.log(chalk.blueBright('---------------------------------------------------------------------------------'))
    console.log(chalk.redBright('Add New Role'))
    console.log(chalk.blueBright('---------------------------------------------------------------------------------'))
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
                    connection.query(`SELECT id FROM department WHERE name=?`,
                        [department_id],
                        (err, res) => {
                            if (err) throw err;
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
                                    console.log(chalk.greenBright`${res.affectedRows} role inserted!\n`);
                                    // return res
                                    connection.query('SELECT * FROM role', (err, res) => {
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
// ----------------------------------> Add Employee
const newEmployee = () => {
    console.log(chalk.blueBright('---------------------------------------------------------------------------------'))
    console.log(chalk.redBright('Add New Employee'))
    console.log(chalk.blueBright('---------------------------------------------------------------------------------'))
    let roleArray = [];
    connection.query(
        'SELECT * FROM role', (err, data) => {
            roleArray = [...new Set(data.map(e => e.title))]
            return roleArray;
        }
    )

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
                        choices() {
                            const managerArray = [];
                            data.forEach((employee) => {
                                managerArray.push(employee.first_name + " " + employee.last_name);
                            })
                            return managerArray;
                        },
                        name: "manager_id"
                    },
                    {
                        type: "rawlist",
                        message: "Select a role for this employee ",
                        choices: roleArray,
                        name: "role_id"
                    },
                ]).then(({ first_name, last_name, role_id, manager_id }) => {
                    let managerNames = manager_id.split(' ')
                    connection.query(`SELECT id FROM role WHERE title=?`,
                        [role_id],
                        (err, res) => {
                            if (err) throw err;
                            const roleNumber = res[0].id;
                            connection.query(`SELECT id FROM employee WHERE (first_name=?) AND (last_name=?);`,
                                [managerNames[0], managerNames[1]],
                                (err, res) => {
                                    if (err) throw err;
                                    const managerNumber = res[0].id;
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
                                            console.log(chalk.greenBright`${res.affectedRows} employee inserted!\n`);
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
    console.log(chalk.red("View Employees by Manager is under maintenance. Sorry for the inconvenience"));
    runInquirer();
}
//incomplete
// ----------------------------------------------------------> View Budget Actions (READ)
const viewBudget = () => {
    console.log(chalk.red("View Budget by Department is under maintenance. Sorry for the inconvenience"));
    runInquirer();
};
// asynchronous operation that connects to the database
connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    runInquirer();
});