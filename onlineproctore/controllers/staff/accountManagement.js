const path = require('path');
const XLSX = require('xlsx');
const {registerationQueue} = require('../../queues/registerUser');
const generator = require('generate-password');
const { removeFile } = require('../../functions');
const User = require('../../models/user');

exports.createAccount = (req, res) => {
  const filePath = path.resolve(__dirname, '../../' + req.file.path);
  const workbook = XLSX.readFile(filePath);
  (async function() {
    const allSheets = workbook.SheetNames;
    for await (let i of allSheets){
      const accounts = XLSX.utils.sheet_to_json(workbook.Sheets[i]);
      for await (let account of accounts){
        var password = generator.generate({length: 10, numbers: true, symbols: true, excludeSimilarCharacters: true, exclude: "\"\'"});
        var username = account.Username.toLowerCase();
        var email = account.Email;
        var data = {username: username, password: password, email: email, name: ''};
        if(account["Account Type"].toLowerCase() === "student"){
          data.student = true;
        }
        else if(account["Account Type"].toLowerCase() === "staff"){
          data.staff = true;
        }
        else if(account["Account Type"].toLowerCase() === "faculty"){
          data.faculty = true;
        }
        await registerationQueue.add(data);
      }
    }
    removeFile(filePath);
  })();
  console.log(filePath);
  res.status(204).send();
}

exports.getAllAccounts = async (req, res) => {
  await User.find({}, async (err, users) => {
    await User.findByToken(req.cookies.auth, (err, user) => {
      return res.status(200).render('staff/DashboardStaff', {users: users, staff: user});
    })
  }).clone().catch(function(err){console.log(err)})
}

exports.deleteUser = async (req, res) => {
  await User.findOne({_id: req.body.id}, (err, user) => {
    user.remove();
    return res.status(204).send();
  }).clone().catch(function(err){console.log(err)})
}