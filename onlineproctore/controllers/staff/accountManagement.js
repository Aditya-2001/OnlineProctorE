const path = require('path');
const XLSX = require('xlsx');
const {registerationQueue} = require('../../queues/registerUser');
const generator = require('generate-password');
const fs = require('fs');

exports.createAccount = (req, res) => {
  const filePath = path.resolve(__dirname, '../../' + req.file.path);
  const workbook = XLSX.readFile(filePath);
  (async function() {
    const allSheets = workbook.SheetNames;
    for await (let i of allSheets){
      const accounts = XLSX.utils.sheet_to_json(workbook.Sheets[i]);
      for await (let account of accounts){
        var password = generator.generate({length: 10, numbers: true, symbols: true, excludeSimilarCharacters: true, exclude: "\"\'"});
        var username = account.Username;
        var email = account.Email;
        var data = {username: username, password: password, email: email};
        if(account["Account Type"] === "Student"){
          data.student = true;
        }
        if(account["Account Type"] === "Staff"){
          data.staff = true;
        }
        if(account["Account Type"] === "TA"){
          data.ta = true;
        }
        if(account["Account Type"] === "Faculty"){
          data.faculty = true;
        }
        await registerationQueue.add(data);
      }
    }
    fs.unlink(filePath, function(err) {
      if(err && err.code == 'ENOENT') {
        console.info("File doesn't exist, won't remove it.");
      } 
      else if(err){
        console.error("Error occurred while trying to remove file");
      }
      else{
        console.info(`removed`);
      }
    });
  })();
  console.log(filePath);
  res.status(204).send();
}