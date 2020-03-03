create database medical;
use medical;
CREATE TABLE doctor (username VARCHAR(10) UNIQUE NOT NULL,name VARCHAR(30) NOT NULL, 
email VARCHAR(30) UNIQUE NOT NULL,phone VARCHAR(10) UNIQUE NOT NULL,password VARCHAR(30) NOT NULL,profileimage VARCHAR(100) NOT NULL,PRIMARY KEY (username));
select * from doctor;
drop table doctor;

CREATE TABLE pharmacist (username VARCHAR(10) UNIQUE NOT NULL,name VARCHAR(30) NOT NULL, 
email VARCHAR(30) UNIQUE NOT NULL,phone VARCHAR(10) UNIQUE NOT NULL,password VARCHAR(30) NOT NULL,profileimage VARCHAR(100) NOT NULL,PRIMARY KEY (username));
select * from pharmacist;
drop table pharmacist;

CREATE TABLE receptionist (username VARCHAR(10) UNIQUE NOT NULL,name VARCHAR(30) NOT NULL, 
email VARCHAR(30) UNIQUE NOT NULL,phone VARCHAR(10) UNIQUE NOT NULL,password VARCHAR(30) NOT NULL,profileimage VARCHAR(100) NOT NULL,PRIMARY KEY (username));
select * from receptionist;
drop table receptionist;