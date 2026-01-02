import dotenv from "dotenv"
dotenv.config({
    path : "./.env",
});

let UserName = process.env.username;
let ProjectName = process.env.projectname;

console.log("Username: ",UserName);
console.log("Projectname: ",ProjectName);

console.log("Start of the backend project");