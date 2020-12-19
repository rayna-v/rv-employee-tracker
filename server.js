// requiring dependencies
const mysql = require('mysql');
const inquirer = require('inquirer');
const chalk = require('chalk');
const RawListPrompt = require('inquirer/lib/prompts/rawlist');
// const remove = require('./CRUD');
// creates connection
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Veule0118!aries123',
    database: 'employee_trackerDB',
});

console.log(chalk.blue('Employee') + chalk.red('Tracker'));

// console.log(chalk.blue.bgRed.bold('Hello world!'));

// ----------------------------------------------------------> Initial Prompts
const runInquirer = () => {
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
const remove = (selection) => {
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
            `SELECT * FROM ${selection}`, (err, data) => {
                inquirer
                    .prompt(
                        {
                            type: "rawlist",
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
                                        type: confirm,
                                        message: "Delete another department, selection or employee?",
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

// ----------------------------------------------------------> Add Actions
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
        'SELECT role.id, role.title, role.department_id, department.id, department.name FROM role INNER JOIN department ON (role.department_id = department.id) ORDER BY department.id', (err, data) => {
            console.log(data);
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
                        message: "Select a department for this employee ",
                        choices() {
                            const deptArray = [];
                            data.forEach((name) => {
                                deptArray.push(name);
                            })
                            return deptArray;
                        },
                        name: "department_id"
                    },
                    {
                        type: "rawlist",
                        message: "Select a role for this employee ",
                        choices() {
                            const deptArray = [];
                            data.forEach((title) => {
                                deptArray.push(title);
                            })
                            return deptArray;
                        },
                        name: "role_id"
                    },
                ]).then(({ first_name, last_name, department_id, role_id }) => {
                    // console.log(department_id)
                    connection.query(`SELECT id FROM department WHERE name=?`,
                        [department_id],
                        (err, res) => {
                            if (err) throw err;
                            console.log(res[0].id)
                            const deptNumber = res[0].id;
                            connection.query(`SELECT id FROM role WHERE title=?`,
                                [role_id],
                                (err, res) => {
                                    if (err) throw err;
                                    console.log(res[0].id)
                                    const roleNumber = res[0].id;

                                    connection.query(
                                        'INSERT INTO employee SET ?',
                                        {
                                            first_name: first_name,
                                            last_name: last_name,
                                            department_id: deptNumber,
                                            role_id: roleNumber,
                                        },
                                        (err, res) => {
                                            if (err) throw err;
                                            console.log(`${res.affectedRows} employee inserted!\n`);
                                            // return res
                                            connection.query('SELECT * FROM employee', (err, res) => {
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
    )
}
// ----------------------------------------------------------> Delete Actions
const deleteNew = () => {
    inquirer
        .prompt(
            {
                type: 'list',
                message: 'Which would you like to delete?',
                choices: [
                    'A Department',
                    'A Role',
                    'An Employee',
                    'Exit'
                ],
                name: 'action'
            },
        ).then(({ action }) => {
            switch (action) {
                case 'A Department':
                    return deleteDepartment();
                case 'A Role':
                    return deleteRole();
                case 'An Employee':
                    return deleteEmployee();
                case 'Exit':
                default:
                    runInquirer();
            }
        })
}

// ----------------------------------> Delete Department
const deleteDepartment = () => {
    console.log(chalk.red("Delete a Department:"));
    connection.query(
        'SELECT * FROM department', (err, data) => {
            inquirer
                .prompt(
                    {
                        type: "rawlist",
                        message: "Enter the item # of the department you wish to delete.",
                        choices() {
                            const deptArray = [];
                            data.forEach(({ name }) => {
                                deptArray.push(name);
                            }

                            );
                            return deptArray;
                        },
                        name: "deletedDepartment",
                    }
                ).then(({ deletedDepartment }) => {
                    connection.query('DELETE FROM department WHERE ?',
                        {
                            name: deletedDepartment
                        },
                        (err, res) => {
                            if (err) throw err;
                            console.log(chalk.greenBright(` You have successfully deleted the ${deletedDepartment} department.`))
                            inquirer.prompt(
                                {
                                    type: confirm,
                                    message: "Delete another department, role or employee?",
                                    name: "deleteAnother"
                                }
                            ).then(({ deleteAnother }) => {
                                switch (deleteAnother) {
                                    case true:
                                        deleteNew();
                                    case false:
                                    default:
                                        runInquirer();
                                }
                            })

                        })
                }
                )
        })
}
// ----------------------------------> Delete Role
const deleteRole = () => {
    console.log(chalk.red("Delete a Role:"));
    connection.query(
        'SELECT * FROM Role', (err, data) => {
            inquirer
                .prompt(
                    {
                        type: "rawlist",
                        message: "Enter the item # of the Role you wish to delete.",
                        choices() {
                            const deptArray = [];
                            data.forEach(({ name }) => {
                                deptArray.push(name);
                            }

                            );
                            return deptArray;
                        },
                        name: "deletedRole",
                    }
                ).then(({ deletedRole }) => {
                    connection.query('DELETE FROM role WHERE ?',
                        {
                            name: deletedRole
                        },
                        (err, res) => {
                            if (err) throw err;
                            console.log(chalk.greenBright(` You have successfully deleted the ${deletedRole} Role.`))
                            inquirer.prompt(
                                {
                                    type: confirm,
                                    message: "Delete another department, role or employee?",
                                    name: "deleteAnother"
                                }
                            ).then(({ deleteAnother }) => {
                                switch (deleteAnother) {
                                    case true:
                                        deleteNew();
                                    case false:
                                    default:
                                        runInquirer();
                                }
                            })

                        })
                }
                )
        })
}

// ----------------------------------> Delete Employee
const deleteEmployee = () => {

}

// ----------------------------------------------------------> View by Manager Actions
const viewByManager = () => {
    // connection.query(
    //     'SELECT artist FROM top5000 GROUP BY artist HAVING COUNT(*) > 1',
    //     (err, res) => {
    //         if (err) throw err;

    //         res.forEach(({ artist }) => {
    //             console.log(`${artist}`);

    //         })
    //         runInquirer()
    //     });
    runInquirer();
}
// ----------------------------------------------------------> View Budget Actions
const viewBudget = () => {
    console.log(chalk.red("Delete a Department:"));
    connection.query(
        'SELECT * FROM department', (err, data) => {
            inquirer
                .prompt(
                    {
                        type: "rawlist",
                        message: "Select the department to view its budget:",
                        choices() {
                            const deptArray = [];
                            data.forEach(({ name }) => {
                                deptArray.push(name);
                            }
                            );
                            return deptArray;
                        },
                        name: "deptBudget",
                    }
                ).then(({ deptBudget }) => {
                    connection.query('',
                        {

                        },
                        (err, res) => {
                            if (err) throw err;
                            inquirer.prompt(
                                {
                                    type: confirm,
                                    message: "View another budget?",
                                    name: "viewAnother"
                                }
                            ).then(({ viewAnother }) => {
                                switch (viewAnother) {
                                    case true:
                                        viewBudget();
                                    case false:
                                    default:
                                        runInquirer();
                                }
                            })

                        })
                }
                )
        })
}
// asynchronous operation that connects to the database
connection.connect((err) => {
    if (err) throw err;
    console.log(`connected as id ${connection.threadId}`);
    runInquirer();
});