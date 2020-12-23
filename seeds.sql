DROP DATABASE IF EXISTS employee_trackerDB;

CREATE DATABASE employee_trackerDB;

USE employee_trackerDB;

CREATE TABLE department (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    name VARCHAR(30)
);

CREATE TABLE role (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    title VARCHAR(30),
    salary DECIMAL (10,2),
    department_id INT NOT NULL,
    CONSTRAINT `fk_department_name` FOREIGN KEY (department_id) REFERENCES department(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE TABLE employee (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    first_name VARCHAR(30),
    last_name VARCHAR(30),
    role_id INT NOT NULL,
    manager_id INT,
    CONSTRAINT `fk_employee_role` FOREIGN KEY (role_id) REFERENCES role(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

INSERT INTO department (name)
VALUES ("Senior Management"), ("Business Development"), ("Engineering"), ("Administration");

INSERT INTO role (title, salary, department_id)
VALUES ("CEO", 300000, 1), ("COO", 300000, 1), ("CFO", 300000, 1), ("Directory of Strategy", 200000, 2), ("Senior VP of Quality", 150000, 2), ("Director of Design", 150000, 3), ("Chief Engineer", 180000, 3), ("Senior Engineer", 100000, 3), ("Senior VP of Human Resources", 150000, 4);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Smith", 1, NULL), ("Jane", "Smith", 1, 1), ("Maynard", "Keenan", 4, 2), ("Danny", "Carey", 5, 2), ("Adam", "Jones", 6, 2), ("Justin", "Chancellor", 7, 2), ("Tom", "Morello", 8, 7);

SELECT * FROM department;
SELECT * FROM employee;
SELECT * FROM role;