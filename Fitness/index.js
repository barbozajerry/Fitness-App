// A static server using Node and Express
const express = require("express");
const app = express();
const db = require('./sqlWrap');
const insertDB = "insert into ActivityTable (activity, date, amount) values (?,?,?)"
const allDB = "select * from ActivityTable where activity = ?";
const getOneDB = "select * from ActivityTable where activity = ? and date = ? and amount = ?";

// make all the files in 'public' available on the Web
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/",async (request, response) => {

  response.sendFile(__dirname + "/public/fitnessLog.html");
});

// instead of older body-parser 
app.use(express.json());

// this is where we fetch the data
app.post("/data", async function (request, response) {




  const {type, getDate} = request.body
  // fetches some data depending on type ('Run')
  const result = await db.all(allDB,[type]);

// get the current week , mon-sun
let date = new Date(getDate)
let week = []


  

for(let i = 0; i< 7; i++){
  /// get the date and set the date to previous date
  date.setDate(date.getDate() - 1);
  var day = date.getDate();
  var month = date.getMonth() + 1;
  if(month < 10){
    month = "0" +month
  } 
  var year = date.getFullYear();
  var dateStr = year + "-" + month + "-" + day;
  // console.log(dateStr)
  week.push(dateStr)
}

const arr = []

  for(let i = 0; i< week.length; i++){
    const ele = week[i]
    const date = new Date(ele).getTime()
    arr.push({date, value:0})
  }

const sortedArr = arr.sort(function(a,b){
  // Turn your strings into dates, and then subtract them
  // to get a value that is either negative, positive, or zero.
  return a.date - b.date
});

const sortedWeek = result.sort(function(a,b){
  // Turn your strings into dates, and then subtract them
  // to get a value that is either negative, positive, or zero.
  return a.date - b.date
});


console.log(sortedArr, sortedWeek,'fdsfsdf')

const newData = []

const dateValuesArr = sortedArr.map(ele => ele.date)

for(let i = 0; i< sortedWeek.length; i++){
  const ele = sortedWeek[i]
  const converted = new Date(ele.date).getTime()
  if(dateValuesArr.includes(converted)){
    
    newData.push({...ele, date: converted})
  } 
}

const sortNewData = newData.sort(function(a,b){
  return a.date - b.date
})

console.log(sortNewData)

const daysHave = []

for(let i = 0; i< sortNewData.length; i++){
  const date = newData[i].date 

  if(!daysHave.includes(date)){
    daysHave.push(date)
  }
}
const daysMissing = []
for(let i = 0; i< sortedArr.length; i++){
  const date = sortedArr[i].date
  if(!daysHave.includes(date)){
    daysMissing.push(date)
  }
}
console.log(daysHave,'have')

console.log(daysMissing,'missing')

const objArr = daysMissing.map(date => {
  return {date: date, value: 0}
})

const newnewData = sortNewData.concat(objArr)

console.log(newnewData)

function timeConverter(UNIX_timestamp){
const milliseconds = UNIX_timestamp * 1000 // 1575909015000

const dateObject = new Date(milliseconds)
return dateObject
}
const sortedNewnewdata = newnewData.sort((a,b)=> {
  const convertA = timeConverter(a.date)
  const convertB = timeConverter(b.date)
  console.log(convertA, convertB, 'hi')
  return  convertA - convertB
}
  )

console.log(sortedNewnewdata, 'dsadjaskdjl')


if(newData.length === 0){
  const empty = []

  for(let i = 0; i< week.length; i++){
    const ele = week[i]
    const date = new Date(ele).getTime()
    empty.push({date, value:0})
  }

  const newEmpty = empty.sort(function(a,b){
  // Turn your strings into dates, and then subtract them
  // to get a value that is either negative, positive, or zero.
  return a.date - b.date
});

console.log(empty)

  response.send({
    data:newEmpty
  })
}else {
// actually sends the data to the client
  response.send({
    data:sortedNewnewdata
  })
}
})

// handle pastActivity post requests
app.post('/pastActivity', async function(request, response, next) {
  console.log(
    "Server recieved a post request for /pastActivity with body: ",
    request.body
  );
const insertDB = "insert into ActivityTable (activity, date, amount) values (?,?,?)"
  const {activity,date, scalar} = request.body
  console.log(request.body)
  await db.run(insertDB,[activity,date,scalar]);
  response.send({
    message: "I recieved your POST request at /pastActivity"
  });
});

// handle futureActivity post requests
app.post('/futureActivity', async function(request, response, next) {
  console.log(
    "Server recieved a post request /futureActivity with body: ",
    request.body
  );
  const {activity,date, scalar} = request.body
  console.log(request.body)
  await db.run(insertDB,[activity,date,scalar]);
  response.send({
    message: "I recieved your POST request at /futureActivity"
  });
});
//HARVEEN: changeD /pastActivity and /futureActivity to /store and changed some of the words to 
app.post('/store', function(request, response, next) {
  console.log(
    "Server recieved a post request with body: ",
    request.body);
    adder(request);
  response.send({
    message: "I got your POST request"
  });
});

//HARVEEN: trying to add items to the database
async function adder(req){
  //HARVEEN: changes the time to epoch time 
  var r = req.body.date.split("-");
  var newDate= Math.floor(new Date(r[0], r[1]-1, r[2]).getTime());
  //HARVEEN: checks if it is pastActivity or futureActivity
  if (Object.keys(req.body).length<=2){
      await db.run(insertDB,[req.body.activity,newDate,-1]);
  }else{
    await db.run(insertDB,[req.body.activity,newDate,req.body.scalar]);}
 
  console.log("Successfully inserted an item");
  viewDB();
  console.log(nextVal());

}
//HARVEEN: Prints the DB so we can see it
async function viewDB(){
let cmd =
"select * from ActivityTable";
let result = await db.all(cmd);
    console.log(result);
}

//HARVEEN: gets the most recent past activity from future plans and deletes the rest of the older ones for "/reminder"
app.get("/reminder", async function(request, response,next){
    let cmd =
  "SELECT * FROM ActivityTable WHERE date <= ? and date >= ? and amount = -1 ORDER BY date" ;
  //gets todays date without minutes and seconds
  let year=new Date().getFullYear();
  let month=new Date().getMonth();
  let day=new Date().getDate();
  var newDate= Math.floor(new Date(year, month, day).getTime());
   //console.log(new Date(newDate).toLocaleDateString())
  //gets the end of the week
  var endDate= newDate-604800000;

  let result = await db.all(cmd, [newDate, endDate]); 

//checking if there is one, if not send error code 5 for activity
if (result[0]==undefined){
response.send(JSON.stringify({activity: 5}))
}else{
// we get the earliest past activity and send it
let answer= JSON.stringify(result[0]);
response.send(answer);
  //deletes the rest of them 
 let cmd2 =
  "DELETE FROM ActivityTable WHERE date < ? and amount = -1 " ;
  let l= await db.all(cmd2, [newDate]); 
 }});

 

// listen for requests :)
const listener = app.listen(3000, () => {
  console.log("The static server is listening on port " + listener.address().port);
});
