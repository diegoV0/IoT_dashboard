//requires
const express = require('express')

//intances
const app = express();

//listener
app.listen(3001, ()=>{
    console.log("API server listening on port 3001")
})


console.log("hello fucking word")