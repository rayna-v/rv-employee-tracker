const remove = (selection) => {
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
}

// export default remove();