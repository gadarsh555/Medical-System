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

CREATE TABLE patient (username VARCHAR(20) UNIQUE NOT NULL,name VARCHAR(30) NOT NULL, 
email VARCHAR(30) NOT NULL,phone VARCHAR(10) NOT NULL,dob VARCHAR(20) NOT NULL,profileimage VARCHAR(100) NOT NULL,PRIMARY KEY (username));
select * from patient;
drop table patient;

CREATE TABLE appointment (slot VARCHAR(30) NOT NULL,patient VARCHAR(20) ,doctor VARCHAR(20) NOT NULL,date VARCHAR(20) NOT NULL,status VARCHAR(20) NOT NULL);
select * from appointment;
truncate table appointment;
drop table appointment;

CREATE TABLE treatment (doctor VARCHAR(30) NOT NULL,patient VARCHAR(20) NOT NULL ,type VARCHAR(20) NOT NULL
,date VARCHAR(20) NOT NULL, medicine VARCHAR(30),status VARCHAR(30));
select * from treatment; 
truncate table treatment;
SET SQL_SAFE_UPDATES = 0;
drop table treatment;
update treatment set medicine='paracetamol-5,painkiller-3' where medicine='paracetamol';

CREATE TABLE inventory (medicine VARCHAR(30) NOT NULL,quantity integer(10) NOT NULL ,
price integer(10) NOT NULL,PRIMARY KEY (medicine));
select * from inventory; 
insert into inventory values('paracetamol',100,5),('painkiller',200,7);
truncate table inventory;
drop table inventory;

CREATE TABLE bill (reference VARCHAR(30) NOT NULL,doctor integer(10) NOT NULL ,
patient varchar(20) NOT NULL,date varchar(20) NOT NULL,total integer(10) NOT NULL);
select * from bill; 
insert into bill values('paracetamol',100,5),('painkiller',200,7);
truncate table bill;
drop table bill;